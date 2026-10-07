import mongoose from "mongoose";

const internSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Intern name is required"],
      trim: true,
    },

    email: {
      type: String,
      required: [true, "Email is required"],
      unique: true,
      lowercase: true,
      trim: true,
    },

    password: {
      type: String,
      required: [true, "Password is required"],
      minlength: 6,
      select: false,
    },

    assignedStack: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Stack",
      required: [true, "Assigned stack is required"],
    },

    role: {
      type: String,
      enum: ["intern"],
      default: "intern",
    },

    isActive: {
      type: Boolean,
      default: true,
    },

    lastLogin: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

const Intern = mongoose.model("Intern", internSchema);

export default Intern;