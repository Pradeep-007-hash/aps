import { useState, useEffect } from 'react';
import { History, Search, Download, Calendar } from 'lucide-react';
import * as XLSX from 'xlsx';

import api from '../services/api';

export default function PastVisitors() {
  const [visitors, setVisitors] = useState([]);
  const [filteredVisitors, setFilteredVisitors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [dateFilter, setDateFilter] = useState('');

  useEffect(() => {
    fetchVisitors();
  }, []);

  useEffect(() => {
    if (dateFilter) {
      setFilteredVisitors(visitors.filter(v => {
        const dateVal = v.entry_time || v.entryTime || v.createdAt;
        if (!dateVal) return false;
        try {
          const entryDate = new Date(dateVal).toISOString().split('T')[0];
          return entryDate === dateFilter;
        } catch (e) {
          return false;
        }
      }));
    } else {
      setFilteredVisitors(visitors);
    }
  }, [dateFilter, visitors]);

  const fetchVisitors = async () => {
    try {
      setLoading(true);
      const res = await api.get('/visitors');
      setVisitors(res.data);
      setFilteredVisitors(res.data);
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Failed to fetch visitors');
    } finally {
      setLoading(false);
    }
  };

  const clearFilter = () => {
    setDateFilter('');
  };

  const exportToExcel = () => {
    const exportData = filteredVisitors.map((v, index) => {
      const dateVal = v.entry_time || v.entryTime || v.createdAt;
      const parsedDate = dateVal ? new Date(dateVal) : null;
      return {
        'S.No': index + 1,
        'Name': v.name,
        'Contact': v.contact || 'N/A',
        'Door No': v.door_no || v.doorNo || 'N/A',
        'Purpose': v.purpose || 'N/A',
        'Vehicle No': v.vehicle_no || v.vehicleNumber || 'N/A',
        'Date': parsedDate ? parsedDate.toLocaleDateString() : 'N/A',
        'Time': parsedDate ? parsedDate.toLocaleTimeString() : 'N/A'
      };
    });

    const worksheet = XLSX.utils.json_to_sheet(exportData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Past Visitors");
    XLSX.writeFile(workbook, `Visitors_Log_${dateFilter || 'All'}.xlsx`);
  };

  if (loading) return <div className="p-8 flex items-center justify-center h-full text-primary-600"><span className="animate-pulse font-bold text-xl">Loading Visitors...</span></div>;
  if (error) return <div className="p-8 text-center text-red-500 font-bold h-full">Error: {error}</div>;

  return (
    <div className="p-8 max-w-7xl mx-auto h-full flex flex-col">
      <div className="mb-6 flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
        <div>
          <h1 className="text-4xl font-extrabold text-gray-900 dark:text-white tracking-tight flex items-center gap-3">
            <History className="w-10 h-10 text-primary-500" /> Past Visitors
          </h1>
          <p className="text-gray-500 dark:text-gray-400 mt-2 text-lg">
            Review history and export visitor logs.
          </p>
        </div>
        
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="flex items-center bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg px-3 py-2 shadow-sm text-sm">
            <Calendar className="w-4 h-4 text-gray-400 mr-2" />
            <input 
              type="date" 
              value={dateFilter} 
              onChange={(e) => setDateFilter(e.target.value)} 
              className="bg-transparent border-none outline-none text-gray-700 dark:text-gray-200 cursor-pointer"
            />
            {dateFilter && (
              <button onClick={clearFilter} className="ml-2 text-rose-500 hover:text-rose-700 font-bold px-1 transition-colors relative z-10">
                &times;
              </button>
            )}
          </div>
          <button 
            onClick={exportToExcel} 
            className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-bold shadow-sm flex items-center justify-center gap-2 transition-colors"
          >
            <Download className="w-4 h-4" /> Export Excel
          </button>
        </div>
      </div>

      <div className="glass-card rounded-2xl shadow-xl border border-gray-100 dark:border-gray-800 flex-1 overflow-hidden bg-white dark:bg-gray-800/80 flex flex-col">
        <div className="overflow-x-auto flex-1">
          <table className="w-full min-w-[800px] text-left border-collapse">
            <thead>
              <tr className="bg-gray-50/50 dark:bg-gray-900/50 border-b border-gray-200 dark:border-gray-800 text-xs uppercase tracking-wider text-gray-500 dark:text-gray-400 font-bold">
                <th className="px-6 py-4">Visitor Details</th>
                <th className="px-6 py-4">Contact</th>
                <th className="px-6 py-4">Target Door</th>
                <th className="px-6 py-4">Purpose / Vehicle</th>
                <th className="px-6 py-4 text-right">Entry Time</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-gray-800 text-sm">
              {filteredVisitors.length === 0 ? (
                <tr>
                  <td colSpan="5" className="px-6 py-12 text-center text-gray-500 dark:text-gray-400 font-medium">
                    <Search className="w-12 h-12 mx-auto text-gray-300 dark:text-gray-600 mb-3" />
                    No visitors found {dateFilter && 'for this date'}.
                  </td>
                </tr>
              ) : (
                filteredVisitors.map((v) => (
                  <tr key={v._id} className="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors group">
                    <td className="px-6 py-4">
                      <div className="font-bold text-gray-900 dark:text-white group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors">{v.name}</div>
                    </td>
                    <td className="px-6 py-4 text-gray-600 dark:text-gray-300">
                      {v.contact || <span className="text-gray-400 italic">N/A</span>}
                    </td>
                    <td className="px-6 py-4">
                      <span className="px-2.5 py-1 bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-400 rounded-md font-bold text-xs ring-1 ring-amber-200 dark:ring-amber-800/50">
                        {v.door_no || v.doorNo || 'N/A'}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-gray-900 dark:text-gray-200 max-w-[200px] truncate" title={v.purpose}>{v.purpose || 'Visit'}</div>
                      <div className="text-xs text-gray-500 dark:text-gray-400 mt-1 uppercase tracking-wide">{v.vehicle_no || v.vehicleNumber || 'No Vehicle'}</div>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="font-medium text-gray-900 dark:text-gray-200">
                        {(v.entry_time || v.entryTime || v.createdAt) ? new Date(v.entry_time || v.entryTime || v.createdAt).toLocaleDateString() : 'N/A'}
                      </div>
                      <div className="text-xs text-gray-500 dark:text-gray-400 mt-0.5 font-mono">
                        {(v.entry_time || v.entryTime || v.createdAt) ? new Date(v.entry_time || v.entryTime || v.createdAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}) : 'N/A'}
                      </div>
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
