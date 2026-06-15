import React, { useState, useEffect } from 'react';
import { Clock } from 'lucide-react';
import { cn } from '../lib/utils';

interface LiveClockProps {
  className?: string;
  showSeconds?: boolean;
  minimal?: boolean;
}

const LiveClock: React.FC<LiveClockProps> = ({ className, showSeconds = true, minimal = false }) => {
  const [time, setTime] = useState(new Date());

  useEffect(() => {
    const interval = setInterval(() => {
      setTime(new Date());
    }, 1000); // Ticks every single second

    return () => clearInterval(interval);
  }, []);

  const weekday = new Intl.DateTimeFormat('en-IN', { weekday: 'long' }).format(time);
  const formattedDate = new Intl.DateTimeFormat('en-IN', { 
    day: 'numeric', 
    month: 'short', 
    year: 'numeric' 
  }).format(time);

  const formattedTime = time.toLocaleTimeString('en-IN', {
    hour: '2-digit',
    minute: '2-digit',
    second: showSeconds ? '2-digit' : undefined,
    hour12: true
  });

  if (minimal) {
    return (
      <div className={cn("flex items-center space-x-2 text-editorial-muted font-mono text-[10px] uppercase tracking-widest", className)}>
        <Clock size={12} className="text-editorial-accent animate-pulse" />
        <span>{formattedTime}</span>
      </div>
    );
  }

  return (
    <div className={cn("text-left md:text-right flex flex-col md:items-end justify-center", className)}>
      <div className="flex items-center space-x-2 justify-start md:justify-end">
        <span className="text-xl md:text-3xl font-serif italic text-editorial-ink leading-none">{weekday}</span>
        <span className="text-xs md:text-sm font-mono tracking-widest text-white px-2 py-0.5 bg-editorial-ink rounded font-bold ml-1 tabular-nums animate-pulse">
          {formattedTime}
        </span>
      </div>
      <p className="text-editorial-muted font-mono text-[10px] uppercase tracking-widest mt-1">{formattedDate}</p>
    </div>
  );
};

export default LiveClock;
