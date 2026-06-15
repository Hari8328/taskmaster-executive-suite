import { useState, useEffect } from "react";
import { cn } from "./lib/utils";
import Sidebar from "./components/Sidebar";
import Header from "./components/Header";
import Dashboard from "./components/Dashboard";
import ProjectsView from "./components/ProjectsView";
import TasksView from "./components/TasksView";
import Inspiration from "./components/InspirationView";
import SuggestionsView from "./components/SuggestionsView";
import RoadmapView from "./components/RoadmapView";
import AIChatView from "./components/AIChatView";
import FocusLogsView from "./components/FocusLogsView";
import AdminConsoleView from "./components/AdminConsoleView";
import Login from "./components/Login";
import TaskFormModal from "./components/TaskFormModal";
import HelpModal from "./components/HelpModal";
import ProfileModal from "./components/ProfileModal";
import MobileNav from "./components/MobileNav";
import { authService } from "./services/authService";
import CelebrationOverlay from "./components/CelebrationOverlay";
import KeyboardShortcuts from "./components/KeyboardShortcuts";
export default function App() {
  const [currentView, setCurrentView] = useState("dashboard");
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isInitializing, setIsInitializing] = useState(true);
  const [isTaskFormOpen, setIsTaskFormOpen] = useState(false);
  const [isHelpOpen, setIsHelpOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [theme, setTheme] = useState(() => {
    return localStorage.getItem("theme") || "light";
  });
  const [isDeepFocusActive, setIsDeepFocusActive] = useState(false);
  useEffect(() => {
    setIsAuthenticated(authService.isAuthenticated());
    setIsInitializing(false);
  }, []);
  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
    localStorage.setItem("theme", theme);
  }, [theme]);
  useEffect(() => {
    const handleDeepFocus = (e) => {
      const customEvent = e;
      setIsDeepFocusActive(!!customEvent.detail?.active);
    };
    window.addEventListener("toggle-deep-focus", handleDeepFocus);
    return () => {
      window.removeEventListener("toggle-deep-focus", handleDeepFocus);
    };
  }, []);
  if (isInitializing) return null;
  if (!isAuthenticated) {
    return <Login onLogin={() => setIsAuthenticated(true)} />;
  }
  const handleTaskSuccess = () => {
    setRefreshTrigger((prev) => prev + 1);
  };
  return <div className="flex h-screen bg-editorial-paper text-editorial-ink selection:bg-editorial-accent/30 overflow-hidden font-sans">
      {!isDeepFocusActive && <Sidebar
    currentView={currentView}
    onViewChange={setCurrentView}
    onNewTask={() => setIsTaskFormOpen(true)}
    onHelp={() => setIsHelpOpen(true)}
    onProfileOpen={() => setIsProfileOpen(true)}
    theme={theme}
    onThemeChange={setTheme}
  />}
      <div className="flex-1 flex flex-col h-full overflow-hidden">
        {!isDeepFocusActive && <Header
    currentView={currentView}
    onViewChange={setCurrentView}
    onNewTask={() => setIsTaskFormOpen(true)}
    onProfileOpen={() => setIsProfileOpen(true)}
    onHelp={() => setIsHelpOpen(true)}
  />}
        <div className={cn(
    "flex-1 overflow-x-hidden relative custom-scrollbar",
    currentView === "chat" ? "h-full overflow-hidden" : "overflow-y-auto pb-32 lg:pb-0"
  )}>
          {currentView === "dashboard" && <Dashboard refreshTrigger={refreshTrigger} onViewChange={setCurrentView} />}
          {currentView === "projects" && <ProjectsView refreshTrigger={refreshTrigger} />}
          {currentView === "tasks" && <TasksView refreshTrigger={refreshTrigger} />}
          {currentView === "inspiration" && <Inspiration />}
          {currentView === "suggestions" && <SuggestionsView />}
          {currentView === "roadmap" && <RoadmapView />}
          {currentView === "chat" && <AIChatView />}
          {currentView === "logs" && <FocusLogsView />}
          {currentView === "admin" && <AdminConsoleView />}
        </div>
      </div>
      <TaskFormModal
    task={null}
    isOpen={isTaskFormOpen}
    onClose={() => setIsTaskFormOpen(false)}
    onSuccess={handleTaskSuccess}
  />
      <HelpModal
    isOpen={isHelpOpen}
    onClose={() => setIsHelpOpen(false)}
  />
      <ProfileModal
    isOpen={isProfileOpen}
    onClose={() => setIsProfileOpen(false)}
    theme={theme}
    onThemeChange={setTheme}
    onLogout={() => setIsAuthenticated(false)}
  />
      {!isDeepFocusActive && <MobileNav
    currentView={currentView}
    onViewChange={setCurrentView}
    onNewTask={() => setIsTaskFormOpen(true)}
  />}
      <CelebrationOverlay />
      <KeyboardShortcuts
    currentView={currentView}
    onViewChange={setCurrentView}
    onNewTask={() => setIsTaskFormOpen(true)}
    isDeepFocusActive={isDeepFocusActive}
  />
    </div>;
}
