const createError = require('http-errors');
const express = require('express');
const cookieParser = require('cookie-parser');
const logger = require('morgan');
const fileupload = require('express-fileupload');
const cors = require('cors');
const helmet = require('helmet');
const xss = require('xss-clean');
const mongoSanitize = require('express-mongo-sanitize');

const usersRouter = require ( './routes/users');
const connectDB = require('./db_config/db');
const userAuthRouter = require('./routes/auth/user');

const app = express();

app.use(helmet());
app.use(cors());
app.use(xss());
app.use(mongoSanitize());
app.use(fileupload());

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser(process.env.JWT_SECRET));

// Routes
app.use('/auth', userAuthRouter );

// middleware
const notFoundMiddleware = require('./middleware/notFound');
const errorHandlerMiddleware = require('./middleware/error-handler');

const database_userName = process.env.DATABASE_USERNAME;
const database_password = process.env.DATABASE_PASSWORD;

// Connect to MongoDB
const dbUrl = `mongodb+srv://${database_userName}:${database_password}@cluster0.ir60w.mongodb.net/?retryWrites=true&w=majority`
connectDB(dbUrl)

app.use(notFoundMiddleware);
app.use(errorHandlerMiddleware);


module.exports = app;
