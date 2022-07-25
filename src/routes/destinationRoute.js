const express = require('express');
const router = express.Router();
const destinationAPI = require('../controllers/destinationController');



router.get('/:id', destinationAPI)
module.exports = router;