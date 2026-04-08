const User = require("../models/User");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const generateToken = (user) =>
  jwt.sign(
    { id: user._id, role: user.role },
    process.env.JWT_SECRET,
    { expiresIn: "7d" }
  );

// SIGNUP (consumer / artisan)
exports.signup = async (req, res) => {
  const { name, email, password, phone, role } = req.body;

  const exists = await User.findOne({ email });
  if (exists) return res.status(400).json({ message: "User exists" });

  const hashed = await bcrypt.hash(password, 10);

  const user = await User.create({
    name,
    email,
    password: hashed,
    phone,
    role
  });

  res.json({
    token: generateToken(user),
    role: user.role
  });
};

// LOGIN (admin / artisan / consumer)
exports.login = async (req, res) => {
  const { email, password } = req.body;

  const user = await User.findOne({ email });
  if (!user) return res.status(404).json({ message: "User not found" });

  if (!user.password)
    return res.status(400).json({
      message: "Login with Google"
    });

  const match = await bcrypt.compare(password, user.password);
  if (!match) return res.status(401).json({ message: "Wrong password" });

  res.json({
    token: generateToken(user),
    role: user.role
  });
};
