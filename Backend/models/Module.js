import mongoose from "mongoose";

const moduleSchema = new mongoose.Schema(
  {
    stackId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Stack",
      required: [true, "Stack is required"],
    },

    title: {
      type: String,
      required: [true, "Module title is required"],
      trim: true,
    },

    description: {
      type: String,
      required: [true, "Module description is required"],
      trim: true,
    },

    order: {
      type: Number,
      required: true,
      default: 1,
    },

    estimatedDuration: {
      type: String,
      default: "",
    },

    status: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

const Module = mongoose.model("Module", moduleSchema);

export default Module;