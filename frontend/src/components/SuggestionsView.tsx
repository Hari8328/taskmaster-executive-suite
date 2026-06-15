import React, { useEffect, useState } from 'react';
import { motion } from 'motion/react';
import { 
  Sparkles, 
  Loader2, 
  Lightbulb, 
  Target, 
  Layers, 
  Brain,
  RefreshCcw,
  CheckCircle2
} from 'lucide-react';
import { cn } from '../lib/utils';
import { taskService } from '../services/taskService';
import { getProductivitySuggestions } from '../lib/gemini';

interface Suggestion {
  title: string;
  description: string;
  category: 'Focus' | 'Organization' | 'Mindset';
}

const SuggestionsView: React.FC = () => {
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [loading, setLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const fetchSuggestions = async (isRefetch = false) => {
    if (isRefetch) setIsRefreshing(true);
    else setLoading(true);

    try {
      const response = await taskService.getMyTasks();
      const tasks = response.content || [];
      
      const aiSuggestions = await getProductivitySuggestions(tasks);
      setSuggestions(aiSuggestions);
    } catch (error) {
      console.error('Error fetching suggestions:', error);
      // Fallback
      setSuggestions([
        { title: 'Eat the Frog', description: 'Tackle your "High" priority task first thing in the morning when your willpower is highest.', category: 'Focus' },
        { title: 'Batch Similar Tasks', description: 'Group your meetings or administrative tasks into blocks to reduce context switching.', category: 'Organization' },
        { title: 'The 2-Minute Rule', description: 'If a new suggestion takes less than 2 minutes, do it immediately instead of archiving it.', category: 'Mindset' }
      ]);
    } finally {
      setLoading(false);
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    fetchSuggestions();
  }, []);

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'Focus': return <Target size={20} className="text-brand-blue" />;
      case 'Organization': return <Layers size={20} className="text-indigo-500" />;
      case 'Mindset': return <Brain size={20} className="text-editorial-accent" />;
      default: return <Lightbulb size={20} />;
    }
  };

  const getCategoryBg = (category: string) => {
    switch (category) {
      case 'Focus': return 'bg-brand-blue/5 border-brand-blue/20';
      case 'Organization': return 'bg-indigo-500/5 border-indigo-500/20';
      case 'Mindset': return 'bg-editorial-accent/5 border-editorial-accent/20';
      default: return 'bg-editorial-muted/5 border-editorial-border/20';
    }
  };

  if (loading) {
    return (
      <div className="h-full flex flex-col items-center justify-center space-y-4">
        <Loader2 className="animate-spin text-brand-blue" size={40} />
        <p className="font-serif italic text-editorial-muted">Gemini is reflecting on your workflow...</p>
      </div>
    );
  }

  return (
    <main className="p-4 md:p-8 max-w-5xl mx-auto space-y-8 md:space-y-12 overflow-y-auto h-full pb-20">
      <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-2">
          <div className="flex items-center space-x-2">
            <div className="p-2 bg-brand-blue/10 rounded-lg">
              <Sparkles className="text-brand-blue w-5 h-5 md:w-6 md:h-6" />
            </div>
            <h1 className="text-2xl md:text-3xl font-serif italic text-editorial-ink">AI Architect's Suggestions</h1>
          </div>
          <p className="text-editorial-muted font-serif text-sm md:text-base">Data-driven insights for your productivity blueprint.</p>
        </div>
        
        <button 
          onClick={() => fetchSuggestions(true)}
          disabled={isRefreshing}
          className="flex items-center space-x-2 px-4 py-2 border border-editorial-border hover:bg-editorial-muted/5 transition-colors rounded-sm font-mono text-[10px] uppercase tracking-widest disabled:opacity-50"
        >
          {isRefreshing ? <Loader2 size={14} className="animate-spin" /> : <RefreshCcw size={14} />}
          <span>Re-evaluate</span>
        </button>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {suggestions.map((suggestion, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className={cn(
              "p-8 border rounded-sm flex flex-col justify-between group hover:shadow-xl transition-all duration-700",
              getCategoryBg(suggestion.category)
            )}
          >
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-editorial-muted">
                  {suggestion.category}
                </span>
                {getCategoryIcon(suggestion.category)}
              </div>
              
            <div className="space-y-3">
                <h3 className="text-xl md:text-2xl font-serif italic text-editorial-ink group-hover:tracking-wide transition-all duration-700">
                  {suggestion.title}
                </h3>
                <p className="text-editorial-ink/70 leading-relaxed font-serif text-base md:text-lg">
                  {suggestion.description}
                </p>
              </div>
            </div>

            <div className="mt-8 pt-6 border-t border-editorial-border/30 flex items-center justify-between opacity-40 group-hover:opacity-100 transition-opacity">
              <div className="flex items-center space-x-2 text-[9px] font-mono uppercase tracking-widest text-editorial-muted">
                <CheckCircle2 size={12} />
                <span>Actionable Insight</span>
              </div>
              <button className="text-[9px] font-mono uppercase tracking-widest text-brand-blue hover:underline">
                Apply Logic
              </button>
            </div>
          </motion.div>
        ))}
      </div>

      <section className="bg-editorial-ink text-editorial-paper p-8 md:p-12 rounded-sm relative overflow-hidden">
        <div className="absolute top-0 right-0 p-8 md:p-12 opacity-5">
           <Brain className="w-32 h-32 md:w-60 md:h-60" />
        </div>
        <div className="max-w-2xl relative z-10 space-y-4 md:space-y-6">
          <div className="space-y-2">
            <p className="font-mono text-[10px] uppercase tracking-widest text-editorial-accent">Architect's Manifesto</p>
            <h2 className="text-2xl md:text-3xl font-serif italic text-white">The philosophy of focused motion.</h2>
          </div>
          <p className="text-editorial-paper/70 font-serif text-lg md:text-xl leading-relaxed italic">
            "Productivity is not about doing more; it is about doing what matters with architectural precision. Use these suggestions as structural reinforcements for your day."
          </p>
          <div className="pt-2 md:pt-4">
             <div className="w-12 h-px bg-editorial-accent" />
          </div>
        </div>
      </section>
    </main>
  );
};

export default SuggestionsView;
