const express = require("express");
const router = express.Router();
 
const { userAuth } = require("../middlewares/authMiddleware");
const {
  addToCart,
  getCart,
  updateCartItem,
  deleteFromCart,
} = require("../Controllers/cartController");

router.post("/cart/add", userAuth, addToCart);
router.patch("/cart/update", userAuth, updateCartItem);
router.delete("/cart/:productId", userAuth, deleteFromCart);
router.get("/cart", userAuth, getCart);

module.exports = router;
