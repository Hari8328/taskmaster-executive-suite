import React, { useState, useEffect } from "react";
import { motion } from "motion/react";
import { suggestPriority, suggestBatchPriorities, hasGeminiKey, getCombinedDashboardInsight } from "../lib/gemini";
import { Sparkles, MoreHorizontal, Clock, ArrowUpRight, Loader2, CheckCircle2, Circle, X, PlayCircle, Bell, ChevronDown, Trash2, AlertTriangle, AlarmClock, History, Trophy, TrendingUp, TrendingDown } from "lucide-react";
import { cn } from "../lib/utils";
import TaskModal from "./TaskModal";
import TaskFormModal from "./TaskFormModal";
import { taskService } from "../services/taskService";
import { authService } from "../services/authService";
import { AnimatePresence } from "motion/react";
import {
  getAchievements,
  checkAndUnlockAchievements,
  saveCompletedTaskTime,
  playCompleteSound,
  dispatchCelebration
} from "../lib/audioAndAchievements";
import LiveClock from "./LiveClock";
import MentorSelector from "./MentorSelector";
import CompetitionArena from "./CompetitionArena";
import DeepFocusArena from "./DeepFocusArena";
import WeeklyDigestModal from "./WeeklyDigestModal";
import { Headphones, Zap } from "lucide-react";
const LiveTimer = ({ startedAt }) => {
  const [time, setTime] = React.useState("");
  React.useEffect(() => {
    const update = () => {
      const start = new Date(startedAt).getTime();
      if (isNaN(start)) {
        setTime("--");
        return;
      }
      const current = (/* @__PURE__ */ new Date()).getTime();
      const diff = Math.max(0, current - start);
      const hours = Math.floor(diff / (1e3 * 60 * 60));
      const mins = Math.floor(diff % (1e3 * 60 * 60) / (1e3 * 60));
      const secs = Math.floor(diff % (1e3 * 60) / 1e3);
      let str = "";
      if (hours > 0) str += `${hours}h `;
      str += `${mins}m ${secs}s`;
      setTime(str);
    };
    update();
    const interval = setInterval(update, 1e3);
    return () => clearInterval(interval);
  }, [startedAt]);
  return <span>{time}</span>;
};
const Dashboard = ({ refreshTrigger, onViewChange }) => {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedTask, setSelectedTask] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [taskToEdit, setTaskToEdit] = useState(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [completingId, setCompletingId] = useState(null);
  const [achievements, setAchievements] = useState(() => getAchievements());
  const [isFiltersOpen, setIsFiltersOpen] = useState(false);
  const [selectedPriorities, setSelectedPriorities] = useState([]);
  const [selectedStatuses, setSelectedStatuses] = useState([]);
  const [selectedCategories, setSelectedCategories] = useState([]);
  const [aiCoachMessage, setAiCoachMessage] = useState([]);
  const [isAiCoachLoading, setIsAiCoachLoading] = useState(false);
  const [isAiSuggesting, setIsAiSuggesting] = useState(false);
  const [quickSuggestions, setQuickSuggestions] = useState([]);
  const [isSuggestionsLoading, setIsSuggestionsLoading] = useState(false);
  const [aiError, setAiError] = useState(null);
  const [profile, setProfile] = useState(null);
  const [isProfileLoading, setIsProfileLoading] = useState(false);
  const [isDeepFocusActivated, setIsDeepFocusActivated] = useState(false);
  const [deepFocusTask, setDeepFocusTask] = useState(null);
  const [isWeeklyDigestOpen, setIsWeeklyDigestOpen] = useState(false);
  const [hasFetchedAI, setHasFetchedAI] = useState(false);
  const handleLaunchDeepFocus = (task) => {
    setDeepFocusTask(task);
    setIsDeepFocusActivated(true);
    const event = new CustomEvent("toggle-deep-focus", { detail: { active: true } });
    window.dispatchEvent(event);
  };
  const handleExitDeepFocus = () => {
    setIsDeepFocusActivated(false);
    setDeepFocusTask(null);
    const event = new CustomEvent("toggle-deep-focus", { detail: { active: false } });
    window.dispatchEvent(event);
  };
  const handleCompleteDeepFocusTask = async (task, secondsFocused) => {
    try {
      const now = /* @__PURE__ */ new Date();
      const secondsSpent = secondsFocused;
      const startTimeObj = new Date(now.getTime() - secondsSpent * 1e3);
      setCompletingId(task.id);
      const updatedTasksList = tasks.map((t) => t.id === task.id ? { ...task, status: "completed" } : t);
      const newUnlocks = checkAndUnlockAchievements(updatedTasksList);
      dispatchCelebration({
        taskTitle: task.title,
        durationMs: secondsSpent > 0 ? secondsSpent * 1e3 : null,
        newAchievements: newUnlocks
      });
      setAchievements(getAchievements());
      await taskService.updateTask(Number(task.id), {
        ...task,
        status: "completed",
        completedAt: now.toISOString(),
        startedAt: startTimeObj.toISOString()
      });
      setTimeout(fetchTasks, 1e3);
    } catch (err) {
      console.error("Failed to complete deep focus task:", err);
    } finally {
      setCompletingId(null);
    }
  };
  useEffect(() => {
    setAchievements(getAchievements());
  }, [tasks]);
  const fetchProfileData = async () => {
    setIsProfileLoading(true);
    try {
      const data = await authService.getProfile();
      setProfile(data);
    } catch (e) {
      console.error("Failed to load profile in Dashboard:", e);
    } finally {
      setIsProfileLoading(false);
    }
  };
  useEffect(() => {
    const handleOpenDigest = () => {
      setIsWeeklyDigestOpen(true);
    };
    const handleProfileUpdate = () => {
      fetchProfileData();
    };
    window.addEventListener("open-weekly-digest", handleOpenDigest);
    window.addEventListener("profile-updated", handleProfileUpdate);
    return () => {
      window.removeEventListener("open-weekly-digest", handleOpenDigest);
      window.removeEventListener("profile-updated", handleProfileUpdate);
    };
  }, []);
  useEffect(() => {
    const user = authService.getCurrentUser();
    if (user && user.roles.includes("ROLE_ADMIN")) {
      setIsAdmin(true);
    }
    fetchTasks();
    fetchProfileData();
  }, [refreshTrigger]);
  const fetchAIInsights = async (statsData, focusTimeStr, tasksList) => {
    setIsAiCoachLoading(true);
    setIsSuggestionsLoading(true);
    setAiError(null);
    try {
      const data = await getCombinedDashboardInsight(
        statsData.completed,
        statsData.upcoming,
        statsData.inProgress,
        focusTimeStr,
        tasksList
      );
      const coaching = data && data.coaching ? data.coaching : "Focus on the foundation today. Every step is structural progress.";
      const suggestions = data && Array.isArray(data.suggestions) ? data.suggestions : [];
      setAiCoachMessage([coaching]);
      setQuickSuggestions(suggestions.slice(0, 2));
    } catch (err) {
      console.error("Failed to fetch AI insights:", err);
      setAiError("The Architect is currently unavailable. Ensure your API key is correct.");
    } finally {
      setIsAiCoachLoading(false);
      setIsSuggestionsLoading(false);
    }
  };
  const fetchTasks = async () => {
    setLoading(true);
    setCompletingId(null);
    try {
      const user = authService.getCurrentUser();
      let response;
      if (user && user.roles.includes("ROLE_ADMIN")) {
        response = await taskService.getAllTasksAdmin(0, 100);
      } else {
        response = await taskService.getMyTasks(0, 100);
      }
      const content = response.content || [];
      setTasks(content);
      const initialStats = {
        completed: content.filter((t) => t.status?.toLowerCase() === "completed").length,
        inProgress: content.filter((t) => t.status?.toLowerCase() === "in-progress").length,
        upcoming: content.filter((t) => t.status?.toLowerCase() === "todo").length
      };
      const totalTimeMs = content.filter((t) => t.status?.toLowerCase() === "completed" && t.startedAt && t.completedAt).reduce((acc, t) => {
        const s = new Date(t.startedAt).getTime();
        const e = new Date(t.completedAt).getTime();
        return acc + Math.max(0, e - s);
      }, 0);
      if (hasGeminiKey && !hasFetchedAI) {
        fetchAIInsights(initialStats, formatTotalTime(totalTimeMs), content);
        setHasFetchedAI(true);
      }
    } catch (error) {
      console.error("Error fetching tasks:", error);
      setTasks([]);
    } finally {
      setLoading(false);
    }
  };
  const handleComplete = async (e, task) => {
    e.stopPropagation();
    if (task.status?.toLowerCase() === "completed") return;
    setCompletingId(task.id);
    const now = (/* @__PURE__ */ new Date()).toISOString();
    try {
      let durationMs = null;
      if (task.startedAt) {
        durationMs = Math.max(0, (/* @__PURE__ */ new Date()).getTime() - new Date(task.startedAt).getTime());
      }
      playCompleteSound();
      if (durationMs) {
        saveCompletedTaskTime(durationMs);
      }
      const completedTask = {
        ...task,
        status: "completed",
        completedAt: now,
        startedAt: task.startedAt || now
      };
      const updatedTasksList = safeTasks.map((t) => t.id === task.id ? completedTask : t);
      const newUnlocks = checkAndUnlockAchievements(updatedTasksList);
      dispatchCelebration({
        taskTitle: task.title,
        durationMs,
        newAchievements: newUnlocks
      });
      setAchievements(getAchievements());
      await taskService.updateTask(Number(task.id), {
        ...task,
        status: "completed",
        completedAt: now,
        startedAt: task.startedAt || now
      });
      setTimeout(fetchTasks, 1e3);
    } catch (err) {
      console.error("Failed to complete task");
      setCompletingId(null);
    }
  };
  const handleStart = async (e, task) => {
    e.stopPropagation();
    try {
      await taskService.updateTask(Number(task.id), {
        ...task,
        status: "in-progress",
        startedAt: task.startedAt || (/* @__PURE__ */ new Date()).toISOString()
      });
      fetchTasks();
    } catch (err) {
      console.error("Failed to start task");
    }
  };
  const formatTime = (dateStr) => {
    if (!dateStr) return "";
    const date = new Date(dateStr);
    if (isNaN(date.getTime())) return "";
    const isToday = date.toDateString() === (/* @__PURE__ */ new Date()).toDateString();
    if (isToday) {
      return date.toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" });
    }
    return date.toLocaleString("en-IN", { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" });
  };
  const formatDuration = (start, end) => {
    if (!start || !end) return null;
    const s = new Date(start).getTime();
    const e = new Date(end).getTime();
    if (isNaN(s) || isNaN(e)) return null;
    const diff = Math.max(0, e - s);
    const hours = Math.floor(diff / (1e3 * 60 * 60));
    const mins = Math.floor(diff % (1e3 * 60 * 60) / (1e3 * 60));
    const secs = Math.floor(diff % (1e3 * 60) / 1e3);
    if (hours > 0) return `${hours}h ${mins}m`;
    if (mins > 0) return `${mins}m ${secs}s`;
    return `${secs}s`;
  };
  const getRemainingTime = (dueDate) => {
    const now = (/* @__PURE__ */ new Date()).getTime();
    const due = new Date(dueDate).getTime();
    if (isNaN(due)) return "No due date";
    const diff = due - now;
    if (diff < 0) return "Overdue";
    const days = Math.floor(diff / (1e3 * 60 * 60 * 24));
    const hours = Math.floor(diff % (1e3 * 60 * 60 * 24) / (1e3 * 60 * 60));
    if (days > 0) return `${days}d ${hours}h left`;
    return `${hours}h left`;
  };
  const handleTaskClick = (task) => {
    setSelectedTask(task);
    setIsModalOpen(true);
  };
  const handleEditClick = (task) => {
    setTaskToEdit(task);
    setIsEditModalOpen(true);
    setIsModalOpen(false);
  };
  const safeTasks = Array.isArray(tasks) ? tasks : [];
  const stats = {
    completed: safeTasks.filter((t) => t.status?.toLowerCase() === "completed").length,
    inProgress: safeTasks.filter((t) => t.status?.toLowerCase() === "in-progress").length,
    upcoming: safeTasks.filter((t) => t.status?.toLowerCase() === "todo").length
  };
  const categories = Array.from(new Set(safeTasks.map((t) => t.category))).filter(Boolean);
  const priorities = ["low", "medium", "high"];
  const statuses = ["todo", "in-progress", "completed"];
  const filteredTasks = safeTasks.filter((task) => {
    const taskPriority = task.priority?.toLowerCase();
    const taskStatus = task.status?.toLowerCase();
    const matchesPriority = selectedPriorities.length === 0 || selectedPriorities.includes(taskPriority);
    const matchesStatus = selectedStatuses.length === 0 || selectedStatuses.includes(taskStatus);
    const matchesCategory = selectedCategories.length === 0 || selectedCategories.includes(task.category);
    if (selectedStatuses.length === 0) {
      return (taskStatus !== "completed" || completingId === task.id) && matchesPriority && matchesCategory;
    }
    return matchesPriority && matchesStatus && matchesCategory;
  });
  const toggleFilter = (set, value) => {
    set(
      (prev) => prev.includes(value) ? prev.filter((i) => i !== value) : [...prev, value]
    );
  };
  const handleAiPriorityQuickSuggest = async (e, task) => {
    e.stopPropagation();
    if (isAiSuggesting) return;
    setIsAiSuggesting(true);
    try {
      const suggested = await suggestPriority(task.title, task.description, task.dueDate);
      if (suggested !== task.priority) {
        await taskService.updateTask(Number(task.id), {
          ...task,
          priority: suggested
        });
        fetchTasks();
      }
    } catch (err) {
      console.error("Quick AI priority failed:", err);
    } finally {
      setIsAiSuggesting(false);
    }
  };
  const handleBatchAiPrioritize = async () => {
    if (isAiSuggesting || tasks.length === 0) return;
    setIsAiSuggesting(true);
    try {
      const suggestions = await suggestBatchPriorities(tasks);
      const updates = tasks.map(async (task, index) => {
        const suggestedPriority = suggestions[index];
        if (suggestedPriority && suggestedPriority !== task.priority) {
          return taskService.updateTask(Number(task.id), {
            ...task,
            priority: suggestedPriority
          });
        }
        return Promise.resolve();
      });
      await Promise.all(updates);
      fetchTasks();
    } catch (err) {
      console.error("Batch AI priority failed:", err);
    } finally {
      setIsAiSuggesting(false);
    }
  };
  const clearFilters = () => {
    setSelectedPriorities([]);
    setSelectedStatuses([]);
    setSelectedCategories([]);
  };
  const activeFiltersCount = selectedPriorities.length + selectedStatuses.length + selectedCategories.length;
  const FilterDropdown = ({
    label,
    options,
    selected,
    onToggle,
    icon: Icon
  }) => {
    const [isOpen, setIsOpen] = useState(false);
    const containerRef = React.useRef(null);
    useEffect(() => {
      const handleClickOutside = (event) => {
        if (containerRef.current && !containerRef.current.contains(event.target)) {
          setIsOpen(false);
        }
      };
      document.addEventListener("mousedown", handleClickOutside);
      return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);
    return <div className="relative" ref={containerRef}>
        <button
      onClick={() => setIsOpen(!isOpen)}
      className={cn(
        "flex items-center justify-between w-full md:w-44 px-4 py-2 border transition-all text-[10px] font-mono uppercase tracking-widest",
        selected.length > 0 ? "border-editorial-ink bg-editorial-ink text-editorial-paper" : "border-editorial-border hover:border-editorial-ink text-editorial-muted hover:text-editorial-ink"
      )}
    >
          <div className="flex items-center space-x-2">
            {Icon && <Icon size={12} />}
            <span className="truncate">{selected.length > 0 ? `${label} (${selected.length})` : label}</span>
          </div>
          <ChevronDown size={12} className={cn("transition-transform duration-200", isOpen && "rotate-180")} />
        </button>
        
        <AnimatePresence>
          {isOpen && <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 10 }}
      className="absolute z-50 top-full left-0 mt-2 w-56 bg-editorial-paper border border-editorial-ink shadow-2xl p-2"
    >
              <div className="max-h-60 overflow-y-auto space-y-1 custom-scrollbar">
                {options.map((opt) => <button
      key={opt}
      onClick={() => onToggle(opt)}
      className={cn(
        "flex items-center justify-between w-full px-3 py-2 text-[10px] font-mono uppercase transition-colors text-left",
        selected.includes(opt) ? "bg-editorial-ink text-editorial-paper" : "hover:bg-editorial-muted/10 text-editorial-ink"
      )}
    >
                    <span>{opt.replace("_", " ")}</span>
                    {selected.includes(opt) && <X size={10} />}
                  </button>)}
              </div>
            </motion.div>}
        </AnimatePresence>
      </div>;
  };
  const [currentDate, setCurrentDate] = useState(/* @__PURE__ */ new Date());
  useEffect(() => {
    const timer = setInterval(() => setCurrentDate(/* @__PURE__ */ new Date()), 1e3 * 60);
    return () => clearInterval(timer);
  }, []);
  const dayName = new Intl.DateTimeFormat("en-IN", { weekday: "long" }).format(currentDate);
  const formattedDate = new Intl.DateTimeFormat("en-IN", { month: "long", day: "numeric", year: "numeric" }).format(currentDate);
  const totalTasks = tasks.length;
  const completionPercentage = totalTasks > 0 ? Math.round(stats.completed / totalTasks * 100) : 0;
  const totalFocusTimeMs = safeTasks.filter((t) => t.status?.toLowerCase() === "completed" && t.startedAt && t.completedAt).reduce((acc, t) => {
    const s = new Date(t.startedAt).getTime();
    const e = new Date(t.completedAt).getTime();
    return acc + Math.max(0, e - s);
  }, 0);
  const formatTotalTime = (ms) => {
    const hours = Math.floor(ms / (1e3 * 60 * 60));
    const mins = Math.floor(ms % (1e3 * 60 * 60) / (1e3 * 60));
    if (hours > 0) return `${hours}h ${mins}m`;
    return `${mins}m`;
  };
  const completedTasks = safeTasks.filter((t) => t.status?.toLowerCase() === "completed");
  const completionDates = completedTasks.map((t) => t.completedAt ? new Date(t.completedAt).toDateString() : null).filter((v, i, self) => v !== null && self.indexOf(v) === i);
  const sortedDates = completionDates.map((d) => new Date(d)).sort((a, b) => b.getTime() - a.getTime());
  let streak = 0;
  if (sortedDates.length > 0) {
    const today = /* @__PURE__ */ new Date();
    today.setHours(0, 0, 0, 0);
    const latestDate = sortedDates[0];
    latestDate.setHours(0, 0, 0, 0);
    const diffTime = Math.abs(today.getTime() - latestDate.getTime());
    const diffDays = Math.ceil(diffTime / (1e3 * 60 * 60 * 24));
    if (diffDays <= 1) {
      streak = 1;
      let currentCheck = latestDate;
      for (let i = 1; i < sortedDates.length; i++) {
        const prevDate = sortedDates[i];
        prevDate.setHours(0, 0, 0, 0);
        const dayDiff = Math.round((currentCheck.getTime() - prevDate.getTime()) / (1e3 * 60 * 60 * 24));
        if (dayDiff === 1) {
          streak++;
          currentCheck = prevDate;
        } else if (dayDiff > 1) {
          break;
        }
      }
    }
  }
  const highMediumTotal = safeTasks.filter((t) => t.priority?.toLowerCase() === "high" || t.priority?.toLowerCase() === "medium").length;
  const highMediumCompleted = completedTasks.filter((t) => t.priority?.toLowerCase() === "high" || t.priority?.toLowerCase() === "medium").length;
  const onTimeRatioValue = highMediumTotal > 0 ? highMediumCompleted / highMediumTotal : 1;
  const consistencyScore = Math.min(100, Math.round(onTimeRatioValue * 100));
  const nowMs = Date.now();
  const oneWeekMs = 7 * 24 * 60 * 60 * 1e3;
  const completionsThisWeek = completedTasks.filter((t) => {
    const date = t.completedAt ? new Date(t.completedAt).getTime() : 0;
    return nowMs - date <= oneWeekMs;
  }).length;
  const completionsLastWeek = completedTasks.filter((t) => {
    const date = t.completedAt ? new Date(t.completedAt).getTime() : 0;
    const age = nowMs - date;
    return age > oneWeekMs && age <= 2 * oneWeekMs;
  }).length;
  let growthIndex = 0;
  if (completionsLastWeek === 0) {
    growthIndex = completionsThisWeek > 0 ? completionsThisWeek * 100 : 0;
  } else {
    growthIndex = Math.round((completionsThisWeek - completionsLastWeek) / completionsLastWeek * 100);
  }
  const completedTasksWithDuration = safeTasks.filter(
    (t) => t.status?.toLowerCase() === "completed" && t.startedAt && t.completedAt
  );
  const avgTimeToCompleteMs = completedTasksWithDuration.length > 0 ? completedTasksWithDuration.reduce((acc, t) => {
    const s = new Date(t.startedAt).getTime();
    const e = new Date(t.completedAt).getTime();
    return acc + Math.max(0, e - s);
  }, 0) / completedTasksWithDuration.length : 0;
  const formatDurationFriendly = (ms) => {
    if (ms <= 0) return "0m";
    const hours = Math.floor(ms / (1e3 * 60 * 60));
    const mins = Math.round(ms % (1e3 * 60 * 60) / (1e3 * 60));
    const secs = Math.round(ms % (1e3 * 60) / 1e3);
    if (hours > 0) return `${hours}h ${mins}m`;
    if (mins > 0) return `${mins}m`;
    return `${secs}s`;
  };
  const completedCount = stats.completed;
  let architecturalRank = "Groundbreaker";
  let currentLevel = 1;
  let nextRankName = "Novice Mason";
  let tasksForCurrentLevel = 0;
  let tasksForNextLevel = 1;
  let rankIcon = "\u{1F3D7}\uFE0F";
  let badgeColor = "text-blue-600 bg-blue-50 border-blue-200";
  let progressInLevel = 0;
  if (completedCount >= 10) {
    architecturalRank = "Grand Architect Master";
    currentLevel = 5;
    nextRankName = "Max Level Achieved";
    tasksForCurrentLevel = 10;
    tasksForNextLevel = 10;
    rankIcon = "\u{1F451}";
    badgeColor = "text-red-600 bg-red-50 border-red-200";
    progressInLevel = 100;
  } else if (completedCount >= 6) {
    architecturalRank = "Horizon Architect";
    currentLevel = 4;
    nextRankName = "Grand Architect Master";
    tasksForCurrentLevel = 6;
    tasksForNextLevel = 10;
    rankIcon = "\u{1F3DB}\uFE0F";
    badgeColor = "text-purple-600 bg-purple-50 border-purple-200";
    progressInLevel = Math.round((completedCount - 6) / 4 * 100);
  } else if (completedCount >= 3) {
    architecturalRank = "Steady Builder";
    currentLevel = 3;
    nextRankName = "Horizon Architect";
    tasksForCurrentLevel = 3;
    tasksForNextLevel = 6;
    rankIcon = "\u{1F528}";
    badgeColor = "text-yellow-600 bg-yellow-50 border-yellow-200";
    progressInLevel = Math.round((completedCount - 3) / 3 * 100);
  } else if (completedCount >= 1) {
    architecturalRank = "Novice Mason";
    currentLevel = 2;
    nextRankName = "Steady Builder";
    tasksForCurrentLevel = 1;
    tasksForNextLevel = 3;
    rankIcon = "\u{1F9F1}";
    badgeColor = "text-green-600 bg-green-50 border-green-200";
    progressInLevel = Math.round((completedCount - 1) / 2 * 100);
  } else {
    architecturalRank = "Groundbreaker";
    currentLevel = 1;
    nextRankName = "Novice Mason";
    tasksForCurrentLevel = 0;
    tasksForNextLevel = 1;
    rankIcon = "\u{1F3D7}\uFE0F";
    badgeColor = "text-slate-600 bg-slate-50 border-slate-200";
    progressInLevel = 0;
  }
  const nextLevelTasksNeeded = Math.max(0, tasksForNextLevel - completedCount);
  if (isDeepFocusActivated) {
    return <DeepFocusArena
      onExit={handleExitDeepFocus}
      initialTask={deepFocusTask}
      tasks={tasks}
      onCompleteTask={handleCompleteDeepFocusTask}
    />;
  }
  return <main className="p-4 md:p-8 space-y-12 pb-32 overflow-x-hidden">
      <TaskModal
    task={selectedTask}
    isOpen={isModalOpen}
    onClose={() => setIsModalOpen(false)}
    onEdit={handleEditClick}
  />
      <TaskFormModal
    task={taskToEdit}
    isOpen={isEditModalOpen}
    onClose={() => setIsEditModalOpen(false)}
    onSuccess={fetchTasks}
  />
      <WeeklyDigestModal
    isOpen={isWeeklyDigestOpen}
    onClose={() => setIsWeeklyDigestOpen(false)}
    tasks={tasks}
    stats={stats}
  />
      
      {
    /* AI Coach Section */
  }
      <section className="bg-brand-blue/5 border border-brand-blue/20 p-8 rounded-sm relative overflow-hidden">
        <div className="absolute -right-8 -bottom-8 opacity-5">
           <Sparkles size={200} className="text-brand-blue" />
        </div>
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-8 relative z-10">
          <div className="flex items-start space-x-6">
            <div className="p-3 bg-brand-blue/10 rounded-full shrink-0">
              <Sparkles className="text-brand-blue" size={24} />
            </div>
            <div className="space-y-4">
              <div className="space-y-1">
                <p className="font-mono text-[10px] uppercase tracking-widest text-brand-blue">Intelligent Reflection</p>
            <h3 className="text-xl md:text-2xl font-serif italic text-editorial-ink">Your AI Productivity Coach</h3>
          </div>
          <div className="max-w-2xl">
            {isAiCoachLoading ? <div className="flex items-center space-x-2 text-editorial-muted">
                <Loader2 size={14} className="animate-spin" />
                <p className="font-serif italic">The architect is reflecting on your progress...</p>
              </div> : aiError ? <div className="flex items-center space-x-2 text-red-600/70">
                  <AlertTriangle size={14} />
                  <p className="font-serif italic text-sm">{aiError}</p>
                </div> : aiCoachMessage.length > 0 ? <motion.p
    initial={{ opacity: 0, y: 10 }}
    animate={{ opacity: 1, y: 0 }}
    className="text-base md:text-lg font-serif text-editorial-ink/80 leading-relaxed italic break-words"
  >
                    "{aiCoachMessage[0]}"
                  </motion.p> : <p className="font-serif italic text-editorial-muted">Synchronize your tasks to receive architectural guidance.</p>}
              </div>
              
              <button
    onClick={() => fetchAIInsights(stats, formatTotalTime(totalFocusTimeMs), tasks)}
    disabled={isAiCoachLoading}
    className="text-[9px] font-mono uppercase tracking-[0.2em] text-brand-blue border-b border-brand-blue/30 pb-1 hover:border-brand-blue transition-all disabled:opacity-50"
  >
                Refresh Insight
              </button>
            </div>
          </div>

          <div className="shrink-0">
             <button
    onClick={() => onViewChange?.("roadmap")}
    className="group flex flex-col items-center justify-center p-8 bg-white border border-brand-blue/10 rounded-sm hover:border-brand-blue/30 transition-all shadow-sm hover:shadow-md"
  >
                <div className="w-12 h-12 bg-brand-blue/10 rounded-full flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                   <Clock className="text-brand-blue" size={24} />
                </div>
                <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-editorial-muted mb-1">Architecture</p>
                <h4 className="text-lg font-serif italic text-editorial-ink">View Daily Roadmap</h4>
                <div className="mt-4 flex items-center space-x-2 text-[8px] font-mono uppercase tracking-widest text-brand-blue opacity-0 group-hover:opacity-100 transition-opacity">
                   <span>Generate Timetable</span>
                   <ArrowUpRight size={10} />
                </div>
             </button>
          </div>
        </div>
      </section>

      {
    /* Deep Focus Arena Intro Banner */
  }
      <section className="border border-editorial-border p-6 bg-editorial-paper rounded flex flex-col sm:flex-row items-center justify-between gap-6 hover:shadow transition-all group">
        <div className="flex flex-col sm:flex-row items-center sm:items-start space-y-3 sm:space-y-0 sm:space-x-5 text-center sm:text-left">
          <div className="p-3 bg-brand-blue/10 text-brand-blue rounded-full shrink-0 group-hover:scale-110 transition-transform">
            <Headphones size={24} className="animate-pulse" />
          </div>
          <div className="space-y-1">
            <h3 className="text-xl font-serif italic text-editorial-ink flex flex-wrap items-center justify-center sm:justify-start gap-2">
              <span>Deep Focus Chamber</span>
              <span className="font-mono text-[9px] uppercase tracking-[0.15em] font-bold px-2 py-0.5 bg-brand-blue/10 text-brand-blue rounded border border-brand-blue/20">
                Acoustic Meditation
              </span>
            </h3>
            <p className="text-xs text-editorial-muted max-w-xl font-serif italic leading-relaxed">
              Block cognitive distractions, scale down stress, and conquer challenging milestones. Immerse yourself on specific objectives under custom synthesized white/brown waves.
            </p>
          </div>
        </div>
        <button
    onClick={() => handleLaunchDeepFocus(null)}
    className="px-5 py-2.5 bg-brand-blue text-white text-xs font-mono uppercase tracking-[0.15em] hover:bg-editorial-ink hover:text-white transition-all rounded font-bold shrink-0 shadow-sm flex items-center space-x-2"
    id="enter-deep-focus-room-btn"
  >
          <Zap size={14} />
          <span>Enter Focus Room</span>
        </button>
      </section>

      {
    /* Quick Suggestions Snippet */
  }
      {quickSuggestions.length > 0 && <section className="animate-in fade-in slide-in-from-bottom-4 duration-1000">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-2">
              <Sparkles size={16} className="text-brand-blue" />
              <h3 className="text-xl font-serif italic">Structural Suggestions</h3>
            </div>
            <button
    onClick={() => onViewChange?.("suggestions")}
    className="text-[10px] font-mono uppercase tracking-widest text-brand-blue hover:underline"
  >
              View Full Blueprint →
            </button>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {quickSuggestions.map((suggestion, idx) => <div
    key={idx}
    className="p-6 border border-editorial-border bg-white hover:border-brand-blue/30 transition-all group cursor-pointer"
    onClick={() => onViewChange?.("suggestions")}
  >
                <div className="flex items-center justify-between mb-3 text-[9px] font-mono uppercase tracking-[0.2em] text-editorial-muted">
                  <span>{suggestion.category}</span>
                  <ArrowUpRight size={12} className="opacity-0 group-hover:opacity-100 transition-opacity" />
                </div>
                <h4 className="text-lg font-serif italic text-editorial-ink mb-1 group-hover:text-brand-blue transition-colors">
                  {suggestion.title}
                </h4>
                <p className="text-xs text-editorial-muted font-serif italic">
                  {suggestion.description}
                </p>
              </div>)}
          </div>
        </section>}

      {
    /* Daily Progress & Profile Spotlight */
  }
      <section className="bg-editorial-ink text-editorial-paper p-8 md:p-12 border border-editorial-border relative overflow-hidden group shadow-xl">
        {
    /* Subtle grid background pattern and glowing accents */
  }
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#000_1px,transparent_1px),linear-gradient(to_bottom,#000_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] opacity-20" />
        <div className="absolute top-12 right-20 w-72 h-72 bg-brand-blue/10 rounded-full blur-3xl group-hover:bg-brand-blue/15 transition-all duration-700" />
        <div className="absolute -left-20 -bottom-20 w-80 h-80 bg-emerald-500/5 rounded-full blur-3xl group-hover:opacity-60 transition-opacity" />

        <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
          
          {
    /* Column 1: Gamified Profile and Leveled Progression Tracker */
  }
          <div className="lg:col-span-7 space-y-6">
            <div className="flex items-center space-x-2">
              <span className="w-2.5 h-2.5 rounded-full bg-brand-blue animate-pulse" />
              <p className="font-mono text-[10px] uppercase tracking-[0.3em] text-editorial-paper/50 font-bold">BUILDER PROFILE & MASTERY CENTER</p>
            </div>

            {
    /* Profile Header Details */
  }
            <div className="flex items-start space-x-5">
              {
    /* Massive stylish avatar container */
  }
              <div className="relative shrink-0">
                <div className="w-16 h-16 md:w-20 md:h-20 bg-gradient-to-tr from-[#1E293B] to-[#334155] border-2 border-brand-blue shadow-lg rounded-full flex items-center justify-center text-2xl md:text-3xl font-serif font-bold text-white uppercase select-none group-hover:scale-105 transition-transform duration-300">
                  {profile?.avatarUrl ? <img src={profile.avatarUrl} alt="Avatar" className="w-full h-full rounded-full object-cover" referrerPolicy="no-referrer" /> : <span>{profile?.displayName ? profile.displayName[0] : profile?.username ? profile.username[0] : "H"}</span>}
                </div>
                <div className="absolute -bottom-1 -right-1 w-7 h-7 bg-editorial-paper text-editorial-ink rounded-full border border-editorial-border flex items-center justify-center text-sm" title={`Level ${currentLevel}`}>
                  {rankIcon}
                </div>
              </div>

              {
    /* Persona and Bio */
  }
              <div className="space-y-1.5 py-1">
                <h3 className="text-2xl md:text-3xl font-serif font-bold leading-tight">
                  {profile?.displayName || profile?.username || "Horizon Builder"}
                </h3>
                <div className="flex flex-wrap items-center gap-2">
                  <span className="px-2.5 py-0.5 bg-brand-blue/25 border border-brand-blue/30 text-brand-blue rounded-full text-[10px] font-mono uppercase tracking-widest font-bold">
                    Level {currentLevel}: {architecturalRank}
                  </span>
                  {isAdmin && <span className="px-2 py-0.5 bg-red-500/20 border border-red-500/30 text-red-300 rounded-full text-[9px] font-mono uppercase tracking-[0.1em]">
                      HQ Administrator
                    </span>}
                </div>
                <p className="text-xs md:text-sm text-editorial-paper/60 font-serif italic max-w-md line-clamp-2 mt-1">
                  {profile?.bio || "We rebuild our days stone by stone. Complete tasks to elevate your architectural focus status."}
                </p>
              </div>
            </div>

            {
    /* Level Rank Progress Indicator Slider Bar */
  }
            <div className="bg-editorial-paper/5 border border-editorial-paper/10 p-5 rounded-xl space-y-3">
              <div className="flex items-center justify-between text-xs font-mono">
                <span className="text-editorial-paper/40 font-bold tracking-widest text-[9px] uppercase">RANK PROGRESS</span>
                <span className="text-brand-blue font-bold tracking-widest">{completedCount} Completed Tasks</span>
              </div>
              
              {
    /* Glowing progress slider bar */
  }
              <div className="relative w-full h-3 bg-editorial-paper/10 border border-editorial-paper/10 rounded-full overflow-hidden">
                <motion.div
    initial={{ width: 0 }}
    animate={{ width: `${progressInLevel}%` }}
    transition={{ duration: 1.2, ease: "easeOut" }}
    className="h-full bg-gradient-to-r from-brand-blue via-blue-400 to-indigo-400 rounded-full relative"
  >
                  <div className="absolute right-0 top-0 bottom-0 w-2 bg-white/40 animate-pulse" />
                </motion.div>
              </div>

              <div className="flex items-center justify-between text-[10px] font-serif italic text-editorial-paper/60">
                <span>{architecturalRank} (Lvl {currentLevel})</span>
                {completedCount >= 10 ? <span className="text-emerald-400">At Ultimate rank ceiling! 👑</span> : <span>
                    Need <strong className="text-brand-blue not-italic font-bold font-mono">{nextLevelTasksNeeded}</strong> more to unlock <strong className="text-brand-blue">{nextRankName}</strong>
                  </span>}
              </div>
            </div>
          </div>

          {
    /* Column 2: Gorgeous circular progress mastery wheel */
  }
          <div className="lg:col-span-5 flex flex-col items-center justify-center bg-editorial-paper/5 border border-editorial-paper/10 hover:border-editorial-paper/20 rounded-2xl p-6 md:p-8 text-center transition-all duration-300 relative group/wheel select-none">
            
            <div className="absolute inset-x-0 top-3 text-[9px] font-mono uppercase tracking-[0.2em] text-editorial-paper/40 font-bold mb-4">
              DAILY BLUEPRINT PROGRESS
            </div>

            <div className="relative w-44 h-44 md:w-52 md:h-52 flex items-center justify-center my-2">
              <svg viewBox="0 0 208 208" className="w-full h-full transform -rotate-90">
                <circle
    cx="104"
    cy="104"
    r="92"
    fill="transparent"
    stroke="currentColor"
    strokeWidth="3"
    className="text-editorial-paper/10"
  />
                <motion.circle
    cx="104"
    cy="104"
    r="92"
    fill="transparent"
    stroke="currentColor"
    strokeWidth="8"
    strokeDasharray={578}
    initial={{ strokeDashoffset: 578 }}
    animate={{ strokeDashoffset: 578 - 578 * completionPercentage / 100 }}
    transition={{ duration: 1.5, ease: "easeOut" }}
    className="text-brand-blue shadow-lg"
  />
              </svg>
              
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <motion.span
    initial={{ scale: 0.8 }}
    animate={{ scale: 1 }}
    className="text-5xl md:text-6xl font-serif font-bold text-white tracking-tighter"
  >
                  {completionPercentage}%
                </motion.span>
                <span className="text-[10px] font-mono uppercase tracking-[0.15em] text-editorial-paper/40 mt-1">Mastered</span>
              </div>
            </div>

            <div className="space-y-1 mt-2">
              <p className="text-base font-serif italic text-white leading-tight">
                {completionPercentage === 100 ? "Flawless execution. Your schedule is perfectly completed! \u{1F3C6}" : completionPercentage >= 75 ? "Superb! Highly optimized focus sessions today." : completionPercentage >= 50 ? "Past the median threshold. Excellent momentum." : "Groundwork is set. Accelerate your day!"}
              </p>
              <p className="text-[10px] font-mono text-editorial-paper/40 uppercase tracking-widest mt-1">
                {stats.completed} done &bull; {stats.inProgress} active &bull; {stats.upcoming} todo
              </p>
            </div>
          </div>

        </div>
      </section>

      {
    /* Inspirational Focus Mentor */
  }
      <section className="mb-6">
        <MentorSelector />
      </section>

      {
    /* Active Competition Arena */
  }
      <section className="mb-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
        <CompetitionArena userCompletionCount={stats.completed} userProfile={profile} />
      </section>

      <section>
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 gap-4">
          <div>
            <p className="text-editorial-accent font-mono text-xs uppercase tracking-widest mb-2">Detailed View</p>
            <div className="flex flex-wrap items-center gap-4">
              <h2 className="text-3xl md:text-5xl font-serif">Daily Digest</h2>
              <button
    onClick={() => setIsWeeklyDigestOpen(true)}
    className="mt-1 inline-flex items-center space-x-1.5 px-3 py-1.5 border border-editorial-border hover:bg-editorial-ink hover:text-editorial-paper text-xs font-mono uppercase tracking-widest transition-all rounded-full select-none cursor-pointer font-bold"
    id="weekly-digest-trigger-btn"
  >
                <TrendingUp size={11} className="text-brand-blue" />
                <span>Weekly Digest</span>
              </button>
            </div>
          </div>
          <LiveClock />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-5 gap-6">
          <div className="border border-editorial-border p-6 space-y-4">
            <p className="font-mono text-xs uppercase text-editorial-muted">Total Focus</p>
            <p className="text-4xl md:text-5xl font-serif font-semibold">
              {totalFocusTimeMs > 0 ? formatTotalTime(totalFocusTimeMs) : "00m"}
            </p>
            <p className="text-xs text-editorial-muted uppercase tracking-wider">Productive Time</p>
          </div>
          
          <div className="border border-editorial-border p-6 space-y-4">
            <p className="font-mono text-xs uppercase text-editorial-muted">Completed</p>
            <p className="text-4xl md:text-5xl font-serif font-semibold">{stats.completed < 10 ? `0${stats.completed}` : stats.completed}</p>
            <p className="text-xs text-editorial-muted uppercase tracking-wider">Task Archive</p>
          </div>
          
          <div className="border border-editorial-border p-6 space-y-4 bg-editorial-ink text-editorial-paper">
            <p className="font-mono text-xs uppercase text-editorial-paper/60">In Progress</p>
            <p className="text-4xl md:text-5xl font-serif font-semibold">{stats.inProgress < 10 ? `0${stats.inProgress}` : stats.inProgress}</p>
            <p className="text-xs text-editorial-paper/60 uppercase tracking-wider">Active now</p>
          </div>

          <div className="border border-editorial-border p-6 space-y-3 relative overflow-hidden flex flex-col justify-between">
            <div>
              <p className="font-mono text-xs uppercase text-editorial-muted">Consistency</p>
              <p className="text-4xl md:text-5xl font-serif font-semibold mt-2">{consistencyScore}%</p>
            </div>
            <div className="space-y-1.5">
              <div className="flex flex-wrap gap-1.5 items-center">
                {growthIndex >= 0 ? <span className="inline-flex items-center px-1.5 py-0.5 bg-green-50 border border-green-200 text-green-700 text-[10px] font-mono rounded">
                    <TrendingUp size={10} className="mr-1" />
                    +{growthIndex}% Growth
                  </span> : <span className="inline-flex items-center px-1.5 py-0.5 bg-red-50 border border-red-200 text-red-700 text-[10px] font-mono rounded">
                    <TrendingDown size={10} className="mr-1" />
                    {growthIndex}% Trend
                  </span>}
                {streak > 0 && <span className="inline-flex items-center px-1.5 py-0.5 bg-orange-50 border border-orange-200 text-orange-700 text-[10px] font-mono rounded">
                    🔥 {streak}d Streak
                  </span>}
              </div>
              <p className="text-[10px] text-editorial-muted uppercase tracking-wider font-mono">Growth & Focus Index</p>
            </div>
          </div>

          <div className="border border-editorial-border p-6 space-y-4">
            <p className="font-mono text-xs uppercase text-editorial-muted">Avg Completion</p>
            <p className="text-4xl md:text-5xl font-serif font-semibold">
              {avgTimeToCompleteMs > 0 ? formatDurationFriendly(avgTimeToCompleteMs) : "00m"}
            </p>
            <p className="text-xs text-editorial-muted uppercase tracking-wider">Avg Task Time spent</p>
          </div>
        </div>
      </section>

      {
    /* Achievements and Saved Time Showcase */
  }
      <section className="border border-editorial-border p-6 md:p-8 bg-editorial-paper/50 relative overflow-hidden transition-all hover:bg-editorial-paper">
        <div className="flex flex-col md:flex-row md:items-center justify-between pb-4 border-b border-editorial-border mb-6">
          <div>
            <h3 className="text-xl md:text-2xl font-serif italic flex items-center space-x-2">
              <Trophy className="text-yellow-600" size={22} />
              <span>Architectural Achievements</span>
            </h3>
            <p className="text-xs text-editorial-muted font-mono uppercase tracking-widest mt-1">Unlocked Badges & Medals</p>
          </div>
          <div className="mt-2 md:mt-0 px-3 py-1 bg-brand-blue/10 border border-brand-blue/20 rounded font-mono text-[9px] uppercase tracking-widest text-brand-blue flex items-center space-x-1.5 font-bold">
            <Clock size={12} className="animate-pulse" />
            <span>Total Focus: {formatTotalTime(totalFocusTimeMs)}</span>
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
          {achievements.map((ach) => <div
    key={ach.id}
    className={cn(
      "p-4 border flex flex-col items-center text-center justify-center transition-all duration-300 relative group min-h-[140px]",
      ach.unlocked ? `${ach.badgeColor} shadow-md border-editorial-ink scale-100` : "border-dashed border-editorial-border bg-editorial-muted/5 opacity-40 filter grayscale hover:opacity-60"
    )}
  >
              <span className={cn("text-3xl mb-2 select-none block transition-transform group-hover:scale-125", ach.unlocked && "animate-bounce")}>{ach.icon}</span>
              <h4 className="text-xs font-bold leading-tight font-sans text-editorial-ink mt-1">{ach.title}</h4>
              <p className="text-[9px] text-editorial-muted leading-relaxed mt-1 text-center font-serif italic px-1">
                {ach.description}
              </p>
              {ach.unlocked && <div className="absolute top-2 right-2 w-2.5 h-2.5 bg-green-500 rounded-full border border-white shadow shadow-green-500/50" title="Unlocked!" />}
            </div>)}
        </div>
      </section>

      <section>
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 pb-4 border-b border-editorial-border gap-4">
          <div className="flex items-center space-x-6">
            <h3 className="text-2xl font-serif italic">Active Agenda</h3>
            <button
    onClick={handleBatchAiPrioritize}
    disabled={isAiSuggesting || tasks.length === 0}
    className="flex items-center space-x-2 px-3 py-1.5 bg-brand-blue/10 text-brand-blue hover:bg-brand-blue/20 transition-all rounded-sm font-mono text-[9px] uppercase tracking-widest disabled:opacity-50"
    title="Optimize priorities for all tasks using AI"
  >
              {isAiSuggesting ? <Loader2 size={12} className="animate-spin" /> : <Sparkles size={12} />}
              <span>Batch Prioritize</span>
            </button>
          </div>
          
          <div className="flex flex-wrap items-center gap-3">
            <FilterDropdown
    label="Priority"
    options={priorities}
    selected={selectedPriorities}
    onToggle={(p) => toggleFilter(setSelectedPriorities, p)}
  />
            <FilterDropdown
    label="Status"
    options={statuses}
    selected={selectedStatuses}
    onToggle={(s) => toggleFilter(setSelectedStatuses, s)}
  />
            <FilterDropdown
    label="Category"
    options={categories}
    selected={selectedCategories}
    onToggle={(c) => toggleFilter(setSelectedCategories, c)}
  />
            
            {activeFiltersCount > 0 && <button
    onClick={clearFilters}
    className="flex items-center space-x-2 px-3 py-2 text-editorial-accent hover:bg-editorial-accent hover:text-white border border-editorial-accent transition-all text-[10px] font-mono uppercase tracking-widest"
  >
                <Trash2 size={12} />
                <span>Reset</span>
              </button>}

            <button className="text-xs font-mono uppercase text-editorial-muted hover:text-editorial-ink flex items-center space-x-1 pl-4 border-l border-editorial-border ml-2">
              <span>Archive</span>
              <ArrowUpRight size={14} />
            </button>
          </div>
        </div>

        <div className="space-y-4">
          {loading ? <div className="flex flex-col items-center justify-center py-20 space-y-4 border border-dashed border-editorial-border">
              <Loader2 className="animate-spin text-editorial-accent" size={32} />
              <p className="font-mono text-xs uppercase text-editorial-muted">Synchronizing Data...</p>
            </div> : filteredTasks.length === 0 ? <div className="text-center py-20 border border-dashed border-editorial-border">
              <p className="font-serif italic text-editorial-muted">No matching tasks found.</p>
              {activeFiltersCount > 0 && <button
    onClick={clearFilters}
    className="mt-4 text-xs font-mono uppercase text-editorial-accent hover:underline"
  >
                  Clear all filters
                </button>}
            </div> : <AnimatePresence mode="popLayout">
              {filteredTasks.map((task, index) => {
    const isDueToday = task.dueDate && new Date(task.dueDate).toDateString() === (/* @__PURE__ */ new Date()).toDateString();
    const isLate = task.dueDate && new Date(task.dueDate) < /* @__PURE__ */ new Date() && task.status?.toLowerCase() !== "completed";
    return <motion.div
      key={task.id}
      layout
      initial={{ opacity: 0, x: -20 }}
      animate={{
        opacity: completingId === task.id ? [1, 1, 0.8, 0] : 1,
        x: 0,
        scale: completingId === task.id ? [1, 1.02, 1, 0.98] : 1,
        backgroundColor: completingId === task.id ? ["#fff", "#f0fdf4", "#f0fdf4", "#fff"] : "#fff",
        borderColor: completingId === task.id ? ["#e2e8f0", "#22c55e", "#22c55e", "#e2e8f0"] : isLate ? "#ef4444" : isDueToday ? "#0ea5e9" : "#e2e8f0"
      }}
      exit={{ opacity: 0, x: 40, filter: "blur(12px)", transition: { duration: 0.4, ease: "easeIn" } }}
      transition={{
        opacity: { duration: completingId === task.id ? 1.5 : 0.3, times: [0, 0.4, 0.9, 1] },
        scale: { duration: 1.2, times: [0, 0.2, 0.8, 1] },
        backgroundColor: { duration: 1.2, times: [0, 0.2, 0.8, 1] },
        borderColor: { duration: 1.2, times: [0, 0.2, 0.8, 1] },
        layout: { duration: 0.4, type: "spring", bounce: 0.2 }
      }}
      onClick={() => handleTaskClick(task)}
      className={cn(
        "group border-2 p-6 md:p-8 flex items-start justify-between hover:shadow-2xl hover:border-editorial-ink transition-all duration-300 cursor-pointer bg-editorial-paper relative overflow-hidden rounded-lg",
        isLate ? "border-red-500/50 shadow-red-500/5" : isDueToday ? "border-brand-blue/50 shadow-brand-blue/5" : "border-editorial-border"
      )}
    >
                      {isLate && <div className="absolute top-0 left-0 w-1.5 h-full bg-red-500" />}
                      {isDueToday && !isLate && <div className="absolute top-0 left-0 w-1.5 h-full bg-brand-blue" />}
                      
                      <div className="flex items-start space-x-4 md:space-x-6 w-full overflow-hidden">
                        <button
      onClick={(e) => handleComplete(e, task)}
      className="mt-1.5 group/check relative shrink-0"
    >
                        <AnimatePresence mode="wait">
                          {completingId === task.id || task.status?.toUpperCase() === "COMPLETED" ? <motion.div
      key="checked"
      initial={{ scale: 0, rotate: -90, opacity: 0 }}
      animate={{ scale: [0, 1.4, 1], rotate: [0, 15, 0], opacity: 1 }}
      transition={{
        type: "tween",
        ease: "easeOut",
        duration: 0.5
      }}
      className="text-green-600"
    >
                              <CheckCircle2 size={28} />
                              {completingId === task.id && <motion.div
      initial={{ scale: 1, opacity: 0.5 }}
      animate={{ scale: 2.5, opacity: 0 }}
      transition={{ duration: 0.6 }}
      className="absolute inset-0 bg-green-200 rounded-full -z-10"
    />}
                            </motion.div> : <motion.div
      key="unchecked"
      initial={{ scale: 1 }}
      whileHover={{ scale: 1.12 }}
      whileTap={{ scale: 0.88 }}
      className="text-editorial-muted group-hover/check:text-editorial-ink transition-colors"
    >
                              <Circle size={28} />
                            </motion.div>}
                        </AnimatePresence>
                      </button>
                      
                      <div className="flex-1">
                        {
      /* Title and Badges Row */
    }
                        <div className="relative overflow-hidden flex flex-wrap items-center gap-2 mb-2 w-full">
                          <motion.h4
      className={cn(
        "text-xl md:text-2xl font-serif font-bold tracking-tight transition-colors duration-500",
        completingId === task.id || task.status?.toLowerCase() === "completed" ? "text-editorial-muted italic" : "group-hover:italic",
        isLate ? "text-red-600" : isDueToday ? "text-brand-blue" : ""
      )}
    >
                            {task.title}
                          </motion.h4>
                          {isLate && <motion.span
      initial={{ opacity: 0, scale: 0.5 }}
      animate={{ opacity: 1, scale: 1 }}
      className="flex items-center space-x-1 px-2 py-0.5 bg-red-100 text-red-600 text-[9px] font-mono font-bold uppercase rounded shrink-0"
    >
                              <AlertTriangle size={10} />
                              <span>Overdue</span>
                            </motion.span>}
                          {isDueToday && !isLate && <motion.span
      initial={{ opacity: 0, scale: 0.5 }}
      animate={{ opacity: 1, scale: 1 }}
      className="flex items-center space-x-1 px-2 py-0.5 bg-blue-100 text-brand-blue text-[9px] font-mono font-bold uppercase rounded shrink-0"
    >
                              <AlarmClock size={10} />
                              <span>Due Today</span>
                            </motion.span>}
                          {(completingId === task.id || task.status?.toLowerCase() === "completed") && <motion.div
      initial={{ width: 0 }}
      animate={{ width: "100%" }}
      transition={{ duration: 0.5, ease: "easeInOut" }}
      className="absolute top-1/2 left-0 h-[2px] bg-editorial-muted pointer-events-none"
    />}
                        </div>

                        {
      /* Owner & Priority metadata Row */
    }
                        <div className="flex flex-wrap items-center gap-2.5 mb-3">
                          {task.User && <div className="px-2 py-0.5 bg-editorial-muted/10 text-editorial-muted text-[9px] font-mono uppercase tracking-wider rounded font-semibold">
                              Owner: {task.User.displayName || task.User.username}
                            </div>}
                          <div className={cn(
      "w-2.5 h-2.5 rounded-full ring-2 ring-white",
      task.priority?.toLowerCase() === "high" ? "bg-red-500" : task.priority?.toLowerCase() === "medium" ? "bg-editorial-accent" : "bg-editorial-muted"
    )} title={`${task.priority} Priority`} />
                          <button
      onClick={(e) => handleAiPriorityQuickSuggest(e, task)}
      className="p-1 hover:bg-brand-blue/10 rounded transition-colors text-brand-blue/45 hover:text-brand-blue"
      title="AI Priority Suggestion"
    >
                            <Sparkles size={12} />
                          </button>
                        </div>
                        <p className="text-base text-editorial-muted max-w-2xl mt-2 mb-4 leading-relaxed">{task.description}</p>
                        <div className="flex flex-wrap items-center gap-3 md:gap-5 mt-4">
                          <span className="font-mono text-[11px] uppercase tracking-wider px-3 py-1.5 border border-editorial-border bg-editorial-muted/5 rounded font-medium">
                            {task.category}
                          </span>
                          <div className="flex items-center space-x-1.5 text-editorial-muted text-sm">
                            <Clock size={14} />
                            <span>{task.dueDate ? new Date(task.dueDate).toLocaleString("en-IN", { dateStyle: "short", timeStyle: "short" }) : "No date"}</span>
                          </div>
                          
                          {task.reminderMinutes ? <div className="flex items-center space-x-1 text-editorial-accent">
                              <Bell size={12} className="animate-bounce" />
                              <span className="text-[9px] font-mono uppercase font-bold">{task.reminderMinutes}m</span>
                            </div> : null}
                          
                          {task.status?.toLowerCase() === "todo" && <button
      onClick={(e) => handleStart(e, task)}
      className="px-4 py-2 bg-editorial-ink text-editorial-paper text-xs font-mono uppercase tracking-widest hover:bg-brand-blue hover:text-white transition-all rounded"
    >
                              Start
                            </button>}

                          {task.status?.toLowerCase() !== "completed" && <button
      onClick={(e) => {
        e.stopPropagation();
        handleLaunchDeepFocus(task);
      }}
      className="px-4 py-2 border border-brand-blue/30 bg-brand-blue/5 text-brand-blue hover:bg-brand-blue hover:text-white text-xs font-mono uppercase tracking-widest rounded flex items-center space-x-1.5 transition-all font-bold"
      id={`deep-focus-trigger-${task.id}`}
    >
                              <Zap size={11} className="animate-pulse shrink-0" />
                              <span>Deep Focus</span>
                            </button>}
                          
                          {task.status?.toLowerCase() === "in-progress" && task.startedAt && <div className="flex flex-col space-y-0.5">
                              <div className="flex items-center space-x-1.5 text-brand-blue text-[10px] font-mono uppercase animate-pulse font-bold">
                                <PlayCircle size={12} />
                                <LiveTimer startedAt={task.startedAt} />
                              </div>
                              <div className="text-[9px] font-mono text-editorial-muted uppercase">
                                Started: {formatTime(task.startedAt)}
                              </div>
                            </div>}
                          
                          {task.status?.toLowerCase() === "completed" && <div className="flex flex-col space-y-0.5">
                              {task.startedAt && task.completedAt ? <>
                                  <div className="flex items-center space-x-1.5 text-green-600 text-[10px] font-mono uppercase font-semibold">
                                    <Clock size={12} />
                                    <span>Duration: {formatDuration(task.startedAt, task.completedAt)}</span>
                                  </div>
                                  <div className="text-[9px] font-mono text-editorial-muted uppercase">
                                    {formatTime(task.startedAt)} 
                                    {" \u2192 "}
                                    {formatTime(task.completedAt)}
                                  </div>
                                </> : <div className="flex items-center space-x-1.5 text-editorial-muted text-[9px] font-mono uppercase italic">
                                  <Clock size={12} />
                                  <span>No duration tracking</span>
                                </div>}
                            </div>}
                          
                          {task.status?.toLowerCase() !== "completed" && task.dueDate && <div className={cn(
      "text-xs font-mono uppercase tracking-tight",
      isLate ? "text-red-500 font-bold" : "text-editorial-muted"
    )}>
                              {getRemainingTime(task.dueDate)}
                            </div>}
 
                          <div className="flex-1 max-w-[140px] flex flex-col space-y-1">
                            <div className="flex justify-between items-center text-[9px] font-mono uppercase text-editorial-muted font-semibold">
                              <span>Progress</span>
                              <span>
                                {task.status?.toLowerCase() === "completed" || completingId === task.id ? "100%" : task.status?.toLowerCase() === "in-progress" ? "60%" : "15%"}
                              </span>
                            </div>
                            <div className="h-1.5 bg-editorial-border w-full overflow-hidden rounded-full font-semibold">
                              <motion.div
      initial={{ width: 0 }}
      animate={{
        width: task.status?.toLowerCase() === "completed" || completingId === task.id ? "100%" : task.status?.toLowerCase() === "in-progress" ? "60%" : "15%"
      }}
      transition={{
        type: "spring",
        stiffness: 80,
        damping: 20,
        mass: 0.8
      }}
      className={cn(
        "h-full rounded-full",
        task.status?.toLowerCase() === "completed" || completingId === task.id ? "bg-green-500" : task.status?.toLowerCase() === "in-progress" ? "bg-editorial-accent" : "bg-editorial-muted"
      )}
    />
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    <button
      onClick={(e) => {
        e.stopPropagation();
        handleEditClick(task);
      }}
      className="p-3 text-editorial-muted hover:text-editorial-ink hover:bg-editorial-muted/10 rounded transition-all ml-2 shrink-0"
    >
                      <MoreHorizontal size={24} />
                    </button>
                  </motion.div>;
  })}
            </AnimatePresence>}
        </div>
      </section>

      {
    /* Completed History Section */
  }
      <section className="mt-16">
        <div className="flex items-center space-x-3 mb-8 pb-4 border-b border-editorial-border">
          <History size={24} className="text-editorial-accent" />
          <h3 className="text-2xl font-serif italic">Archive & History</h3>
        </div>

        <div className="border border-editorial-border overflow-hidden">
          <div className="grid grid-cols-1 md:grid-cols-[2fr_1fr_1fr_100px] gap-4 p-4 border-b border-editorial-border bg-editorial-muted/5 font-mono text-[10px] uppercase tracking-widest text-editorial-muted">
            <div>Task Title</div>
            <div>Completion Date</div>
            <div>Duration</div>
            <div className="text-right">Actions</div>
          </div>

          <div className="divide-y divide-editorial-border">
            {safeTasks.filter((t) => t.status?.toLowerCase() === "completed").sort((a, b) => {
    const dateA = a.completedAt ? new Date(a.completedAt).getTime() : 0;
    const dateB = b.completedAt ? new Date(b.completedAt).getTime() : 0;
    return dateB - dateA;
  }).map((task) => <div
    key={task.id}
    onClick={() => handleTaskClick(task)}
    className="grid grid-cols-1 md:grid-cols-[2fr_1fr_1fr_100px] gap-4 p-4 items-center hover:bg-editorial-muted/5 transition-colors cursor-pointer group"
  >
                  <div className="flex items-center space-x-3 overflow-hidden">
                    <CheckCircle2 size={16} className="text-green-600 shrink-0" />
                    <span className="text-editorial-ink font-serif truncate group-hover:italic transition-all">
                      {task.title}
                    </span>
                  </div>
                  
                  <div className="text-xs text-editorial-muted font-mono">
                    {task.completedAt ? new Date(task.completedAt).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric"
  }) : "--"}
                  </div>

                  <div className="text-xs text-editorial-muted font-mono flex items-center space-x-1">
                    {task.startedAt && task.completedAt ? <>
                        <Clock size={12} />
                        <span>{formatDuration(task.startedAt, task.completedAt)}</span>
                      </> : <span className="italic opacity-40">Not tracked</span>}
                  </div>

                  <div className="flex justify-end">
                    <button
    onClick={(e) => {
      e.stopPropagation();
      handleEditClick(task);
    }}
    className="p-1 text-editorial-muted hover:text-editorial-ink transition-colors"
  >
                      <MoreHorizontal size={16} />
                    </button>
                  </div>
                </div>)}

            {safeTasks.filter((t) => t.status?.toLowerCase() === "completed").length === 0 && <div className="p-12 text-center">
                <p className="font-serif italic text-editorial-muted">The archive awaits your completions.</p>
              </div>}
          </div>
        </div>
      </section>
    </main>;
};
export default Dashboard;
