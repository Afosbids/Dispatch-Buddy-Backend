const Bid = require('../models/Bid');
const { StatusCodes } = require('http-status-codes');
const {Client} = require("@googlemaps/google-maps-services-js");


const rideHistory = (req, res) => {
      try{

        const client = new Client({});

        client
          .elevation({
            params: {
              locations: [{ lat: 45, lng: -110 }],
              key: "asdf",
            },
            // timeout: 1000, // milliseconds
            })
            .then((r) => {
                console.log(r.data.results[0].elevation);
            })
            .catch((e) => {
                console.log(e.response.data.error_message);
            });


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


const bidStatus = async (req,res) => {
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