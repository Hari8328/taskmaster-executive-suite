import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Trophy, Clock, Sparkles, X, CheckCircle2 } from "lucide-react";
import { TRIGGER_CELEBRATION_EVENT } from "../lib/audioAndAchievements";
const CelebrationOverlay = () => {
  const [activeCelebration, setActiveCelebration] = useState(null);
  const [show, setShow] = useState(false);
  const [imgError, setImgError] = useState(false);
  useEffect(() => {
    if (show) {
      setImgError(false);
    }
  }, [show, activeCelebration]);
  const getInitials = (name) => {
    const parts = name.split(/[\s.\-_]+/);
    const validParts = parts.filter((p) => p.length > 0);
    if (validParts.length >= 2) {
      return (validParts[0][0] + validParts[1][0]).toUpperCase();
    }
    return name.slice(0, 2).toUpperCase();
  };
  useEffect(() => {
    const handleCelebration = (event) => {
      const customEvent = event;
      if (customEvent.detail) {
        setActiveCelebration(customEvent.detail);
        setShow(true);
        const duration = 15e3;
        const timer = setTimeout(() => {
          setShow(false);
        }, duration);
        return () => clearTimeout(timer);
      }
    };
    window.addEventListener(TRIGGER_CELEBRATION_EVENT, handleCelebration);
    return () => window.removeEventListener(TRIGGER_CELEBRATION_EVENT, handleCelebration);
  }, []);
  const formatSecsToHuman = (ms) => {
    const totalSecs = Math.floor(ms / 1e3);
    const hours = Math.floor(totalSecs / 3600);
    const mins = Math.floor(totalSecs % 3600 / 60);
    const secs = totalSecs % 60;
    if (hours > 0) return `${hours}h ${mins}m`;
    if (mins > 0) return `${mins}m ${secs}s`;
    return `${secs}s`;
  };
  return <AnimatePresence>
      {show && activeCelebration && <div className="fixed inset-x-0 bottom-6 md:bottom-10 z-50 flex flex-col items-center justify-end px-4 pointer-events-none">
          <motion.div
    initial={{ opacity: 0, y: 100, scale: 0.9 }}
    animate={{ opacity: 1, y: 0, scale: 1 }}
    exit={{ opacity: 0, y: 20, scale: 0.95 }}
    transition={{ type: "spring", stiffness: 120, damping: 18 }}
    className="w-full max-w-lg bg-editorial-paper border-2 border-editorial-ink shadow-2xl p-6 text-editorial-ink relative pointer-events-auto overflow-y-auto max-h-[85vh] rounded-xl custom-scrollbar"
  >
            {
    /* Background design elements */
  }
            <div className="absolute right-0 top-0 translate-x-12 -translate-y-12 w-40 h-40 bg-brand-blue/5 rounded-full blur-2xl -z-10" />
            
            {
    /* Top Close Row */
  }
            <button
    onClick={() => setShow(false)}
    className="absolute top-4 right-4 p-1 text-editorial-muted hover:text-editorial-ink transition-colors rounded-full hover:bg-editorial-muted/10 z-10"
  >
              <X size={18} />
            </button>

            {
    /* Content Header */
  }
            <div className="flex items-start space-x-4">
              <div className="p-3 bg-green-50 text-green-600 rounded-full shrink-0 border border-green-200">
                <CheckCircle2 size={24} className="animate-bounce" />
              </div>
              <div className="space-y-1 flex-1 pr-6">
                <p className="text-[10px] font-mono uppercase tracking-[0.2em] text-editorial-muted font-bold">Horizon Completed</p>
                <h4 className="text-xl font-serif italic text-editorial-ink line-clamp-2 md:leading-tight">
                  {activeCelebration.taskTitle}
                </h4>
                
                {
    /* Time Saved Alert */
  }
                {activeCelebration.durationMs ? <div className="flex items-center space-x-1 px-2 py-1 bg-brand-blue/5 border border-brand-blue/10 rounded w-fit mt-2 text-brand-blue text-xs font-mono">
                    <Clock size={12} className="shrink-0" />
                    <span>Focus Invested: {formatSecsToHuman(activeCelebration.durationMs)}</span>
                  </div> : <p className="text-[10px] font-serif italic text-editorial-muted mt-1">Focus logged immediately on completion.</p>}
              </div>
            </div>

            {
    /* Inspirational Mentor segment */
  }
            {activeCelebration.mentor && <div className="mt-5 pt-4 border-t border-editorial-border space-y-4">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 rounded-full overflow-hidden border border-editorial-muted/20 shrink-0 bg-editorial-muted/10 flex items-center justify-center">
                    {imgError ? <span className="font-mono font-bold text-xs text-editorial-ink">
                        {getInitials(activeCelebration.mentor.name)}
                      </span> : <img
    src={activeCelebration.mentor.avatar}
    alt={activeCelebration.mentor.name}
    className="w-full h-full object-cover grayscale font-sans"
    onError={() => setImgError(true)}
    referrerPolicy="no-referrer"
  />}
                  </div>
                  <div>
                    <h5 className="text-xs font-mono uppercase tracking-wider text-editorial-muted font-bold flex items-center gap-1.5 flex-wrap">
                      <span>{activeCelebration.mentor.name}'s Counsel</span>
                      {activeCelebration.mentor.jerseyNumber && <span className="font-mono text-[9px] font-bold px-1.5 py-0.5 bg-amber-500/10 text-amber-600 rounded border border-amber-500/20">
                          #{activeCelebration.mentor.jerseyNumber}
                        </span>}
                    </h5>
                    <p className="text-[9px] text-editorial-muted font-mono uppercase">{activeCelebration.mentor.title}</p>
                  </div>
                </div>

                {
    /* The Quote */
  }
                <div className="bg-editorial-muted/5 border-l-2 border-editorial-ink pl-3 py-1 italic text-sm text-editorial-ink font-serif leading-relaxed">
                  "{activeCelebration.mentor.quote}"
                </div>

                {
    /* The Question */
  }
                <div className="bg-brand-blue/5 border-l-2 border-brand-blue pl-3 py-1.5 text-xs text-brand-blue">
                  <p className="font-mono text-[9px] uppercase tracking-widest font-bold text-brand-blue/70">Reflective Question</p>
                  <p className="font-sans font-semibold mt-0.5 text-brand-blue leading-normal">
                    {activeCelebration.mentor.question}
                  </p>
                </div>

                {
    /* Achievements List */
  }
                <div className="space-y-1.5">
                  <p className="font-mono text-[9px] uppercase tracking-wider font-bold text-editorial-ink">Key Legacy Achievements</p>
                  <ul className="list-disc pl-4 space-y-1 text-[11px] text-editorial-muted">
                    {activeCelebration.mentor.achievements.map((ach, idx) => <li key={idx} className="font-sans leading-relaxed">{ach}</li>)}
                  </ul>
                </div>

                {
    /* Inspirational Story */
  }
                <div className="space-y-1 bg-amber-50/40 p-2.5 border border-amber-200/40 rounded-lg text-editorial-muted text-[11px] leading-relaxed">
                  <p className="font-mono text-[9px] uppercase tracking-wider font-bold text-amber-800">Inspirational Path</p>
                  <p className="italic font-serif text-[11px] text-amber-900/90 leading-normal">{activeCelebration.mentor.inspiration}</p>
                </div>
              </div>}

            {
    /* Unlocked Achievements Showcase */
  }
            {activeCelebration.newAchievements.length > 0 && <motion.div
    initial={{ opacity: 0, height: 0 }}
    animate={{ opacity: 1, height: "auto" }}
    className="mt-6 pt-5 border-t border-editorial-border space-y-4"
  >
                <div className="flex items-center space-x-2 text-yellow-600">
                  <Trophy size={16} className="animate-spin-slow" />
                  <span className="text-[10px] font-mono uppercase tracking-widest font-bold">New Achievement Unlocked!</span>
                </div>

                {activeCelebration.newAchievements.map((ach) => <motion.div
    key={ach.id}
    initial={{ x: -20, opacity: 0 }}
    animate={{ x: 0, opacity: 1 }}
    transition={{ delay: 0.1 }}
    className={`flex items-start space-x-3 p-3 border rounded-xl ${ach.badgeColor}`}
  >
                    <span className="text-2xl pt-0.5">{ach.icon}</span>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-bold font-sans tracking-wide leading-none">{ach.title}</p>
                      <p className="text-[10px] mt-1 leading-relaxed opacity-90">{ach.description}</p>
                    </div>
                  </motion.div>)}
              </motion.div>}

            {
    /* Double Sparkle decorations */
  }
            <div className="absolute left-4 bottom-4 opacity-10 pointer-events-none">
              <Sparkles size={24} className="text-brand-blue" />
            </div>
          </motion.div>
        </div>}
    </AnimatePresence>;
};
export default CelebrationOverlay;
