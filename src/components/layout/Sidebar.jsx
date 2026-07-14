import { NavLink } from 'react-router-dom';
import { LayoutDashboard, MessageSquareText, FileText, Settings, LogOut, CalendarDays, History, CalendarPlus, PackageSearch, Archive, Megaphone, Users, ClipboardList, BellRing, X } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export default function Sidebar({ isOpen, onClose }) {
  const { user, logout } = useAuth();
  
  const handleLogout = () => {
    if (window.confirm("Are you sure you want to log out?")) {
      logout();
    }
  };

  let menuItems = [];

  if (user?.role === 'security') {
    menuItems = [
      { icon: LayoutDashboard, label: 'Dashboard Stats', path: '/security/dashboard-statistics' },
      { icon: ClipboardList, label: 'Visitor Log', path: '/security/visitor-log' },
      { icon: History, label: 'View Past Visitors', path: '/security/past-visitors' },
      { icon: BellRing, label: 'Delivery Reminder', path: '/security/delivery-reminder' },
      { icon: PackageSearch, label: 'View Delivery Log', path: '/security/delivery-log' },
      { icon: Megaphone, label: 'View Announcements', path: '/security/announcements' },
    ];
  } else {
    menuItems = [
      { icon: LayoutDashboard, label: 'Dashboard', path: '/dashboard' },
      { icon: MessageSquareText, label: 'Complaints', path: '/complaints' },
      { icon: FileText, label: 'Bills', path: '/bills' },
      { icon: CalendarDays, label: 'View Events', path: '/events' },
      { icon: History, label: 'Past Events', path: '/events/past' },
      { icon: CalendarPlus, label: 'Add Event', path: '/events/add' },
      { icon: PackageSearch, label: 'Lost & Found', path: '/lost-and-found' },
      { icon: Archive, label: 'View Lost Items', path: '/lost-items' },
    ];

    if (user?.role === 'admin') {
      menuItems.splice(1, 0, { icon: Users, label: 'Manage Users', path: '/admin/users' });
      menuItems.push({ icon: History, label: 'Past Visitors', path: '/security/past-visitors' });
      menuItems.push({ icon: Megaphone, label: 'Post Announcement', path: '/admin/announcement/add' });
      menuItems.push({ icon: Megaphone, label: 'View Announcements', path: '/admin/announcements' });
    }
  }

  return (
    <>
      {/* Backdrop for mobile */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40 md:hidden transition-opacity duration-300"
          onClick={onClose}
        />
      )}
      
      <aside className={`
        fixed inset-y-0 left-0 w-64 bg-white dark:bg-gray-950 border-r border-gray-100 dark:border-gray-800 flex flex-col h-full shadow-lg z-50 transition-transform duration-300 ease-in-out
        md:static md:translate-x-0 md:shadow-sm
        ${isOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        <div className="p-6 flex items-center justify-between">
          <h1 className="text-2xl font-bold bg-gradient-to-r from-primary-600 to-indigo-600 min-h-[2rem] bg-clip-text text-transparent flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary-500 to-indigo-600 flex items-center justify-center shadow-lg shadow-primary-500/30 text-white">
              <span className="text-sm">UN</span>
            </div>
            UrbanNest
          </h1>
          
          <button 
            onClick={onClose}
            className="p-1.5 rounded-lg text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800 md:hidden"
            aria-label="Close sidebar"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      
        <nav className="flex-1 px-4 space-y-2 mt-4 overflow-y-auto pb-4">
          {menuItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              onClick={onClose}
              className={({ isActive }) => `
                flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200
                ${isActive 
                  ? 'bg-primary-50 dark:bg-primary-900/30 text-primary-700 dark:text-primary-400 font-semibold shadow-sm border border-primary-100/50 dark:border-primary-800/50' 
                  : 'text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800/50 hover:text-gray-900 dark:hover:text-white'}
              `}
            >
              <item.icon className="w-5 h-5" />
              <span>{item.label}</span>
            </NavLink>
          ))}
        </nav>

        <div className="p-4 border-t border-gray-100 dark:border-gray-800 transition-colors duration-300">
          <button onClick={handleLogout} className="flex items-center gap-3 px-4 py-3 text-gray-500 dark:text-gray-400 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-xl transition-colors w-full font-medium">
            <LogOut className="w-5 h-5" />
            <span>Logout</span>
          </button>
        </div>
      </aside>
    </>
  );
}
