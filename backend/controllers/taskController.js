import Task from "../models/task.js";

//     Get all tasks
//  GET /api/tasks
// @access  Private
export const getTasks = async (req, res) => {
  try {
    const tasks = await Task.find({ user: req.user._id });
    res.json(tasks);
  } catch (error) {
    console.error("Failed to fetch tasks:", error);
    res.status(500).json({ message: "Server Error" });
  }
};

//    Add new task
//  POST /api/tasks
// @access  Private
export const addTask = async (req, res) => {
  const { title, description, dueDate, status, priority } = req.body;

  try {
    // Prevent duplicate task titles for the same user
    const existingTask = await Task.findOne({ user: req.user._id, title });
    if (existingTask) {
      return res.status(400).json({ message: "A task with this name already exists." });
    }
    const task = new Task({
      user: req.user._id,
      title,
      description,
      dueDate,
      status,
      priority,
    });

    const saved = await task.save();
    res.status(201).json(saved);
  } catch (error) {
    console.error(" Failed to add task:", error);
    res.status(500).json({ message: "Unable to add task" });
  }
};

//    Update task
//   PUT /api/tasks/:id
// @access  Private
export const updateTask = async (req, res) => {
  try {
    const task = await Task.findOneAndUpdate(
      { _id: req.params.id, user: req.user._id },
      req.body,
      { new: true }
    );

    if (!task) return res.status(404).json({ message: "Task not found" });

    res.json(task);
  } catch (error) {
    console.error(" Failed to update task:", error);
    res.status(500).json({ message: "Unable to update task" });
  }
};

//     Delete task
//    DELETE /api/tasks/:id
// @access  Private
export const deleteTask = async (req, res) => {
  try {
    const task = await Task.findOneAndDelete({
      _id: req.params.id,
      user: req.user._id,
    });

    if (!task) return res.status(404).json({ message: "Task not found" });

    res.json({ message: "Task deleted" });
  } catch (error) {
    console.error(" Failed to delete task:", error);
    res.status(500).json({ message: "Unable to delete task" });
  }
};
