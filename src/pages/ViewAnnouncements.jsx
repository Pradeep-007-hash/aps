import { useState, useEffect } from 'react';
import { Megaphone, Trash2, Calendar, FileText, Plus } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

const API_URL = "http://localhost:5000";

export default function ViewAnnouncements() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [announcements, setAnnouncements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchAnnouncements();
  }, []);

  const fetchAnnouncements = async () => {
    try {
      setLoading(true);
      const res = await fetch(`${API_URL}/announcements`);
      if (!res.ok) throw new Error('Failed to fetch announcements');
      const data = await res.json();
      setAnnouncements(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to permanently delete this announcement?")) return;
    
    try {
      const res = await fetch(`${API_URL}/announcements/${id}`, {
        method: 'DELETE',
        headers: {
          'x-user-id': user?.id
        }
      });
      
      if (!res.ok) throw new Error('Failed to delete announcement');
      
      setAnnouncements(announcements.filter(item => item._id !== id));
    } catch (err) {
      alert("Error: " + err.message);
    }
  };

  if (loading) return <div className="p-8 flex items-center justify-center text-primary-600 h-full"><span className="animate-pulse font-bold text-xl">Loading Announcements...</span></div>;
  if (error) return <div className="p-8 text-center text-red-500 font-bold h-full">Error: {error}</div>;

  return (
    <div className="p-8 max-w-7xl mx-auto h-full overflow-y-auto">
      <div className="mb-8 flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
        <div>
          <h1 className="text-4xl font-extrabold text-gray-900 dark:text-white tracking-tight flex items-center gap-3 transition-colors">
            <Megaphone className="w-10 h-10 text-primary-500" /> Manage Announcements
          </h1>
          <p className="text-gray-500 dark:text-gray-400 mt-2 text-lg transition-colors">
            View and manage published community announcements.
          </p>
        </div>
        {user?.role === 'admin' && (
          <button 
            onClick={() => navigate('/admin/announcement/add')}
            className="px-5 py-2.5 bg-primary-600 hover:bg-primary-700 text-white rounded-lg font-bold shadow-lg transition-transform hover:scale-105 flex items-center gap-2"
          >
            <Plus className="w-5 h-5" /> New Announcement
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 pb-10">
        {announcements.length === 0 ? (
          <div className="col-span-full glass-card p-12 text-center mt-4 border border-gray-100 dark:border-gray-800 transition-colors">
            <FileText className="w-16 h-16 mx-auto text-gray-300 dark:text-gray-600 mb-4 transition-colors" />
            <h3 className="text-xl font-bold text-gray-700 dark:text-gray-200 transition-colors">No Announcements Found</h3>
            <p className="text-gray-500 dark:text-gray-400 mt-2 transition-colors">There are currently no active announcements in the portal.</p>
          </div>
        ) : (
          announcements.map(ann => (
            <div key={ann._id} className="glass-card flex flex-col rounded-2xl overflow-hidden shadow-lg border border-gray-100 dark:border-gray-700 hover:shadow-xl transition-all duration-300 bg-white dark:bg-gray-800">
              <div className="h-2 w-full bg-gradient-to-r from-primary-400 to-indigo-500"></div>
              <div className="p-6 flex-1 flex flex-col">
                <div className="flex justify-between items-start gap-4 mb-4">
                  <h3 className="text-xl font-bold text-gray-900 dark:text-white transition-colors leading-snug break-words">{ann.title}</h3>
                  {user?.role === 'admin' && (
                    <button 
                      onClick={() => handleDelete(ann._id)} 
                      className="p-2.5 bg-rose-50 text-rose-600 hover:bg-rose-100 dark:bg-rose-900/20 dark:text-rose-400 dark:hover:bg-rose-900/40 rounded-xl transition-colors shadow-sm flex-shrink-0"
                      title="Delete Announcement"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  )}
                </div>
                <p className="text-gray-600 dark:text-gray-300 mb-6 flex-1 leading-relaxed transition-colors whitespace-pre-wrap text-sm border-l-4 border-gray-200 dark:border-gray-700 pl-3">
                  {ann.content}
                </p>
                <div className="mt-auto border-t border-gray-100 dark:border-gray-800 pt-4 transition-colors">
                   <div className="flex items-center gap-2 text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider">
                     <Calendar className="w-4 h-4" /> Published: {new Date(ann.createdAt).toLocaleDateString()}
                   </div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
