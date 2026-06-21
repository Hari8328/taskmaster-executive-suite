import { useState } from "react";
import { motion } from "motion/react";
import { authService } from "../services/authService";
import { Loader2, Sparkles } from "lucide-react";
const Login = ({ onLogin }) => {
  const [isLogin, setIsLogin] = useState(true);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    if (!isLogin) {
      if (username.trim().length < 3) {
        setError("Username must be at least 3 characters long");
        setLoading(false);
        return;
      }
      if (password.length < 6) {
        setError("Password must be at least 6 characters long");
        setLoading(false);
        return;
      }
    }
    try {
      if (isLogin) {
        await authService.login(username, password);
      } else {
        await authService.register(username, password);
        await authService.login(username, password);
      }
      onLogin();
    } catch (err) {
      let msg = err.response?.data?.message || err.response?.data || "Authentication failed";
      if (typeof msg === "string" && msg.trim().startsWith("<!DOCTYPE")) {
        msg = "Authentication failed: Network connection interrupted. Please ensure you bypass the ngrok warning first.";
      }
      setError(msg);
    } finally {
      setLoading(false);
    }
  };
  return <div className="min-h-screen flex items-center justify-center bg-brand-dark p-6">
      <motion.div
    initial={{ opacity: 0, scale: 0.9 }}
    animate={{ opacity: 1, scale: 1 }}
    className="w-full max-w-md bg-brand-sidebar p-10 rounded-3xl shadow-2xl border border-white/5"
  >
        <div className="flex justify-center mb-8">
          <div className="w-16 h-16 bg-brand-blue rounded-2xl flex items-center justify-center shadow-lg transform -rotate-6">
            <Sparkles className="text-white" size={32} />
          </div>
        </div>

        <h2 className="text-3xl font-bold text-white text-center mb-2">
          {isLogin ? "Welcome Back" : "Create Account"}
        </h2>
        <p className="text-slate-400 text-center mb-8 text-sm">
          {isLogin ? "Sign in to access your dashboard" : "Join TaskMaster today"}
        </p>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-xs font-bold uppercase tracking-widest text-slate-500 mb-2">Username</label>
            <input
    type="text"
    value={username}
    onChange={(e) => setUsername(e.target.value)}
    className="w-full bg-black/20 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-brand-blue"
    placeholder="admin or user"
    required
  />
          </div>
          <div>
            <label className="block text-xs font-bold uppercase tracking-widest text-slate-500 mb-2">Password</label>
            <input
    type="password"
    value={password}
    onChange={(e) => setPassword(e.target.value)}
    className="w-full bg-black/20 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-brand-blue"
    placeholder="••••••••"
    required
  />
          </div>

          {error && <p className="text-red-400 text-xs text-center">{error}</p>}

          <button
    type="submit"
    disabled={loading}
    className="w-full bg-brand-blue text-white font-bold py-4 rounded-xl hover:bg-blue-600 transition-colors flex items-center justify-center"
  >
            {loading ? <Loader2 className="animate-spin" size={20} /> : isLogin ? "Sign In" : "Sign Up"}
          </button>
        </form>

        <div className="mt-8 text-center">
          <button
    onClick={() => setIsLogin(!isLogin)}
    className="text-slate-400 text-sm hover:text-white transition-colors"
  >
            {isLogin ? "Don't have an account? Sign up" : "Already have an account? Sign in"}
          </button>
        </div>
      </motion.div>
    </div>;
};
export default Login;
