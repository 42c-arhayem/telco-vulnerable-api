const mongoose = require("mongoose");
const { v4: uuidv4 } = require("uuid");

const orderSchema = new mongoose.Schema({
  orderId: { type: String, default: uuidv4, unique: true },
  productId: { type: String, required: true },
  quantity: { type: Number, required: true },
  customerId: { type: String, required: true },
  status: { type: String, enum: ["processing", "completed", "canceled"], default: "processing" },
  orderDate: { type: Date, default: Date.now },
});

// Transform the output to exclude _id and __v
orderSchema.set("toJSON", {
  transform: (doc, ret) => {
    delete ret._id; // Remove _id
    delete ret.__v; // Remove __v
    return ret;
  },
});

module.exports = mongoose.model("Order", orderSchema);