const express = require("express");
const { authenticate } = require("../middleware/auth");
const Order = require("../models/Order"); // Import the Order model
const ProductOrder = require("../models/ProductOrder"); // Import the ProductOrder model
const mongoose = require("mongoose"); // Import mongoose for ObjectId validation
const router = express.Router();

// List all orders with optional filters
router.get("/orders", authenticate, async (req, res) => {
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
router.get("/orders/:orderId", authenticate, async (req, res) => {
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
router.post("/orders", authenticate, async (req, res) => {
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
      message: "Order created successfully.",
    });
  } catch (error) {
    console.error("Error creating order:", error);
    res.status(500).json({ error: "Error creating order" });
  }
});

// Update an order by ID
router.patch("/orders/:orderId", authenticate, async (req, res) => {
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
      message: "Order updated successfully.",
      order: updatedOrder,
    });
  } catch (error) {
    console.error("Error updating order:", error);
    res.status(500).json({ error: "Error updating order" });
  }
});

// Delete an order by ID
router.delete("/orders/:orderId", authenticate, async (req, res) => {
  try {
    const order = await Order.findOneAndDelete({ orderId: req.params.orderId });

    if (!order) {
      return res.status(404).json({ error: "Order not found" });
    }

    res.status(200).json({ message: "Order canceled successfully." });
  } catch (error) {
    console.error("Error canceling order:", error); // Log the error
    res.status(500).json({ error: "Error canceling order" });
  }
});

// List all product orders with optional filters
router.get("/", authenticate, async (req, res) => {
  const { customerId, state } = req.query;

  try {
    const query = {};
    if (customerId) query["relatedParty.id"] = customerId; // No ownership validation (BOLA vulnerability)
    if (state) query.state = state;

    const productOrders = await ProductOrder.find(query).select(
      "orderId state requestedStartDate requestedCompletionDate description priority category"
    );
    res.status(200).json(productOrders);
  } catch (error) {
    console.error("Error fetching product orders:", error);
    res.status(500).json({ error: "Error fetching product orders" });
  }
});

// Get a product order by ID
router.get("/:orderId", authenticate, async (req, res) => {
  try {
    const productOrder = await ProductOrder.findOne({ orderId: req.params.orderId }).select(
      "orderId state requestedStartDate requestedCompletionDate description priority category relatedParty productOrderItem"
    );

    if (!productOrder) {
      return res.status(404).json({ error: "Product order not found" });
    }

    res.status(200).json(productOrder);
  } catch (error) {
    console.error("Error fetching product order:", error);
    res.status(500).json({ error: "Error fetching product order" });
  }
});

// Create a new product order
router.post("/", authenticate, async (req, res) => {
  const {
    state,
    requestedStartDate,
    requestedCompletionDate,
    description,
    priority,
    category,
    relatedParty,
    productOrderItem,
    orderTotalPrice,
    billingAccount,
    note,
  } = req.body;

  // Validate required fields
  if (!productOrderItem || productOrderItem.length === 0) {
    return res.status(400).json({ error: "Missing required field: productOrderItem" });
  }

  try {
    const newProductOrder = new ProductOrder({
      state: state || "acknowledged",
      requestedStartDate,
      requestedCompletionDate,
      description,
      priority: priority || "4", // Default priority is "4"
      category,
      relatedParty,
      productOrderItem,
      orderTotalPrice,
      billingAccount,
      note,
    });

    await newProductOrder.save();
    res.status(201).json({
      orderId: newProductOrder.orderId,
      message: "Product order created successfully.",
    });
  } catch (error) {
    console.error("Error creating product order:", error);
    res.status(500).json({ error: "Error creating product order" });
  }
});

// Update a product order by ID
router.patch("/:orderId", authenticate, async (req, res) => {
  try {
    const updatedProductOrder = await ProductOrder.findOneAndUpdate(
      { orderId: req.params.orderId },
      { $set: req.body }, // No restriction on fields being updated (Mass Assignment vulnerability)
      { new: true }
    );

    if (!updatedProductOrder) {
      return res.status(404).json({ error: "Product order not found" });
    }

    res.status(200).json({
      message: "Product order updated successfully.",
      productOrder: updatedProductOrder,
    });
  } catch (error) {
    console.error("Error updating product order:", error);
    res.status(500).json({ error: "Error updating product order" });
  }
});

// Delete a product order by ID
router.delete("/:orderId", authenticate, async (req, res) => {
  try {
    const productOrder = await ProductOrder.findOneAndDelete({ orderId: req.params.orderId });

    if (!productOrder) {
      return res.status(404).json({ error: "Product order not found" });
    }

    res.status(200).json({ message: "Product order canceled successfully." });
  } catch (error) {
    console.error("Error canceling product order:", error);
    res.status(500).json({ error: "Error canceling product order" });
  }
});

module.exports = router;