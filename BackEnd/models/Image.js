const mongoose = require("mongoose");

const { Schema } = mongoose;
const ImageSchema = new Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "user",
  },
  title: {
    type: String,
    required: true,
  },
  description: {
    type: String,
    default: "",
  },
  imageData: {
    type: String,
    required: true,
  },
  imageType: {
    type: String,
    required: true,
  },
  originalSize: {
    type: Number, // Size in bytes
    default: 0,
  },
  compressedSize: {
    type: Number, // Size in bytes
    default: 0,
  },
  dimensions: {
    width: { type: Number, default: 0 },
    height: { type: Number, default: 0 },
  },
  date: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model("images", ImageSchema); 