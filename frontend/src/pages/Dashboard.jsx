import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import axiosClient from '../api/axiosClient';
import TaskCard from '../components/TaskCard';
import TaskModal from '../components/TaskModal';
import { LogOut, Plus, Search, Layers, ClipboardList, CheckCircle, Clock } from 'lucide-react';
import toast from 'react-hot-toast';

export default function Dashboard() {
  const { user, logout } = useAuth();
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Interaction Filters States (Bonus Requirements Checklist)
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all'); // 'all' | 'pending' | 'completed'

  // Modal Controlling State Vectors
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [activeEditingTask, setActiveEditingTask] = useState(null);

  useEffect(() => {
    let isMounted = true; 

    const syncWorkspaceRecords = async () => {
      try {
        const response = await axiosClient.get('/tasks');
        if (isMounted) {
          setTasks(response.data.data);
        }
      } catch (err) {
        console.error('Workspace synchronization breakdown:', err);
        toast.error('Failed to sync workspace cluster definitions.');
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    syncWorkspaceRecords();
    return () => {
      isMounted = false;
    };
  }, []); 
  
  const handleModalSubmit = async (payload) => {
    try {
      if (activeEditingTask) {
        const response = await axiosClient.put(`/tasks/${activeEditingTask._id}`, payload);
        setTasks(tasks.map(t => t._id === activeEditingTask._id ? response.data.data : t));
        toast.success('Task details synchronized safely.');
      } else {
        const response = await axiosClient.post('/tasks', payload);
        setTasks([response.data.data, ...tasks]);
        toast.success('Task logged successfully into workspace.');
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Transaction aborted by network boundary layer.');
    } finally {
      setActiveEditingTask(null);
    }
  };

  const handleToggleStatus = async (task) => {
    const toggledStatus = task.status === 'pending' ? 'completed' : 'pending';
    try {
      const response = await axiosClient.put(`/tasks/${task._id}`, { status: toggledStatus });
      setTasks(tasks.map(t => t._id === task._id ? response.data.data : t));
    } catch (error) {
      toast.error('Failed to adjust task structural parameters.',error.response?.data?.message || 'Transaction aborted by network boundary layer.');
    }
  };


  const handleDeleteTask = async (id) => {
    if (!window.confirm('Confirm complete execution trace purge of this resource?')) return;
    try {
      await axiosClient.delete(`/tasks/${id}`);
      setTasks(tasks.filter(t => t._id !== id));
      toast.success('Resource clean sweep completed.');
    } catch (error) {
      toast.error('Failed to clear resource context node.',error.response?.data?.message || 'Transaction aborted by network boundary layer.');
    }
  };

  const openCreateModal = () => {
    setActiveEditingTask(null);
    setIsModalOpen(true);
  };

  const openEditModal = (task) => {
    setActiveEditingTask(task);
    setIsModalOpen(true);
  };

  const filteredTasks = tasks.filter(task => {
    const matchesSearch = task.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          (task.description && task.description.toLowerCase().includes(searchQuery.toLowerCase()));
    
    if (statusFilter === 'all') return matchesSearch;
    return matchesSearch && task.status === statusFilter;
  });

  const totalCount = tasks.length;
  const completedCount = tasks.filter(t => t.status === 'completed').length;
  const pendingCount = totalCount - completedCount;

  return (
    <div className="min-h-screen bg-slate-50/60">
      {/* Top Professional Global Workspace Header */}
      <header className="sticky top-0 z-40 bg-white/80 backdrop-blur-md border-b border-slate-200/60 px-6 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-slate-900 rounded-xl flex items-center justify-center text-white shadow-md shadow-slate-950/10">
              <Layers size={20} />
            </div>
            <div>
              <h1 className="text-base font-bold text-slate-800 leading-tight">Workspace Central</h1>
              <p className="text-xs text-slate-400 mt-0.5">Operated by: <span className="font-medium text-slate-600">{user?.name}</span></p>
            </div>
          </div>

          <button 
            onClick={logout}
            className="flex items-center gap-2 px-3.5 py-2 hover:bg-red-50 text-slate-500 hover:text-red-600 rounded-xl text-xs font-semibold tracking-wide transition-colors duration-150 cursor-pointer"
          >
            <LogOut size={16} />
            Disconnect
          </button>
        </div>
      </header>

      {/* Main Workspace Frame Panel */}
      <main className="max-w-7xl mx-auto px-6 py-8">
        
        {/* Dynamic Metric Counter Panels Layout Grid Row */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 mb-8">
          <div className="bg-white border border-slate-200/60 rounded-2xl p-5 flex items-center gap-4 shadow-sm">
            <div className="w-11 h-11 bg-blue-50 text-blue-500 rounded-xl flex items-center justify-center"><ClipboardList size={22} /></div>
            <div>
              <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Assigned Backlog</p>
              <h3 className="text-2xl font-bold text-slate-800 mt-0.5">{totalCount}</h3>
            </div>
          </div>
          <div className="bg-white border border-slate-200/60 rounded-2xl p-5 flex items-center gap-4 shadow-sm">
            <div className="w-11 h-11 bg-emerald-50 text-emerald-500 rounded-xl flex items-center justify-center"><CheckCircle size={22} /></div>
            <div>
              <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Completed Segments</p>
              <h3 className="text-2xl font-bold text-slate-800 mt-0.5">{completedCount}</h3>
            </div>
          </div>
          <div className="bg-white border border-slate-200/60 rounded-2xl p-5 flex items-center gap-4 shadow-sm">
            <div className="w-11 h-11 bg-amber-50 text-amber-500 rounded-xl flex items-center justify-center"><Clock size={22} /></div>
            <div>
              <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Awaiting Execution</p>
              <h3 className="text-2xl font-bold text-slate-800 mt-0.5">{pendingCount}</h3>
            </div>
          </div>
        </div>

        {/* Workspace Toolbar Filters and Controls Module Row */}
        <div className="flex flex-col md:flex-row gap-4 items-stretch md:items-center justify-between mb-8 bg-white border border-slate-200/60 rounded-2xl p-4 shadow-sm">
          {/* Real-time Text Query Search Inputs bar */}
          <div className="relative flex-1 max-w-md">
            <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input 
              type="text"
              placeholder="Search catalog indexing matrix..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-slate-400 focus:bg-white transition-all duration-150"
            />
          </div>

          {/* Interactive Navigation Filter Tabs & Action dispatcher */}
          <div className="flex flex-wrap items-center gap-3">
            <div className="flex bg-slate-100 p-1 rounded-xl border border-slate-200/40">
              {['all', 'pending', 'completed'].map((tab) => (
                <button
                  key={tab}
                  onClick={() => setStatusFilter(tab)}
                  className={`px-4 py-1.5 rounded-lg text-xs font-semibold capitalize tracking-wide transition-all cursor-pointer ${
                    statusFilter === tab 
                      ? 'bg-white text-slate-900 shadow-sm' 
                      : 'text-slate-500 hover:text-slate-800'
                  }`}
                >
                  {tab}
                </button>
              ))}
            </div>

            <button 
              onClick={openCreateModal}
              className="flex items-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-medium text-xs rounded-xl shadow-md shadow-blue-600/10 transition-all active:scale-[0.98] cursor-pointer"
            >
              <Plus size={16} />
              Add Task
            </button>
          </div>
        </div>

        {/* Primary Tasks Listing Mapping Canvas render panel */}
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 gap-3">
            <div className="w-8 h-8 border-3 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
            <p className="text-xs text-slate-400 font-medium">Syncing distributed node storage registries...</p>
          </div>
        ) : filteredTasks.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {filteredTasks.map(task => (
              <TaskCard 
                key={task._id}
                task={task}
                onToggle={handleToggleStatus}
                onEdit={openEditModal}
                onDelete={handleDeleteTask}
              />
            ))}
          </div>
        ) : (
          <div className="bg-white border border-dashed border-slate-200 rounded-2xl py-16 px-4 text-center max-w-md mx-auto mt-6">
            <p className="text-sm font-semibold text-slate-700">No active assignment metrics logged</p>
            <p className="text-xs text-slate-400 mt-1 max-w-xs mx-auto">Adjust your parameter filter tracking vectors or add an assignment to seed records inside this layout block.</p>
            <button 
              onClick={openCreateModal}
              className="mt-4 inline-flex items-center gap-1.5 text-xs font-semibold text-blue-500 hover:text-blue-600 hover:underline cursor-pointer"
            >
              <Plus size={14} /> Log your first task entry
            </button>
          </div>
        )}
      </main>

      {/* System Overlay Forms Modal Injection Point */}
      <TaskModal 
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleModalSubmit}
        editingTask={activeEditingTask}
      />
    </div>
  );
}