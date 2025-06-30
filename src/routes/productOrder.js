const express = require("express");
const { authenticate } = require("../middleware/auth");
const Order = require("../models/Order"); // Import the Order model
const mongoose = require("mongoose"); // Import mongoose for ObjectId validation
const router = express.Router();

// List all orders with optional filters
router.get("/", async (req, res) => {
  const { customerId, status } = req.query;

  try {
    const query = {};
    if (customerId) query.customerId = customerId;
    if (status) query.status = status;

    const orders = await Order.find(query).select("orderId productId quantity status");
    res.status(200).json(orders);
  } catch (error) {
    console.error("Error fetching orders:", error);
    res.status(500).json({ error: "Error fetching orders" });
  }
});

// Get an order by ID
router.get("/:orderId", authenticate, async (req, res) => {
  try {
    const order = await Order.findOne({ orderId: req.params.orderId }).select(
      "orderId productId quantity status orderDate"
    );

    if (!order) {
      return res.status(404).json({ error: "Order not found" });
    }
    res.status(200).json(order);
  } catch (error) {
    console.error("Error fetching order:", error);
    res.status(500).json({ error: "Error fetching order" });
  }
});

// Create a new order
router.post("/", authenticate, async (req, res) => {
  const { productId, quantity, customerId } = req.body;

  // Validate request body
  if (!productId || !quantity || !customerId) {
    return res.status(400).json({ error: "Missing required fields: productId, quantity, or customerId" });
  }

  try {
    const newOrder = new Order({
      productId,
      quantity,
      customerId, // Allow any customerId to be set
    });

    await newOrder.save();
    res.status(201).json({
      orderId: newOrder.orderId,
      message: "Order created successfully",
    });
  } catch (error) {
    console.error("Error creating order:", error);
    res.status(500).json({ error: "Error creating order" });
  }
});

// Update an order by ID
router.patch("/:orderId", authenticate, async (req, res) => {
  const { quantity, productId } = req.body;

  try {
    const updatedOrder = await Order.findOneAndUpdate(
      { orderId: req.params.orderId },
      { $set: { quantity, productId } },
      { new: true, select: "orderId quantity productId" }
    );

    if (!updatedOrder) {
      return res.status(404).json({ error: "Order not found" });
    }

    res.status(200).json({
      message: "Order updated successfully",
      order: updatedOrder,
    });
  } catch (error) {
    console.error("Error updating order:", error);
    res.status(500).json({ error: "Error updating order" });
  }
});

// Delete an order by ID
router.delete("/:orderId", authenticate, async (req, res) => {
  try {
    const order = await Order.findOneAndDelete({ orderId: req.params.orderId });

    if (!order) {
      return res.status(404).json({ error: "Order not found" });
    }

    res.status(200).json({ message: "Order canceled successfully" });
  } catch (error) {
    console.error("Error canceling order:", error); // Log the error
    res.status(500).json({ error: "Error canceling order" });
  }
});

module.exports = router;