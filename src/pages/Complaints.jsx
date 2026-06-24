import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Button from '../components/common/Button';
import api from '../services/api';
import { Plus } from 'lucide-react';

export default function Complaints() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchComplaints = async () => {
      try {
        setLoading(true);
        const res = await api.get('/complaints', {
          headers: { 'x-user-id': user?.id || user?._id }
        });
        setComplaints(res.data);
      } catch (err) {
        console.error('Error fetching complaints:', err);
        setError('Failed to load complaints log.');
      } finally {
        setLoading(false);
      }
    };

    if (user) {
      fetchComplaints();
    }
  }, [user]);

  const handleStatusChange = async (id, newStatus) => {
    try {
      // Optimistically update the UI state
      setComplaints(prev => prev.map(c => (c._id === id || c.id === id) ? { ...c, status: newStatus } : c));
      
      await api.put(`/complaints/${id}/status`, { status: newStatus }, {
        headers: { 'x-user-id': user?.id || user?._id }
      });
    } catch (err) {
      console.error('Failed to update complaint status:', err);
      alert(err.response?.data?.error || 'Failed to update complaint status on server.');
      // Re-fetch to sync state in case of failure
      const res = await api.get('/complaints', {
        headers: { 'x-user-id': user?.id || user?._id }
      });
      setComplaints(res.data);
    }
  };

  const getStatusStyle = (status) => {
    switch(status) {
      case 'Resolved': return 'bg-green-100 dark:bg-green-950/30 text-green-700 dark:text-green-400 border-green-200 dark:border-green-800/30';
      case 'In Progress': return 'bg-primary-100 dark:bg-primary-950/30 text-primary-700 dark:text-primary-400 border-primary-200 dark:border-primary-800/30';
      default: return 'bg-orange-100 dark:bg-orange-950/30 text-orange-700 dark:text-orange-400 border-orange-200 dark:border-orange-800/30';
    }
  };

  return (
    <div className="space-y-8 animate-fade-in-up">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-800 dark:text-white tracking-tight">Complaints</h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">Manage and track your service requests.</p>
        </div>
        <Button onClick={() => navigate('/complaints/new')} className="pl-3 pr-5">
          <Plus className="w-5 h-5 mr-1" /> New Complaint
        </Button>
      </div>
      
      <div className="glass-card overflow-hidden shadow-sm">
        {loading ? (
          <div className="p-12 text-center text-primary-500 font-medium animate-pulse">
            Loading complaints...
          </div>
        ) : error ? (
          <div className="p-12 text-center text-red-500 font-medium">
            ⚠️ {error}
          </div>
        ) : complaints.length === 0 ? (
          <div className="p-12 text-center text-gray-500 dark:text-gray-400 font-medium">
            No complaints found.
          </div>
        ) : (
          <table className="w-full text-left border-collapse whitespace-nowrap">
            <thead>
              <tr className="bg-gray-50/50 dark:bg-gray-800/50 text-gray-500 dark:text-gray-400 text-xs uppercase tracking-widest border-b border-gray-100 dark:border-gray-800">
                <th className="px-6 py-4 font-semibold">ID</th>
                <th className="px-6 py-4 font-semibold">Issue</th>
                <th className="px-6 py-4 font-semibold">Category</th>
                <th className="px-6 py-4 font-semibold">Date Raised</th>
                <th className="px-6 py-4 font-semibold">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50 dark:divide-gray-800/50">
              {complaints.map((c) => (
                <tr key={c._id || c.id} className="hover:bg-primary-50/30 dark:hover:bg-primary-900/10 transition-colors group">
                  <td className="px-6 py-5 font-bold text-gray-500 dark:text-gray-400">{c.id}</td>
                  <td className="px-6 py-5 font-semibold text-gray-900 dark:text-white group-hover:text-primary-600 transition-colors">{c.title}</td>
                  <td className="px-6 py-5">
                    <span className="bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 px-3 py-1 rounded-lg text-sm font-medium">{c.type}</span>
                  </td>
                  <td className="px-6 py-5 text-gray-500 dark:text-gray-400 font-medium">{c.date}</td>
                  <td className="px-6 py-5">
                    {user?.role === 'admin' ? (
                      <div className="relative inline-block">
                        <select
                          value={c.status}
                          onChange={(e) => handleStatusChange(c._id || c.id, e.target.value)}
                          className={`px-3 py-1.5 rounded-lg text-xs font-bold border cursor-pointer focus:outline-none focus:ring-2 focus:ring-primary-500 appearance-none pr-8 relative transition-all ${getStatusStyle(c.status)}`}
                        >
                          <option value="Pending" className="text-gray-900 dark:text-gray-100 bg-white dark:bg-gray-800">Pending</option>
                          <option value="In Progress" className="text-gray-900 dark:text-gray-100 bg-white dark:bg-gray-800">In Progress</option>
                          <option value="Resolved" className="text-gray-900 dark:text-gray-100 bg-white dark:bg-gray-800">Resolved</option>
                        </select>
                        <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-2.5 text-gray-500 dark:text-gray-400">
                          <svg className="w-3 h-3 fill-current" viewBox="0 0 20 20">
                            <path d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" fillRule="evenodd"></path>
                          </svg>
                        </div>
                      </div>
                    ) : (
                      <span className={`px-3 py-1.5 rounded-lg text-xs font-bold border ${getStatusStyle(c.status)}`}>
                        {c.status}
                      </span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
