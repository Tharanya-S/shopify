// src/importProducts.js
const mongoose = require("mongoose");
const axios = require("axios"); // Make sure axios is installed
const Product = require("./models/product");

require("dotenv").config();

const MONGO_URI = process.env.MONGO_URI;

const fetchAndStoreProducts = async () => {
  try {
    const response = await axios.get("https://dummyjson.com/products?limit=30");
    const products = response.data.products;
    //When you rerun the db even after making changes in hte db the change will remain only add new products
    for (const newProduct of products) {
      await Product.updateOne(
        { id: newProduct.id }, 
        { $set: newProduct },
        { upsert: true }
      );
    }
    // If you want to resent the data  
    // // Optional: clear existing products
    // await Product.deleteMany({});

    // // Insert products into MongoDB
    // await Product.insertMany(products);
    // console.log(`${products.length} products imported successfully!`);

    console.log("Products imported/updated successfully");
  } catch (err) {
    console.error("Error fetching or saving products:", err);
  }
};

mongoose
  .connect(MONGO_URI)
  .then(async () => {
    console.log("DB connected");
    await fetchAndStoreProducts();
    mongoose.disconnect();
  })
  .catch((err) => {
    console.error("DB connection error:", err);
  });
