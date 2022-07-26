const express = require('express');
const { register, verifyEmail, login, forgotPassword, resetPassword } = require('../../controllers/user.controllor');
const userAuthRouter = express.Router();

userAuthRouter.post('/user/create', register )
userAuthRouter.post('/user/verify-email', verifyEmail);
userAuthRouter.post('/user/login', login);
userAuthRouter.post('/user/forgot-password', forgotPassword);
userAuthRouter.post('/user/reset-password', resetPassword);


module.exports = userAuthRouter;
