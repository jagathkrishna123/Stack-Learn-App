import Stack from "../models/Stack.js";

/*
====================================
        CREATE STACK
====================================
*/

export const createStack = async (req, res) => {
  try {
    const { name, description } = req.body;

    if (!name || !description) {
      return res.status(400).json({
        success: false,
        message: "Name and Description are required.",
      });
    }

    const existingStack = await Stack.findOne({ name });

    if (existingStack) {
      return res.status(400).json({
        success: false,
        message: "Stack already exists.",
      });
    }

    const stack = await Stack.create({
      name,
      description,
      thumbnail: req.file ? req.file.filename : "",
    });

    res.status(201).json({
      success: true,
      message: "Stack created successfully.",
      stack,
    });
  } catch (error) {
    console.error("Create Stack Error:", error);

    res.status(500).json({
      success: false,
      message: "Server Error.",
    });
  }
};

/*
====================================
        GET ALL STACKS
====================================
*/

export const getAllStacks = async (req, res) => {
  try {
    const stacks = await Stack.find().sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: stacks.length,
      stacks,
    });
  } catch (error) {
    console.error("Get Stacks Error:", error);

    res.status(500).json({
      success: false,
      message: "Server Error.",
    });
  }
};

/*
====================================
        GET SINGLE STACK
====================================
*/

export const getSingleStack = async (req, res) => {
  try {
    const stack = await Stack.findById(req.params.id);

    if (!stack) {
      return res.status(404).json({
        success: false,
        message: "Stack not found.",
      });
    }

    res.status(200).json({
      success: true,
      stack,
    });
  } catch (error) {
    console.error("Get Stack Error:", error);

    res.status(500).json({
      success: false,
      message: "Server Error.",
    });
  }
};

/*
====================================
        UPDATE STACK
====================================
*/

export const updateStack = async (req, res) => {
  try {
    const { name, description, status } = req.body;

    const stack = await Stack.findById(req.params.id);

    if (!stack) {
      return res.status(404).json({
        success: false,
        message: "Stack not found.",
      });
    }

    // Check duplicate name
    if (name && name !== stack.name) {
      const existingStack = await Stack.findOne({ name });

      if (existingStack) {
        return res.status(400).json({
          success: false,
          message: "Stack name already exists.",
        });
      }

      stack.name = name;
    }

    if (description) {
      stack.description = description;
    }

    if (typeof status === "boolean") {
      stack.status = status;
    }

    if (req.file) {
      stack.thumbnail = req.file.filename;
    }

    await stack.save();

    res.status(200).json({
      success: true,
      message: "Stack updated successfully.",
      stack,
    });
  } catch (error) {
    console.error("Update Stack Error:", error);

    res.status(500).json({
      success: false,
      message: "Server Error.",
    });
  }
};

/*
====================================
        DELETE STACK
====================================
*/

export const deleteStack = async (req, res) => {
  try {
    const stack = await Stack.findById(req.params.id);

    if (!stack) {
      return res.status(404).json({
        success: false,
        message: "Stack not found.",
      });
    }

    await stack.deleteOne();

    res.status(200).json({
      success: true,
      message: "Stack deleted successfully.",
    });
  } catch (error) {
    console.error("Delete Stack Error:", error);

    res.status(500).json({
      success: false,
      message: "Server Error.",
    });
  }
};