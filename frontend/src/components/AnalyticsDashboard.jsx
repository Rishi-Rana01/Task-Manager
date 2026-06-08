import { useMemo } from 'react';
import { TrendingUp, CheckCircle, Clock, BarChart2, PieChart, Star } from 'lucide-react';

// ─── Mini SVG Pie Chart ───────────────────────────────────────────────────
function PieChartSVG({ completed, pending }) {
  const total = completed + pending;
  if (total === 0) {
    return (
      <div className="flex items-center justify-center w-32 h-32 rounded-full border-12 border-slate-100 dark:border-slate-700">
        <span className="text-xs text-slate-400">No data</span>
      </div>
    );
  }

  const completedPct = completed / total;
  const r            = 48;
  const cx           = 60;
  const cy           = 60;
  const circumference = 2 * Math.PI * r;
  const completedDash = completedPct * circumference;

  return (
    <svg width="120" height="120" viewBox="0 0 120 120" className="-rotate-90">
      {/* Background track */}
      <circle cx={cx} cy={cy} r={r} fill="none" stroke="currentColor"
        className="text-slate-100 dark:text-slate-700" strokeWidth="12" />
      {/* Completed arc */}
      <circle
        cx={cx} cy={cy} r={r} fill="none"
        stroke="#10b981" strokeWidth="12"
        strokeDasharray={`${completedDash} ${circumference}`}
        strokeLinecap="round"
        style={{ transition: 'stroke-dasharray 0.6s ease' }}
      />
      {/* Pending arc */}
      <circle
        cx={cx} cy={cy} r={r} fill="none"
        stroke="#f59e0b" strokeWidth="12"
        strokeDasharray={`${circumference - completedDash} ${circumference}`}
        strokeDashoffset={-completedDash}
        strokeLinecap="round"
        style={{ transition: 'stroke-dasharray 0.6s ease' }}
      />
    </svg>
  );
}

// ─── Mini Bar Chart ────────────────────────────────────────────────────────
function BarChartSVG({ data }) {
  const maxVal = Math.max(...data.map(d => d.count), 1);
  const WIDTH  = 200;
  const HEIGHT = 80;
  const barW   = 40;
  const gap    = (WIDTH - data.length * barW) / (data.length + 1);

  const COLOR = { high: '#ef4444', medium: '#f59e0b', low: '#10b981' };

  return (
    <svg width="100%" height="auto" viewBox={`0 0 ${WIDTH} ${HEIGHT + 24}`} className="max-w-[200px]">
      {data.map((d, i) => {
        const barH = Math.max(4, (d.count / maxVal) * HEIGHT);
        const x    = gap + i * (barW + gap);
        const y    = HEIGHT - barH;
        return (
          <g key={d.label}>
            <rect x={x} y={y} width={barW} height={barH}
              rx="4" fill={COLOR[d.label] || '#6366f1'}
              style={{ transition: 'height 0.5s ease, y 0.5s ease' }}
            />
            <text x={x + barW / 2} y={HEIGHT + 16} textAnchor="middle"
              fontSize="9" fill="currentColor" className="text-slate-500 dark:text-slate-400">
              {d.label}
            </text>
            <text x={x + barW / 2} y={y - 4} textAnchor="middle"
              fontSize="10" fontWeight="600" fill="currentColor" className="text-slate-600">
              {d.count}
            </text>
          </g>
        );
      })}
    </svg>
  );
}

// ─── Trend Sparkline ───────────────────────────────────────────────────────
function TrendLine({ weeklyData }) {
  const last7 = useMemo(() => {
    const days = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const str = d.toISOString().split('T')[0];
      const found = weeklyData.find(w => w._id === str);
      days.push({ date: str, count: found?.count || 0, label: d.toLocaleDateString(undefined, { weekday: 'short' }) });
    }
    return days;
  }, [weeklyData]);

  const maxVal = Math.max(...last7.map(d => d.count), 1);
  const W = 220, H = 60;

  const points = last7.map((d, i) => {
    const x = (i / (last7.length - 1)) * W;
    const y = H - (d.count / maxVal) * H;
    return `${x},${y}`;
  });

  return (
    <div className="w-full flex justify-center">
      <svg width="100%" height="auto" viewBox={`0 0 ${W} ${H + 20}`} className="w-full max-w-[220px]">
        <defs>
          <linearGradient id="trendGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#6366f1" stopOpacity="0.3" />
            <stop offset="100%" stopColor="#6366f1" stopOpacity="0" />
          </linearGradient>
        </defs>
        {/* Fill area */}
        <polygon
          points={`0,${H} ${points.join(' ')} ${W},${H}`}
          fill="url(#trendGrad)"
        />
        {/* Line */}
        <polyline points={points.join(' ')} fill="none"
          stroke="#6366f1" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        {/* Dots */}
        {last7.map((d, i) => {
          const [x, y] = points[i].split(',');
          return (
            <circle key={d.date} cx={x} cy={y} r="3"
              fill="#6366f1" stroke="white" strokeWidth="1.5" />
          );
        })}
        {/* X-axis labels */}
        {last7.map((d, i) => {
          const x = (i / (last7.length - 1)) * W;
          return (
            <text key={`lbl-${d.date}`} x={x} y={H + 16} textAnchor="middle"
              fontSize="8" fill="currentColor" className="text-slate-400">
              {d.label}
            </text>
          );
        })}
      </svg>
    </div>
  );
}

