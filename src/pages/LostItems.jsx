import { useState, useEffect } from 'react';
import { Search, Package, Calendar, User, Phone, Trash2, Plus } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

export default function LostItems() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filter, setFilter] = useState('all'); // 'all', 'lost', 'found'
  const navigate = useNavigate();

  const storedUser = localStorage.getItem('user');
  let currentUser = null;
  try {
    if (storedUser) currentUser = JSON.parse(storedUser);
  } catch (e) {}
  
  const isAdmin = currentUser?.role === 'admin';

  useEffect(() => {
    fetchItems();
  }, []);

  const fetchItems = async () => {
    try {
      setLoading(true);
      const res = await fetch(`${API_URL}/lostandfound`);
      if (!res.ok) throw new Error('Failed to fetch items');
      const data = await res.json();
      setItems(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (itemId) => {
    if (!window.confirm("Are you sure you want to delete this report?")) return;
    
    try {
      const res = await fetch(`${API_URL}/lostandfound/${itemId}`, {
        method: 'DELETE',
        headers: {
          'x-user-id': currentUser?.id || currentUser?._id
        }
      });
      
      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || 'Failed to delete');
      }
      
      setItems(items.filter(item => item._id !== itemId));
    } catch (err) {
      alert("Error: " + err.message);
    }
  };

  const filteredItems = items.filter(item => filter === 'all' || item.type === filter);

  if (loading) return <div className="p-8 flex items-center justify-center text-primary-600 h-full"><span className="animate-pulse font-bold text-xl">Loading Items...</span></div>;
  if (error) return <div className="p-8 text-center text-red-500 font-bold h-full">Error: {error}</div>;

  return (
    <div className="p-8 max-w-7xl mx-auto h-full overflow-y-auto">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-8 gap-4">
        <div>
          <h1 className="text-4xl font-extrabold text-gray-900 dark:text-white tracking-tight">
            Lost & Found Items
          </h1>
          <p className="text-gray-500 dark:text-gray-400 mt-2 text-lg">
            Browse items reported as lost or found in the community.
          </p>
        </div>
        
        <div className="flex gap-3 flex-wrap">
          <div className="bg-gray-100 dark:bg-gray-800 p-1.5 rounded-lg flex shadow-inner">
            <button 
              onClick={() => setFilter('all')} 
              className={`px-4 py-2 rounded-md text-sm font-bold transition-all ${filter === 'all' ? 'bg-white dark:bg-gray-700 shadow text-primary-600 dark:text-primary-400' : 'text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'}`}
            >
              All
            </button>
            <button 
              onClick={() => setFilter('lost')} 
              className={`px-4 py-2 rounded-md text-sm font-bold transition-all flex items-center gap-1 ${filter === 'lost' ? 'bg-white dark:bg-gray-700 shadow text-rose-600' : 'text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'}`}
            >
              <Search className="w-4 h-4 hidden sm:block" /> Lost
            </button>
            <button 
              onClick={() => setFilter('found')} 
              className={`px-4 py-2 rounded-md text-sm font-bold transition-all flex items-center gap-1 ${filter === 'found' ? 'bg-white dark:bg-gray-700 shadow text-emerald-600' : 'text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'}`}
            >
              <Package className="w-4 h-4 hidden sm:block" /> Found
            </button>
          </div>
          <button 
            onClick={() => navigate('/lost-and-found')}
            className="px-5 py-2.5 bg-primary-600 hover:bg-primary-700 text-white rounded-lg font-bold shadow-lg transition-transform hover:scale-105 flex items-center gap-2"
          >
            <Plus className="w-5 h-5" /> Report Item
          </button>
        </div>
      </div>

      {filteredItems.length === 0 ? (
        <div className="glass-card p-12 text-center mt-8 border border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-800/80 rounded-2xl">
          <Search className="w-16 h-16 mx-auto text-gray-300 dark:text-gray-600 mb-4" />
          <h3 className="text-xl font-bold text-gray-700 dark:text-gray-200">No Items Found</h3>
          <p className="text-gray-500 dark:text-gray-400 mt-2">
            There are currently no {filter !== 'all' ? filter : ''} items reported.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 pb-10">
          {filteredItems.map(item => {
            const isLost = item.type === 'lost';
            
            return (
              <div key={item._id} className="glass-card rounded-2xl overflow-hidden flex flex-col shadow-lg border border-gray-100 dark:border-gray-700 hover:shadow-2xl hover:shadow-primary-500/10 transition-all duration-300 transform hover:-translate-y-1 bg-white dark:bg-gray-800">
                <div className="relative h-56 bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-700 dark:to-gray-800 overflow-hidden">
                  {item.image ? (
                    <img src={`data:image/jpeg;base64,${item.image}`} alt={item.title} className="w-full h-full object-cover transition-transform duration-700 hover:scale-110" />
                  ) : (
                    <div className="w-full h-full flex flex-col items-center justify-center text-gray-400">
                      {isLost ? <Search className="w-12 h-12 mb-2 opacity-30" /> : <Package className="w-12 h-12 mb-2 opacity-30" />}
                      <span className="font-medium text-sm">No image available</span>
                    </div>
                  )}
                  <div className={`absolute top-4 left-4 text-xs font-black uppercase tracking-wider px-3 py-1.5 rounded-full shadow-sm backdrop-blur ${isLost ? 'bg-rose-100/90 text-rose-700 dark:bg-rose-900/90 dark:text-rose-300' : 'bg-emerald-100/90 text-emerald-700 dark:bg-emerald-900/90 dark:text-emerald-300'}`}>
                    {isLost ? 'LOST' : 'FOUND'}
                  </div>
                  {isAdmin && (
                    <button 
                      onClick={() => handleDelete(item._id)}
                      className="absolute top-4 right-4 bg-white/90 dark:bg-gray-900/90 text-red-500 p-2 rounded-lg shadow hover:bg-red-50 dark:hover:bg-gray-800 transition-colors"
                      title="Delete Report"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
                
                <div className="p-6 flex-1 flex flex-col">
                  <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2 line-clamp-2">{item.title}</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-300 mb-6 flex-1 line-clamp-3">
                    {item.description}
                  </p>
                  
                  <div className="space-y-3 mt-auto text-sm bg-gray-50 dark:bg-gray-900/50 p-4 rounded-xl">
                    <div className="flex items-center text-gray-700 dark:text-gray-300 gap-3">
                      <User className="w-4 h-4 text-primary-500 flex-shrink-0" />
                      <span className="font-medium truncate">{item.name} {item.posterName && `(${item.posterName})`}</span>
                    </div>
                    <div className="flex items-center text-gray-700 dark:text-gray-300 gap-3">
                      <Phone className="w-4 h-4 text-amber-500 flex-shrink-0" />
                      <span className="font-medium truncate">{item.contact}</span>
                    </div>
                    <div className="flex items-center text-gray-500 dark:text-gray-500 gap-3 text-xs mt-3 pt-3 border-t border-gray-200 dark:border-gray-700 font-medium">
                      <Calendar className="w-3.5 h-3.5 flex-shrink-0" />
                      <span>Reported on {new Date(item.createdAt).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })}</span>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
