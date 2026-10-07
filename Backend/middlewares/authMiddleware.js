import jwt from "jsonwebtoken";
import Admin from "../models/Admin.js";
import Intern from "../models/Intern.js";

export const protect = async (req, res, next) => {
  try {
    let token;

    // Get token from Authorization header
    if (
      req.headers.authorization &&
      req.headers.authorization.startsWith("Bearer ")
    ) {
      token = req.headers.authorization.split(" ")[1];
    }

    // Token not found
    if (!token) {
      return res.status(401).json({
        success: false,
        message: "Access denied. Please login first.",
      });
    }

    // Verify JWT
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    let user = null;

    // Admin
    if (decoded.role === "admin") {
      user = await Admin.findById(decoded.id).select("-password");
    }

    // Intern
    if (decoded.role === "intern") {
      user = await Intern.findById(decoded.id).select("-password");
    }

    // User not found
    if (!user) {
      return res.status(401).json({
        success: false,
        message: "User not found.",
      });
    }

    // Account disabled
    if (!user.isActive) {
      return res.status(403).json({
        success: false,
        message: "Your account has been disabled.",
      });
    }

    // Attach user to request
    req.user = {
      id: user._id.toString(),
      _id: user._id,
      name: user.name,
      email: user.email,
      role: decoded.role,
    };

    next();
  } catch (error) {
    console.error("Authentication Error:", error);

    if (error.name === "TokenExpiredError") {
      return res.status(401).json({
        success: false,
        message: "Token has expired. Please login again.",
      });
    }

    if (error.name === "JsonWebTokenError") {
      return res.status(401).json({
        success: false,
        message: "Invalid token.",
      });
    }

    return res.status(500).json({
      success: false,
      message: "Server Error.",
    });
  }
};