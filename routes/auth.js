const express = require("express");
const { generateToken } = require("../utils/jwt");
const User = require("../models/User"); // Import the User model
const router = express.Router();

// Register a new user
router.post("/register", async (req, res) => {
  try {
    const { username, email } = req.body;

    // Check if the user is already registered
    const existingUser = await User.findOne({ $or: [{ username }, { email }] });
    if (existingUser) {
      return res.status(400).json({ error: "User with this username or email already exists" });
    }

    // Create a new user
    const newUser = new User(req.body); // Directly use the request body without filtering
    await newUser.save();

    res.status(201).json({
      message: "User registered successfully",
      customerId: newUser._id,
      isAdmin: newUser.isAdmin, // Include isAdmin in the response
    });
  } catch (error) {
    res.status(500).json({ error: "Error registering user" });
  }
});

// Login a user
router.post("/login", async (req, res) => {
  const { username, password } = req.body;

  try {
    const user = await User.findOne({ username, password });
    if (!user) {
      return res.status(401).json({ error: "Invalid credentials" });
    }

    const token = generateToken(user); // Use the updated generateToken function
    res.status(200).json({
      message: "Login successful",
      token,
    });
  } catch (error) {
    res.status(500).json({ error: "Error logging in" });
  }
});

module.exports = router;