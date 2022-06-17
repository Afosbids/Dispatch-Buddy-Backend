const CustomError = require('../errors');
const mongoose = require('mongoose');
const Joi = require('joi');
const { User } = require('../models/User');
const crypto = require('crypto');
const bcrypt = require('bcryptjs');
const { StatusCodes } = require('http-status-codes');
const sendVerificationEmail = require('../utils/sendVerficationEmail');
const { Shipper } = require('../models/Shipper');
const { transformJoiMsg } = require('../errors/transformJoiMsg');
const { Rider } = require('../models/Rider');
const { comparePasswords } = require('../utils/comparePasswords');
const { createTokenUser } = require('../utils/createTokenUser');
const { Token } = require('../models/Token');
const { attachCookiesToResponse } = require('../utils/jwt');
const { sendResetPasswordEmail } = require('../utils/sendResetPasswordEmail');
const { hashString } = require('../utils/createHash');

const salt = process.env.SALT_ROUNDS

const register = async (req, res) => {
    const { 
        name, 
        email, 
        phoneNum, 
        user_type, 
        password,
        address,
        city,
        bikeDocument,
        valid_IdCard,
        passport_photo, 
    } = req.body;

    const userSchema = Joi.object({
        name: Joi.string().min(3).max(50).required(),
        email: Joi.string().email().required(),
        phoneNum: Joi.string().min(10).required(),
        user_type: Joi.string().valid('shipper', 'rider').required(),
        password: Joi.string().min(6).max(50).required()
    });

    if (user_type === 'shipper') {
        // Extend schema with shipper fields
        const addShipperSchema = userSchema.keys({
            address: Joi.string().required(),
        })

        const result = addShipperSchema.validate(req.body);

        if(result.error){
            throw new CustomError.BadRequestError(transformJoiMsg(result.error.details[0].message));
        }
    }

    if (user_type === 'rider') {
        // Extend schema with Rider fields
        const addRiderSchema = userSchema.keys({
            city: Joi.string().required(),
            bikeDocument: Joi.string().required(),
            valid_IdCard: Joi.string().required(),
            passport_photo: Joi.string().required(),
        })

        const result = addRiderSchema.validate(req.body);

        if(result.error){
            throw new CustomError.BadRequestError(transformJoiMsg(result.error.details[0].message));
        }
    }
    
    
    const emailAlreadyExists = await User.findOne({ email });

    if (emailAlreadyExists) {
        throw new CustomError.BadRequestError('Email already exists');
    }

    const verificationToken = crypto.randomBytes(40).toString('hex');
    const user_id = new mongoose.Types.ObjectId()

    const user = await User.create({
        _id: user_id,
        name,
        email,
        phoneNum,
        user_type,
        password : bcrypt.hashSync(password, parseInt(salt)),
        verificationToken,
    })

    if (user_type === 'shipper') {
        await Shipper.create({
            user_id,
            address,
        })
    }

    if (user_type === 'rider') {
        await Rider.create({
            user_id,
            city,
            bikeDocument,
            valid_IdCard,
            passport_photo,
        })
    }

    const origin = 'http://localhost:3000';

    await sendVerificationEmail({
        name: user.name,
        email: user.email,
        verificationToken: user.verificationToken,
        origin,
    });

    res.status(StatusCodes.CREATED).json({
        msg: 'Success! Please check your email to verify your account.',
    });
}

const verifyEmail = async (req, res) => {
    const { verificationToken, email} = req.body;
    const user = await User.findOne({ email });

    if (!user) {
        throw new CustomError.UnauthenticatedError('verification Failed');
    }

    if (user.verificationToken !== verificationToken) {
        throw new CustomError.UnauthenticatedError('verification Failed');
    }

    user.isVerified = true;
    user.verified = Date.now();
    user.verificationToken = '';

    await user.save();
    res.status(StatusCodes.OK).json({
        msg: 'Email verified successfully',
    })

}

const login = async (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
        throw new CustomError.BadRequestError('Please provide email and password');
    }

    const user = await User.findOne({ email });

    if (!user) {
        throw new CustomError.UnauthenticatedError('Login Failed');
    }

    const isPasswordCorrect = await comparePasswords(password, user.password);

    if (!isPasswordCorrect) {
        throw new CustomError.UnauthenticatedError('Invalid Credentials');
    }
    if (!user.isVerified) {
        throw new CustomError.UnauthenticatedError('Please verify your email');
    }


    const tokenUser = createTokenUser(user);

    // create refresh token
    let refreshToken = '';
    // check for existing token
    const existingToken = await Token.findOne({ user: user._id });

    if (existingToken) {
        const { isValid } = existingToken;
        if (!isValid) {
          throw new CustomError.UnauthenticatedError('Invalid Credentials');
        }
        refreshToken = existingToken.refreshToken;
        attachCookiesToResponse({ res, user: tokenUser, refreshToken });
        res.status(StatusCodes.OK).json({ user: tokenUser });
        return;
    }

    refreshToken = crypto.randomBytes(40).toString('hex');
    const userAgent = req.headers['user-agent'];
    const ip = req.ip;

    const userToken = { refreshToken, ip, userAgent, user: user._id };

    await Token.create(userToken);

    attachCookiesToResponse({ res, user: tokenUser, refreshToken });

    res.status(StatusCodes.OK).json({ user: tokenUser });
}

const forgotPassword = async (req, res) => {
    const { email } = req.body;
    if (!email) {
        throw new CustomError.BadRequestError('Please provide valid email');
    }

    const user = await User.findOne({ email });

    if (user) {
        const passwordToken = crypto.randomBytes(70).toString('hex');
        // send email
        const origin = 'http://localhost:3000';
        await sendResetPasswordEmail({
            name: user.name,
            email: user.email,
            token: passwordToken,
            origin,
        });

        const tenMinutes = 1000 * 60 * 10;
        const passwordTokenExpirationDate = new Date(Date.now() + tenMinutes);

        user.passwordToken = hashString(passwordToken);
        user.passwordTokenExpirationDate = passwordTokenExpirationDate;
        await user.save()
    }

    res
    .status(StatusCodes.OK)
    .json({ msg: 'Please check your email for reset password link' });
}

const resetPassword = async (req, res) => {
    const { token, email, password } = req.body;
    if (!token || !email || !password) {
      throw new CustomError.BadRequestError('Please provide all values');
    }
    const user = await User.findOne({ email });
  
    if (user) {
      const currentDate = new Date();
  
      if (
        user.passwordToken === hashString(token) &&
        user.passwordTokenExpirationDate > currentDate
      ) {
        user.password = password;
        user.passwordToken = null;
        user.passwordTokenExpirationDate = null;
        await user.save();
      }
    }
  
    res.send('reset password');
  };

module.exports = {register, verifyEmail, login, forgotPassword, resetPassword};