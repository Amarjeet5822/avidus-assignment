import mongoose from "mongoose";
import historyPlugin from "../utils/historyPlugin.js";

const taskSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },

    is_completed: {
      type: Boolean,
      default: false,
    },

    user_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
      onDelete: "CASCADE",
    },
    data: {
      type: Buffer,
      default: null,
    },
    content_type: {
      type: String,
      default: null,
    },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

taskSchema.plugin(historyPlugin, { entityType: "Task" });

const Task = mongoose.model("Task", taskSchema);
export default Task;