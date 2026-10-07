import mongoose from "mongoose";

const progressSchema = new mongoose.Schema(
  {
    internId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Intern",
      required: [true, "Intern is required"],
    },

    topicId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Topic",
      required: [true, "Topic is required"],
    },

    completed: {
      type: Boolean,
      default: false,
    },

    completedAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

// One progress record per intern per topic
progressSchema.index(
  { internId: 1, topicId: 1 },
  { unique: true }
);

const Progress = mongoose.model("Progress", progressSchema);

export default Progress;