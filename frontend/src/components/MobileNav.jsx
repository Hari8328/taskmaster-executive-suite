import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  LayoutDashboard,
  CheckSquare,
  LayoutGrid,
  Lightbulb,
  Plus,
  MessageSquare,
  Sparkles,
  Map,
  Shield,
  History,
  MoreHorizontal
} from "lucide-react";
import { cn } from "../lib/utils";
import { authService } from "../services/authService";
const MobileNav = ({ currentView, onViewChange, onNewTask }) => {
  const [isMoreOpen, setIsMoreOpen] = useState(false);
  const user = authService.getCurrentUser();
  const isAdmin = user && user.roles?.includes("ROLE_ADMIN");
  const mainItems = [
    { icon: LayoutDashboard, label: "Dash", id: "dashboard" },
    { icon: CheckSquare, label: "Tasks", id: "tasks" },
    { icon: MessageSquare, label: "Chat", id: "chat" },
    { icon: Map, label: "Plan", id: "roadmap" }
  ];
  const moreItems = [
    { icon: LayoutGrid, label: "Projects", id: "projects", desc: "Group & view your projects" },
    { icon: Sparkles, label: "Suggestions", id: "suggestions", desc: "AI productivity coaching" },
    { icon: History, label: "Focus Logs", id: "logs", desc: "Audit study & deep focus times" },
    { icon: Lightbulb, label: "Inspiration", id: "inspiration", desc: "Daily productivity resources" }
  ];
  if (isAdmin) {
    moreItems.unshift({ icon: Shield, label: "Admin Console", id: "admin", desc: "System registry & user audit" });
  }
  const moreViewIds = moreItems.map((item) => item.id);
  const isMoreActive = moreViewIds.includes(currentView);
  const handleMoreItemClick = (id) => {
    onViewChange(id);
    setIsMoreOpen(false);
  };
  return <>
      <div className="lg:hidden fixed bottom-0 left-0 right-0 z-50 bg-brand-sidebar border-t border-white/5 px-1 pb-6 pt-2">
        <div className="flex items-center justify-around">
          {mainItems.map((item) => <button
    key={item.id}
    onClick={() => {
      onViewChange(item.id);
      setIsMoreOpen(false);
    }}
    className={cn(
      "flex flex-col items-center justify-center p-2 transition-all relative",
      currentView === item.id ? "text-brand-blue" : "text-white/40"
    )}
  >
              {currentView === item.id && <motion.div
    layoutId="mobile-pill"
    className="absolute -top-2 left-1/2 -translate-x-1/2 w-8 h-1 bg-brand-blue rounded-full"
  />}
              <item.icon size={20} />
              <span className="text-[10px] font-bold mt-1 uppercase tracking-tighter">{item.label}</span>
            </button>)}

          {
    /* More Trigger Button */
  }
          <button
    onClick={() => setIsMoreOpen(!isMoreOpen)}
    className={cn(
      "flex flex-col items-center justify-center p-2 transition-all relative",
      isMoreActive ? "text-brand-blue" : "text-white/40"
    )}
  >
            {isMoreActive && <motion.div
    layoutId="mobile-pill"
    className="absolute -top-2 left-1/2 -translate-x-1/2 w-8 h-1 bg-brand-blue rounded-full"
  />}
            <MoreHorizontal size={20} />
            <span className="text-[10px] font-bold mt-1 uppercase tracking-tighter">More</span>
          </button>
          
          <button
    onClick={onNewTask}
    className="bg-brand-blue text-white p-3 rounded-2xl shadow-lg shadow-brand-blue/30 active:scale-90 transition-transform"
  >
            <Plus size={20} />
          </button>
        </div>
      </div>

      {
    /* Bottom Sheet Modal */
  }
      <AnimatePresence>
        {isMoreOpen && <>
            {
    /* Backdrop */
  }
            <motion.div
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    exit={{ opacity: 0 }}
    onClick={() => setIsMoreOpen(false)}
    className="lg:hidden fixed inset-0 z-45 bg-black/60 backdrop-blur-sm"
  />
            {
    /* Bottom Sheet */
  }
            <motion.div
    initial={{ y: "100%" }}
    animate={{ y: 0 }}
    exit={{ y: "100%" }}
    transition={{ type: "spring", damping: 25, stiffness: 220 }}
    className="lg:hidden fixed bottom-0 left-0 right-0 z-46 bg-brand-sidebar border-t border-white/10 rounded-t-[2rem] p-6 pb-32 shadow-2xl overflow-hidden text-left"
  >
              {
    /* Drag Handle */
  }
              <div className="w-12 h-1 bg-white/20 rounded-full mx-auto mb-6" />

              <div className="mb-4 px-1">
                <h3 className="text-sm font-bold text-white uppercase tracking-wider">Navigation</h3>
                <p className="text-[10px] text-white/40 uppercase tracking-widest mt-1">Select workspace desk options</p>
              </div>

              {
    /* Grid Options */
  }
              <div className="grid grid-cols-1 gap-3 max-h-[50vh] overflow-y-auto custom-scrollbar pr-1">
                {moreItems.map((item) => {
    const isActive = currentView === item.id;
    return <button
      key={item.id}
      onClick={() => handleMoreItemClick(item.id)}
      className={cn(
        "w-full flex items-center space-x-4 p-4 rounded-2xl border transition-all text-left",
        isActive ? "bg-white/10 border-white/10 text-white shadow-inner" : "bg-white/[0.02] border-white/5 text-white/70 hover:bg-white/5 hover:text-white"
      )}
    >
                      <div className={cn(
      "p-2.5 rounded-xl transition-colors",
      isActive ? "bg-brand-blue/15 text-brand-blue" : "bg-white/5 text-white/50"
    )}>
                        <item.icon size={18} />
                      </div>
                      <div>
                        <div className="text-sm font-bold leading-none">{item.label}</div>
                        <div className="text-[10px] text-white/40 mt-1">{item.desc}</div>
                      </div>
                    </button>;
  })}
              </div>
            </motion.div>
          </>}
      </AnimatePresence>
    </>;
};
export default MobileNav;
