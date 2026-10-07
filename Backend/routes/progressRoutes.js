import express from "express";
import {
  markTopicComplete,
  markTopicIncomplete,
  getInternProgress,
  getTopicProgress,
  getProgressSummary,
  getInternProgressById,
} from "../controllers/progressController.js";

import { protect } from "../middlewares/authMiddleware.js";
import { authorize } from "../middlewares/roleMiddleware.js";

const router = express.Router();

/*
====================================
          PROGRESS ROUTES
====================================
*/

/*
    Mark Topic as Complete
    POST /api/progress/complete
*/
router.post(
  "/complete",
  protect,
  authorize("intern"),
  markTopicComplete
);

/*
    Mark Topic as Incomplete
    POST /api/progress/incomplete
*/
router.post(
  "/incomplete",
  protect,
  authorize("intern"),
  markTopicIncomplete
);

/*
    Get Logged-in Intern Progress
    GET /api/progress
*/
router.get(
  "/",
  protect,
  authorize("intern"),
  getInternProgress
);

/*
    Get Logged-in Intern Progress for a Topic
    GET /api/progress/topic/:topicId
*/
router.get(
  "/topic/:topicId",
  protect,
  authorize("intern"),
  getTopicProgress
);

/*
    Get Progress Summary
    GET /api/progress/summary
*/
router.get(
  "/summary",
  protect,
  authorize("intern"),
  getProgressSummary
);

/*
    Admin - View Any Intern Progress
    GET /api/progress/intern/:internId
*/
router.get(
  "/intern/:internId",
  protect,
  authorize("admin"),
  getInternProgressById
);

export default router;