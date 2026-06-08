/**
 * deadlineHelpers.js — utilities for detecting tasks due soon.
 */

const HOUR = 60 * 60 * 1000;

/**
 * Returns an array of alert objects for tasks with upcoming deadlines.
 * Ignores completed tasks and tasks without a dueDate.
 *
 * @param {Array}  tasks   — full task list
 * @param {number} now     — timestamp for "now" (default: Date.now())
 * @returns {Array} alerts — sorted by urgency (soonest first)
 */
export function getDeadlineAlerts(tasks, now = Date.now()) {
  const WINDOW = 72 * HOUR;

  const alerts = tasks
    .filter(task => task.status !== 'completed' && task.dueDate)
    .map(task => {
      const due      = new Date(task.dueDate).getTime();
      const diffMs   = due - now;
      const diffHrs  = diffMs / HOUR;
      return { task, due, diffMs, diffHrs };
    })
    .filter(({ diffMs }) => diffMs > 0 && diffMs <= WINDOW)
    .sort((a, b) => a.diffMs - b.diffMs);

  return alerts.map(({ task, diffHrs }) => ({
    task,
    urgency: diffHrs <= 24 ? 'critical' : diffHrs <= 48 ? 'warning' : 'info',
    label:
      diffHrs <= 1
        ? 'Due in less than 1 hour'
        : diffHrs <= 24
        ? `Due in ${Math.ceil(diffHrs)} hours`
        : diffHrs <= 48
        ? 'Due in ~2 days'
        : 'Due in ~3 days',
  }));
}

/**
 * Returns tasks completed today (comparing updatedAt date string).
 */
export function getCompletedTodayCount(tasks) {
  const todayStr = new Date().toDateString();
  return tasks.filter(
    t => t.status === 'completed' && new Date(t.updatedAt).toDateString() === todayStr
  ).length;
}
