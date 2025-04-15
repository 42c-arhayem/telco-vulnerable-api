const User = require("../models/User");

const authenticate = async (req, res, next) => {
  const authHeader = req.headers["authorization"];
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ error: "Unauthorized: Missing or invalid token" });
  }

  const token = authHeader.split(" ")[1];

  try {
    // Decode the JWT payload (do NOT verify signature)
    const payloadBase64 = token.split(".")[1];
    const payloadJSON = Buffer.from(payloadBase64, "base64").toString("utf8");
    const payload = JSON.parse(payloadJSON);

    // Extract the customerId from the payload
    const customerId = payload.accountId;
    if (!customerId) {
      return res.status(401).json({ error: "Unauthorized: No customerId in token payload" });
    }

    // Fetch the user from the database using the extracted customerId
    const user = await User.findById(customerId);
    if (!user) {
      return res.status(401).json({ error: "Unauthorized: User not found" });
    }

    // Attach the user to the request object
    req.user = user;
    next();
  } catch (err) {
    console.error("Error in authentication middleware:", err.message);
    return res.status(500).json({ error: "Internal server error" });
  }
};

module.exports = { authenticate };