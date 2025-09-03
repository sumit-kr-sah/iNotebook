const express = require("express");
const router = express.Router();
const Message = require("../models/Message");
const fetchuser = require("../middleware/fetchuser");
const { body, validationResult } = require("express-validator");

// ROUTE 1: Get all messages with a specific user - GET /api/messages/:userId
router.get("/:userId", fetchuser, async (req, res) => {
  try {
    if (!req.params.userId || !req.user || !req.user.id) {
      return res.status(400).json({ error: "Invalid user information" });
    }

    const messages = await Message.find({
      $or: [
        { sender: req.user.id, receiver: req.params.userId },
        { sender: req.params.userId, receiver: req.user.id }
      ]
    }).sort({ timestamp: 1 });
    
    res.json(messages);
  } catch (error) {
    console.error(error.message);
    res.status(500).send("Internal Server Error");
  }
});

// ROUTE 2: Send a new message - POST /api/messages
router.post(
  "/",
  fetchuser,
  [
    body("receiver", "Receiver is required").not().isEmpty(),
    body("content", "Message content cannot be empty").not().isEmpty(),
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      if (!req.user || !req.user.id) {
        return res.status(400).json({ error: "Invalid user information" });
      }

      const { receiver, content } = req.body;
      
      const message = new Message({
        sender: req.user.id,
        receiver,
        content
      });

      const savedMessage = await message.save();
      res.json(savedMessage);
    } catch (error) {
      console.error(error.message);
      res.status(500).send("Internal Server Error");
    }
  }
);

// ROUTE 3: Mark messages as read - PUT /api/messages/read/:userId
router.put("/read/:userId", fetchuser, async (req, res) => {
  try {
    if (!req.params.userId || !req.user || !req.user.id) {
      return res.status(400).json({ error: "Invalid user information" });
    }
    
    const result = await Message.updateMany(
      { sender: req.params.userId, receiver: req.user.id, read: false },
      { $set: { read: true } }
    );
    
    res.json({ success: true, messagesUpdated: result.modifiedCount });
  } catch (error) {
    console.error(error.message);
    res.status(500).send("Internal Server Error");
  }
});

// ROUTE 4: Delete a message - DELETE /api/messages/:messageId
router.delete("/:messageId", fetchuser, async (req, res) => {
  try {
    if (!req.params.messageId || !req.user || !req.user.id) {
      return res.status(400).json({ error: "Invalid message or user information" });
    }
    
    // Find the message
    const message = await Message.findById(req.params.messageId);
    
    // Check if message exists
    if (!message) {
      return res.status(404).json({ success: false, error: "Message not found" });
    }
    
    // Check if user is authorized to delete the message (must be the sender)
    if (message.sender.toString() !== req.user.id) {
      return res.status(401).json({ success: false, error: "Not authorized to delete this message" });
    }
    
    // Delete the message
    await Message.findByIdAndDelete(req.params.messageId);
    
    res.json({ success: true, message: "Message deleted successfully" });
  } catch (error) {
    console.error(error.message);
    res.status(500).send("Internal Server Error");
  }
});

module.exports = router; 