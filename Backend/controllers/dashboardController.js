import Stack from "../models/Stack.js";
import Module from "../models/Module.js";
import Topic from "../models/Topic.js";
import Note from "../models/Note.js";
import Intern from "../models/Intern.js";
import Progress from "../models/Progress.js";

/*
====================================
        ADMIN DASHBOARD
====================================
*/

export const adminDashboard = async (req, res) => {
  try {
    const [
      totalStacks,
      totalModules,
      totalTopics,
      totalNotes,
      totalInterns,
      activeInterns,
      completedTopics,
      recentStacks,
      recentInterns,
    ] = await Promise.all([
      Stack.countDocuments(),
      Module.countDocuments(),
      Topic.countDocuments(),
      Note.countDocuments(),
      Intern.countDocuments(),
      Intern.countDocuments({ isActive: true }),
      Progress.countDocuments({ completed: true }),
      Stack.find().sort({ createdAt: -1 }).limit(5),
      Intern.find()
        .select("-password")
        .populate("assignedStack", "name")
        .sort({ createdAt: -1 })
        .limit(5),
    ]);

    const stacksWithCounts = await Promise.all(
      recentStacks.map(async (stack) => {
        const modulesCount = await Module.countDocuments({
          stackId: stack._id,
        });

        const internsCount = await Intern.countDocuments({
          assignedStack: stack._id,
        });

        return {
          ...stack.toObject(),
          modulesCount,
          internsCount,
        };
      })
    );

    res.status(200).json({
      success: true,
      dashboard: {
        statistics: {
          totalStacks,
          totalModules,
          totalTopics,
          totalNotes,
          totalInterns,
          activeInterns,
          completedTopics,
        },

        recentStacks: stacksWithCounts,

        recentInterns,
      },
    });
  } catch (error) {
    console.error("Admin Dashboard Error:", error);

    res.status(500).json({
      success: false,
      message: "Server Error",
    });
  }
};

/*
====================================
        INTERN DASHBOARD
====================================
*/

export const internDashboard = async (req, res) => {
  try {
    const intern = await Intern.findById(req.user.id)
      .populate("assignedStack");

    if (!intern) {
      return res.status(404).json({
        success: false,
        message: "Intern not found.",
      });
    }

    const modules = await Module.find({
      stackId: intern.assignedStack._id,
    });

    const moduleIds = modules.map((module) => module._id);

    const topics = await Topic.find({
      moduleId: { $in: moduleIds },
    });

    const topicIds = topics.map((topic) => topic._id);

    const completedTopics = await Progress.countDocuments({
      internId: intern._id,
      completed: true,
      topicId: { $in: topicIds },
    });

    const totalTopics = topics.length;

    const percentage =
      totalTopics === 0
        ? 0
        : Number(
          ((completedTopics / totalTopics) * 100).toFixed(2)
        );

    const recentProgress = await Progress.find({
      internId: intern._id,
      completed: true,
    })
      .populate({
        path: "topicId",
        select: "title",
      })
      .sort({ updatedAt: -1 })
      .limit(5);

    res.status(200).json({
      success: true,
      dashboard: {
        intern: {
          id: intern._id,
          name: intern.name,
          email: intern.email,
        },

        assignedStack: intern.assignedStack,

        statistics: {
          totalModules: modules.length,
          totalTopics,
          completedTopics,
          pendingTopics:
            totalTopics - completedTopics,
          completionPercentage: percentage,
        },

        recentProgress,
      },
    });
  } catch (error) {
    console.error("Intern Dashboard Error:", error);

    res.status(500).json({
      success: false,
      message: "Server Error",
    });
  }
};