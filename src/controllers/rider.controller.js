const Bid = require('../models/Bid');
const { StatusCodes } = require('http-status-codes');


const rideHistory = (req, res) => {
    console.log(req.params.id)
      try{
        Bid.find({ rider_id:req.params.id }).sort({ createdAt: -1 })
        .then(bids => {
              res.status(StatusCodes.OK)
              .json({bids});
            })
      }
      catch(error){
        res.status(StatusCodes.INTERNAL_SERVER_ERROR)
        .json({message: error.message})
      }
};


const bidStatus = async (req,res,next) => {
       Bid.findOneAndUpdate({ _id: req.params.id }, {bidStatus:req.body.bidStatus})
        .then( bid => {
          if (!bid) {
            return res.status(Status.NOT_FOUND)
              .json(404, {
                message: "Order not found!",
              })
          }

          res
          .status(StatusCodes.ACCEPTED)
            .json({
              bid,
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


const createBid = (req, res) => {
    const newBid = new Bid(req.body);
    newBid.save((err, bid) => {
        if (err) {
            return res.status(StatusCodes.INTERNAL_SERVER_ERROR)
                .json({
                    message: "Some error occured and a new Product could not be created!",
                })
            }

        res.status(StatusCodes.ACCEPTED)
            .json({
                bid,
            })
        });
    };

module.exports = {rideHistory , bidStatus, createBid}