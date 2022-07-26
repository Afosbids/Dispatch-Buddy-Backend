const express = require('express');
const router = express.Router();
const { orderStatus, createOrder, orderHistory, getOrderStatus } = require('../controllers/order.controller');



router.get('/orders', orderHistory)
router.post('/request', createOrder);
router.put('/status/:id', orderStatus);
router.get("/order-status/:id", getOrderStatus);

module.exports = router;
