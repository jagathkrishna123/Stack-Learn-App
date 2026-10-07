import Bookmark from "../models/Bookmark.js";
import Topic from "../models/Topic.js";

/*
====================================
        ADD BOOKMARK
====================================
*/

export const addBookmark = async (req, res) => {
  try {
    const { topicId } = req.body;

    if (!topicId) {
      return res.status(400).json({
        success: false,
        message: "Topic is required.",
      });
    }

    const topic = await Topic.findById(topicId);

    if (!topic) {
      return res.status(404).json({
        success: false,
        message: "Topic not found.",
      });
    }

    const existingBookmark = await Bookmark.findOne({
      internId: req.user.id,
      topicId,
    });

    if (existingBookmark) {
      return res.status(400).json({
        success: false,
        message: "Topic already bookmarked.",
      });
    }

    const bookmark = await Bookmark.create({
      internId: req.user.id,
      topicId,
    });

    res.status(201).json({
      success: true,
      message: "Bookmark added successfully.",
      bookmark,
    });
  } catch (error) {
    console.error("Add Bookmark Error:", error);

    res.status(500).json({
      success: false,
      message: "Server Error.",
    });
  }
};

/*
====================================
      GET ALL BOOKMARKS
====================================
*/

export const getBookmarks = async (req, res) => {
  try {
    const bookmarks = await Bookmark.find({
      internId: req.user.id,
    })
      .populate({
        path: "topicId",
        select: "title description difficulty readingTime",
        populate: {
          path: "moduleId",
          select: "title",
        },
      })
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: bookmarks.length,
      bookmarks,
    });
  } catch (error) {
    console.error("Get Bookmarks Error:", error);

    res.status(500).json({
      success: false,
      message: "Server Error.",
    });
  }
};

/*
====================================
      GET SINGLE BOOKMARK
====================================
*/

export const getBookmark = async (req, res) => {
  try {
    const bookmark = await Bookmark.findById(req.params.id)
      .populate({
        path: "topicId",
        populate: {
          path: "moduleId",
          select: "title",
        },
      });

    if (!bookmark) {
      return res.status(404).json({
        success: false,
        message: "Bookmark not found.",
      });
    }

    res.status(200).json({
      success: true,
      bookmark,
    });
  } catch (error) {
    console.error("Get Bookmark Error:", error);

    res.status(500).json({
      success: false,
      message: "Server Error.",
    });
  }
};

/*
====================================
      REMOVE BOOKMARK
====================================
*/

export const removeBookmark = async (req, res) => {
  try {
    const bookmark = await Bookmark.findById(req.params.id);

    if (!bookmark) {
      return res.status(404).json({
        success: false,
        message: "Bookmark not found.",
      });
    }

    if (bookmark.internId.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: "Unauthorized.",
      });
    }

    await bookmark.deleteOne();

    res.status(200).json({
      success: true,
      message: "Bookmark removed successfully.",
    });
  } catch (error) {
    console.error("Remove Bookmark Error:", error);

    res.status(500).json({
      success: false,
      message: "Server Error.",
    });
  }
};

/*
====================================
      REMOVE BY TOPIC
====================================
*/

export const removeBookmarkByTopic = async (req, res) => {
  try {
    const { topicId } = req.params;

    const bookmark = await Bookmark.findOne({
      internId: req.user.id,
      topicId,
    });

    if (!bookmark) {
      return res.status(404).json({
        success: false,
        message: "Bookmark not found.",
      });
    }

    await bookmark.deleteOne();

    res.status(200).json({
      success: true,
      message: "Bookmark removed successfully.",
    });
  } catch (error) {
    console.error("Remove Bookmark Error:", error);

    res.status(500).json({
      success: false,
      message: "Server Error.",
    });
  }
};

/*
====================================
      CHECK BOOKMARK
====================================
*/

export const checkBookmark = async (req, res) => {
  try {
    const { topicId } = req.params;

    const bookmark = await Bookmark.findOne({
      internId: req.user.id,
      topicId,
    });

    res.status(200).json({
      success: true,
      bookmarked: !!bookmark,
    });
  } catch (error) {
    console.error("Check Bookmark Error:", error);

    res.status(500).json({
      success: false,
      message: "Server Error.",
    });
  }
};