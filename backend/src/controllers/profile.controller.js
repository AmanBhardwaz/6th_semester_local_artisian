const User = require("../models/User");
const upload = require("../utils/upload");

// GET /api/auth/me — fetch current user profile
exports.getMe = async (req, res) => {
    try {
        const user = await User.findById(req.user.id)
            .select("-password -googleId");
        if (!user) return res.status(404).json({ message: "User not found" });
        res.json(user);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

// PUT /api/auth/profile — update profile (name, phone, address)
exports.updateProfile = async (req, res) => {
    try {
        const { name, phone, street, city, state, pincode } = req.body;

        const updateData = {
            name,
            phone,
            address: { street, city, state, pincode },
        };

        // If a new profile photo was uploaded
        if (req.file) {
            updateData.profilePhoto = req.file.path || req.file.secure_url;
        }

        const user = await User.findByIdAndUpdate(
            req.user.id,
            { $set: updateData },
            { new: true, select: "-password -googleId" }
        );

        res.json({ message: "Profile updated!", user });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};
