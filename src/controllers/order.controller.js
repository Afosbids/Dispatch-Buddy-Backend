const Order = require('../models/Order');
const { StatusCodes } = require('http-status-codes');


const orderHistory = (req, res) => {
      try{
        Order.find({ _id: req.params.id }).sort({ createdAt: -1 })
        .then(orders => {
              res.status(StatusCodes.OK)
              .json({orders});
            })
      }
      catch(error){
        res.status(StatusCodes.INTERNAL_SERVER_ERROR)
        .json({message: error.message})
      }
};


const orderStatus = async (req,res,next) => {

       Order.findOneAndUpdate({ _id: req.params.id }, {orderStatus:req.body.orderStatus})
        .then((order) => {
          if (!order) {
            return res.status(Status.NOT_FOUND).send(
              jsend(404, {
                message: "Order not found!",
              })
            );
          }
    
          res
          .status(StatusCodes.OK)
            .json({
              order,
            })
        })
        .catch((err) => {
          res.status(StatusCodes.NOT_FOUND)
            .json({
              message: "Order not found!",
              err,
            })
        });
    }


const createOrder = (req, res) => {
  const newOrder = new Order(req.body);
    newOrder.save((err, order) => {
        if (err) {
            return res.status(StatusCodes.INTERNAL_SERVER_ERROR)
                .json({
                    message: "Some error occured and a new Product could not be created!",
                })
        }
        res.status(StatusCodes.ACCEPTED)
            .json({
                order,
                id:order.id
            })
    });
};

module.exports = {orderHistory ,orderStatus, createOrder}