import { useEffect, useState } from "react";
import { motion } from "motion/react";
import {
  Play,
  Share2,
  Heart,
  ArrowRight,
  Sparkles,
  Quote,
  Loader2
} from "lucide-react";
import MentorSelector from "./MentorSelector";
const InspirationView = () => {
  const [quotes, setQuotes] = useState([]);
  const [readingList, setReadingList] = useState([]);
  const [growth, setGrowth] = useState(null);
  const [thought, setThought] = useState(null);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    const fetchData = async () => {
      try {
        const responses = await Promise.all([
          fetch("/api/inspiration/quotes"),
          fetch("/api/inspiration/reading-list"),
          fetch("/api/inspiration/growth"),
          fetch("/api/inspiration/thought-of-day")
        ]);
        for (const res of responses) {
          if (!res.ok) {
            throw new Error(`HTTP error! status: ${res.status}`);
          }
          const contentType = res.headers.get("content-type");
          if (!contentType || !contentType.includes("application/json")) {
            throw new TypeError("Oops, we haven't got JSON!");
          }
        }
        const [quotesData, readingData, growthData, thoughtData] = await Promise.all(
          responses.map((res) => res.json())
        );
        setQuotes(quotesData);
        setReadingList(readingData);
        setGrowth(growthData);
        setThought(thoughtData);
      } catch (error) {
        console.error("Error fetching inspiration data, using fallbacks:", error);
        setQuotes([
          { id: "1", text: "The only way to do great work is to love what you do. If you haven't found it yet, keep looking.", author: "Steve Jobs", avatar: "https://picsum.photos/seed/jobs/100/100" },
          { id: "2", text: "Success is not final, failure is not fatal: it is the courage to continue that counts.", author: "Winston Churchill", avatar: "https://picsum.photos/seed/churchill/100/100" },
          { id: "3", text: "It's not whether you get knocked down, it's whether you get up.", author: "Vince Lombardi", avatar: "https://picsum.photos/seed/lombardi/100/100" }
        ]);
        setReadingList([
          { id: "1", title: "The Art of Resilience", description: "Learn how top performers build psychological safety and grit through intentional reflection.", category: "Reading List", coverImage: "https://images.unsplash.com/photo-1544947950-fa07a98d237f?auto=format&fit=crop&q=80&w=687" }
        ]);
        setGrowth({ overall: 72, knowledge: 85, consistency: 60 });
        setThought({
          quote: "If you don't really have a dream, you can't really push yourself.",
          author: "M.S. Dhoni",
          role: "Cricket Legend & Leader",
          avatar: "https://picsum.photos/seed/dhoni/100/100",
          background: "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&q=80&w=2070"
        });
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);
  if (loading) {
    return <div className="h-full flex items-center justify-center">
        <Loader2 className="animate-spin text-brand-blue" size={40} />
      </div>;
  }
  return <main className="p-4 md:p-8 space-y-6 md:space-y-8 max-w-7xl mx-auto">
      {
    /* Active Inspirational Mentor selector */
  }
      <MentorSelector />

      {
    /* Hero Card */
  }
      {thought && <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    className="relative h-[300px] md:h-[400px] rounded-2xl md:rounded-3xl overflow-hidden group shadow-2xl"
  >
          <img
    src={thought.background}
    alt="Hero Background"
    className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
  />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
          
          <div className="absolute inset-0 p-6 md:p-12 flex flex-col justify-end text-white max-w-2xl">
            <div className="mb-4 md:mb-6">
              <span className="bg-white/20 backdrop-blur-md px-3 py-1.5 rounded-full text-[8px] md:text-[10px] font-bold uppercase tracking-widest border border-white/30">
                Thought of the Day
              </span>
            </div>
            <h2 className="text-2xl md:text-5xl font-bold leading-tight mb-4 md:mb-8">
              "{thought.quote}"
            </h2>
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 rounded-full border-2 border-brand-blue overflow-hidden">
                <img src={thought.avatar} alt={thought.author} />
              </div>
              <div>
                <p className="font-bold text-lg">{thought.author}</p>
                <p className="text-white/60 text-xs uppercase tracking-widest">{thought.role}</p>
              </div>
            </div>
          </div>
        </motion.div>}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {
    /* Deep Focus Sanctuary */
  }
        <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay: 0.1 }}
    className="lg:col-span-2 bg-white rounded-2xl md:rounded-3xl p-6 md:p-10 shadow-sm border border-slate-100 flex flex-col justify-between"
  >
          <div className="flex justify-between items-start mb-6 md:mb-12">
            <div className="p-2 md:p-3 bg-slate-50 rounded-xl">
              <Sparkles className="text-slate-400 w-5 h-5 md:w-6 md:h-6" />
            </div>
            <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Sanctuary Mode</span>
          </div>
          
          <div>
            <h3 className="text-2xl md:text-4xl font-bold text-slate-900 mb-4">Deep Focus Sanctuary</h3>
            <p className="text-slate-500 max-w-md text-base md:text-lg leading-relaxed mb-6 md:mb-8">
              Enter a state of flow with curated ambient soundscapes and visual cues designed to minimize cognitive friction.
            </p>
          </div>
          
          <div className="flex items-center space-x-6">
            <button className="bg-brand-dark text-white px-8 py-4 rounded-xl font-bold shadow-lg shadow-brand-dark/20 hover:bg-brand-dark/90 transition-all flex items-center space-x-2">
              <Play size={18} fill="currentColor" />
              <span>Start Session</span>
            </button>
            <button className="text-slate-900 font-bold hover:text-brand-blue transition-colors">
              Explore Sounds
            </button>
          </div>
        </motion.div>

        {
    /* Growth Index Card */
  }
        {growth && <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay: 0.2 }}
    className="bg-brand-sidebar rounded-2xl md:rounded-3xl p-6 md:p-10 text-white relative overflow-hidden flex flex-col justify-between"
  >
            <div className="relative z-10">
              <p className="text-[10px] font-bold uppercase tracking-widest text-blue-400/80 mb-6 md:mb-8">Growth Index</p>
              <h4 className="text-4xl md:text-6xl font-bold mb-8 md:mb-12">{growth.overall}%</h4>
              
              <div className="space-y-6">
                <div className="space-y-2">
                  <div className="flex justify-between text-[10px] font-bold uppercase tracking-widest">
                    <span className="text-white/60">Knowledge Acquired</span>
                    <span>{growth.knowledge}%</span>
                  </div>
                  <div className="h-1.5 bg-white/10 rounded-full overflow-hidden">
                    <div className="h-full bg-brand-blue" style={{ width: `${growth.knowledge}%` }} />
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between text-[10px] font-bold uppercase tracking-widest">
                    <span className="text-white/60">Habit Consistency</span>
                    <span>{growth.consistency}%</span>
                  </div>
                  <div className="h-1.5 bg-white/10 rounded-full overflow-hidden">
                    <div className="h-full bg-slate-400" style={{ width: `${growth.consistency}%` }} />
                  </div>
                </div>
              </div>
            </div>
            
            <div className="absolute bottom-0 right-0 p-4 opacity-20">
              <svg width="120" height="80" viewBox="0 0 120 80" fill="none">
                <path d="M0 80C20 60 40 70 60 45C80 20 100 30 120 5" stroke="white" strokeWidth="4" />
              </svg>
            </div>
          </motion.div>}
      </div>

      {
    /* Quotes Section */
  }
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {quotes.map((q, i) => <motion.div
    key={q.id}
    initial={{ opacity: 0, scale: 0.95 }}
    animate={{ opacity: 1, scale: 1 }}
    transition={{ delay: i * 0.1 + 0.3 }}
    className="bg-white rounded-2xl md:rounded-3xl p-6 md:p-8 border border-slate-100 shadow-sm relative group hover:shadow-md transition-shadow"
  >
            <Quote className="text-blue-100 absolute top-6 left-6 md:top-8 md:left-8 w-8 h-8 md:w-12 md:h-12" />
            <div className="relative pt-6 md:pt-8 mb-6 md:mb-8 text-slate-700 italic leading-relaxed text-sm md:text-base">
              "{q.text}"
            </div>
            <div className="flex items-center space-x-3">
              <img src={q.avatar} alt={q.author} className="w-10 h-10 rounded-full grayscale group-hover:grayscale-0 transition-all" />
              <span className="font-bold text-sm text-slate-900">{q.author}</span>
            </div>
          </motion.div>)}
      </div>

      {
    /* Bottom Section */
  }
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {
    /* Reading List */
  }
        {readingList.map((item, i) => <motion.div
    key={item.id}
    initial={{ opacity: 0, x: -20 }}
    animate={{ opacity: 1, x: 0 }}
    transition={{ delay: 0.6 + i * 0.1 }}
    className="bg-white rounded-2xl md:rounded-3xl overflow-hidden flex flex-col md:flex-row shadow-sm border border-slate-100 h-auto md:h-80"
  >
            <div className="w-full md:w-1/3 bg-slate-900 p-6 md:p-8 flex items-center justify-center">
               <div className="relative w-24 md:w-full aspect-[3/4] bg-teal-100/20 rounded-xl flex items-center justify-center overflow-hidden">
                  <div className="absolute inset-0 bg-teal-500/20 blur-2xl" />
                  <img src={item.coverImage} alt={item.title} className="h-full w-full object-cover" />
               </div>
            </div>
            <div className="flex-1 p-6 md:p-10 flex flex-col justify-between">
              <div>
                <p className="text-[10px] font-bold uppercase tracking-widest text-teal-600 mb-2">{item.category}</p>
                <h4 className="text-xl md:text-2xl font-bold text-slate-900 mb-4">{item.title}</h4>
                <p className="text-slate-500 text-sm leading-relaxed mb-4 md:mb-6">
                  {item.description}
                </p>
              </div>
              <button className="text-slate-900 font-bold flex items-center space-x-2 group">
                <span>Read Full Insight</span>
                <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
              </button>
            </div>
          </motion.div>)}

        {
    /* Daily Affirmation */
  }
        <motion.div
    initial={{ opacity: 0, x: 20 }}
    animate={{ opacity: 1, x: 0 }}
    transition={{ delay: 0.6 }}
    className="bg-slate-50 rounded-2xl md:rounded-3xl p-6 md:p-10 flex flex-col items-center justify-center text-center shadow-sm border border-slate-100"
  >
          <div className="w-12 h-12 md:w-14 md:h-14 bg-white rounded-xl md:rounded-2xl flex items-center justify-center shadow-sm mb-6 md:mb-8">
            <Sparkles className="text-blue-400" size={24} />
          </div>
          <h4 className="text-2xl font-bold text-slate-900 mb-4">Daily Affirmation</h4>
          <p className="text-slate-500 italic max-w-sm mb-8">
            "I am focused, I am resilient, and I am capable of achieving my highest vision."
          </p>
          <div className="flex space-x-4">
            <button className="p-3 bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow text-slate-400 hover:text-brand-blue">
              <Share2 size={20} />
            </button>
            <button className="p-3 bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow text-slate-400 hover:text-red-500">
              <Heart size={20} />
            </button>
          </div>
        </motion.div>
      </div>


    </main>;
};
export default InspirationView;
