import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  Sparkles,
  X,
  Quote,
  Award,
  Compass,
  ChevronRight
} from "lucide-react";
import {
  INSPIRATION_MENTORS,
  getSelectedMentor,
  setSelectedMentorId
} from "../lib/inspirationMentors";
import { cn } from "../lib/utils";
export default function MentorSelector({ className, onChanged }) {
  const [currentMentor, setCurrentMentor] = useState(() => getSelectedMentor());
  const [isOpen, setIsOpen] = useState(false);
  const [imgErrors, setImgErrors] = useState({});
  const getInitials = (name) => {
    const parts = name.split(/[\s.\-_]+/);
    const validParts = parts.filter((p) => p.length > 0);
    if (validParts.length >= 2) {
      return (validParts[0][0] + validParts[1][0]).toUpperCase();
    }
    return name.slice(0, 2).toUpperCase();
  };
  useEffect(() => {
    const handleMentorChange = () => {
      setCurrentMentor(getSelectedMentor());
    };
    window.addEventListener("horizon_mentor_changed", handleMentorChange);
    return () => window.removeEventListener("horizon_mentor_changed", handleMentorChange);
  }, []);
  const handleSelect = (mentorId) => {
    setSelectedMentorId(mentorId);
    setCurrentMentor(getSelectedMentor());
    setIsOpen(false);
    if (onChanged) {
      onChanged(mentorId);
    }
  };
  return <div className={cn("space-y-4", className)} id="inspiration-mentor-selector-container">
      {
    /* Mentor Highlight Card */
  }
      <div className="border border-editorial-border bg-editorial-paper p-6 relative overflow-hidden transition-all duration-300 group hover:shadow-lg rounded-xl flex flex-col md:flex-row gap-6 md:items-center">
        {
    /* Background design accents */
  }
        <div className="absolute right-0 bottom-0 translate-x-12 translate-y-12 w-48 h-48 bg-editorial-accent/5 rounded-full blur-2xl -z-10 transition-transform group-hover:scale-110" />

        {
    /* Avatar Shield */
  }
        <div className="relative shrink-0 flex items-center justify-center">
          <div className="w-20 h-20 rounded-full border-2 border-editorial-ink overflow-hidden shadow-md bg-editorial-muted/10 flex items-center justify-center">
            {imgErrors[currentMentor.id] ? <span className="font-mono font-bold text-xl text-editorial-ink">
                {getInitials(currentMentor.name)}
              </span> : <img
    src={currentMentor.avatar}
    alt={currentMentor.name}
    className="w-full h-full object-cover grayscale transition-all duration-700 group-hover:grayscale-0 group-hover:scale-105"
    onError={() => setImgErrors((prev) => ({ ...prev, [currentMentor.id]: true }))}
    referrerPolicy="no-referrer"
  />}
          </div>
          <div className="absolute -bottom-1 -right-1 p-1.5 bg-editorial-ink text-editorial-paper rounded-full border border-editorial-border shadow shadow-black/10">
            <Sparkles size={12} className="animate-pulse" />
          </div>
        </div>

        {
    /* Info Area */
  }
        <div className="flex-1 space-y-2">
          <div className="flex flex-wrap items-center gap-2">
            <span className="font-mono text-[9px] uppercase tracking-widest font-bold px-2 py-0.5 bg-brand-blue/10 text-brand-blue rounded border border-brand-blue/20">
              Active Inspirational Mentor
            </span>
            {currentMentor.jerseyNumber && <span className="font-mono text-[9px] uppercase tracking-widest font-bold px-2 py-0.5 bg-amber-500/10 text-amber-600 rounded border border-amber-500/20">
                Jersey #{currentMentor.jerseyNumber}
              </span>}
          </div>
          <div>
            <h4 className="text-2xl font-serif font-bold text-editorial-ink">{currentMentor.name}</h4>
            <p className="text-xs font-mono uppercase text-editorial-muted tracking-wide">{currentMentor.title}</p>
          </div>
          <p className="text-xs text-editorial-muted leading-relaxed font-sans max-w-2xl">{currentMentor.bio}</p>
          
          <div className="text-[10px] text-editorial-muted italic font-serif flex items-start gap-1 py-1 max-w-2xl">
            <Quote size={12} className="shrink-0 text-editorial-ink/30 mt-0.5" />
            <span>"{currentMentor.quotes[0]}"</span>
          </div>
        </div>

        {
    /* Change button */
  }
        <div className="shrink-0 flex items-start">
          <button
    onClick={() => setIsOpen(true)}
    className="w-full md:w-auto inline-flex items-center justify-center space-x-2 px-5 py-2.5 bg-editorial-ink text-editorial-paper font-mono text-[11px] uppercase tracking-widest hover:bg-brand-blue transition-all duration-300 rounded shadow hover:shadow-indigo-500/10 shrink-0 font-bold"
  >
            <span>Change Mentor</span>
            <ChevronRight size={14} />
          </button>
        </div>
      </div>

      {
    /* Choice Modal (Mentor Selection) */
  }
      <AnimatePresence>
        {isOpen && <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-editorial-ink/65 backdrop-blur-sm">
            <motion.div
    initial={{ opacity: 0, scale: 0.95, y: 30 }}
    animate={{ opacity: 1, scale: 1, y: 0 }}
    exit={{ opacity: 0, scale: 0.95, y: 20 }}
    transition={{ type: "spring", stiffness: 220, damping: 25 }}
    className="bg-editorial-paper border-2 border-editorial-ink w-full max-w-4xl max-h-[85vh] shadow-2xl overflow-hidden relative flex flex-col rounded-2xl"
    onClick={(e) => e.stopPropagation()}
  >
              {
    /* Modal Header */
  }
              <div className="p-6 border-b border-editorial-border flex justify-between items-center bg-editorial-paper z-10 shrink-0">
                <div>
                  <div className="flex items-center space-x-2 text-editorial-accent">
                    <Compass size={18} className="animate-spin-slow" />
                    <span className="font-mono text-xs uppercase tracking-widest font-bold">Horizon Mentors</span>
                  </div>
                  <h3 className="text-2xl font-serif font-bold text-editorial-ink mt-0.5">Select Inspirational Mentor</h3>
                  <p className="text-xs text-editorial-muted font-sans mt-0.5">Choose whom you receive custom guidance, quote cards, and reflective checks from upon task completions.</p>
                </div>
                <button
    onClick={() => setIsOpen(false)}
    className="p-2 border border-editorial-border hover:bg-red-50 hover:text-red-600 hover:border-red-200 transition-colors rounded-full"
    title="Close Dialog"
  >
                  <X size={20} />
                </button>
              </div>

              {
    /* Mentors Catalog List */
  }
              <div className="flex-1 overflow-y-auto p-6 space-y-4 custom-scrollbar">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {INSPIRATION_MENTORS.map((mentor) => {
    const isSelected = mentor.id === currentMentor.id;
    return <div
      key={mentor.id}
      onClick={() => handleSelect(mentor.id)}
      className={cn(
        "border-2 p-5 flex flex-col justify-between transition-all duration-300 relative cursor-pointer hover:shadow-md group rounded-xl",
        isSelected ? "border-editorial-ink bg-editorial-muted/5 shadow-inner" : "border-editorial-border hover:border-editorial-ink bg-editorial-paper"
      )}
    >
                        <div className="space-y-4">
                          {
      /* Banner row */
    }
                          <div className="flex items-start justify-between">
                            <div className="flex items-center space-x-3">
                              <div className="w-12 h-12 rounded-full border border-editorial-ink overflow-hidden shadow bg-editorial-muted/10 flex items-center justify-center shrink-0">
                                {imgErrors[mentor.id] ? <span className="font-mono font-bold text-sm text-editorial-ink">
                                    {getInitials(mentor.name)}
                                  </span> : <img
      src={mentor.avatar}
      alt={mentor.name}
      className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-500"
      onError={() => setImgErrors((prev) => ({ ...prev, [mentor.id]: true }))}
      referrerPolicy="no-referrer"
    />}
                              </div>
                              <div>
                                <div className="flex items-center gap-2 flex-wrap">
                                  <h4 className="text-lg font-serif font-bold text-editorial-ink">{mentor.name}</h4>
                                  {mentor.jerseyNumber && <span className="font-mono text-[9px] font-bold px-1.5 py-0.5 bg-amber-500/10 text-amber-600 rounded border border-amber-500/20">
                                      #{mentor.jerseyNumber}
                                    </span>}
                                </div>
                                <p className="text-[10px] font-mono text-editorial-muted uppercase">{mentor.title}</p>
                              </div>
                            </div>

                            {
      /* Chevron or active indicator */
    }
                            {isSelected ? <span className="px-2 py-1 bg-green-50 border border-green-200 text-green-700 font-mono text-[9px] uppercase font-bold rounded">
                                Active Mentor
                              </span> : <span className="text-[10px] font-mono text-editorial-muted group-hover:text-editorial-ink transition-colors uppercase font-bold">
                                Select &bull; &rarr;
                              </span>}
                          </div>

                          {
      /* Biography details */
    }
                          <p className="text-xs text-editorial-muted font-sans leading-relaxed pt-1">{mentor.bio}</p>

                          {
      /* Quote Preview teaser */
    }
                          <div className="text-[10px] font-serif text-editorial-muted/80 italic border-l border-editorial-border/85 pl-2 py-0.5 leading-snug">
                            "{mentor.quotes[0]}"
                          </div>
                          
                          {
      /* Mini Achievements Summary */
    }
                          <div className="pt-1.5 space-y-1">
                            <p className="font-mono text-[9px] uppercase tracking-wider font-bold text-editorial-ink/70">Legacy Highlight:</p>
                            <p className="text-[10px] text-editorial-muted leading-relaxed flex items-start gap-1">
                              <Award size={10} className="shrink-0 mt-0.5 text-editorial-accent" />
                              <span>{mentor.achievements[0]}</span>
                            </p>
                          </div>
                        </div>

                        {
      /* Complete action footer inside card */
    }
                        <div className="pt-4 mt-2">
                          <button
      type="button"
      onClick={(e) => {
        e.stopPropagation();
        handleSelect(mentor.id);
      }}
      className={cn(
        "w-full text-center py-2 font-mono text-[10px] uppercase tracking-widest transition-all rounded font-bold border",
        isSelected ? "bg-editorial-ink hover:opacity-90 text-editorial-paper border-editorial-ink" : "bg-transparent text-editorial-ink hover:bg-editorial-ink hover:text-white border-editorial-border hover:border-editorial-ink"
      )}
    >
                            {isSelected ? "Currently Configured" : "Refocus Mentorship"}
                          </button>
                        </div>
                      </div>;
  })}
                </div>
              </div>

              {
    /* Modal footer information bar */
  }
              <div className="p-4 bg-editorial-muted/5 border-t border-editorial-border shrink-0 text-center text-[10px] text-editorial-muted font-mono uppercase tracking-wider">
                Select your focus mentor &bull; Quotes, coaching, and inspiration cards refresh on every finished task
              </div>
            </motion.div>
          </div>}
      </AnimatePresence>
    </div>;
}
