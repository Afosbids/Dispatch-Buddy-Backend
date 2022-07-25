const Order = require("../models/Order");
const { StatusCodes } = require("http-status-codes");

const orderHistory = (req, res, next) => {
  try {
    if (!req.user) return res.status(StatusCodes.FORBIDDEN)
    Order.find({ user_id: req.user.id })
      .sort({ createdAt: -1 })
      .then((orders) => {
        console.log(orders);
        res.status(StatusCodes.OK).json({shipper:req.user.name,orders, count: orders.length });
      });
  } catch (error) {
    res
      .status(StatusCodes.INTERNAL_SERVER_ERROR)
      .json({ message: error.message });
  }
};

const orderStatus = async (req, res, next) => {
  Order.findOneAndUpdate(
    { _id: req.params.id },
    { orderStatus: req.body.orderStatus }
  )
    .then((order) => {
      if (!order) {
        return res.status(Status.NOT_FOUND).send(
          jsend(404, {
            message: "Order not found!",
          })
        );
      }

      res.status(StatusCodes.OK).json({
        order,
      });
    })
    .catch((err) => {
      res.status(StatusCodes.NOT_FOUND).json({
        message: "Order not found!",
        err,
      });
    });
};

const createOrder = (req, res) => {
  const newOrder = new Order(req.body);
  newOrder.save((err, order) => {
    if (err) {
      return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
        message: "Some error occured and a new Product could not be created!",
      });
    }
    res.status(StatusCodes.ACCEPTED).json({
      order,
      id: order.id,
    });
  });
};

// getOrderStatus
const getOrderStatus = async(req, res) => {
  try {
    const { id } = req.params;
    const getStatus = await Order.find({_id: id}
    );
    res.status(200).json(getStatus[0].orderStatus)
  } catch (error) {
    res
      .status(StatusCodes.INTERNAL_SERVER_ERROR)
      .json({ message: error.message });
  }
}

module.exports = {orderHistory ,orderStatus, createOrder, getOrderStatus}
