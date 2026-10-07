import express from "express";
import {
  createTopic,
  getAllTopics,
  getTopicsByModule,
  getSingleTopic,
  updateTopic,
  deleteTopic,
} from "../controllers/topicController.js";

import { protect } from "../middlewares/authMiddleware.js";
import { authorize } from "../middlewares/roleMiddleware.js";

const router = express.Router();

/*
====================================
          TOPIC ROUTES
====================================
*/

/*
    Create Topic
    POST /api/topics
*/
router.post(
  "/",
  protect,
  authorize("admin"),
  createTopic
);

/*
    Get All Topics
    GET /api/topics
*/
router.get(
  "/",
  protect,
  getAllTopics
);

/*
    Get Topics By Module
    GET /api/topics/module/:moduleId
*/
router.get(
  "/module/:moduleId",
  protect,
  getTopicsByModule
);

/*
    Get Single Topic
    GET /api/topics/:id
*/
router.get(
  "/:id",
  protect,
  getSingleTopic
);

/*
    Update Topic
    PUT /api/topics/:id
*/
router.put(
  "/:id",
  protect,
  authorize("admin"),
  updateTopic
);

/*
    Delete Topic
    DELETE /api/topics/:id
*/
router.delete(
  "/:id",
  protect,
  authorize("admin"),
  deleteTopic
);

export default router;