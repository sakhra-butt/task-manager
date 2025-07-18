const express = require("express");
const { protect } = require("../middleware/authMiddleware");

const router = express.Router();

router.get("/", protect, (req, res) => {
  res.json({
    message: "You accessed a protected route!",
    user: req.user, // user info from token
  });
});

module.exports = router;
b;
