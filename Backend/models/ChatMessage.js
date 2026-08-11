const mongoose = require("mongoose");

const chatMessageSchema = new mongoose.Schema({
  userId: {
    type: String,
    required: true,
  },
  userName: {
    type: String,
    required: true,
  },
  role: {
    type: String,
    enum: ["user", "hero"],
    required: true,
  },
  sender: {
    type: String,
    enum: ["user", "ai"],
    required: true,
  },
  text: {
    type: String,
    required: true,
  },
  timestamp: {
    type: Date,
    default: Date.now,
  },
  sessionId: {
    type: String,
    required: true,
  },
});

// Index for fast lookups by user and session
chatMessageSchema.index({ userId: 1, sessionId: 1 });
chatMessageSchema.index({ timestamp: -1 });

module.exports = mongoose.model("ChatMessage", chatMessageSchema);
