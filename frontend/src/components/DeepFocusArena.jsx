import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  Play,
  Pause,
  RefreshCw,
  Volume2,
  VolumeX,
  ArrowLeft,
  CheckCircle,
  ChevronDown,
  Clock,
  Activity,
  Heart
} from "lucide-react";
import { soundscapeSynth } from "../lib/soundscapes";
import { playCompleteSound } from "../lib/audioAndAchievements";
export default function DeepFocusArena({ onExit, initialTask, tasks, onCompleteTask }) {
  const [activeTask, setActiveTask] = useState(initialTask);
  const [customGoal, setCustomGoal] = useState("");
  const [isTaskDropdownOpen, setIsTaskDropdownOpen] = useState(false);
  const [timerMode, setTimerMode] = useState("pomodoro");
  const [secondsRemaining, setSecondsRemaining] = useState(1500);
  const [isTimerRunning, setIsTimerRunning] = useState(false);
  const [secondsFocused, setSecondsFocused] = useState(0);
  const secondsFocusedRef = useRef(0);
  const activeTaskRef = useRef(null);
  const customGoalRef = useRef("");
  const timerModeRef = useRef("pomodoro");
  const sessionSavedRef = useRef(false);
  useEffect(() => {
    secondsFocusedRef.current = secondsFocused;
  }, [secondsFocused]);
  useEffect(() => {
    activeTaskRef.current = activeTask;
  }, [activeTask]);
  useEffect(() => {
    customGoalRef.current = customGoal;
  }, [customGoal]);
  useEffect(() => {
    timerModeRef.current = timerMode;
  }, [timerMode]);
  const saveCurrentSession = () => {
    const duration = secondsFocusedRef.current;
    if (duration <= 0 || sessionSavedRef.current) return;
    try {
      const now = /* @__PURE__ */ new Date();
      const start = new Date(now.getTime() - duration * 1e3);
      const newSession = {
        id: "session-" + Math.random().toString(36).substring(2, 11),
        startTime: start.toISOString(),
        endTime: now.toISOString(),
        durationSeconds: duration,
        taskTitle: activeTaskRef.current ? activeTaskRef.current.title : customGoalRef.current ? customGoalRef.current : "Adhoc Custom Focus",
        taskCategory: activeTaskRef.current ? activeTaskRef.current.category || "General" : "General",
        timerMode: timerModeRef.current
      };
      const existing = localStorage.getItem("horizon_focus_sessions");
      let sessions = [];
      if (existing) {
        sessions = JSON.parse(existing);
      }
      sessions.push(newSession);
      localStorage.setItem("horizon_focus_sessions", JSON.stringify(sessions));
      sessionSavedRef.current = true;
    } catch (e) {
      console.error("Failed to save focus session", e);
    }
  };
  useEffect(() => {
    return () => {
      saveCurrentSession();
    };
  }, []);
  const handleExit = () => {
    saveCurrentSession();
    onExit();
  };
  const [soundType, setSoundType] = useState("rain");
  const [soundVolume, setSoundVolume] = useState(() => {
    return Number(localStorage.getItem("focus_sound_volume") || "0.5");
  });
  const [isSoundPlaying, setIsSoundPlaying] = useState(false);
  const [breathingSeconds, setBreathingSeconds] = useState(0);
  const [isBreathingActive, setIsBreathingActive] = useState(true);
  const pendingTasks = tasks.filter((t) => t.status?.toLowerCase() !== "completed");
  useEffect(() => {
    setIsTimerRunning(false);
    if (timerMode === "pomodoro") setSecondsRemaining(1500);
    else if (timerMode === "short") setSecondsRemaining(300);
    else if (timerMode === "long") setSecondsRemaining(900);
    else setSecondsRemaining(0);
  }, [timerMode]);
  useEffect(() => {
    let interval = null;
    if (isTimerRunning) {
      interval = setInterval(() => {
        setSecondsFocused((prev) => prev + 1);
        if (timerMode === "stopwatch") {
          setSecondsRemaining((prev) => prev + 1);
        } else {
          setSecondsRemaining((prev) => {
            if (prev <= 1) {
              setIsTimerRunning(false);
              playCompleteSound();
              return 0;
            }
            return prev - 1;
          });
        }
      }, 1e3);
    }
    return () => clearInterval(interval);
  }, [isTimerRunning, timerMode]);
  useEffect(() => {
    let interval = null;
    if (isBreathingActive) {
      interval = setInterval(() => {
        setBreathingSeconds((prev) => (prev + 1) % 16);
      }, 1e3);
    }
    return () => clearInterval(interval);
  }, [isBreathingActive]);
  useEffect(() => {
    soundscapeSynth.togglePlay(soundType, isSoundPlaying, soundVolume);
  }, [soundType, isSoundPlaying]);
  useEffect(() => {
    soundscapeSynth.setVolume(soundVolume);
    localStorage.setItem("focus_sound_volume", String(soundVolume));
  }, [soundVolume]);
  useEffect(() => {
    return () => {
      soundscapeSynth.stop();
    };
  }, []);
  const formatTimerDigits = (secCount) => {
    const mm = Math.floor(secCount / 60);
    const ss = secCount % 60;
    return `${String(mm).padStart(2, "0")}:${String(ss).padStart(2, "0")}`;
  };
  const getBreathingLabel = () => {
    if (breathingSeconds < 4) return { text: "Inhale Slowly...", scale: 1.25, color: "text-blue-400" };
    if (breathingSeconds < 8) return { text: "Hold...", scale: 1.25, color: "text-amber-400 font-bold" };
    if (breathingSeconds < 12) return { text: "Exhale Fully...", scale: 0.85, color: "text-teal-400" };
    return { text: "Hold Breath...", scale: 0.85, color: "text-purple-400 font-bold" };
  };
  const handleSoundscapeToggle = (type) => {
    if (soundType === type) {
      setIsSoundPlaying((prev) => !prev);
    } else {
      setSoundType(type);
      setIsSoundPlaying(true);
    }
  };
  const handleFinishAndComplete = async () => {
    if (!activeTask) {
      playCompleteSound();
      handleExit();
      return;
    }
    try {
      await onCompleteTask(activeTask, secondsFocused);
      handleExit();
    } catch (e) {
      console.error(e);
    }
  };
  const handleSetTask = (t) => {
    setActiveTask(t);
    setCustomGoal("");
    setIsTaskDropdownOpen(false);
  };
  const currentBreathingState = getBreathingLabel();
  const getProgressCircleOffset = () => {
    if (timerMode === "stopwatch") return 0;
    const total = timerMode === "pomodoro" ? 1500 : timerMode === "short" ? 300 : 900;
    const fraction = secondsRemaining / total;
    return 578 * (1 - fraction);
  };
  return <div className="fixed inset-0 z-50 bg-slate-950 text-slate-100 flex flex-col justify-between p-6 md:p-10 select-none overflow-y-auto font-sans">
      
      {
    /* Dynamic Ambient Background Dust Sparkles */
  }
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-10 left-10 w-96 h-96 bg-brand-blue/5 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-10 right-10 w-96 h-96 bg-purple-500/5 rounded-full blur-3xl duration-1000 animate-pulse" />
        {isSoundPlaying && <div className="absolute inset-0 bg-[radial-gradient(#ffffff03_1px,transparent_1px)] bg-[size:24px_24px] opacity-60 animate-in fade-in duration-1000" />}
      </div>

      {
    /* Top Header Row */
  }
      <header className="flex items-center justify-between relative z-10 w-full max-w-6xl mx-auto">
        <button
    onClick={handleExit}
    className="flex items-center space-x-2 text-xs font-mono uppercase tracking-widest text-slate-400 hover:text-white transition-colors group"
    id="exit-focus-arena-btn"
  >
          <ArrowLeft size={16} className="transform group-hover:-translate-x-1 transition-transform" />
          <span>Exit Focus Chamber</span>
        </button>

        <div className="flex items-center space-x-1.5 px-3 py-1 bg-slate-900 border border-slate-800 rounded-full text-[10px] font-mono uppercase tracking-widest text-brand-blue">
          <Activity size={12} className="animate-pulse" />
          <span>Neuro-Focus Sphere Active</span>
        </div>
      </header>

      {
    /* Main Grid View */
  }
      <main className="flex-1 max-w-6xl w-full mx-auto grid grid-cols-1 lg:grid-cols-12 gap-10 items-center justify-center my-8 relative z-10">
        
        {
    /* Left Column: Focus Target & Breathing Core */
  }
        <section className="lg:col-span-5 space-y-8 flex flex-col justify-center h-full">
          
          {
    /* Target Task Panel */
  }
          <div className="space-y-4">
            <span className="font-mono text-[9px] uppercase tracking-[0.3em] text-cyan-400 font-bold block">
              CURRENT FOCUS BLUEPRINT
            </span>

            <div className="relative">
              <button
    onClick={() => setIsTaskDropdownOpen((prev) => !prev)}
    className="w-full flex items-center justify-between p-4 bg-slate-900 border border-slate-800 hover:border-slate-700 rounded text-left transition-all"
    id="deep-focus-task-selector-trigger"
  >
                <div className="overflow-hidden pr-3">
                  <h2 className="text-xl md:text-2xl font-serif text-slate-100 font-bold truncate leading-snug">
                    {activeTask ? activeTask.title : customGoal || "Focusing On Free Blueprint"}
                  </h2>
                  <p className="text-xs text-slate-400 truncate mt-0.5 font-mono uppercase tracking-wider">
                    {activeTask ? `${activeTask.category} \u2022 ${activeTask.priority} Priority` : "Adhoc Custom Focus Session"}
                  </p>
                </div>
                <ChevronDown size={18} className="text-slate-400" />
              </button>

              {
    /* AnimatePresence for Task Dropdown Selection */
  }
              <AnimatePresence>
                {isTaskDropdownOpen && <motion.div
    initial={{ opacity: 0, y: 10 }}
    animate={{ opacity: 1, y: 0 }}
    exit={{ opacity: 0, y: 10 }}
    className="absolute top-full left-0 right-0 mt-2 bg-slate-900 border border-slate-800 rounded shadow-2xl z-20 max-h-60 overflow-y-auto"
    id="deep-focus-task-dropdown"
  >
                    <div className="p-2 border-b border-slate-800 bg-slate-950/50">
                      <input
    type="text"
    placeholder="Type a custom focusing objective..."
    value={customGoal}
    onChange={(e) => {
      setCustomGoal(e.target.value);
      setActiveTask(null);
    }}
    className="w-full bg-slate-900 border border-slate-800 text-xs px-3 py-2 rounded focus:outline-none focus:border-brand-blue font-mono"
    id="custom-focus-goal-input"
  />
                    </div>

                    <div className="p-1">
                      {pendingTasks.map((t) => <button
    key={t.id}
    onClick={() => handleSetTask(t)}
    className="w-full text-left p-3 hover:bg-slate-800 rounded text-xs transition-colors flex flex-col gap-0.5"
    id={`select-task-option-${t.id}`}
  >
                          <span className="font-serif font-bold text-slate-200">{t.title}</span>
                          <span className="text-[10px] text-slate-400 font-mono uppercase tracking-wider">{t.category}</span>
                        </button>)}
                      {pendingTasks.length === 0 && <div className="p-4 text-center text-xs text-slate-500 italic">
                          No pending tasks found. Write a custom objective above!
                        </div>}
                    </div>
                  </motion.div>}
              </AnimatePresence>
            </div>
          </div>

          {
    /* Box Breathing Respiratory Guide */
  }
          <div className="bg-slate-900/60 border border-slate-900 rounded p-6 space-y-4 relative overflow-hidden flex flex-col sm:flex-row items-center gap-5">
            {
    /* Pulsing Breathing Ring */
  }
            <div className="relative w-20 h-20 flex items-center justify-center shrink-0">
              <motion.div
    animate={{ scale: currentBreathingState.scale }}
    transition={{ duration: 3.8, ease: "easeInOut" }}
    className="absolute inset-0 rounded-full border-2 border-dashed border-cyan-400/30"
  />
              <motion.div
    animate={{ scale: [currentBreathingState.scale, currentBreathingState.scale + 0.1, currentBreathingState.scale] }}
    transition={{ repeat: Infinity, duration: 4, ease: "easeInOut" }}
    className="absolute w-12 h-12 rounded-full bg-cyan-400/5 flex items-center justify-center border border-cyan-400/20"
  >
                <Heart size={16} className="text-cyan-400/60 animate-pulse" />
              </motion.div>
            </div>

            <div className="space-y-1 text-center sm:text-left">
              <div className="flex items-center justify-center sm:justify-start space-x-2">
                <span className="text-[9px] font-mono uppercase bg-cyan-400/10 text-cyan-400 px-2 py-0.5 rounded font-bold">
                  Guided Breathing
                </span>
                <button
    onClick={() => setIsBreathingActive((prev) => !prev)}
    className="text-[9px] font-mono text-slate-400 hover:text-slate-100 hover:underline"
  >
                  {isBreathingActive ? "Pause Guide" : "Sustain Guide"}
                </button>
              </div>
              <motion.h4
    key={currentBreathingState.text}
    initial={{ opacity: 0, y: 5 }}
    animate={{ opacity: 1, y: 0 }}
    className={`text-lg font-serif font-bold italic transition-all ${currentBreathingState.color}`}
  >
                {currentBreathingState.text}
              </motion.h4>
              <p className="text-[11px] text-slate-400 leading-relaxed max-w-sm">
                Box breathing synchronizes the vagus nerve, reducing mental rust and expanding immediate logic retention.
              </p>
            </div>
          </div>

          {
    /* Total duration counter */
  }
          {secondsFocused > 0 && <div className="flex items-center space-x-2 text-[11px] font-mono text-slate-400 pl-1">
              <Clock size={12} className="text-amber-500 shrink-0" />
              <span>Tracked focus duration in this session: <strong>{formatTimerDigits(secondsFocused)}</strong></span>
            </div>}
        </section>

        {
    /* Center/Right Column: Main Chronology Master Timer Disc & Presets */
  }
        <section className="lg:col-span-7 flex flex-col items-center justify-center space-y-8">
          
          {
    /* Preset Buttons */
  }
          <div className="flex items-center bg-slate-900 p-1 border border-slate-800 rounded-full max-w-md w-full justify-around text-xs font-mono">
            {["pomodoro", "short", "long", "stopwatch"].map((mode) => <button
    key={mode}
    onClick={() => setTimerMode(mode)}
    className={`flex-1 text-center py-2 px-3 rounded-full uppercase tracking-wider font-bold transition-all text-[10px] md:text-xs ${timerMode === mode ? "bg-brand-blue text-white shadow-lg shadow-brand-blue/20" : "text-slate-400 hover:text-slate-100"}`}
    id={`preset-btn-${mode}`}
  >
                {mode === "pomodoro" ? "Focus" : mode === "short" ? "Break" : mode === "long" ? "Long Break" : "Stopwatch"}
              </button>)}
          </div>

          {
    /* Giant Timer Disk */
  }
          <div className="relative w-72 h-72 md:w-80 md:h-80 flex items-center justify-center bg-slate-900/40 border border-slate-800/60 rounded-full shadow-2xl">
            {
    /* Spinning background lines during focus */
  }
            {isTimerRunning && <div className="absolute inset-4 rounded-full border border-slate-800/40 animate-spin [animation-duration:60s]" />}

            {
    /* SVG Progress Ring */
  }
            <svg viewBox="0 0 208 208" className="absolute inset-0 w-full h-full transform -rotate-90">
              <circle
    cx="104"
    cy="104"
    r="92"
    fill="transparent"
    stroke="rgba(30, 41, 59, 0.4)"
    strokeWidth="2"
  />
              {timerMode !== "stopwatch" && <motion.circle
    cx="104"
    cy="104"
    r="92"
    fill="transparent"
    stroke="#3b82f6"
    strokeWidth="5"
    strokeDasharray={578}
    animate={{ strokeDashoffset: getProgressCircleOffset() }}
    transition={{ duration: 0.8, ease: "easeOut" }}
    className="drop-shadow-[0_0_8px_rgba(59,130,246,0.5)]"
  />}
            </svg>

            {
    /* Timer Core Readout */
  }
            <div className="flex flex-col items-center justify-center text-center relative z-10">
              <span className="font-mono text-xs uppercase tracking-[0.25em] text-slate-500 font-semibold mb-1">
                {timerMode === "pomodoro" ? "SESSION WAVE" : timerMode === "short" ? "RELAXATION WAVE" : timerMode === "long" ? "BREP DEEP WAVE" : " stopwatch"}
              </span>
              <h1 className="text-6xl md:text-7xl font-mono font-black text-white tracking-widest tabular-nums select-all">
                {formatTimerDigits(secondsRemaining)}
              </h1>
              
              {
    /* Micro Animated Waveform during play */
  }
              {isTimerRunning ? <div className="flex items-center gap-1 mt-4 h-6">
                  {[1, 2, 3, 4, 5, 4, 3, 2, 1].map((h, i) => <motion.div
    key={i}
    animate={{ height: isTimerRunning ? [8, 20, 8] : 8 }}
    transition={{ repeat: Infinity, duration: 1 + i * 0.15, ease: "easeInOut" }}
    className="w-1 bg-brand-blue rounded-full"
  />)}
                </div> : <span className="text-[10px] font-mono text-amber-400 mt-4 uppercase tracking-widest font-black flex items-center space-x-1.5 bg-amber-400/5 px-2.5 py-1 border border-amber-400/20 rounded-full animate-pulse">
                  <span>In Suspense</span>
                </span>}
            </div>
          </div>

          {
    /* Action Trigger Buttons */
  }
          <div className="flex items-center gap-6">
            <button
    onClick={() => {
      setIsTimerRunning((prev) => !prev);
    }}
    className={`w-16 h-16 rounded-full flex items-center justify-center transition-all ${isTimerRunning ? "bg-amber-500 hover:bg-amber-600 shadow-lg shadow-amber-500/20 text-slate-950" : "bg-brand-blue hover:bg-blue-600 shadow-lg shadow-brand-blue/30 text-white"}`}
    title={isTimerRunning ? "Pause Session" : "Engage Session"}
    id="deep-focus-play-pause-btn"
  >
              {isTimerRunning ? <Pause size={24} className="fill-current" /> : <Play size={24} className="fill-current ml-1" />}
            </button>

            <button
    onClick={() => {
      setIsTimerRunning(false);
      if (timerMode === "pomodoro") setSecondsRemaining(1500);
      else if (timerMode === "short") setSecondsRemaining(300);
      else if (timerMode === "long") setSecondsRemaining(900);
      else setSecondsRemaining(0);
    }}
    className="p-4 border border-slate-800 hover:border-slate-700 bg-slate-900 rounded-full text-slate-400 hover:text-white transition-all shadow-inner"
    title="Reset Sphere Clock"
    id="deep-focus-reset-btn"
  >
              <RefreshCw size={18} />
            </button>

            <button
    onClick={handleFinishAndComplete}
    className="px-5 py-3 border-2 border-emerald-500 hover:bg-emerald-500 hover:text-slate-950 text-emerald-400 text-xs font-mono uppercase tracking-widest font-bold rounded shadow transition-all flex items-center space-x-2"
    title="Report progress completion and exit"
    id="deep-focus-complete-task-btn"
  >
              <CheckCircle size={14} className="shrink-0" />
              <span>Complete Session</span>
            </button>
          </div>

        </section>

      </main>

      {
    /* Bottom Procedural Acoustic Panel (Soundscape Controller) */
  }
      <footer className="border-t border-slate-900 pt-6 mt-4 w-full max-w-6xl mx-auto relative z-10 flex flex-col md:flex-row items-center justify-between gap-6">
        
        {
    /* Sound Selection Toggles */
  }
        <div className="flex flex-wrap items-center gap-4">
          <div className="flex items-center space-x-1 text-slate-400">
            <Volume2 size={16} className="text-cyan-400 shrink-0" />
            <span className="font-mono text-[10px] uppercase tracking-wider">Acoustic Shield:</span>
          </div>

          <div className="flex bg-slate-900 p-1 border border-slate-800 rounded">
            {["rain", "drone", "alpha", "wind"].map((type) => <button
    key={type}
    onClick={() => handleSoundscapeToggle(type)}
    className={`px-3 py-1.5 font-mono text-[9px] uppercase tracking-widest rounded transition-all font-bold ${soundType === type && isSoundPlaying ? "bg-cyan-500 text-slate-950 shadow" : soundType === type ? "border border-cyan-500/30 text-cyan-400 bg-cyan-400/5" : "text-slate-400 hover:text-slate-100"}`}
    id={`soundscape-toggle-${type}`}
  >
                {type === "rain" ? "\u{1F327}\uFE0F Rain" : type === "drone" ? "\u{1F6F8} Cosmic" : type === "alpha" ? "\u{1F9E0} Alpha" : "\u{1F332} Wind"}
              </button>)}
          </div>
        </div>

        {
    /* Volume & Master Play Controller */
  }
        <div className="flex items-center gap-4 w-full md:w-auto md:max-w-xs shrink-0 bg-slate-900 border border-slate-800 p-3 rounded-md">
          <button
    onClick={() => setIsSoundPlaying((prev) => !prev)}
    className="text-slate-400 hover:text-slate-100 transition-colors"
    id="master-sound-play-pause-btn"
  >
            {isSoundPlaying ? <Volume2 size={18} className="text-cyan-400" /> : <VolumeX size={18} />}
          </button>

          <div className="flex-1 flex items-center space-x-2 min-w-[120px]">
            <input
    type="range"
    min="0"
    max="1"
    step="0.01"
    value={soundVolume}
    onChange={(e) => setSoundVolume(Number(e.target.value))}
    className="flex-1 accent-cyan-400 bg-slate-850 h-1.5 rounded cursor-pointer"
    title="Acoustic Shield Volume"
    id="focus-soundscape-volume-slider"
  />
            <span className="font-mono text-[9px] text-slate-500 font-bold w-6 text-right">
              {Math.round(soundVolume * 100)}%
            </span>
          </div>
        </div>

      </footer>

    </div>;
}
