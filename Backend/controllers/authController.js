import bcrypt from "bcrypt";
import Admin from "../models/Admin.js";
import Intern from "../models/Intern.js";
import { generateToken } from "../config/jwt.js";
import Stack from "../models/Stack.js";

/*
    ==========================
        ADMIN LOGIN
    ==========================
*/

export const adminLogin = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Check empty fields
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: "Email and Password are required.",
      });
    }

    // Find Admin
    const admin = await Admin.findOne({ email }).select("+password");

    if (!admin) {
      return res.status(401).json({
        success: false,
        message: "Invalid Email or Password.",
      });
    }

    // Check Active
    if (!admin.isActive) {
      return res.status(403).json({
        success: false,
        message: "Admin account is disabled.",
      });
    }

    // Compare Password
    const isMatch = await bcrypt.compare(password, admin.password);

    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: "Invalid Email or Password.",
      });
    }

    // Generate JWT
    const token = generateToken({
      id: admin._id,
      role: admin.role,
    });

    res.status(200).json({
      success: true,
      message: "Admin Login Successful.",
      token,
      admin: {
        id: admin._id,
        name: admin.name,
        email: admin.email,
        role: admin.role,
      },
    });
  } catch (error) {
    console.error("Admin Login Error:", error);

    res.status(500).json({
      success: false,
      message: "Server Error.",
    });
  }
};

/*
    ==========================
        INTERN LOGIN
    ==========================
*/

export const internLogin = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Check empty fields
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: "Email and Password are required.",
      });
    }

    // Find Intern
    const intern = await Intern.findOne({ email })
      .select("+password")
      .populate("assignedStack", "name");

    if (!intern) {
      return res.status(401).json({
        success: false,
        message: "Invalid Email or Password.",
      });
    }

    // Check Active
    if (!intern.isActive) {
      return res.status(403).json({
        success: false,
        message: "Your account has been disabled.",
      });
    }

    // Compare Password
    const isMatch = await bcrypt.compare(password, intern.password);

    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: "Invalid Email or Password.",
      });
    }

    // Update Last Login
// Update Last Login
await Intern.findByIdAndUpdate(
  intern._id,
  {
    $set: {
      lastLogin: new Date(),
    },
  },
  { new: true }
);

const updatedIntern = await Intern.findById(intern._id);
console.log(updatedIntern.lastLogin);

    // Generate JWT
    const token = generateToken({
      id: intern._id,
      role: intern.role,
    });

    res.status(200).json({
      success: true,
      message: "Intern Login Successful.",
      token,
      intern: {
        id: intern._id,
        name: intern.name,
        email: intern.email,
        role: intern.role,
        assignedStack: intern.assignedStack,
      },
    });
  } catch (error) {
    console.error("Intern Login Error:", error);

    res.status(500).json({
      success: false,
      message: "Server Error.",
    });
  }
};

/*
    ==========================
        INTERN REGISTER (SIGNUP)
    ==========================
*/

export const internRegister = async (req, res) => {
  try {
    const { name, email, password, assignedStack } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({
        success: false,
        message: "Name, email, and password are required.",
      });
    }

    const existingIntern = await Intern.findOne({ email });

    if (existingIntern) {
      return res.status(400).json({
        success: false,
        message: "Account with this email already exists.",
      });
    }

    let stackId = assignedStack;
    if (!stackId) {
      const firstStack = await Stack.findOne({ status: true });
      if (firstStack) {
        stackId = firstStack._id;
      }
    }

    if (!stackId) {
      return res.status(400).json({
        success: false,
        message: "No learning stack available. Please contact admin.",
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const intern = await Intern.create({
      name,
      email,
      password: hashedPassword,
      assignedStack: stackId,
    });

    const token = generateToken({
      id: intern._id,
      role: intern.role,
    });

    res.status(201).json({
      success: true,
      message: "Registration Successful.",
      token,
      intern: {
        id: intern._id,
        name: intern.name,
        email: intern.email,
        role: intern.role,
        assignedStack: intern.assignedStack,
      },
    });
  } catch (error) {
    console.error("Intern Register Error:", error);

    res.status(500).json({
      success: false,
      message: "Server Error during registration.",
    });
  }
};
