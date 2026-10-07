import Progress from "../models/Progress.js";
import Topic from "../models/Topic.js";

/*
====================================
        MARK TOPIC COMPLETE
====================================
*/

export const markTopicComplete = async (req, res) => {
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

    let progress = await Progress.findOne({
      internId: req.user.id,
      topicId,
    });

    if (progress) {
      progress.completed = true;
      progress.completedAt = new Date();

      await progress.save();
    } else {
      progress = await Progress.create({
        internId: req.user.id,
        topicId,
        completed: true,
        completedAt: new Date(),
      });
    }

    res.status(200).json({
      success: true,
      message: "Topic marked as completed.",
      progress,
    });
  } catch (error) {
    console.error("Mark Topic Complete Error:", error);

    res.status(500).json({
      success: false,
      message: "Server Error.",
    });
  }
};

/*
====================================
      MARK TOPIC INCOMPLETE
====================================
*/

export const markTopicIncomplete = async (req, res) => {
  try {
    const { topicId } = req.body;

    const progress = await Progress.findOne({
      internId: req.user.id,
      topicId,
    });

    if (!progress) {
      return res.status(404).json({
        success: false,
        message: "Progress not found.",
      });
    }

    progress.completed = false;
    progress.completedAt = null;

    await progress.save();

    res.status(200).json({
      success: true,
      message: "Topic marked as incomplete.",
      progress,
    });
  } catch (error) {
    console.error("Mark Topic Incomplete Error:", error);

    res.status(500).json({
      success: false,
      message: "Server Error.",
    });
  }
};

/*
====================================
     GET INTERN PROGRESS
====================================
*/

export const getInternProgress = async (req, res) => {
  try {
    const progress = await Progress.find({
      internId: req.user.id,
    }).populate({
      path: "topicId",
      select: "title moduleId",
    });

    res.status(200).json({
      success: true,
      count: progress.length,
      progress,
    });
  } catch (error) {
    console.error("Get Progress Error:", error);

    res.status(500).json({
      success: false,
      message: "Server Error.",
    });
  }
};

/*
====================================
    GET SINGLE TOPIC PROGRESS
====================================
*/

export const getTopicProgress = async (req, res) => {
  try {
    const progress = await Progress.findOne({
      internId: req.user.id,
      topicId: req.params.topicId,
    });

    if (!progress) {
      return res.status(404).json({
        success: false,
        message: "Progress not found.",
      });
    }

    res.status(200).json({
      success: true,
      progress,
    });
  } catch (error) {
    console.error("Get Topic Progress Error:", error);

    res.status(500).json({
      success: false,
      message: "Server Error.",
    });
  }
};

/*
====================================
      GET PROGRESS SUMMARY
====================================
*/

export const getProgressSummary = async (req, res) => {
  try {
    const totalTopics = await Topic.countDocuments({
      status: true,
    });

    const completedTopics = await Progress.countDocuments({
      internId: req.user.id,
      completed: true,
    });

    const percentage =
      totalTopics === 0
        ? 0
        : Number(
            ((completedTopics / totalTopics) * 100).toFixed(2)
          );

    res.status(200).json({
      success: true,
      summary: {
        totalTopics,
        completedTopics,
        pendingTopics: totalTopics - completedTopics,
        percentage,
      },
    });
  } catch (error) {
    console.error("Progress Summary Error:", error);

    res.status(500).json({
      success: false,
      message: "Server Error.",
    });
  }
};

/*
====================================
      ADMIN VIEW PROGRESS
====================================
*/

export const getInternProgressById = async (req, res) => {
  try {
    const progress = await Progress.find({
      internId: req.params.internId,
    })
      .populate("internId", "name email")
      .populate("topicId", "title");

    res.status(200).json({
      success: true,
      count: progress.length,
      progress,
    });
  } catch (error) {
    console.error("Admin Progress Error:", error);

    res.status(500).json({
      success: false,
      message: "Server Error.",
    });
  }
};