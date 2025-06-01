const Cart = require("../models/Cart");
const Order = require("../models/Order");
const mongoose = require("mongoose");
const validator = require("validator");

async function checkoutOrder(req, res) {
  try {
    const {
      userId,
      fullName,
      email,
      phoneNumber,
      address,
      city,
      state,
      zipCode,
      cardNumber,
      expiryDate,
      cvv,
    } = req.body;
    const userCart = await Cart.findOne({ userId });
    // Check if cart exists and has items
    if (!userCart || userCart.items.length === 0) {
      return res
        .status(400)
        .json({ message: "Cart is empty, cannot proceed with checkout" });
    }
    if (!userId || !mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({ message: "Invalid or missing userId" });
    }

    if (
      !fullName ||
      !email ||
      !phoneNumber ||
      !address ||
      !city ||
      !state ||
      !zipCode ||
      !cardNumber ||
      !expiryDate ||
      !cvv
    ) {
      return res
        .status(400)
        .json({ message: "Missing required user or payment info" });
    }

    // Validate email format
    if (!validator.isEmail(email)) {
      return res.status(400).json({ message: "Invalid email format" });
    }

    // Validate phone number (example: must be numeric and 10 digits)
    if (!validator.isMobilePhone(phoneNumber, "any")) {
      return res.status(400).json({ message: "Invalid phone number" });
    }

    // Validate cardNumber (basic: must be numeric and 13 to 19 digits)
    if (!validator.isCreditCard(cardNumber)) {
      return res.status(400).json({ message: "Invalid card number" });
    }

    // Validate expiryDate (format MM/YY or MM/YYYY)
    const expiryRegex = /^(0[1-9]|1[0-2])\/?([0-9]{2}|[0-9]{4})$/;
    if (!expiryRegex.test(expiryDate)) {
      return res.status(400).json({ message: "Invalid expiry date format" });
    }

    // Validate cvv (3 or 4 digits)
    if (
      !validator.isLength(cvv, { min: 3, max: 4 }) ||
      !validator.isNumeric(cvv)
    ) {
      return res.status(400).json({ message: "Invalid CVV" });
    }

    // Fetch the user's cart
    const cart = await Cart.findOne({ userId }).populate("items.productId");

    if (!cart) {
      return res.status(404).json({ message: "Cart not found for user" });
    }

    // Calculate totalPrice if not already set
    let totalPrice = 0;
    for (const item of cart.items) {
      if (item.productId && item.productId.price) {
        totalPrice += item.productId.price * item.quantity;
      }
    }

    // Update cart totalPrice (optional, keep in sync)
    cart.totalPrice = totalPrice;
    await cart.save();

    // Generate a simple order number - you can improve this logic
    const orderNumber = `ORD-${Date.now()}`;

    // Create a new order
    const order = new Order({
      userId,
      orderNumber,
      items: cart.items.map((item) => ({
        productId: item.productId._id,
        quantity: item.quantity,
        productName:
          item.productName || (item.productId && item.productId.name) || "",
      })),
      totalPrice,
      fullName,
      email,
      phoneNumber,
      address,
      city,
      state,
      zipCode,
      cardNumber,
      expiryDate,
      cvv,
    });

    await order.save();

    // Clear the cart after order is placed (optional)
    cart.items = [];
    cart.totalPrice = 0;
    await cart.save();

    res.status(201).json({ message: "Order placed successfully", order });
  } catch (error) {
    console.error("Checkout error:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
}

module.exports = {
  checkoutOrder,
};
