const express = require("express");
const router = express.Router();
const User = require("../models/User");
const bcrypt = require("bcrypt");

// Post route to register user
router.post("/register-user", async (req, res) => {
  try {
    const { username, email, password, phone, city } = req.body;

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: "User with this email already exists" });
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const newUser = new User({
      username,
      email,
      password: hashedPassword,
      phone,
      city,
    });

    await newUser.save();

    // Return user data without password
    const userData = newUser.toObject();
    delete userData.password;

    res.status(201).json({
      message: "User Registered Successfully",
      user: userData,
    });
  } catch (error) {
    console.log("Error in user register route:", error);
    res.status(500).json({
      message: "Error saving user",
      error: error.message,
    });
  }
});

// Post route to login user
router.post("/login-user", async (req, res) => {
  try {
    const { email, password } = req.body;

    // Find user by email
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: "User not found with this email" });
    }

    // Compare password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: "Invalid password" });
    }

    // Return user data without password
    const userData = user.toObject();
    delete userData.password;

    res.status(200).json({
      message: "User Login Successful",
      user: userData,
    });
  } catch (error) {
    console.log("Error in user login route:", error);
    res.status(500).json({
      message: "Error logging in user",
      error: error.message,
    });
  }
});

module.exports = router;
