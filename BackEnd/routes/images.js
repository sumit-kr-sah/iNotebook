const express = require("express");
const router = express.Router();
const fetchuser = require("../middleware/fetchuser");
const Image = require("../models/Image");
const { body, validationResult } = require("express-validator");

// ROUTE 1: Get all images using: GET "/api/images/fetchallimages". Login required
router.get("/fetchallimages", fetchuser, async (req, res) => {
  try {
    // Option to exclude full image data for faster loading
    const excludeImageData = req.query.excludeImageData === 'true';
    
    // Find all images for the user
    let images;
    if (excludeImageData) {
      images = await Image.find({ user: req.user.id }).select('-imageData');
    } else {
      images = await Image.find({ user: req.user.id });
    }
    
    res.json(images);
  } catch (error) {
    console.error(error.message);
    res.status(500).send("Internal Server Error");
  }
});

// ROUTE 2: Add a new image using: POST "/api/images/addimage". Login required
router.post(
  "/addimage",
  fetchuser,
  [
    body("title", "Title cannot be empty").notEmpty(),
    body("imageData", "Image data is required").notEmpty(),
    body("imageType", "Image type is required").notEmpty(),
  ],
  async (req, res) => {
    try {
      const { 
        title, 
        description, 
        imageData, 
        imageType, 
        originalSize, 
        compressedSize,
        dimensions 
      } = req.body;

      // If there are errors, return Bad request and the errors
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      // Calculate data size
      const actualSize = imageData.length * 0.75; // Approximate size in bytes (base64 is ~33% larger)

      // Create a new image
      const image = new Image({
        title,
        description,
        imageData,
        imageType,
        originalSize: originalSize || 0,
        compressedSize: compressedSize || actualSize,
        dimensions: dimensions || { width: 0, height: 0 },
        user: req.user.id,
      });

      // Save the image to the database
      const savedImage = await image.save();
      
      // Don't send back the full image data to reduce response size
      const responseImage = {
        _id: savedImage._id,
        title: savedImage.title,
        description: savedImage.description,
        imageType: savedImage.imageType,
        originalSize: savedImage.originalSize,
        compressedSize: savedImage.compressedSize,
        dimensions: savedImage.dimensions,
        date: savedImage.date,
        user: savedImage.user
      };
      
      res.json(responseImage);
    } catch (error) {
      console.error(error.message);
      res.status(500).send("Internal Server Error");
    }
  }
);

// ROUTE 3: Delete an existing image using: DELETE "/api/images/deleteimage/:id". Login required
router.delete("/deleteimage/:id", fetchuser, async (req, res) => {
  try {
    // Find the image to be deleted
    let image = await Image.findById(req.params.id);
    if (!image) {
      return res.status(404).json({ error: "Image not found" });
    }

    // Allow deletion only if user owns this image
    if (image.user.toString() !== req.user.id) {
      return res.status(401).json({ error: "Not Allowed" });
    }

    // Delete the image
    image = await Image.findByIdAndDelete(req.params.id);
    res.json({ success: "Image has been deleted", image });
  } catch (error) {
    console.error(error.message);
    res.status(500).send("Internal Server Error");
  }
});

// ROUTE 4: Update an existing image using: PUT "/api/images/updateimage/:id". Login required
router.put("/updateimage/:id", fetchuser, async (req, res) => {
  try {
    const { title, description } = req.body;
    
    // Create a new image object
    const newImage = {};
    if (title) newImage.title = title;
    if (description) newImage.description = description;

    // Find the image to be updated
    let image = await Image.findById(req.params.id);
    if (!image) {
      return res.status(404).json({ error: "Image not found" });
    }

    // Allow update only if user owns this image
    if (image.user.toString() !== req.user.id) {
      return res.status(401).json({ error: "Not Allowed" });
    }

    // Update the image
    image = await Image.findByIdAndUpdate(
      req.params.id,
      { $set: newImage },
      { new: true }
    );
    res.json(image);
  } catch (error) {
    console.error(error.message);
    res.status(500).send("Internal Server Error");
  }
});

// ROUTE 5: Get a single image by ID: GET "/api/images/image/:id". Login required
router.get("/image/:id", fetchuser, async (req, res) => {
  try {
    // Find the image
    const image = await Image.findById(req.params.id);
    
    // Check if image exists
    if (!image) {
      return res.status(404).json({ error: "Image not found" });
    }
    
    // Check if user is authorized to view this image
    if (image.user.toString() !== req.user.id) {
      return res.status(401).json({ error: "Not Allowed" });
    }
    
    res.json(image);
  } catch (error) {
    console.error(error.message);
    res.status(500).send("Internal Server Error");
  }
});

module.exports = router; 