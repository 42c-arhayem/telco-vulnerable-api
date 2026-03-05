const User = require("../../shared/models/User");
const Order = require("../../shared/models/Order");
const ProductOrder = require("../../shared/models/new-productOrder");
const { generateToken } = require("../../shared/utils/jwt");
const fetch = require("node-fetch");

const resolvers = {
  Query: {
    // Get current user from context
    me: async (_, __, context) => {
      if (!context.user) {
        throw new Error("Not authenticated");
      }
      return context.user;
    },

    // Get orders with optional filters (BOLA vulnerability - no ownership check)
    orders: async (_, { customerId, status }, context) => {
      if (!context.user) {
        throw new Error("Not authenticated");
      }

      const query = {};
      // BOLA vulnerability: No validation that customerId belongs to authenticated user
      if (customerId) query.customerId = customerId;
      if (status) query.status = status;

      return await Order.find(query);
    },

    // Get single order by ID (no ownership validation)
    order: async (_, { orderId }, context) => {
      if (!context.user) {
        throw new Error("Not authenticated");
      }

      const order = await Order.findOne({ orderId });
      if (!order) {
        throw new Error("Order not found");
      }
      return order;
    },

    // Get product orders with optional filters (BOLA vulnerability)
    productOrders: async (_, { customerId, state }, context) => {
      if (!context.user) {
        throw new Error("Not authenticated");
      }

      const query = {};
      // BOLA vulnerability: No ownership validation
      if (customerId) query["relatedParty.id"] = customerId;
      if (state) query.state = state;

      return await ProductOrder.find(query);
    },

    // Get single product order by ID
    productOrder: async (_, { orderId }, context) => {
      if (!context.user) {
        throw new Error("Not authenticated");
      }

      const productOrder = await ProductOrder.findOne({ orderId });
      if (!productOrder) {
        throw new Error("Product order not found");
      }
      return productOrder;
    },
  },

  Mutation: {
    // Register a new user
    register: async (_, { input }) => {
      const { username, email } = input;

      // Check if user already exists
      const existingUser = await User.findOne({ $or: [{ username }, { email }] });
      if (existingUser) {
        throw new Error("User with this username or email already exists");
      }

      // Mass assignment vulnerability: Accept all fields from input including isAdmin
      const newUser = new User(input);
      await newUser.save();

      return {
        message: "User registered successfully",
        user: newUser,
      };
    },

    // Login user
    login: async (_, { input }) => {
      const { username, password } = input;

      // Vulnerable: plaintext password comparison
      const user = await User.findOne({ username, password });
      if (!user) {
        throw new Error("Invalid credentials");
      }

      const token = generateToken(user);

      return {
        token,
        user,
        message: "Login successful",
      };
    },

    // Delete user by username (BFLA vulnerability)
    deleteUser: async (_, { username }, context) => {
      if (!context.user) {
        throw new Error("Not authenticated");
      }

      const user = await User.findOne({ username });
      if (!user) {
        throw new Error("User not found");
      }

      // BFLA vulnerability: No check that only admin or the user themselves can delete
      // Commented out the proper authorization check:
      // if (context.user.username !== username && !context.user.isAdmin) {
      //   throw new Error("Forbidden: You are not authorized to delete this user");
      // }

      await User.deleteOne({ username });

      return {
        message: "User deleted successfully",
        success: true,
      };
    },

    // Create a new order
    createOrder: async (_, { input }, context) => {
      if (!context.user) {
        throw new Error("Not authenticated");
      }

      const { productId, quantity, customerId } = input;

      if (!productId || !quantity || !customerId) {
        throw new Error("Missing required fields: productId, quantity, or customerId");
      }

      const newOrder = new Order({
        productId,
        quantity,
        customerId,
        status: "processing",
      });

      await newOrder.save();
      return newOrder;
    },

    // Update order (Mass Assignment vulnerability)
    updateOrder: async (_, { orderId, input }, context) => {
      if (!context.user) {
        throw new Error("Not authenticated");
      }

      // Mass Assignment vulnerability: No restriction on which fields can be updated
      // User can modify status, orderDate, etc.
      const updatedOrder = await Order.findOneAndUpdate(
        { orderId },
        { $set: input },
        { new: true }
      );

      if (!updatedOrder) {
        throw new Error("Order not found");
      }

      return updatedOrder;
    },

    // Cancel/delete order
    cancelOrder: async (_, { orderId }, context) => {
      if (!context.user) {
        throw new Error("Not authenticated");
      }

      const order = await Order.findOneAndDelete({ orderId });
      if (!order) {
        throw new Error("Order not found");
      }

      return {
        message: "Order canceled successfully",
        success: true,
      };
    },

    // Create product order
    createProductOrder: async (_, { input }, context) => {
      if (!context.user) {
        throw new Error("Not authenticated");
      }

      if (!input.productOrderItem || input.productOrderItem.length === 0) {
        throw new Error("Missing required field: productOrderItem");
      }

      const newProductOrder = new ProductOrder({
        state: input.state || "acknowledged",
        requestedStartDate: input.requestedStartDate,
        requestedCompletionDate: input.requestedCompletionDate,
        description: input.description,
        priority: input.priority || "4",
        category: input.category,
        relatedParty: input.relatedParty,
        productOrderItem: input.productOrderItem,
        orderTotalPrice: input.orderTotalPrice,
        billingAccount: input.billingAccount,
        note: input.note,
      });

      await newProductOrder.save();
      return newProductOrder;
    },

    // Update product order (Mass Assignment vulnerability)
    updateProductOrder: async (_, { orderId, input }, context) => {
      if (!context.user) {
        throw new Error("Not authenticated");
      }

      // Mass Assignment vulnerability: No restriction on fields being updated
      const updatedProductOrder = await ProductOrder.findOneAndUpdate(
        { orderId },
        { $set: input },
        { new: true }
      );

      if (!updatedProductOrder) {
        throw new Error("Product order not found");
      }

      return updatedProductOrder;
    },

    // Delete product order
    deleteProductOrder: async (_, { orderId }, context) => {
      if (!context.user) {
        throw new Error("Not authenticated");
      }

      const productOrder = await ProductOrder.findOneAndDelete({ orderId });
      if (!productOrder) {
        throw new Error("Product order not found");
      }

      return {
        message: "Product order canceled successfully",
        success: true,
      };
    },

    // Trigger webhook (SSRF vulnerability)
    triggerWebhook: async (_, { url }) => {
      try {
        // SSRF vulnerability: No validation of the URL
        const response = await fetch(url);
        const data = await response.text();

        return {
          message: "Fetched external data",
          data,
        };
      } catch (err) {
        throw new Error("Request failed: " + err.message);
      }
    },
  },
};

module.exports = resolvers;
