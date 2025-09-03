const mongoose = require("mongoose");

//destructuring schema from the mongoose ,not needed but looks good
const { Schema,model } = mongoose;

//creating the schema
const UserSchema = Schema({
  name: {
    type: String,
    reqired: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
  },
  password: {
    type: String,
    reqired: true,
  },
  profilePic: {
    type: String,
    default: "",
  },
  date: {
    type: Date,
    default: Date.now,
  },
});

//converting schema to model


//destructuring mongoose above and using it 
// const User = model("user", UserSchema);

//without destructuring

//user is the name of folder that will be created on the mongoDB and where the data will be stored
const User = mongoose.model("user", UserSchema);
module.exports = User;
