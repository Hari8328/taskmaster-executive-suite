// Utility to manage Web Audio API sound synthesis, achievements tracking, and saved time metrics
import { Task } from '../types';

export interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: string;
  unlocked: boolean;
  unlockedAt?: string;
  badgeColor: string;
}

// 1. WEB AUDIO API CHIMES (Instant, zero-latency, 100% reliable offline)
export const playReminderSound = () => {
  const isSoundEnabled = localStorage.getItem('notification_sound_enabled') !== 'false';
  if (!isSoundEnabled) return;

  try {
    const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioContext) return;
    const ctx = new AudioContext();

    // Warm high-bell chime: E5 -> A5
    const now = ctx.currentTime;
    
    // Note 1: E5 (659.25 Hz)
    const osc1 = ctx.createOscillator();
    const gain1 = ctx.createGain();
    osc1.type = 'triangle';
    osc1.frequency.setValueAtTime(659.25, now);
    
    gain1.gain.setValueAtTime(0, now);
    gain1.gain.linearRampToValueAtTime(0.25, now + 0.05);
    gain1.gain.exponentialRampToValueAtTime(0.001, now + 0.35);
    
    osc1.connect(gain1);
    gain1.connect(ctx.destination);
    
    // Note 2: A5 (880.00 Hz) played 150ms later
    const osc2 = ctx.createOscillator();
    const gain2 = ctx.createGain();
    osc2.type = 'sine';
    osc2.frequency.setValueAtTime(880.00, now + 0.12);
    
    gain2.gain.setValueAtTime(0, now + 0.12);
    gain2.gain.linearRampToValueAtTime(0.2, now + 0.17);
    gain2.gain.exponentialRampToValueAtTime(0.001, now + 0.6);
    
    osc2.connect(gain2);
    gain2.connect(ctx.destination);
    
    osc1.start(now);
    osc1.stop(now + 0.4);
    osc2.start(now + 0.12);
    osc2.stop(now + 0.65);
  } catch (err) {
    console.error('Failed to play reminder chime:', err);
  }
};

export const playCompleteSound = () => {
  const isSoundEnabled = localStorage.getItem('notification_sound_enabled') !== 'false';
  if (!isSoundEnabled) return;

  try {
    const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioContext) return;
    const ctx = new AudioContext();

    // Sparkling arpeggio: C5 -> E5 -> G5 -> C6
    const now = ctx.currentTime;
    const notes = [523.25, 659.25, 783.99, 1046.50]; // C5, E5, G5, C6
    const delays = [0.0, 0.08, 0.16, 0.24];
    const durations = [0.4, 0.45, 0.5, 0.7];
    const volumes = [0.12, 0.12, 0.12, 0.15];

    notes.forEach((freq, idx) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      
      // Make the final C6 note sparkly with triangle wave for timber, others soft sines
      osc.type = idx === 3 ? 'sine' : 'sine';
      osc.frequency.setValueAtTime(freq, now + delays[idx]);
      
      gain.gain.setValueAtTime(0, now + delays[idx]);
      gain.gain.linearRampToValueAtTime(volumes[idx], now + delays[idx] + 0.04);
      gain.gain.exponentialRampToValueAtTime(0.001, now + delays[idx] + durations[idx]);
      
      osc.connect(gain);
      gain.connect(ctx.destination);
      
      osc.start(now + delays[idx]);
      osc.stop(now + delays[idx] + durations[idx] + 0.1);
    });
  } catch (err) {
    console.error('Failed to play completed sound:', err);
  }
};

// 2. SAVED TIME METRIC COMPUTATION & PERSISTENCE
export const getSavedTimeStats = () => {
  const saved = localStorage.getItem('horizon_saved_time_stats');
  if (saved) {
    try {
      return JSON.parse(saved);
    } catch (e) {
      // Ignored
    }
  }
  return {
    totalSavedMs: 0,
    completedTasksCount: 0,
  };
};

export const saveCompletedTaskTime = (durationMs: number) => {
  const stats = getSavedTimeStats();
  stats.totalSavedMs += durationMs;
  stats.completedTasksCount += 1;
  localStorage.setItem('horizon_saved_time_stats', JSON.stringify(stats));
  return stats;
};

