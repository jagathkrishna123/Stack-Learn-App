import mongoose from "mongoose";

const commentSchema = new mongoose.Schema(
  {
    topicId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Topic",
      required: [true, "Topic is required"],
    },

    internId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Intern",
      required: [true, "Intern is required"],
    },

    comment: {
      type: String,
      required: [true, "Comment is required"],
      trim: true,
    },

    adminReply: {
      type: String,
      default: "",
      trim: true,
    },

    repliedAt: {
      type: Date,
      default: null,
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

const Comment = mongoose.model("Comment", commentSchema);

export default Comment;