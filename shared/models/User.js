const mongoose = require("mongoose");
const { v4: uuidv4 } = require("uuid");

const userSchema = new mongoose.Schema({
  customerId: { type: String, default: uuidv4, unique: true },
  username: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  isAdmin: { type: Boolean, default: false },
});

// Transform the output to exclude _id and __v
userSchema.set("toJSON", {
  transform: (doc, ret) => {
    delete ret._id; // Remove _id
    delete ret.__v; // Remove __v
    return ret;
  },
});

module.exports = mongoose.model("User", userSchema);