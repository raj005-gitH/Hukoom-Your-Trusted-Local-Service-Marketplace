const mongoose = require("mongoose");
require("dotenv").config();

async function connectDB() {

  //even though in .env file I have mentioned /hukoomWeb as my folder name but still the data is being stored in test folder only on cluster.
  //Find out why?
  await mongoose
    .connect(process.env.MONGO_URL)
    .then(() => {
      console.log("MongoDB connected successfully");
    })
    .catch((err) => {
      console.log(`Error aa gya MongoDB: ${err}`);
    });
}

module.exports = connectDB;