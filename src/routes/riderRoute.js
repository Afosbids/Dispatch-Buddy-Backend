const express = require('express');
const router = express.Router();
const { rideHistory, createBid, bidStatus } = require('../controllers/rider.controller');



router.get('/rides/:id', rideHistory)
router.post('/bid', createBid);
router.put('/status/:id', bidStatus);

module.exports = router;