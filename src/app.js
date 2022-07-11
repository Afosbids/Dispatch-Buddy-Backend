const express = require('express');
const cookieParser = require('cookie-parser');
const logger = require('morgan');
const fileUpload = require('express-fileupload');
const cors = require('cors');
const helmet = require('helmet');
const xss = require('xss-clean');
const mongoSanitize = require('express-mongo-sanitize');
const cloudinary = require('cloudinary').v2;

const connectDB = require('./db_config/db');

const userAuthRouter = require('./routes/auth/user');
const orderRoute  = require('./routes/orderRoute');
const riderRoute  = require('./routes/riderRoute');
const transactionRoute = require('./routes/transactionRoute');

const swaggerUI = require('swagger-ui-express');
const YAML = require('yamljs');
const swaggerDocument = YAML.load('./swagger.yaml');


const app = express();


app.use(helmet());
app.use(cors());
app.use(xss());
app.use(mongoSanitize());

app.use(logger('dev'));
app.use(express.json());
app.use(fileUpload({ useTempFiles: true }));
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser(process.env.JWT_SECRET));
app.use(express.static('./public'));


// Routes
app.use('/api-docs', swaggerUI.serve, swaggerUI.setup(swaggerDocument));
app.use('/api/v1/auth', userAuthRouter );
app.use('/api/v1/order', [ orderRoute ] );
app.use('/api/v1/rider', riderRoute );
app.use('/', transactionRoute);

// middleware
const notFoundMiddleware = require('./middleware/notFound');
const errorHandlerMiddleware = require('./middleware/error-handler');

const database_userName = process.env.DATABASE_USERNAME;
const database_password = process.env.DATABASE_PASSWORD;

cloudinary.config({
    cloud_name: process.env.CLOUD_NAME,
    api_key: process.env.CLOUD_API_KEY,
    api_secret: process.env.CLOUD_API_SECRET,
});

// Connect to MongoDB
const dbUrl = `mongodb+srv://${database_userName}:${database_password}@cluster0.ir60w.mongodb.net/?retryWrites=true&w=majority`
connectDB(dbUrl)

app.use(notFoundMiddleware);
app.use(errorHandlerMiddleware);


module.exports = app;
