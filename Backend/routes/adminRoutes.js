import express from "express";
import { getAdminProfile, changeAdminPassword,} from "../controllers/adminController.js";

import { protect } from "../middlewares/authMiddleware.js";
import { authorize } from "../middlewares/roleMiddleware.js";

const router = express.Router();

/*
====================================
          ADMIN ROUTES
====================================
*/

// Get Admin Profile
router.get( "/profile", protect, authorize("admin"), getAdminProfile);

// Change Admin Password
router.put( "/change-password", protect,authorize("admin"), changeAdminPassword);

export default router;