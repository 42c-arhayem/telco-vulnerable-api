const express = require("express");
const { authenticate } = require("../middleware/auth");
const Order = require("../models/Order"); // Import the Order model
const mongoose = require("mongoose"); // Import mongoose for ObjectId validation
const router = express.Router();

// Get an order by ID
router.get("/:orderId", authenticate, async (req, res) => {
  try {
    const order = await Order.findById(req.params.orderId);

    if (!order) {
      return res.status(404).json({ error: "Order not found" });
    }

    // Removed ownership or admin check
    res.status(200).json(order);
  } catch (error) {
    res.status(500).json({ error: "Error fetching order" });
  }
});

// Create a new order
router.post("/", authenticate, async (req, res) => {
  const { productId, quantity } = req.body;

  // Validate request body
  if (!productId || !quantity ) {
    return res.status(400).json({ error: "Missing required fields: productId,or quantity" });
  }

  try {
    const newOrder = new Order({
      productId,
      quantity,
      customerId: req.user._id
    });

    await newOrder.save();
    res.status(201).json({ message: "Order created successfully", order: newOrder });
  } catch (error) {
    console.error("Error creating order:", error); // Log the error
    res.status(500).json({ error: "Error creating order" });
  }
});

// Delete an order by ID
router.delete("/:orderId", authenticate, async (req, res) => {
  try {
    const order = await Order.findById(req.params.orderId);

    if (!order) {
      return res.status(404).json({ error: "Order not found" });
    }

    // Ensure the authenticated user owns the order or is an admin
    if (order.customerId.toString() !== req.user._id.toString() && !req.user.isAdmin) {
      return res.status(403).json({ error: "Forbidden: You do not have access to cancel this order" });
    }

    await Order.findByIdAndDelete(req.params.orderId);
    res.status(200).json({ message: "Order canceled successfully" });
  } catch (error) {
    res.status(500).json({ error: "Error canceling order" });
  }
});

module.exports = router;