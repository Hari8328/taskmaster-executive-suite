import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { X, Loader2, Plus, Check, Sparkles } from "lucide-react";
import { cn } from "../lib/utils";
import { taskService, categoryService } from "../services/taskService";
import { suggestPriority } from "../lib/gemini";
const TaskFormModal = ({ task, isOpen, onClose, onSuccess }) => {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [status, setStatus] = useState("todo");
  const [priority, setPriority] = useState("medium");
  const [category, setCategory] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [startedAt, setStartedAt] = useState("");
  const [completedAt, setCompletedAt] = useState("");
  const [reminderMinutes, setReminderMinutes] = useState(0);
  const [categories, setCategories] = useState([]);
  const [isAddingCategory, setIsAddingCategory] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState("");
  const [loading, setLoading] = useState(false);
  const [isAiSuggesting, setIsAiSuggesting] = useState(false);
  const [error, setError] = useState("");
  useEffect(() => {
    if (isOpen) {
      loadCategories();
      if (task) {
        setTitle(task.title);
        setDescription(task.description);
        setStatus(task.status.toLowerCase());
        setPriority(task.priority.toLowerCase());
        setCategory(task.category);
        setDueDate(task.dueDate || "");
        setStartedAt(task.startedAt || "");
        setCompletedAt(task.completedAt || "");
        setReminderMinutes(task.reminderMinutes || 0);
      } else {
        setTitle("");
        setDescription("");
        setStatus("todo");
        setPriority("medium");
        setCategory("");
        setDueDate("");
        setStartedAt("");
        setCompletedAt("");
        setReminderMinutes(0);
      }
    }
  }, [isOpen, task]);
  const loadCategories = async () => {
    try {
      const data = await categoryService.getCategories();
      setCategories(data);
    } catch (err) {
      console.error("Failed to load categories");
    }
  };
  const handleAddCategory = async () => {
    if (!newCategoryName.trim()) return;
    try {
      const newCat = await categoryService.createCategory(newCategoryName.trim());
      setCategories([...categories, newCat]);
      setCategory(newCat.name);
      setNewCategoryName("");
      setIsAddingCategory(false);
    } catch (err) {
      setError("Category already exists or failed to create");
    }
  };
  const toInputFormat = (dateStr) => {
    if (!dateStr) return "";
    try {
      const date = new Date(dateStr);
      if (isNaN(date.getTime())) return "";
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, "0");
      const day = String(date.getDate()).padStart(2, "0");
      const hours = String(date.getHours()).padStart(2, "0");
      const minutes = String(date.getMinutes()).padStart(2, "0");
      return `${year}-${month}-${day}T${hours}:${minutes}`;
    } catch (e) {
      return "";
    }
  };
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    const taskData = {
      title,
      description,
      status: status.toUpperCase(),
      priority: priority.toUpperCase(),
      category,
      dueDate: dueDate ? new Date(dueDate).toISOString() : null,
      startedAt: startedAt ? new Date(startedAt).toISOString() : null,
      completedAt: completedAt ? new Date(completedAt).toISOString() : null,
      reminderMinutes: parseInt(String(reminderMinutes)) || 0
    };
    try {
      if (task && task.id) {
        await taskService.updateTask(Number(task.id), taskData);
      } else {
        await taskService.createTask(taskData);
      }
      onSuccess();
      onClose();
    } catch (err) {
      setError(err.response?.data?.message || "Failed to save task");
    } finally {
      setLoading(false);
    }
  };
  const handleStatusChange = (newStatus) => {
    setStatus(newStatus);
    const now = (/* @__PURE__ */ new Date()).toISOString();
    if ((newStatus === "in-progress" || newStatus === "completed") && !startedAt) {
      setStartedAt(now);
    }
    if (newStatus === "completed" && !completedAt) {
      setCompletedAt(now);
    }
  };
  const handleAiPrioritySuggestion = async () => {
    if (!title) {
      setError("Title is required for AI priority suggestion");
      return;
    }
    setIsAiSuggesting(true);
    setError("");
    try {
      const suggested = await suggestPriority(title, description, dueDate);
      setPriority(suggested.toLowerCase());
    } catch (err) {
      console.error("AI priority suggestion failed:", err);
      setError("AI could not determine priority. Using default.");
    } finally {
      setIsAiSuggesting(false);
    }
  };
  return <AnimatePresence>
      {isOpen && <>
          <motion.div
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    exit={{ opacity: 0 }}
    onClick={onClose}
    className="fixed inset-0 bg-editorial-ink/60 backdrop-blur-md z-[60]"
  />
          
          <motion.div
    initial={{ opacity: 0, scale: 0.95, y: 30 }}
    animate={{ opacity: 1, scale: 1, y: 0 }}
    exit={{ opacity: 0, scale: 0.95, y: 30 }}
    className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-xl bg-editorial-paper border border-editorial-border/60 shadow-2xl z-[70] overflow-hidden max-h-[85vh] flex flex-col rounded-3xl"
  >
            {
    /* Top decorative gradient bar */
  }
            <div className="h-1.5 w-full bg-gradient-to-r from-editorial-accent via-indigo-400 to-editorial-accent/80 shrink-0" />

            <div className="flex justify-between items-center px-8 py-6 border-b border-editorial-border/40 bg-editorial-paper shrink-0">
              <div className="text-left">
                <h2 className="text-2xl font-serif font-bold italic text-editorial-ink">
                  {task ? "Refine Workspace Task" : "Draft New Insight Task"}
                </h2>
                <p className="font-mono text-[9px] uppercase tracking-wider text-editorial-muted mt-0.5">
                  {task ? "Edit existing focus item details" : "Anchor your commitment in the digital directory"}
                </p>
              </div>
              <button
    onClick={onClose}
    type="button"
    className="p-2 text-editorial-muted hover:text-editorial-ink hover:bg-editorial-muted/10 rounded-full transition-all"
  >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-8 space-y-6 overflow-y-auto flex-1 custom-scrollbar text-left scroll-smooth">
              {
    /* Task Title */
  }
              <div className="space-y-2">
                <label className="font-mono text-[10px] uppercase tracking-wider text-editorial-muted flex items-center justify-between">
                  <span>Task Title</span>
                  <span className="text-[9px] italic lowercase text-editorial-muted/60">*required</span>
                </label>
                <input
    type="text"
    value={title}
    onChange={(e) => setTitle(e.target.value)}
    className="w-full bg-transparent border-b-2 border-editorial-border/60 py-2.5 text-xl font-serif focus:outline-none focus:border-editorial-accent transition-colors italic text-editorial-ink"
    placeholder="e.g., Architect daily task schema..."
    required
  />
              </div>

              {
    /* Task Description */
  }
              <div className="space-y-2">
                <label className="font-mono text-[10px] uppercase tracking-wider text-editorial-muted">Detailed Description</label>
                <textarea
    value={description}
    onChange={(e) => setDescription(e.target.value)}
    className="w-full bg-editorial-muted/5 border border-editorial-border p-4 text-sm font-serif min-h-[90px] focus:outline-none focus:border-editorial-accent rounded-xl resize-none transition-colors"
    placeholder="Provide sub-tasks, scope, or inspiration details..."
  />
              </div>

              {
    /* Custom Status Selection Rows */
  }
              <div className="space-y-2.5">
                <label className="font-mono text-[10px] uppercase tracking-wider text-editorial-muted">Status Progress</label>
                <div className="grid grid-cols-3 gap-2">
                  {[
    { id: "todo", label: "Todo", colorActive: "bg-zinc-100 border-zinc-900 text-zinc-900", colorInactive: "border-zinc-200 text-zinc-500 hover:border-zinc-400" },
    { id: "in-progress", label: "In Progress", colorActive: "bg-emerald-50 border-emerald-600 text-emerald-800 font-medium", colorInactive: "border-zinc-200 text-zinc-500 hover:border-emerald-200" },
    { id: "completed", label: "Completed", colorActive: "bg-indigo-50 border-indigo-600 text-indigo-800 font-medium", colorInactive: "border-zinc-200 text-zinc-500 hover:border-indigo-200" }
  ].map((s) => {
    const isActive = status === s.id;
    return <button
      key={s.id}
      type="button"
      onClick={() => handleStatusChange(s.id)}
      className={cn(
        "py-2.5 px-4 text-xs font-mono rounded-xl border text-center transition-all flex items-center justify-center space-x-1",
        isActive ? s.colorActive + " border-2 shadow-sm font-semibold" : s.colorInactive
      )}
    >
                        {isActive && <Check size={12} className="shrink-0" />}
                        <span>{s.label}</span>
                      </button>;
  })}
                </div>
              </div>

              {
    /* Custom Priority (Segmented Buttons + AI suggestion) */
  }
              <div className="space-y-2.5">
                <div className="flex items-center justify-between">
                  <label className="font-mono text-[10px] uppercase tracking-wider text-editorial-muted">Priority Weight</label>
                  <button
    type="button"
    onClick={handleAiPrioritySuggestion}
    disabled={isAiSuggesting || !title}
    className="flex items-center space-x-1.5 px-3 py-1 bg-indigo-50 hover:bg-indigo-100 border border-indigo-200 rounded-full text-[9px] font-mono uppercase tracking-[0.05em] text-indigo-700 hover:text-indigo-800 disabled:opacity-40 transition-all shadow-sm select-none"
    title="Get AI suggested priority based on title and description"
  >
                    {isAiSuggesting ? <Loader2 size={10} className="animate-spin text-indigo-700" /> : <Sparkles size={10} className="text-indigo-600 fill-indigo-200 animate-pulse" />}
                    <span>{isAiSuggesting ? "Analyzing..." : "AI Suggest Priority"}</span>
                  </button>
                </div>
                <div className="grid grid-cols-3 gap-2">
                  {[
    { id: "low", label: "Low", activeClass: "bg-slate-100 border-slate-700 text-slate-800", inactiveClass: "border-zinc-200 text-zinc-400 hover:border-slate-300" },
    { id: "medium", label: "Medium", activeClass: "bg-amber-50 border-amber-600 text-amber-800 font-semibold", inactiveClass: "border-zinc-200 text-zinc-400 hover:border-amber-300" },
    { id: "high", label: "High \u{1F525}", activeClass: "bg-red-50 border-red-600 text-red-800 font-bold", inactiveClass: "border-zinc-200 text-zinc-400 hover:border-red-300" }
  ].map((p) => {
    const isActive = priority === p.id;
    return <button
      key={p.id}
      type="button"
      onClick={() => setPriority(p.id)}
      className={cn(
        "py-2.5 px-4 text-xs font-mono uppercase rounded-xl border text-center transition-all",
        isActive ? p.activeClass + " border-2 shadow-sm" : p.inactiveClass
      )}
    >
                        {p.label}
                      </button>;
  })}
                </div>
              </div>

              {
    /* Dynamic Category Selector (Pill format) */
  }
              <div className="space-y-2.5">
                <label className="font-mono text-[10px] uppercase tracking-wider text-editorial-muted">Task Workspace Category</label>
                <div className="flex flex-wrap gap-2 py-1 max-h-[120px] overflow-y-auto custom-scrollbar">
                  {categories.map((cat) => {
    const isSelected = category === cat.name;
    return <button
      key={cat.id}
      type="button"
      onClick={() => setCategory(isSelected ? "" : cat.name)}
      className={cn(
        "px-3 py-1.5 text-xs font-serif rounded-full border transition-all flex items-center space-x-1.5",
        isSelected ? "bg-editorial-ink text-editorial-paper border-editorial-ink font-semibold" : "bg-transparent border-editorial-border/80 text-editorial-muted hover:border-editorial-ink hover:text-editorial-ink"
      )}
    >
                        <span>{cat.name}</span>
                        {isSelected && <Check size={11} />}
                      </button>;
  })}
                  
                  {!isAddingCategory ? <button
    type="button"
    onClick={() => setIsAddingCategory(true)}
    className="px-3 py-1.5 text-xs font-mono uppercase text-editorial-accent hover:bg-editorial-accent/10 border border-dashed border-editorial-accent/40 hover:border-editorial-accent rounded-full transition-all flex items-center space-x-1"
  >
                      <Plus size={11} />
                      <span>New Category</span>
                    </button> : <div className="flex items-center space-x-1.5 border border-editorial-border rounded-lg px-2 py-1 bg-white">
                      <input
    type="text"
    value={newCategoryName}
    onChange={(e) => setNewCategoryName(e.target.value)}
    className="bg-transparent text-xs font-serif w-24 focus:outline-none"
    placeholder="Add tag..."
    autoFocus
    onKeyDown={(e) => {
      if (e.key === "Enter") {
        e.preventDefault();
        handleAddCategory();
      }
    }}
  />
                      <button
    type="button"
    onClick={handleAddCategory}
    className="text-emerald-600 hover:text-emerald-700 p-0.5"
  >
                        <Check size={13} />
                      </button>
                      <button
    type="button"
    onClick={() => setIsAddingCategory(false)}
    className="text-editorial-muted hover:text-editorial-ink p-0.5"
  >
                        <X size={13} />
                      </button>
                    </div>}
                </div>
              </div>

              {
    /* Started At / Completed At Times */
  }
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="font-mono text-[10px] uppercase tracking-wider text-editorial-muted">Started At</label>
                  <input
    type="datetime-local"
    value={toInputFormat(startedAt)}
    onChange={(e) => setStartedAt(e.target.value)}
    className="w-full bg-transparent border-b border-editorial-border py-1.5 text-xs font-mono focus:outline-none focus:border-editorial-ink transition-colors"
  />
                </div>
                <div className="space-y-1.5">
                  <label className="font-mono text-[10px] uppercase tracking-wider text-editorial-muted">Completed At</label>
                  <input
    type="datetime-local"
    value={toInputFormat(completedAt)}
    onChange={(e) => setCompletedAt(e.target.value)}
    className="w-full bg-transparent border-b border-editorial-border py-1.5 text-xs font-mono focus:outline-none focus:border-editorial-ink transition-colors"
  />
                </div>
              </div>

              {
    /* Due Date & Reminder Settings */
  }
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="font-mono text-[10px] uppercase tracking-wider text-editorial-muted">Due Date Deadline</label>
                  <input
    type="datetime-local"
    value={toInputFormat(dueDate)}
    onChange={(e) => setDueDate(e.target.value)}
    className="w-full bg-transparent border-b border-editorial-border py-1.5 text-xs font-mono focus:outline-none focus:border-editorial-ink transition-colors"
  />
                </div>
                <div className="space-y-1.5">
                  <label className="font-mono text-[10px] uppercase tracking-wider text-editorial-muted">Audible Reminder</label>
                  <select
    value={reminderMinutes}
    onChange={(e) => setReminderMinutes(parseInt(e.target.value))}
    className="w-full bg-transparent border-b border-editorial-border py-1.5 text-xs font-mono uppercase focus:outline-none focus:border-editorial-ink transition-colors"
  >
                    <option value={0}>No Reminder</option>
                    <option value={15}>15 Minutes Before</option>
                    <option value={30}>30 Minutes Before</option>
                    <option value={60}>1 Hour Before</option>
                    <option value={1440}>1 Day Before</option>
                  </select>
                </div>
              </div>

              {error && <p className="text-red-500 text-[10px] font-mono uppercase text-center mt-2">{error}</p>}

              {
    /* Footer Control Actions */
  }
              <div className="pt-6 border-t border-editorial-border/40 flex justify-end space-x-4 items-center">
                <button
    type="button"
    onClick={onClose}
    className="px-6 py-2.5 text-xs font-mono uppercase tracking-widest text-editorial-muted hover:text-editorial-ink hover:underline transition-all"
  >
                  Close Draft
                </button>
                <button
    type="submit"
    disabled={loading}
    className="px-8 py-3.5 bg-editorial-ink text-editorial-paper hover:bg-neutral-800 rounded-xl transition-all font-mono text-xs uppercase tracking-widest flex items-center space-x-2 shadow-lg hover:shadow-xl active:scale-[0.98] disabled:opacity-50"
  >
                  {loading ? <Loader2 size={13} className="animate-spin text-editorial-paper" /> : <Check size={13} className="text-editorial-paper" />}
                  <span>{task ? "Commit Changes" : "Anchor Task"}</span>
                </button>
              </div>
            </form>
          </motion.div>
        </>}
    </AnimatePresence>;
};
export default TaskFormModal;
