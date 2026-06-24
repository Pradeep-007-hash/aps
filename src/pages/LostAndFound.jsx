import { useState, useRef } from 'react';
import { UploadCloud, X, Info, Search, Package, AlertCircle, CheckCircle } from 'lucide-react';

const API_URL = "http://localhost:5000";

export default function LostAndFound() {
  const [type, setType] = useState('lost'); // 'lost' or 'found'
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    name: '',
    contact: ''
  });
  const [image, setImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const fileInputRef = useRef(null);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Validation
    const validTypes = ['image/jpeg', 'image/png', 'image/gif'];
    if (!validTypes.includes(file.type)) {
      setError('Please upload a valid image file (JPEG, PNG, GIF).');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setError('Image size must be less than 5MB.');
      return;
    }

    setError('');
    setImage(file);
    setImagePreview(URL.createObjectURL(file));
  };

  const removeImage = () => {
    setImage(null);
    setImagePreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    // Check auth from local storage
    const storedUser = localStorage.getItem('user');
    let userId = null;
    
    if (storedUser) {
      try {
        const parsed = JSON.parse(storedUser);
        userId = parsed.id || parsed._id;
      } catch (err) {
        console.error('Error parsing user from local storage:', err);
      }
    }

    if (!userId) {
      setError('You must be logged in to report an item.');
      return;
    }

    if (!formData.title || !formData.description || !formData.name || !formData.contact) {
      setError('Please fill in all required fields.');
      return;
    }

    setLoading(true);

    try {
      const submitData = new FormData();
      submitData.append('type', type);
      submitData.append('title', formData.title);
      submitData.append('description', formData.description);
      submitData.append('name', formData.name);
      submitData.append('contact', formData.contact);
      
      if (image) {
        submitData.append('photo', image); // backend uses upload.single('photo')
      }

      const response = await fetch(`${API_URL}/lostandfound`, {
        method: 'POST',
        headers: {
          'x-user-id': userId
        },
        body: submitData
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to submit form');
      }

      setSuccess(`Your ${type === 'lost' ? 'Lost Item' : 'Found Item'} report has been successfully submitted.`);
      // Reset form
      setFormData({ title: '', description: '', name: '', contact: '' });
      removeImage();
      setType('lost');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const isLost = type === 'lost';
  const themeColor = isLost ? 'rose' : 'emerald';

  return (
    <div className="p-8 max-w-5xl mx-auto h-full overflow-y-auto">
      <div className="mb-8">
        <h1 className="text-4xl font-extrabold text-gray-900 dark:text-white tracking-tight">
          Lost & Found
        </h1>
        <p className="text-gray-500 dark:text-gray-400 mt-2 text-lg">
          Report lost items or post found items to help our community.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 pb-10">
        <div className="md:col-span-2 glass-card p-6 md:p-8 rounded-2xl shadow-xl bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700">
          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <div className="p-4 bg-red-50 dark:bg-red-900/30 border-l-4 border-red-500 rounded flex items-start text-red-700 dark:text-red-400 shadow-sm animate-fade-in">
                <AlertCircle className="w-5 h-5 mr-3 flex-shrink-0 mt-0.5" />
                <p className="text-sm font-medium">{error}</p>
              </div>
            )}
            {success && (
              <div className="p-4 bg-green-50 dark:bg-green-900/30 border-l-4 border-green-500 rounded flex items-start text-green-700 dark:text-green-400 shadow-sm animate-fade-in">
                <CheckCircle className="w-5 h-5 mr-3 flex-shrink-0 mt-0.5" />
                <p className="text-sm font-medium">{success}</p>
              </div>
            )}

            {/* Type Toggle */}
            <div className="flex gap-4 p-1.5 bg-gray-100 dark:bg-gray-900/50 rounded-xl shadow-inner">
              <label className={`flex-1 cursor-pointer relative py-3 rounded-lg text-center text-sm font-bold transition-all duration-300 flex items-center justify-center gap-2 ${isLost ? 'bg-white dark:bg-gray-800 text-rose-600 shadow ring-1 ring-gray-900/5 dark:ring-white/10' : 'text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 hover:bg-white/50 dark:hover:bg-gray-800/50'}`}>
                <input type="radio" name="type" value="lost" checked={isLost} onChange={() => setType('lost')} className="hidden" />
                <Search className="w-4 h-4" /> I Lost Something
              </label>
              <label className={`flex-1 cursor-pointer relative py-3 rounded-lg text-center text-sm font-bold transition-all duration-300 flex items-center justify-center gap-2 ${!isLost ? 'bg-white dark:bg-gray-800 text-emerald-600 shadow ring-1 ring-gray-900/5 dark:ring-white/10' : 'text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 hover:bg-white/50 dark:hover:bg-gray-800/50'}`}>
                <input type="radio" name="type" value="found" checked={!isLost} onChange={() => setType('found')} className="hidden" />
                <Package className="w-4 h-4" /> I Found Something
              </label>
            </div>

            <div className="space-y-5">
              <div>
                <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">Item Title</label>
                <input
                  type="text"
                  name="title"
                  value={formData.title}
                  onChange={handleInputChange}
                  placeholder={isLost ? "e.g., Missing Black Leather Wallet" : "e.g., Found Set of Keys near Elevator"}
                  className={`w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/50 focus:ring-2 focus:ring-${themeColor}-500 focus:border-transparent transition-all outline-none dark:text-white placeholder-gray-400 dark:placeholder-gray-500`}
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">Description</label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  rows="4"
                  placeholder="Provide details like color, brand, unique markings, and where it was last seen/found..."
                  className={`w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/50 focus:ring-2 focus:ring-${themeColor}-500 focus:border-transparent transition-all outline-none resize-none dark:text-white placeholder-gray-400 dark:placeholder-gray-500`}
                  required
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div>
                  <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">Your Name</label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    placeholder="Enter your full name"
                    className={`w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/50 focus:ring-2 focus:ring-${themeColor}-500 focus:border-transparent transition-all outline-none dark:text-white placeholder-gray-400 dark:placeholder-gray-500`}
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">Contact Information</label>
                  <input
                    type="text"
                    name="contact"
                    value={formData.contact}
                    onChange={handleInputChange}
                    placeholder="Phone number or Apartment No."
                    className={`w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/50 focus:ring-2 focus:ring-${themeColor}-500 focus:border-transparent transition-all outline-none dark:text-white placeholder-gray-400 dark:placeholder-gray-500`}
                    required
                  />
                </div>
              </div>

              {/* Image Upload */}
              <div>
                <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">Image (Optional)</label>
                <div className={`mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 dark:border-gray-600 border-dashed rounded-xl hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors ${imagePreview ? 'hidden' : ''}`}>
                  <div className="space-y-2 text-center">
                    <UploadCloud className={`mx-auto h-12 w-12 text-gray-400 group-hover:text-${themeColor}-500 transition-colors`} />
                    <div className="flex text-sm text-gray-600 dark:text-gray-400 justify-center">
                      <label htmlFor="file-upload" className={`cursor-pointer rounded-md font-bold text-${themeColor}-600 hover:text-${themeColor}-500 focus-within:outline-none transition-colors`}>
                        <span>Upload a file</span>
                        <input id="file-upload" name="file-upload" type="file" ref={fileInputRef} className="sr-only" onChange={handleImageChange} accept="image/jpeg, image/png, image/gif" />
                      </label>
                    </div>
                    <p className="text-xs text-gray-500">PNG, JPG, GIF up to 5MB</p>
                  </div>
                </div>

                {imagePreview && (
                  <div className="mt-4 relative rounded-xl overflow-hidden shadow-md max-w-sm group">
                    <img src={imagePreview} alt="Preview" className="w-full h-auto object-cover max-h-48 transition-transform duration-500 group-hover:scale-105" />
                    <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                    <button
                      type="button"
                      onClick={removeImage}
                      className="absolute top-3 right-3 bg-red-500 text-white rounded-full p-2 hover:bg-red-600 transition-all shadow-lg transform hover:scale-110"
                      title="Remove image"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                )}
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className={`w-full mt-2 flex justify-center py-4 px-4 rounded-xl shadow-lg text-sm font-bold text-white transition-all transform hover:-translate-y-0.5 ${loading ? 'opacity-70 cursor-not-allowed bg-gray-500' : isLost ? 'bg-rose-600 hover:bg-rose-700 hover:shadow-rose-500/25' : 'bg-emerald-600 hover:bg-emerald-700 hover:shadow-emerald-500/25'}`}
            >
              {loading ? (
                <span className="flex items-center gap-2">
                  <svg className="animate-spin -ml-1 mr-2 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Submitting Report...
                </span>
              ) : (
                <span className="flex items-center gap-2 text-base tracking-wide">
                  {isLost ? <Search className="w-5 h-5" /> : <Package className="w-5 h-5" />}
                  {isLost ? 'Submit Lost Item Report' : 'Post Found Item Details'}
                </span>
              )}
            </button>
          </form>
        </div>

        {/* Information Section */}
        <div className="md:col-span-1 space-y-6">
          <div className="bg-primary-50 dark:bg-primary-900/20 p-6 rounded-2xl border border-primary-100 dark:border-primary-800 shadow-sm transition-all hover:shadow-md">
            <h3 className="flex items-center text-lg font-bold text-primary-800 dark:text-primary-300 mb-5 gap-2 pb-3 border-b border-primary-100 dark:border-primary-800">
              <Info className="w-5 h-5" /> Tips for Reporting
            </h3>
            <ul className="space-y-4 text-sm text-primary-700 dark:text-primary-400">
              <li className="flex gap-3 items-start">
                <div className="w-1.5 h-1.5 rounded-full bg-primary-500 mt-1.5 flex-shrink-0"></div>
                <p><strong className="text-primary-800 dark:text-primary-300">Be Descriptive:</strong> Include brand, color, size, and any distinct features to help identify the item.</p>
              </li>
              <li className="flex gap-3 items-start">
                <div className="w-1.5 h-1.5 rounded-full bg-primary-500 mt-1.5 flex-shrink-0"></div>
                <p><strong className="text-primary-800 dark:text-primary-300">Add Photos:</strong> A clear picture significantly increases the chances of finding or returning an item.</p>
              </li>
              <li className="flex gap-3 items-start">
                <div className="w-1.5 h-1.5 rounded-full bg-primary-500 mt-1.5 flex-shrink-0"></div>
                <p><strong className="text-primary-800 dark:text-primary-300">Check Often:</strong> The dashboard is updated regularly. Keep an eye out for matches to your report.</p>
              </li>
              <li className="flex gap-3 items-start">
                <div className="w-1.5 h-1.5 rounded-full bg-primary-500 mt-1.5 flex-shrink-0"></div>
                <p><strong className="text-primary-800 dark:text-primary-300">Be Reachable:</strong> Ensure your contact details are accurate so others can reach out quickly.</p>
              </li>
            </ul>
          </div>
          
          <div className="bg-amber-50 dark:bg-amber-900/20 p-6 rounded-2xl border border-amber-100 dark:border-amber-800 shadow-sm transition-all hover:shadow-md">
            <h3 className="flex items-center text-lg font-bold text-amber-800 dark:text-amber-300 mb-3 gap-2">
              <AlertCircle className="w-5 h-5" /> Important Note
            </h3>
            <p className="text-sm text-amber-700 dark:text-amber-400 leading-relaxed">
              If you have found high-value items (wallets, official IDs, electronics), please consider turning them in directly to the <strong className="font-semibold">security desk</strong> or management office for safekeeping.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
