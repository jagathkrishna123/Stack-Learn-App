import mongoose from "mongoose";

const stackSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Stack name is required"],
      unique: true,
      trim: true,
    },

    description: {
      type: String,
      required: [true, "Description is required"],
      trim: true,
    },

    thumbnail: {
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

const Stack = mongoose.model("Stack", stackSchema);

export default Stack;