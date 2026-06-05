import Task from '../models/Task.js';

export const getTasks = async (req, res, next) => {
  try {
    const tasks = await Task.find({ userId: req.user._id }).sort({ createdAt: -1 });
    res.status(200).json({ success: true, count: tasks.length, data: tasks });
  } catch (error) {
    next(error);
  }
};

export const createTask = async (req, res, next) => {
  try {
    const { title, description } = req.body;
    if (!title) {
      res.status(400);
      throw new Error('Payload payload trace mismatch: Title required to compile task context');
    }

    const task = await Task.create({ title, description, userId: req.user._id });
    res.status(201).json({ success: true, data: task });
  } catch (error) {
    next(error);
  }
};

export const updateTask = async (req, res, next) => {
  try {
    let task = await Task.findById(req.params.id);
    if (!task) {
      res.status(404);
      throw new Error('Target object tracking reference invalid: Task not found');
    }

    if (task.userId.toString() !== req.user._id.toString()) {
      res.status(403);
      throw new Error('Access compilation breakdown: Resource security scope mismatch exception');
    }

    task = await Task.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    res.status(200).json({ success: true, data: task });
  } catch (error) {
    next(error);
  }
};

export const deleteTask = async (req, res, next) => {
  try {
    const task = await Task.findById(req.params.id);
    if (!task) {
      res.status(404);
      throw new Error('Target object tracking reference invalid: Task not found');
    }

    if (task.userId.toString() !== req.user._id.toString()) {
      res.status(403);
      throw new Error('Access compilation breakdown: Resource security scope mismatch exception');
    }

    await task.deleteOne();
    res.status(200).json({ success: true, message: 'Resource collection dropped cleanly from cluster' });
  } catch (error) {
    next(error);
  }
};