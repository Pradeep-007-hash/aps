import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Button from '../components/common/Button';
import { Calendar as CalendarIcon, MapPin, Clock, Tag, User, Phone, Image as ImageIcon } from 'lucide-react';

const API_URL = "http://localhost:5000";

export default function EditEvent() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    date: '',
    startTime: '',
    endTime: '',
    venue: '',
    organizer: '',
    contact: '',
    category: ''
  });

  useEffect(() => {
    fetchEventDetails();
  }, [id]);

  const fetchEventDetails = async () => {
    try {
      const res = await fetch(`${API_URL}/events/${id}`);
      if (!res.ok) throw new Error("Event not found");
      const data = await res.json();
      
      // Authorization Check front-end barrier
      if (!user || (String(data.postedBy) !== String(user.id) && user.role !== 'admin')) {
        setError("Unauthorized to edit this event.");
        setLoading(false);
        return;
      }
      
      // Form date string yyyy-mm-dd
      let dateString = '';
      if (data.date) {
        dateString = new Date(data.date).toISOString().split('T')[0];
      }

      setFormData({
        title: data.title || '',
        description: data.description || '',
        date: dateString,
        startTime: data.startTime || '',
        endTime: data.endTime || '',
        venue: data.venue || '',
        organizer: data.organizer || '',
        contact: data.contact || '',
        category: data.category || ''
      });

    } catch (err) {
      console.error(err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError(null);

    try {
      const res = await fetch(`${API_URL}/events/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "x-user-id": user.id
        },
        body: JSON.stringify(formData)
      });

      const resData = await res.json();
      if (res.ok) {
        // Redirect back to events list
        navigate('/events');
      } else {
        setError(resData.error || "Failed to update event");
      }
    } catch (err) {
      console.error(err);
      setError("Network error while updating event");
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="p-8 text-primary-600 font-bold text-center">Loading event details...</div>;
  
  if (error) return (
    <div className="p-8 max-w-2xl mx-auto text-center">
      <div className="bg-red-50 text-red-600 p-6 rounded-xl font-medium border border-red-100">
        <p className="text-lg">🚫 {error}</p>
        <Button onClick={() => navigate('/events')} className="mt-4 bg-gray-800 text-white">Back to Events</Button>
      </div>
    </div>
  );

  return (
    <div className="p-8 max-w-3xl mx-auto h-full overflow-y-auto">
      <div className="flex items-center gap-4 mb-8">
        <button 
          onClick={() => navigate('/events')}
          className="w-10 h-10 flex items-center justify-center rounded-full bg-gray-100 dark:bg-gray-800 text-gray-500 hover:text-gray-900 dark:hover:text-white transition-colors"
        >
          &larr;
        </button>
        <div>
          <h1 className="text-3xl font-extrabold text-gray-900 dark:text-white tracking-tight">Edit Event</h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">Update event details and scheduling.</p>
        </div>
      </div>

      <div className="glass-card p-8">
        <form onSubmit={handleSubmit} className="space-y-6">
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="md:col-span-2">
              <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2 flex items-center gap-2">
                 Title
              </label>
              <input 
                type="text" 
                name="title" 
                required
                value={formData.title} 
                onChange={handleChange} 
                className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-800 border-none rounded-xl focus:ring-2 focus:ring-primary-500 text-gray-900 dark:text-white placeholder-gray-400 transition-all"
                placeholder="e.g. Summer Pool Party"
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2 flex items-center gap-2">
                 Description
              </label>
              <textarea 
                name="description" 
                rows="4"
                value={formData.description} 
                onChange={handleChange} 
                className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-800 border-none rounded-xl focus:ring-2 focus:ring-primary-500 text-gray-900 dark:text-white placeholder-gray-400 transition-all resize-none"
                placeholder="Describe the event..."
              ></textarea>
            </div>

            <div>
              <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2 flex items-center gap-2">
                <CalendarIcon className="w-4 h-4 text-primary-500" /> Date
              </label>
              <input 
                type="date" 
                name="date" 
                required
                value={formData.date} 
                onChange={handleChange} 
                className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-800 border-none rounded-xl focus:ring-2 focus:ring-primary-500 text-gray-900 dark:text-white transition-all"
              />
            </div>
            
            <div>
              <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2 flex items-center gap-2">
                <Tag className="w-4 h-4 text-emerald-500" /> Category
              </label>
              <input 
                type="text" 
                name="category" 
                value={formData.category} 
                onChange={handleChange} 
                className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-800 border-none rounded-xl focus:ring-2 focus:ring-primary-500 text-gray-900 dark:text-white transition-all"
                placeholder="e.g. Social, Formal, Meeting"
              />
            </div>

            <div>
              <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2 flex items-center gap-2">
                <Clock className="w-4 h-4 text-amber-500" /> Start Time
              </label>
              <input 
                type="time" 
                name="startTime" 
                required
                value={formData.startTime} 
                onChange={handleChange} 
                className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-800 border-none rounded-xl focus:ring-2 focus:ring-primary-500 text-gray-900 dark:text-white transition-all"
              />
            </div>
            
            <div>
              <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2 flex items-center gap-2">
                <Clock className="w-4 h-4 text-amber-500" /> End Time
              </label>
              <input 
                type="time" 
                name="endTime" 
                value={formData.endTime} 
                onChange={handleChange} 
                className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-800 border-none rounded-xl focus:ring-2 focus:ring-primary-500 text-gray-900 dark:text-white transition-all"
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2 flex items-center gap-2">
                <MapPin className="w-4 h-4 text-rose-500" /> Venue
              </label>
              <input 
                type="text" 
                name="venue" 
                required
                value={formData.venue} 
                onChange={handleChange} 
                className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-800 border-none rounded-xl focus:ring-2 focus:ring-primary-500 text-gray-900 dark:text-white transition-all"
                placeholder="e.g. Clubhouse Main Hall"
              />
            </div>

            <div>
              <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2 flex items-center gap-2">
                <User className="w-4 h-4 text-indigo-500" /> Organizer
              </label>
              <input 
                type="text" 
                name="organizer" 
                value={formData.organizer} 
                onChange={handleChange} 
                className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-800 border-none rounded-xl focus:ring-2 focus:ring-primary-500 text-gray-900 dark:text-white transition-all"
                placeholder="e.g. Residents Association"
              />
            </div>

            <div>
              <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2 flex items-center gap-2">
                <Phone className="w-4 h-4 text-cyan-500" /> Contact Info
              </label>
              <input 
                type="text" 
                name="contact" 
                value={formData.contact} 
                onChange={handleChange} 
                className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-800 border-none rounded-xl focus:ring-2 focus:ring-primary-500 text-gray-900 dark:text-white transition-all"
                placeholder="e.g. 123-456-7890"
              />
            </div>
          </div>

          <div className="flex justify-end pt-6 mt-6 border-t border-gray-100 dark:border-gray-800 gap-4">
            <Button 
              type="button" 
              variant="secondary"
              onClick={() => navigate('/events')}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={saving}>
              {saving ? 'Saving Changes...' : 'Save Changes'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
