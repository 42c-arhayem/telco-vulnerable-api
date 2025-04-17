const express = require("express");
const { authenticate } = require("../middleware/auth");
const Order = require("../models/Order"); // Import the Order model
const mongoose = require("mongoose"); // Import mongoose for ObjectId validation
const router = express.Router();

// List all orders for the authenticated user
router.get("/", authenticate, async (req, res) => {
  try {
    let orders;

    // If the user is an admin, retrieve all orders
    if (req.user.isAdmin) {
      orders = await Order.find();
    } else {
      // Otherwise, retrieve only the orders for the authenticated user
      orders = await Order.find({ customerId: req.user._id });
    }

    res.status(200).json({ orders });
  } catch (error) {
    console.error("Error fetching orders:", error); // Log the error
    res.status(500).json({ error: "Error fetching orders" });
  }
});

// Get an order by ID
router.get("/:orderId", authenticate, async (req, res) => {
  try {
    // Query the database using the custom orderId field
    const order = await Order.findOne({ orderId: req.params.orderId });

    if (!order) {
      return res.status(404).json({ error: "Order not found" });
    }
    res.status(200).json(order);
  } catch (error) {
    console.error("Error fetching order:", error); // Log the error
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
    // Query the database using the custom orderId field
    const order = await Order.findOne({ orderId: req.params.orderId });

    if (!order) {
      return res.status(404).json({ error: "Order not found" });
    }

    // Ensure the authenticated user owns the order or is an admin
    if (order.customerId.toString() !== req.user._id.toString() && !req.user.isAdmin) {
      return res.status(403).json({ error: "Forbidden: You do not have access to cancel this order" });
    }

    // Delete the order using the orderId field
    await Order.findOneAndDelete({ orderId: req.params.orderId });
    res.status(200).json({ message: "Order canceled successfully" });
  } catch (error) {
    console.error("Error canceling order:", error); // Log the error
    res.status(500).json({ error: "Error canceling order" });
  }
});

module.exports = router;