// ─── Main Component ────────────────────────────────────────────────────────
/**
 * AnalyticsDashboard — collapsible analytics panel.
 *
 * Props:
 *   tasks        {Array}  — all tasks (for client-side counts)
 *   stats        {object} — { byStatus, byPriority, weeklyTrend, completedToday } from API
 *   completedToday {number}
 */
export default function AnalyticsDashboard({ tasks, stats, completedToday }) {
  const completed = useMemo(() => tasks.filter(t => t.status === 'completed').length, [tasks]);
  const pending   = useMemo(() => tasks.filter(t => t.status === 'pending').length,   [tasks]);

  const priorityData = useMemo(() => {
    const map = { high: 0, medium: 0, low: 0 };
    tasks.forEach(t => { if (map[t.priority] !== undefined) map[t.priority]++; });
    return [
      { label: 'high',   count: map.high   },
      { label: 'medium', count: map.medium },
      { label: 'low',    count: map.low    },
    ];
  }, [tasks]);

  const weeklyTrend = stats?.weeklyTrend || [];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-5 mb-8">

      {/* Pie Chart — Status */}
      <div className="bg-white dark:bg-slate-800 border border-slate-200/60 dark:border-slate-700 rounded-2xl p-5 shadow-sm flex flex-col items-center gap-3">
        <div className="flex items-center gap-2 w-full">
          <PieChart size={16} className="text-slate-400" />
          <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">By Status</p>
        </div>
        <PieChartSVG completed={completed} pending={pending} />
        <div className="flex gap-4 text-xs">
          <span className="flex items-center gap-1.5 text-slate-600 dark:text-slate-300">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 inline-block" />
            Done ({completed})
          </span>
          <span className="flex items-center gap-1.5 text-slate-600 dark:text-slate-300">
            <span className="w-2.5 h-2.5 rounded-full bg-amber-500 inline-block" />
            Pending ({pending})
          </span>
        </div>
      </div>

      {/* Bar Chart — Priority */}
      <div className="bg-white dark:bg-slate-800 border border-slate-200/60 dark:border-slate-700 rounded-2xl p-5 shadow-sm flex flex-col gap-3">
        <div className="flex items-center gap-2">
          <BarChart2 size={16} className="text-slate-400" />
          <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">By Priority</p>
        </div>
        <div className="flex justify-center">
          <BarChartSVG data={priorityData} />
        </div>
      </div>

      {/* Weekly Trend */}
      <div className="bg-white dark:bg-slate-800 border border-slate-200/60 dark:border-slate-700 rounded-2xl p-5 shadow-sm flex flex-col gap-3">
        <div className="flex items-center gap-2">
          <TrendingUp size={16} className="text-slate-400" />
          <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Weekly Trend</p>
        </div>
        <TrendLine weeklyData={weeklyTrend} />
        <p className="text-xs text-slate-400 dark:text-slate-500 text-center">Completions in last 7 days</p>
      </div>

      {/* Today's Counter */}
      <div className="bg-linear-to-br from-indigo-500 to-blue-600 rounded-2xl p-5 shadow-sm flex flex-col justify-between text-white">
        <div className="flex items-center gap-2">
          <Star size={16} className="text-indigo-200" />
          <p className="text-xs font-semibold text-indigo-200 uppercase tracking-wider">Today</p>
        </div>
        <div>
          <p className="text-5xl font-black mt-3">{completedToday}</p>
          <p className="text-sm font-medium text-indigo-100 mt-1">
            {completedToday === 1 ? 'task' : 'tasks'} completed today
          </p>
        </div>
        <div className="flex items-center gap-2 mt-4">
          <CheckCircle size={14} className="text-indigo-200" />
          <Clock size={14} className="text-indigo-200" />
          <span className="text-xs text-indigo-200">{pending} still pending</span>
        </div>
      </div>

    </div>
  );
}
