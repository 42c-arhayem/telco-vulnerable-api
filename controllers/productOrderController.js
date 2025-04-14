const Order = require("../models/Order"); // Import the Order model

// Create a new order
exports.createOrder = async (req, res) => {
  try {
    const order = new Order(req.body); // Create a new order using the request body
    await order.save(); // Save the order to the database
    res.status(201).json({ message: "Order created", order });
  } catch (error) {
    res.status(500).json({ error: "Error creating order" });
  }
};

// Cancel an order
exports.cancelOrder = async (req, res) => {
  const { orderId } = req.params;

  try {
    const order = await Order.findByIdAndDelete(orderId); // Find and delete the order by ID
    if (!order) return res.status(404).json({ error: "Order not found" });
    res.status(200).json({ message: "Order canceled", order });
  } catch (error) {
    res.status(500).json({ error: "Error canceling order" });
  }
};

// List all orders
exports.listOrders = async (req, res) => {
  try {
    const orders = await Order.find(); // Fetch all orders from the database
    res.status(200).json(orders);
  } catch (error) {
    res.status(500).json({ error: "Error fetching orders" });
  }
};