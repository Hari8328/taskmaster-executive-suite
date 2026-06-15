import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { MoreHorizontal, Clock, Loader2, CheckCircle2, Circle, Filter, X, Plus, ChevronDown, Trash2, AlertTriangle, AlarmClock } from 'lucide-react';
import { cn } from '../lib/utils';
import { Task, Status, Priority } from '../types';
import TaskModal from './TaskModal';
import TaskFormModal from './TaskFormModal';
import { taskService } from '../services/taskService';
import { authService } from '../services/authService';
import { 
  checkAndUnlockAchievements, 
  saveCompletedTaskTime, 
  playCompleteSound, 
  dispatchCelebration 
} from '../lib/audioAndAchievements';

interface TasksViewProps {
  refreshTrigger?: number;
}

const TasksView: React.FC<TasksViewProps> = ({ refreshTrigger }) => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [taskToEdit, setTaskToEdit] = useState<Task | null>(null);
  const [completingId, setCompletingId] = useState<string | number | null>(null);
  
  // Filter States
  const [isFiltersOpen, setIsFiltersOpen] = useState(false);
  const [selectedPriorities, setSelectedPriorities] = useState<Priority[]>([]);
  const [selectedStatuses, setSelectedStatuses] = useState<Status[]>([]);
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);

  useEffect(() => {
    fetchTasks();
  }, [refreshTrigger]);

  const fetchTasks = async () => {
    setLoading(true);
    setCompletingId(null);
    try {
      const user = authService.getCurrentUser();
      let response;
      if (user && user.roles.includes('ROLE_ADMIN')) {
        response = await taskService.getAllTasksAdmin(0, 100);
      } else {
        response = await taskService.getMyTasks(0, 100);
      }
      setTasks(response.content || []);
    } catch (error) {
      console.error('Error fetching tasks:', error);
      setTasks([]);
    } finally {
      setLoading(false);
    }
  };

  const handleComplete = async (e: React.MouseEvent, task: Task) => {
    e.stopPropagation();
    if (task.status?.toLowerCase() === 'completed') return;
    
    setCompletingId(task.id as any);
    const now = new Date().toISOString();
    try {
      // Calculate duration since tracking started
      let durationMs: number | null = null;
      if (task.startedAt) {
        durationMs = Math.max(0, new Date().getTime() - new Date(task.startedAt).getTime());
      }

      // Play joyful completed chime
      playCompleteSound();

      // Save completed time logic
      if (durationMs) {
        saveCompletedTaskTime(durationMs);
      }

      // Check achievements
      const completedTask = {
        ...task,
        status: 'completed' as Status,
        completedAt: now,
        startedAt: task.startedAt || now
      };
      const updatedTasksList = safeTasks.map(t => t.id === task.id ? completedTask : t);
      const newUnlocks = checkAndUnlockAchievements(updatedTasksList);

      // Trigger Celebration Alert
      dispatchCelebration({
        taskTitle: task.title,
        durationMs: durationMs,
        newAchievements: newUnlocks
      });

      await taskService.updateTask(Number(task.id), {
        ...task,
        status: 'completed',
        completedAt: now,
        startedAt: task.startedAt || now
      } as any);
      setTimeout(fetchTasks, 1000);
    } catch (err) {
      console.error('Failed to complete task');
      setCompletingId(null);
    }
  };

  const handleStart = async (e: React.MouseEvent, task: Task) => {
    e.stopPropagation();
    try {
      await taskService.updateTask(Number(task.id), {
        ...task,
        status: 'in-progress',
        startedAt: task.startedAt || new Date().toISOString()
      } as any);
      fetchTasks();
    } catch (err) {
      console.error('Failed to start task');
    }
  };

  const safeTasks = Array.isArray(tasks) ? tasks : [];
  const categories = Array.from(new Set(safeTasks.map(t => t.category))).filter(Boolean);
  const priorities: Priority[] = ['low', 'medium', 'high'];
  const statuses: Status[] = ['todo', 'in-progress', 'completed'];

  const filteredTasks = safeTasks.filter(task => {
    const taskPriority = task.priority?.toLowerCase() as Priority;
    const taskStatus = task.status?.toLowerCase() as Status;
    
    const matchesPriority = selectedPriorities.length === 0 || selectedPriorities.includes(taskPriority);
    const matchesStatus = selectedStatuses.length === 0 || selectedStatuses.includes(taskStatus);
    const matchesCategory = selectedCategories.length === 0 || selectedCategories.includes(task.category);
    return matchesPriority && matchesStatus && matchesCategory;
  });

  const formatDuration = (start?: string, end?: string) => {
    if (!start || !end) return null;
    const s = new Date(start).getTime();
    const e = new Date(end).getTime();
    if (isNaN(s) || isNaN(e)) return null;
    const diff = Math.max(0, e - s);
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const mins = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    if (hours > 0) return `${hours}h ${mins}m`;
    return `${mins}m`;
  };

  const toggleFilter = (set: any, value: any) => {
    set((prev: any[]) => 
      prev.includes(value) ? prev.filter(i => i !== value) : [...prev, value]
    );
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
  }: { 
    label: string, 
    options: string[], 
    selected: string[], 
    onToggle: (val: any) => void,
    icon?: any
  }) => {
    const [isOpen, setIsOpen] = useState(false);
    const containerRef = React.useRef<HTMLDivElement>(null);

    useEffect(() => {
      const handleClickOutside = (event: MouseEvent) => {
        if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
          setIsOpen(false);
        }
      };
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    return (
      <div className="relative" ref={containerRef}>
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
          {isOpen && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 10 }}
              className="absolute z-50 top-full left-0 mt-2 w-56 bg-editorial-paper border border-editorial-ink shadow-2xl p-2"
            >
              <div className="max-h-60 overflow-y-auto space-y-1 custom-scrollbar">
                {options.map(opt => (
                  <button
                    key={opt}
                    onClick={() => onToggle(opt)}
                    className={cn(
                      "flex items-center justify-between w-full px-3 py-2 text-[10px] font-mono uppercase transition-colors text-left",
                      selected.includes(opt) ? "bg-editorial-ink text-editorial-paper" : "hover:bg-editorial-muted/10 text-editorial-ink"
                    )}
                  >
                    <span>{opt.replace('_', ' ')}</span>
                    {selected.includes(opt) && <X size={10} />}
                  </button>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    );
  };

  return (
    <div className="p-4 md:p-10 space-y-6 md:space-y-8">
      <TaskModal 
        task={selectedTask} 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        onEdit={(t) => { setTaskToEdit(t); setIsEditModalOpen(true); setIsModalOpen(false); }}
      />
      <TaskFormModal 
        task={taskToEdit}
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        onSuccess={fetchTasks}
      />

      {/* Centered Task Creator Desk */}
      <div className="bg-editorial-paper border border-editorial-border hover:border-editorial-accent rounded-3xl p-8 shadow-md flex flex-col md:flex-row items-center justify-between gap-6 text-center md:text-left transition-all duration-300">
        <div className="space-y-1.5 flex-1">
          <div className="flex items-center justify-center md:justify-start space-x-2">
            <span className="font-mono text-[9px] uppercase tracking-widest text-[#0ea5e9] font-bold bg-[#0ea5e9]/10 px-2.5 py-1 rounded-full border border-[#0ea5e9]/20">WORKSPACE DESK</span>
            <span className="font-mono text-[9px] uppercase tracking-widest text-emerald-600 font-bold bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-100">Live Creator</span>
          </div>
          <h3 className="text-2xl md:text-3xl font-serif font-bold italic text-editorial-ink mt-2">Draft your next workspace task commitment</h3>
          <p className="text-xs font-serif text-editorial-muted max-w-xl">
            Translate thoughts into structured milestones. Set deadlines, custom workspaces, priorities, and sound reminders to maintain your daily compounding progress.
          </p>
        </div>
        <button
          onClick={() => { setTaskToEdit(null); setIsEditModalOpen(true); }}
          className="px-8 py-4 bg-editorial-ink text-editorial-paper hover:bg-neutral-800 font-mono text-xs uppercase tracking-widest rounded-2xl transition-all font-bold shadow-lg shadow-neutral-900/10 active:scale-[0.98] hover:shadow-xl shrink-0 flex items-center justify-center space-x-2 border border-editorial-ink"
        >
          <Plus size={16} />
          <span>Launch Task Creator Desk</span>
        </button>
      </div>

      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-6 border-b border-editorial-border">
        <h2 className="text-3xl md:text-4xl font-serif italic">Tasks Repository</h2>
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

          {activeFiltersCount > 0 && (
            <button 
              onClick={clearFilters}
              className="flex items-center space-x-2 px-3 py-2 text-editorial-accent hover:bg-editorial-accent hover:text-white border border-editorial-accent transition-all text-[10px] font-mono uppercase tracking-widest"
            >
              <Trash2 size={12} />
              <span>Reset</span>
            </button>
          )}
        </div>
      </div>

      <div className="border border-editorial-border divide-y divide-editorial-border">
        {loading ? (
          <div className="py-20 flex flex-col items-center justify-center space-y-4">
            <Loader2 className="animate-spin text-editorial-accent" size={32} />
            <p className="font-mono text-[10px] uppercase text-editorial-muted italic">Accessing Ledger...</p>
          </div>
        ) : filteredTasks.length === 0 ? (
          <div className="py-20 text-center flex flex-col items-center justify-center max-w-md mx-auto space-y-6">
            <div className="w-16 h-16 rounded-full border border-dashed border-editorial-border flex items-center justify-center bg-editorial-paper">
              <CheckCircle2 size={32} className="text-editorial-muted animate-pulse" />
            </div>
            <div>
              <h3 className="text-xl font-serif italic text-editorial-ink">No alignment protocols found</h3>
              <p className="font-mono text-[10px] text-editorial-muted mt-2 leading-relaxed uppercase">
                {activeFiltersCount > 0 
                  ? "Your current ledger filters are holding back any matching records." 
                  : "Every stone has been set. No passive task assignments remain."}
              </p>
            </div>
            {activeFiltersCount > 0 ? (
              <button 
                onClick={clearFilters}
                className="px-5 py-2.5 border border-editorial-ink hover:bg-editorial-ink hover:text-editorial-paper transition-all font-mono text-[10px] uppercase tracking-widest"
              >
                Reset All Filters
              </button>
            ) : (
              <button 
                onClick={() => { setTaskToEdit(null); setIsEditModalOpen(true); }}
                className="px-6 py-3.5 bg-editorial-ink text-editorial-paper hover:bg-neutral-800 transition-all font-mono text-[10px] uppercase tracking-widest flex items-center space-x-3 shadow-md rounded-xl"
              >
                <Plus size={14} />
                <span>Create First Task</span>
              </button>
            )}
          </div>
        ) : (
          <AnimatePresence mode="popLayout">
            {filteredTasks.map((task, index) => {
              const isDueToday = task.dueDate && new Date(task.dueDate).toDateString() === new Date().toDateString();
              const isLate = task.dueDate && new Date(task.dueDate) < new Date() && task.status?.toLowerCase() !== 'completed';

              return (
                <motion.div
                  key={task.id}
                  layout
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ 
                    opacity: completingId === task.id ? [1, 1, 0] : 1,
                    backgroundColor: completingId === task.id ? ["rgba(255,255,255,0)", "rgba(34,197,94,0.1)", "rgba(255,255,255,0)"] : "rgba(255,255,255,0)",
                    x: 0,
                    borderColor: isLate ? "rgba(239, 68, 68, 0.3)" : isDueToday ? "rgba(14, 165, 233, 0.3)" : "rgba(226, 232, 240, 1)"
                  }}
                  exit={{ opacity: 0, x: 20, transition: { duration: 0.3 } }}
                  transition={{ 
                    opacity: { duration: completingId === task.id ? 1.2 : 0.3, times: [0, 0.7, 1] },
                    backgroundColor: { duration: 1.2 }
                  }}
                  onClick={() => { setSelectedTask(task); setIsModalOpen(true); }}
                  className={cn(
                    "group flex items-center p-6 border-b hover:bg-editorial-muted/5 transition-colors cursor-pointer relative overflow-hidden",
                    isLate ? "bg-red-50/20" : isDueToday ? "bg-blue-50/20" : ""
                  )}
                >
                  {isLate && <div className="absolute top-0 left-0 w-1 h-full bg-red-500" />}
                  {isDueToday && !isLate && <div className="absolute top-0 left-0 w-1 h-full bg-brand-blue" />}
                  
                  <div className="flex flex-col md:flex-row md:items-center space-y-4 md:space-y-0 md:space-x-6 flex-1">
                  <div className="flex items-center space-x-6">
                    <button 
                      onClick={(e) => handleComplete(e, task)}
                      className="text-editorial-muted hover:text-editorial-ink transition-colors relative"
                    >
                      <AnimatePresence mode="wait">
                        {task.status?.toLowerCase() === 'completed' || completingId === task.id ? (
                          <motion.div
                            key="checked"
                            initial={{ scale: 0, rotate: -45 }}
                            animate={{ scale: [0, 1.3, 1], rotate: 0 }}
                            transition={{ type: "tween", ease: "easeOut", duration: 0.4 }}
                            className="text-green-600"
                          >
                            <CheckCircle2 size={20} />
                          </motion.div>
                        ) : (
                          <motion.div
                            key="unchecked"
                            initial={{ scale: 1 }}
                            whileHover={{ scale: 1.2 }}
                            whileTap={{ scale: 0.8 }}
                          >
                            <Circle size={20} />
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </button>
                    
                    <div className="flex items-center space-x-3">
                      <div className="relative">
                        <div className="flex items-center space-x-2 mb-1">
                          {task.User && (
                            <span className="px-1 py-0.5 bg-editorial-muted/10 text-editorial-muted text-[7px] font-mono uppercase tracking-widest leading-none rounded-sm">
                              {task.User.displayName || task.User.username}
                            </span>
                          )}
                        </div>
                        <h4 className={cn(
                          "text-base md:text-lg font-serif transition-colors duration-500",
                          (task.status?.toLowerCase() === 'completed' || completingId === task.id) ? "text-editorial-muted italic" : "",
                          isLate ? "text-red-600" : isDueToday ? "text-brand-blue" : ""
                        )}>
                          {task.title}
                        </h4>
                        {(task.status?.toLowerCase() === 'completed' || completingId === task.id) && (
                          <motion.div 
                            initial={{ width: 0 }}
                            animate={{ width: "100%" }}
                            transition={{ duration: 0.5, ease: "easeInOut" }}
                            className="absolute top-1/2 left-0 h-[1.5px] bg-editorial-muted pointer-events-none"
                          />
                        )}
                      </div>
                      {isLate && (
                        <div className="flex items-center space-x-1 px-1.5 py-0.5 bg-red-100 text-red-600 text-[8px] font-mono font-bold uppercase rounded shrink-0">
                          <AlertTriangle size={8} />
                          <span>Overdue</span>
                        </div>
                      )}
                      {isDueToday && !isLate && (
                        <div className="flex items-center space-x-1 px-1.5 py-0.5 bg-blue-100 text-brand-blue text-[8px] font-mono font-bold uppercase rounded shrink-0">
                          <AlarmClock size={8} />
                          <span>Today</span>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center gap-4 md:grid md:grid-cols-[150px_100px_80px] md:gap-8 md:items-center w-full md:w-auto md:ml-auto">
                    <div className="flex flex-col space-y-1">
                      <div className="flex items-center space-x-2 text-editorial-muted font-mono text-[10px] uppercase tracking-wider">
                        <Clock size={12} />
                        <span>{task.dueDate ? new Date(task.dueDate).toLocaleDateString() : 'No Date'}</span>
                      </div>
                      {task.status?.toLowerCase() === 'completed' && task.startedAt && task.completedAt && (
                        <div className="text-[8px] font-mono text-green-600 uppercase tracking-tighter">
                          Duration: {formatDuration(task.startedAt, task.completedAt)}
                        </div>
                      )}
                      {task.status?.toLowerCase() === 'todo' && (
                        <button 
                          onClick={(e) => handleStart(e, task)}
                          className="mt-1 px-2 py-0.5 bg-editorial-ink text-editorial-paper text-[8px] font-mono uppercase tracking-widest hover:opacity-90 transition-opacity self-start"
                        >
                          Start
                        </button>
                      )}
                      {task.status?.toLowerCase() === 'in-progress' && task.startedAt && (
                        <div className="flex items-center space-x-1 text-brand-blue text-[8px] font-mono uppercase animate-pulse">
                          <Clock size={10} />
                          <span>Active</span>
                        </div>
                      )}
                    </div>
                    <div className="text-editorial-muted font-mono text-[9px] md:text-[10px] uppercase tracking-wider">
                      {task.category}
                    </div>
                    <div className={cn(
                      "px-2 py-1 border text-[8px] font-mono uppercase text-center min-w-[60px]",
                      task.priority === 'high' ? "border-red-200 text-red-600 bg-red-50" :
                      task.priority === 'medium' ? "border-editorial-accent/20 text-editorial-accent bg-editorial-accent/5" :
                      "border-editorial-border text-editorial-muted"
                    )}>
                      {task.priority}
                    </div>
                  </div>
                </div>
                <button 
                  onClick={(e) => { e.stopPropagation(); setTaskToEdit(task); setIsEditModalOpen(true); }}
                  className="p-2 text-editorial-muted hover:text-editorial-ink md:opacity-0 group-hover:opacity-100 transition-all shrink-0"
                >
                  <MoreHorizontal size={18} />
                </button>
              </motion.div>
            );
          })}
          </AnimatePresence>
        )}
      </div>
    </div>
  );
};

export default TasksView;
