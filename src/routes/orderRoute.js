const express = require('express');
const router = express.Router();
const { orderStatus, createOrder, orderHistory } = require('../controllers/order.controller');



router.get('/orders', orderHistory)
router.post('/request', createOrder);
router.put('/status/:id', orderStatus);

module.exports = router;
