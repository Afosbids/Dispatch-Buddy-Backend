const mongoose = require("mongoose");

const paymentSchema = new mongoose.Schema(
  {
    Bid_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Bid',
    },
    Payment_method: {
      type: String,
      required: true,
      enum: ["Card", "Cash"],
      default: 'Cash',
    },
  },
  { timestamps: true }
);

const Transaction = mongoose.model("Transaction", paymentSchema);

module.exports = Transaction;
