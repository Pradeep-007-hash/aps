import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import api from '../services/api';

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

export default function Dashboard() {
  const { user } = useAuth();
  const userName = user?.firstname || user?.username || 'User';
  const [announcements, setAnnouncements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [userCount, setUserCount] = useState(0);
  const [securityStats, setSecurityStats] = useState({ visitors: 0, deliveries: 0 });
  const [nextMeeting, setNextMeeting] = useState('Loading...');
  const navigate = useNavigate();


  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await fetch(`${API_URL}/announcements`);
        if (res.ok) {
          const data = await res.json();
          setAnnouncements(data.slice(0, 3)); // show top 3
        }

        if (user?.role === 'security' || user?.role === 'admin') {
          // Fetch today's visitors and pending deliveries for stats
          const visRes = await api.get('/visitors');
          const delRes = await api.get('/deliveries');
          
          if (visRes.data && delRes.data) {
            const today = new Date().toISOString().split('T')[0];
            const activeVis = visRes.data.filter(v => {
               const dateVal = v.entry_time || v.entryTime || v.createdAt;
               if (!dateVal) return false;
               try {
                 return new Date(dateVal).toISOString().split('T')[0] === today;
               } catch (e) {
                 return false;
               }
            }).length;

            const pendingDel = delRes.data.filter(d => d.status === 'Pending').length;
            setSecurityStats({ visitors: activeVis, deliveries: pendingDel });
          }
        }

        if (user?.role === 'admin') {
          const userRes = await fetch(`${API_URL}/admin/users`, {
             headers: { 'x-user-id': user?.id }
          });
          if (userRes.ok) {
            const userData = await userRes.json();
            setUserCount(userData.length);
          }
        }

        // Fetch next meeting
        try {
          const eventsRes = await fetch(`${API_URL}/events/upcoming`);
          if (eventsRes.ok) {
            const eventsData = await eventsRes.json();
            const meeting = eventsData.find(ev => ev.category === 'Meeting');
            if (meeting) {
              const meetingDate = new Date(meeting.date);
              const formattedDate = meetingDate.toLocaleDateString('en-US', {
                month: 'short',
                day: 'numeric'
              });
              setNextMeeting(formattedDate);
            } else {
              setNextMeeting('No next Meeting');
            }
          } else {
            setNextMeeting('No next Meeting');
          }
        } catch (err) {
          console.error("Error fetching next meeting:", err);
          setNextMeeting('No next Meeting');
        }
      } catch (err) {
        console.error("Error fetching dashboard data:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [user]);

  const stats = [
    { label: user?.role === 'admin' ? 'Total Members' : 'Total Due', value: user?.role === 'admin' ? userCount.toString() : '$450', color: 'bg-gradient-to-br from-red-400 to-red-600 dark:from-red-500 dark:to-red-700' },
    { label: 'Active Complaints', value: '2', color: 'bg-gradient-to-br from-orange-400 to-orange-600 dark:from-orange-500 dark:to-orange-700' },
    { label: 'Next Meeting', value: nextMeeting, color: 'bg-gradient-to-br from-primary-400 to-primary-600 dark:from-primary-500 dark:to-primary-700' },
  ];

  if (user?.role === 'admin') {
    stats.push({ label: "Today's Visitors", value: loading ? '-' : securityStats.visitors.toString(), color: 'bg-gradient-to-br from-blue-400 to-blue-600 dark:from-blue-500 dark:to-blue-700' });
    stats.push({ label: "Pending Deliveries", value: loading ? '-' : securityStats.deliveries.toString(), color: 'bg-gradient-to-br from-purple-400 to-purple-600 dark:from-purple-500 dark:to-purple-700' });
  }

  if (user?.role === 'security') {
    return (
      <div className="space-y-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-800 dark:text-white tracking-tight transition-colors">Security Dashboard</h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1 transition-colors">Monitor visitors and manage parcel deliveries.</p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="glass-card p-6 flex items-center gap-5 hover:-translate-y-1 transition-transform duration-300">
            <div className="w-3 h-16 rounded-full shadow-inner bg-gradient-to-br from-blue-400 to-blue-600 dark:from-blue-500 dark:to-blue-700"></div>
            <div>
              <p className="text-gray-500 dark:text-gray-400 text-sm font-semibold uppercase tracking-wider transition-colors">Visitors Today</p>
              <h3 className="text-4xl font-extrabold text-gray-900 dark:text-white mt-1 tracking-tight transition-colors">{loading ? '-' : securityStats.visitors}</h3>
            </div>
          </div>
          <div className="glass-card p-6 flex items-center gap-5 hover:-translate-y-1 transition-transform duration-300">
            <div className="w-3 h-16 rounded-full shadow-inner bg-gradient-to-br from-amber-400 to-amber-600 dark:from-amber-500 dark:to-amber-700"></div>
            <div>
              <p className="text-gray-500 dark:text-gray-400 text-sm font-semibold uppercase tracking-wider transition-colors">Pending Pickups</p>
              <h3 className="text-4xl font-extrabold text-gray-900 dark:text-white mt-1 tracking-tight transition-colors">{loading ? '-' : securityStats.deliveries}</h3>
            </div>
          </div>
        </div>

        <div className="glass-card p-8">
          <h2 className="text-xl font-bold mb-6 text-gray-800 dark:text-white flex items-center gap-2 transition-colors">
            <span className="w-2 h-2 rounded-full bg-indigo-500"></span> Security Actions
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            <button onClick={() => navigate('/security/visitor-log')} className="flex flex-col items-center justify-center p-6 rounded-2xl border-2 border-dashed border-gray-200 dark:border-gray-700 hover:border-blue-500 dark:hover:border-blue-500 hover:bg-blue-50/50 dark:hover:bg-blue-900/20 transition-all group">
              <div className="w-14 h-14 bg-gradient-to-br from-blue-100 to-indigo-100 dark:from-blue-900/40 dark:to-indigo-900/40 rounded-2xl mx-auto flex items-center justify-center text-blue-600 dark:text-blue-400 group-hover:scale-110 group-hover:shadow-lg transition-all duration-300 transform rotate-3 group-hover:rotate-0">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
              </div>
              <p className="font-bold text-gray-700 dark:text-gray-300 mt-4 transition-colors">Log Visitor</p>
            </button>
            <button onClick={() => navigate('/security/past-visitors')} className="flex flex-col items-center justify-center p-6 rounded-2xl border-2 border-dashed border-gray-200 dark:border-gray-700 hover:border-purple-500 dark:hover:border-purple-500 hover:bg-purple-50/50 dark:hover:bg-purple-900/20 transition-all group">
              <div className="w-14 h-14 bg-gradient-to-br from-purple-100 to-pink-100 dark:from-purple-900/40 dark:to-pink-900/40 rounded-2xl mx-auto flex items-center justify-center text-purple-600 dark:text-purple-400 group-hover:scale-110 group-hover:shadow-lg transition-all duration-300 transform -rotate-3 group-hover:rotate-0">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M3 3v18h18"/><path d="M18 17V9"/><path d="M13 17V5"/><path d="M8 17v-3"/></svg>
              </div>
              <p className="font-bold text-gray-700 dark:text-gray-300 mt-4 transition-colors">Visitor History</p>
            </button>
            <button onClick={() => navigate('/security/delivery-log')} className="flex flex-col items-center justify-center p-6 rounded-2xl border-2 border-dashed border-gray-200 dark:border-gray-700 hover:border-emerald-500 dark:hover:border-emerald-500 hover:bg-emerald-50/50 dark:hover:bg-emerald-900/20 transition-all group">
              <div className="w-14 h-14 bg-gradient-to-br from-emerald-100 to-teal-100 dark:from-emerald-900/40 dark:to-teal-900/40 rounded-2xl mx-auto flex items-center justify-center text-emerald-600 dark:text-emerald-400 group-hover:scale-110 group-hover:shadow-lg transition-all duration-300 transform rotate-3 group-hover:rotate-0">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/><polyline points="3.27 6.96 12 12.01 20.73 6.96"/><line x1="12" y1="22.08" x2="12" y2="12"/></svg>
              </div>
              <p className="font-bold text-gray-700 dark:text-gray-300 mt-4 transition-colors">Delivery Log</p>
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-gray-800 dark:text-white tracking-tight transition-colors">Welcome, {userName}! 👋</h1>
        <p className="text-gray-500 dark:text-gray-400 mt-1 transition-colors">Overview of your apartment and activities.</p>
      </div>
      
      <div className={`grid grid-cols-1 sm:grid-cols-2 ${stats.length === 3 ? 'lg:grid-cols-3' : 'lg:grid-cols-3 xl:grid-cols-5'} gap-6`}>
        {stats.map((stat, i) => (
          <div key={i} className="glass-card p-6 flex items-center gap-5 hover:-translate-y-1 transition-transform duration-300">
            <div className={`w-3 h-16 rounded-full shadow-inner ${stat.color}`}></div>
            <div>
              <p className="text-gray-500 dark:text-gray-400 text-sm font-semibold uppercase tracking-wider transition-colors">{stat.label}</p>
              <h3 className={`${stat.value.length > 8 ? 'text-2xl md:text-xl xl:text-2xl' : 'text-4xl'} font-extrabold text-gray-900 dark:text-white mt-1 tracking-tight transition-colors`}>{stat.value}</h3>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="glass-card p-8">
          <h2 className="text-xl font-bold mb-6 text-gray-800 dark:text-white flex items-center gap-2 transition-colors">
            <span className="w-2 h-2 rounded-full bg-primary-500"></span> Recent Announcements
          </h2>
          <div className="space-y-4">
            {loading ? (
              <div className="p-5 text-center text-primary-500 animate-pulse font-medium">Loading announcements...</div>
            ) : announcements.length > 0 ? (
              announcements.map((ann, idx) => (
                <div key={ann._id || idx} className={`p-5 rounded-2xl ${idx === 0 ? 'bg-gradient-to-br from-primary-50 to-indigo-50 dark:from-primary-900/20 dark:to-indigo-900/20 border border-primary-100 dark:border-primary-800/30 relative overflow-hidden group' : 'bg-white dark:bg-gray-800/50 border border-gray-100 dark:border-gray-700 hover:border-gray-200 dark:hover:border-gray-600'} transition-colors shadow-sm`}>
                  {idx === 0 && (
                    <div className="absolute top-0 right-0 w-32 h-32 bg-primary-100 dark:bg-primary-900/30 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 opacity-50 group-hover:opacity-80 transition-opacity"></div>
                  )}
                  <div className="flex justify-between items-start">
                    <h4 className={`font-bold ${idx === 0 ? 'text-primary-900 dark:text-primary-300' : 'text-gray-800 dark:text-gray-200'} text-lg transition-colors`}>{ann.title}</h4>
                    {ann.createdAt && (
                      <span className="text-xs text-gray-400 dark:text-gray-500 mt-1">{new Date(ann.createdAt).toLocaleDateString()}</span>
                    )}
                  </div>
                  <p className={`text-sm ${idx === 0 ? 'text-primary-700 dark:text-primary-400' : 'text-gray-600 dark:text-gray-400'} mt-2 font-medium leading-relaxed transition-colors`}>{ann.content}</p>
                </div>
              ))
            ) : (
                <div className="p-5 rounded-2xl bg-white dark:bg-gray-800/50 border border-gray-100 dark:border-gray-700 text-center text-gray-500 shadow-sm">
                  No recent announcements.
                </div>
            )}
          </div>
        </div>
        
        <div className="glass-card p-8">
          <h2 className="text-xl font-bold mb-6 text-gray-800 dark:text-white flex items-center gap-2 transition-colors">
            <span className="w-2 h-2 rounded-full bg-indigo-500"></span> Quick Actions
          </h2>
          <div className="grid grid-cols-2 gap-4 h-[calc(100%-3rem)]">
            <button onClick={() => navigate('/complaints')} className="flex flex-col items-center justify-center p-6 rounded-2xl border-2 border-dashed border-gray-200 dark:border-gray-700 hover:border-primary-500 dark:hover:border-primary-500 hover:bg-primary-50/50 dark:hover:bg-primary-900/20 transition-all group">
              <div className="w-14 h-14 bg-gradient-to-br from-primary-100 to-indigo-100 dark:from-primary-900/40 dark:to-indigo-900/40 rounded-2xl mx-auto flex items-center justify-center text-primary-600 dark:text-primary-400 group-hover:scale-110 group-hover:shadow-lg transition-all duration-300 transform rotate-3 group-hover:rotate-0">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14"/><path d="M12 5v14"/></svg>
              </div>
              <p className="font-bold text-gray-700 dark:text-gray-300 mt-4 transition-colors">Raise Complaint</p>
            </button>
            <button onClick={() => navigate('/bills')} className="flex flex-col items-center justify-center p-6 rounded-2xl border-2 border-dashed border-gray-200 dark:border-gray-700 hover:border-green-500 dark:hover:border-green-500 hover:bg-green-50/50 dark:hover:bg-green-900/20 transition-all group">
              <div className="w-14 h-14 bg-gradient-to-br from-green-100 to-emerald-100 dark:from-green-900/40 dark:to-emerald-900/40 rounded-2xl mx-auto flex items-center justify-center text-green-600 dark:text-green-400 group-hover:scale-110 group-hover:shadow-lg transition-all duration-300 transform -rotate-3 group-hover:rotate-0">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2v20"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>
              </div>
              <p className="font-bold text-gray-700 dark:text-gray-300 mt-4 transition-colors">Pay Bills</p>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
