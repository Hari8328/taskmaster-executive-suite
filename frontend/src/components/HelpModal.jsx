import { motion, AnimatePresence } from "motion/react";
import { X, HelpCircle, Book, MessageSquare, Terminal, Zap } from "lucide-react";
const HelpModal = ({ isOpen, onClose }) => {
  const helpSections = [
    {
      icon: Zap,
      title: "Quick Start",
      content: 'Create tasks using the "New Task" button. Organize them by priority and category for maximum clarity.'
    },
    {
      icon: Book,
      title: "Navigation",
      content: "Use the Dashboard for your daily summary. The Projects view groups tasks by category, while the Tasks view provides a detailed repository."
    },
    {
      icon: Terminal,
      title: "System Commands",
      content: "Mark tasks as complete by clicking the circle icon. You can edit any task by clicking the menu icon on the right."
    },
    {
      icon: MessageSquare,
      title: "Support",
      content: "If you encounter any issues, please check our internal documentation or contact the administrator."
    }
  ];
  if (!isOpen) return null;
  return <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <motion.div
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    exit={{ opacity: 0 }}
    onClick={onClose}
    className="absolute inset-0 bg-editorial-ink/40 backdrop-blur-sm"
  />
        
        <motion.div
    initial={{ opacity: 0, scale: 0.95, y: 20 }}
    animate={{ opacity: 1, scale: 1, y: 0 }}
    exit={{ opacity: 0, scale: 0.95, y: 20 }}
    className="relative w-full max-w-2xl bg-editorial-paper p-5 sm:p-10 shadow-2xl border border-editorial-border max-h-[85vh] sm:max-h-[90vh] overflow-y-auto custom-scrollbar flex flex-col text-left"
  >
          <button
    onClick={onClose}
    className="absolute right-6 top-6 p-2 text-editorial-muted hover:text-editorial-ink transition-colors"
  >
            <X size={20} />
          </button>

          <div className="mb-4 sm:mb-8">
            <div className="flex items-center space-x-3 text-editorial-accent mb-4">
              <HelpCircle size={24} />
              <span className="font-mono text-xs uppercase tracking-[0.2em]">Documentation</span>
            </div>
            <h2 className="text-3xl sm:text-4xl font-serif">Support & Guidance</h2>
            <p className="font-serif italic text-editorial-muted mt-4 text-base sm:text-lg">
              Understanding the framework of your productivity system.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-10">
            {helpSections.map((section, idx) => <div key={section.title} className="space-y-4">
                <div className="flex items-center space-x-3">
                  <div className="p-2 border border-editorial-border bg-editorial-muted/5">
                    <section.icon size={18} className="text-editorial-ink" />
                  </div>
                  <h3 className="font-serif text-xl">{section.title}</h3>
                </div>
                <p className="text-sm text-editorial-muted leading-relaxed font-serif">
                  {section.content}
                </p>
              </div>)}
          </div>

          <div className="mt-4 sm:mt-8 pt-4 sm:pt-6 border-t border-editorial-border flex flex-col sm:flex-row justify-between items-center gap-4">
            <div className="font-mono text-[10px] uppercase tracking-widest text-editorial-muted">
              Version 1.2.4 • System Stable
            </div>
            <button
    onClick={onClose}
    className="bg-editorial-ink text-editorial-paper px-8 py-3 font-mono text-[10px] uppercase tracking-widest hover:opacity-90 transition-opacity w-full sm:w-auto"
  >
              Get Started
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>;
};
export default HelpModal;
