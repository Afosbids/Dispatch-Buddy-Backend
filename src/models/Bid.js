const mongoose = require('mongoose');

const BidSchema = new mongoose.Schema({
    order_id: {
        type: mongoose.Schema.Types.ObjectId,
        required: [true, 'Please provide user id'],
        ref: 'Order',
    },  
    rider_id: {
        type: mongoose.Schema.Types.ObjectId,
        required: [true, 'Please provide user id'],
        ref: 'Order',
    },
    amount: {
        type: Number,
        required: [true, 'Please enter amount'],
    },
    bidStatus: {
        type: String,
        enum: ['accpted', 'rejected', 'pending'],
        default: 'pending'
    },
}, { timestamps: true });

const Bid = mongoose.model('Bid', BidSchema);
module.exports = { Bid };