import express from "express";
import {
  createIntern,
  getAllInterns,
  getSingleIntern,
  updateIntern,
  resetInternPassword,
  deleteIntern,
} from "../controllers/internController.js";

import { protect } from "../middlewares/authMiddleware.js";
import { authorize } from "../middlewares/roleMiddleware.js";

const router = express.Router();

/*
====================================
          INTERN ROUTES
====================================
*/

// Create Intern
router.post(
  "/",
  protect,
  authorize("admin"),
  createIntern
);

// Get All Interns
router.get(
  "/",
  protect,
  authorize("admin"),
  getAllInterns
);

// Get Single Intern
router.get(
  "/:id",
  protect,
  authorize("admin"),
  getSingleIntern
);

// Update Intern
router.put(
  "/:id",
  protect,
  authorize("admin"),
  updateIntern
);

// Reset Intern Password
router.put(
  "/reset-password/:id",
  protect,
  authorize("admin"),
  resetInternPassword
);

// Delete Intern
router.delete(
  "/:id",
  protect,
  authorize("admin"),
  deleteIntern
);

export default router;