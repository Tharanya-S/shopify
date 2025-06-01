const express = require("express");
const { connectDB } = require("./config/database");
const cookieParser = require("cookie-parser");
const authRouter = require("./routes/authRouter");
const cartRouter = require("./routes/cartRouter");
const orderRouter = require("./routes/orderRouter");
require("dotenv").config();

const app = express();
app.use(
  express.json({
    strict: true, // strict JSON parsing (default is true)
    type: (req) => {
      // Apply JSON parsing only to specific methods
      const jsonMethods = ["POST", "PUT", "PATCH"];
      return jsonMethods.includes(req.method);
    },
  })
);
app.use(cookieParser());

app.use("/api/auth", authRouter); //=>from here it goes to fetch email and verify email and create a cookie
app.use("/", cartRouter);
app.use("/order", orderRouter);

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
