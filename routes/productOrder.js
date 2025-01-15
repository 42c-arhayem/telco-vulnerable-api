const express = require("express");
const { orders, saveOrders } = require("../data/db");
const { authenticate } = require("../middleware/auth");
const router = express.Router();

// BOLA Vulnerability: Allows access to another user's orders
router.get("/:orderId", authenticate, (req, res) => {
  const order = orders.find(o => o.id === req.params.orderId);
  if (!order) return res.status(404).json({ error: "Order not found" });

  // No check to ensure the user owns the order
  res.status(200).json(order);
});

// BFLA Vulnerability: Allows users without roles to create orders for others
router.post("/", authenticate, (req, res) => {
  const { productId, quantity, customerId } = req.body;

  const newOrder = {
    id: (orders.length + 1).toString(),
    productId,
    quantity,
    customerId
  };

  orders.push(newOrder); // Add to the in-memory database
  saveOrders(orders); // Persist to the file
  res.status(201).json({ message: "Order created successfully", order: newOrder });
});

router.delete("/:orderId", authenticate, (req, res) => {
  const orderIndex = orders.findIndex(o => o.id === req.params.orderId);
  if (orderIndex === -1) {
    return res.status(404).json({ error: "Order not found" });
  }

  orders.splice(orderIndex, 1); // Remove from memory
  saveOrders(orders); // Persist the changes
  res.status(200).json({ message: "Order canceled successfully" });
});

module.exports = router;