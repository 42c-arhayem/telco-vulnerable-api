const express = require("express");
const router = express.Router();

router.get("/env", (req, res) => {
  res.json(process.env); // Leaks secrets
});

module.exports = router;