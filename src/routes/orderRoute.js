const express = require('express');
const router = express.Router();
const { orderStatus, createOrder } = require('../controllers/order.controller');



router.get('/orders/:id')
router.post('/request', createOrder);
router.put('/status/:id', orderStatus);

module.exports = router;
