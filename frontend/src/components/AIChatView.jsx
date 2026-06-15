import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  Send,
  Loader2,
  Sparkles,
  User,
  Brain,
  RefreshCcw,
  Zap
} from "lucide-react";
import { cn } from "../lib/utils";
import { taskService } from "../services/taskService";
import { chatWithArchitect } from "../lib/gemini";
const AIChatView = () => {
  const [messages, setMessages] = useState([
    { role: "model", content: "Greetings. I am your Productivity Architect. I have analyzed your current blueprints. How can we optimize your structure today?" }
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [tasks, setTasks] = useState([]);
  const messagesEndRef = useRef(null);
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };
  useEffect(() => {
    scrollToBottom();
  }, [messages]);
  useEffect(() => {
    taskService.getMyTasks().then((res) => setTasks(res.content || []));
  }, []);
  const handleSend = async (e, customText) => {
    e?.preventDefault();
    const textToSend = customText || input;
    if (!textToSend.trim() || loading) return;
    const userMessage = textToSend.trim();
    if (!customText) {
      setInput("");
    }
    setMessages((prev) => [...prev, { role: "user", content: userMessage }]);
    setLoading(true);
    try {
      const history = messages.map((m) => ({
        role: m.role,
        parts: [{ text: m.content }]
      }));
      const response = await chatWithArchitect(userMessage, tasks, history);
      setMessages((prev) => [...prev, { role: "model", content: response }]);
    } catch (error) {
      console.error("Chat error:", error);
      setMessages((prev) => [...prev, {
        role: "model",
        content: "I encountered a minor structural failure in my logic. Please try again or rephrase your request."
      }]);
    } finally {
      setLoading(false);
    }
  };
  return <main className="h-full flex flex-col max-w-4xl mx-auto p-4 pb-28 md:p-8 space-y-4 md:space-y-6">
      <header className="flex items-center justify-between border-b border-editorial-border pb-4 md:pb-6">
        <div className="flex items-center space-x-3">
          <div className="p-2 md:p-3 bg-brand-blue/10 rounded-full">
            <Brain className="text-brand-blue w-5 h-5 md:w-6 md:h-6" />
          </div>
          <div>
            <h1 className="text-xl md:text-2xl font-serif italic text-editorial-ink">Architect Chat</h1>
            <p className="text-[8px] md:text-[10px] font-mono uppercase tracking-widest text-editorial-muted">Conversation with your digital strategist</p>
          </div>
        </div>
        
        <button
    onClick={() => setMessages([{ role: "model", content: "Blueprint reset. New cycle initiated. How shall we proceed?" }])}
    className="p-2 hover:bg-editorial-muted/10 rounded-sm text-editorial-muted transition-colors"
    title="Reset Conversation"
  >
          <RefreshCcw size={18} />
        </button>
      </header>

      <div className="flex-1 overflow-y-auto custom-scrollbar p-2 space-y-8 min-h-0">
        <AnimatePresence initial={false}>
          {messages.map((message, index) => <motion.div
    key={index}
    initial={{ opacity: 0, y: 10 }}
    animate={{ opacity: 1, y: 0 }}
    className={cn(
      "flex space-x-2 md:space-x-4 max-w-[95%] md:max-w-[85%]",
      message.role === "user" ? "ml-auto flex-row-reverse space-x-reverse text-right" : "mr-auto"
    )}
  >
              <div className={cn(
    "w-7 h-7 md:w-8 md:h-8 rounded-full flex items-center justify-center shrink-0 mt-1 shadow-sm",
    message.role === "user" ? "bg-editorial-ink text-white" : "bg-brand-blue text-white"
  )}>
                {message.role === "user" ? <User className="w-3.5 h-3.5 md:w-4 md:h-4" /> : <Sparkles className="w-3.5 h-3.5 md:w-4 md:h-4" />}
              </div>
              
              <div className="space-y-1">
                 <div className={cn(
    "p-3 md:p-5 rounded-sm border",
    message.role === "user" ? "bg-editorial-paper border-editorial-ink/10 font-serif text-base md:text-lg text-editorial-ink" : "bg-white border-brand-blue/10 font-serif text-base md:text-lg text-editorial-ink shadow-sm"
  )}>
                   {message.content}
                 </div>
                 <p className="font-mono text-[8px] uppercase tracking-widest text-editorial-muted">
                   {message.role === "user" ? "Collaborator" : "The Architect"}
                 </p>
              </div>
            </motion.div>)}
        </AnimatePresence>
        
        {loading && <div className="flex space-x-4 items-center animate-pulse mr-auto">
             <div className="w-8 h-8 rounded-full bg-brand-blue/20 flex items-center justify-center">
                <Loader2 size={14} className="animate-spin text-brand-blue" />
             </div>
             <p className="font-serif italic text-editorial-muted">Thinking...</p>
          </div>}
        <div ref={messagesEndRef} />
      </div>

      <div className="pt-4 border-t border-editorial-border sticky bottom-0 bg-editorial-paper/80 backdrop-blur-md">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mb-4">
            {["Prioritize my day", "Roadmap check", "Organization help", "Growth mindset"].map((suggestion) => <button
    key={suggestion}
    onClick={() => handleSend(void 0, suggestion)}
    className="px-3 py-1.5 border border-editorial-border hover:border-brand-blue/30 text-[9px] font-mono uppercase tracking-widest text-editorial-muted hover:text-brand-blue transition-all bg-white rounded-full text-center truncate"
  >
                {suggestion}
              </button>)}
        </div>

        <form onSubmit={handleSend} className="relative group">
          <input
    type="text"
    value={input}
    onChange={(e) => setInput(e.target.value)}
    disabled={loading}
    placeholder="Type your strategic query..."
    className="w-full bg-white border border-editorial-border py-4 pl-4 md:pl-6 pr-14 rounded-sm font-serif italic text-base md:text-lg outline-none focus:border-brand-blue/50 transition-all shadow-sm focus:shadow-md"
  />
          <button
    type="submit"
    disabled={!input.trim() || loading}
    className="absolute right-3 top-1/2 -translate-y-1/2 p-2.5 bg-editorial-ink text-white rounded-sm hover:bg-brand-blue transition-all disabled:opacity-30 flex items-center justify-center z-10"
  >
            {loading ? <Loader2 size={18} className="animate-spin" /> : <Send size={18} />}
          </button>
        </form>
        
        <div className="flex items-center justify-center space-x-2 mt-4 pt-2">
           <Zap size={10} className="text-editorial-accent" />
           <p className="text-[8px] font-mono uppercase tracking-[0.2em] text-editorial-muted">
             Neural Engine Engaged • Contextually Aware of {tasks.length} tasks
           </p>
        </div>
      </div>
    </main>;
};
export default AIChatView;
