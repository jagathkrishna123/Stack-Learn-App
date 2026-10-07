import express from "express";
import {
  createModule,
  getAllModules,
  getModulesByStack,
  getSingleModule,
  updateModule,
  deleteModule,
} from "../controllers/moduleController.js";

import { protect } from "../middlewares/authMiddleware.js";
import { authorize } from "../middlewares/roleMiddleware.js";

const router = express.Router();

/*
====================================
          MODULE ROUTES
====================================
*/

/*
    Create Module
    POST /api/modules
*/
router.post(
  "/",
  protect,
  authorize("admin"),
  createModule
);

/*
    Get All Modules
    GET /api/modules
*/
router.get(
  "/",
  protect,
  getAllModules
);

/*
    Get Modules By Stack
    GET /api/modules/stack/:stackId
*/
router.get(
  "/stack/:stackId",
  protect,
  getModulesByStack
);

/*
    Get Single Module
    GET /api/modules/:id
*/
router.get(
  "/:id",
  protect,
  getSingleModule
);

/*
    Update Module
    PUT /api/modules/:id
*/
router.put(
  "/:id",
  protect,
  authorize("admin"),
  updateModule
);

/*
    Delete Module
    DELETE /api/modules/:id
*/
router.delete(
  "/:id",
  protect,
  authorize("admin"),
  deleteModule
);

export default router;