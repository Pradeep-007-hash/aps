import { useState, useEffect } from 'react';
import { PackageSearch, Search, CheckCircle, Clock } from 'lucide-react';

import api from '../services/api';

export default function DeliveryLog() {
  const [deliveries, setDeliveries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchDeliveries();
  }, []);

  const fetchDeliveries = async () => {
    try {
      setLoading(true);
      const res = await api.get('/deliveries');
      setDeliveries(res.data);
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Failed to fetch deliveries');
    } finally {
      setLoading(false);
    }
  };

  const markAsReceived = async (id) => {
    if (!window.confirm("Confirm that this delivery has been picked up by the resident?")) return;
    
    try {
      await api.put(`/deliveries/${id}/status`, { status: 'Received' });
      
      // Update local state directly to be snappy
      setDeliveries(deliveries.map(d => 
        d._id === id ? { ...d, status: 'Received' } : d
      ));
    } catch (err) {
      alert("Error: " + (err.response?.data?.error || err.message));
    }
  };

  const filteredDeliveries = deliveries.filter(d => {
    if (!searchTerm) return true;
    const term = searchTerm.toLowerCase();
    const sender = (d.sender_name || d.senderName || '').toLowerCase();
    const contact = (d.sender_contact || d.senderContact || '').toLowerCase();
    const door = (d.recipient_door_no || d.recipientDoorNo || '').toString().toLowerCase();
    const desc = (d.description || d.itemDescription || '').toLowerCase();
    const type = (d.delivery_type || d.deliveryType || '').toLowerCase();
    const status = (d.status || '').toLowerCase();
    
    return sender.includes(term) || contact.includes(term) || door.includes(term) || desc.includes(term) || type.includes(term) || status.includes(term);
  });

  if (loading) return <div className="p-8 flex items-center justify-center h-full text-primary-600"><span className="animate-pulse font-bold text-xl">Loading Delivery Log...</span></div>;
  if (error) return <div className="p-8 text-center text-red-500 font-bold h-full">Error: {error}</div>;

  return (
    <div className="p-8 max-w-7xl mx-auto h-full flex flex-col">
      <div className="mb-6 flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
        <div>
          <h1 className="text-4xl font-extrabold text-gray-900 dark:text-white tracking-tight flex items-center gap-3">
            <PackageSearch className="w-10 h-10 text-primary-500" /> Delivery Log
          </h1>
          <p className="text-gray-500 dark:text-gray-400 mt-2 text-lg">
            Track and manage parcel handovers securely.
          </p>
        </div>
        
        <div className="flex items-center bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg px-3 py-2 shadow-sm w-full md:w-auto">
          <Search className="w-5 h-5 text-gray-400 mr-2" />
          <input 
            type="text" 
            placeholder="Search deliveries..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="bg-transparent border-none outline-none text-gray-700 dark:text-gray-200 w-full md:w-64"
          />
          {searchTerm && (
            <button onClick={() => setSearchTerm('')} className="ml-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 text-lg leading-none">
              &times;
            </button>
          )}
        </div>
      </div>

      <div className="glass-card rounded-2xl shadow-xl border border-gray-100 dark:border-gray-800 flex-1 overflow-hidden bg-white dark:bg-gray-800/80 flex flex-col">
        <div className="overflow-x-auto flex-1">
          <table className="w-full min-w-[800px] text-left border-collapse">
            <thead>
              <tr className="bg-gray-50/50 dark:bg-gray-900/50 border-b border-gray-200 dark:border-gray-800 text-xs uppercase tracking-wider text-gray-500 dark:text-gray-400 font-bold">
                <th className="px-6 py-4">Sender Name</th>
                <th className="px-6 py-4">Sender Contact</th>
                <th className="px-6 py-4">Door No</th>
                <th className="px-6 py-4">Item Description</th>
                <th className="px-6 py-4">Delivery Type</th>
                <th className="px-6 py-4">Delivery Time</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-gray-800 text-sm">
              {filteredDeliveries.length === 0 ? (
                <tr>
                  <td colSpan="8" className="px-6 py-12 text-center text-gray-500 dark:text-gray-400 font-medium">
                    <Search className="w-12 h-12 mx-auto text-gray-300 dark:text-gray-600 mb-3" />
                    No deliveries found.
                  </td>
                </tr>
              ) : (
                filteredDeliveries.map((d) => (
                  <tr key={d._id} className="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors group">
                    <td className="px-6 py-4 font-bold text-gray-900 dark:text-white transition-colors">
                      {d.sender_name || d.senderName || 'N/A'}
                    </td>
                    <td className="px-6 py-4 text-gray-600 dark:text-gray-300">
                      {d.sender_contact || d.senderContact || <span className="text-gray-400 italic">N/A</span>}
                    </td>
                    <td className="px-6 py-4">
                      <span className="px-2.5 py-1 bg-indigo-100 text-indigo-800 dark:bg-indigo-900/40 dark:text-indigo-400 rounded-md font-bold text-xs ring-1 ring-indigo-200 dark:ring-indigo-800/50 shadow-sm">
                        {d.recipient_door_no || d.recipientDoorNo || 'N/A'}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-gray-900 dark:text-gray-200">{d.description || d.itemDescription || 'N/A'}</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wide">
                        {d.delivery_type || d.deliveryType || 'N/A'}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-gray-600 dark:text-gray-300">
                      <div className="font-medium text-gray-900 dark:text-gray-200">
                        {new Date(d.delivery_time || d.deliveryTime || d.createdAt).toLocaleDateString()}
                      </div>
                      <div className="text-xs text-gray-500 dark:text-gray-400 mt-0.5 font-mono">
                        {new Date(d.delivery_time || d.deliveryTime || d.createdAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      {d.status === 'Pending' ? (
                        <span className="flex items-center gap-1.5 text-amber-600 dark:text-amber-400 font-bold text-xs drop-shadow-sm">
                          <Clock className="w-4 h-4" /> Pending Pickup
                        </span>
                      ) : (
                        <span className="flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400 font-bold text-xs drop-shadow-sm">
                          <CheckCircle className="w-4 h-4" /> Received
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-right">
                      {d.status === 'Pending' && (
                        <button 
                          onClick={() => markAsReceived(d._id)}
                          className="px-3 py-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 dark:bg-emerald-900/20 dark:hover:bg-emerald-900/40 dark:text-emerald-400 rounded-lg text-xs font-bold transition-colors border border-emerald-200 dark:border-emerald-800/50 shadow-sm"
                        >
                          Mark Received
                        </button>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
