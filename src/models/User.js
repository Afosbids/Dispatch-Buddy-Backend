const mongoose = require('mongoose');
const validator = require('validator');


const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Please provide name'],
        minlength: 3,
        maxlength: 50,
    },
    email: {
        type: String,
        unique: true,
        required: [true, 'Please provide email'],
        validate: {
            validator: validator.isEmail,
            message: 'Please provide a valid email'
        }
    },
    phoneNum : {
        type: String,
        required: [true, 'Please provide phone number'],
        minlength: 10
    },
    password: {
        type: String,
        required: [true, 'Please provide password'],
        minlength: 6,
    },
    user_type: {
        type: String,
        enum: ['shipper', 'rider'],
        required: [true, 'Please provide user type']
    },
    verificationToken: String,
    isVerified: {
        type: Boolean,
        default: false
    },
    verified: Date,
    passwordToken: {
        type: String,
    },
    passwordTokenExpirationDate: {
        type: Date,
    }
}, { timestamps: true })



const User = mongoose.model("User", userSchema);
module.exports = { User };
