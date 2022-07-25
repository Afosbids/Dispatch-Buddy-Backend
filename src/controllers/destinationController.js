const { StatusCodes } = require("http-status-codes");
const { Client } = require("@googlemaps/google-maps-services-js");
const Order = require("../models/Order");

const client = new Client({});
const destinationAPI = async (req, res) => {
  try {
    const destination = await Order.findOne({ _id: req.params.id });
    let pickupLocation = {
      address: destination.pickupLocation,
      components: "country:Nigeria",
      key: process.env.GOOGLE_MAP_API_KEY,
    };

    let dropOffLocation = {
      address: destination.dropOffLocation,
      components: "country:Nigeria",
      key: process.env.GOOGLE_MAP_API_KEY,
    };
    const pickup = await client.geocode({ params: pickupLocation });
    const dropOff = await client.geocode({ params: dropOffLocation });

    const pickupPoint = pickup.data.results[0].geometry;
    const dropOffPoint = dropOff.data.results[0].geometry;
    console.log(pickupPoint);

    res.status(StatusCodes.OK).json({
      data: {
        pickupPoint: pickupPoint.location,
        dropOffPoint: dropOffPoint.location,
      },
    });
  } catch (e) {
    console.log(e);
    res.status(StatusCodes.BAD_REQUEST).json(e.message);
  }
};

module.exports = destinationAPI;
