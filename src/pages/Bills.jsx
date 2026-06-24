import Button from '../components/common/Button';
import { Download, CreditCard, Receipt } from 'lucide-react';

export default function Bills() {
  const bills = [
    { id: 'INV-1025', month: 'October 2023', amount: 150, status: 'Due Soon', type: 'Maintenance' },
    { id: 'INV-1011', month: 'September 2023', amount: 150, status: 'Paid', type: 'Maintenance' },
    { id: 'INV-0985', month: 'August 2023', amount: 200, status: 'Paid', type: 'Water & Maintenance' },
  ];

  return (
    <div className="space-y-8 animate-fade-in-up">
      <div>
        <h1 className="text-3xl font-bold text-gray-800 dark:text-white tracking-tight">Billing & Payments</h1>
        <p className="text-gray-500 dark:text-gray-400 mt-1">View invoices and manage your balances.</p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <div className="glass-card p-8 bg-gradient-to-br from-primary-600 to-indigo-800 text-white relative overflow-hidden shadow-xl shadow-primary-900/20 rounded-2xl border-none">
          <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>
          <div className="absolute bottom-0 left-0 w-48 h-48 bg-indigo-500/20 rounded-full blur-3xl translate-y-1/3 -translate-x-1/4"></div>
          
          <div className="relative z-10">
            <div className="flex justify-between items-start mb-2">
              <p className="text-primary-100 font-medium uppercase tracking-wider text-sm">Total Balance</p>
              <Receipt className="w-6 h-6 text-primary-200" />
            </div>
            <div className="flex items-end gap-4 mb-2">
              <h2 className="text-6xl font-extrabold tracking-tight">$150.00</h2>
            </div>
            <p className="text-primary-200 text-sm font-medium bg-white/10 inline-block px-3 py-1 rounded-full backdrop-blur-sm border border-white/10">Due by Oct 15, 2023</p>
            
            <div className="mt-8 flex gap-4">
              <button className="bg-white text-primary-800 px-6 py-3 rounded-xl font-bold shadow-lg shadow-black/10 hover:shadow-xl hover:-translate-y-0.5 transition-all flex items-center gap-2 w-full justify-center">
                <CreditCard className="w-5 h-5" /> Pay Balance Now
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="glass-card overflow-hidden shadow-sm rounded-2xl">
        <div className="p-6 border-b border-gray-100 dark:border-gray-800 bg-gray-50/30 dark:bg-gray-800/30">
          <h3 className="text-lg font-bold text-gray-800 dark:text-white">Recent Invoices</h3>
        </div>
        <table className="w-full text-left whitespace-nowrap">
          <thead>
            <tr className="bg-white dark:bg-gray-900/50 text-gray-400 dark:text-gray-400 text-xs uppercase tracking-widest border-b border-gray-100 dark:border-gray-800">
              <th className="px-6 py-4 font-bold">Invoice ID</th>
              <th className="px-6 py-4 font-bold">Billing Period</th>
              <th className="px-6 py-4 font-bold">Amount</th>
              <th className="px-6 py-4 font-bold">Status</th>
              <th className="px-6 py-4 font-bold text-right">Download</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50 dark:divide-gray-800/50">
            {bills.map((bill) => (
              <tr key={bill.id} className="hover:bg-primary-50/30 dark:hover:bg-primary-900/10 transition-colors group">
                <td className="px-6 py-5 font-bold text-gray-900 dark:text-white flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-gray-50 dark:bg-gray-800 flex items-center justify-center text-gray-400 dark:text-gray-500 group-hover:bg-primary-100 dark:group-hover:bg-primary-900/50 group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors">
                    <Receipt className="w-5 h-5" />
                  </div>
                  {bill.id}
                </td>
                <td className="px-6 py-5">
                  <p className="font-semibold text-gray-800 dark:text-white">{bill.month}</p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">{bill.type}</p>
                </td>
                <td className="px-6 py-5 font-extrabold text-gray-900 dark:text-white text-lg">${bill.amount}</td>
                <td className="px-6 py-5">
                  <span className={`px-3 py-1.5 rounded-lg text-xs font-bold border ${
                    bill.status === 'Paid' 
                      ? 'bg-green-100 dark:bg-green-950/30 text-green-700 dark:text-green-400 border-green-200 dark:border-green-800/30' 
                      : 'bg-orange-100 dark:bg-orange-950/30 text-orange-700 dark:text-orange-400 border-orange-200 dark:border-orange-800/30'
                  }`}>
                    {bill.status}
                  </span>
                </td>
                <td className="px-6 py-5 text-right">
                  <button className="p-2.5 text-gray-400 dark:text-gray-500 hover:text-primary-600 dark:hover:text-primary-400 hover:bg-primary-100 dark:hover:bg-primary-900/50 rounded-xl transition-all inline-block hover:shadow-sm">
                    <Download className="w-5 h-5" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
