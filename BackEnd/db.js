const mongoose = require("mongoose");
const mongoURI = "mongodb://localhost:27017/inotebook";
//putting "/inotebook"creates the new folder in the mongo db database

const connectToMongo = async () => {
  await mongoose.connect(mongoURI, {});
  console.log("Connected to MongoDB successfully!");
};

module.exports = connectToMongo;
