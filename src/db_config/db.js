const mongoose = require('mongoose');

const connectDB = async (url) => {
    try {
        const toConnect = await mongoose.connect(url);
        console.log(`🔌 Database connected to ${toConnect.connection.host}`);
    } catch (error) {
        console.log(`could not connect to mongodb ---- ${error}`);
    }
};

module.exports = connectDB;