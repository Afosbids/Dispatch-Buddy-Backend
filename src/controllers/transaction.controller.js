const Transaction = require("../models/Transaction");
const { StatusCodes } = require("http-status-codes");
const Bid = require("../models/Bid");

// Making a payment transaction
const makeTransaction = async(req, res) => {
  try {
    const {id} = req.params;
    const bid = await Bid.find({_id: id});

    if(bid) {
      const { Cash } = req.body;

      const savePay = new Transaction({
        payment_method: Cash,
        Bid_id: id
      });

      savePay.save((error) => {
        if (error) {
          console.log(error)
          res.status(402).send("Payment failed");
        } else {
          res.json({
            msg: "Payment confirmed.",
          });
        }
      });
    }
    
  } catch (error) {
    return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      message: "Sorry, Internal server error",
    });
  }
};

// Get List of all payments get 
const getTransaction = async (req, res) => {
  try {
    const {id} = req.params;
    const listPayment = await Transaction.find({_id: id});
    
    res.status(StatusCodes.OK).json(listPayment[0].Payment_method);
  } catch (error) {
    return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      message: "Sorry, Internal server error",
    });
  }
};

module.exports = { makeTransaction, getTransaction };
