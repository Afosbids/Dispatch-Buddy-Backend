const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({ 
    user_id: {
        type: mongoose.Schema.Types.ObjectId,
        required: [true, 'Please provide user id'],
        ref: 'User',
    },
    pickupLocation: {
        type: String,
        required: [true, 'Please enter pick up location'],
    },
    amount: {
        type: Number,
        required: [true, 'Please enter amount'],
    },
    dropOffLocation: {
        type: String,
        required: [true, 'Please enter drop off location'],
    },
    dropOffPhoneNumber: {
        type: String,
        required: [true, 'Please enter drop off phone number'],
    },
    orderStatus: {
        type: String,
        enum: ['Pending', 'Accepted','Delivered'],
        default: 'Pending'
    },
}, { timestamps: true });

const Order = mongoose.model('Order', orderSchema);
module.exports = Order;