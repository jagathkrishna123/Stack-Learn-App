import express from "express";
import {
  createNote,
  getAllNotes,
  getNoteByTopic,
  getSingleNote,
  updateNote,
  deleteNote,
} from "../controllers/noteController.js";

import { protect } from "../middlewares/authMiddleware.js";
import { authorize } from "../middlewares/roleMiddleware.js";

const router = express.Router();

/*
====================================
            NOTE ROUTES
====================================
*/

/*
    Create Note
    POST /api/notes
*/
router.post(
  "/",
  protect,
  authorize("admin"),
  createNote
);

/*
    Get All Notes
    GET /api/notes
*/
router.get(
  "/",
  protect,
  getAllNotes
);

/*
    Get Note By Topic
    GET /api/notes/topic/:topicId
*/
router.get(
  "/topic/:topicId",
  protect,
  getNoteByTopic
);

/*
    Get Single Note
    GET /api/notes/:id
*/
router.get(
  "/:id",
  protect,
  getSingleNote
);

/*
    Update Note
    PUT /api/notes/:id
*/
router.put(
  "/:id",
  protect,
  authorize("admin"),
  updateNote
);

/*
    Delete Note
    DELETE /api/notes/:id
*/
router.delete(
  "/:id",
  protect,
  authorize("admin"),
  deleteNote
);

export default router;