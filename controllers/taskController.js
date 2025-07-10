const Task = require("../models/task");

// @desc Get all tasks for logged in user
exports.getTasks = async (req, res) => {
  const tasks = await Task.find({ user: req.user.id });
  res.json(tasks);
};

// @desc Add new task
exports.createTask = async (req, res) => {
  const { title, description, dueDate } = req.body;

  const task = await Task.create({
    user: req.user.id,
    title,
    description,
    dueDate,
  });

  res.status(201).json(task);
};

// @desc Update task
exports.updateTask = async (req, res) => {
  const task = await Task.findById(req.params.id);

  if (!task || task.user.toString() !== req.user.id) {
    return res.status(404).json({ message: "Task not found or unauthorized" });
  }

  const updatedTask = await Task.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
  });

  res.json(updatedTask);
};

// @desc Delete task
exports.deleteTask = async (req, res) => {
  const task = await Task.findById(req.params.id);

  if (!task || task.user.toString() !== req.user.id) {
    return res.status(404).json({ message: "Task not found or unauthorized" });
  }

  await task.deleteOne();

  res.json({ message: "Task deleted" });
};
