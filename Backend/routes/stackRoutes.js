import express from "express";
import { createStack, getAllStacks, getSingleStack, updateStack, deleteStack,} from "../controllers/stackController.js";

import { protect } from "../middlewares/authMiddleware.js";
import { authorize } from "../middlewares/roleMiddleware.js";
import upload from "../config/multer.js";

const router = express.Router();

/*
====================================
          STACK ROUTES
====================================
*/

/*
    Create Stack
    POST /api/stacks
*/
router.post( "/", protect, authorize("admin"), upload.single("thumbnail"), createStack);

/*
    Get All Stacks
    GET /api/stacks
*/
router.get( "/", protect, getAllStacks);

/*
    Get Single Stack
    GET /api/stacks/:id
*/
router.get("/:id", protect, getSingleStack);

/*
    Update Stack
    PUT /api/stacks/:id
*/
router.put( "/:id", protect, authorize("admin"), upload.single("thumbnail"), updateStack);

/*
    Delete Stack
    DELETE /api/stacks/:id
*/
router.delete( "/:id", protect, authorize("admin"), deleteStack);

export default router;