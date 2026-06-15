import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  BarChart2,
  Clock,
  Trash2,
  Search,
  Filter,
  Activity,
  Brain,
  Zap,
  CheckCircle2,
  Coffee,
  RotateCcw,
  Calendar,
  Layers,
  ChevronDown
} from "lucide-react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip
} from "recharts";
const DEFAULT_SESSIONS = [
  {
    id: "sample-session-1",
    startTime: new Date(Date.now() - 3 * 24 * 60 * 60 * 1e3 - 4 * 60 * 60 * 1e3).toISOString(),
    // 3 days ago
    endTime: new Date(Date.now() - 3 * 24 * 60 * 60 * 1e3 - 3 * 60 * 60 * 1e3 - 35 * 60 * 1e3).toISOString(),
    durationSeconds: 1500,
    // 25m
    taskTitle: "Refactor Core Database Connections",
    taskCategory: "Development",
    timerMode: "pomodoro"
  },
  {
    id: "sample-session-2",
    startTime: new Date(Date.now() - 2 * 24 * 60 * 60 * 1e3 - 6 * 60 * 60 * 1e3).toISOString(),
    // 2 days ago
    endTime: new Date(Date.now() - 2 * 24 * 60 * 60 * 1e3 - 5 * 60 * 60 * 1e3).toISOString(),
    durationSeconds: 3600,
    // 60m
    taskTitle: "Design Interactive Dashboard Prototype",
    taskCategory: "Design",
    timerMode: "stopwatch"
  },
  {
    id: "sample-session-3",
    startTime: new Date(Date.now() - 2 * 24 * 60 * 60 * 1e3 - 2 * 60 * 60 * 1e3).toISOString(),
    endTime: new Date(Date.now() - 2 * 24 * 60 * 60 * 1e3 - 1 * 60 * 60 * 1e3 - 35 * 60 * 1e3).toISOString(),
    durationSeconds: 1500,
    // 25m
    taskTitle: "Review Marketing Documentation Spec",
    taskCategory: "Marketing",
    timerMode: "pomodoro"
  },
  {
    id: "sample-session-4",
    startTime: new Date(Date.now() - 1 * 24 * 60 * 60 * 1e3 - 5 * 60 * 60 * 1e3).toISOString(),
    // Yesterday
    endTime: new Date(Date.now() - 1 * 24 * 60 * 60 * 1e3 - 4 * 60 * 60 * 1e3 - 15 * 60 * 1e3).toISOString(),
    durationSeconds: 2700,
    // 45m
    taskTitle: "Establish API Secure Proxy Routes",
    taskCategory: "Development",
    timerMode: "long"
  },
  {
    id: "sample-session-5",
    startTime: new Date(Date.now() - 3 * 60 * 60 * 1e3).toISOString(),
    // Today
    endTime: new Date(Date.now() - 2.5 * 60 * 60 * 1e3).toISOString(),
    durationSeconds: 1800,
    // 30m
    taskTitle: "Clean up Navigation and State Transitions",
    taskCategory: "Design",
    timerMode: "stopwatch"
  }
];
export default function FocusLogsView() {
  const [sessions, setSessions] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [selectedMode, setSelectedMode] = useState("All");
  const [showConfirmClear, setShowConfirmClear] = useState(false);
  const containerRef = useRef(null);
  const [containerWidth, setContainerWidth] = useState(0);
  useEffect(() => {
    if (!containerRef.current) return;
    const observer = new ResizeObserver((entries) => {
      for (let entry of entries) {
        setContainerWidth(entry.contentRect.width);
      }
    });
    observer.observe(containerRef.current);
    return () => observer.disconnect();
  }, []);
  useEffect(() => {
    const raw = localStorage.getItem("horizon_focus_sessions");
    if (raw) {
      try {
        setSessions(JSON.parse(raw));
      } catch (e) {
        console.error("Failed to parse focus sessions", e);
        setSessions(DEFAULT_SESSIONS);
      }
    } else {
      localStorage.setItem("horizon_focus_sessions", JSON.stringify(DEFAULT_SESSIONS));
      setSessions(DEFAULT_SESSIONS);
    }
  }, []);
  const handleDeleteSession = (id) => {
    const updated = sessions.filter((s) => s.id !== id);
    setSessions(updated);
    localStorage.setItem("horizon_focus_sessions", JSON.stringify(updated));
  };
  const handleClearAll = () => {
    localStorage.setItem("horizon_focus_sessions", JSON.stringify([]));
    setSessions([]);
    setShowConfirmClear(false);
  };
  const handleResetDefaults = () => {
    localStorage.setItem("horizon_focus_sessions", JSON.stringify(DEFAULT_SESSIONS));
    setSessions(DEFAULT_SESSIONS);
  };
  const formatDurationReadable = (totalSeconds) => {
    const hrs = Math.floor(totalSeconds / 3600);
    const mins = Math.floor(totalSeconds % 3600 / 60);
    const secs = totalSeconds % 60;
    if (hrs > 0) {
      return `${hrs}h ${mins}m ${secs}s`;
    }
    if (mins > 0) {
      return `${mins}m ${secs}s`;
    }
    return `${secs}s`;
  };
  const formatShortDuration = (totalSeconds) => {
    const mins = Math.round(totalSeconds / 60);
    return `${mins}m`;
  };
  const formatDateLabel = (isoStr) => {
    const date = new Date(isoStr);
    return date.toLocaleDateString("en-IN", {
      day: "numeric",
      month: "short",
      year: "numeric"
    });
  };
  const formatTimeLabel = (isoStr) => {
    const date = new Date(isoStr);
    return date.toLocaleTimeString("en-IN", {
      hour: "numeric",
      minute: "2-digit",
      hour12: true
    });
  };
  const categories = ["All", ...Array.from(new Set(sessions.map((s) => s.taskCategory || "General")))];
  const modes = ["All", "pomodoro", "short", "long", "stopwatch"];
  const filteredSessions = sessions.filter((s) => {
    const matchesSearch = s.taskTitle?.toLowerCase().includes(searchQuery.toLowerCase()) || s.taskCategory?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === "All" || s.taskCategory === selectedCategory;
    const matchesMode = selectedMode === "All" || s.timerMode === selectedMode;
    return matchesSearch && matchesCategory && matchesMode;
  }).sort((a, b) => new Date(b.startTime).getTime() - new Date(a.startTime).getTime());
  const totalFocusSeconds = sessions.reduce((acc, s) => acc + s.durationSeconds, 0);
  const totalSessionsCompleted = sessions.length;
  const averageDurationMs = totalSessionsCompleted > 0 ? Math.round(totalFocusSeconds / totalSessionsCompleted) : 0;
  const highlyProductiveGroup = sessions.reduce((acc, s) => {
    const cat = s.taskCategory || "General";
    acc[cat] = (acc[cat] || 0) + s.durationSeconds;
    return acc;
  }, {});
  let peakCategory = "N/A";
  let peakSeconds = 0;
  Object.keys(highlyProductiveGroup).forEach((cat) => {
    if (highlyProductiveGroup[cat] > peakSeconds) {
      peakSeconds = highlyProductiveGroup[cat];
      peakCategory = cat;
    }
  });
  const getTrendDataForChart = () => {
    const datesMap = {};
    for (let i = 6; i >= 0; i--) {
      const date = new Date(Date.now() - i * 24 * 60 * 60 * 1e3);
      const label = date.toLocaleDateString("en-IN", { day: "numeric", month: "short" });
      datesMap[label] = { label, seconds: 0, count: 0, minutes: 0 };
    }
    sessions.forEach((s) => {
      const sessionDateLabel = new Date(s.startTime).toLocaleDateString("en-IN", { day: "numeric", month: "short" });
      if (datesMap[sessionDateLabel] !== void 0) {
        datesMap[sessionDateLabel].seconds += s.durationSeconds;
        datesMap[sessionDateLabel].minutes = Math.round(datesMap[sessionDateLabel].seconds / 60);
        datesMap[sessionDateLabel].count += 1;
      }
    });
    return Object.values(datesMap);
  };
  const chartData = getTrendDataForChart();
  return <div className="p-4 sm:p-6 md:p-10 max-w-7xl mx-auto space-y-10 text-left" id="focus-logs-view-root">
      
      {
    /* Header Panel */
  }
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 border-b border-editorial-border/40 pb-8">
        <div>
          <div className="flex items-center space-x-2 text-editorial-accent mb-2">
            <Brain className="w-5 h-5 text-editorial-accent animate-pulse" />
            <span className="text-xs font-mono uppercase tracking-widest font-semibold">Self-Discipline Analytics</span>
          </div>
          <h1 className="text-3xl md:text-4xl font-serif italic text-editorial-ink font-bold tracking-tight">Focus Chamber Logs</h1>
          <p className="text-xs text-editorial-muted mt-1 max-w-xl">
            Review detailed, chronologically connected timelines of previous focus sessions. Keep track of deep brainwork consistency and build deep-work habits.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2 sm:gap-3 shrink-0">
          <button
    onClick={handleResetDefaults}
    className="flex items-center space-x-1.5 px-3 py-2 border border-editorial-border/60 hover:bg-slate-100 rounded-xl text-xs font-mono uppercase transition-colors text-slate-600"
    title="Reset history with sample entries to view chart immediately"
  >
            <RotateCcw size={13} />
            <span>Load Sample Seeding</span>
          </button>
          
          <button
    onClick={() => setShowConfirmClear(true)}
    className="flex items-center space-x-1.5 px-3 py-2 bg-red-500 hover:bg-red-600 text-white rounded-xl text-xs font-mono uppercase tracking-wider transition-colors shadow-sm shadow-red-500/10"
  >
            <Trash2 size={13} />
            <span>Clear History</span>
          </button>
        </div>
      </div>

      {
    /* Confirmation Modal */
  }
      <AnimatePresence>
        {showConfirmClear && <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <motion.div
    initial={{ opacity: 0, scale: 0.95 }}
    animate={{ opacity: 1, scale: 1 }}
    exit={{ opacity: 0, scale: 0.95 }}
    className="bg-white p-6 md:p-8 rounded-3xl max-w-md w-full shadow-2xl border border-slate-100 text-left"
  >
              <h3 className="text-lg font-serif italic text-editorial-ink font-bold mb-2">Wipe Focus Chamber History?</h3>
              <p className="text-xs text-editorial-muted leading-relaxed mb-6">
                Are you absolutely sure you want to permanently delete all recorded focus sessions? This action is irreversible and will empty the database and stats cards.
              </p>
              <div className="flex justify-end space-x-3">
                <button
    onClick={() => setShowConfirmClear(false)}
    className="px-4 py-2 border border-slate-200 hover:bg-slate-50 rounded-xl text-xs uppercase font-mono font-bold text-slate-500"
  >
                  Cancel
                </button>
                <button
    onClick={handleClearAll}
    className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-xl text-xs uppercase font-mono font-bold shadow-md shadow-red-500/10"
  >
                  Confirm Delete
                </button>
              </div>
            </motion.div>
          </div>}
      </AnimatePresence>

      {
    /* Metrics Cards Grid */
  }
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        {
    /* Total Focus Time */
  }
        <div className="bg-[#fcfcfa] border border-editorial-border/40 p-5 rounded-3xl shadow-sm relative overflow-hidden group hover:shadow-md transition-all">
          <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:scale-110 transition-transform">
            <Clock size={80} className="text-editorial-accent" />
          </div>
          <span className="text-[10px] font-mono uppercase tracking-widest text-slate-400 block mb-2">Aggregate Minutes</span>
          <div className="flex items-baseline space-x-1.5">
            <h4 className="text-2xl sm:text-3xl font-serif italic font-bold text-editorial-ink">
              {formatDurationReadable(totalFocusSeconds)}
            </h4>
          </div>
          <span className="text-[10px] text-editorial-muted block mt-2 font-serif italic">
            Cumulative total duration of brainwork session states.
          </span>
        </div>

        {
    /* Sessions Completed */
  }
        <div className="bg-[#fcfcfa] border border-editorial-border/40 p-5 rounded-3xl shadow-sm relative overflow-hidden group hover:shadow-md transition-all">
          <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:scale-110 transition-transform">
            <CheckCircle2 size={80} className="text-editorial-accent" />
          </div>
          <span className="text-[10px] font-mono uppercase tracking-widest text-slate-400 block mb-2">Sessions Finished</span>
          <h4 className="text-2xl sm:text-3xl font-serif italic font-bold text-editorial-ink">
            {totalSessionsCompleted} <span className="text-xs font-mono uppercase text-slate-400 not-italic">cycles</span>
          </h4>
          <span className="text-[10px] text-editorial-muted block mt-2 font-serif italic">
            Total distinct Pomodoro, long breaks, or custom stopwatch focus runs.
          </span>
        </div>

        {
    /* Average Focus Length */
  }
        <div className="bg-[#fcfcfa] border border-editorial-border/40 p-5 rounded-3xl shadow-sm relative overflow-hidden group hover:shadow-md transition-all">
          <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:scale-110 transition-transform">
            <Activity size={80} className="text-sky-500" />
          </div>
          <span className="text-[10px] font-mono uppercase tracking-widest text-slate-400 block mb-2">Avg Session Range</span>
          <h4 className="text-2xl sm:text-3xl font-serif italic font-bold text-editorial-ink">
            {totalSessionsCompleted > 0 ? formatShortDuration(averageDurationMs) : "0m"}
          </h4>
          <span className="text-[10px] text-editorial-muted block mt-2 font-serif italic">
            Avg individual session block duration.
          </span>
        </div>

        {
    /* Most Productive Category */
  }
        <div className="bg-[#fcfcfa] border border-editorial-border/40 p-5 rounded-3xl shadow-sm relative overflow-hidden group hover:shadow-md transition-all">
          <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:scale-110 transition-transform">
            <Zap size={80} className="text-amber-500" />
          </div>
          <span className="text-[10px] font-mono uppercase tracking-widest text-slate-400 block mb-2">Prime Target Category</span>
          <h4 className="text-2xl sm:text-3xl font-serif italic font-bold text-editorial-ink truncate pr-8" title={peakCategory}>
            {peakCategory}
          </h4>
          <span className="text-[10px] text-editorial-muted block mt-2 font-serif italic">
            The work category with the greatest cumulative focus minutes.
          </span>
        </div>
      </div>

      {
    /* Main Grid: Data trends area + Filters details */
  }
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {
    /* Trend Area Chart (Left) */
  }
        <div className="lg:col-span-8 bg-editorial-muted/5 border border-editorial-border/30 rounded-3xl p-4 sm:p-6 shadow-inner overflow-hidden min-w-0">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-2">
              <BarChart2 className="w-4 h-4 text-editorial-ink" />
              <h3 className="text-sm font-mono uppercase tracking-wider font-bold">Activity Wave (Daily Focus Minutes)</h3>
            </div>
            <span className="text-[10px] font-mono text-slate-400 uppercase">Last 7 Days Sequence</span>
          </div>

          <div className="relative h-[280px] w-full" id="focus-trend-chart-container" ref={containerRef}>
            {totalFocusSeconds === 0 ? <div className="h-full flex flex-col items-center justify-center text-center p-8">
                <Calendar className="w-10 h-10 text-slate-300 mb-2 animate-bounce" />
                <p className="text-xs font-serif italic text-slate-500">No active focus sessions logged inside the current week frame.</p>
                <button
    onClick={handleResetDefaults}
    className="mt-3 px-3 py-1.5 bg-editorial-ink hover:bg-slate-800 text-editorial-paper text-[10px] uppercase font-mono rounded-lg transition-colors"
  >
                  Load Sample Data to View Chart
                </button>
              </div> : containerWidth > 0 ? <AreaChart
    width={containerWidth}
    height={280}
    data={chartData}
    margin={{ top: 10, right: 10, left: -10, bottom: 0 }}
  >
                <CartesianGrid stroke="#e2e8f0" strokeOpacity={0.6} vertical={false} />
                <XAxis
    dataKey="label"
    tick={{ fontSize: 10, fontFamily: "monospace" }}
    stroke="#94a3b8"
    tickLine={false}
  />
                <YAxis
    tick={{ fontSize: 10, fontFamily: "monospace" }}
    stroke="#94a3b8"
    tickLine={false}
    axisLine={false}
  />
                <Tooltip
    contentStyle={{
      backgroundColor: "#ffffff",
      borderRadius: "16px",
      border: "1px solid #e2e8f0",
      fontSize: "11px",
      fontFamily: "sans-serif",
      boxShadow: "0 4px 12px rgba(0,0,0,0.05)"
    }}
    labelStyle={{ fontWeight: "bold", color: "#1e293b" }}
  />
                <Area
    type="monotone"
    dataKey="minutes"
    name="Focused Minutes"
    stroke="#1e293b"
    strokeWidth={2}
    fillOpacity={0.15}
    fill="#1e293b"
  />
              </AreaChart> : null}
          </div>
        </div>

        {
    /* Filter console (Right) */
  }
        <div className="lg:col-span-4 bg-[#fcfcfa] border border-editorial-border/40 p-6 rounded-3xl shadow-sm shrink-0 space-y-6">
          <div className="flex items-center space-x-2 border-b border-slate-100 pb-3 mb-2">
            <Filter size={15} className="text-editorial-accent" />
            <span className="text-xs font-mono uppercase tracking-wider font-bold">Query Console</span>
          </div>

          {
    /* Search Box */
  }
          <div className="space-y-1.5">
            <label className="text-[10px] font-mono uppercase text-slate-500 block">Search Focus Target</label>
            <div className="relative">
              <input
    type="text"
    value={searchQuery}
    onChange={(e) => setSearchQuery(e.target.value)}
    placeholder="Search tasks, categories..."
    className="w-full text-xs pl-9 pr-3 py-2.5 bg-white border border-editorial-border/40 rounded-xl focus:outline-none focus:border-editorial-accent transition-colors"
  />
              <Search className="absolute left-3 top-3 w-4 h-4 text-slate-400" />
            </div>
          </div>

          {
    /* Category Dropdown */
  }
          <div className="space-y-1.5">
            <label className="text-[10px] font-mono uppercase text-slate-500 block">Category Focus Area</label>
            <div className="relative">
              <select
    value={selectedCategory}
    onChange={(e) => setSelectedCategory(e.target.value)}
    className="w-full text-xs pl-3 pr-8 py-2.5 bg-white border border-editorial-border/40 rounded-xl focus:outline-none focus:border-editorial-accent appearance-none transition-colors cursor-pointer"
  >
                {categories.map((cat) => <option key={cat} value={cat}>{cat}</option>)}
              </select>
              <ChevronDown className="absolute right-3 top-3 w-4 h-4 text-slate-400 pointer-events-none" />
            </div>
          </div>

          {
    /* Mode Dropdown */
  }
          <div className="space-y-1.5">
            <label className="text-[10px] font-mono uppercase text-slate-500 block">Chronology Timer Mode</label>
            <div className="relative">
              <select
    value={selectedMode}
    onChange={(e) => setSelectedMode(e.target.value)}
    className="w-full text-xs pl-3 pr-8 py-2.5 bg-white border border-editorial-border/40 rounded-xl focus:outline-none focus:border-editorial-accent appearance-none transition-colors cursor-pointer"
  >
                {modes.map((mode) => <option key={mode} value={mode}>
                    {mode === "All" ? "All Modes" : mode.toUpperCase()}
                  </option>)}
              </select>
              <ChevronDown className="absolute right-3 top-3 w-4 h-4 text-slate-400 pointer-events-none" />
            </div>
          </div>

          {
    /* Reset Filters Quick link */
  }
          {(searchQuery || selectedCategory !== "All" || selectedMode !== "All") && <button
    onClick={() => {
      setSearchQuery("");
      setSelectedCategory("All");
      setSelectedMode("All");
    }}
    className="text-[10px] font-mono text-editorial-accent hover:underline uppercase block pt-2"
  >
              Reset view filters
            </button>}
        </div>
      </div>

      {
    /* Exquisite Timeline Section */
  }
      <div className="space-y-6">
        <div className="flex items-center justify-between border-b border-stroke-accent pb-3">
          <div className="flex items-center space-x-2">
            <Layers className="w-4 h-4 text-editorial-ink" />
            <h3 className="text-sm font-mono uppercase tracking-wider font-bold">Chronological Work Waves</h3>
          </div>
          <span className="text-xs font-mono text-slate-400">{filteredSessions.length} visible logs</span>
        </div>

        {filteredSessions.length === 0 ? <div className="bg-slate-50 border border-slate-100/50 rounded-3xl p-12 text-center max-w-xl mx-auto space-y-4">
            <div className="w-12 h-12 bg-slate-100 rounded-full flex items-center justify-center mx-auto text-slate-400">
              <Search size={22} />
            </div>
            <div>
              <p className="text-sm font-medium text-slate-700">No session logs match your filters</p>
              <p className="text-xs text-slate-500 mt-1">Try resetting the custom queries on the sidebar filter console.</p>
            </div>
          </div> : <div className="relative pl-6 md:pl-10 border-l border-slate-200 mt-4 space-y-10">
            {
    /* Timeline connection connector lines elements inside loop */
  }
            {filteredSessions.map((session, index) => {
    const isPomodoro = session.timerMode?.toLowerCase() === "pomodoro";
    const isBreak = session.timerMode?.toLowerCase() === "short" || session.timerMode?.toLowerCase() === "long";
    const isStopwatch = session.timerMode?.toLowerCase() === "stopwatch";
    return <motion.div
      key={session.id}
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: Math.min(index * 0.05, 0.4) }}
      className="relative text-left"
    >
                  {
      /* Circle Marker timeline bullet dot */
    }
                  <div className={`absolute -left-[36px] md:-left-[52px] top-5 md:top-6 w-6 h-6 rounded-full flex items-center justify-center border-2 transition-all shadow-sm ${isPomodoro ? "bg-red-50 border-red-500 text-red-500" : isBreak ? "bg-emerald-50 border-emerald-500 text-emerald-500" : "bg-sky-50 border-sky-500 text-sky-500"}`}>
                    {isPomodoro && <Brain size={12} />}
                    {isBreak && <Coffee size={12} />}
                    {isStopwatch && <Activity size={12} />}
                  </div>

                  {
      /* Log Block */
    }
                  <div className="bg-[#fcfcfa] border border-editorial-border/40 hover:border-editorial-border rounded-3xl p-5 md:p-6 shadow-sm hover:shadow-md transition-all flex flex-col md:flex-row md:items-center justify-between gap-6 group">
                    <div className="space-y-2 flex-1">
                      {
      /* Meta context line */
    }
                      <div className="flex flex-wrap items-center gap-2.5">
                        <span className="text-[10px] font-mono font-bold uppercase py-0.5 px-2 bg-slate-100 border border-slate-200/50 rounded-full text-slate-600">
                          {session.taskCategory || "General"}
                        </span>
                        
                        {
      /* Session type badge */
    }
                        <span className={`text-[9px] font-mono uppercase font-bold py-0.5 px-2 rounded-full ${session.timerMode === "pomodoro" ? "bg-red-500/10 text-red-600 border border-red-200/50" : session.timerMode === "short" ? "bg-emerald-500/10 text-emerald-600 border border-emerald-200/50" : session.timerMode === "long" ? "bg-teal-500/10 text-teal-600 border border-teal-200/50" : "bg-sky-500/10 text-sky-600 border border-sky-200/50"}`}>
                          {session.timerMode === "pomodoro" ? "\u{1F345} Pomodoro Block" : session.timerMode === "short" ? "\u2615 Short Break" : session.timerMode === "long" ? "\u{1F332} Long Break" : "\u23F1\uFE0F Stopwatch Tracker"}
                        </span>

                        {
      /* Relative date indicator */
    }
                        <div className="flex items-center space-x-1 text-[10px] font-mono text-slate-400">
                          <Calendar size={11} />
                          <span>{formatDateLabel(session.startTime)}</span>
                        </div>
                      </div>

                      {
      /* Title */
    }
                      <h4 className="text-base font-serif italic text-editorial-ink font-bold leading-snug">
                        {session.taskTitle || "Adhoc Focus Session"}
                      </h4>

                      {
      /* Precise Timestamp tags */
    }
                      <div className="flex items-center space-x-4 text-[10px] font-mono text-slate-400">
                        <span className="flex items-center space-x-1">
                          <Clock size={11} />
                          <span>{formatTimeLabel(session.startTime)} - {formatTimeLabel(session.endTime)}</span>
                        </span>
                      </div>
                    </div>

                    {
      /* Numeric tracking duration details & action */
    }
                    <div className="flex items-center space-x-6 justify-between md:justify-end shrink-0 border-t md:border-t-0 border-slate-100 pt-3 md:pt-0">
                      <div className="text-left md:text-right">
                        <span className="text-[9px] font-mono uppercase text-slate-400 block tracking-wider">Tracked Interval</span>
                        <span className="text-lg font-serif italic font-bold text-editorial-accent leading-none block">
                          {formatDurationReadable(session.durationSeconds)}
                        </span>
                      </div>

                      {
      /* Trash action */
    }
                      <button
      onClick={() => handleDeleteSession(session.id)}
      className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all opacity-100 md:opacity-0 md:group-hover:opacity-100 focus:opacity-100"
      title="Delete Session Log"
    >
                        <Trash2 size={15} />
                      </button>
                    </div>
                  </div>
                </motion.div>;
  })}
          </div>}
      </div>

    </div>;
}
