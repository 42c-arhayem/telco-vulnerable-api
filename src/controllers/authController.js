const { generateToken } = require("../utils/jwt");
const User = require("../models/User"); // Import the User model

// Helper function to validate a user's credentials
const validateUser = async (username, password) => {
  return await User.findOne({ username, password }); // Query the database for the user
};

exports.login = async (req, res) => {
  const { username, password } = req.body;

  try {
    const user = await validateUser(username, password);
    if (user) {
      const token = generateToken({ id: user._id, isAdmin: user.isAdmin });
      return res.status(200).json({ token, message: "Login successful" });
    }
    res.status(401).json({ error: "Invalid credentials" });
  } catch (error) {
    res.status(500).json({ error: "Error logging in" });
  }
};

exports.register = async (req, res) => {
  const { username, password, email, isAdmin } = req.body;

  try {
    // Check if the user already exists
    const userExists = await User.findOne({ $or: [{ username }, { email }] });
    if (userExists) {
      return res.status(400).json({ error: "User with the same username or email already exists" });
    }

    // Create a new user
    const newUser = new User({
      username,
      password,
      email,
      isAdmin: isAdmin || false, // Prevent mass assignment
    });

    await newUser.save(); // Save the user to the database

    res.status(201).json({
      message: "User registered successfully",
      userId: newUser._id,
      isAdmin: newUser.isAdmin, // Include isAdmin in the response if needed
    });
  } catch (error) {
    res.status(500).json({ error: "Error registering user" });
  }
};