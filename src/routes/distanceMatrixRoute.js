const express = require('express');
const router = express.Router();
const distanceMatrixAPI = require('../controllers/distanceMatrixController');



router.post('/diff', distanceMatrixAPI)
module.exports = router;


