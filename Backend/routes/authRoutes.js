import express from "express";
import {
  adminLogin,
  internLogin,
  internRegister,
} from "../controllers/authController.js";

const router = express.Router();

/*
====================================
            AUTH ROUTES
====================================
*/

// Admin Login
router.post("/admin/login", adminLogin);

// Intern Login
router.post("/intern/login", internLogin);

// Intern Register (Signup)
router.post("/intern/register", internRegister);

export default router;