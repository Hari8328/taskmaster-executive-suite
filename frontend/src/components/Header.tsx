import React, { useState, useEffect, useRef } from 'react';
import { 
  Search, Bell, Settings, X, CheckCircle, Clock, User as UserIcon, 
  Volume2, VolumeX, Keyboard, Sparkles, Navigation, CheckSquare, 
  Compass, ArrowRight, HelpCircle 
} from 'lucide-react';
import { notificationService, TaskNotification } from '../services/notificationService';
import { authService } from '../services/authService';
import { taskService } from '../services/taskService';
import { User, Task } from '../types';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '../lib/utils';
import { playReminderSound } from '../lib/audioAndAchievements';
import LiveClock from './LiveClock';

interface HeaderProps {
  currentView?: string;
  onViewChange?: (view: any) => void;
  onNewTask?: () => void;
  onProfileOpen?: () => void;
  onHelp?: () => void;
}

const Header: React.FC<HeaderProps> = ({ currentView, onViewChange, onNewTask, onProfileOpen, onHelp }) => {
  const [notifications, setNotifications] = useState<TaskNotification[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const searchContainerRef = useRef<HTMLDivElement>(null);
  const lastNotificationId = useRef<number | null>(null);
  const [permissionStatus, setPermissionStatus] = useState<NotificationPermission>("default");
  const [soundEnabled, setSoundEnabled] = useState(() => {
    const saved = localStorage.getItem('notification_sound_enabled');
    return saved === null ? true : saved === 'true';
  });
  const isFirstLoad = useRef(true);
  
  // Search and shortcut connector states
  const searchInputRef = useRef<HTMLInputElement>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const [allTasksForSearch, setAllTasksForSearch] = useState<Task[]>([]);
  const [highlightedIndex, setHighlightedIndex] = useState(0);

  // Reset highlight index when search query shifts
  useEffect(() => {
    setHighlightedIndex(0);
  }, [searchQuery]);

  useEffect(() => {
    const handleProfileUpdateEvent = () => {
      setUser(authService.getCurrentUser());
    };
    window.addEventListener('profile-updated', handleProfileUpdateEvent);
    return () => {
      window.removeEventListener('profile-updated', handleProfileUpdateEvent);
    };
  }, []);

  useEffect(() => {
    const handleFocusSearch = () => {
      if (searchInputRef.current) {
        searchInputRef.current.focus();
        searchInputRef.current.select();
      }
    };
    window.addEventListener('focus-search', handleFocusSearch);
    return () => {
      window.removeEventListener('focus-search', handleFocusSearch);
    };
  }, []);

  // Fetch all tasks so the command center search bar is lightning fast
  const fetchTasksForSearch = async () => {
    try {
      const currentUser = authService.getCurrentUser();
      let response;
      if (currentUser && currentUser.roles?.includes('ROLE_ADMIN')) {
        response = await taskService.getAllTasksAdmin(0, 100);
      } else {
        response = await taskService.getMyTasks(0, 100);
      }
      setAllTasksForSearch(response?.content || []);
    } catch (e) {
      console.error('Failed to load tasks for global search', e);
    }
  };

  useEffect(() => {
    if (isSearchFocused) {
      fetchTasksForSearch();
    }
  }, [isSearchFocused]);

  useEffect(() => {
    localStorage.setItem('notification_sound_enabled', String(soundEnabled));
  }, [soundEnabled]);

  useEffect(() => {
    const handleSoundToggle = (e: Event) => {
      const customEvent = e as CustomEvent;
      setSoundEnabled(customEvent.detail);
    };
    window.addEventListener('notification-sound-updated', handleSoundToggle);
    return () => {
      window.removeEventListener('notification-sound-updated', handleSoundToggle);
    };
  }, []);

  useEffect(() => {
    if ("Notification" in window) {
      setPermissionStatus(Notification.permission);
    }
    
    setUser(authService.getCurrentUser());
    loadNotifications();
    const interval = setInterval(loadNotifications, 30000); // Poll every 30s
    return () => clearInterval(interval);
  }, []);

  const handleProfileUpdate = () => {
    setUser(authService.getCurrentUser());
  };

  const requestPermission = async () => {
    if ("Notification" in window) {
      const permission = await Notification.requestPermission();
      setPermissionStatus(permission);
    }
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
      if (searchContainerRef.current && !searchContainerRef.current.contains(event.target as Node)) {
        setIsSearchFocused(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const loadNotifications = async () => {
    try {
      const responseData = await notificationService.getNotifications();
      const data = Array.isArray(responseData) ? responseData : [];
      
      // Check for new unread notifications to trigger browser push
      if (data.length > 0) {
        const newest = data[0];
        
        // On first load, specifically track the newest ID without notifying
        if (isFirstLoad.current) {
          lastNotificationId.current = newest.id;
          isFirstLoad.current = false;
        } else if (!newest.read && newest.id !== lastNotificationId.current) {
          // Play notification sound if enabled
          if (soundEnabled) {
            try {
              // Subtle notification sound
              playReminderSound();
            } catch (e) {
              console.error('Error playing sound:', e);
            }
          }

          if ("Notification" in window && Notification.permission === "granted") {
            new Notification("Task Master", {
              body: newest.message,
              icon: "https://picsum.photos/seed/task/100/100",
              silent: false,
              requireInteraction: false
            });
          }
          lastNotificationId.current = newest.id;
        }
      }
      
      setNotifications(data);
    } catch (err) {
      console.error('Failed to load notifications');
    }
  };

  const handleMarkRead = async (id: number) => {
    try {
      await notificationService.markAsRead(id);
      const currentList = Array.isArray(notifications) ? notifications : [];
      setNotifications(currentList.map(n => n.id === id ? { ...n, read: true } : n));
    } catch (err) {
      console.error('Failed to mark read');
    }
  };

  const handleMarkAllRead = async () => {
    try {
      await notificationService.markAllAsRead();
      const currentList = Array.isArray(notifications) ? notifications : [];
      setNotifications(currentList.map(n => ({ ...n, read: true })));
    } catch (err) {
      console.error('Failed to mark all read');
    }
  };

  const getMatchedItems = () => {
    const list: Array<{
      id: string;
      label: string;
      description?: string;
      key?: string;
      icon?: any;
      action: () => void;
      type: 'shortcut' | 'profile' | 'task';
      taskStatus?: string;
      profileDetail?: any;
    }> = [];

    // 1. Shortcuts
    const allShortcuts = [
      { key: 'D', name: 'Go to Dashboard', description: 'Navigate to the primary overview board', icon: Compass, action: () => { onViewChange?.('dashboard'); setIsSearchFocused(false); setSearchQuery(''); } },
      { key: 'P', name: 'Go to Projects Board', description: 'View active projects and boards', icon: Navigation, action: () => { onViewChange?.('projects'); setIsSearchFocused(false); setSearchQuery(''); } },
      { key: 'T', name: 'Go to Tasks Repository', description: 'Complete backlog checklist catalog', icon: CheckSquare, action: () => { onViewChange?.('tasks'); setIsSearchFocused(false); setSearchQuery(''); } },
      { key: 'I', name: 'Go to Inspiration Wall', description: 'Daily quotes, advice, and growth records', icon: Sparkles, action: () => { onViewChange?.('inspiration'); setIsSearchFocused(false); setSearchQuery(''); } },
      { key: 'G', name: 'Go to AI Suggestions', description: 'Smart assistant prompt categories', icon: Sparkles, action: () => { onViewChange?.('suggestions'); setIsSearchFocused(false); setSearchQuery(''); } },
      { key: 'R', name: 'Go to Project Roadmap', description: 'Phases, streams, and timeline progress', icon: Clock, action: () => { onViewChange?.('roadmap'); setIsSearchFocused(false); setSearchQuery(''); } },
      { key: 'A', name: 'Open AI Mind Coach', description: 'Live mentoring and task synthesis chat', icon: UserIcon, action: () => { onViewChange?.('chat'); setIsSearchFocused(false); setSearchQuery(''); } },
      { key: 'W', name: 'Open Weekly Digest', description: 'Performance graphs and metrics', icon: Keyboard, action: () => { window.dispatchEvent(new CustomEvent('open-weekly-digest')); setIsSearchFocused(false); setSearchQuery(''); } },
      { key: 'C', name: 'Create New Task', description: 'Open task creator modal form', icon: ArrowRight, action: () => { onNewTask?.(); setIsSearchFocused(false); setSearchQuery(''); } },
      { key: 'K', name: 'Terminal Cheat Sheet', description: 'Toggle floating hotkey help box', icon: Keyboard, action: () => { window.dispatchEvent(new KeyboardEvent('keydown', { key: 'k' })); setIsSearchFocused(false); setSearchQuery(''); } }
    ];

    const matchedShortcuts = allShortcuts.filter(s => 
      s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.key.toLowerCase().includes(searchQuery.toLowerCase())
    );
    
    matchedShortcuts.forEach(s => {
      list.push({
        id: `shortcut-${s.key}`,
        label: s.name,
        description: s.description,
        key: s.key,
        icon: s.icon,
        action: s.action,
        type: 'shortcut'
      });
    });

    // 2. Profile Summary
    const profileDetails = [
      { label: 'Display Name', value: user?.displayName || user?.username || 'Not set', desc: 'Used for team metrics and leaderboards' },
      { label: 'Email Address', value: user?.email || 'No email attached', desc: 'Your secure correspondence address' },
      { label: 'Biography', value: user?.bio || 'No active bio defined', desc: 'Your custom status details' },
      { label: 'Permissions & Roles', value: user?.roles?.join(', ') || 'ROLE_USER', desc: 'Assigned account credentials' }
    ];

    const matchedProfile = searchQuery.trim() === '' 
      ? [] 
      : profileDetails.filter(p =>
          p.label.toLowerCase().includes(searchQuery.toLowerCase()) ||
          p.value.toLowerCase().includes(searchQuery.toLowerCase()) ||
          'profile'.includes(searchQuery.toLowerCase()) ||
          'details'.includes(searchQuery.toLowerCase()) ||
          'user'.includes(searchQuery.toLowerCase())
        );

    if (matchedProfile.length > 0 || (searchQuery.trim() !== '' && 'profile'.includes(searchQuery.toLowerCase()))) {
      list.push({
        id: 'profile-summary',
        label: 'Update Profile details',
        description: user?.bio || 'We rebuild our days stone by stone.',
        action: () => { onProfileOpen?.(); setIsSearchFocused(false); },
        type: 'profile',
        profileDetail: matchedProfile.length > 0 ? matchedProfile : profileDetails
      });
    }

    // 3. Tasks
    const matchedTasks = searchQuery.trim() === '' ? [] : allTasksForSearch.filter(t => 
      t.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.category?.toLowerCase().includes(searchQuery.toLowerCase())
    ).slice(0, 4);

    matchedTasks.forEach(t => {
      list.push({
        id: `task-${t.id}`,
        label: t.title,
        description: `Category: ${t.category || 'General'}`,
        action: () => { onViewChange?.('tasks'); setIsSearchFocused(false); setSearchQuery(''); },
        type: 'task',
        taskStatus: t.status
      });
    });

    return list;
  };

  const safeNotifications = Array.isArray(notifications) ? notifications : [];
  const unreadCount = safeNotifications.filter(n => !n.read).length;

  return (
    <header className="h-16 md:h-24 px-3 sm:px-6 md:px-10 flex items-center justify-between sticky top-0 z-40 bg-editorial-paper/80 backdrop-blur-md border-b border-editorial-border transition-colors duration-300">
      <div className="flex items-center space-x-2 sm:space-x-4">
        <h2 className="text-xl sm:text-2xl font-serif">Horizon</h2>
        <div className="hidden lg:block h-6 w-px bg-editorial-border" />
        <LiveClock minimal className="hidden lg:flex" />
      </div>

      <div className="flex items-center space-x-1.5 sm:space-x-3 md:space-x-8">
        <div ref={searchContainerRef} className="relative group block">
          <Search className="absolute left-2.5 sm:left-3.5 top-1/2 -translate-y-1/2 text-editorial-muted group-focus-within:text-editorial-accent transition-colors" size={16} />
          <input 
            ref={searchInputRef}
            type="text" 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onFocus={() => setIsSearchFocused(true)}
            onKeyDown={(e) => {
              if (e.key === 'Escape') {
                setIsSearchFocused(false);
                searchInputRef.current?.blur();
              } else if (e.key === 'ArrowDown') {
                e.preventDefault();
                const items = getMatchedItems();
                if (items.length > 0) {
                  setHighlightedIndex(prev => (prev + 1) % items.length);
                }
              } else if (e.key === 'ArrowUp') {
                e.preventDefault();
                const items = getMatchedItems();
                if (items.length > 0) {
                  setHighlightedIndex(prev => (prev - 1 + items.length) % items.length);
                }
              } else if (e.key === 'Enter') {
                e.preventDefault();
                const items = getMatchedItems();
                if (items.length > 0 && items[highlightedIndex]) {
                  items[highlightedIndex].action();
                }
              }
            }}
            placeholder="Search..." 
            className="w-24 xs:w-36 sm:w-56 md:w-64 lg:w-80 pl-8 pr-6 sm:pl-10 sm:pr-8 py-1.5 md:py-2.5 bg-editorial-muted/5 border border-editorial-border/30 rounded-xl focus:ring-2 focus:ring-editorial-accent/20 focus:border-editorial-accent/50 transition-all text-xs outline-none"
          />
          {searchQuery && (
            <button 
              onClick={() => { setSearchQuery(''); searchInputRef.current?.focus(); }}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 p-1 text-editorial-muted hover:text-editorial-ink rounded-full"
            >
              <X size={12} />
            </button>
          )}

          {/* Connected Search Dropdown Console */}
          <AnimatePresence>
            {isSearchFocused && (() => {
              const matchedItems = getMatchedItems();
              return (
                <motion.div
                  initial={{ opacity: 0, y: 10, scale: 0.98 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 10, scale: 0.98 }}
                  className="absolute right-0 top-full mt-2 bg-zinc-950 text-zinc-100 rounded-2xl shadow-[0_20px_50px_rgba(0,0,0,0.85)] border border-zinc-800/80 overflow-hidden z-[60] p-4 max-h-[80vh] overflow-y-auto w-[280px] sm:w-[320px] md:w-[400px] lg:w-[480px] custom-scrollbar text-left"
                >
                  {/* 1. Header of Search Console */}
                  <div className="flex items-center justify-between pb-3 mb-3 border-b border-zinc-800/60 font-mono text-[9px] uppercase tracking-widest text-zinc-500">
                    <span className="flex items-center space-x-1">
                      <Keyboard size={12} className="text-sky-400" />
                      <span className="text-zinc-300">Horizon Command Center</span>
                    </span>
                    <span className="text-zinc-500">{searchQuery ? "Matches" : "All Shortcuts"}</span>
                  </div>

                  {/* 2. Shortcuts / Actions Navigation Section */}
                  <div className="space-y-1 mb-4">
                    <div className="font-mono text-[9px] uppercase tracking-widest text-zinc-500 font-bold pl-2 pb-1.5 flex items-center justify-between">
                      <span>Navigate & Complete Tasks (Shortcuts)</span>
                      {searchQuery === '' && <span className="text-[8px] text-zinc-600 lowercase italic">Use Arrow keys & Enter</span>}
                    </div>
                    {(() => {
                      const matchedShortcuts = matchedItems.filter(x => x.type === 'shortcut');

                      if (matchedShortcuts.length === 0) {
                        return <span className="text-[10px] italic text-zinc-650 pl-2 block py-1">No matching shortcut actions</span>;
                      }

                      return matchedShortcuts.map(s => {
                        const IconComponent = s.icon || Compass;
                        const absIdx = matchedItems.findIndex(x => x.id === s.id);
                        const isHighlighted = absIdx === highlightedIndex;
                        return (
                          <button
                            key={s.id}
                            onMouseDown={(e) => { e.preventDefault(); s.action(); }}
                            className={cn(
                              "w-full text-left px-2.5 py-2 rounded-xl transition-all flex items-center justify-between group/item border",
                              isHighlighted 
                                ? "bg-zinc-900 border-zinc-700/80 shadow-lg shadow-black/40 translate-x-1" 
                                : "bg-transparent border-transparent hover:bg-zinc-900/40 hover:border-zinc-900/60"
                            )}
                          >
                            <div className="flex items-center space-x-3">
                              <div className={cn(
                                "p-1.5 rounded-lg transition-all",
                                isHighlighted 
                                  ? "bg-sky-500/15 text-sky-400" 
                                  : "bg-zinc-900 text-zinc-400 group-hover/item:text-sky-400 group-hover/item:bg-sky-500/10"
                              )}>
                                <IconComponent size={14} />
                              </div>
                              <div>
                                <div className={cn(
                                  "text-xs font-serif italic text-zinc-200 font-medium leading-none",
                                  isHighlighted ? "text-sky-400 font-semibold" : "group-hover/item:text-sky-400"
                                )}>{s.label}</div>
                                <div className="text-[9px] text-zinc-450 mt-0.5">{s.description}</div>
                              </div>
                            </div>
                            <kbd className={cn(
                              "px-1.5 py-0.5 border rounded text-[9px] font-mono font-bold shadow-sm transition-all",
                              isHighlighted 
                                ? "bg-sky-500 border-sky-400 text-zinc-950 font-bold" 
                                : "bg-zinc-900 border-zinc-800 text-zinc-550 group-hover/item:bg-zinc-850 group-hover/item:text-zinc-300"
                            )}>
                              {s.key}
                            </kbd>
                          </button>
                        );
                      });
                    })()}
                  </div>

                  {/* 3. User & Profile Details Section */}
                  {(() => {
                    const profileItem = matchedItems.find(x => x.type === 'profile');
                    if (!profileItem) return null;

                    const absIdx = matchedItems.findIndex(x => x.id === profileItem.id);
                    const isHighlighted = absIdx === highlightedIndex;

                    return (
                      <div className="mt-3 pt-3 border-t border-zinc-800/60 mb-3">
                        <div className="font-mono text-[9px] uppercase tracking-widest text-zinc-500 font-bold pl-2 mb-2 flex items-center justify-between">
                          <span>User Profile details ({searchQuery ? 'Matched' : 'Summary'})</span>
                          {isHighlighted && <span className="text-[8px] font-mono text-sky-400 uppercase tracking-wider">Highlighted (Enter to edit)</span>}
                        </div>
                        <div className="space-y-1.5">
                          {profileItem.profileDetail && profileItem.profileDetail.map((detail: any, index: number) => (
                            <div key={index} className="px-2.5 py-2 bg-zinc-900/40 border border-zinc-800/40 rounded-xl flex flex-col">
                              <span className="text-[8px] font-mono uppercase tracking-wider text-zinc-500">{detail.label}</span>
                              <span className="text-xs font-serif italic text-zinc-200 font-medium mt-0.5">{detail.value}</span>
                              <span className="text-[8px] text-zinc-500 mt-0.5">{detail.desc}</span>
                            </div>
                          ))}
                          <button 
                            onMouseDown={(e) => { e.preventDefault(); profileItem.action(); }}
                            className={cn(
                              "w-full py-1.5 text-[9px] font-mono uppercase tracking-wider rounded-xl transition-all mt-1 border text-center block",
                              isHighlighted 
                                ? "bg-sky-500 border-sky-400 text-zinc-950 shadow-md shadow-sky-500/15 translate-x-1 font-bold" 
                                : "border-zinc-800 text-zinc-300 hover:bg-zinc-900 hover:text-white"
                            )}
                          >
                            Update Profile details
                          </button>
                        </div>
                      </div>
                    );
                  })()}

                  {/* 4. Filtered Tasks Section */}
                  {(() => {
                    const matchedTasks = matchedItems.filter(x => x.type === 'task');

                    if (matchedTasks.length === 0) {
                      if (searchQuery.trim() !== '') {
                        return (
                          <div className="mt-3 pt-3 border-t border-zinc-800/60">
                            <div className="font-mono text-[9px] uppercase tracking-widest text-zinc-500 font-bold pl-2 mb-1">Matching Tasks</div>
                            <span className="text-[10px] italic text-zinc-500 pl-2">No matching tasks found</span>
                          </div>
                        );
                      }
                      return null;
                    }

                    return (
                      <div className="mt-3 pt-3 border-t border-zinc-800/60">
                        <div className="font-mono text-[9px] uppercase tracking-widest text-zinc-500 font-bold pl-2 mb-2 flex items-center justify-between">
                          <span>Matching Tasks list ({matchedTasks.length})</span>
                          <span className="text-[8px] text-zinc-500">Press Enter for Tasks view</span>
                        </div>
                        <div className="space-y-1.5">
                          {matchedTasks.map(t => {
                            const absIdx = matchedItems.findIndex(x => x.id === t.id);
                            const isHighlighted = absIdx === highlightedIndex;
                            return (
                              <button
                                key={t.id}
                                onMouseDown={(e) => { e.preventDefault(); t.action(); }}
                                className={cn(
                                  "w-full text-left px-2.5 py-1.5 rounded-xl transition-all flex items-center justify-between border",
                                  isHighlighted 
                                    ? "bg-zinc-900 border-zinc-700/80 shadow-lg translate-x-1"
                                    : "bg-zinc-900/30 hover:bg-zinc-900/60 border-zinc-900 hover:border-zinc-800"
                                )}
                              >
                                <div className="truncate pr-4 flex-1">
                                  <span className={cn(
                                    "text-xs font-medium truncate block",
                                    isHighlighted ? "text-sky-400 font-semibold" : "text-zinc-200"
                                  )}>{t.label}</span>
                                  <span className="text-[8px] font-mono text-zinc-500 uppercase tracking-wider block mt-0.5">{t.description}</span>
                                </div>
                                <span className={cn(
                                  "px-1.5 py-0.5 rounded-full text-[8px] font-mono font-bold shrink-0 uppercase tracking-wider",
                                  t.taskStatus?.toLowerCase() === 'completed' ? "bg-emerald-500/10 text-emerald-400" :
                                  t.taskStatus?.toLowerCase() === 'in_progress' ? "bg-cyan-500/10 text-cyan-400" :
                                  "bg-amber-500/10 text-amber-400"
                                )}>
                                  {t.taskStatus?.replace('_', ' ') || 'TODO'}
                                </span>
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    );
                  })()}

                  {/* Helper info banner */}
                  <div className="mt-4 pt-2.5 border-t border-zinc-800 flex justify-between items-center text-[8px] font-mono uppercase tracking-widest text-zinc-500">
                    <span>Press Escape / Tab / Outside to close</span>
                    <span>Type and navigate with arrows + Enter</span>
                  </div>
                </motion.div>
              );
            })()}
          </AnimatePresence>
        </div>

        <div className="flex items-center space-x-0.5 sm:space-x-1.5 md:space-x-3 relative" ref={dropdownRef}>
          <button 
            onClick={() => setIsOpen(!isOpen)}
            className="p-2 sm:p-3 text-editorial-muted hover:text-editorial-ink hover:bg-editorial-muted/10 rounded-xl transition-all relative group"
          >
            <motion.div
              animate={unreadCount > 0 ? {
                rotate: [0, -10, 10, -10, 10, 0],
                scale: [1, 1.1, 1]
              } : {}}
              transition={{
                duration: 0.5,
                repeat: unreadCount > 0 ? Infinity : 0,
                repeatDelay: 5
              }}
            >
              <Bell size={20} />
            </motion.div>
            {unreadCount > 0 && (
              <span className="absolute top-2.5 right-2.5 w-4 h-4 bg-editorial-accent text-[10px] font-bold text-white flex items-center justify-center rounded-full border-2 border-editorial-paper z-20">
                {unreadCount > 9 ? '9+' : unreadCount}
              </span>
            )}
            {unreadCount > 0 && (
              <motion.span 
                initial={{ scale: 0.8, opacity: 0.5 }}
                animate={{ scale: 1.5, opacity: 0 }}
                transition={{ duration: 1.5, repeat: Infinity }}
                className="absolute top-2.5 right-2.5 w-4 h-4 bg-editorial-accent rounded-full -z-10"
              />
            )}
          </button>

          <button 
            onClick={onHelp}
            className="p-2 sm:p-3 text-editorial-muted hover:text-editorial-ink hover:bg-editorial-muted/10 rounded-xl transition-all relative group"
            title="Help Guides"
          >
            <HelpCircle size={20} />
          </button>

          <AnimatePresence>
            {isOpen && (
              <motion.div
                initial={{ opacity: 0, y: 10, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 10, scale: 0.95 }}
                className="absolute right-0 top-full mt-2 w-96 bg-zinc-950 text-zinc-100 rounded-3xl shadow-[0_20px_50px_rgba(0,0,0,0.85)] border border-zinc-800/80 overflow-hidden z-50 py-2 text-left animate-in fade-in slide-in-from-top-2 duration-200"
              >
                <div className="px-6 py-4 border-b border-zinc-900 flex items-center justify-between bg-zinc-950">
                  <div className="flex flex-col">
                    <h3 className="font-bold text-zinc-100">Notifications</h3>
                    <div className="flex items-center space-x-2 mt-0.5">
                       <div className={cn(
                         "w-1.5 h-1.5 rounded-full",
                         permissionStatus === "granted" ? "bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.6)]" : 
                         permissionStatus === "denied" ? "bg-red-500" : "bg-yellow-500"
                       )} />
                       <span className="text-[10px] font-mono text-zinc-500">
                         {permissionStatus === "granted" ? "Browser Push Active" : 
                          permissionStatus === "denied" ? "Push Blocked" : "Push Not Configured"}
                       </span>
                    </div>
                  </div>
                  <div className="flex items-center space-x-4">
                    {permissionStatus !== "granted" && (
                      <button 
                        onClick={requestPermission}
                        className="text-[10px] font-bold uppercase tracking-widest text-sky-400 hover:opacity-80 transition-colors"
                      >
                        Enable Push
                      </button>
                    )}
                    {unreadCount > 0 && (
                      <button 
                        onClick={handleMarkAllRead}
                        className="text-[10px] font-bold uppercase tracking-widest text-sky-400 hover:opacity-75 transition-colors"
                      >
                        Mark all
                      </button>
                    )}
                  </div>
                </div>

                <div className="px-6 py-2 border-b border-zinc-900 flex items-center justify-between bg-zinc-900/40">
                  <div className="flex items-center space-x-2">
                    {soundEnabled ? <Volume2 size={12} className="text-zinc-400" /> : <VolumeX size={12} className="text-red-400" />}
                    <span className="text-[10px] font-mono text-zinc-400 uppercase tracking-wider">Alert Sound</span>
                  </div>
                  <button 
                    onClick={() => setSoundEnabled(!soundEnabled)}
                    className={cn(
                      "flex items-center space-x-1 px-2 py-0.5 border text-[9px] font-mono transition-all rounded",
                      soundEnabled ? "border-zinc-200 bg-zinc-100 text-zinc-950 font-bold" : "border-zinc-800 text-zinc-400 hover:border-zinc-700 hover:text-zinc-200"
                    )}
                  >
                    {soundEnabled ? 'ENABLED' : 'DISABLED'}
                  </button>
                </div>

                <div className="max-h-[400px] overflow-y-auto">
                  {safeNotifications.length === 0 ? (
                    <div className="px-10 py-12 text-center">
                      <div className="w-12 h-12 bg-zinc-900 rounded-2xl flex items-center justify-center mx-auto mb-4 text-zinc-400">
                        <Bell size={20} />
                      </div>
                      <p className="text-sm font-medium text-zinc-400">All caught up!</p>
                    </div>
                  ) : (
                    safeNotifications.map(n => (
                      <div 
                        key={n.id}
                        onClick={() => !n.read && handleMarkRead(n.id)}
                        className={cn(
                          "px-6 py-4 flex items-start space-x-4 hover:bg-zinc-900/40 transition-colors cursor-pointer group relative border-b border-zinc-900/20",
                          !n.read && "bg-sky-950/15"
                        )}
                      >
                        <div className={cn(
                          "mt-1 w-8 h-8 rounded-xl flex items-center justify-center text-white shrink-0 shadow-sm",
                          n.type === 'DUE_SOON' ? "bg-red-500 shadow-red-500/25" : "bg-sky-500 shadow-sky-500/25"
                        )}>
                          {n.type === 'DUE_SOON' ? <Clock size={14} /> : <CheckCircle size={14} />}
                        </div>
                        <div className="flex-1 space-y-1">
                          <p className={cn(
                            "text-sm leading-relaxed",
                            n.read ? "text-zinc-400" : "text-zinc-100 font-medium"
                          )}>
                            {n.message}
                          </p>
                          <p className="text-[10px] font-medium text-zinc-500">
                            {new Date(n.createdAt).toLocaleString('en-IN')}
                          </p>
                        </div>
                        {!n.read && (
                          <div className="w-2 h-2 bg-sky-400 rounded-full mt-2 shrink-0 shadow-sm shadow-sky-400/40" />
                        )}
                      </div>
                    ))
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>


        </div>
        
        <div className="flex items-center space-x-1 sm:space-x-2 md:space-x-3 pl-2 sm:pl-4 border-l border-editorial-border">
           <div className="hidden sm:flex flex-col items-end mr-1 text-editorial-ink">
             <span className="text-xs font-bold capitalize">{user?.displayName || user?.username || 'User'}</span>
             <span className="text-[10px] font-mono text-editorial-muted uppercase tracking-tighter">Member</span>
           </div>
           <div 
             onClick={onProfileOpen}
             className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl bg-editorial-muted/10 overflow-hidden shadow-sm border border-editorial-border cursor-pointer hover:border-editorial-accent transition-colors"
           >
            {user?.avatarUrl ? (
              <img 
                src={user.avatarUrl} 
                alt="Profile" 
                className="w-full h-full object-cover"
                referrerPolicy="no-referrer"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-editorial-muted">
                <UserIcon size={20} />
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
