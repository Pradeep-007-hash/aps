import { useState } from 'react';
import { ClipboardList, Send, AlertCircle, CheckCircle, Car, User, Phone, Briefcase, Home } from 'lucide-react';

const API_URL = "http://localhost:5000";

export default function VisitorLog() {
  const [formData, setFormData] = useState({
    name: '',
    contact: '',
    purpose: '',
    vehicle_no: '',
    door_no: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.door_no || !formData.name) {
      setError('Door Number and Name are required.');
      return;
    }
    
    setLoading(true);
    setError('');
    setSuccess('');
    
    try {
      const res = await fetch(`${API_URL}/api/visitors`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to log visitor');
      
      setSuccess('Visitor logged successfully!');
      setFormData({ name: '', contact: '', purpose: '', vehicle_no: '', door_no: '' });
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-8 max-w-4xl mx-auto h-full overflow-y-auto">
      <div className="mb-8 flex flex-col gap-2">
        <h1 className="text-4xl font-extrabold text-gray-900 dark:text-white tracking-tight flex items-center gap-3">
          <ClipboardList className="w-10 h-10 text-primary-500" /> New Visitor Log
        </h1>
        <p className="text-gray-500 dark:text-gray-400 text-lg">
          Register a new visitor at the security gate.
        </p>
      </div>

      <div className="glass-card p-8 rounded-2xl shadow-xl border border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-800/80">
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

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2 flex items-center gap-2">
                <User className="w-4 h-4 text-primary-500" /> Visitor Name <span className="text-rose-500">*</span>
              </label>
              <input 
                type="text" name="name" value={formData.name} onChange={handleChange} required
                placeholder="e.g. John Doe"
                className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-primary-500 outline-none transition-colors text-gray-900 dark:text-white"
              />
            </div>
            <div>
              <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2 flex items-center gap-2">
                <Phone className="w-4 h-4 text-emerald-500" /> Contact Number
              </label>
              <input 
                type="text" name="contact" value={formData.contact} onChange={handleChange}
                placeholder="e.g. +1 234 567 890"
                className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-primary-500 outline-none transition-colors text-gray-900 dark:text-white"
              />
            </div>
            <div>
              <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2 flex items-center gap-2">
                <Briefcase className="w-4 h-4 text-indigo-500" /> Purpose of Visit
              </label>
              <input 
                type="text" name="purpose" value={formData.purpose} onChange={handleChange}
                placeholder="e.g. Plumber / Guest"
                className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-primary-500 outline-none transition-colors text-gray-900 dark:text-white"
              />
            </div>
            <div>
              <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2 flex items-center gap-2">
                <Car className="w-4 h-4 text-amber-500" /> Vehicle Number
              </label>
              <input 
                type="text" name="vehicle_no" value={formData.vehicle_no} onChange={handleChange}
                placeholder="e.g. ABC 1234"
                className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-primary-500 outline-none transition-colors text-gray-900 dark:text-white"
              />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2 flex items-center gap-2">
                <Home className="w-4 h-4 text-rose-500" /> Target Door Number <span className="text-rose-500">*</span>
              </label>
              <input 
                type="text" name="door_no" value={formData.door_no} onChange={handleChange} required
                placeholder="e.g. 101"
                className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-primary-500 outline-none transition-colors text-gray-900 dark:text-white font-bold"
              />
              <p className="text-xs text-gray-500 mt-2">The system will automatically validate the door number against authorized residents.</p>
            </div>
          </div>

          <div className="pt-6 border-t border-gray-100 dark:border-gray-800 flex justify-end">
            <button 
              type="submit" disabled={loading}
              className={`px-8 py-3.5 bg-primary-600 hover:bg-primary-700 text-white font-bold rounded-xl shadow-lg flex items-center gap-2 transition-transform hover:-translate-y-0.5 ${loading ? 'opacity-70 cursor-not-allowed' : ''}`}
            >
              {loading ? 'Logging Visitor...' : <><Send className="w-5 h-5" /> Submit Log</>}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
