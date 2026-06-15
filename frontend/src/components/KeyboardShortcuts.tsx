import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Keyboard, X, ArrowUpRight, HelpCircle } from 'lucide-react';

interface KeyboardShortcutsProps {
  currentView: string;
  onViewChange: (view: any) => void;
  onNewTask: () => void;
  isDeepFocusActive: boolean;
}

export default function KeyboardShortcuts({ 
  currentView, 
  onViewChange, 
  onNewTask,
  isDeepFocusActive
}: KeyboardShortcutsProps) {
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ignore shortcuts if the user is typing in a form field or contentEditable element
      const activeEl = document.activeElement;
      if (activeEl) {
        const tagName = activeEl.tagName.toUpperCase();
        if (
          tagName === 'INPUT' || 
          tagName === 'TEXTAREA' || 
          tagName === 'SELECT' ||
          (activeEl as HTMLElement).isContentEditable
        ) {
          // If user presses Escape in an input field, we can let them unfocus it or close modal
          if (e.key === 'Escape') {
            (activeEl as HTMLElement).blur();
          }
          return;
        }
      }

      // If active in Deep Focus, restrict shortcuts to avoid exit disruption except escape
      if (isDeepFocusActive) {
        if (e.key === 'Escape') {
          // Allow dismissing specific overlay or exit FOCUS
          return;
        }
        return;
      }

      // Key matching
      switch (e.key.toLowerCase()) {
        case '?':
        case 'k':
          e.preventDefault();
          setIsOpen(prev => !prev);
          break;
        case 'n':
        case 'c':
          e.preventDefault();
          onNewTask();
          break;
        case 'd':
          e.preventDefault();
          onViewChange('dashboard');
          break;
        case 'p':
          e.preventDefault();
          onViewChange('projects');
          break;
        case 't':
          e.preventDefault();
          onViewChange('tasks');
          break;
        case 'i':
          e.preventDefault();
          onViewChange('inspiration');
          break;
        case 'g':
          e.preventDefault();
          onViewChange('suggestions');
          break;
        case 'r':
          e.preventDefault();
          onViewChange('roadmap');
          break;
        case 'l':
          e.preventDefault();
          onViewChange('logs');
          break;
        case 'a':
          e.preventDefault();
          onViewChange('chat');
          break;
        case 'w':
          e.preventDefault();
          // Dispatch custom event to trigger weekly performance digest
          window.dispatchEvent(new CustomEvent('open-weekly-digest'));
          break;
        case '/':
          e.preventDefault();
          window.dispatchEvent(new CustomEvent('focus-search'));
          break;
        case 'escape':
          if (isOpen) {
            setIsOpen(false);
          }
          break;
        default:
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onViewChange, onNewTask, isDeepFocusActive]);

  // Don't render floating key shortcut trigger if Deep Focus chamber is fully running
  if (isDeepFocusActive) return null;

  return (
    <>
      {/* Floating Action Button */}
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 z-[45] bg-editorial-ink text-editorial-paper hover:bg-slate-800 transition-colors shadow-xl w-12 h-12 rounded-full flex items-center justify-center border border-white/10 group cursor-pointer"
        id="keyboard-shortcuts-fab"
        title="Keyboard Shortcuts (K)"
      >
        <Keyboard size={20} className="group-hover:rotate-6 transition-transform" />
      </motion.button>

      {/* Shortcuts Cheat Sheet Modal */}
      <AnimatePresence>
        {isOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            
            {/* Backdrop glass */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsOpen(false)}
              className="absolute inset-0 bg-editorial-ink/40 backdrop-blur-sm"
            />

            {/* Modal Box */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              className="relative w-full max-w-lg bg-editorial-paper border border-editorial-border p-8 shadow-2xl rounded-sm max-h-[90vh] overflow-y-auto font-sans"
              id="keyboard-shortcuts-modal"
            >
              {/* Close Button */}
              <button 
                onClick={() => setIsOpen(false)}
                className="absolute right-6 top-6 p-2 text-editorial-muted hover:text-editorial-ink transition-colors border border-transparent hover:border-editorial-border rounded-full"
                id="close-shortcuts-modal-btn"
              >
                <X size={16} />
              </button>

              {/* Title Section */}
              <div className="mb-8">
                <div className="flex items-center space-x-2 text-brand-blue mb-2">
                  <Keyboard size={18} />
                  <span className="font-mono text-[9px] uppercase tracking-[0.2em] font-bold">Power User Console</span>
                </div>
                <h3 className="text-3xl font-serif italic text-editorial-ink">Terminal Shortcuts</h3>
                <p className="text-xs text-editorial-muted font-serif italic mt-1 leading-relaxed">
                  Fly through your work backlog and conquer focus domains with dedicated keyboard bindings.
                </p>
              </div>

              {/* Shortcuts List Groups */}
              <div className="space-y-6">
                
                {/* 1. Global Navigation Section */}
                <div>
                  <h4 className="font-mono text-[10px] uppercase text-slate-400 font-bold tracking-widest mb-3 border-b border-editorial-border pb-1">
                    Global Navigation
                  </h4>
                  <div className="space-y-2.5">
                    
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-serif italic text-editorial-ink">Go to Dashboard</span>
                      <kbd className="px-2 py-1 bg-slate-100 border border-slate-300 rounded text-[10px] font-mono font-bold shadow-sm">D</kbd>
                    </div>

                    <div className="flex items-center justify-between text-xs">
                      <span className="font-serif italic text-editorial-ink">Go to Projects Board</span>
                      <kbd className="px-2 py-1 bg-slate-100 border border-slate-300 rounded text-[10px] font-mono font-bold shadow-sm">P</kbd>
                    </div>

                    <div className="flex items-center justify-between text-xs">
                      <span className="font-serif italic text-editorial-ink">Go to Tasks Repository</span>
                      <kbd className="px-2 py-1 bg-slate-100 border border-slate-300 rounded text-[10px] font-mono font-bold shadow-sm">T</kbd>
                    </div>

                    <div className="flex items-center justify-between text-xs">
                      <span className="font-serif italic text-editorial-ink">Go to Inspiration Wall</span>
                      <kbd className="px-2 py-1 bg-slate-100 border border-slate-300 rounded text-[10px] font-mono font-bold shadow-sm">I</kbd>
                    </div>

                    <div className="flex items-center justify-between text-xs">
                      <span className="font-serif italic text-editorial-ink">Go to AI Suggestions</span>
                      <kbd className="px-2 py-1 bg-slate-100 border border-slate-300 rounded text-[10px] font-mono font-bold shadow-sm">G</kbd>
                    </div>

                    <div className="flex items-center justify-between text-xs">
                      <span className="font-serif italic text-editorial-ink">Go to Project Roadmap</span>
                      <kbd className="px-2 py-1 bg-slate-100 border border-slate-300 rounded text-[10px] font-mono font-bold shadow-sm">R</kbd>
                    </div>

                    <div className="flex items-center justify-between text-xs">
                      <span className="font-serif italic text-editorial-ink">Go to Focus Logs & Analytics</span>
                      <kbd className="px-2 py-1 bg-slate-100 border border-slate-300 rounded text-[10px] font-mono font-bold shadow-sm">L</kbd>
                    </div>

                    <div className="flex items-center justify-between text-xs">
                      <span className="font-serif italic text-editorial-ink">Open AI Mind Coach Chat</span>
                      <kbd className="px-2 py-1 bg-slate-100 border border-slate-300 rounded text-[10px] font-mono font-bold shadow-sm">A</kbd>
                    </div>

                  </div>
                </div>

                {/* 2. Task Actions Section */}
                <div>
                  <h4 className="font-mono text-[10px] uppercase text-slate-400 font-bold tracking-widest mb-3 border-b border-editorial-border pb-1">
                    System Actions
                  </h4>
                  <div className="space-y-2.5">
                    
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-serif italic text-editorial-ink">Create New Task Form</span>
                      <div className="flex items-center space-x-1">
                        <kbd className="px-2 py-1 bg-slate-100 border border-slate-300 rounded text-[10px] font-mono font-bold shadow-sm">C</kbd>
                        <span className="text-editorial-muted text-[10px] font-mono">or</span>
                        <kbd className="px-2 py-1 bg-slate-100 border border-slate-300 rounded text-[10px] font-mono font-bold shadow-sm">N</kbd>
                      </div>
                    </div>

                    <div className="flex items-center justify-between text-xs">
                      <span className="font-serif italic text-editorial-ink">Open Weekly digest & graphs</span>
                      <kbd className="px-2 py-1 bg-slate-100 border border-slate-300 rounded text-[10px] font-mono font-bold shadow-sm">W</kbd>
                    </div>

                    <div className="flex items-center justify-between text-xs">
                      <span className="font-serif italic text-editorial-ink">Focus search query input</span>
                      <kbd className="px-2 py-1 bg-slate-100 border border-slate-300 rounded text-[10px] font-mono font-bold shadow-sm">/</kbd>
                    </div>

                    <div className="flex items-center justify-between text-xs">
                      <span className="font-serif italic text-editorial-ink">Dismiss / Close Overlay Modal</span>
                      <kbd className="px-2 py-1 bg-slate-100 border border-slate-300 rounded text-[10px] font-mono font-bold shadow-sm">Esc</kbd>
                    </div>

                    <div className="flex items-center justify-between text-xs">
                      <span className="font-serif italic text-editorial-ink">Open Shortcuts (anywhere)</span>
                      <div className="flex items-center space-x-1">
                        <kbd className="px-2 py-1 bg-slate-100 border border-slate-300 rounded text-[10px] font-mono font-bold shadow-sm">K</kbd>
                        <span className="text-editorial-muted text-[10px] font-mono">or</span>
                        <kbd className="px-2 py-1 bg-slate-100 border border-slate-300 rounded text-[10px] font-mono font-bold shadow-sm">?</kbd>
                      </div>
                    </div>

                  </div>
                </div>

              </div>

              {/* Informative Footer */}
              <div className="mt-8 pt-6 border-t border-editorial-border flex justify-between items-center text-[9px] font-mono uppercase tracking-widest text-slate-400">
                <span className="flex items-center">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 mr-1.5 animate-pulse" />
                  Shortcut system active
                </span>
                <span>Taskmaster v1.2.4</span>
              </div>

            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}
