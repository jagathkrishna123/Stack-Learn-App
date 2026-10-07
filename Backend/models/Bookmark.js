import mongoose from "mongoose";

const bookmarkSchema = new mongoose.Schema(
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
  },
  {
    timestamps: true,
  }
);

// Prevent duplicate bookmarks
bookmarkSchema.index(
  { internId: 1, topicId: 1 },
  { unique: true }
);

const Bookmark = mongoose.model("Bookmark", bookmarkSchema);

export default Bookmark;