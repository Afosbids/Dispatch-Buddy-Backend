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

const app = express();

app.use(helmet());
app.use(cors());
app.use(xss());
app.use(mongoSanitize());
app.use(fileupload());

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
// app.use(express.static(path.join(__dirname,'..', 'public')));

// Routes
app.use('/auth', usersRouter);


const database_userName = process.env.DATABASE_USERNAME;
const database_password = process.env.DATABASE_PASSWORD;

// Connect to MongoDB
const dbUrl = `mongodb+srv://${database_userName}:${database_password}@cluster0.ir60w.mongodb.net/?retryWrites=true&w=majority`
connectDB(dbUrl)


// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});




// error handler
app.use(function( err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;
