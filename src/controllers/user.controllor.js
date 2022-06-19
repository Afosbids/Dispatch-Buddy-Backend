const fs = require('fs');
const mongoose = require('mongoose');
const Joi = require('joi');
const cloudinary = require('cloudinary').v2;
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
const { validateImageFile } = require('../utils/validateImage');
const BadRequestError = require('../errors/bad-request');
const UnauthenticatedError = require('../errors/unauthenticated');


const salt = process.env.SALT_ROUNDS

const register = async (req, res) => {
    const { name, email, phoneNum, user_type, password, address, city } = req.body;
    const files = req.files;
    let bikeDoc;
    let passport;
    let idCard;
    let bikeDocument;
    let passport_photo;
    let valid_IdCard;


    const emailAlreadyExists = await User.findOne({ email });

    if (emailAlreadyExists) {
        throw new BadRequestError('Email already exists');
    }

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
            throw new BadRequestError(transformJoiMsg(result.error.details[0].message));
        }
    }

    if (user_type === 'rider') {
        // Check if files exist
        await validateImageFile(files, 'No File Uploaded');

        // Extend schema with Rider fields
        const addRiderSchema = userSchema.keys({
            city: Joi.string().required()
        })

        const result = addRiderSchema.validate(req.body);

        if(result.error){
            throw new BadRequestError(transformJoiMsg(result.error.details[0].message));
        }

        bikeDocument = files.bikeDocument;
        passport_photo = files.passport_photo;
        valid_IdCard = files.valid_IdCard;

        // Check if each of the files properties are exist
        await validateImageFile(bikeDocument, 'Please provide bike document');
        await validateImageFile(passport_photo, 'Please provide passport photo');
        await validateImageFile(valid_IdCard, 'Please provide valid ID card');

        // Check mimeType of files
        await validateImageFile(bikeDocument.mimetype.startsWith('application'), 'Invalid, please upload a valid bike document');
        await validateImageFile(passport_photo.mimetype.startsWith('image'), 'Invalid, please upload a valid passport photo');
        await validateImageFile(valid_IdCard.mimetype.startsWith('image'), 'Invalid, please upload a valid ID card');

        const maxSize = 1024 * 1024;

        if (bikeDocument.size > maxSize || passport_photo.size > maxSize || valid_IdCard.size > maxSize) {
            throw new BadRequestError('Please upload image smaller 1MB');
        }

        const cloudy_bikeDocument = await cloudinary.uploader.upload(
            bikeDocument.tempFilePath,
            {
              use_filename: true,
              folder: 'FILE-DOCUMENT',
            }
        );
        const cloudy_passportPhoto = await cloudinary.uploader.upload(
            passport_photo.tempFilePath,
            {
              use_filename: true,
              folder: 'FILE-IMAGE',
            }
        );
        const cloudy_validIdCard = await cloudinary.uploader.upload(
            valid_IdCard.tempFilePath,
            {
              use_filename: true,
              folder: 'FILE-IMAGE',
            }
        );

        
        bikeDoc = cloudy_bikeDocument.secure_url;
        passport = cloudy_passportPhoto.secure_url;
        idCard = cloudy_validIdCard.secure_url;
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
            bikeDocument : bikeDoc,
            valid_IdCard : idCard,
            passport_photo: passport,
        })
    }

    const origin = 'http://localhost:3000';

    await sendVerificationEmail({
        name: user.name,
        email: user.email,
        verificationToken: user.verificationToken,
        origin,
    });

    if (user_type === 'rider') {
        fs.unlinkSync(bikeDocument.tempFilePath);
        fs.unlinkSync(passport_photo.tempFilePath);
        fs.unlinkSync(valid_IdCard.tempFilePath);
    }

    res.status(StatusCodes.CREATED).json({
        msg: 'Success! Please check your email to verify your account.',
    });
}

const verifyEmail = async (req, res) => {
    const { verificationToken, email} = req.body;
    const user = await User.findOne({ email });

    if (!user) {
        throw new UnauthenticatedError('verification Failed');
    }

    if (user.verificationToken !== verificationToken) {
        throw new UnauthenticatedError('verification Failed');
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
        throw new BadRequestError('Please provide email and password');
    }

    const user = await User.findOne({ email });

    if (!user) {
        throw new UnauthenticatedError('Login Failed');
    }

    const isPasswordCorrect = await comparePasswords(password, user.password);

    if (!isPasswordCorrect) {
        throw new UnauthenticatedError('Invalid Credentials');
    }
    if (!user.isVerified) {
        throw new UnauthenticatedError('Please verify your email');
    }


    const tokenUser = createTokenUser(user);

    // create refresh token
    let refreshToken = '';
    // check for existing token
    const existingToken = await Token.findOne({ user: user._id });

    if (existingToken) {
        const { isValid } = existingToken;
        if (!isValid) {
          throw new UnauthenticatedError('Invalid Credentials');
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
        throw new BadRequestError('Please provide valid email');
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