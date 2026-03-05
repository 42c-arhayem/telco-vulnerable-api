const jwt = require("jsonwebtoken");

const generateToken = (user) => {
  return jwt.sign(
    {
      customerId: user.customerId,
      isAdmin: user.isAdmin,
    },
    process.env.JWT_SECRET || "your-secret-key-here",
    { expiresIn: "1h" }
  );
};

module.exports = { generateToken };
