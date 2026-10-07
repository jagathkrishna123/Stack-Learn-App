import mongoose from "mongoose";

const topicSchema = new mongoose.Schema(
  {
    moduleId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Module",
      required: [true, "Module is required"],
    },

    title: {
      type: String,
      required: [true, "Topic title is required"],
      trim: true,
    },

    description: {
      type: String,
      trim: true,
      default: "",
    },

    difficulty: {
      type: String,
      enum: ["Beginner", "Intermediate", "Advanced"],
      default: "Beginner",
    },

    readingTime: {
      type: String,
      default: "",
    },

    order: {
      type: Number,
      default: 1,
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

const Topic = mongoose.model("Topic", topicSchema);

export default Topic;