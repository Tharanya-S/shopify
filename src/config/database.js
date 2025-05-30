const mongoose = require("mongoose");

const connectDB = async () => {
  await mongoose.connect(
    "mongodb+srv://shopifydb:ICanDOIt%7E12062001@shopifydatabase.blnkavc.mongodb.net/"
  );
};

module.exports = { connectDB };