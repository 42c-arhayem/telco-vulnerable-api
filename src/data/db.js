const mongoose = require("mongoose");
const { v4: uuidv4 } = require("uuid"); // Import uuid for generating customerId
const User = require("../models/User"); // Import the User model

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI); // Connect to MongoDB
    console.log("MongoDB connected successfully");

    // Seed default users
    await seedDefaultUsers();
  } catch (error) {
    console.error("MongoDB connection error:", error.message);
    process.exit(1);
  }
};

// Function to seed default users
const seedDefaultUsers = async () => {
  try {
    // Check if admin user already exists
    const adminExists = await User.findOne({ username: "admin" });
    if (!adminExists) {
      const adminUser = new User({
        username: "admin",
        password: "password", // In a real application, hash this password
        email: "admin@company.com",
        isAdmin: true,
        customerId: uuidv4(), // Generate a unique customerId
      });
      await adminUser.save();
      console.log("Default admin user created");
    }

    // Check if regular user already exists
    const regularUserExists = await User.findOne({ username: "user" });
    if (!regularUserExists) {
      const regularUser = new User({
        username: "username",
        password: "password", // In a real application, hash this password
        email: "user@company.com",
        isAdmin: false,
        customerId: uuidv4(), // Generate a unique customerId
      });
      await regularUser.save();
      console.log("Default regular user created");
    }

        // Check if regular user already exists
    const regularUser2Exists = await User.findOne({ username: "user2" });
    if (!regularUser2Exists) {
      const regularUser2 = new User({
        username: "username2",
        password: "password", // In a real application, hash this password
        email: "user2@company.com",
        isAdmin: false,
        customerId: uuidv4(), // Generate a unique customerId
      });
      await regularUser2.save();
      console.log("Default regular user 2 created");
    }
  } catch (error) {
    console.error("Error seeding default users:", error.message);
  }
};

module.exports = { connectDB };