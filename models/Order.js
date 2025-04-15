const mongoose = require("mongoose");
const { v4: uuidv4 } = require("uuid");

const orderSchema = new mongoose.Schema({
  orderId: { type: String, default: uuidv4, unique: true },
  productId: { type: String, required: true },
  quantity: { type: Number, required: true },
  customerId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
});

orderSchema.set("toJSON", {
  transform: (doc, ret) => {
    delete ret._id; // Remove the default _id
    delete ret.__v; // Remove the __v field
    return ret;
  },
});

module.exports = mongoose.model("Order", orderSchema);