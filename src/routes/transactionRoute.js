const express = require("express");
const router = express.Router();
const {
  makeTransaction,
  getTransaction,
} = require("../controllers/transaction.controller");

router.post('/payment/:id', makeTransaction);
router.get('/user-payment/:id', getTransaction);

module.exports = router;