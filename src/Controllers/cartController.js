const Cart = require("../models/Cart");
const Product = require("../models/product");

const addToCart = async (req, res) => {
  try {
    
    const userId = req.user._id;

    const { productId, quantity } = req.body;

    if (!productId || !quantity) {
      return res
        .status(400)
        .json({ message: "Product ID and quantity are required" });
    }

    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    let cart = await Cart.findOne({ userId });
    if (!cart) {
      cart = new Cart({ userId, items: [] });
    }

    const existingItemIndex = cart.items.findIndex(
      (item) => item.productId.toString() === productId
    );

    if (existingItemIndex !== -1) {
      cart.items[existingItemIndex].quantity += quantity;
    } else {
      cart.items.push({ productId, quantity });
    }

    await cart.save();
    const populatedCart = await Cart.findOne({ userId }).populate({
      path: "items.productId",
      select: "title images price", // fields to fetch from product
    });

    res
      .status(200)
      .json({ message: "Product added to cart", cart: populatedCart });
  } catch (error) {
    console.error("Error in addToCart:", error);
    res.status(500).json({ message: "Server error" });
  }
};

const updateCartItem = async (req, res) => {
  try {
    const userId = req.user._id;
    const { productId, quantity } = req.body;

    if (!productId || quantity === undefined) {
      return res
        .status(400)
        .json({ message: "ProductId and quantity are required" });
    }

    // Check if the cart exists for this user
    let cart = await Cart.findOne({ userId });
    if (!cart) {
      return res.status(404).json({ message: "Cart not found" });
    }

    // Find the cart item by productId
    const item = cart.items.find(
      (item) => item.productId.toString() === productId
    );

    if (!item) {
      return res.status(404).json({ message: "Product not found in cart" });
    }

    item.quantity = quantity;

    await cart.save();

    res.status(200).json({ message: "Cart updated successfully", cart });
  } catch (err) {
    console.error("Error updating cart:", err.message);
    res.status(500).json({ message: "Server error" });
  }
};

const deleteFromCart = async (req, res) => {
  try {
    const userId = req.user._id;
  //sometimes due to extra space the comparison can go wrong
    const productId = req.params.productId.trim();
  
    const cart = await Cart.findOne({ userId }).populate("items.productId");

    if (!cart) {
      return res.status(404).json({ message: "Cart not found" });
    }
 
    const initialLength = cart.items.length;
    
    cart.items = cart.items.filter(
      (item) => item.productId._id.toString() !== productId
    );

    if (cart.items.length === initialLength) {
      return res.status(404).json({ message: "Product not found in cart" });
    }

    if (cart.items.length === 0) {
      // No items left, delete the whole cart document
      await Cart.deleteOne({ userId });
      return res
        .status(200)
        .json({ message: "Product removed and cart deleted as empty" });
    } else {
      // Save updated cart with remaining items
      await cart.save();
      return res
        .status(200)
        .json({ message: "Product removed from cart", cart });
    }
  } catch (error) {
    console.error("Error deleting item:", error.message);
    res.status(500).json({ message: "Server error" });
  }
};

const getCart = async (req, res) => {
  try {
    const userId = req.user._id; // From userAuth middleware

    const cart = await Cart.findOne({ userId }).populate({
      path: "items.productId",
      select: "title price images", // Only fetch required fields
    });

    if (!cart) {
      return res.status(404).json({ message: "Cart not found" });
    }

    res.status(200).json({ cart });
  } catch (error) {
    console.error("Error in getCart:", error);
    res.status(500).json({ message: "Server error" });
  }
};

module.exports = { addToCart, getCart, updateCartItem, deleteFromCart };
