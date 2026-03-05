const express = require("express");
const fetch = require("node-fetch");
const router = express.Router();

router.post("/test", async (req, res) => {
  const { url } = req.body;
  try {
    const response = await fetch(url); // SSRF vulnerability
    const data = await response.text();
    res.send({ message: "Fetched external data", data });
  } catch (err) {
    res.status(500).json({ error: "Request failed" });
  }
});

module.exports = router;