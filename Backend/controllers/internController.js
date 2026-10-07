import bcrypt from "bcrypt";
import Intern from "../models/Intern.js";
import Stack from "../models/Stack.js";

/*
====================================
        CREATE INTERN
====================================
*/

export const createIntern = async (req, res) => {
  try {
    const { name, email, password, assignedStack } = req.body;

    if (!name || !email || !password || !assignedStack) {
      return res.status(400).json({
        success: false,
        message: "All fields are required.",
      });
    }

    const existingIntern = await Intern.findOne({ email });

    if (existingIntern) {
      return res.status(400).json({
        success: false,
        message: "Intern already exists.",
      });
    }

    const stack = await Stack.findById(assignedStack);

    if (!stack) {
      return res.status(404).json({
        success: false,
        message: "Stack not found.",
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const intern = await Intern.create({
      name,
      email,
      password: hashedPassword,
      assignedStack,
    });

    res.status(201).json({
      success: true,
      message: "Intern created successfully.",
      intern,
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      success: false,
      message: "Server Error.",
    });
  }
};

/*
====================================
        GET ALL INTERNS
====================================
*/

export const getAllInterns = async (req, res) => {
  try {
const interns = await Intern.find()
  .select("-password")
  .populate("assignedStack", "name");

console.log(interns);

res.status(200).json({
  success: true,
  count: interns.length,
  interns,
});
  } catch (error) {
    console.error(error);

    res.status(500).json({
      success: false,
      message: "Server Error.",
    });
  }
};

/*
====================================
        GET SINGLE INTERN
====================================
*/

export const getSingleIntern = async (req, res) => {
  try {
    const intern = await Intern.findById(req.params.id)
      .select("-password")
      .populate("assignedStack", "name description");

    if (!intern) {
      return res.status(404).json({
        success: false,
        message: "Intern not found.",
      });
    }

    res.status(200).json({
      success: true,
      intern,
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      success: false,
      message: "Server Error.",
    });
  }
};

/*
====================================
        UPDATE INTERN
====================================
*/

export const updateIntern = async (req, res) => {
  try {
    const { name, email, assignedStack, isActive } = req.body;

    const intern = await Intern.findById(req.params.id);

    if (!intern) {
      return res.status(404).json({
        success: false,
        message: "Intern not found.",
      });
    }

    if (assignedStack) {
      const stack = await Stack.findById(assignedStack);

      if (!stack) {
        return res.status(404).json({
          success: false,
          message: "Assigned stack not found.",
        });
      }

      intern.assignedStack = assignedStack;
    }

    if (name) intern.name = name;
    if (email) intern.email = email;

    if (typeof isActive === "boolean") {
      intern.isActive = isActive;
    }

    await intern.save();

    res.status(200).json({
      success: true,
      message: "Intern updated successfully.",
      intern,
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      success: false,
      message: "Server Error.",
    });
  }
};

/*
====================================
        RESET INTERN PASSWORD
====================================
*/

export const resetInternPassword = async (req, res) => {
  try {
    const { password } = req.body;

    if (!password) {
      return res.status(400).json({
        success: false,
        message: "Password is required.",
      });
    }

    const intern = await Intern.findById(req.params.id);

    if (!intern) {
      return res.status(404).json({
        success: false,
        message: "Intern not found.",
      });
    }

    intern.password = await bcrypt.hash(password, 10);

    await intern.save();

    res.status(200).json({
      success: true,
      message: "Password reset successfully.",
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      success: false,
      message: "Server Error.",
    });
  }
};

/*
====================================
        DELETE INTERN
====================================
*/

export const deleteIntern = async (req, res) => {
  try {
    const intern = await Intern.findById(req.params.id);

    if (!intern) {
      return res.status(404).json({
        success: false,
        message: "Intern not found.",
      });
    }

    await intern.deleteOne();

    res.status(200).json({
      success: true,
      message: "Intern deleted successfully.",
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      success: false,
      message: "Server Error.",
    });
  }
};