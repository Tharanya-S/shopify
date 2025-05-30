const express = require("express");
const { connectDB } = require("./config/database");

const app = express();

connectDB()
  .then(() => {
    console.log("DB connected");
    app.listen(7777, () => {
      console.log("Server running successfully on Port : 7777");
    });
  })
  .catch(() => {
    console.log("DB not connected");
  });
