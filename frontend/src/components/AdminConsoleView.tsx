import React, { useEffect, useState } from 'react';
import { motion } from 'motion/react';
import { 
  User as UserIcon, 
  Mail, 
  Shield, 
  Activity, 
  Search,
  UserCheck
} from 'lucide-react';
import { authService } from '../services/authService';
import { taskService } from '../services/taskService';
import { Task } from '../types';

export default function AdminConsoleView() {
  const [users, setUsers] = useState<any[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loadingUsers, setLoadingUsers] = useState(true);
  const [loadingTasks, setLoadingTasks] = useState(true);
  const [activeTab, setActiveTab] = useState<'users' | 'tasks'>('users');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedUser, setSelectedUser] = useState<any | null>(null);
  const [userTasks, setUserTasks] = useState<Task[]>([]);

  useEffect(() => {
    fetchUsers();
    fetchTasks();
  }, []);

  const fetchUsers = async () => {
    setLoadingUsers(true);
    try {
      const data = await authService.getAllUsersAdmin();
      setUsers(data || []);
    } catch (e) {
      console.error("Failed to fetch admin users list:", e);
    } finally {
      setLoadingUsers(false);
    }
  };

  const fetchTasks = async () => {
    setLoadingTasks(true);
    try {
      const data = await taskService.getAllTasksAdmin(0, 1000);
      setTasks(data.content || []);
    } catch (e) {
      console.error("Failed to fetch admin tasks list:", e);
    } finally {
      setLoadingTasks(false);
    }
  };

  const handleUserClick = (user: any) => {
    setSelectedUser(user);
    // Filter master task list for this specific user
    const filtered = tasks.filter((t: any) => t.User?.id === user.id);
    setUserTasks(filtered);
  };

  const filteredUsers = users.filter(u => 
    u.username?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    u.displayName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    u.email?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredTasks = tasks.filter(t => 
    t.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    t.category?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (t as any).User?.username?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="p-6 md:p-10 space-y-8 min-h-screen bg-editorial-paper text-editorial-ink pb-32">
      {/* Title */}
      <div className="border-b border-editorial-accent/10 pb-6">
        <h1 className="text-4xl font-serif italic text-editorial-ink tracking-tight flex items-center space-x-3">
          <Shield className="text-brand-blue" size={32} />
          <span>Admin Console</span>
        </h1>
        <p className="text-xs font-mono uppercase tracking-[0.2em] text-editorial-muted mt-2">
          Trace users, query task structures, and audit system performance metrics.
        </p>
      </div>

      {/* Tabs and Search */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-editorial-accent/5 pb-4">
        <div className="flex space-x-2">
          <button
            onClick={() => { setActiveTab('users'); setSearchQuery(''); setSelectedUser(null); }}
            className={`px-6 py-2.5 rounded-xl text-xs uppercase tracking-widest font-bold transition-all ${
              activeTab === 'users' 
                ? 'bg-editorial-ink text-white shadow-sm' 
                : 'text-editorial-muted hover:bg-editorial-ink/5'
            }`}
          >
            User Profiles ({users.length})
          </button>
          <button
            onClick={() => { setActiveTab('tasks'); setSearchQuery(''); setSelectedUser(null); }}
            className={`px-6 py-2.5 rounded-xl text-xs uppercase tracking-widest font-bold transition-all ${
              activeTab === 'tasks' 
                ? 'bg-editorial-ink text-white shadow-sm' 
                : 'text-editorial-muted hover:bg-editorial-ink/5'
            }`}
          >
            All System Tasks ({tasks.length})
          </button>
        </div>

        <div className="relative w-full md:w-80">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-editorial-muted" size={16} />
          <input
            type="text"
            placeholder={activeTab === 'users' ? "Search users by name..." : "Search tasks by title, owner..."}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-editorial-ink/[0.02] border border-editorial-accent/15 rounded-xl pl-10 pr-4 py-2 text-sm focus:outline-none focus:border-brand-blue/50 transition-all font-mono placeholder:text-editorial-muted/50"
          />
        </div>
      </div>

      {/* Content */}
      {activeTab === 'users' ? (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
          {/* Users List Column */}
          <div className="lg:col-span-2 space-y-4">
            <h2 className="text-lg font-serif italic text-editorial-ink border-b border-editorial-accent/5 pb-2">Registered Users</h2>
            {loadingUsers ? (
              <p className="text-sm font-mono text-editorial-muted py-8">Auditing user records...</p>
            ) : filteredUsers.length === 0 ? (
              <p className="text-sm font-mono text-editorial-muted py-8">No users matched search criteria.</p>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {filteredUsers.map((u) => (
                  <motion.div
                    key={u.id}
                    layoutId={`user-card-${u.id}`}
                    onClick={() => handleUserClick(u)}
                    className={`p-5 rounded-2xl border transition-all cursor-pointer text-left hover:shadow-md ${
                      selectedUser?.id === u.id 
                        ? 'border-brand-blue bg-brand-blue/[0.02] shadow-sm' 
                        : 'border-editorial-accent/10 hover:border-editorial-accent/25'
                    }`}
                  >
                    <div className="flex items-center space-x-3">
                      {u.avatarUrl ? (
                        <img src={u.avatarUrl} alt="Avatar" className="w-10 h-10 rounded-xl object-cover" />
                      ) : (
                        <div className="w-10 h-10 rounded-xl bg-editorial-ink/5 flex items-center justify-center text-editorial-muted">
                          <UserIcon size={18} />
                        </div>
                      )}
                      <div>
                        <h3 className="font-bold text-sm text-editorial-ink">{u.displayName || u.username}</h3>
                        <p className="text-xs font-mono text-editorial-muted">@{u.username}</p>
                      </div>
                    </div>

                    <div className="mt-4 space-y-2 text-xs border-t border-editorial-accent/5 pt-3">
                      <div className="flex items-center space-x-2 text-editorial-muted">
                        <Mail size={12} />
                        <span className="truncate">{u.email || 'No email attached'}</span>
                      </div>
                      <div className="flex items-center space-x-2 text-editorial-muted">
                        <UserCheck size={12} />
                        <span className="font-mono">{u.roles || 'ROLE_USER'}</span>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </div>

          {/* User Tasks Drawer Column */}
          <div className="bg-editorial-ink/[0.01] border border-editorial-accent/10 rounded-3xl p-6 space-y-6">
            {selectedUser ? (
              <>
                <div className="border-b border-editorial-accent/10 pb-4">
                  <h3 className="text-xl font-serif italic text-editorial-ink">{selectedUser.displayName || selectedUser.username}'s Suite</h3>
                  <p className="text-xs font-mono text-editorial-muted mt-1">Status overview and task listings.</p>
                </div>

                <div className="grid grid-cols-3 gap-2 text-center text-xs font-mono">
                  <div className="bg-white p-3 rounded-xl border border-editorial-accent/5">
                    <span className="block text-lg font-bold text-editorial-ink">
                      {userTasks.filter(t => t.status === 'TODO').length}
                    </span>
                    <span className="text-[9px] uppercase tracking-wider text-editorial-muted">To Do</span>
                  </div>
                  <div className="bg-white p-3 rounded-xl border border-editorial-accent/5">
                    <span className="block text-lg font-bold text-brand-blue">
                      {userTasks.filter(t => t.status === 'IN_PROGRESS' || t.status === 'IN-PROGRESS').length}
                    </span>
                    <span className="text-[9px] uppercase tracking-wider text-editorial-muted">Active</span>
                  </div>
                  <div className="bg-white p-3 rounded-xl border border-editorial-accent/5">
                    <span className="block text-lg font-bold text-editorial-ink/40">
                      {userTasks.filter(t => t.status === 'COMPLETED').length}
                    </span>
                    <span className="text-[9px] uppercase tracking-wider text-editorial-muted">Done</span>
                  </div>
                </div>

                <div className="space-y-3">
                  <h4 className="text-xs uppercase tracking-widest font-bold text-editorial-muted px-1">Task List ({userTasks.length})</h4>
                  {userTasks.length === 0 ? (
                    <p className="text-xs font-mono text-editorial-muted italic py-4">No tasks found for this user.</p>
                  ) : (
                    <div className="space-y-2 max-h-[400px] overflow-y-auto custom-scrollbar pr-1">
                      {userTasks.map((t) => (
                        <div key={t.id} className="bg-white p-3 rounded-xl border border-editorial-accent/5 flex items-center justify-between text-left">
                          <div className="truncate pr-2">
                            <span className="block text-xs font-bold text-editorial-ink truncate">{t.title}</span>
                            <span className="text-[10px] text-editorial-muted font-mono">{t.category || 'General'}</span>
                          </div>
                          <span className={`text-[9px] font-mono uppercase px-2 py-0.5 rounded-full shrink-0 ${
                            t.status === 'COMPLETED' 
                              ? 'bg-editorial-ink/5 text-editorial-ink/50' 
                              : t.status === 'IN_PROGRESS' || t.status === 'IN-PROGRESS'
                              ? 'bg-brand-blue/10 text-brand-blue'
                              : 'bg-editorial-accent/10 text-editorial-ink'
                          }`}>
                            {t.status}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </>
            ) : (
              <div className="text-center py-16 space-y-4">
                <div className="w-12 h-12 rounded-2xl bg-editorial-ink/5 mx-auto flex items-center justify-center text-editorial-muted">
                  <Activity size={20} />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-editorial-ink">Select a User</h3>
                  <p className="text-xs text-editorial-muted max-w-[200px] mx-auto mt-1">Click on a user profile card to view their active task distributions.</p>
                </div>
              </div>
            )}
          </div>
        </div>
      ) : (
        /* Tasks Master List Tab */
        <div className="space-y-4">
          <h2 className="text-lg font-serif italic text-editorial-ink border-b border-editorial-accent/5 pb-2">Master Task Registry</h2>
          {loadingTasks ? (
            <p className="text-sm font-mono text-editorial-muted py-8">Scanning master databases...</p>
          ) : filteredTasks.length === 0 ? (
            <p className="text-sm font-mono text-editorial-muted py-8">No tasks matched search query.</p>
          ) : (
            <div className="overflow-x-auto border border-editorial-accent/10 rounded-2xl bg-white shadow-sm">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-editorial-ink/[0.02] border-b border-editorial-accent/10 uppercase tracking-wider text-[10px] font-mono text-editorial-muted">
                    <th className="py-4 px-6">Task Title</th>
                    <th className="py-4 px-6">Owner</th>
                    <th className="py-4 px-6">Category</th>
                    <th className="py-4 px-6">Priority</th>
                    <th className="py-4 px-6">Status</th>
                    <th className="py-4 px-6">Created At</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-editorial-accent/5">
                  {filteredTasks.map((t: any) => (
                    <tr key={t.id} className="hover:bg-editorial-ink/[0.01] transition-colors">
                      <td className="py-3 px-6 font-bold text-editorial-ink max-w-[200px] truncate">{t.title}</td>
                      <td className="py-3 px-6 font-mono text-editorial-ink">
                        {t.User ? (
                          <span className="font-bold text-brand-blue">@{t.User.username}</span>
                        ) : (
                          <span className="text-editorial-muted">Unassigned</span>
                        )}
                      </td>
                      <td className="py-3 px-6 font-mono text-editorial-muted">{t.category || 'General'}</td>
                      <td className="py-3 px-6">
                        <span className={`font-mono text-[9px] uppercase px-2 py-0.5 rounded-full ${
                          t.priority === 'HIGH' 
                            ? 'bg-red-50 text-red-600 border border-red-100'
                            : t.priority === 'MEDIUM'
                            ? 'bg-blue-50 text-brand-blue border border-blue-100'
                            : 'bg-slate-50 text-slate-600 border border-slate-100'
                        }`}>
                          {t.priority}
                        </span>
                      </td>
                      <td className="py-3 px-6">
                        <span className={`font-mono text-[9px] uppercase px-2 py-0.5 rounded-full ${
                          t.status === 'COMPLETED' 
                            ? 'bg-editorial-ink/5 text-editorial-ink/50' 
                            : t.status === 'IN_PROGRESS' || t.status === 'IN-PROGRESS'
                            ? 'bg-brand-blue/10 text-brand-blue'
                            : 'bg-editorial-accent/10 text-editorial-ink'
                        }`}>
                          {t.status}
                        </span>
                      </td>
                      <td className="py-3 px-6 font-mono text-editorial-muted">
                        {t.createdAt ? new Date(t.createdAt).toLocaleDateString() : 'N/A'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
