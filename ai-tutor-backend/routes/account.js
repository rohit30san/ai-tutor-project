const express = require("express");
const router = express.Router();
const { User } = require("../models");
const authenticate = require("../middleware/authenticate"); // JWT middleware

// GET /api/account - return user details
router.get("/", authenticate, async (req, res) => {
  try {
    const user = await User.findByPk(req.user.id, {
      attributes: ["id", "name", "email"],
    });
    res.json(user);
  } catch (err) {
    console.error("Account fetch error:", err);
    res.status(500).json({ error: "Failed to fetch account info" });
  }
});

module.exports = router;
