import express from "express";
import {
  getOverviewAnalytics,
  getStackAnalytics,
  getModuleAnalytics,
  getInternAnalytics,
} from "../controllers/analyticsController.js";

import { protect } from "../middlewares/authMiddleware.js";
import { authorize } from "../middlewares/roleMiddleware.js";

const router = express.Router();

/*
====================================
        ANALYTICS ROUTES
====================================
*/

// Dashboard Overview
router.get( "/overview", protect, authorize("admin"), getOverviewAnalytics);

// Stack Analytics
router.get("/stacks", protect, authorize("admin"), getStackAnalytics);

// Module Analytics
router.get( "/modules",  protect, authorize("admin"), getModuleAnalytics);

// Intern Analytics
router.get("/interns", protect, authorize("admin"), getInternAnalytics);

export default router;