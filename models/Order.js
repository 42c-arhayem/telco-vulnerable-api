// filepath: /Users/alirhayem/Documents/repos/telco-vulnerable-api/models/Order.js
const mongoose = require("mongoose");

const orderSchema = new mongoose.Schema({
  productId: { type: String, required: true },
  quantity: { type: Number, required: true },
  customerId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
});

module.exports = mongoose.model("Order", orderSchema);