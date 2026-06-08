import { useState, useEffect, useCallback, useMemo, useRef, lazy, Suspense } from 'react';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import axiosClient from '../api/axiosClient';
import TaskCard from '../components/TaskCard';
import TaskModal from '../components/TaskModal';
import Pagination from '../components/Pagination';
import BulkActionsBar from '../components/BulkActionsBar';
import ConfettiOverlay from '../components/ConfettiOverlay';
import { usePagination } from '../hooks/usePagination';
import { useDebounce } from '../hooks/useDebounce';
import { exportCSV, exportJSON, importJSON } from '../utils/exportImport';
import { getDeadlineAlerts, getCompletedTodayCount } from '../utils/deadlineHelpers';
import toast from 'react-hot-toast';
import {
  LogOut, Plus, Search, Layers, ClipboardList, CheckCircle, Clock,
  Sun, Moon, BarChart2, Download, Upload, ChevronDown, AlertTriangle,
  X as XIcon, Loader2,
} from 'lucide-react';

// Lazy-load analytics panel
const AnalyticsDashboard = lazy(() => import('../components/AnalyticsDashboard'));

const ITEMS_PER_PAGE = 9;

// ─── Deadline Alert Banner ────────────────────────────────────────────────
function DeadlineBanners({ tasks }) {
  const alerts = useMemo(() => getDeadlineAlerts(tasks), [tasks]);
  if (alerts.length === 0) return null;

  return (
    <div className="space-y-2 mb-6">
      {alerts.slice(0, 3).map(({ task, urgency, label }) => (
        <div
          key={task._id}
          className={`flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium border ${
            urgency === 'critical'
              ? 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800 text-red-700 dark:text-red-400'
              : urgency === 'warning'
              ? 'bg-amber-50 dark:bg-amber-900/20 border-amber-200 dark:border-amber-800 text-amber-700 dark:text-amber-400'
              : 'bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800 text-blue-700 dark:text-blue-400'
          }`}
        >
          <AlertTriangle size={15} className="shrink-0" />
          <span className="truncate font-semibold">{task.title}</span>
          <span className="ml-auto shrink-0 text-xs">{label}</span>
        </div>
      ))}
    </div>
  );
}

// ─── Stat Card ────────────────────────────────────────────────────────────
function StatCard({ icon, label, value, colorClass }) {
  return (
    <div className="bg-white dark:bg-slate-800 border border-slate-200/60 dark:border-slate-700 rounded-2xl p-5 flex items-center gap-4 shadow-sm hover:shadow-md transition-shadow">
      <div className={`w-11 h-11 rounded-xl flex items-center justify-center ${colorClass}`}>
        {icon}
      </div>
      <div>
        <p className="text-xs font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider">{label}</p>
        <h3 className="text-2xl font-bold text-slate-800 dark:text-slate-100 mt-0.5">{value}</h3>
      </div>
    </div>
  );
}

