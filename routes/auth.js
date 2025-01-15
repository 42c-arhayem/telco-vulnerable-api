const express = require("express");
const fs = require("fs");
const path = require("path");
const { generateToken } = require("../utils/jwt");
const router = express.Router();

const usersPath = path.join(__dirname, "../data/users.json");

// Load users from the users.json file
const loadUsers = () => {
  if (fs.existsSync(usersPath)) {
    try {
      const data = fs.readFileSync(usersPath, "utf-8");
      if (!data) {
        throw new Error("Users file is empty");
      }
      return JSON.parse(data);
    } catch (error) {
      console.error("Error parsing users JSON:", error.message);
      return [];
    }
  }
  return [];
};

// Save users to the users.json file
const saveUsers = (users) => {
  fs.writeFileSync(usersPath, JSON.stringify(users, null, 2), "utf-8");
};

// Initialize the in-memory users database
let users = loadUsers();

// BOPLA Vulnerability (Mass Assignment): Allows "isAdmin" injection
router.post("/register", (req, res) => {
  const { username, password, email, isAdmin } = req.body;
  const newUser = {
    id: (users.length + 1).toString(),
    username,
    password,
    email,
    isAdmin: isAdmin || false // Mass Assignment vulnerability
  };
  users.push(newUser);
  saveUsers(users); // Save the updated users list to the file
  res.status(201).json({ message: "User registered", userId: newUser.id });
});

router.post("/login", (req, res) => {
  const { username, password } = req.body;
  const user = users.find(u => u.username === username && u.password === password);
  if (!user) return res.status(401).json({ error: "Invalid credentials" });

  const token = generateToken(user);
  res.status(200).json({ message: "Login successful", token });
});

module.exports = router;