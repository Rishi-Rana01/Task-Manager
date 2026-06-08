import express from 'express';
import {
  getTasks,
  getTaskStats,
  createTask,
  updateTask,
  deleteTask,
  bulkDeleteTasks,
  bulkUpdateTasks,
} from '../controllers/taskController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();
router.use(protect);

router.route('/').get(getTasks).post(createTask);
router.get('/stats', getTaskStats);
router.delete('/bulk', bulkDeleteTasks);
router.patch('/bulk', bulkUpdateTasks);
router.route('/:id').put(updateTask).delete(deleteTask);

export default router;