// 3. ACHIEVEMENTS INITIALIZATION & PERSISTENCE
const DEFAULT_ACHIEVEMENTS: Achievement[] = [
  {
    id: 'first_task',
    title: 'First Foundation',
    description: 'Laid your first block by completing a task successfully.',
    icon: '🏗️',
    unlocked: false,
    badgeColor: 'border-blue-500 bg-blue-50 text-blue-700',
  },
  {
    id: 'steady_builder',
    title: 'Steady Construction',
    description: 'Completed 3 tasks on your horizon. Building serious momentum!',
    icon: '🔨',
    unlocked: false,
    badgeColor: 'border-yellow-600 bg-yellow-50 text-yellow-700',
  },
  {
    id: 'master_architect',
    title: 'Horizon Architect',
    description: 'Completed 6 tasks in total. Your blueprint is taking full shape.',
    icon: '🏛️',
    unlocked: false,
    badgeColor: 'border-purple-600 bg-purple-50 text-purple-700',
  },
  {
    id: 'deep_focus',
    title: 'Deep Work Alchemist',
    description: 'Logged over 15 minutes of focused time on finished tasks.',
    icon: '🔮',
    unlocked: false,
    badgeColor: 'border-green-600 bg-green-50 text-green-700',
  },
  {
    id: 'speedy_mason',
    title: 'Efficient Mason',
    description: 'Completed an in-progress task with tracked duration!',
    icon: '⚡',
    unlocked: false,
    badgeColor: 'border-pink-600 bg-pink-50 text-pink-700',
  },
  {
    id: 'unstoppable',
    title: 'Unstoppable Momentum',
    description: 'Completed 10 tasks. You are at the absolute peak of focus.',
    icon: '👑',
    unlocked: false,
    badgeColor: 'border-red-600 bg-red-50 text-red-700',
  }
];

export const getAchievements = (): Achievement[] => {
  const stored = localStorage.getItem('horizon_achievements');
  if (stored) {
    try {
      const parsed = JSON.parse(stored) as Achievement[];
      // Make sure we carry forward any schema updates
      if (parsed.length === DEFAULT_ACHIEVEMENTS.length) {
        return parsed;
      }
    } catch (e) {
      // Ignore and fallback
    }
  }
  localStorage.setItem('horizon_achievements', JSON.stringify(DEFAULT_ACHIEVEMENTS));
  return DEFAULT_ACHIEVEMENTS;
};

export const checkAndUnlockAchievements = (allTasks: Task[]): Achievement[] => {
  const achievements = getAchievements();
  const completedTasks = allTasks.filter(t => t.status?.toLowerCase() === 'completed');
  const completedCount = completedTasks.length;
  
  // Calculate focus time from finished tasks with valid durations
  const totalFocusTimeMs = completedTasks.reduce((acc, t) => {
    if (t.startedAt && t.completedAt) {
      const s = new Date(t.startedAt).getTime();
      const e = new Date(t.completedAt).getTime();
      return acc + Math.max(0, e - s);
    }
    return acc;
  }, 0);

  const hasTrackedDuration = completedTasks.some(t => t.startedAt && t.completedAt && (new Date(t.completedAt).getTime() - new Date(t.startedAt).getTime() > 1000));
  const newUnlocks: Achievement[] = [];

  const updatedAchievements = achievements.map(ach => {
    if (ach.unlocked) return ach;

    let shouldUnlock = false;
    switch (ach.id) {
      case 'first_task':
        shouldUnlock = completedCount >= 1;
        break;
      case 'steady_builder':
        shouldUnlock = completedCount >= 3;
        break;
      case 'master_architect':
        shouldUnlock = completedCount >= 6;
        break;
      case 'deep_focus':
        // 15 minutes is 15 * 60 * 1000 ms
        shouldUnlock = totalFocusTimeMs >= 15 * 60 * 1000;
        break;
      case 'speedy_mason':
        shouldUnlock = hasTrackedDuration;
        break;
      case 'unstoppable':
        shouldUnlock = completedCount >= 10;
        break;
    }

    if (shouldUnlock) {
      const unlockedAch = {
        ...ach,
        unlocked: true,
        unlockedAt: new Date().toISOString()
      };
      newUnlocks.push(unlockedAch);
      return unlockedAch;
    }

    return ach;
  });

  if (newUnlocks.length > 0) {
    localStorage.setItem('horizon_achievements', JSON.stringify(updatedAchievements));
  }

  return newUnlocks;
};

import { getSelectedMentor } from './inspirationMentors';

// 4. EVENT-BASED COMMUNICATION FOR CELEBRATIONS
export const TRIGGER_CELEBRATION_EVENT = 'horizon_trigger_celebration';

export interface CelebrationPayload {
  taskTitle: string;
  durationMs: number | null;
  newAchievements: Achievement[];
  mentor?: {
    name: string;
    title: string;
    avatar: string;
    quote: string;
    question: string;
    achievements: string[];
    inspiration: string;
    jerseyNumber?: string;
  };
}

export const dispatchCelebration = (payload: CelebrationPayload) => {
  const mentor = getSelectedMentor();
  const randomIndex = (arr: any[]) => Math.floor(Math.random() * arr.length);
  const enrichedPayload: CelebrationPayload = {
    ...payload,
    mentor: {
      name: mentor.name,
      title: mentor.title,
      avatar: mentor.avatar,
      quote: mentor.quotes[randomIndex(mentor.quotes)],
      question: mentor.questions[randomIndex(mentor.questions)],
      achievements: mentor.achievements,
      inspiration: mentor.inspiration,
      jerseyNumber: mentor.jerseyNumber,
    }
  };
  const event = new CustomEvent(TRIGGER_CELEBRATION_EVENT, { detail: enrichedPayload });
  window.dispatchEvent(event);
};
