/**
 * Shared Authentication Middleware
 *
 * Exports two authentication functions from one shared core:
 *
 *  - restAuthenticate: Express middleware (req, res, next) — used by the REST API.
 *    Returns HTTP 401/500 on failure, calls next() on success, attaches user to req.user.
 *
 *  - graphqlAuthenticate: Context function (req) → user|null — used by the GraphQL API.
 *    Returns the user object or null; resolvers decide what to do with unauthenticated requests.
 *
 * INTENTIONALLY VULNERABLE: JWT signature is NOT verified — tokens are decoded only.
 * This demonstrates a JWT token manipulation vulnerability for security education purposes.
 */

const User = require("../models/User");

// ─── Shared Core: decode token and look up user ──────────────────────────────

const decodeAndFetchUser = async (token) => {
  // Vulnerable JWT decoding — NO SIGNATURE VERIFICATION (intentional)
  const payloadBase64 = token.split(".")[1];
  const payloadJSON = Buffer.from(payloadBase64, "base64").toString("utf8");
  const payload = JSON.parse(payloadJSON);

  const customerId = payload.customerId;
  if (!customerId) return null;

  const user = await User.findOne({ customerId });
  return user || null;
};

// ─── REST API: Express middleware ─────────────────────────────────────────────

const restAuthenticate = async (req, res, next) => {
  const authHeader = req.headers["authorization"];
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ error: "Unauthorized: Missing or invalid token" });
  }

  const token = authHeader.split(" ")[1];

  try {
    const user = await decodeAndFetchUser(token);
    if (!user) {
      return res.status(401).json({ error: "Unauthorized: User not found or no customerId in token" });
    }
    req.user = user;
    next();
  } catch (err) {
    console.error("Error in REST authentication middleware:", err.message);
    return res.status(500).json({ error: "Internal server error" });
  }
};

// ─── GraphQL API: Context function ───────────────────────────────────────────

const graphqlAuthenticate = async (req) => {
  const authHeader = req.headers.authorization || "";
  if (!authHeader.startsWith("Bearer ")) {
    return null;
  }

  const token = authHeader.split(" ")[1];

  try {
    const user = await decodeAndFetchUser(token);
    return user;
  } catch (err) {
    console.error("Error in GraphQL authentication:", err.message);
    return null;
  }
};

module.exports = { restAuthenticate, graphqlAuthenticate };
