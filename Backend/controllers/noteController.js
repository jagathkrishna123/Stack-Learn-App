import Note from "../models/Note.js";
import Topic from "../models/Topic.js";

/*
====================================
        CREATE NOTE
====================================
*/

export const createNote = async (req, res) => {
  try {
    const { topicId, content } = req.body;

    if (!topicId || !content) {
      return res.status(400).json({
        success: false,
        message: "Topic and Content are required.",
      });
    }

    const topic = await Topic.findById(topicId);

    if (!topic) {
      return res.status(404).json({
        success: false,
        message: "Topic not found.",
      });
    }

    const existingNote = await Note.findOne({ topicId });

    if (existingNote) {
      return res.status(400).json({
        success: false,
        message: "A note already exists for this topic.",
      });
    }

    const note = await Note.create({
      topicId,
      content,
      createdBy: req.user.id,
      lastUpdatedBy: req.user.id,
    });

    res.status(201).json({
      success: true,
      message: "Note created successfully.",
      note,
    });
  } catch (error) {
    console.error("Create Note Error:", error);

    res.status(500).json({
      success: false,
      message: "Server Error.",
    });
  }
};

/*
====================================
        GET ALL NOTES
====================================
*/

export const getAllNotes = async (req, res) => {
  try {
    const notes = await Note.find()
      .populate("topicId", "title")
      .populate("createdBy", "name")
      .populate("lastUpdatedBy", "name")
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: notes.length,
      notes,
    });
  } catch (error) {
    console.error("Get Notes Error:", error);

    res.status(500).json({
      success: false,
      message: "Server Error.",
    });
  }
};

/*
====================================
        GET NOTE BY TOPIC
====================================
*/

export const getNoteByTopic = async (req, res) => {
  try {
    const note = await Note.findOne({
      topicId: req.params.topicId,
    })
      .populate("topicId", "title")
      .populate("createdBy", "name")
      .populate("lastUpdatedBy", "name");

    if (!note) {
      return res.status(404).json({
        success: false,
        message: "Note not found.",
      });
    }

    res.status(200).json({
      success: true,
      note,
    });
  } catch (error) {
    console.error("Get Note Error:", error);

    res.status(500).json({
      success: false,
      message: "Server Error.",
    });
  }
};

/*
====================================
        GET SINGLE NOTE
====================================
*/

export const getSingleNote = async (req, res) => {
  try {
    const note = await Note.findById(req.params.id)
      .populate("topicId", "title")
      .populate("createdBy", "name")
      .populate("lastUpdatedBy", "name");

    if (!note) {
      return res.status(404).json({
        success: false,
        message: "Note not found.",
      });
    }

    res.status(200).json({
      success: true,
      note,
    });
  } catch (error) {
    console.error("Get Single Note Error:", error);

    res.status(500).json({
      success: false,
      message: "Server Error.",
    });
  }
};

/*
====================================
        UPDATE NOTE
====================================
*/

export const updateNote = async (req, res) => {
  try {
    const { content, status } = req.body;

    const note = await Note.findById(req.params.id);

    if (!note) {
      return res.status(404).json({
        success: false,
        message: "Note not found.",
      });
    }

    if (content) {
      note.content = content;
    }

    if (typeof status === "boolean") {
      note.status = status;
    }

    note.lastUpdatedBy = req.user.id;
    note.version += 1;

    await note.save();

    res.status(200).json({
      success: true,
      message: "Note updated successfully.",
      note,
    });
  } catch (error) {
    console.error("Update Note Error:", error);

    res.status(500).json({
      success: false,
      message: "Server Error.",
    });
  }
};

/*
====================================
        DELETE NOTE
====================================
*/

export const deleteNote = async (req, res) => {
  try {
    const note = await Note.findById(req.params.id);

    if (!note) {
      return res.status(404).json({
        success: false,
        message: "Note not found.",
      });
    }

    await note.deleteOne();

    res.status(200).json({
      success: true,
      message: "Note deleted successfully.",
    });
  } catch (error) {
    console.error("Delete Note Error:", error);

    res.status(500).json({
      success: false,
      message: "Server Error.",
    });
  }
};