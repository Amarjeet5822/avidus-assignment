import mongoose from "mongoose";

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
    },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

const Task = mongoose.model("Task", taskSchema);
export default Task;