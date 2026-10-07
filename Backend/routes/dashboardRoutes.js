import express from "express";
import {
  adminDashboard,
  internDashboard,
} from "../controllers/dashboardController.js";

import { protect } from "../middlewares/authMiddleware.js";
import { authorize } from "../middlewares/roleMiddleware.js";

const router = express.Router();

/*
====================================
        DASHBOARD ROUTES
====================================
*/

/*
    Admin Dashboard
    GET /api/dashboard/admin
*/
router.get("/admin", protect, authorize("admin"), adminDashboard);

/*
    Intern Dashboard
    GET /api/dashboard/intern
*/
router.get("/intern", protect, authorize("intern"), internDashboard);

export default router;