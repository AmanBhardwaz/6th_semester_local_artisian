const express = require("express");
const { signup, login } = require("../controllers/auth.controller");
const { googleLogin } = require("../controllers/googleAuth.controller");
const { getMe, updateProfile } = require("../controllers/profile.controller");
const { protect } = require("../middleware/auth.middleware");
const { authLimiter } = require("../middleware/rateLimiter");
const upload = require("../utils/upload");

const router = express.Router();

// Strict rate limit on auth endpoints (brute-force protection)
router.post("/signup", authLimiter, signup);
router.post("/login",  authLimiter, login);
router.post("/google", authLimiter, googleLogin);

// Protected profile routes — no extra limiter (generalLimiter covers these)
router.get("/me",      protect, getMe);
router.put("/profile", protect, upload.single("profilePhoto"), updateProfile);

module.exports = router;

