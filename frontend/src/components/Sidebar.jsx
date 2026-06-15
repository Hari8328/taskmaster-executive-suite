import { motion } from "motion/react";
import {
  LayoutDashboard,
  CheckSquare,
  LayoutGrid,
  Lightbulb,
  HelpCircle,
  Settings,
  Plus,
  Sun,
  Moon,
  Eye,
  Sparkles,
  Map,
  MessageSquare,
  History,
  Shield
} from "lucide-react";
import { cn } from "../lib/utils";
import { authService } from "../services/authService";
const Sidebar = ({
  className,
  currentView,
  onViewChange,
  onNewTask,
  onHelp,
  onProfileOpen,
  theme,
  onThemeChange
}) => {
  const user = authService.getCurrentUser();
  const isAdmin = user && user.roles?.includes("ROLE_ADMIN");
  const menuItems = [
    { icon: LayoutDashboard, label: "Dashboard", id: "dashboard" },
    { icon: LayoutGrid, label: "Projects", id: "projects" },
    { icon: CheckSquare, label: "Tasks", id: "tasks" },
    { icon: MessageSquare, label: "Chat", id: "chat" },
    { icon: Sparkles, label: "Suggestions", id: "suggestions" },
    { icon: Map, label: "Roadmap", id: "roadmap" },
    { icon: Lightbulb, label: "Inspiration", id: "inspiration" },
    { icon: History, label: "Focus Logs", id: "logs" }
  ];
  if (isAdmin) {
    menuItems.push({ icon: Shield, label: "Admin Console", id: "admin" });
  }
  return <aside className={cn(
    "hidden lg:flex w-72 bg-brand-sidebar h-screen flex-col text-white shrink-0 overflow-y-auto custom-scrollbar scroll-smooth",
    className
  )}>
      <div className="p-10 flex items-center space-x-3 mb-8">
        <div className="w-10 h-10 bg-brand-blue rounded-xl flex items-center justify-center shadow-lg shadow-brand-blue/20">
          <LayoutGrid className="text-white" size={24} />
        </div>
        <div>
          <h1 className="text-xl font-bold leading-none tracking-tight">TaskMaster</h1>
          <p className="text-[10px] font-bold text-white/40 uppercase tracking-widest mt-1">Executive Suite</p>
        </div>
      </div>

      <nav className="px-6 space-y-2 mb-8">
        {menuItems.map((item) => <button
    key={item.id}
    onClick={() => onViewChange(item.id)}
    className={cn(
      "w-full flex items-center space-x-4 px-6 py-4 rounded-2xl text-sm font-bold transition-all relative overflow-hidden group",
      currentView === item.id ? "bg-white/10 text-white shadow-inner" : "text-white/40 hover:text-white hover:bg-white/5"
    )}
  >
            {currentView === item.id && <motion.div
    layoutId="active-pill"
    className="absolute left-0 top-1/4 bottom-1/4 w-1 bg-brand-blue rounded-r-full"
  />}
            <item.icon size={20} className={cn(
    "transition-colors",
    currentView === item.id ? "text-brand-blue" : "group-hover:text-white"
  )} />
            <span>{item.label}</span>
          </button>)}
      </nav>

      <div className="px-8 mb-4">
        <p className="text-[10px] uppercase tracking-widest text-white/30 font-bold mb-4 px-4">Mode</p>
        <div className="grid grid-cols-3 gap-2">
          {[
    { id: "light", icon: Sun, label: "Bright" },
    { id: "dark", icon: Moon, label: "Dark" },
    { id: "eye", icon: Eye, label: "Eye" }
  ].map((t) => <button
    key={t.id}
    onClick={() => onThemeChange(t.id)}
    className={cn(
      "flex flex-col items-center justify-center p-2 py-3 rounded-xl transition-all border",
      theme === t.id ? "bg-white/10 border-white/20 text-white shadow-inner" : "border-transparent text-white/40 hover:text-white hover:bg-white/5 hover:border-white/5"
    )}
  >
              <t.icon size={16} />
              <span className="text-[8px] mt-1.5 uppercase font-bold tracking-tighter">{t.label}</span>
            </button>)}
        </div>
      </div>

      <div className="p-8 px-6 space-y-6">
        <button
    onClick={onNewTask}
    className="w-full bg-brand-blue text-white py-4 rounded-xl font-bold shadow-xl shadow-brand-blue/20 hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center space-x-2"
  >
          <Plus size={18} />
          <span>New Task</span>
        </button>

        <div className="space-y-4 pt-6 border-t border-white/5">
          <button
    onClick={onHelp}
    className="flex items-center space-x-4 px-6 text-sm font-bold text-white/40 hover:text-white transition-colors"
  >
            <HelpCircle size={20} />
            <span>Help</span>
          </button>
          <button
    onClick={onProfileOpen}
    className="flex items-center space-x-4 px-6 w-full text-sm font-bold text-white/40 hover:text-white transition-colors"
  >
            <Settings size={20} />
            <span>Settings</span>
          </button>
        </div>
      </div>
    </aside>;
};
export default Sidebar;
