const mongoose = require("mongoose");
const { v4: uuidv4 } = require("uuid");

const orderSchema = new mongoose.Schema({
  orderId: { type: String, default: uuidv4, unique: true }, // Use uuid for orderId
  productId: { type: String, required: true },
  quantity: { type: Number, required: true },
  customerId: { type: String, default: uuidv4, unique: true, required: true },
});

orderSchema.set("toJSON", {
  transform: (doc, ret) => {
    delete ret._id;
    delete ret.__v;
    return ret;
  },
});

module.exports = mongoose.model("Order", orderSchema);