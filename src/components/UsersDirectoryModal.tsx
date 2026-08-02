import React, { useEffect, useState } from 'react';
import { User, UserActivityLog } from '../types';
import {
  X,
  Users,
  ShieldCheck,
  Search,
  Clock,
  LogIn,
  UserPlus,
  Coffee,
  Activity,
  Phone,
  Mail,
  RefreshCw,
} from 'lucide-react';

interface UsersDirectoryModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const UsersDirectoryModal: React.FC<UsersDirectoryModalProps> = ({
  isOpen,
  onClose,
}) => {
  if (!isOpen) return null;

  const [users, setUsers] = useState<User[]>([]);
  const [activityLogs, setActivityLogs] = useState<UserActivityLog[]>([]);
  const [activeTab, setActiveTab] = useState<'registered' | 'activity'>('registered');
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  const fetchUsersData = async () => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/admin/users');
      const data = await response.json();
      if (data.success) {
        setUsers(data.users || []);
        setActivityLogs(data.activityLogs || []);
      }
    } catch (err) {
      console.error('Failed to fetch user directory:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchUsersData();
  }, [isOpen]);

  const filteredUsers = users.filter(
    (u) =>
      u.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      u.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (u.favoriteDrink && u.favoriteDrink.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const formatDate = (isoStr: string) => {
    try {
      const d = new Date(isoStr);
      return d.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });
    } catch {
      return isoStr;
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md p-3 sm:p-4 animate-fade-in">
      <div className="relative w-full max-w-4xl bg-[#1F1A17] border border-[#3A312B] rounded-3xl max-h-[90vh] flex flex-col overflow-hidden shadow-2xl">
        {/* Modal Header */}
        <div className="p-4 sm:p-5 bg-[#15110F] border-b border-[#3A312B] flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-[#E65F2B]/20 border border-[#E65F2B]/40 flex items-center justify-center text-[#E65F2B]">
              <Users className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-emerald-400 uppercase tracking-wide flex items-center gap-1">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  Security & User Directory
                </span>
                <span className="text-[10px] bg-[#3A312B] text-[#D4A373] px-2 py-0.5 rounded-full font-mono">
                  {users.length} Registered {users.length === 1 ? 'User' : 'Users'}
                </span>
              </div>
              <h2 className="text-base sm:text-lg font-extrabold text-white">
                Registered Users & Live Login Audit Log
              </h2>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={fetchUsersData}
              className="p-2 text-stone-400 hover:text-white rounded-full bg-[#2D2521] border border-[#3A312B] transition-colors"
              title="Refresh User Data"
            >
              <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
            </button>
            <button
              onClick={onClose}
              className="p-2 text-stone-400 hover:text-white rounded-full bg-[#2D2521] border border-[#3A312B] transition-colors"
              aria-label="Close Modal"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* View Switcher & Search Bar */}
        <div className="p-4 bg-[#15110F] border-b border-[#3A312B] flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
          <div className="bg-[#2D2521] p-1 rounded-2xl border border-[#3A312B] flex gap-1">
            <button
              onClick={() => setActiveTab('registered')}
              className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition-all ${
                activeTab === 'registered'
                  ? 'bg-[#E65F2B] text-white shadow border border-[#E65F2B]'
                  : 'text-stone-400 hover:text-white'
              }`}
            >
              <Users className="w-4 h-4" />
              <span>Registered Directory ({users.length})</span>
            </button>

            <button
              onClick={() => setActiveTab('activity')}
              className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition-all ${
                activeTab === 'activity'
                  ? 'bg-[#E65F2B] text-white shadow border border-[#E65F2B]'
                  : 'text-stone-400 hover:text-white'
              }`}
            >
              <Activity className="w-4 h-4" />
              <span>Login Activity Stream ({activityLogs.length})</span>
            </button>
          </div>

          {activeTab === 'registered' && (
            <div className="relative flex-1 sm:max-w-xs">
              <Search className="w-4 h-4 text-stone-500 absolute left-3 top-2.5" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Filter by name, email..."
                className="w-full bg-[#2D2521] border border-[#3A312B] focus:border-[#E65F2B] text-white text-xs p-2 pl-9 rounded-xl outline-none"
              />
            </div>
          )}
        </div>

        {/* Modal Content */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4">
          {isLoading ? (
            <div className="py-16 text-center space-y-3">
              <div className="w-8 h-8 border-2 border-[#E65F2B] border-t-transparent rounded-full animate-spin mx-auto" />
              <p className="text-xs text-stone-400 font-semibold">Loading registered users database...</p>
            </div>
          ) : activeTab === 'registered' ? (
            /* Registered Users Table / Grid */
            <div className="space-y-3">
              {filteredUsers.length === 0 ? (
                <div className="py-12 text-center text-stone-400 text-xs">
                  No registered users match your search criteria.
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {filteredUsers.map((user) => (
                    <div
                      key={user.id}
                      className="bg-[#2D2521] border border-[#3A312B] p-4 rounded-2xl space-y-3 hover:border-[#D4A373]/50 transition-all shadow-md"
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-xl bg-[#15110F] border border-[#3A312B] flex items-center justify-center font-bold text-white font-mono text-sm shadow">
                            {user.name.charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <h4 className="font-bold text-white text-sm">{user.name}</h4>
                              <span
                                className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase ${
                                  user.role === 'admin'
                                    ? 'bg-[#E65F2B]/20 text-[#E65F2B] border border-[#E65F2B]/40'
                                    : 'bg-stone-800 text-stone-300 border border-stone-700'
                                }`}
                              >
                                {user.role}
                              </span>
                            </div>
                            <span className="text-xs text-stone-400 flex items-center gap-1 mt-0.5">
                              <Mail className="w-3 h-3 text-[#D4A373]" />
                              {user.email}
                            </span>
                          </div>
                        </div>

                        <div className="text-right">
                          <span className="text-[10px] text-stone-400 block font-light">Logins</span>
                          <span className="text-xs font-bold text-[#E65F2B] font-mono bg-[#15110F] px-2 py-0.5 rounded-md border border-[#3A312B]">
                            {user.loginCount}x
                          </span>
                        </div>
                      </div>

                      {/* User Profile Info Details */}
                      <div className="pt-2.5 border-t border-[#3A312B]/70 grid grid-cols-2 gap-2 text-[11px] text-stone-300">
                        <div>
                          <span className="text-stone-500 block text-[10px]">Phone Number</span>
                          <span className="font-semibold text-stone-200 flex items-center gap-1">
                            <Phone className="w-3 h-3 text-stone-400" />
                            {user.phone || 'Not provided'}
                          </span>
                        </div>

                        <div>
                          <span className="text-stone-500 block text-[10px]">Favorite Brew</span>
                          <span className="font-semibold text-[#D4A373] flex items-center gap-1 truncate">
                            <Coffee className="w-3 h-3 shrink-0" />
                            {user.favoriteDrink || 'Standard Crave Roast'}
                          </span>
                        </div>
                      </div>

                      {/* Timestamps */}
                      <div className="pt-2 border-t border-[#3A312B]/40 flex justify-between text-[10px] text-stone-400">
                        <span>Joined: {formatDate(user.createdAt)}</span>
                        <span>Last Login: {formatDate(user.lastLoginAt)}</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ) : (
            /* Live Login Activity Stream */
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-extrabold text-[#D4A373] uppercase tracking-wider flex items-center gap-1.5">
                  <Activity className="w-4 h-4 text-[#E65F2B]" />
                  Live Security Event Stream
                </span>
                <span className="text-[11px] text-stone-400">Total Events: {activityLogs.length}</span>
              </div>

              <div className="space-y-2">
                {activityLogs.map((log) => (
                  <div
                    key={log.id}
                    className="bg-[#2D2521] border border-[#3A312B] p-3 rounded-xl flex items-center justify-between gap-3 text-xs"
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 ${
                          log.action === 'registered'
                            ? 'bg-blue-950 text-blue-400 border border-blue-800'
                            : log.action === 'logged_in'
                            ? 'bg-emerald-950 text-emerald-400 border border-emerald-800'
                            : 'bg-stone-800 text-stone-400 border border-stone-700'
                        }`}
                      >
                        {log.action === 'registered' ? (
                          <UserPlus className="w-4 h-4" />
                        ) : log.action === 'logged_in' ? (
                          <LogIn className="w-4 h-4" />
                        ) : (
                          <Clock className="w-4 h-4" />
                        )}
                      </div>

                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-white">{log.userName}</span>
                          <span className="text-[10px] text-stone-400">({log.userEmail})</span>
                        </div>
                        <span className="text-[11px] text-stone-300 font-medium capitalize">
                          Action: {log.action.replace('_', ' ')}
                        </span>
                      </div>
                    </div>

                    <div className="text-right text-[11px] font-mono text-stone-400 shrink-0">
                      {formatDate(log.timestamp)}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="p-4 bg-[#15110F] border-t border-[#3A312B] flex items-center justify-between text-xs text-stone-400">
          <div className="flex items-center gap-1.5">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span>Encrypted User Activity & Authentication Log</span>
          </div>

          <button
            onClick={onClose}
            className="px-4 py-2 bg-[#2D2521] hover:bg-[#3A312B] text-white font-bold rounded-xl border border-[#3A312B] transition-colors"
          >
            Close Window
          </button>
        </div>
      </div>
    </div>
  );
};