// ─── Main Dashboard ───────────────────────────────────────────────────────
export default function Dashboard() {
  const { user, logout } = useAuth();
  const { isDark, toggleTheme } = useTheme();

  // ── Task state ──────────────────────────────────────────────────────────
  const [tasks,      setTasks]      = useState([]);
  const [totalItems, setTotalItems] = useState(0);
  const [loading,    setLoading]    = useState(true);
  const [stats,      setStats]      = useState(null);

  // ── Filters ─────────────────────────────────────────────────────────────
  const [searchInput,   setSearchInput]   = useState('');
  const [statusFilter,  setStatusFilter]  = useState('all');
  const [priorityFilter,setPriorityFilter]= useState('all');
  const debouncedSearch = useDebounce(searchInput, 300);

  // ── Pagination ──────────────────────────────────────────────────────────
  const { currentPage, totalPages, setTotalPages, goTo, next, prev, reset } = usePagination(1);

  // ── UI state ─────────────────────────────────────────────────────────────
  const [isModalOpen,   setIsModalOpen]   = useState(false);
  const [editingTask,   setEditingTask]   = useState(null);
  const [showAnalytics, setShowAnalytics] = useState(false);
  const [selectedIds,   setSelectedIds]   = useState(new Set());
  const [showConfetti,  setShowConfetti]  = useState(false);
  const prevPendingRef                    = useRef(0);
  const importInputRef                    = useRef(null);

  // ── Derived values ───────────────────────────────────────────────────────
  const completedToday  = useMemo(() => getCompletedTodayCount(tasks), [tasks]);
  const totalCount      = totalItems;
  const completedCount  = useMemo(() => stats?.byStatus?.find(s => s._id === 'completed')?.count || 0, [stats]);
  const pendingCount    = useMemo(() => stats?.byStatus?.find(s => s._id === 'pending')?.count   || 0, [stats]);
  const selectionMode   = selectedIds.size > 0;

  // ─── Confetti trigger — fires when pending drops to 0 ──────────────────
  useEffect(() => {
    if (prevPendingRef.current > 0 && pendingCount === 0 && totalCount > 0) {
      setShowConfetti(true);
      toast.success('🎉 All tasks completed! Amazing work!', { duration: 4000 });
    }
    prevPendingRef.current = pendingCount;
  }, [pendingCount, totalCount]);

  // ─── Fetch tasks (server-side paginated) ─────────────────────────────────
  const fetchTasks = useCallback(async () => {
    let isMounted = true;
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page:  currentPage,
        limit: ITEMS_PER_PAGE,
        ...(statusFilter   !== 'all' && { status:   statusFilter }),
        ...(priorityFilter !== 'all' && { priority: priorityFilter }),
        ...(debouncedSearch           && { search:   debouncedSearch }),
      });

      const res = await axiosClient.get(`/tasks?${params}`);
      if (isMounted) {
        setTasks(res.data.data);
        setTotalItems(res.data.pagination.total);
        setTotalPages(res.data.pagination.pages);
      }
    } catch (err) {
      if (isMounted) {
        console.error('[Dashboard] fetchTasks error:', err);
        toast.error('Failed to load tasks. Please try again.');
      }
    } finally {
      if (isMounted) setLoading(false);
    }
    return () => { isMounted = false; };
  }, [currentPage, statusFilter, priorityFilter, debouncedSearch, setTotalPages]);

  // Re-fetch whenever relevant params change
  // eslint-disable-next-line react-hooks/set-state-in-effect
  useEffect(() => { fetchTasks(); }, [fetchTasks]);

  // Reset to page 1 when filters change
  useEffect(() => { reset(); }, [statusFilter, priorityFilter, debouncedSearch, reset]);

  // ─── Fetch analytics stats ────────────────────────────────────────────
  const fetchStats = useCallback(async () => {
    try {
      const res = await axiosClient.get('/tasks/stats');
      setStats(res.data.data);
    } catch (err) {
      console.error('[Dashboard] fetchStats error:', err);
    }
  }, []);

  // eslint-disable-next-line react-hooks/set-state-in-effect
  useEffect(() => { fetchStats(); }, [fetchStats]);

  // ─── Task CRUD ────────────────────────────────────────────────────────
  const handleModalSubmit = useCallback(async (payload) => {
    try {
      if (editingTask) {
        await axiosClient.put(`/tasks/${editingTask._id}`, payload);
        toast.success('Task updated successfully.');
      } else {
        await axiosClient.post('/tasks', payload);
        toast.success('Task created!');
      }
      fetchTasks();
      fetchStats();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to save task.');
    } finally {
      setEditingTask(null);
    }
  }, [editingTask, fetchTasks, fetchStats]);

  const handleToggleStatus = useCallback(async (task) => {
    const newStatus = task.status === 'pending' ? 'completed' : 'pending';
    try {
      await axiosClient.put(`/tasks/${task._id}`, { status: newStatus });
      fetchTasks();
      fetchStats();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to update task status.');
    }
  }, [fetchTasks, fetchStats]);

  const handleDeleteTask = useCallback(async (id) => {
    const toastId = toast.loading('Deleting task...');
    try {
      await axiosClient.delete(`/tasks/${id}`);
      toast.success('Task deleted.', { id: toastId });
      setSelectedIds(prev => { const next = new Set(prev); next.delete(id); return next; });
      fetchTasks();
      fetchStats();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to delete task.', { id: toastId });
    }
  }, [fetchTasks, fetchStats]);

  // ─── Bulk actions ─────────────────────────────────────────────────────
  const handleBulkDelete = useCallback(async () => {
    const ids = [...selectedIds];
    if (ids.length === 0) return;
    const toastId = toast.loading(`Deleting ${ids.length} task${ids.length > 1 ? 's' : ''}...`);
    try {
      await axiosClient.delete('/tasks/bulk', { data: { ids } });
      toast.success(`Deleted ${ids.length} task${ids.length > 1 ? 's' : ''}.`, { id: toastId });
      setSelectedIds(new Set());
      fetchTasks();
      fetchStats();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Bulk delete failed.', { id: toastId });
    }
  }, [selectedIds, fetchTasks, fetchStats]);

  const handleBulkComplete = useCallback(async () => {
    const ids = [...selectedIds];
    if (ids.length === 0) return;
    try {
      await axiosClient.patch('/tasks/bulk', { ids, updates: { status: 'completed' } });
      toast.success(`Marked ${ids.length} task${ids.length > 1 ? 's' : ''} complete.`);
      setSelectedIds(new Set());
      fetchTasks();
      fetchStats();
    } catch {
      toast.error('Bulk update failed.');
    }
  }, [selectedIds, fetchTasks, fetchStats]);

  const handleBulkPriority = useCallback(async (priority) => {
    const ids = [...selectedIds];
    if (ids.length === 0) return;
    try {
      await axiosClient.patch('/tasks/bulk', { ids, updates: { priority } });
      toast.success(`Set priority to "${priority}" for ${ids.length} task${ids.length > 1 ? 's' : ''}.`);
      setSelectedIds(new Set());
      fetchTasks();
    } catch {
      toast.error('Bulk priority update failed.');
    }
  }, [selectedIds, fetchTasks]);

  // ─── Selection ────────────────────────────────────────────────────────
  const handleSelect = useCallback((id) => {
    setSelectedIds(prev => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  }, []);

  // ─── Modal helpers ────────────────────────────────────────────────────
  const openCreateModal = useCallback(() => { setEditingTask(null); setIsModalOpen(true); }, []);
  const openEditModal   = useCallback((task) => { setEditingTask(task); setIsModalOpen(true); }, []);

  // ─── Export / Import ──────────────────────────────────────────────────
  const handleExportCSV  = useCallback(() => { exportCSV(tasks);  toast.success('Exported as CSV!'); }, [tasks]);
  const handleExportJSON = useCallback(() => { exportJSON(tasks); toast.success('Exported as JSON!'); }, [tasks]);

  const handleImport = useCallback(async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    e.target.value = '';

    try {
      const imported = await importJSON(file);
      const toastId  = toast.loading(`Importing ${imported.length} tasks...`);
      let succeeded  = 0;

      for (const task of imported) {
        try {
          await axiosClient.post('/tasks', task);
          succeeded++;
        } catch { /* skip individual failures */ }
      }

      toast.success(`Imported ${succeeded} of ${imported.length} tasks.`, { id: toastId });
      fetchTasks();
      fetchStats();
    } catch (err) {
      toast.error(err.message || 'Import failed.');
    }
  }, [fetchTasks, fetchStats]);

  // ─── Render ───────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-slate-50/60 dark:bg-slate-900 transition-colors duration-300">

      {/* Confetti overlay */}
      <ConfettiOverlay show={showConfetti} onDone={() => setShowConfetti(false)} />

      {/* ── Header ────────────────────────────────────────────────────── */}
      <header className="sticky top-0 z-40 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border-b border-slate-200/60 dark:border-slate-700/60 px-6 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
          {/* Logo */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-linear-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center text-white shadow-md shadow-blue-500/25">
              <Layers size={19} />
            </div>
            <div>
              <h1 className="text-sm font-bold text-slate-800 dark:text-slate-100 leading-tight">Task Manager</h1>
              <p className="text-xs text-slate-400 dark:text-slate-500 mt-0.5">
                Hi, <span className="font-medium text-slate-600 dark:text-slate-300">{user?.name}</span>
              </p>
            </div>
          </div>

          {/* Right controls */}
          <div className="flex items-center gap-2">
            {/* Analytics toggle */}
            <button
              onClick={() => setShowAnalytics(v => !v)}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                showAnalytics
                  ? 'bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400'
                  : 'hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 dark:text-slate-400'
              }`}
            >
              <BarChart2 size={15} />
              <span className="hidden sm:inline">Analytics</span>
            </button>

            {/* Export dropdown */}
            <div className="relative group">
              <button className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-all cursor-pointer">
                <Download size={15} />
                <span className="hidden sm:inline">Export</span>
                <ChevronDown size={12} />
              </button>
              <div className="absolute right-0 top-full mt-1.5 hidden group-hover:flex flex-col bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl shadow-xl overflow-hidden min-w-[130px] z-10">
                <button onClick={handleExportCSV}  className="px-4 py-2.5 text-xs font-medium text-left text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors cursor-pointer">Export CSV</button>
                <button onClick={handleExportJSON} className="px-4 py-2.5 text-xs font-medium text-left text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors cursor-pointer">Export JSON</button>
              </div>
            </div>

            {/* Import */}
            <button
              onClick={() => importInputRef.current?.click()}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-all cursor-pointer"
            >
              <Upload size={15} />
              <span className="hidden sm:inline">Import</span>
            </button>
            <input ref={importInputRef} type="file" accept=".json" onChange={handleImport} className="hidden" />

            {/* Dark mode toggle */}
            <button
              onClick={toggleTheme}
              aria-label="Toggle dark mode"
              className="p-2 rounded-xl text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-all cursor-pointer"
            >
              {isDark ? <Sun size={17} /> : <Moon size={17} />}
            </button>

            {/* Logout */}
            <button
              onClick={logout}
              className="flex items-center gap-1.5 px-3 py-2 hover:bg-red-50 dark:hover:bg-red-900/20 text-slate-500 dark:text-slate-400 hover:text-red-600 dark:hover:text-red-400 rounded-xl text-xs font-semibold transition-colors cursor-pointer"
            >
              <LogOut size={15} />
              <span className="hidden sm:inline">Logout</span>
            </button>
          </div>
        </div>
      </header>

      {/* ── Main Content ──────────────────────────────────────────────── */}
      <main className="max-w-7xl mx-auto px-6 py-8">

        {/* Stat cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 mb-8">
          <StatCard
            icon={<ClipboardList size={22} />}
            label="Total Tasks"
            value={totalCount}
            colorClass="bg-blue-50 dark:bg-blue-900/20 text-blue-500 dark:text-blue-400"
          />
          <StatCard
            icon={<CheckCircle size={22} />}
            label="Completed"
            value={completedCount}
            colorClass="bg-emerald-50 dark:bg-emerald-900/20 text-emerald-500 dark:text-emerald-400"
          />
          <StatCard
            icon={<Clock size={22} />}
            label="Pending"
            value={pendingCount}
            colorClass="bg-amber-50 dark:bg-amber-900/20 text-amber-500 dark:text-amber-400"
          />
        </div>

        {/* Analytics panel — lazy loaded */}
        {showAnalytics && (
          <div className="animate-panel-expand">
            <Suspense fallback={
              <div className="flex justify-center py-8">
                <Loader2 size={24} className="animate-spin text-slate-400" />
              </div>
            }>
              <AnalyticsDashboard
                tasks={tasks}
                stats={stats}
                completedToday={completedToday}
              />
            </Suspense>
          </div>
        )}

        {/* Deadline banners */}
        <DeadlineBanners tasks={tasks} />

        {/* Toolbar */}
        <div className="flex flex-col md:flex-row gap-3 items-stretch md:items-center justify-between mb-6 bg-white dark:bg-slate-800 border border-slate-200/60 dark:border-slate-700 rounded-2xl p-4 shadow-sm">
          {/* Search */}
          <div className="relative flex-1 max-w-sm">
            <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              id="task-search"
              placeholder="Search tasks..."
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              className="w-full pl-10 pr-9 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-sm text-slate-800 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:border-blue-500 focus:bg-white dark:focus:bg-slate-800 transition-all duration-150"
            />
            {searchInput && (
              <button
                onClick={() => setSearchInput('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 cursor-pointer"
              >
                <XIcon size={14} />
              </button>
            )}
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {/* Status filter */}
            <div className="flex bg-slate-100 dark:bg-slate-700/50 p-1 rounded-xl border border-slate-200/40 dark:border-slate-600/40">
              {['all', 'pending', 'completed'].map((tab) => (
                <button
                  key={tab}
                  onClick={() => setStatusFilter(tab)}
                  className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold capitalize tracking-wide transition-all cursor-pointer ${
                    statusFilter === tab
                      ? 'bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 shadow-sm'
                      : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
                  }`}
                >
                  {tab}
                </button>
              ))}
            </div>

            {/* Priority filter */}
            <select
              value={priorityFilter}
              onChange={(e) => setPriorityFilter(e.target.value)}
              className="px-3 py-2 bg-slate-100 dark:bg-slate-700/50 border border-slate-200/40 dark:border-slate-600/40 rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-300 focus:outline-none focus:border-blue-500 cursor-pointer"
            >
              <option value="all">All Priority</option>
              <option value="high">🔴 High</option>
              <option value="medium">🟡 Medium</option>
              <option value="low">🟢 Low</option>
            </select>

            {/* Add Task */}
            <button
              onClick={openCreateModal}
              className="flex items-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs rounded-xl shadow-md shadow-blue-600/20 transition-all active:scale-[0.98] cursor-pointer"
            >
              <Plus size={15} />
              Add Task
            </button>
          </div>
        </div>

        {/* Task grid */}
        {loading ? (
          <div className="flex flex-col items-center justify-center py-24 gap-4">
            <Loader2 size={32} className="animate-spin text-blue-500" />
            <p className="text-sm text-slate-400 dark:text-slate-500 font-medium">Loading tasks...</p>
          </div>
        ) : tasks.length > 0 ? (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {tasks.map(task => (
                <TaskCard
                  key={task._id}
                  task={task}
                  onToggle={handleToggleStatus}
                  onEdit={openEditModal}
                  onDelete={handleDeleteTask}
                  isSelected={selectedIds.has(task._id)}
                  onSelect={handleSelect}
                  selectionMode={selectionMode}
                />
              ))}
            </div>

            {/* Pagination */}
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              totalItems={totalItems}
              itemsPerPage={ITEMS_PER_PAGE}
              onGoTo={goTo}
              onNext={next}
              onPrev={prev}
            />
          </>
        ) : (
          <div className="bg-white dark:bg-slate-800 border border-dashed border-slate-200 dark:border-slate-700 rounded-2xl py-20 px-4 text-center max-w-md mx-auto mt-6">
            <div className="w-14 h-14 bg-slate-100 dark:bg-slate-700 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <ClipboardList size={24} className="text-slate-400" />
            </div>
            <p className="text-sm font-semibold text-slate-700 dark:text-slate-200">No tasks found</p>
            <p className="text-xs text-slate-400 dark:text-slate-500 mt-1.5 max-w-xs mx-auto">
              {searchInput || statusFilter !== 'all' || priorityFilter !== 'all'
                ? 'Try clearing your filters or search query.'
                : 'Create your first task to get started.'}
            </p>
            <button
              onClick={openCreateModal}
              className="mt-5 inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-blue-600 dark:text-blue-400 hover:text-blue-700 hover:underline cursor-pointer"
            >
              <Plus size={14} />
              Create a task
            </button>
          </div>
        )}
      </main>

      {/* Bulk actions floating bar */}
      <BulkActionsBar
        selectedCount={selectedIds.size}
        onClearSelect={() => setSelectedIds(new Set())}
        onBulkDelete={handleBulkDelete}
        onBulkComplete={handleBulkComplete}
        onBulkPriority={handleBulkPriority}
      />

      {/* Task modal */}
      <TaskModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleModalSubmit}
        editingTask={editingTask}
      />
    </div>
  );
}