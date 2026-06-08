import Task from '../models/Task.js';

// GET /api/tasks?page=1&limit=10&status=all&priority=all&search=
export const getTasks = async (req, res, next) => {
  try {
    const page     = Math.max(1, parseInt(req.query.page)  || 1);
    const limit    = Math.min(100, Math.max(1, parseInt(req.query.limit) || 10));
    const skip     = (page - 1) * limit;
    const status   = req.query.status;
    const priority = req.query.priority;
    const search   = req.query.search?.trim();

    // Build filter object
    const filter = { userId: req.user._id };
    if (status && status !== 'all')   filter.status   = status;
    if (priority && priority !== 'all') filter.priority = priority;
    if (search) {
      filter.$or = [
        { title:       { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
      ];
    }

    const [tasks, total] = await Promise.all([
      Task.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit),
      Task.countDocuments(filter),
    ]);

    res.status(200).json({
      success: true,
      data:    tasks,
      pagination: {
        total,
        page,
        limit,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    next(error);
  }
};

// GET /api/tasks/stats  — aggregated counts for analytics dashboard
export const getTaskStats = async (req, res, next) => {
  try {
    const userId = req.user._id;

    const [statusStats, priorityStats, recentCompleted] = await Promise.all([
      Task.aggregate([
        { $match: { userId } },
        { $group: { _id: '$status', count: { $sum: 1 } } },
      ]),
      Task.aggregate([
        { $match: { userId } },
        { $group: { _id: '$priority', count: { $sum: 1 } } },
      ]),
      // Last 7 days of completions (by updatedAt date)
      Task.aggregate([
        {
          $match: {
            userId,
            status: 'completed',
            updatedAt: { $gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) },
          },
        },
        {
          $group: {
            _id: {
              $dateToString: { format: '%Y-%m-%d', date: '$updatedAt' },
            },
            count: { $sum: 1 },
          },
        },
        { $sort: { _id: 1 } },
      ]),
    ]);

    // Today's completions
    const todayStr = new Date().toISOString().split('T')[0];
    const completedToday = recentCompleted.find(d => d._id === todayStr)?.count || 0;

    res.status(200).json({
      success: true,
      data: {
        byStatus:        statusStats,
        byPriority:      priorityStats,
        weeklyTrend:     recentCompleted,
        completedToday,
      },
    });
  } catch (error) {
    next(error);
  }
};

// POST /api/tasks
export const createTask = async (req, res, next) => {
  try {
    const { title, description, priority, dueDate } = req.body;
    if (!title?.trim()) {
      res.status(400);
      throw new Error('Task title is required');
    }

    const task = await Task.create({
      title: title.trim(),
      description: description?.trim(),
      priority: priority || 'medium',
      dueDate: dueDate || null,
      userId: req.user._id,
    });

    res.status(201).json({ success: true, data: task });
  } catch (error) {
    next(error);
  }
};

// PUT /api/tasks/:id
export const updateTask = async (req, res, next) => {
  try {
    const task = await Task.findById(req.params.id);
    if (!task) {
      res.status(404);
      throw new Error('Task not found');
    }
    if (task.userId.toString() !== req.user._id.toString()) {
      res.status(403);
      throw new Error('Not authorized to modify this task');
    }

    const updated = await Task.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

    res.status(200).json({ success: true, data: updated });
  } catch (error) {
    next(error);
  }
};

// DELETE /api/tasks/:id
export const deleteTask = async (req, res, next) => {
  try {
    const task = await Task.findById(req.params.id);
    if (!task) {
      res.status(404);
      throw new Error('Task not found');
    }
    if (task.userId.toString() !== req.user._id.toString()) {
      res.status(403);
      throw new Error('Not authorized to delete this task');
    }

    await task.deleteOne();
    res.status(200).json({ success: true, message: 'Task deleted' });
  } catch (error) {
    next(error);
  }
};

// DELETE /api/tasks/bulk  — body: { ids: [...] }
export const bulkDeleteTasks = async (req, res, next) => {
  try {
    const { ids } = req.body;
    if (!Array.isArray(ids) || ids.length === 0) {
      res.status(400);
      throw new Error('No task IDs provided');
    }

    const result = await Task.deleteMany({
      _id: { $in: ids },
      userId: req.user._id,
    });

    res.status(200).json({ success: true, deleted: result.deletedCount });
  } catch (error) {
    next(error);
  }
};

// PATCH /api/tasks/bulk  — body: { ids: [...], updates: { status, priority } }
export const bulkUpdateTasks = async (req, res, next) => {
  try {
    const { ids, updates } = req.body;
    if (!Array.isArray(ids) || ids.length === 0) {
      res.status(400);
      throw new Error('No task IDs provided');
    }

    const allowedFields = ['status', 'priority'];
    const safeUpdates = {};
    for (const key of allowedFields) {
      if (updates[key] !== undefined) safeUpdates[key] = updates[key];
    }

    await Task.updateMany(
      { _id: { $in: ids }, userId: req.user._id },
      { $set: safeUpdates }
    );

    res.status(200).json({ success: true, message: 'Tasks updated' });
  } catch (error) {
    next(error);
  }
};