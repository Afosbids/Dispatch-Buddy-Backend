const Bid = require("../models/Bid");
const { StatusCodes } = require("http-status-codes");
const { User } = require("../models/User.js");
const Order = require("../models/Order.js");
const { Rider } = require("../models/Rider.js");

const rideHistory = (req, res) => {
  try {
    Bid.find({ rider_id: req.params.id })
      .sort({ createdAt: -1 })
      .then((bids) => {
        res.status(StatusCodes.OK).json({ bids });
      });
  } catch (error) {
    res
      .status(StatusCodes.INTERNAL_SERVER_ERROR)
      .json({ message: error.message });
  }
};

const bidStatus = async (req, res, next) => {
  Bid.findOneAndUpdate(
    { _id: req.params.id },
    { bidStatus: req.body.bidStatus }
  )
    .then((bid) => {
      if (!bid) {
        return res.status(Status.NOT_FOUND).json(404, {
          message: "Order not found!",
        });
      }
      res.status(StatusCodes.ACCEPTED).json({
        bid,
      });
    })
    .catch((err) => {
      res.status(StatusCodes.NOT_FOUND).json({
        message: "Order not found!",
        err,
      });
    });
};

const createBid = (req, res) => {
  const newBid = new Bid(req.body);
  newBid.save((err, bid) => {
    if (err) {
      return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
        message: "Some error occured and a new Product could not be created!",
      });
    }

    res.status(StatusCodes.ACCEPTED).json({
      bid,
    });
  });
};

const getRider = async (req, res) => {
  try {
    if (req.params.id.length !== 24)
      res.status(400).send("Please send a valid id");

    const rider = await User.findById(req.params.id);
    return res.status(200).json({ rider });
  } catch (error) {
    if (error) return console.log(error);
  }
};

const viewAllRequests = async (req, res) => {
  try {
    const orders = await Order.find({});
    res.status(200).json({ orders: orders });
  } catch (error) {
    if (error) res.status(404).json("No orders were found");
  }
};

const viewRequest = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);
    return res.status(200).json({ order });
  } catch (error) {
    if (error)
      return res.status(404).json({ msg: "Order not found in database" });
  }
};

const AcceptRequest = async (req, res) => {
  try {
    const order = await Order.findById(req.body.id);
    if (!order) return res.status(404).send("Order not found");
    console.log(req.body.id);
    order.orderStatus = "Accepted";
    order.startTrip = new Date();

    order.save();

    res.status(200).json({ order });
  } catch (error) {
    if (error) return res.status(400).json("Something went wrong");
  }
};

const declineRequest = async (req, res) => {
  try {
    const order = await Order.findById(req.body.id);

    if (!order) return res.status(404).send("Request not found");

    order.orderStatus = "Pending";
    order.startTrip = "";
    await Rider.findOneAndUpdate(
      { user_id: req.body.riderId },
      {
        $pull: {
          orderHistory: order._id,
        },
      }
    );
    order.save();

    res.status(200).json({ order });
  } catch (error) {
    if (error) res.status(400).json("Something went wrong");
  }
};

const endRide = async (req, res) => {
  try {
    const orderObj = await Order.findById(req.body.orderId);

    const startTrip = new Date(orderObj.startTrip).getTime();
    const endTrip = new Date().getTime();
    const timeDiff = endTrip - startTrip;

    const duration = parseMillisecondsIntoReadableTime(timeDiff);

    orderObj.duration = +duration;
    orderObj.endTrip = new Date();
    orderObj.orderStatus = "Delivered";
    orderObj.save();

    await Rider.findOneAndUpdate(
      { user_id: req.body.riderId },
      {
        $addToSet: {
          orderHistory: orderObj,
        },
      }
    );
    res.send("Trip ended");
  } catch (error) {
    if (error) res.json("An error occured");
  }
};

const riderEarnings = async (req, res) => {
  try {
    const riderObject = await Rider.find({ user_id: req.body.riderId });

    const orderArr = riderObject[0].orderHistory;
    const earningsObj = {
      totalEarnings: 0,
      totalRides: 0,
      totalTime: 0,
      orderHistory: orderArr,
    };

    let minutes = 0;

    orderArr.forEach((order) => {
      earningsObj["totalEarnings"] += Number(order.amount);
      minutes += +order.duration;
    });
    earningsObj.totalRides = orderArr.length;
    earningsObj.totalTime = minutes;

    res.status(200).json({ earnings: earningsObj });
  } catch (error) {
    if (error) res.json("An error occured");
  }
};

module.exports = {
  rideHistory,
  bidStatus,
  createBid,
  getRider,
  viewRequest,
  viewAllRequests,
  AcceptRequest,
  declineRequest,
  riderEarnings,
  endRide,
};

function parseMillisecondsIntoReadableTime(milliseconds) {
  //Get hours from milliseconds
  let hours = milliseconds / (1000 * 60 * 60);
  let absoluteHours = Math.floor(hours);
  let h = absoluteHours > 9 ? absoluteHours : "0" + absoluteHours;

  //Get remainder from hours and convert to minutes
  let minutes = (hours - absoluteHours) * 60;
  let absoluteMinutes = Math.floor(minutes);
  let m = absoluteMinutes > 9 ? absoluteMinutes : "0" + absoluteMinutes;

  //Get remainder from minutes and convert to seconds
  let seconds = (minutes - absoluteMinutes) * 60;
  let absoluteSeconds = Math.floor(seconds);
  let s = absoluteSeconds > 9 ? absoluteSeconds : "0" + absoluteSeconds;

  const result = { hours: +h * 60, minutes: m };
  const time = result.hours + result.minutes;
  return time;
}
