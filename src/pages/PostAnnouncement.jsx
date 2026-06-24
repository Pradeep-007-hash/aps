import { useState } from 'react';
import { Megaphone, Send, AlertCircle, CheckCircle } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

const API_URL = "http://localhost:5000";

export default function PostAnnouncement() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({ title: '', content: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.title || !formData.content) {
      setError('Both Title and Content are required.');
      return;
    }
    
    setLoading(true);
    setError('');
    setSuccess('');
    
    try {
      const res = await fetch(`${API_URL}/announcements`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-user-id': user?.id
        },
        body: JSON.stringify(formData)
      });
      
      if (!res.ok) throw new Error('Failed to post announcement');
      
      setSuccess('Announcement published successfully!');
      setFormData({ title: '', content: '' });
      setTimeout(() => navigate('/admin/announcements'), 1500);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-8 max-w-4xl mx-auto h-full overflow-y-auto">
      <div className="mb-8">
        <h1 className="text-4xl font-extrabold text-gray-900 dark:text-white tracking-tight flex items-center gap-3 transition-colors">
          <Megaphone className="w-10 h-10 text-primary-500" /> Post Announcement
        </h1>
        <p className="text-gray-500 dark:text-gray-400 mt-2 text-lg transition-colors">
          Publish a new announcement to all residents.
        </p>
      </div>

      <div className="glass-card p-8 rounded-2xl shadow-xl border border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-800/80 transition-colors">
        <form onSubmit={handleSubmit} className="space-y-6">
          {error && (
            <div className="p-4 bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-400 rounded-xl flex items-center gap-3">
              <AlertCircle className="w-5 h-5 flex-shrink-0" />
              <span className="font-medium text-sm">{error}</span>
            </div>
          )}
          {success && (
            <div className="p-4 bg-emerald-50 dark:bg-emerald-900/30 border border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-400 rounded-xl flex items-center gap-3">
              <CheckCircle className="w-5 h-5 flex-shrink-0" />
              <span className="font-medium text-sm">{success}</span>
            </div>
          )}

          <div>
            <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2 transition-colors">
              Announcement Title <span className="text-rose-500">*</span>
            </label>
            <input 
              type="text" 
              name="title" 
              value={formData.title} 
              onChange={handleChange} 
              placeholder="e.g. Scheduled Water Maintenance"
              className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent text-gray-900 dark:text-white transition-colors outline-none shadow-sm"
              required 
            />
          </div>

          <div>
            <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2 transition-colors">
              Content details <span className="text-rose-500">*</span>
            </label>
            <textarea 
              name="content" 
              value={formData.content} 
              onChange={handleChange} 
              rows="6"
              placeholder="Write the full description of the announcement here..."
              className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent text-gray-900 dark:text-white transition-colors outline-none resize-none shadow-sm"
              required 
            />
          </div>

          <div className="pt-4 border-t border-gray-100 dark:border-gray-800 flex justify-end transition-colors">
            <button 
              type="submit" 
              disabled={loading}
              className={`px-8 py-3.5 bg-primary-600 hover:bg-primary-700 text-white font-bold rounded-xl shadow-lg transition-all flex items-center gap-2 transform hover:-translate-y-0.5 ${loading ? 'opacity-70 cursor-not-allowed' : ''}`}
            >
              {loading ? (
                <span className="animate-pulse">Publishing...</span>
              ) : (
                <><Send className="w-5 h-5" /> Publish Announcement</>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
