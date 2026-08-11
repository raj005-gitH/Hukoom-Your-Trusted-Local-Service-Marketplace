const mongoose = require("mongoose");

const userMessageSchema = new mongoose.Schema({
  senderId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    // Note: ref is dynamic based on senderRole, but usually handled in logic. 
    // We can use refPath if we wanted more complex indexing.
  },
  senderRole: {
    type: String,
    enum: ["user", "hero"],
    required: true,
  },
  name: {
    type: String,
    required: true,
    trim: true,
  },
  email: {
    type: String,
    required: true,
    trim: true,
    lowercase: true,
  },
  subject: {
    type: String,
    trim: true,
  },
  message: {
    type: String,
    required: true,
    trim: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model("UserMessage", userMessageSchema);
