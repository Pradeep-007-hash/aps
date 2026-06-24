import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Bell, Search, Sun, Moon, Package } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';

export default function Navbar() {
  const { user } = useAuth();
  const [isDarkMode, setIsDarkMode] = useState(() => {
    if (typeof window !== 'undefined') {
      return localStorage.theme === 'dark' || (!('theme' in localStorage) && window.matchMedia('(prefers-color-scheme: dark)').matches);
    }
    return false;
  });

  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
      localStorage.theme = 'dark';
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.theme = 'light';
    }
  }, [isDarkMode]);

  const [notifications, setNotifications] = useState([]);
  const [isNotifOpen, setIsNotifOpen] = useState(false);
  const unreadCount = notifications.filter(n => !n.isRead).length;

  const fetchNotifications = async () => {
    if (!user?._id) return;
    try {
      const res = await api.get(`/notifications/${user._id}`);
      setNotifications(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    if (user?._id) {
      fetchNotifications();
      const interval = setInterval(fetchNotifications, 15000); // 15s refresh
      return () => clearInterval(interval);
    }
  }, [user?._id]);

  const markAsRead = async (id) => {
    try {
      await api.put(`/notifications/${id}/read`);
      setNotifications(notifications.map(n => n._id === id ? { ...n, isRead: true } : n));
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <header className="h-20 bg-white/80 dark:bg-gray-950/80 backdrop-blur-md border-b border-gray-100 dark:border-gray-800 sticky top-0 z-30 px-8 flex items-center justify-between transition-colors duration-300">
      <div className="flex items-center gap-6 flex-1">
        <div className="relative w-full max-w-md hidden md:block">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
          <input 
            type="text" 
            placeholder="Search transactions, complaints..." 
            className="w-full pl-10 pr-4 py-2.5 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-all text-gray-700 dark:text-gray-300 dark:placeholder-gray-500"
          />
        </div>
      </div>
      
      <div className="flex items-center gap-5">
        <button 
          onClick={() => setIsDarkMode(!isDarkMode)}
          className="relative p-2.5 text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition-colors bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 shadow-sm"
          aria-label="Toggle dark mode"
        >
          {isDarkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
        </button>

        <div className="relative">
          <button 
            onClick={() => setIsNotifOpen(!isNotifOpen)}
            className="relative p-2.5 text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition-colors bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 shadow-sm"
          >
            <Bell className="w-5 h-5" />
            {unreadCount > 0 && (
              <span className="absolute top-2 right-2 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-white dark:border-gray-900 shadow-sm"></span>
            )}
          </button>

          {isNotifOpen && (
            <div className="absolute right-0 mt-3 w-80 bg-white dark:bg-gray-900 rounded-2xl shadow-2xl border border-gray-100 dark:border-gray-800 overflow-hidden z-50 origin-top-right transition-all animate-in fade-in slide-in-from-top-2">
              <div className="p-4 border-b border-gray-100 dark:border-gray-800 flex items-center justify-between bg-gray-50 dark:bg-gray-800/50">
                <h3 className="font-bold text-gray-900 dark:text-white">Notifications</h3>
                {unreadCount > 0 && (
                  <span className="px-2.5 py-1 bg-primary-100 dark:bg-primary-900/40 text-primary-700 dark:text-primary-400 text-xs font-bold rounded-full">
                    {unreadCount} New
                  </span>
                )}
              </div>
              <div className="max-h-96 overflow-y-auto p-2">
                {notifications.length === 0 ? (
                  <div className="p-6 text-center text-gray-500 dark:text-gray-400 text-sm">
                    No new notifications
                  </div>
                ) : (
                  notifications.map(notif => (
                    <div 
                      key={notif._id} 
                      onClick={() => { if (!notif.isRead) markAsRead(notif._id); }}
                      className={`p-3 mb-1 rounded-xl cursor-pointer transition-all flex gap-3 ${notif.isRead ? 'opacity-70 hover:bg-gray-50 dark:hover:bg-gray-800/50' : 'bg-primary-50 dark:bg-primary-900/20 shadow-sm border border-primary-100 dark:border-primary-800/30'}`}
                    >
                      <div className={`mt-0.5 flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${notif.type === 'delivery' ? 'bg-indigo-100 text-indigo-600 dark:bg-indigo-900/40 dark:text-indigo-400' : 'bg-amber-100 text-amber-600 dark:bg-amber-900/40 dark:text-amber-400'}`}>
                        {notif.type === 'delivery' ? <Package className="w-4 h-4" /> : <Bell className="w-4 h-4" />}
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-800 dark:text-gray-200 leading-snug">{notif.message}</p>
                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1.5 font-mono">
                          {new Date(notif.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} • {new Date(notif.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>
        
        <div className="h-8 w-px bg-gray-200 dark:bg-gray-800 mx-2 transition-colors"></div>
        
        <Link to="/profile" className="flex items-center gap-3 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800/50 p-1.5 pr-3 rounded-full transition-colors border border-transparent hover:border-gray-100 dark:hover:border-gray-700 focus:outline-none focus:ring-2 focus:ring-primary-500/20">
          <div className="w-10 h-10 rounded-full flex items-center justify-center text-primary-700 dark:text-primary-300 font-bold border border-white dark:border-gray-800 shadow-sm ring-2 ring-gray-50 dark:ring-gray-900 transition-colors overflow-hidden bg-gradient-to-br from-primary-100 to-indigo-100 dark:from-primary-900/50 dark:to-indigo-900/50">
            {user?.image ? (
              <img src={`data:image/jpeg;base64,${user.image}`} alt="Profile" className="w-full h-full object-cover" />
            ) : (
              <span>{user?.firstname?.charAt(0)?.toUpperCase() || user?.username?.charAt(0)?.toUpperCase() || 'U'}</span>
            )}
          </div>
          <div className="hidden md:block text-left">
            <p className="text-sm font-semibold text-gray-800 dark:text-gray-200 leading-tight">
              {user?.firstname || user?.username || 'User'}
            </p>
            <p className="text-xs text-primary-600 dark:text-primary-400 font-medium mt-0.5 capitalize">{user?.role || 'Resident'}</p>
          </div>
        </Link>
      </div>
    </header>
  );
}
