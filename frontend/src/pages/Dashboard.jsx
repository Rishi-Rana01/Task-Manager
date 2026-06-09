import { useState, useEffect, useCallback, useMemo, useRef, lazy, Suspense } from 'react';
import PageLoader from '../components/PageLoader';
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
  LogOut, Plus, Search, Zap, ClipboardList, CheckCircle2, Clock,
  Sun, Moon, BarChart2, Download, Upload, ChevronDown, AlertTriangle,
  X as XIcon, Loader2, Sparkles,
} from 'lucide-react';

const AnalyticsDashboard = lazy(() => import('../components/AnalyticsDashboard'));

const ITEMS_PER_PAGE = 9;

function DeadlineBanners({ tasks }) {
  const alerts = useMemo(() => getDeadlineAlerts(tasks), [tasks]);
  if (alerts.length === 0) return null;

  return (
    <div className="space-y-2 mb-6">
      {alerts.slice(0, 3).map(({ task, urgency, label }) => (
        <div
          key={task._id}
          className={`flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium border backdrop-blur-sm ${
            urgency === 'critical'
              ? 'bg-red-500/8 dark:bg-red-500/10 border-red-500/20 dark:border-red-500/30 text-red-600 dark:text-red-400 neon-pulse'
              : urgency === 'warning'
              ? 'bg-amber-500/8 dark:bg-amber-500/10 border-amber-500/20 dark:border-amber-500/30 text-amber-600 dark:text-amber-400'
              : 'bg-indigo-500/8 dark:bg-indigo-500/10 border-indigo-500/20 dark:border-indigo-500/30 text-indigo-600 dark:text-indigo-400'
          }`}
        >
          <AlertTriangle size={14} className="shrink-0" />
          <span className="truncate font-semibold">{task.title}</span>
          <span className="ml-auto shrink-0 font-mono text-xs opacity-80">{label}</span>
        </div>
      ))}
    </div>
  );
}

function StatCard({ icon, label, value, gradient, glowColor }) {
  return (
    <div className="relative group rounded-2xl p-px overflow-hidden" style={{ background: gradient }}>
      <div className="rounded-2xl p-5 h-full flex items-center gap-4" style={{ background: 'var(--surface)' }}>
        <div
          className="w-12 h-12 rounded-xl flex items-center justify-center text-white shrink-0"
          style={{ background: gradient }}
        >
          {icon}
        </div>
        <div>
          <p className="text-[10px] font-bold uppercase tracking-[0.12em] text-slate-400 dark:text-slate-500">{label}</p>
          <p className="text-3xl font-black mt-0.5 gradient-text font-mono leading-none">{value}</p>
        </div>
        <div
          className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"
          style={{ boxShadow: `inset 0 0 40px ${glowColor}` }}
        />
      </div>
    </div>
  );
}

