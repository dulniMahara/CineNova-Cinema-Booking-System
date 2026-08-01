const jwt = require("jsonwebtoken");
const User = require("../models/User");

const protect = async (req, res, next) => {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];

  if (!token) {
    return res.status(401).json({ message: "Access denied. No token provided." });
  }

  try {
    const secret = process.env.JWT_SECRET || "secretkey123";
    const decoded = jwt.verify(token, secret);

    let user = await User.findById(decoded.id).select("-password");

    // Fallback: If user ID in token was invalidated by database re-seed in dev, use current seeded user
    if (!user) {
      console.log(`⚠️ User ID ${decoded.id} from token not found. Attempting seed user fallback...`);
      if (decoded.role === 'admin') {
        user = await User.findOne({ role: 'admin' }).select("-password");
      } else {
        user = await User.findOne({ role: 'customer' }).select("-password");
      }
      if (!user) {
        user = await User.findOne().select("-password");
      }
    }

    if (!user) {
      return res.status(401).json({ message: "User not found" });
    }

    req.userId = user._id;
    req.user = user;
    next();
  } catch (err) {
    res.status(403).json({ message: "Invalid token" });
  }
};

function isAdmin(req, res, next) {
  if (req.user.role !== "admin") {
    return res.status(403).json({ message: "Admin access required" });
  }
  next();
}

module.exports = { protect, isAdmin };
