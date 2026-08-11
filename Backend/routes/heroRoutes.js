const express = require("express");
const router = express.Router();
const Hero = require("../models/Hero");
const bcrypt = require("bcrypt");

// Post route to register hero
router.post("/register-hero", async (req, res) => {
    try {
        const { fullname, email, password, skills, phone, city } = req.body;

        // Check if hero already exists
        const existingHero = await Hero.findOne({ email });
        if (existingHero) {
            return res.status(400).json({ message: "Hero with this email already exists" });
        }

        // Hash password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        // Parse skills from comma-separated string to array
        const skillsArray = typeof skills === "string"
            ? skills.split(",").map(s => s.trim()).filter(s => s)
            : skills;

        const newHero = new Hero({
            fullname,
            email,
            password: hashedPassword,
            skills: skillsArray,
            phone,
            city,
        });

        await newHero.save();

        // Return hero data without password
        const heroData = newHero.toObject();
        delete heroData.password;

        res.status(201).json({
            message: "Hero Registered Successfully",
            hero: heroData,
        });
    } catch (error) {
        console.log("Error in hero register route:", error);
        res.status(500).json({
            message: "Error registering hero",
            error: error.message,
        });
    }
});

// Post route to login hero
router.post("/login-hero", async (req, res) => {
    try {
        const { email, password } = req.body;

        // Find hero by email
        const hero = await Hero.findOne({ email });
        if (!hero) {
            return res.status(404).json({ message: "Hero not found with this email" });
        }

        // Compare password
        const isMatch = await bcrypt.compare(password, hero.password);
        if (!isMatch) {
            return res.status(401).json({ message: "Invalid password" });
        }

        // Return hero data without password
        const heroData = hero.toObject();
        delete heroData.password;

        res.status(200).json({
            message: "Hero Login Successful",
            hero: heroData,
        });
    } catch (error) {
        console.log("Error in hero login route:", error);
        res.status(500).json({
            message: "Error logging in hero",
            error: error.message,
        });
    }
});

module.exports = router;