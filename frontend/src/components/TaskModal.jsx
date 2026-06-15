import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { X, Calendar, Clock, Tag, AlertCircle, PlayCircle, CheckCircle2, User as UserIcon, Sparkles, Loader2, ClipboardList } from "lucide-react";
import { cn } from "../lib/utils";
import { breakdownTask } from "../lib/gemini";
const TaskModal = ({ task, isOpen, onClose, onEdit }) => {
  const [isBreakingDown, setIsBreakingDown] = useState(false);
  const [substeps, setSubsteps] = useState([]);
  const [error, setError] = useState(null);
  const formatDate = (dateStr) => {
    if (!dateStr) return "Not set";
    const date = new Date(dateStr);
    if (isNaN(date.getTime())) return "Invalid date";
    return date.toLocaleString("en-IN", {
      day: "numeric",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit"
    });
  };
  const handleBreakdown = async () => {
    if (!task) return;
    setIsBreakingDown(true);
    setError(null);
    try {
      const steps = await breakdownTask(task.title, task.description);
      setSubsteps(steps);
    } catch (err) {
      console.error("AI Breakdown failed:", err);
      setError("AI was unable to architect this blueprint. Check your connection.");
    } finally {
      setIsBreakingDown(false);
    }
  };
  if (!task) return null;
  return <AnimatePresence>
      {isOpen && <>
          {
    /* Backdrop */
  }
          <motion.div
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    exit={{ opacity: 0 }}
    onClick={onClose}
    className="fixed inset-0 bg-editorial-ink/40 backdrop-blur-sm z-50"
  />
          
          {
    /* Modal Content */
  }
          <motion.div
    initial={{ opacity: 0, scale: 0.95, y: 20 }}
    animate={{ opacity: 1, scale: 1, y: 0 }}
    exit={{ opacity: 0, scale: 0.95, y: 20 }}
    className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-2xl bg-editorial-paper border border-editorial-border shadow-2xl z-50 overflow-hidden"
  >
            <div className="flex justify-between items-start p-8 border-b border-editorial-border">
              <div className="space-y-1">
                <div className="flex items-center space-x-2">
                  <span className={cn(
    "px-2 py-0.5 font-mono text-[10px] uppercase border",
    task.priority === "high" ? "border-red-500 text-red-500" : task.priority === "medium" ? "border-editorial-accent text-editorial-accent" : "border-editorial-muted text-editorial-muted"
  )}>
                    {task.priority} Priority
                  </span>
                  <span className="font-mono text-[10px] uppercase text-editorial-muted">
                    {task.status.replace("-", " ")}
                  </span>
                </div>
                <h2 className="text-4xl font-serif italic">{task.title}</h2>
              </div>
              <button
    onClick={onClose}
    className="p-2 text-editorial-muted hover:text-editorial-ink transition-colors"
  >
                <X size={24} />
              </button>
            </div>

            <div className="p-8 space-y-8">
              <div className="space-y-2">
                <p className="font-mono text-xs uppercase text-editorial-muted">Description</p>
                <div className="space-y-4">
                  <p className="text-lg leading-relaxed text-editorial-ink/80">
                    {task.description}
                  </p>
                  
                  {
    /* AI Breakdown Button & Content */
  }
                  <div className="pt-4">
                    {!substeps.length && !isBreakingDown && <button
    onClick={handleBreakdown}
    className="flex items-center space-x-2 text-[10px] font-mono uppercase tracking-[0.2em] text-brand-blue hover:text-brand-blue/80 transition-colors bg-brand-blue/5 px-4 py-2 border border-brand-blue/10 hover:border-brand-blue/30"
  >
                        <Sparkles size={12} />
                        <span>Architect Breakdown</span>
                      </button>}

                    {isBreakingDown && <div className="flex items-center space-x-3 text-editorial-muted p-4 bg-editorial-muted/5 border border-dashed border-editorial-border">
                        <Loader2 size={16} className="animate-spin text-brand-blue" />
                        <p className="text-xs font-serif italic">Gemini is deriving the optimal sub-structure...</p>
                      </div>}

                    {substeps.length > 0 && <motion.div
    initial={{ opacity: 0, scale: 0.98 }}
    animate={{ opacity: 1, scale: 1 }}
    className="bg-brand-blue/5 border border-brand-blue/20 p-6 space-y-4"
  >
                        <div className="flex items-center justify-between border-b border-brand-blue/10 pb-3">
                          <div className="flex items-center space-x-2">
                            <ClipboardList size={14} className="text-brand-blue" />
                            <p className="font-mono text-[10px] uppercase tracking-widest text-brand-blue">AI-Generated Blueprint</p>
                          </div>
                          <button
    onClick={() => setSubsteps([])}
    className="text-[9px] font-mono uppercase text-editorial-muted hover:text-editorial-ink"
  >
                            Clear
                          </button>
                        </div>
                        <ul className="space-y-3">
                          {substeps.map((step, i) => <motion.li
    key={i}
    initial={{ opacity: 0, x: -10 }}
    animate={{ opacity: 1, x: 0 }}
    transition={{ delay: i * 0.1 }}
    className="flex items-start space-x-3 text-editorial-ink/80"
  >
                              <span className="w-4 h-4 rounded-full border border-brand-blue/30 flex items-center justify-center text-[10px] font-mono text-brand-blue shrink-0 mt-0.5">
                                {i + 1}
                              </span>
                              <span className="text-sm font-serif italic -mt-0.5">{step}</span>
                            </motion.li>)}
                        </ul>
                      </motion.div>}
                    
                    {error && <p className="text-[10px] font-mono uppercase text-red-500 mt-2 italic px-2">{error}</p>}
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-8 pt-8 border-t border-editorial-border">
                <div className="space-y-4">
                  <div className="flex items-center space-x-3 text-editorial-muted">
                    <Tag size={18} className="text-editorial-accent" />
                    <div className="space-y-0.5">
                      <p className="font-mono text-[10px] uppercase">Category</p>
                      <p className="text-sm font-medium text-editorial-ink">{task.category}</p>
                    </div>
                  </div>
                  
                    <div className="flex items-center space-x-3 text-editorial-muted">
                      <Calendar size={18} className="text-editorial-accent" />
                      <div className="space-y-0.5">
                        <p className="font-mono text-[10px] uppercase">Due Date</p>
                        <p className="text-sm font-medium text-editorial-ink">{formatDate(task.dueDate)}</p>
                      </div>
                    </div>
                  </div>
  
                  <div className="space-y-4">
                    <div className="flex items-center space-x-3 text-editorial-muted">
                      <Clock size={18} className="text-editorial-accent" />
                      <div className="space-y-0.5">
                        <p className="font-mono text-[10px] uppercase">Created At</p>
                        <p className="text-sm font-medium text-editorial-ink text-wrap">{formatDate(task.createdAt)}</p>
                      </div>
                    </div>
  
                    {task.startedAt && <div className="flex items-center space-x-3 text-editorial-muted">
                        <PlayCircle size={18} className="text-editorial-accent" />
                        <div className="space-y-0.5">
                          <p className="font-mono text-[10px] uppercase">Started At</p>
                          <p className="text-sm font-medium text-editorial-ink">{formatDate(task.startedAt)}</p>
                        </div>
                      </div>}
  
                    {task.completedAt && <div className="flex items-center space-x-3 text-editorial-muted">
                        <CheckCircle2 size={18} className="text-green-600" />
                        <div className="space-y-0.5">
                          <p className="font-mono text-[10px] uppercase">Completed At</p>
                          <p className="text-sm font-medium text-editorial-ink">{formatDate(task.completedAt)}</p>
                        </div>
                      </div>}

                  <div className="flex items-center space-x-3 text-editorial-muted">
                    <UserIcon size={18} className="text-editorial-accent" />
                    <div className="space-y-0.5">
                      <p className="font-mono text-[10px] uppercase">Owner</p>
                      <p className="text-sm font-medium text-editorial-ink">{task.User?.displayName || task.User?.username || "You"}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-3 text-editorial-muted">
                    <AlertCircle size={18} className="text-editorial-accent" />
                    <div className="space-y-0.5">
                      <p className="font-mono text-[10px] uppercase">Task ID</p>
                      <p className="text-sm font-mono text-editorial-ink">#{String(task.id).padStart(4, "0")}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="p-8 bg-editorial-ink/5 flex justify-end space-x-4">
              <button
    onClick={onClose}
    className="px-6 py-2 text-sm font-medium text-editorial-muted hover:text-editorial-ink transition-colors"
  >
                Close
              </button>
              <button
    onClick={() => onEdit(task)}
    className="px-6 py-2 text-sm font-medium bg-editorial-ink text-editorial-paper hover:bg-editorial-ink/90 transition-colors"
  >
                Edit Task
              </button>
            </div>
          </motion.div>
        </>}
    </AnimatePresence>;
};
export default TaskModal;
