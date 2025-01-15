const fs = require("fs");
const path = require("path");

// Define the path for the orders JSON file
const dbPath = path.join(__dirname, "orders.json");

// Load existing orders from the file
const loadOrders = () => {
  if (fs.existsSync(dbPath)) {
    try {
      const data = fs.readFileSync(dbPath, "utf-8");
      if (!data) {
        throw new Error("Orders file is empty");
      }
      return JSON.parse(data);
    } catch (error) {
      console.error("Error parsing orders JSON:", error.message);
      return [];
    }
  }
  return [];
};

// Save orders to the file
const saveOrders = (orders) => {
  fs.writeFileSync(dbPath, JSON.stringify(orders, null, 2), "utf-8");
};

// Initialize the in-memory orders database
let orders = loadOrders();

// Define the users array (assuming users are stored in a separate JSON file)
const usersPath = path.join(__dirname, "users.json");

const loadUsers = () => {
  if (fs.existsSync(usersPath)) { // Use fs.existsSync instead of fs.exists
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

const users = loadUsers();

module.exports = { orders, saveOrders, users };