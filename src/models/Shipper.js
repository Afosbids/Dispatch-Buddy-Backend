const mongoose = require('mongoose');

const shipperSchema = new mongoose.Schema({
    user_id: {
        type: mongoose.Schema.Types.ObjectId,
        required: [true, 'Please provide user id'],
        ref: 'User',
    },
    lng: {
        type: Number,
    },
    lat: {
        type: Number,
    },
    address: {
        type: String,
        required: [true, 'Please provide address'],
    }
}, { timestamps: true });

const Shipper = mongoose.model('Shipper', shipperSchema);
module.exports = { Shipper };