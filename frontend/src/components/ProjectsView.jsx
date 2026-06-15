import { useState, useEffect } from "react";
import { motion } from "motion/react";
import { Folder, Loader2, ChevronRight, CheckCircle2 } from "lucide-react";
import { cn } from "../lib/utils";
import { taskService } from "../services/taskService";
import TaskModal from "./TaskModal";
const ProjectsView = ({ refreshTrigger }) => {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedTask, setSelectedTask] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  useEffect(() => {
    fetchTasks();
  }, [refreshTrigger]);
  const fetchTasks = async () => {
    setLoading(true);
    try {
      const response = await taskService.getMyTasks(0, 100);
      setTasks(response.content);
    } catch (error) {
      console.error("Error fetching tasks:", error);
    } finally {
      setLoading(false);
    }
  };
  const groupedTasks = tasks.reduce((acc, task) => {
    const cat = task.category || "General";
    if (!acc[cat]) acc[cat] = [];
    acc[cat].push(task);
    return acc;
  }, {});
  const categories = Object.keys(groupedTasks);
  return <div className="p-4 md:p-10 space-y-8 md:space-y-12">
      <TaskModal
    task={selectedTask}
    isOpen={isModalOpen}
    onClose={() => setIsModalOpen(false)}
    onEdit={(t) => {
      setSelectedTask(t);
      setIsModalOpen(true);
    }}
  />

      <div className="border-b border-editorial-border pb-8">
        <h2 className="text-3xl md:text-4xl font-serif">Category Journals</h2>
        <p className="font-mono text-[10px] uppercase tracking-widest text-editorial-muted mt-3">Curated collections of your work</p>
      </div>

      {loading ? <div className="py-20 flex flex-col items-center justify-center space-y-4">
          <Loader2 className="animate-spin text-editorial-accent" size={32} />
          <p className="font-mono text-[10px] uppercase text-editorial-muted italic">Organizing Collections...</p>
        </div> : categories.length === 0 ? <div className="py-20 text-center font-serif italic text-editorial-muted">
          No categories defined yet.
        </div> : <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {categories.map((category, idx) => <motion.div
    key={category}
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay: idx * 0.1 }}
    className="space-y-6"
  >
              <div className="flex items-center justify-between group">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 border border-editorial-border flex items-center justify-center bg-editorial-muted/5">
                    <Folder size={18} className="text-editorial-ink" />
                  </div>
                  <div>
                    <h3 className="text-xl font-serif">{category}</h3>
                    <p className="font-mono text-[8px] uppercase text-editorial-muted">{groupedTasks[category].length} active entries</p>
                  </div>
                </div>
                <button className="text-[10px] font-mono uppercase tracking-widest opacity-0 group-hover:opacity-100 transition-all hover:underline">
                  Project Details
                </button>
              </div>

              <div className="bg-editorial-muted/5 border border-editorial-border divide-y divide-editorial-border">
                {groupedTasks[category].slice(0, 4).map((task) => <div
    key={task.id}
    onClick={() => {
      setSelectedTask(task);
      setIsModalOpen(true);
    }}
    className="p-4 flex items-center justify-between group hover:bg-editorial-paper transition-colors cursor-pointer"
  >
                    <div className="flex items-center space-x-4">
                      {task.status?.toLowerCase() === "completed" ? <CheckCircle2 size={14} className="text-green-600" /> : <div className="w-2 h-2 rounded-full bg-editorial-accent" />}
                      <span className={cn(
    "text-sm font-medium",
    task.status?.toLowerCase() === "completed" && "line-through text-editorial-muted"
  )}>
                        {task.title}
                      </span>
                    </div>
                    <ChevronRight size={14} className="text-editorial-muted opacity-0 group-hover:opacity-100 transition-all transform group-hover:translate-x-1" />
                  </div>)}
                {groupedTasks[category].length > 4 && <div className="p-3 text-center">
                    <button className="text-[10px] font-mono uppercase text-editorial-muted hover:text-editorial-ink">
                      + {groupedTasks[category].length - 4} More Tasks
                    </button>
                  </div>}
              </div>
            </motion.div>)}
        </div>}
    </div>;
};
export default ProjectsView;