export default function Dashboard() {
  const { user, logout } = useAuth();
  const { isDark, toggleTheme } = useTheme();

  const [tasks,      setTasks]      = useState([]);
  const [totalItems, setTotalItems] = useState(0);
  const [loading,    setLoading]    = useState(true);
  const [stats,      setStats]      = useState(null);

  const [searchInput,    setSearchInput]    = useState('');
  const [statusFilter,   setStatusFilter]   = useState('all');
  const [priorityFilter, setPriorityFilter] = useState('all');
  const debouncedSearch = useDebounce(searchInput, 300);

  const { currentPage, totalPages, setTotalPages, goTo, next, prev, reset } = usePagination(1);

  const [isModalOpen,   setIsModalOpen]   = useState(false);
  const [editingTask,   setEditingTask]   = useState(null);
  const [showAnalytics, setShowAnalytics] = useState(false);
  const [selectedIds,   setSelectedIds]   = useState(new Set());
  const [showConfetti,  setShowConfetti]  = useState(false);
  const prevPendingRef  = useRef(0);
  const importInputRef  = useRef(null);
  const initialLoadRef  = useRef(true);

  const completedToday = useMemo(() => getCompletedTodayCount(tasks), [tasks]);
  const totalCount     = totalItems;
  const completedCount = useMemo(() => stats?.byStatus?.find(s => s._id === 'completed')?.count || 0, [stats]);
  const pendingCount   = useMemo(() => stats?.byStatus?.find(s => s._id === 'pending')?.count   || 0, [stats]);
  const selectionMode  = selectedIds.size > 0;

  // Trigger confetti when all pending tasks are cleared
  useEffect(() => {
    if (prevPendingRef.current > 0 && pendingCount === 0 && totalCount > 0) {
      setShowConfetti(true);
      toast.success('🎉 All tasks completed! Amazing work!', { duration: 4000 });
    }
    prevPendingRef.current = pendingCount;
  }, [pendingCount, totalCount]);

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
        console.error('[Dashboard] fetchTasks:', err);
        toast.error('Failed to load tasks.');
      }
    } finally {
      if (isMounted) {
        setLoading(false);
        initialLoadRef.current = false;
      }
    }
    return () => { isMounted = false; };
  }, [currentPage, statusFilter, priorityFilter, debouncedSearch, setTotalPages]);

  // eslint-disable-next-line react-hooks/set-state-in-effect
  useEffect(() => { fetchTasks(); }, [fetchTasks]);

  // Reset to page 1 whenever filters or search change
  useEffect(() => { reset(); }, [statusFilter, priorityFilter, debouncedSearch, reset]);

  const fetchStats = useCallback(async () => {
    try {
      const res = await axiosClient.get('/tasks/stats');
      setStats(res.data.data);
    } catch (err) {
      console.error('[Dashboard] fetchStats:', err);
    }
  }, []);

  // eslint-disable-next-line react-hooks/set-state-in-effect
  useEffect(() => { fetchStats(); }, [fetchStats]);

  const handleModalSubmit = useCallback(async (payload) => {
    try {
      if (editingTask) {
        await axiosClient.put(`/tasks/${editingTask._id}`, payload);
        toast.success('Task updated.');
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
      toast.error(error.response?.data?.message || 'Failed to update status.');
    }
  }, [fetchTasks, fetchStats]);

  const handleDeleteTask = useCallback(async (id) => {
    const toastId = toast.loading('Deleting...');
    try {
      await axiosClient.delete(`/tasks/${id}`);
      toast.success('Task deleted.', { id: toastId });
      setSelectedIds(prev => { const next = new Set(prev); next.delete(id); return next; });
      fetchTasks();
      fetchStats();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to delete.', { id: toastId });
    }
  }, [fetchTasks, fetchStats]);

  const handleBulkDelete = useCallback(async () => {
    const ids = [...selectedIds];
    if (!ids.length) return;
    const toastId = toast.loading(`Deleting ${ids.length} tasks...`);
    try {
      await axiosClient.delete('/tasks/bulk', { data: { ids } });
      toast.success(`Deleted ${ids.length} tasks.`, { id: toastId });
      setSelectedIds(new Set());
      fetchTasks(); fetchStats();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Bulk delete failed.', { id: toastId });
    }
  }, [selectedIds, fetchTasks, fetchStats]);

  const handleBulkComplete = useCallback(async () => {
    const ids = [...selectedIds];
    if (!ids.length) return;
    try {
      await axiosClient.patch('/tasks/bulk', { ids, updates: { status: 'completed' } });
      toast.success(`Marked ${ids.length} tasks complete.`);
      setSelectedIds(new Set());
      fetchTasks(); fetchStats();
    } catch { toast.error('Bulk update failed.'); }
  }, [selectedIds, fetchTasks, fetchStats]);

  const handleBulkPriority = useCallback(async (priority) => {
    const ids = [...selectedIds];
    if (!ids.length) return;
    try {
      await axiosClient.patch('/tasks/bulk', { ids, updates: { priority } });
      toast.success(`Set "${priority}" priority on ${ids.length} tasks.`);
      setSelectedIds(new Set());
      fetchTasks();
    } catch { toast.error('Bulk priority update failed.'); }
  }, [selectedIds, fetchTasks]);

  const handleSelect = useCallback((id) => {
    setSelectedIds(prev => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  }, []);

  const openCreateModal = useCallback(() => { setEditingTask(null); setIsModalOpen(true); }, []);
  const openEditModal   = useCallback((task) => { setEditingTask(task); setIsModalOpen(true); }, []);

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
        try { await axiosClient.post('/tasks', task); succeeded++; }
        catch { /* skip individual failures */ }
      }
      toast.success(`Imported ${succeeded} of ${imported.length} tasks.`, { id: toastId });
      fetchTasks(); fetchStats();
    } catch (err) { toast.error(err.message || 'Import failed.'); }
  }, [fetchTasks, fetchStats]);

  // Show full-page branded loader on first mount until data arrives
  // eslint-disable-next-line react-hooks/refs
  if (initialLoadRef.current && loading) {
    return <PageLoader />;
  }

  return (
    <div className="min-h-screen dot-grid transition-colors duration-300">
      <ConfettiOverlay show={showConfetti} onDone={() => setShowConfetti(false)} />

      {/* ── Header ─────────────────────────────────────────────────────── */}
      <header className="glass sticky top-0 z-40 px-6 py-3.5">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl flex items-center justify-center btn-primary text-white shadow-lg">
              <Zap size={17} strokeWidth={2.5} />
            </div>
            <div>
              <h1 className="text-sm font-black tracking-tight text-slate-800 dark:text-slate-100">
                Task<span className="gradient-text">Flow</span>
              </h1>
              <p className="text-[10px] text-slate-400 dark:text-slate-500 font-mono">
                @{user?.name?.toLowerCase().replace(/\s/g, '_')}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1.5">
            <button
              onClick={() => setShowAnalytics(v => !v)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                showAnalytics
                  ? 'bg-indigo-500/10 dark:bg-indigo-400/10 text-indigo-600 dark:text-indigo-400 ring-1 ring-indigo-500/25'
                  : 'text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-white/5'
              }`}
            >
              <BarChart2 size={14} />
              <span className="hidden sm:inline">Analytics</span>
            </button>

            <div className="relative group">
              <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-white/5 transition-all cursor-pointer">
                <Download size={14} />
                <span className="hidden sm:inline">Export</span>
                <ChevronDown size={11} />
              </button>
              <div className="absolute right-0 top-full mt-2 hidden group-hover:flex flex-col min-w-[130px] z-20 rounded-xl overflow-hidden shadow-2xl ring-1 ring-black/5 dark:ring-white/10" style={{ background: 'var(--surface)' }}>
                <button onClick={handleExportCSV}  className="px-4 py-2.5 text-xs font-medium text-left text-slate-700 dark:text-slate-300 hover:bg-indigo-500/5 transition-colors cursor-pointer">Export CSV</button>
                <button onClick={handleExportJSON} className="px-4 py-2.5 text-xs font-medium text-left text-slate-700 dark:text-slate-300 hover:bg-indigo-500/5 transition-colors cursor-pointer">Export JSON</button>
              </div>
            </div>

            <button
              onClick={() => importInputRef.current?.click()}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-white/5 transition-all cursor-pointer"
            >
              <Upload size={14} />
              <span className="hidden sm:inline">Import</span>
            </button>
            <input ref={importInputRef} type="file" accept=".json" onChange={handleImport} className="hidden" />

            <button
              onClick={toggleTheme}
              aria-label="Toggle theme"
              className="p-2 rounded-xl text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-white/5 transition-all cursor-pointer"
            >
              {isDark ? <Sun size={16} /> : <Moon size={16} />}
            </button>

            <div className="w-px h-5 bg-slate-200 dark:bg-white/10 mx-1" />

            <button
              onClick={logout}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold text-slate-500 dark:text-slate-400 hover:bg-red-50 dark:hover:bg-red-500/10 hover:text-red-600 dark:hover:text-red-400 transition-all cursor-pointer"
            >
              <LogOut size={14} />
              <span className="hidden sm:inline">Sign out</span>
            </button>
          </div>
        </div>
      </header>

      {/* ── Main ───────────────────────────────────────────────────────── */}
      <main className="max-w-7xl mx-auto px-6 py-8">

        {/* Welcome strip */}
        <div className="flex items-center gap-2 mb-7">
          <Sparkles size={14} className="text-indigo-400" />
          <p className="text-xs font-semibold text-slate-400 dark:text-slate-500 tracking-wide">
            Good {new Date().getHours() < 12 ? 'morning' : new Date().getHours() < 18 ? 'afternoon' : 'evening'},&nbsp;
            <span className="gradient-text">{user?.name}</span>
          </p>
        </div>

        {/* Stat cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
          <StatCard
            icon={<ClipboardList size={20} />}
            label="Total Tasks"
            value={totalCount}
            gradient="linear-gradient(135deg, #6366f1, #8b5cf6)"
            glowColor="rgba(99,102,241,0.08)"
          />
          <StatCard
            icon={<CheckCircle2 size={20} />}
            label="Completed"
            value={completedCount}
            gradient="linear-gradient(135deg, #10b981, #06b6d4)"
            glowColor="rgba(16,185,129,0.08)"
          />
          <StatCard
            icon={<Clock size={20} />}
            label="Pending"
            value={pendingCount}
            gradient="linear-gradient(135deg, #f59e0b, #f97316)"
            glowColor="rgba(245,158,11,0.08)"
          />
        </div>

        {/* Analytics panel */}
        {showAnalytics && (
          <div className="animate-panel-expand mb-8">
            <Suspense fallback={
              <div className="flex justify-center py-10">
                <Loader2 size={22} className="animate-spin text-indigo-400" />
              </div>
            }>
              <AnalyticsDashboard tasks={tasks} stats={stats} completedToday={completedToday} />
            </Suspense>
          </div>
        )}

        <DeadlineBanners tasks={tasks} />

        {/* Toolbar */}
        <div
          className="flex flex-col md:flex-row gap-3 items-stretch md:items-center justify-between mb-6 rounded-2xl p-4 glow-surface"
          style={{ background: 'var(--surface)' }}
        >
          <div className="relative flex-1 max-w-sm">
            <Search size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              id="task-search"
              placeholder="Search tasks..."
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              className="w-full pl-9 pr-8 py-2.5 rounded-xl text-sm text-slate-800 dark:text-slate-100 placeholder-slate-400 focus:outline-none transition-all duration-200"
              style={{
                background: 'var(--surface-2)',
                border: '1px solid var(--border)',
              }}
              onFocus={e => e.target.style.borderColor = 'var(--accent)'}
              onBlur={e => e.target.style.borderColor = 'var(--border)'}
            />
            {searchInput && (
              <button onClick={() => setSearchInput('')} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 cursor-pointer">
                <XIcon size={13} />
              </button>
            )}
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <div className="flex p-0.5 rounded-xl gap-0.5" style={{ background: 'var(--surface-2)', border: '1px solid var(--border)' }}>
              {['all', 'pending', 'completed'].map((tab) => (
                <button
                  key={tab}
                  onClick={() => setStatusFilter(tab)}
                  className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold capitalize tracking-wide transition-all cursor-pointer ${
                    statusFilter === tab
                      ? 'text-white shadow-sm'
                      : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
                  }`}
                  style={statusFilter === tab ? { background: 'linear-gradient(135deg, #6366f1, #8b5cf6)' } : {}}
                >
                  {tab}
                </button>
              ))}
            </div>

            <select
              value={priorityFilter}
              onChange={(e) => setPriorityFilter(e.target.value)}
              className="px-3 py-2 rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-300 focus:outline-none cursor-pointer"
              style={{ background: 'var(--surface-2)', border: '1px solid var(--border)' }}
            >
              <option value="all">All Priority</option>
              <option value="high">🔴 High</option>
              <option value="medium">🟡 Medium</option>
              <option value="low">🟢 Low</option>
            </select>

            <button
              onClick={openCreateModal}
              className="btn-primary flex items-center gap-2 px-4 py-2.5 text-white font-semibold text-xs rounded-xl shadow-lg shadow-indigo-500/25 transition-all active:scale-[0.97] cursor-pointer"
            >
              <Plus size={15} strokeWidth={2.5} />
              New Task
            </button>
          </div>
        </div>

        {/* Task grid */}
        {loading ? (
          <div className="flex flex-col items-center justify-center py-28 gap-4">
            <div className="w-10 h-10 rounded-2xl btn-primary flex items-center justify-center">
              <Loader2 size={20} className="animate-spin text-white" />
            </div>
            <p className="text-sm text-slate-400 dark:text-slate-500 font-medium">Loading tasks...</p>
          </div>
        ) : tasks.length > 0 ? (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {tasks.map((task, i) => (
                <div key={task._id} style={{ animationDelay: `${i * 40}ms` }}>
                  <TaskCard
                    task={task}
                    onToggle={handleToggleStatus}
                    onEdit={openEditModal}
                    onDelete={handleDeleteTask}
                    isSelected={selectedIds.has(task._id)}
                    onSelect={handleSelect}
                    selectionMode={selectionMode}
                  />
                </div>
              ))}
            </div>
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
          <div
            className="rounded-2xl py-20 px-4 text-center max-w-sm mx-auto mt-4 glow-surface"
            style={{ background: 'var(--surface)' }}
          >
            <div className="w-16 h-16 rounded-2xl btn-primary flex items-center justify-center mx-auto mb-5 opacity-60">
              <ClipboardList size={26} className="text-white" />
            </div>
            <p className="text-sm font-bold text-slate-700 dark:text-slate-200">No tasks found</p>
            <p className="text-xs text-slate-400 dark:text-slate-500 mt-1.5 max-w-xs mx-auto leading-relaxed">
              {searchInput || statusFilter !== 'all' || priorityFilter !== 'all'
                ? 'Try clearing your filters or search query.'
                : 'Create your first task to get started.'}
            </p>
            <button
              onClick={openCreateModal}
              className="mt-5 inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold rounded-xl btn-primary text-white shadow-md shadow-indigo-500/20 cursor-pointer transition-all"
            >
              <Plus size={13} />
              Create a task
            </button>
          </div>
        )}
      </main>

      <BulkActionsBar
        selectedCount={selectedIds.size}
        onClearSelect={() => setSelectedIds(new Set())}
        onBulkDelete={handleBulkDelete}
        onBulkComplete={handleBulkComplete}
        onBulkPriority={handleBulkPriority}
      />

      <TaskModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleModalSubmit}
        editingTask={editingTask}
      />
    </div>
  );
}