import Task from "../models/task.models.js";
import AppError from "../utils/AppError.js";

const createTask = async (req, res, next) => {
  try {
    const { name, is_completed } = req.body;
    const { userId } = req.user;

    if (!name) {
      return next(new AppError(400, "Task name is required"));
    }

    const newTask = new Task({
      name,
      is_completed: is_completed || false,
      user_id: userId,
    });

    await newTask.save();
    res.status(201).json({ message: "Task created successfully", task: newTask });
  } catch (error) {
    next(new AppError(500, error.message));
  }
};

const getTasks = async (req, res, next) => {
  try {
    const { userId, role } = req.user;

    const filter = role === "Admin" ? {} : { user_id: userId };

    const tasks = await Task.find(filter).populate("user_id", "first_name last_name email").sort({ updatedAt: -1 });
    res.status(200).json(tasks);
  } catch (error) {
    next(new AppError(500, error.message));
  }
};

const getTaskById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { userId, role } = req.user;

    const task = await Task.findById(id);

    if (!task) {
      return next(new AppError(404, "Task not found"));
    }

    if (role !== "Admin" && task.user_id.toString() !== userId) {
      return next(new AppError(403, "You are not authorized to access this task"));
    }

    res.status(200).json(task);
  } catch (error) {
    next(new AppError(500, error.message));
  }
};

const updateTask = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { name, is_completed } = req.body;
    const { userId, role } = req.user;

    const task = await Task.findById(id);

    if (!task) {
      return next(new AppError(404, "Task not found"));
    }

    if (role !== "Admin" && task.user_id.toString() !== userId) {
      return next(new AppError(403, "You are not authorized to update this task"));
    }

    const updatedTask = await Task.findByIdAndUpdate(
      id,
      { name, is_completed },
      { new: true, runValidators: true }
    );

    res.status(200).json({ message: "Task updated successfully", task: updatedTask });
  } catch (error) {
    next(new AppError(500, error.message));
  }
};

const deleteTask = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { userId, role } = req.user;

    const task = await Task.findById(id);

    if (!task) {
      return next(new AppError(404, "Task not found"));
    }

    if (role !== "Admin" && task.user_id.toString() !== userId) {
      return next(new AppError(403, "You are not authorized to delete this task"));
    }
    await Task.findByIdAndDelete(id);

    res.status(200).json({ message: "Task deleted successfully" });
  } catch (error) {
    next(new AppError(500, error.message));
  }
};

export { createTask, getTasks, getTaskById, updateTask, deleteTask };
