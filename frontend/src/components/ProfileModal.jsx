import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  X,
  User as UserIcon,
  Mail,
  Image as ImageIcon,
  AlignLeft,
  Save,
  Loader2,
  Phone,
  Settings,
  LogOut,
  Volume2,
  VolumeX,
  Sun,
  Moon,
  Eye,
  HelpCircle,
  Upload
} from "lucide-react";
import { authService } from "../services/authService";
import { cn } from "../lib/utils";
const ProfileModal = ({
  isOpen,
  onClose,
  onUpdate,
  onLogout,
  theme,
  onThemeChange
}) => {
  const [activeTab, setActiveTab] = useState("profile");
  const [profile, setProfile] = useState(null);
  const [displayName, setDisplayName] = useState("");
  const [email, setEmail] = useState("");
  const [avatarUrl, setAvatarUrl] = useState("");
  const [bio, setBio] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const fileInputRef = useRef(null);
  const [uploading, setUploading] = useState(false);
  const handleFileChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      setError("Only image files are allowed");
      return;
    }
    setUploading(true);
    setError("");
    try {
      const url = await authService.uploadAvatar(file);
      setAvatarUrl(url);
      window.dispatchEvent(new CustomEvent("profile-updated"));
      if (onUpdate) onUpdate();
    } catch (err) {
      setError(err.response?.data?.message || "Failed to upload image");
    } finally {
      setUploading(false);
    }
  };
  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };
  const [soundEnabled, setSoundEnabled] = useState(() => {
    const saved = localStorage.getItem("notification_sound_enabled");
    return saved === null ? true : saved === "true";
  });
  useEffect(() => {
    if (isOpen) {
      fetchProfile();
      const saved = localStorage.getItem("notification_sound_enabled");
      setSoundEnabled(saved === null ? true : saved === "true");
    }
  }, [isOpen]);
  const fetchProfile = async () => {
    setLoading(true);
    try {
      const data = await authService.getProfile();
      setProfile(data);
      setDisplayName(data.displayName || "");
      setEmail(data.email || "");
      setAvatarUrl(data.avatarUrl || "");
      setBio(data.bio || "");
      setPhoneNumber(data.phoneNumber || "");
    } catch (err) {
      setError("Failed to load profile");
    } finally {
      setLoading(false);
    }
  };
  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError("");
    try {
      await authService.updateProfile({
        displayName,
        email,
        avatarUrl,
        bio,
        phoneNumber
      });
      window.dispatchEvent(new CustomEvent("profile-updated"));
      if (onUpdate) onUpdate();
      onClose();
    } catch (err) {
      setError("Failed to save profile");
    } finally {
      setSaving(false);
    }
  };
  const toggleSound = () => {
    const nextSound = !soundEnabled;
    setSoundEnabled(nextSound);
    localStorage.setItem("notification_sound_enabled", String(nextSound));
    window.dispatchEvent(new CustomEvent("notification-sound-updated", { detail: nextSound }));
  };
  const handleLogoutClick = () => {
    authService.logout();
    if (onLogout) {
      onLogout();
    }
    onClose();
  };
  if (!isOpen) return null;
  return <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <motion.div
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    exit={{ opacity: 0 }}
    onClick={onClose}
    className="absolute inset-0 bg-editorial-ink/40 backdrop-blur-sm"
  />
        
        <motion.div
    initial={{ opacity: 0, scale: 0.95, y: 20 }}
    animate={{ opacity: 1, scale: 1, y: 0 }}
    exit={{ opacity: 0, scale: 0.95, y: 20 }}
    className="relative w-full max-w-lg bg-editorial-paper p-8 shadow-2xl border border-editorial-border max-h-[90vh] flex flex-col"
  >
          <button
    onClick={onClose}
    type="button"
    className="absolute right-6 top-6 p-2 text-editorial-muted hover:text-editorial-ink transition-colors z-10"
  >
            <X size={20} />
          </button>

          <div className="mb-6 shrink-0 text-left">
            <h2 className="text-3xl font-serif">Account Desk</h2>
            <p className="font-mono text-[10px] uppercase tracking-widest text-editorial-muted mt-2">Manage your identity & workspace settings</p>
          </div>

          {
    /* Navigation Tabs for Profile vs Settings */
  }
          <div className="flex border-b border-editorial-border mb-6 shrink-0">
            <button
    onClick={() => setActiveTab("profile")}
    type="button"
    className={cn(
      "pb-3 text-xs font-mono uppercase tracking-widest font-bold border-b-2 mr-6 transition-all",
      activeTab === "profile" ? "border-editorial-ink text-editorial-ink" : "border-transparent text-editorial-muted hover:text-editorial-ink"
    )}
  >
              Profile
            </button>
            <button
    onClick={() => setActiveTab("settings")}
    type="button"
    className={cn(
      "pb-3 text-xs font-mono uppercase tracking-widest font-bold border-b-2 transition-all flex items-center space-x-1.5",
      activeTab === "settings" ? "border-editorial-ink text-editorial-ink" : "border-transparent text-editorial-muted hover:text-editorial-ink"
    )}
  >
              <Settings size={12} />
              <span>Workspace Settings</span>
            </button>
          </div>

          {
    /* Content Scrollable Container */
  }
          <div className="overflow-y-auto flex-1 pr-1 custom-scrollbar text-left">
            {loading ? <div className="flex flex-col items-center justify-center py-12 space-y-4">
                <Loader2 className="animate-spin text-editorial-accent" size={32} />
                <p className="font-mono text-[10px] uppercase text-editorial-muted">Synchronizing Profile...</p>
              </div> : activeTab === "profile" ? <form onSubmit={handleSave} className="space-y-6">
                <div className="flex flex-col items-center justify-center mb-6 space-y-3">
                  <div className="relative group cursor-pointer" onClick={triggerFileInput}>
                    <div className="w-20 h-20 rounded-full border-2 border-editorial-border overflow-hidden bg-editorial-muted/10 flex items-center justify-center relative">
                      {avatarUrl ? <img src={avatarUrl} alt="Avatar" className="w-full h-full object-cover" /> : <UserIcon size={28} className="text-editorial-muted" />}
                      
                      {
    /* Upload Hover Overlay */
  }
                      <div className="absolute inset-0 bg-editorial-ink/60 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                        {uploading ? <Loader2 className="animate-spin text-white" size={18} /> : <Upload className="text-white" size={18} />}
                      </div>
                    </div>
                  </div>
                  
                  <input
    type="file"
    ref={fileInputRef}
    onChange={handleFileChange}
    accept="image/*"
    className="hidden"
  />
                  
                  <button
    type="button"
    onClick={triggerFileInput}
    disabled={uploading}
    className="text-[10px] font-mono uppercase tracking-widest text-brand-blue font-bold hover:text-blue-600 transition-colors flex items-center space-x-1"
  >
                    {uploading ? <>
                        <Loader2 className="animate-spin" size={10} />
                        <span>Uploading...</span>
                      </> : <>
                        <Upload size={10} />
                        <span>Upload Photo</span>
                      </>}
                  </button>
                </div>

                <div className="space-y-5">
                  <div className="space-y-1.5">
                    <label className="font-mono text-[10px] uppercase text-editorial-muted flex items-center space-x-2">
                      <UserIcon size={12} />
                      <span>Display Name</span>
                    </label>
                    <input
    type="text"
    placeholder="Enter your name"
    value={displayName}
    onChange={(e) => setDisplayName(e.target.value)}
    className="w-full bg-transparent border-b border-editorial-border py-1 text-base font-serif focus:outline-none focus:border-editorial-ink transition-colors"
  />
                  </div>

                  <div className="space-y-1.5">
                    <label className="font-mono text-[10px] uppercase text-editorial-muted flex items-center space-x-2">
                      <Mail size={12} />
                      <span>Email Address</span>
                    </label>
                    <input
    type="email"
    placeholder="your@email.com"
    value={email}
    onChange={(e) => setEmail(e.target.value)}
    className="w-full bg-transparent border-b border-editorial-border py-1 text-sm font-mono focus:outline-none focus:border-editorial-ink transition-colors"
  />
                  </div>

                  <div className="space-y-1.5">
                    <label className="font-mono text-[10px] uppercase text-editorial-muted flex items-center space-x-2">
                      <Phone size={12} />
                      <span>Mobile Number</span>
                    </label>
                    <input
    type="tel"
    placeholder="Enter phone number"
    value={phoneNumber}
    onChange={(e) => setPhoneNumber(e.target.value)}
    className="w-full bg-transparent border-b border-editorial-border py-1 text-sm font-mono focus:outline-none focus:border-editorial-ink transition-colors"
  />
                  </div>

                  <div className="space-y-1.5">
                    <label className="font-mono text-[10px] uppercase text-editorial-muted flex items-center space-x-2">
                      <ImageIcon size={12} />
                      <span>Avatar URL</span>
                    </label>
                    <input
    type="text"
    placeholder="https://example.com/photo.jpg"
    value={avatarUrl}
    onChange={(e) => setAvatarUrl(e.target.value)}
    className="w-full bg-transparent border-b border-editorial-border py-1 text-sm font-mono focus:outline-none focus:border-editorial-ink transition-colors"
  />
                  </div>

                  <div className="space-y-1.5">
                    <label className="font-mono text-[10px] uppercase text-editorial-muted flex items-center space-x-2">
                      <AlignLeft size={12} />
                      <span>Bio</span>
                    </label>
                    <textarea
    placeholder="Tell us a bit about yourself..."
    value={bio}
    onChange={(e) => setBio(e.target.value)}
    rows={3}
    className="w-full bg-transparent border border-editorial-border p-3 text-sm font-serif focus:outline-none focus:border-editorial-ink transition-colors resize-none"
  />
                  </div>
                </div>

                {error && <p className="text-red-500 text-[10px] font-mono uppercase">{error}</p>}

                <button
    type="submit"
    disabled={saving}
    className="w-full bg-editorial-ink text-editorial-paper py-3.5 flex items-center justify-center space-x-3 hover:opacity-90 transition-all font-mono text-xs uppercase tracking-widest disabled:opacity-50 shadow-md"
  >
                  {saving ? <Loader2 className="animate-spin" size={16} /> : <Save size={16} />}
                  <span>{saving ? "Saving Changes..." : "Update Profile"}</span>
                </button>
              </form> : <div className="space-y-6 py-2">
                {
    /* 1. Notification Sound Setting */
  }
                <div className="bg-editorial-muted/5 border border-editorial-border/30 p-4 rounded-2xl flex flex-col justify-between sm:flex-row sm:items-center gap-4">
                  <div>
                    <h4 className="text-sm font-serif italic text-editorial-ink font-bold flex items-center space-x-1.5">
                      {soundEnabled ? <Volume2 size={15} className="text-emerald-500" /> : <VolumeX size={15} className="text-red-500" />}
                      <span>Audible Notifications</span>
                    </h4>
                    <p className="text-[10px] text-editorial-muted mt-0.5">Toggle notification sounds for task reminders and deep-focus completions</p>
                  </div>
                  <button
    onClick={toggleSound}
    type="button"
    className={cn(
      "px-3 py-1.5 border text-[10px] font-mono transition-all rounded-xl select-none text-center self-start sm:self-auto",
      soundEnabled ? "border-emerald-500/30 bg-emerald-50 text-emerald-600 font-bold" : "border-slate-300 text-slate-500 hover:border-slate-400"
    )}
  >
                    {soundEnabled ? "ALERT SOUND ON" : "MUTED"}
                  </button>
                </div>

                {
    /* 2. Theme Selection Grid */
  }
                {onThemeChange && theme && <div className="bg-editorial-muted/5 border border-editorial-border/30 p-4 rounded-2xl">
                    <h4 className="text-sm font-serif italic text-editorial-ink font-bold mb-3 flex items-center space-x-1.5">
                      <Sun size={15} className="text-amber-500" />
                      <span>Interface Theme</span>
                    </h4>
                    <div className="grid grid-cols-3 gap-3">
                      {[
    { id: "light", icon: Sun, label: "Bright" },
    { id: "dark", icon: Moon, label: "Dark" },
    { id: "eye", icon: Eye, label: "Eye Comfort" }
  ].map((t) => <button
    key={t.id}
    type="button"
    onClick={() => onThemeChange(t.id)}
    className={cn(
      "flex flex-col items-center justify-center p-3 rounded-xl transition-all border text-center",
      theme === t.id ? "bg-white border-editorial-ink text-editorial-ink shadow-sm" : "border-editorial-border/40 text-editorial-muted hover:text-editorial-ink hover:bg-white/40"
    )}
  >
                          <t.icon size={16} className={cn(theme === t.id ? "text-editorial-accent" : "")} />
                          <span className="text-[9px] mt-1.5 uppercase font-mono font-bold tracking-tighter">{t.label}</span>
                        </button>)}
                    </div>
                  </div>}

                {
    /* 3. General Help Section */
  }
                <div className="bg-editorial-muted/5 border border-editorial-border/30 p-4 rounded-2xl">
                  <h4 className="text-sm font-serif italic text-editorial-ink font-bold flex items-center space-x-1.5">
                    <HelpCircle size={15} className="text-sky-500" />
                    <span>Workspace Keyboard Shortcuts</span>
                  </h4>
                  <p className="text-[10px] text-editorial-muted mt-1 leading-relaxed">
                    Press <kbd className="px-1.5 py-0.5 bg-slate-100 border rounded font-mono text-[9px] font-bold mx-0.5">K</kbd> to unlock the floating hotkey command dashboard list. Navigate easily using keyboard directives.
                  </p>
                </div>

                {
    /* 4. Action Area with Secure Logout */
  }
                <div className="pt-8 border-t border-editorial-border/60">
                  <button
    onClick={handleLogoutClick}
    type="button"
    className="w-full border border-red-200 bg-red-50 hover:bg-red-100/50 text-red-600 hover:text-red-700 py-3.5 flex items-center justify-center space-x-2 rounded-xl transition-all font-mono text-xs uppercase tracking-widest shadow-sm"
  >
                    <LogOut size={16} />
                    <span>Logout Of Account</span>
                  </button>
                  <p className="text-[10px] text-zinc-400 text-center mt-2 leading-tight">
                    Securely logs you out of the current device session and clears local auth tokens.
                  </p>
                </div>
              </div>}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>;
};
export default ProfileModal;
