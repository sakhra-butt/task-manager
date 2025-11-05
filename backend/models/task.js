import mongoose from "mongoose";

const taskSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    title: {
      type: String,
      required: [true, "Please enter task title"],
    },
    description: {
      type: String,
    },
    dueDate: {
      type: Date,
    },
    status: {
      type: String,
      enum: ["pending", "completed", "incomplete"],
      default: "pending",
    },
    priority: {
      type: String,
      enum: ["high", "medium", "low"],
      default: "medium",
    },
  },
  {
    timestamps: true,
  }
);

// Avoiding  model overwrite error
const Task = mongoose.models.Task || mongoose.model("Task", taskSchema);

export default Task;
