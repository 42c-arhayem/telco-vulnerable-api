const express = require("express");
const { generateToken } = require("../utils/jwt");
const { authenticate } = require("../middleware/auth");
const User = require("../models/User"); // Import the User model
const router = express.Router();

// Register a new user
router.post("/register", async (req, res) => {
  try {
    const { username, email, isAdmin } = req.body;

    // Check if the user is already registered
    const existingUser = await User.findOne({ $or: [{ username }, { email }] });
    if (existingUser) {
      return res.status(400).json({ error: "User with this username or email already exists" });
    }

    // Create a new user, allowing isAdmin to be set directly
    const newUser = new User(req.body);
    await newUser.save();

    res.status(201).json({
      message: "User registered successfully",
      user: {
        username: newUser.username,
        email: newUser.email,
        isAdmin: newUser.isAdmin,
        customerId: newUser.customerId,
      },
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
    // Generate a token for the user
    const token = generateToken(user);
    res.status(200).json({
      message: "Login successful",
      token,
      user,
    });
  } catch (error) {
    console.error("Error during login:", error);
    res.status(500).json({ error: "Error logging in" });
  }
});

// Delete a user by username
router.delete("/user/:username", authenticate, async (req, res) => {
  const { username } = req.params;

  try {
    // Check if the user exists
    const user = await User.findOne({ username });
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // // BOLA vulnerability Fix: Ensure that only the user themselves or an admin can delete the user
    // if (req.user.username !== username && !req.user.isAdmin) {
    //   return res.status(403).json({ message: "Forbidden: You are not authorized to delete this user" });
    // }

    // Delete the user
    await User.deleteOne({ username });
    res.status(200).json({ message: "User deleted successfully" });
  } catch (error) {
    console.error("Error deleting user:", error);
    res.status(500).json({ message: "Error deleting user" });
  }
});

module.exports = router;