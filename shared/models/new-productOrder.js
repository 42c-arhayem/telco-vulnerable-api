const mongoose = require("mongoose");
const { v4: uuidv4 } = require("uuid");

const productOrderSchema = new mongoose.Schema({
  orderId: { type: String, default: uuidv4, unique: true },
  state: { type: String, enum: ["acknowledged", "pending", "completed", "cancelled"], default: "acknowledged" },
  requestedStartDate: { type: Date },
  requestedCompletionDate: { type: Date },
  completionDate: { type: Date },
  description: { type: String },
  priority: { type: String, enum: ["0", "1", "2", "3", "4"], default: "4" }, // 0 is highest priority
  category: { type: String },
  relatedParty: [
    {
      id: { type: String },
      role: { type: String },
    },
  ],
  productOrderItem: [
    {
      id: { type: String, required: true },
      action: { type: String, enum: ["add", "modify", "delete"], required: true },
      product: {
        id: { type: String },
        name: { type: String },
      },
      quantity: { type: Number, required: true },
      state: { type: String, enum: ["acknowledged", "pending", "completed", "cancelled"], default: "acknowledged" },
    },
  ],
  orderTotalPrice: [
    {
      priceType: { type: String },
      price: { type: Number },
    },
  ],
  billingAccount: { type: String },
  note: [
    {
      text: { type: String },
      author: { type: String },
      date: { type: Date },
    },
  ],
  cancellationDate: { type: Date },
  cancellationReason: { type: String },
});

// Transform the output to exclude _id and __v
productOrderSchema.set("toJSON", {
  transform: (doc, ret) => {
    delete ret._id;
    delete ret.__v;
    return ret;
  },
});

module.exports = mongoose.model("ProductOrder", productOrderSchema);