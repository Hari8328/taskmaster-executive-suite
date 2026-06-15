import React from 'react';
import { motion } from 'motion/react';
import { 
  LayoutDashboard, 
  CheckSquare, 
  LayoutGrid, 
  Lightbulb,
  Plus,
  MessageSquare,
  Sparkles,
  Map
} from 'lucide-react';
import { cn } from '../lib/utils';
import { View } from './Sidebar';

interface MobileNavProps {
  currentView: View;
  onViewChange: (view: View) => void;
  onNewTask: () => void;
}

const MobileNav: React.FC<MobileNavProps> = ({ currentView, onViewChange, onNewTask }) => {
  const menuItems: { icon: any; label: string; id: View }[] = [
    { icon: LayoutDashboard, label: 'Dash', id: 'dashboard' },
    { icon: CheckSquare, label: 'Tasks', id: 'tasks' },
    { icon: MessageSquare, label: 'Chat', id: 'chat' },
    { icon: Map, label: 'Plan', id: 'roadmap' },
    { icon: Lightbulb, label: 'Inspo', id: 'inspiration' },
  ];

  return (
    <div className="lg:hidden fixed bottom-0 left-0 right-0 z-50 bg-brand-sidebar border-t border-white/5 px-1 pb-6 pt-2">
      <div className="flex items-center justify-around">
        {menuItems.map((item) => (
          <button
            key={item.id}
            onClick={() => onViewChange(item.id)}
            className={cn(
              "flex flex-col items-center justify-center p-2 transition-all relative",
              currentView === item.id ? "text-brand-blue" : "text-white/40"
            )}
          >
            {currentView === item.id && (
              <motion.div 
                layoutId="mobile-pill"
                className="absolute -top-2 left-1/2 -translate-x-1/2 w-8 h-1 bg-brand-blue rounded-full" 
              />
            )}
            <item.icon size={20} />
            <span className="text-[10px] font-bold mt-1 uppercase tracking-tighter">{item.label}</span>
          </button>
        ))}
        
        <button 
          onClick={onNewTask}
          className="bg-brand-blue text-white p-3 rounded-2xl shadow-lg shadow-brand-blue/30 active:scale-90 transition-transform"
        >
          <Plus size={20} />
        </button>
      </div>
    </div>
  );
};

export default MobileNav;
