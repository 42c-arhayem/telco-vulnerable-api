require("dotenv").config();
const express = require("express");
const fs = require("fs");
const https = require("https");
const bodyParser = require("body-parser");

const authRoutes = require("./routes/auth");
const productOrderRoutes = require("./routes/productOrder");
const webhookRoutes = require("./routes/webhook");
const debugRoutes = require("./routes/debug");
const { connectDB } = require("./data/db");

const app = express();
const PORT = process.env.PORT || 3000;

// Connect to Database
connectDB();

// Middleware
app.use(bodyParser.json());

// Routes
app.use("/auth", authRoutes);
app.use("/productOrder", productOrderRoutes);
app.use("/webhook", webhookRoutes);
app.use("/debug", debugRoutes);

// Load SSL Certificates
const sslOptions = {
  key: fs.readFileSync("./certs/key.pem"),
  cert: fs.readFileSync("./certs/cert.pem"),
};

// Start HTTPS Server
https.createServer(sslOptions, app).listen(PORT, () => {
  console.log(`Server running on https://localhost:${PORT}`);
});