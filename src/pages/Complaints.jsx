import { useState } from 'react';
import Button from '../components/common/Button';
import { Plus } from 'lucide-react';

export default function Complaints() {
  const [complaints] = useState([
    { id: '#CMP-001', title: 'Leaky Faucet in Kitchen', status: 'Pending', date: 'Oct 10, 2023', type: 'Plumbing' },
    { id: '#CMP-002', title: 'Hallway Light Broken', status: 'Resolved', date: 'Oct 05, 2023', type: 'Electrical' },
    { id: '#CMP-003', title: 'Gym Equipment Maintenance', status: 'In Progress', date: 'Oct 12, 2023', type: 'Facility' },
  ]);

  const getStatusStyle = (status) => {
    switch(status) {
      case 'Resolved': return 'bg-green-100 text-green-700 border-green-200';
      case 'In Progress': return 'bg-primary-100 text-primary-700 border-primary-200';
      default: return 'bg-orange-100 text-orange-700 border-orange-200';
    }
  };

  return (
    <div className="space-y-8 animate-fade-in-up">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-800 tracking-tight">Complaints</h1>
          <p className="text-gray-500 mt-1">Manage and track your service requests.</p>
        </div>
        <Button className="pl-3 pr-5">
          <Plus className="w-5 h-5 mr-1" /> New Complaint
        </Button>
      </div>
      
      <div className="glass-card overflow-hidden shadow-sm">
        <table className="w-full text-left border-collapse whitespace-nowrap">
          <thead>
            <tr className="bg-gray-50/50 text-gray-500 text-xs uppercase tracking-widest border-b border-gray-100">
              <th className="px-6 py-4 font-semibold">ID</th>
              <th className="px-6 py-4 font-semibold">Issue</th>
              <th className="px-6 py-4 font-semibold">Category</th>
              <th className="px-6 py-4 font-semibold">Date Raised</th>
              <th className="px-6 py-4 font-semibold">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {complaints.map((c) => (
              <tr key={c.id} className="hover:bg-primary-50/30 transition-colors cursor-pointer group">
                <td className="px-6 py-5 font-bold text-gray-500">{c.id}</td>
                <td className="px-6 py-5 font-semibold text-gray-900 group-hover:text-primary-600 transition-colors">{c.title}</td>
                <td className="px-6 py-5">
                  <span className="bg-gray-100 text-gray-600 px-3 py-1 rounded-lg text-sm font-medium">{c.type}</span>
                </td>
                <td className="px-6 py-5 text-gray-500 font-medium">{c.date}</td>
                <td className="px-6 py-5">
                  <span className={`px-3 py-1.5 rounded-lg text-xs font-bold border ${getStatusStyle(c.status)}`}>
                    {c.status}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
