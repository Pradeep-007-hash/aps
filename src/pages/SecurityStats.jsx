import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import Button from '../components/common/Button';
import { UserCheck, Users, Package, ShieldAlert, RefreshCw, Clock } from 'lucide-react';

export default function SecurityStats() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [stats, setStats] = useState({
    todayVisitors: 0,
    visitorsInside: 0,
    todayDeliveries: 0,
    pendingApprovals: 0
  });
  const [insideList, setInsideList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [refreshing, setRefreshing] = useState(false);

  const fetchStatsAndInside = async () => {
    try {
      setRefreshing(true);
      setError('');

      // Fetch stats
      const statsRes = await api.get('/security/stats');
      setStats(statsRes.data);

      // Fetch all visitors to filter the ones currently inside
      const visitorsRes = await api.get('/visitors');
      const todayStr = new Date().toISOString().split('T')[0];
      const currentlyInside = visitorsRes.data.filter(v => {
        const dateVal = v.entry_time || v.entryTime || v.createdAt;
        if (!dateVal) return false;
        try {
          const isToday = new Date(dateVal).toISOString().split('T')[0] === todayStr;
          const hasNotExited = !v.exit_time && !v.exitTime;
          return isToday && hasNotExited;
        } catch (e) {
          return false;
        }
      });
      setInsideList(currentlyInside);
    } catch (err) {
      console.error(err);
      setError('Failed to fetch dashboard statistics.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    if (user) {
      fetchStatsAndInside();
      // Auto-refresh stats every 15 seconds
      const timer = setInterval(fetchStatsAndInside, 15000);
      return () => clearInterval(timer);
    }
  }, [user]);

  const handleCheckout = async (id) => {
    try {
      // Optimistically update lists and counters
      setInsideList(prev => prev.filter(v => (v._id !== id && v.id !== id)));
      setStats(prev => ({
        ...prev,
        visitorsInside: Math.max(0, prev.visitorsInside - 1)
      }));

      await api.put(`/visitors/${id}/checkout`);
      // Fully refresh stats
      fetchStatsAndInside();
    } catch (err) {
      console.error('Failed to checkout visitor:', err);
      alert('Failed to check out visitor.');
      fetchStatsAndInside();
    }
  };

  if (!user || (user.role !== 'security' && user.role !== 'admin')) {
    return (
      <div className="p-8 max-w-2xl mx-auto text-center mt-20">
        <div className="glass-card p-10 bg-amber-50 dark:bg-amber-900/10 border-amber-200 dark:border-amber-800/20 rounded-2xl">
          <h2 className="text-2xl font-bold text-amber-600 mb-4">Access Denied</h2>
          <p className="text-amber-500 mb-6 font-medium">Only authorized personnel are permitted to view gate statistics.</p>
          <Button onClick={() => navigate('/dashboard')}>Go to Dashboard</Button>
        </div>
      </div>
    );
  }

  const statCards = [
    { label: "Today's Visitors", value: stats.todayVisitors, icon: UserCheck, color: "from-blue-400 to-blue-600 dark:from-blue-500 dark:to-blue-700" },
    { label: "Visitors Inside", value: stats.visitorsInside, icon: Users, color: "from-purple-400 to-purple-600 dark:from-purple-500 dark:to-purple-700" },
    { label: "Deliveries Today", value: stats.todayDeliveries, icon: Package, color: "from-emerald-400 to-emerald-600 dark:from-emerald-500 dark:to-emerald-700" },
    { label: "Pending Approvals", value: stats.pendingApprovals, icon: ShieldAlert, color: "from-orange-400 to-orange-600 dark:from-orange-500 dark:to-orange-700" }
  ];

  return (
    <div className="space-y-8 animate-fade-in-up">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-800 dark:text-white tracking-tight">
            {user?.role === 'admin' ? "Visitors Statistics" : "Dashboard Statistics"}
          </h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">
            {user?.role === 'admin' 
              ? "Review live visitor metrics, gate entry logs, and pending approval states." 
              : "Live gate metrics, parcel counters, and pending approvals."}
          </p>
        </div>
        <button 
          onClick={fetchStatsAndInside} 
          disabled={refreshing}
          className="p-3 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 hover:border-primary-500 dark:hover:border-primary-500 rounded-xl shadow-sm text-gray-500 hover:text-primary-600 dark:hover:text-primary-400 transition-all flex items-center gap-2 cursor-pointer disabled:opacity-50"
          title="Refresh statistics"
        >
          <RefreshCw className={`w-5 h-5 ${refreshing ? 'animate-spin' : ''}`} />
          <span className="text-sm font-semibold hidden sm:inline">Refresh</span>
        </button>
      </div>

      {error && (
        <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800/30 text-red-700 dark:text-red-400 rounded-xl">
          ⚠️ {error}
        </div>
      )}

      {loading ? (
        <div className="p-12 text-center text-primary-500 font-medium animate-pulse">
          Loading statistics...
        </div>
      ) : (
        <>
          {/* Stats Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {statCards.map((card, i) => (
              <div key={i} className="glass-card p-6 flex items-center gap-5 hover:-translate-y-1 transition-transform duration-300">
                <div className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${card.color} flex items-center justify-center text-white shadow-md`}>
                  <card.icon className="w-6 h-6" />
                </div>
                <div>
                  <p className="text-gray-500 dark:text-gray-400 text-sm font-semibold uppercase tracking-wider">{card.label}</p>
                  <h3 className="text-3xl font-extrabold text-gray-900 dark:text-white mt-1 tracking-tight">{card.value}</h3>
                </div>
              </div>
            ))}
          </div>

          {/* Visitors Currently Inside */}
          <div className="glass-card overflow-hidden shadow-sm rounded-2xl border border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-900/50">
            <div className="p-6 border-b border-gray-100 dark:border-gray-800 bg-gray-50/30 dark:bg-gray-800/30 flex justify-between items-center">
              <h3 className="text-lg font-bold text-gray-800 dark:text-white flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-purple-500 animate-ping"></span>
                Visitors Currently Inside Building
              </h3>
              <span className="px-3 py-1 bg-purple-100 dark:bg-purple-950/40 text-purple-700 dark:text-purple-400 text-xs font-bold rounded-full border border-purple-200/50 dark:border-purple-800/30">
                {insideList.length} Active
              </span>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse whitespace-nowrap">
                <thead>
                  <tr className="bg-gray-50/50 dark:bg-gray-800/50 text-gray-500 dark:text-gray-400 text-xs uppercase tracking-widest border-b border-gray-100 dark:border-gray-800">
                    <th className="px-6 py-4 font-bold">Visitor Details</th>
                    <th className="px-6 py-4 font-bold">Contact</th>
                    <th className="px-6 py-4 font-bold">Destination</th>
                    <th className="px-6 py-4 font-bold">Purpose / Vehicle</th>
                    <th className="px-6 py-4 font-bold text-center">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50 dark:divide-gray-800/50">
                  {insideList.length === 0 ? (
                    <tr>
                      <td colSpan="5" className="px-6 py-12 text-center text-gray-500 dark:text-gray-400 font-medium">
                        No visitors are currently inside the building.
                      </td>
                    </tr>
                  ) : (
                    insideList.map((v) => (
                      <tr key={v._id || v.id} className="hover:bg-primary-50/30 dark:hover:bg-primary-900/10 transition-colors group">
                        <td className="px-6 py-5 font-bold text-gray-900 dark:text-white flex items-center gap-3">
                          <div className="w-10 h-10 rounded-xl bg-purple-100 dark:bg-purple-900/40 text-purple-600 dark:text-purple-400 flex items-center justify-center font-bold">
                            {v.name.charAt(0).toUpperCase()}
                          </div>
                          {v.name}
                        </td>
                        <td className="px-6 py-5 text-gray-600 dark:text-gray-300 font-medium">{v.contact || 'N/A'}</td>
                        <td className="px-6 py-5">
                          <span className="px-2.5 py-1 bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-400 rounded-md font-bold text-xs">
                            Door {v.door_no || v.doorNo}
                          </span>
                        </td>
                        <td className="px-6 py-5 text-sm text-gray-500 dark:text-gray-400">
                          <div className="font-semibold text-gray-800 dark:text-gray-200">{v.purpose || 'Visit'}</div>
                          <div className="text-xs mt-1">{v.vehicle_no || v.vehicleNumber || 'No Vehicle'}</div>
                        </td>
                        <td className="px-6 py-5 text-center">
                          <button 
                            onClick={() => handleCheckout(v._id || v.id)}
                            className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-xl font-bold text-xs shadow-md shadow-purple-500/20 hover:shadow-purple-600/30 hover:-translate-y-0.5 transition-all flex items-center gap-1.5 mx-auto cursor-pointer"
                          >
                            <Clock className="w-3.5 h-3.5" /> Check Out
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
