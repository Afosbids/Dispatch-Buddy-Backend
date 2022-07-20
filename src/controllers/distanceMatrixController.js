const { StatusCodes } = require("http-status-codes");
const { Client } = require("@googlemaps/google-maps-services-js");

const client = new Client({});
const distanceMatrixAPI = async (req, res) => {
  try {
    const { pickupLocation, dropOffLocation } = req.body;

    const request = {
      origins: [pickupLocation],
      destinations: [dropOffLocation],
      avoidHighways: false,
      avoidTolls: false,
    };

    const distance = await client.distancematrix({
      params: {
        key: process.env.GOOGLE_MAP_API_KEY,
        ...request,
      },
    });
    const dist = distance.data.rows[0].elements[0].distance.text
    const duration = distance.data.rows[0].elements[0].duration.text
    res.status(StatusCodes.OK).json({
      pickupLocation,
      dropOffLocation,
      distance:dist, 
      estimatedTime:duration,
    });
  } catch (e) {
    res.status(StatusCodes.BAD_REQUEST).json(e.message);
  }
};

module.exports = distanceMatrixAPI;
