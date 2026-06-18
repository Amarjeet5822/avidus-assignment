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
      is_completed: is_completed === 'true' || is_completed === true,
      user_id: userId,
    });

    if (req.file) {
      newTask.data = req.file.buffer;
      newTask.content_type = req.file.mimetype;
    }

    await newTask.save();
    
    // Remove data from response to avoid sending large buffers
    const taskResponse = newTask.toObject();
    delete taskResponse.data;

    res.status(201).json({ message: "Task created successfully", task: taskResponse });
  } catch (error) {
    next(new AppError(500, error.message));
  }
};

const getTasks = async (req, res, next) => {
  try {
    const { userId, role } = req.user;

    const filter = role === "Admin" ? {} : { user_id: userId };

    const tasks = await Task.find(filter)
      .select('-data')
      .populate("user_id", "first_name last_name email")
      .sort({ updatedAt: -1 });
    res.status(200).json(tasks);
  } catch (error) {
    next(new AppError(500, error.message));
  }
};

const getTaskById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { userId, role } = req.user;

    const task = await Task.findById(id).select('-data');

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

    const updateData = { name, is_completed: is_completed === 'true' || is_completed === true };
    if (req.file) {
      updateData.data = req.file.buffer;
      updateData.content_type = req.file.mimetype;
    }

    const updatedTask = await Task.findByIdAndUpdate(
      id,
      updateData,
      { new: true, runValidators: true }
    ).select('-data');

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

const getTaskImage = async (req, res, next) => {
  try {
    const { id } = req.params;
    const task = await Task.findById(id);

    if (!task || !task.data) {
      return next(new AppError(404, "Image not found"));
    }

    res.set("Content-Type", task.content_type);
    res.send(task.data);
  } catch (error) {
    next(new AppError(500, error.message));
  }
};

export { createTask, getTasks, getTaskById, updateTask, deleteTask, getTaskImage };
