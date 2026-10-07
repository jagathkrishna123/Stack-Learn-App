import Module from "../models/Module.js";
import Stack from "../models/Stack.js";

/*
====================================
        CREATE MODULE
====================================
*/

export const createModule = async (req, res) => {
  try {
    const { stackId, title, description, order, estimatedDuration } = req.body;

    if (!stackId || !title || !description) {
      return res.status(400).json({
        success: false,
        message: "Stack, Title and Description are required.",
      });
    }

    const stack = await Stack.findById(stackId);

    if (!stack) {
      return res.status(404).json({
        success: false,
        message: "Stack not found.",
      });
    }

    const existingModule = await Module.findOne({
      stackId,
      title,
    });

    if (existingModule) {
      return res.status(400).json({
        success: false,
        message: "Module already exists in this stack.",
      });
    }

    const module = await Module.create({
      stackId,
      title,
      description,
      order,
      estimatedDuration,
    });

    res.status(201).json({
      success: true,
      message: "Module created successfully.",
      module,
    });
  } catch (error) {
    console.error("Create Module Error:", error);

    res.status(500).json({
      success: false,
      message: "Server Error.",
    });
  }
};

/*
====================================
        GET ALL MODULES
====================================
*/

export const getAllModules = async (req, res) => {
  try {
    const modules = await Module.find()
      .populate("stackId", "name")
      .sort({ order: 1 });

    res.status(200).json({
      success: true,
      count: modules.length,
      modules,
    });
  } catch (error) {
    console.error("Get Modules Error:", error);

    res.status(500).json({
      success: false,
      message: "Server Error.",
    });
  }
};

/*
====================================
     GET MODULES BY STACK
====================================
*/

export const getModulesByStack = async (req, res) => {
  try {
    const { stackId } = req.params;

    const modules = await Module.find({ stackId })
      .sort({ order: 1 });

    res.status(200).json({
      success: true,
      count: modules.length,
      modules,
    });
  } catch (error) {
    console.error("Get Modules By Stack Error:", error);

    res.status(500).json({
      success: false,
      message: "Server Error.",
    });
  }
};

/*
====================================
        GET SINGLE MODULE
====================================
*/

export const getSingleModule = async (req, res) => {
  try {
    const module = await Module.findById(req.params.id).populate(
      "stackId",
      "name description"
    );

    if (!module) {
      return res.status(404).json({
        success: false,
        message: "Module not found.",
      });
    }

    res.status(200).json({
      success: true,
      module,
    });
  } catch (error) {
    console.error("Get Module Error:", error);

    res.status(500).json({
      success: false,
      message: "Server Error.",
    });
  }
};

/*
====================================
        UPDATE MODULE
====================================
*/

export const updateModule = async (req, res) => {
  try {
    const { title, description, order, estimatedDuration, status } = req.body;

    const module = await Module.findById(req.params.id);

    if (!module) {
      return res.status(404).json({
        success: false,
        message: "Module not found.",
      });
    }

    if (title && title !== module.title) {
      const existingModule = await Module.findOne({
        stackId: module.stackId,
        title,
      });

      if (existingModule) {
        return res.status(400).json({
          success: false,
          message: "Module title already exists in this stack.",
        });
      }

      module.title = title;
    }

    if (description) module.description = description;

    if (order) module.order = order;

    if (estimatedDuration)
      module.estimatedDuration = estimatedDuration;

    if (typeof status === "boolean")
      module.status = status;

    await module.save();

    res.status(200).json({
      success: true,
      message: "Module updated successfully.",
      module,
    });
  } catch (error) {
    console.error("Update Module Error:", error);

    res.status(500).json({
      success: false,
      message: "Server Error.",
    });
  }
};

/*
====================================
        DELETE MODULE
====================================
*/

export const deleteModule = async (req, res) => {
  try {
    const module = await Module.findById(req.params.id);

    if (!module) {
      return res.status(404).json({
        success: false,
        message: "Module not found.",
      });
    }

    await module.deleteOne();

    res.status(200).json({
      success: true,
      message: "Module deleted successfully.",
    });
  } catch (error) {
    console.error("Delete Module Error:", error);

    res.status(500).json({
      success: false,
      message: "Server Error.",
    });
  }
};