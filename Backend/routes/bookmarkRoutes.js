import express from "express";
import {
  addBookmark,
  getBookmarks,
  getBookmark,
  removeBookmark,
  removeBookmarkByTopic,
  checkBookmark,
} from "../controllers/bookmarkController.js";

import { protect } from "../middlewares/authMiddleware.js";
import { authorize } from "../middlewares/roleMiddleware.js";

const router = express.Router();

/*
====================================
          BOOKMARK ROUTES
====================================
*/

/*
    Add Bookmark
    POST /api/bookmarks
*/
router.post(
  "/",
  protect,
  authorize("intern"),
  addBookmark
);

/*
    Get All Bookmarks
    GET /api/bookmarks
*/
router.get(
  "/",
  protect,
  authorize("intern"),
  getBookmarks
);

/*
    Check Bookmark
    GET /api/bookmarks/check/:topicId
*/
router.get(
  "/check/:topicId",
  protect,
  authorize("intern"),
  checkBookmark
);

/*
    Get Single Bookmark
    GET /api/bookmarks/:id
*/
router.get(
  "/:id",
  protect,
  authorize("intern"),
  getBookmark
);

/*
    Remove Bookmark By Topic
    DELETE /api/bookmarks/topic/:topicId
*/
router.delete(
  "/topic/:topicId",
  protect,
  authorize("intern"),
  removeBookmarkByTopic
);

/*
    Remove Bookmark By Bookmark ID
    DELETE /api/bookmarks/:id
*/
router.delete(
  "/:id",
  protect,
  authorize("intern"),
  removeBookmark
);

export default router;