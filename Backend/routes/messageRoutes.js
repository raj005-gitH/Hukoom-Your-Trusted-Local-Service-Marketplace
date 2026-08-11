const express = require("express");
const router = express.Router();
const UserMessage = require("../models/UserMessage");

// POST /api/contact — Submit a contact form message
router.post("/contact", async (req, res) => {
  try {
    const { senderId, senderRole, name, email, subject, message } = req.body;

    // Basic validation
    if (!senderId || !senderRole || !name || !email || !message) {
      return res.status(400).json({ message: "Please provide all required fields." });
    }

    const newMessage = new UserMessage({
      senderId,
      senderRole,
      name,
      email,
      subject,
      message,
    });

    await newMessage.save();

    res.status(201).json({ 
      message: "Your message has been sent successfully! We will get back to you soon.",
      messageId: newMessage._id 
    });
  } catch (error) {
    console.error("Error saving contact message:", error.message);
    res.status(500).json({ message: "An error occurred while sending your message. Please try again later." });
  }
});

module.exports = router;
