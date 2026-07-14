import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Button from '../components/common/Button';
import { Calendar as CalendarIcon, MapPin, Clock, Tag, User, Mail, ArrowLeft, CheckCircle2, UploadCloud, X, Image as ImageIcon } from 'lucide-react';

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

export default function AddEvent() {
  const navigate = useNavigate();
  const { user } = useAuth();
  
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState(null);

  // Initialize form data, defaulting date to current date
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    date: new Date().toISOString().split('T')[0],
    startTime: '',
    endTime: '',
    venue: '',
    organizer: '',
    organizer: '',
    contact: '',
    category: '',
    image: null
  });
  const [imagePreview, setImagePreview] = useState(null);

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (!['image/jpeg', 'image/png', 'image/gif'].includes(file.type)) {
      setError('Please upload a valid image (JPEG, PNG, GIF).');
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      setError('Image must be less than 5MB.');
      return;
    }
    
    const reader = new FileReader();
    reader.onloadend = () => {
      setImagePreview(reader.result);
      setFormData(prev => ({ ...prev, image: reader.result.split(',')[1] }));
    };
    reader.readAsDataURL(file);
  };

  const removeImage = () => {
    setImagePreview(null);
    setFormData(prev => ({ ...prev, image: null }));
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Auth guard (though handled via disabled button, double check)
    if (!user) {
      setError("You must be logged in to post an event.");
      return;
    }

    // Validation for required fields
    if (!formData.title || !formData.date || !formData.startTime || !formData.venue) {
      setError("Please fill out all required fields: Title, Date, Start Time, and Venue.");
      return;
    }

    setLoading(true);
    setError(null);
    setSuccess(false);

    try {
      const res = await fetch(`${API_URL}/events`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-user-id": user.id
        },
        body: JSON.stringify(formData)
      });

      const resData = await res.json();
      
      if (res.ok) {
        setSuccess(true);
        // Reset form
        setFormData({
          title: '',
          description: '',
          date: new Date().toISOString().split('T')[0],
          startTime: '',
          endTime: '',
          venue: '',
          organizer: '',
          contact: '',
          category: '',
          image: null
        });
        setImagePreview(null);

        // Redirect after short delay to show success message
        setTimeout(() => {
          navigate('/dashboard');
        }, 1500);
      } else {
        setError(resData.error || "Failed to create event.");
      }
    } catch (err) {
      console.error(err);
      setError("Network error while creating event.");
    } finally {
      setLoading(false);
    }
  };

  // Restrict access directly if requested visually (or let the button disable handle it)
  if (!user) {
    return (
      <div className="p-8 max-w-2xl mx-auto text-center mt-20">
        <div className="glass-card p-10 bg-red-50 dark:bg-red-900/10 border-red-100 rounded-2xl">
          <h2 className="text-2xl font-bold text-red-600 mb-4">Authentication Required</h2>
          <p className="text-red-500 mb-6">You must be logged in to post community events.</p>
          <Button onClick={() => navigate('/login')}>Go to Login</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-8 max-w-4xl mx-auto h-full overflow-y-auto">
      <div className="flex items-center gap-4 mb-8">
        <button 
          onClick={() => navigate('/dashboard')}
          className="w-10 h-10 flex items-center justify-center rounded-full bg-white dark:bg-gray-800 shadow-sm border border-gray-200 dark:border-gray-700 text-gray-500 hover:text-primary-600 dark:hover:text-primary-400 hover:border-primary-200 transition-all font-bold"
          title="Back to Dashboard"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div>
          <h1 className="text-3xl font-extrabold text-gray-900 dark:text-white tracking-tight">Post New Event</h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">Fill out the details below to publish a new community event.</p>
        </div>
      </div>

      <div className="glass-card p-8 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800 bg-white/50 dark:bg-gray-900/50 relative overflow-hidden">
        {/* Decorative flair */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-primary-100 dark:bg-primary-900/20 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 opacity-60 pointer-events-none"></div>

        {error && (
          <div className="mb-6 p-4 rounded-xl text-sm font-medium bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-400 border border-red-200 dark:border-red-800/30 flex items-center">
            <span className="mr-2">⚠️</span> {error}
          </div>
        )}
        
        {success && (
          <div className="mb-6 p-4 rounded-xl text-sm font-medium bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800/30 flex items-center">
            <CheckCircle2 className="w-5 h-5 mr-2" /> Event created successfully! Redirecting...
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6 relative z-10">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-6">
            
            <div className="md:col-span-2">
              <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">
                Event Title <span className="text-red-500">*</span>
              </label>
              <input 
                type="text" 
                name="title" 
                value={formData.title} 
                onChange={handleChange} 
                className="w-full px-4 py-3 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent text-gray-900 dark:text-white placeholder-gray-400 transition-all shadow-sm"
                placeholder="e.g. Community Cleanup Drive"
                required
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">
                 Description
              </label>
              <textarea 
                name="description" 
                rows="4"
                value={formData.description} 
                onChange={handleChange} 
                className="w-full px-4 py-3 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent text-gray-900 dark:text-white placeholder-gray-400 transition-all resize-none shadow-sm"
                placeholder="Describe the activities, agenda, or guidelines for the event..."
              ></textarea>
            </div>

            <div className="space-y-6">
              <div>
                <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2 flex items-center gap-2">
                  <CalendarIcon className="w-4 h-4 text-primary-500" /> Event Date <span className="text-red-500">*</span>
                </label>
                <input 
                  type="date" 
                  name="date" 
                  value={formData.date} 
                  onChange={handleChange} 
                  className="w-full px-4 py-3 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-primary-500 text-gray-900 dark:text-white transition-all shadow-sm"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2 flex items-center gap-2 justify-between">
                    <span className="flex items-center gap-2"><Clock className="w-4 h-4 text-amber-500" /> Start <span className="text-red-500">*</span></span>
                  </label>
                  <input 
                    type="time" 
                    name="startTime" 
                    value={formData.startTime} 
                    onChange={handleChange} 
                    className="w-full px-4 py-3 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-primary-500 text-gray-900 dark:text-white transition-all shadow-sm"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2 flex items-center gap-2">
                    <Clock className="w-4 h-4 text-gray-400" /> End 
                  </label>
                  <input 
                    type="time" 
                    name="endTime" 
                    value={formData.endTime} 
                    onChange={handleChange} 
                    className="w-full px-4 py-3 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-primary-500 text-gray-900 dark:text-white transition-all shadow-sm"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2 flex items-center gap-2">
                  <Tag className="w-4 h-4 text-fuchsia-500" /> Category
                </label>
                <div className="relative">
                  <select 
                    name="category" 
                    value={formData.category} 
                    onChange={handleChange} 
                    className="w-full px-4 py-3 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-primary-500 text-gray-900 dark:text-white transition-all shadow-sm appearance-none"
                  >
                    <option value="" disabled>Select a category...</option>
                    <option value="Meeting">Meeting</option>
                    <option value="Social">Social</option>
                    <option value="Maintenance">Maintenance</option>
                    <option value="Sports">Sports</option>
                    <option value="Celebration">Celebration</option>
                    <option value="Other">Other</option>
                  </select>
                  <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-gray-500">
                    <svg className="w-4 h-4 fill-current" viewBox="0 0 20 20"><path d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" fillRule="evenodd"></path></svg>
                  </div>
                </div>
              </div>
            </div>

            <div className="space-y-6">
              <div>
                <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2 flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-rose-500" /> Venue <span className="text-red-500">*</span>
                </label>
                <input 
                  type="text" 
                  name="venue" 
                  value={formData.venue} 
                  onChange={handleChange} 
                  className="w-full px-4 py-3 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-primary-500 text-gray-900 dark:text-white transition-all shadow-sm"
                  placeholder="e.g. Main Clubhouse"
                  required
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
                  className="w-full px-4 py-3 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-primary-500 text-gray-900 dark:text-white transition-all shadow-sm"
                  placeholder="e.g. Recreation Committee"
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2 flex items-center gap-2">
                  <Mail className="w-4 h-4 text-cyan-500" /> Contact Email
                </label>
                <input 
                  type="email" 
                  name="contact" 
                  value={formData.contact} 
                  onChange={handleChange} 
                  className="w-full px-4 py-3 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-primary-500 text-gray-900 dark:text-white transition-all shadow-sm"
                  placeholder="e.g. contact@example.com"
                />
              </div>
            </div>
            
            <div className="md:col-span-2 mt-2">
              <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2 flex items-center gap-2">
                <ImageIcon className="w-4 h-4 text-emerald-500" /> Event Cover Image (Optional)
              </label>
              <div className={`mt-1 flex justify-center px-6 pt-6 pb-8 border-2 border-dashed ${imagePreview ? 'hidden' : 'border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-800'} rounded-xl transition-colors`}>
                <div className="space-y-2 text-center">
                  <UploadCloud className="mx-auto h-12 w-12 text-gray-400" />
                  <div className="flex text-sm text-gray-600 dark:text-gray-400 justify-center">
                    <label htmlFor="event-image-upload" className="cursor-pointer rounded-md font-bold text-primary-600 hover:text-primary-500 focus-within:outline-none transition-colors">
                      <span>Upload a file</span>
                      <input id="event-image-upload" type="file" className="sr-only" onChange={handleImageChange} accept="image/jpeg, image/png, image/gif" />
                    </label>
                  </div>
                  <p className="text-xs text-gray-500">PNG, JPG, GIF up to 5MB</p>
                </div>
              </div>
              {imagePreview && (
                <div className="mt-2 relative rounded-xl overflow-hidden shadow-sm border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 group">
                  <img src={imagePreview} alt="Preview" className="w-full h-64 object-cover" />
                  <button type="button" onClick={removeImage} className="absolute top-3 right-3 bg-red-500 text-white rounded-full p-2 shadow-lg hover:bg-red-600 transition-colors opacity-0 group-hover:opacity-100">
                    <X className="w-5 h-5" />
                  </button>
                </div>
              )}
            </div>

          </div>

          <div className="flex justify-end pt-6 mt-6 border-t border-gray-100 dark:border-gray-800 gap-4">
            <Button 
              type="button" 
              variant="secondary"
              onClick={() => navigate('/dashboard')}
              className="font-bold"
            >
              Cancel
            </Button>
            <Button 
              type="submit" 
              disabled={loading || !user}
              className="px-8 font-bold shadow-lg"
            >
              {loading ? 'Posting Event...' : 'Publish Event'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
