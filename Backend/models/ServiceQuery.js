const mongoose = require("mongoose");

const serviceQuerySchema = new mongoose.Schema({
  userName: {
    type: String,
    required: true,
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User", //relation: only a object of this model is connected through ref
    required: true,
  },
  city: {
    type: String,
    required: true,
    lowercase: true,
    trim: true,
  },
  area: {
    type: String,
    required: true,
    trim: true,
  },
  workDescription: {
    type: String,
    required: true,
    trim: true,
  },
  price: {
    type: Number,
    required: true,
    min: 0,
  },
  status: {
    type: String,
    enum: ["open", "in_progress", "expired", "completed"],
    default: "open",
  },
  heroId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Hero",
    default: null,
  },
  heroName: {
    type: String,
    default: null,
  },
  expiresAt: {
    type: Date,
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

// Index for efficient area-based lookups
//Implemented indexing for mondoDB
serviceQuerySchema.index({ city: 1, area: 1, status: 1 });

// Index for expiry checking
serviceQuerySchema.index({ expiresAt: 1, status: 1 });

module.exports = mongoose.model("ServiceQuery", serviceQuerySchema);