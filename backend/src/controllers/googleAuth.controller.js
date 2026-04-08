const { OAuth2Client } = require("google-auth-library");
const jwt = require("jsonwebtoken");
const User = require("../models/User");

const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

const generateToken = (user) =>
  jwt.sign(
    { id: user._id, role: user.role },
    process.env.JWT_SECRET,
    { expiresIn: "7d" }
  );

exports.googleLogin = async (req, res) => {
  const { token, role } = req.body;

  try {
    const ticket = await client.verifyIdToken({
      idToken: token,
      audience: process.env.GOOGLE_CLIENT_ID
    });

    const { email, name, sub } = ticket.getPayload();

    let user = await User.findOne({ email });

    if (!user) {
      user = await User.create({
        name,
        email,
        googleId: sub,
        authProvider: ["google"],
        role: role || "consumer" 
      });
    }

    res.json({
      token: generateToken(user),
      role: user.role
    });

  } catch (error) {
    res.status(401).json({ message: "Google login failed" });
  }
};
