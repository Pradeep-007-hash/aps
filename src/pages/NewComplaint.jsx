import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Button from '../components/common/Button';
import api from '../services/api';
import { ArrowLeft, CheckCircle2 } from 'lucide-react';

export default function NewComplaint() {
  const navigate = useNavigate();
  const { user } = useAuth();
  
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState(null);

  const [formData, setFormData] = useState({
    title: '',
    type: '',
    description: ''
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!user) {
      setError("You must be logged in to submit a complaint.");
      return;
    }

    if (!formData.title || !formData.type) {
      setError("Please fill out all required fields: Issue Title and Category.");
      return;
    }

    setLoading(true);
    setError(null);
    setSuccess(false);

    try {
      const res = await api.post('/complaints', formData, {
        headers: {
          'x-user-id': user?.id || user?._id
        }
      });
      
      if (res.status === 201) {
        setSuccess(true);
        setFormData({
          title: '',
          type: '',
          description: ''
        });

        // Redirect after short delay to show success message
        setTimeout(() => {
          navigate('/complaints');
        }, 1500);
      } else {
        setError("Failed to submit complaint.");
      }
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.error || "Network error while submitting complaint.");
    } finally {
      setLoading(false);
    }
  };

  if (!user) {
    return (
      <div className="p-8 max-w-2xl mx-auto text-center mt-20">
        <div className="glass-card p-10 bg-red-50 dark:bg-red-900/10 border-red-100 dark:border-red-800/20 rounded-2xl">
          <h2 className="text-2xl font-bold text-red-600 mb-4">Authentication Required</h2>
          <p className="text-red-500 mb-6 font-medium">You must be logged in to submit complaints.</p>
          <Button onClick={() => navigate('/login')}>Go to Login</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-8 max-w-3xl mx-auto h-full overflow-y-auto">
      <div className="flex items-center gap-4 mb-8">
        <button 
          onClick={() => navigate('/complaints')}
          className="w-10 h-10 flex items-center justify-center rounded-full bg-white dark:bg-gray-800 shadow-sm border border-gray-200 dark:border-gray-700 text-gray-500 hover:text-primary-600 dark:hover:text-primary-400 hover:border-primary-200 transition-all font-bold cursor-pointer"
          title="Back to Complaints"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div>
          <h1 className="text-3xl font-extrabold text-gray-900 dark:text-white tracking-tight">Raise New Complaint</h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">Submit your service or maintenance requests below.</p>
        </div>
      </div>

      <div className="glass-card p-8 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800 bg-white/50 dark:bg-gray-900/50 relative overflow-hidden">
        {/* Decorative background flair */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-primary-100 dark:bg-primary-900/20 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 opacity-60 pointer-events-none"></div>

        {error && (
          <div className="mb-6 p-4 rounded-xl text-sm font-medium bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-400 border border-red-200 dark:border-red-800/30 flex items-center">
            <span className="mr-2">⚠️</span> {error}
          </div>
        )}
        
        {success && (
          <div className="mb-6 p-4 rounded-xl text-sm font-medium bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800/30 flex items-center">
            <CheckCircle2 className="w-5 h-5 mr-2" /> Complaint submitted successfully! Redirecting...
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6 relative z-10">
          <div className="grid grid-cols-1 gap-6">
            
            {/* Complaint ID (Read-only Indicator) */}
            <div>
              <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">
                Complaint ID
              </label>
              <input 
                type="text" 
                disabled 
                value="Auto-generated sequential ID (e.g. #CMP-004)"
                className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl text-gray-400 dark:text-gray-500 cursor-not-allowed select-none font-medium text-sm"
              />
            </div>

            {/* Title / Issue */}
            <div>
              <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">
                Issue Title <span className="text-red-500">*</span>
              </label>
              <input 
                type="text" 
                name="title" 
                value={formData.title} 
                onChange={handleChange} 
                className="w-full px-4 py-3 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 transition-all shadow-sm"
                placeholder="e.g. Leaky Faucet in Kitchen"
                required
              />
            </div>

            {/* Category / Type */}
            <div>
              <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">
                Category / Type <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <select 
                  name="type" 
                  value={formData.type} 
                  onChange={handleChange} 
                  className="w-full px-4 py-3 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-primary-500 text-gray-900 dark:text-white transition-all shadow-sm appearance-none cursor-pointer"
                  required
                >
                  <option value="" disabled>Select a category...</option>
                  <option value="Plumbing">Plumbing</option>
                  <option value="Electrical">Electrical</option>
                  <option value="Facility">Facility</option>
                  <option value="Security">Security</option>
                  <option value="Other">Other</option>
                </select>
                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-gray-500 dark:text-gray-400">
                  <svg className="w-4 h-4 fill-current" viewBox="0 0 20 20"><path d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" fillRule="evenodd"></path></svg>
                </div>
              </div>
            </div>

            {/* Description */}
            <div>
              <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">
                Description / Additional Details
              </label>
              <textarea 
                name="description" 
                rows="5"
                value={formData.description} 
                onChange={handleChange} 
                className="w-full px-4 py-3 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 transition-all resize-none shadow-sm"
                placeholder="Provide detailed instructions or additional context about the issue..."
              ></textarea>
            </div>

          </div>

          {/* Form Actions */}
          <div className="flex justify-end pt-6 mt-6 border-t border-gray-100 dark:border-gray-800 gap-4">
            <Button 
              type="button" 
              variant="secondary"
              onClick={() => navigate('/complaints')}
              className="font-bold cursor-pointer"
            >
              Cancel
            </Button>
            <Button 
              type="submit" 
              disabled={loading || !user}
              className="px-8 font-bold shadow-lg cursor-pointer"
            >
              {loading ? 'Submitting...' : 'Submit Complaint'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
