import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Trophy, Crown, Sparkles, Swords, Flame, Play, RefreshCw } from "lucide-react";
import { cn } from "../lib/utils";
export default function CompetitionArena({ userCompletionCount, userProfile }) {
  const [competitors, setCompetitors] = useState([
    { id: "dhoni", name: "M. S. Dhoni", title: "Cricket Legend", avatar: "https://picsum.photos/seed/dhoni/100/100", completedTasks: 7 },
    { id: "jobs", name: "Steve Jobs", title: "Product Architect", avatar: "https://picsum.photos/seed/jobs/100/100", completedTasks: 5 },
    { id: "lovelace", name: "Ada Lovelace", title: "System Pioneer", avatar: "https://picsum.photos/seed/ada/100/100", completedTasks: 8 },
    { id: "churchill", name: "Winston Churchill", title: "State Architect", avatar: "https://picsum.photos/seed/churchill/100/100", completedTasks: 3 },
    { id: "lombardi", name: "Vince Lombardi", title: "Grit Philosopher", avatar: "https://picsum.photos/seed/lombardi/100/100", completedTasks: 6 }
  ]);
  const [imgErrors, setImgErrors] = useState({});
  const [justSimulated, setJustSimulated] = useState(null);
  const getInitials = (name) => {
    const parts = name.split(/[\s.\-_]+/);
    const validParts = parts.filter((p) => p.length > 0);
    if (validParts.length >= 2) {
      return (validParts[0][0] + validParts[1][0]).toUpperCase();
    }
    return name.slice(0, 2).toUpperCase();
  };
  const allParticipants = [
    {
      id: "current_user",
      name: userProfile?.displayName || userProfile?.username || "You (Horizon Builder)",
      title: "Current Active Builder",
      avatar: userProfile?.avatarUrl || "",
      completedTasks: userCompletionCount,
      isCurrentUser: true
    },
    ...competitors
  ];
  const sortedParticipants = [...allParticipants].sort((a, b) => {
    if (b.completedTasks !== a.completedTasks) {
      return b.completedTasks - a.completedTasks;
    }
    if (a.isCurrentUser) return -1;
    if (b.isCurrentUser) return 1;
    return a.name.localeCompare(b.name);
  });
  const maxCompleted = Math.max(...allParticipants.map((p) => p.completedTasks));
  const triggerSimCompetitorCompletion = () => {
    const activeOpps = competitors.map((c) => c.id);
    const randomOppId = activeOpps[Math.floor(Math.random() * activeOpps.length)];
    setCompetitors(
      (prev) => prev.map((c) => {
        if (c.id === randomOppId) {
          return { ...c, completedTasks: c.completedTasks + 1 };
        }
        return c;
      })
    );
    setJustSimulated(randomOppId);
    setTimeout(() => {
      setJustSimulated(null);
    }, 2e3);
  };
  const resetLeaderboardScores = () => {
    setCompetitors([
      { id: "dhoni", name: "M. S. Dhoni", title: "Cricket Legend", avatar: "https://picsum.photos/seed/dhoni/100/100", completedTasks: 7 },
      { id: "jobs", name: "Steve Jobs", title: "Product Architect", avatar: "https://picsum.photos/seed/jobs/100/100", completedTasks: 5 },
      { id: "lovelace", name: "Ada Lovelace", title: "System Pioneer", avatar: "https://picsum.photos/seed/ada/100/100", completedTasks: 8 },
      { id: "churchill", name: "Winston Churchill", title: "State Architect", avatar: "https://picsum.photos/seed/churchill/100/100", completedTasks: 3 },
      { id: "lombardi", name: "Vince Lombardi", title: "Grit Philosopher", avatar: "https://picsum.photos/seed/lombardi/100/100", completedTasks: 6 }
    ]);
  };
  return <section className="border border-editorial-border p-6 md:p-8 bg-white shadow-sm relative overflow-hidden">
      {
    /* Decorative Vibe Elements */
  }
      <div className="absolute right-0 top-0 w-32 h-32 bg-amber-500/5 rounded-full blur-2xl" />
      <div className="absolute left-0 bottom-0 w-32 h-32 bg-brand-blue/5 rounded-full blur-2xl" />

      {
    /* Header and Controls */
  }
      <div className="flex flex-col md:flex-row md:items-center justify-between pb-4 border-b border-editorial-border gap-4 mb-6 relative z-10">
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-amber-500/10 text-amber-600 rounded-full">
            <Swords size={20} />
          </div>
          <div>
            <h3 className="text-xl md:text-2xl font-serif font-bold text-editorial-ink flex items-center gap-2">
              Architects' Arena
              <span className="font-mono text-[9px] uppercase tracking-widest font-bold px-2 py-0.5 bg-amber-500/10 text-amber-600 rounded border border-amber-500/20">
                Active Competition
              </span>
            </h3>
            <p className="text-xs text-editorial-muted font-sans font-medium mt-0.5">
              Work alongside legendary pioneers to claim 1st position and win the Heroic Champion Badge!
            </p>
          </div>
        </div>

        {
    /* Live Simulator & Reset Controls */
  }
        <div className="flex items-center gap-2">
          <button
    onClick={triggerSimCompetitorCompletion}
    className="flex items-center space-x-1.5 px-3 py-1.5 border border-editorial-border hover:border-editorial-ink bg-editorial-muted/5 hover:bg-editorial-muted/10 text-editorial-ink text-[10px] uppercase tracking-widest font-mono font-bold transition-all"
    title="Simulate page interaction and standard team progression"
  >
            <Play size={10} className="text-amber-500 fill-amber-500 animate-pulse" />
            <span>Simulate Competitor Task</span>
          </button>
          
          <button
    onClick={resetLeaderboardScores}
    className="p-2 border border-editorial-border hover:border-editorial-ink bg-white text-editorial-muted hover:text-editorial-ink transition-all"
    title="Reset competitor scores"
  >
            <RefreshCw size={12} />
          </button>
        </div>
      </div>

      {
    /* Main Leaderboard List */
  }
      <div className="space-y-3 relative z-10">
        <AnimatePresence mode="popLayout">
          {sortedParticipants.map((participant, index) => {
    const position = index + 1;
    const isFirst = position === 1;
    const isHero = participant.completedTasks === maxCompleted && participant.completedTasks > 0;
    const isJustUpdated = justSimulated === participant.id;
    return <motion.div
      layout
      key={participant.id}
      initial={{ opacity: 0, y: 15 }}
      animate={{
        opacity: 1,
        y: 0,
        scale: isJustUpdated ? 1.02 : 1,
        backgroundColor: participant.isCurrentUser ? "rgba(59, 130, 246, 0.04)" : isFirst ? "rgba(245, 158, 11, 0.02)" : "#ffffff"
      }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{
        type: "spring",
        stiffness: 300,
        damping: 30,
        mass: 0.8
      }}
      className={cn(
        "p-4 border transition-all flex flex-col md:flex-row md:items-center justify-between gap-4 group",
        participant.isCurrentUser ? "border-brand-blue/30 shadow-sm" : isFirst ? "border-amber-500/30" : "border-editorial-border/60 hover:border-editorial-border"
      )}
      id={`competitor-card-${participant.id}`}
    >
                {
      /* Left Side: Position, Avatar, Name */
    }
                <div className="flex items-center space-x-3.5 shrink-0">
                  {
      /* Position Badge with trophy visual */
    }
                  <div className="w-8 h-8 flex items-center justify-center shrink-0">
                    {isFirst ? <motion.div
      animate={{ rotate: [0, -10, 10, -10, 0] }}
      transition={{ repeat: Infinity, duration: 3, repeatDelay: 4 }}
      className="text-amber-500"
      id={`winner-crown-icon-${participant.id}`}
    >
                        <Crown size={22} className="fill-amber-500/20" />
                      </motion.div> : <span className="font-mono text-xs font-bold text-editorial-muted">
                        {position}
                      </span>}
                  </div>

                  {
      /* Avatar Frame with custom backup initials */
    }
                  <div className="relative shrink-0">
                    <div className={cn(
      "w-12 h-12 rounded-full overflow-hidden border flex items-center justify-center shadow-inner",
      participant.isCurrentUser ? "border-brand-blue bg-brand-blue/10" : isFirst ? "border-amber-500 bg-amber-500/10" : "border-editorial-border bg-editorial-paper/50"
    )}>
                      {participant.avatar && !imgErrors[participant.id] ? <img
      src={participant.avatar}
      alt={participant.name}
      className="w-full h-full object-cover transition-transform group-hover:scale-105 duration-300"
      onError={() => setImgErrors((prev) => ({ ...prev, [participant.id]: true }))}
      referrerPolicy="no-referrer"
    /> : <span className="font-mono font-bold text-sm text-editorial-ink">
                          {getInitials(participant.name)}
                        </span>}
                    </div>

                    {
      /* Animated current user state dot or status indicator */
    }
                    {participant.isCurrentUser && <span className="absolute bottom-0 right-0 w-3 h-3 bg-brand-blue rounded-full border-2 border-white flex items-center justify-center">
                        <span className="block w-1.5 h-1.5 bg-white rounded-full animate-ping" />
                      </span>}
                    
                    {
      /* Simulated change flash dot */
    }
                    {isJustUpdated && <span className="absolute -top-1 -right-1 w-3 h-3 bg-amber-500 rounded-full animate-ping" />}
                  </div>

                  {
      /* Competitor Name and Label */
    }
                  <div>
                    <div className="flex items-center gap-1.5">
                      <h4 className={cn(
      "text-base font-serif font-bold text-editorial-ink",
      participant.isCurrentUser && "text-brand-blue"
    )}>
                        {participant.name}
                      </h4>
                      {participant.isCurrentUser && <span className="font-mono text-[8px] bg-brand-blue/10 text-brand-blue border border-brand-blue/20 rounded px-1 py-0.5 font-bold uppercase tracking-wider">
                          YOU
                        </span>}
                    </div>
                    <p className="text-[10px] font-mono text-editorial-muted uppercase tracking-wider">
                      {participant.title}
                    </p>
                  </div>
                </div>

                {
      /* Right Side: Achievements, Completed Tasks & Heroic Badge */
    }
                <div className="flex flex-wrap items-center gap-3 md:gap-4 justify-between md:justify-end flex-1 md:flex-none">
                  {
      /* HEROIC CHAMPION BADGE - Exclusively awarded to the highest completions */
    }
                  {isHero && <motion.div
      initial={{ scale: 0.9, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      className="inline-flex items-center space-x-1 px-2.5 py-1 bg-gradient-to-r from-amber-500/20 via-orange-500/20 to-yellow-500/10 text-amber-700 rounded border border-amber-500/30 text-[9px] font-mono uppercase font-black tracking-widest animate-pulse shadow-sm"
      id={`hero-champion-badge-${participant.id}`}
    >
                      <Sparkles size={11} className="text-amber-600 animate-spin" />
                      <span>Heroic Champion</span>
                    </motion.div>}

                  {
      /* 1st Position Award Badge */
    }
                  {isFirst && <div
      className="inline-flex items-center space-x-1 px-2 py-0.5 bg-yellow-500/10 text-yellow-700 border border-yellow-500/20 rounded font-mono text-[9px] uppercase font-bold tracking-wider"
      id={`award-badge-${participant.id}`}
    >
                      <Trophy size={11} className="text-yellow-600 shrink-0" />
                      <span>1st Position</span>
                    </div>}

                  {
      /* Progress and Completed Task Counters */
    }
                  <div className="flex items-center space-x-4">
                    <div className="flex flex-col items-end">
                      <div className="flex items-center space-x-1 text-editorial-ink font-serif font-bold">
                        <span className="text-lg leading-tight">
                          {participant.completedTasks}
                        </span>
                        <span className="text-xs text-editorial-muted font-mono uppercase tracking-wider font-semibold">
                          tasks
                        </span>
                      </div>
                      <p className="text-[8px] font-mono text-editorial-muted uppercase tracking-widest font-bold">
                        completed
                      </p>
                    </div>

                    {
      /* Minimal dynamic progress mini-bar */
    }
                    <div className="w-16 h-1.5 bg-editorial-border rounded-full overflow-hidden shrink-0 hidden sm:block">
                      <div
      className={cn(
        "h-full rounded-full transition-all duration-1000",
        participant.isCurrentUser ? "bg-brand-blue" : isFirst ? "bg-amber-500" : "bg-editorial-muted"
      )}
      style={{ width: `${Math.min(100, participant.completedTasks / 12 * 100)}%` }}
    />
                    </div>
                  </div>
                </div>
              </motion.div>;
  })}
        </AnimatePresence>
      </div>

      {
    /* Encouraging Vibe Banner */
  }
      <div className="mt-5 p-3.5 bg-editorial-muted/5 border border-editorial-border/60 flex items-center space-x-3">
        <Flame size={16} className="text-amber-500 shrink-0 animate-bounce" />
        <p className="text-xs text-editorial-muted font-serif italic">
          {sortedParticipants[0].isCurrentUser ? <span>Highly exceptional! You are maintaining <strong>1st Position</strong> with {userCompletionCount} tasks completed. Protect your heroic legacy!</span> : <span>You need <strong>{sortedParticipants[0].completedTasks - userCompletionCount + 1}</strong> more completed tasks to overtake <strong>{sortedParticipants[0].name}</strong> for 1st Position! Let's get to work!</span>}
        </p>
      </div>
    </section>;
}
