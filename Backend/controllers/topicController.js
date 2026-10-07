import Topic from "../models/Topic.js";
import Module from "../models/Module.js";

/*
====================================
        CREATE TOPIC
====================================
*/

export const createTopic = async (req, res) => {
  try {
    const {
      moduleId,
      title,
      description,
      difficulty,
      readingTime,
      order,
    } = req.body;

    if (!moduleId || !title) {
      return res.status(400).json({
        success: false,
        message: "Module and Title are required.",
      });
    }

    const module = await Module.findById(moduleId);

    if (!module) {
      return res.status(404).json({
        success: false,
        message: "Module not found.",
      });
    }

    const existingTopic = await Topic.findOne({
      moduleId,
      title,
    });

    if (existingTopic) {
      return res.status(400).json({
        success: false,
        message: "Topic already exists in this module.",
      });
    }

    const topic = await Topic.create({
      moduleId,
      title,
      description,
      difficulty,
      readingTime,
      order,
    });

    res.status(201).json({
      success: true,
      message: "Topic created successfully.",
      topic,
    });
  } catch (error) {
    console.error("Create Topic Error:", error);

    res.status(500).json({
      success: false,
      message: "Server Error.",
    });
  }
};

/*
====================================
        GET ALL TOPICS
====================================
*/

export const getAllTopics = async (req, res) => {
  try {
    const topics = await Topic.find()
      .populate("moduleId", "title")
      .sort({ order: 1 });

    res.status(200).json({
      success: true,
      count: topics.length,
      topics,
    });
  } catch (error) {
    console.error("Get Topics Error:", error);

    res.status(500).json({
      success: false,
      message: "Server Error.",
    });
  }
};

/*
====================================
     GET TOPICS BY MODULE
====================================
*/

export const getTopicsByModule = async (req, res) => {
  try {
    const { moduleId } = req.params;

    const topics = await Topic.find({ moduleId }).sort({ order: 1 });

    res.status(200).json({
      success: true,
      count: topics.length,
      topics,
    });
  } catch (error) {
    console.error("Get Topics By Module Error:", error);

    res.status(500).json({
      success: false,
      message: "Server Error.",
    });
  }
};

/*
====================================
        GET SINGLE TOPIC
====================================
*/

export const getSingleTopic = async (req, res) => {
  try {
    const topic = await Topic.findById(req.params.id).populate(
      "moduleId",
      "title description"
    );

    if (!topic) {
      return res.status(404).json({
        success: false,
        message: "Topic not found.",
      });
    }

    res.status(200).json({
      success: true,
      topic,
    });
  } catch (error) {
    console.error("Get Topic Error:", error);

    res.status(500).json({
      success: false,
      message: "Server Error.",
    });
  }
};

/*
====================================
        UPDATE TOPIC
====================================
*/

export const updateTopic = async (req, res) => {
  try {
    const {
      title,
      description,
      difficulty,
      readingTime,
      order,
      status,
    } = req.body;

    const topic = await Topic.findById(req.params.id);

    if (!topic) {
      return res.status(404).json({
        success: false,
        message: "Topic not found.",
      });
    }

    if (title && title !== topic.title) {
      const existingTopic = await Topic.findOne({
        moduleId: topic.moduleId,
        title,
      });

      if (existingTopic) {
        return res.status(400).json({
          success: false,
          message: "Topic title already exists in this module.",
        });
      }

      topic.title = title;
    }

    if (description !== undefined) {
      topic.description = description;
    }

    if (difficulty) {
      topic.difficulty = difficulty;
    }

    if (readingTime !== undefined) {
      topic.readingTime = readingTime;
    }

    if (order !== undefined) {
      topic.order = order;
    }

    if (typeof status === "boolean") {
      topic.status = status;
    }

    await topic.save();

    res.status(200).json({
      success: true,
      message: "Topic updated successfully.",
      topic,
    });
  } catch (error) {
    console.error("Update Topic Error:", error);

    res.status(500).json({
      success: false,
      message: "Server Error.",
    });
  }
};

/*
====================================
        DELETE TOPIC
====================================
*/

export const deleteTopic = async (req, res) => {
  try {
    const topic = await Topic.findById(req.params.id);

    if (!topic) {
      return res.status(404).json({
        success: false,
        message: "Topic not found.",
      });
    }

    await topic.deleteOne();

    res.status(200).json({
      success: true,
      message: "Topic deleted successfully.",
    });
  } catch (error) {
    console.error("Delete Topic Error:", error);

    res.status(500).json({
      success: false,
      message: "Server Error.",
    });
  }
};