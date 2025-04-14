const express = require("express");
const { generateToken } = require("../utils/jwt");
const User = require("../models/User"); // Import the User model
const router = express.Router();

// Register a new user
router.post("/register", async (req, res) => {
  try {
    const newUser = new User(req.body); // Directly use the request body without filtering
    await newUser.save();

    res.status(201).json({
      message: "User registered successfully",
      userId: newUser._id,
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

    const token = generateToken({ id: user._id, isAdmin: user.isAdmin });
    res.status(200).json({
      message: "Login successful",
      token,
      user, // Leak full user object
    });
  } catch (error) {
    res.status(500).json({ error: "Error logging in" });
  }
});

module.exports = router;