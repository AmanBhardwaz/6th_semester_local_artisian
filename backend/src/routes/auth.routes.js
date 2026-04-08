const express = require("express");
const { signup, login } = require("../controllers/auth.controller");
const { googleLogin } = require("../controllers/googleAuth.controller");
const { getMe, updateProfile } = require("../controllers/profile.controller");
const { protect } = require("../middleware/auth.middleware");
const upload = require("../utils/upload");

const router = express.Router();

router.post("/signup", signup);
router.post("/login", login);
router.post("/google", googleLogin);
router.get("/me", protect, getMe);
router.put("/profile", protect, upload.single("profilePhoto"), updateProfile);

module.exports = router;
