
const HOUR = 60 * 60 * 1000;

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

export function getCompletedTodayCount(tasks) {
  const todayStr = new Date().toDateString();
  return tasks.filter(
    t => t.status === 'completed' && new Date(t.updatedAt).toDateString() === todayStr
  ).length;
}
