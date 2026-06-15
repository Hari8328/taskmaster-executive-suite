import { useEffect, useState } from "react";
import { motion } from "motion/react";
import {
  Map as MapIcon,
  Loader2,
  Zap,
  RefreshCcw,
  Clock,
  Star,
  ArrowRight
} from "lucide-react";
import { taskService } from "../services/taskService";
import { getAIRoadmapAndTimetable } from "../lib/gemini";
const RoadmapView = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [startTime, setStartTime] = useState(() => localStorage.getItem("roadmap_start_time") || "09:00");
  const [endTime, setEndTime] = useState(() => localStorage.getItem("roadmap_end_time") || "18:00");
  const fetchRoadmap = async (isRefetch = false, customStart = startTime, customEnd = endTime) => {
    if (isRefetch) setIsRefreshing(true);
    else setLoading(true);
    try {
      const response = await taskService.getMyTasks();
      const tasks = response.content || [];
      const roadmapData = await getAIRoadmapAndTimetable(tasks, customStart, customEnd);
      setData(roadmapData);
      localStorage.setItem("roadmap_start_time", customStart);
      localStorage.setItem("roadmap_end_time", customEnd);
    } catch (error) {
      console.error("Error fetching roadmap:", error);
      const fallbackTimes = (() => {
        try {
          const parseTime = (str) => {
            const [h, m] = str.split(":").map(Number);
            return h * 60 + m;
          };
          const formatTime = (minutes) => {
            const h = Math.floor(minutes / 60) % 24;
            const m = minutes % 60;
            return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`;
          };
          const startMin = parseTime(customStart || "09:00");
          const endMin = parseTime(customEnd || "18:00");
          const diff = endMin > startMin ? endMin - startMin : 24 * 60 - startMin + endMin;
          const times = [];
          for (let i = 0; i < 3; i++) {
            const fraction = 2 > 0 ? i / 2 : 0;
            const slotMin = Math.round(startMin + diff * fraction);
            times.push(formatTime(slotMin));
          }
          return times;
        } catch (e) {
          return ["09:00", "13:30", "18:00"];
        }
      })();
      setData({
        vision: "Consistent progress and focused architectural intent scheduled to your custom rhythm.",
        roadmap: [
          { phase: "Beginning Momentum", goal: `Initialize primary high-impact structures starting at ${customStart}.` },
          { phase: "Sustained Core Focus", goal: "Execute active tasks without switching contexts mid-day." },
          { phase: "Completion & Reflection", goal: `Conclude and evaluate progress for tomorrow, completing by ${customEnd}.` }
        ],
        timetable: [
          { time: fallbackTimes[0], activity: "Deep Work Foundation Sprint", vibe: "Focused" },
          { time: fallbackTimes[1], activity: "Structural Maintenance & Flow", vibe: "Organized" },
          { time: fallbackTimes[2], activity: "Future Horizon Review & Cleanup", vibe: "Visionary" }
        ]
      });
    } finally {
      setLoading(false);
      setIsRefreshing(false);
    }
  };
  useEffect(() => {
    fetchRoadmap();
  }, []);
  if (loading) {
    return <div className="h-full flex flex-col items-center justify-center space-y-4">
        <Loader2 className="animate-spin text-brand-blue" size={40} />
        <p className="font-serif italic text-editorial-muted text-center max-w-xs">
          Architecting your daily roadmap... <br /> Finding the optimal path for success.
        </p>
      </div>;
  }
  if (!data) return null;
  return <main className="p-4 md:p-8 max-w-5xl mx-auto space-y-8 md:space-y-12">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-2">
          <div className="flex items-center space-x-2">
            <div className="p-2 bg-brand-blue/10 rounded-lg">
              <MapIcon className="text-brand-blue w-5 h-5 md:w-6 md:h-6" />
            </div>
            <h1 className="text-2xl md:text-3xl font-serif italic text-editorial-ink">Daily Roadmap</h1>
          </div>
          <p className="text-editorial-muted font-serif italic text-sm md:text-base max-w-sm">
            {data.vision}
          </p>
        </div>
        
        <button
    onClick={() => fetchRoadmap(true)}
    disabled={isRefreshing}
    className="w-fit flex items-center space-x-2 px-6 py-2.5 bg-brand-blue text-white hover:bg-brand-blue/90 transition-all rounded-sm font-mono text-[10px] uppercase tracking-[0.2em] shadow-lg shadow-brand-blue/20 disabled:opacity-50"
  >
          {isRefreshing ? <Loader2 size={14} className="animate-spin" /> : <RefreshCcw size={14} />}
          <span>Re-Architect Schedule</span>
        </button>
      </header>

      {
    /* Timing Boundary Configuration Panel */
  }
      <div className="bg-editorial-paper border border-editorial-border p-5 flex flex-col lg:flex-row lg:items-center justify-between gap-6 shadow-sm rounded-sm animate-in fade-in slide-in-from-top-4 duration-300">
        <div className="space-y-1">
          <div className="flex items-center space-x-2 text-editorial-ink">
            <Clock size={16} className="text-brand-blue" />
            <h3 className="font-mono text-xs uppercase tracking-widest font-bold">Designate Time-Window</h3>
          </div>
          <p className="text-xs text-editorial-muted font-serif italic">
            Specify your productive start and end times below. Re-generate to map tasks to those specific hours.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-4 lg:justify-end">
          {
    /* Start Time Picker */
  }
          <div className="flex items-center space-x-2">
            <label className="font-mono text-[10px] uppercase text-editorial-muted tracking-wider">Start:</label>
            <input
    type="time"
    value={startTime}
    onChange={(e) => setStartTime(e.target.value)}
    className="px-2.5 py-1.5 border border-editorial-border hover:border-editorial-ink focus:border-brand-blue focus:outline-none bg-white font-mono text-xs font-bold text-editorial-ink shadow-inner rounded transition-all"
    id="roadmap-start-time-input"
  />
          </div>

          <div className="text-editorial-muted hidden sm:block">➔</div>

          {
    /* End Time Picker */
  }
          <div className="flex items-center space-x-2">
            <label className="font-mono text-[10px] uppercase text-editorial-muted tracking-wider">End:</label>
            <input
    type="time"
    value={endTime}
    onChange={(e) => setEndTime(e.target.value)}
    className="px-2.5 py-1.5 border border-editorial-border hover:border-editorial-ink focus:border-brand-blue focus:outline-none bg-white font-mono text-xs font-bold text-editorial-ink shadow-inner rounded transition-all"
    id="roadmap-end-time-input"
  />
          </div>

          {
    /* Quick preset suggestions */
  }
          <div className="flex items-center gap-1.5 pl-3 border-l border-editorial-border">
            <button
    onClick={() => {
      setStartTime("09:00");
      setEndTime("17:00");
      fetchRoadmap(true, "09:00", "17:00");
    }}
    className="px-2 py-1 border border-editorial-border hover:border-editorial-ink bg-white text-[9px] font-mono font-bold text-editorial-muted hover:text-editorial-ink transition-all rounded"
    title="Standard 9-to-5 work window"
    id="preset-9-to-5"
  >
              9-to-5
            </button>
            <button
    onClick={() => {
      setStartTime("06:00");
      setEndTime("14:00");
      fetchRoadmap(true, "06:00", "14:00");
    }}
    className="px-2 py-1 border border-editorial-border hover:border-editorial-ink bg-white text-[9px] font-mono font-bold text-editorial-muted hover:text-editorial-ink transition-all rounded"
    title="Early morning flow"
    id="preset-early-bird"
  >
              Early Bird
            </button>
            <button
    onClick={() => {
      setStartTime("18:00");
      setEndTime("23:00");
      fetchRoadmap(true, "18:00", "23:00");
    }}
    className="px-2 py-1 border border-editorial-border hover:border-editorial-ink bg-white text-[9px] font-mono font-bold text-editorial-muted hover:text-editorial-ink transition-all rounded"
    title="Late night session"
    id="preset-night"
  >
              Night Shift
            </button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
        {
    /* Roadmap Phases */
  }
        <div className="lg:col-span-4 space-y-8">
           <div className="flex items-center space-x-2 border-b border-editorial-border pb-4">
              <Zap size={18} className="text-editorial-accent" />
              <h2 className="font-mono text-xs uppercase tracking-widest text-editorial-ink">Strategic Phases</h2>
           </div>
           <div className="space-y-6">
             {data.roadmap.map((item, i) => <motion.div
    key={i}
    initial={{ opacity: 0, x: -20 }}
    animate={{ opacity: 1, x: 0 }}
    transition={{ delay: i * 0.1 }}
    className="relative pl-8 border-l border-editorial-border"
  >
                  <div className="absolute -left-[5px] top-0 w-2.5 h-2.5 rounded-full bg-editorial-accent border-2 border-white shadow-sm" />
                  <div className="space-y-1">
                    <h3 className="font-serif italic text-lg text-editorial-ink">{item.phase}</h3>
                    <p className="text-xs text-editorial-muted leading-relaxed">{item.goal}</p>
                  </div>
                </motion.div>)}
           </div>
           
           <div className="p-8 bg-editorial-muted/5 border border-dashed border-editorial-border rounded-sm space-y-4">
              <div className="flex items-center space-x-2">
                 <Star size={14} className="text-brand-blue" />
                 <p className="font-mono text-[10px] uppercase tracking-widest">Architect's Tip</p>
              </div>
              <p className="text-xs font-serif italic text-editorial-ink/70">
                "The secret of forward motion is to finish what you start before allowing the mind to drift to the next structure."
              </p>
           </div>
        </div>

        {
    /* Timetable */
  }
        <div className="lg:col-span-8 space-y-8">
           <div className="flex items-center space-x-2 border-b border-editorial-border pb-4">
              <Clock size={18} className="text-brand-blue" />
              <h2 className="font-mono text-xs uppercase tracking-widest text-editorial-ink">Daily Timetable</h2>
           </div>
           
           <div className="border border-editorial-border rounded-sm bg-white overflow-hidden shadow-sm">
             <div className="hidden md:grid md:grid-cols-[100px_1fr_120px] gap-4 p-4 border-b border-editorial-border bg-editorial-muted/10 font-mono text-[10px] uppercase tracking-[0.2em] text-editorial-muted">
                <div>Time</div>
                <div>Focus Activity</div>
                <div className="text-right">Vibe</div>
             </div>
             
             <div className="divide-y divide-editorial-border">
                {data.timetable.map((item, i) => <motion.div
    key={i}
    initial={{ opacity: 0, y: 10 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay: i * 0.05 }}
    className="flex flex-col md:grid md:grid-cols-[100px_1fr_120px] gap-3 md:gap-4 p-4 md:p-6 items-start md:items-center group hover:bg-brand-blue/[0.02] transition-colors"
  >
                    <div className="font-mono text-sm font-medium text-brand-blue shrink-0">
                      {item.time}
                    </div>
                    <div className="flex items-center space-x-3 w-full">
                      <div className="hidden md:block w-2 h-2 rounded-full border border-editorial-border bg-white group-hover:border-brand-blue group-hover:bg-brand-blue transition-all" />
                      <span className="text-base md:text-lg text-editorial-ink font-serif leading-tight group-hover:italic transition-all">
                        {item.activity}
                      </span>
                    </div>
                    <div className="text-right w-full md:w-auto">
                       <span className="px-2 py-1 bg-editorial-paper border border-editorial-border text-[8px] md:text-[9px] font-mono uppercase tracking-widest text-editorial-muted rounded">
                         {item.vibe}
                       </span>
                    </div>
                  </motion.div>)}
             </div>
           </div>
           
           <div className="flex flex-col items-center justify-center p-12 border border-brand-blue/10 bg-brand-blue/5 rounded-sm text-center space-y-6">
              <div className="space-y-2">
                <h3 className="text-2xl font-serif italic text-editorial-ink">Ready to begin?</h3>
                <p className="text-editorial-muted text-sm max-w-sm font-serif">
                  Your architecture is set. Now, the only thing remaining is the action.
                </p>
              </div>
              <button
    className="flex items-center space-x-3 text-[10px] font-mono uppercase tracking-[0.3em] text-brand-blue group"
  >
                <span>Commit to this plan</span>
                <ArrowRight size={14} className="group-hover:translate-x-2 transition-transform" />
              </button>
           </div>
        </div>
      </div>
    </main>;
};
export default RoadmapView;
