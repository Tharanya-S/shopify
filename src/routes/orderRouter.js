const express = require("express");
const { checkoutOrder } = require("../Controllers/orderController");
const router = express.Router();

router.post("/checkout", checkoutOrder);

module.exports = router;
