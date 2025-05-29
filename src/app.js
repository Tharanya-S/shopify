const express = require("express");

const app = express();

app.use("/test", (req, res) => {
  res.send("Here is the Testing page");
});

app.use("/hello", (req, res) => {
  res.send("Hello World !!!");
});

app.use("/", (req, res) => {
  res.send("Server Running Successfully");
}); //this should always come at time as '/' is the prefix for all route

app.listen(7000, () => {
  console.log("Server running successfully on Port : 7777");
});
