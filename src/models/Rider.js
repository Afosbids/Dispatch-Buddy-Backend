const mongoose = require("mongoose");

const riderSchema = new mongoose.Schema(
  {
    user_id: {
      type: mongoose.Schema.Types.ObjectId,
      required: [true, "Please provide user id"],
      ref: "User",
    },
    city: {
      type: String,
      required: [true, "Please provide city"],
    },
    bikeDocument: {
      type: String,
      required: [true, "Please provide bike document"],
    },
    valid_IdCard: {
      type: String,
      required: [true, "Please provide valid ID card"],
    },
    passport_photo: {
      type: String,
      required: [true, "Please provide passport photo"],
    },
    orderHistory: [Object],
  },
  { timestamps: true }
);

const Rider = mongoose.model("Rider", riderSchema);
module.exports = { Rider };
