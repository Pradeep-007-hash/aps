import { useState, useEffect } from 'react';
import { Users, User, UserX, CheckCircle, XCircle, Shield, Mail, Phone, Home, Trash2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

export default function ViewUsers() {
  const { user } = useAuth();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState('requests'); // 'requests' or 'residents'

  useEffect(() => {
    fetchUsers();
  }, [user]);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const res = await fetch(`${API_URL}/admin/users`, {
        headers: { 'x-user-id': user?.id }
      });
      if (!res.ok) throw new Error('Failed to fetch users');
      const data = await res.json();
      setUsers(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleAction = async (targetId, action) => {
    const isApproval = action === 'approve';
    const confirmMessage = isApproval 
      ? 'Are you sure you want to approve this resident?' 
      : 'Are you sure you want to remove this user from the system permanently?';
      
    if (!window.confirm(confirmMessage)) return;
    
    try {
      const endpoint = isApproval ? '/approve-user' : '/reject-user';
      const res = await fetch(`${API_URL}${endpoint}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-user-id': user?.id
        },
        body: JSON.stringify({ id: targetId })
      });
      
      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.error || `Failed to ${action} user`);
      }
      
      // Refresh list
      fetchUsers();
    } catch (err) {
      alert("Error: " + err.message);
    }
  };

  const pendingUsers = users.filter(u => u.status === 'PENDING');
  const approvedUsers = users.filter(u => u.status === 'APPROVED');

  const displayedUsers = activeTab === 'requests' ? pendingUsers : approvedUsers;

  if (loading) return <div className="p-8 flex justify-center items-center h-full text-primary-600"><span className="animate-pulse font-bold text-xl">Loading Users...</span></div>;
  if (error) return <div className="p-8 text-center text-red-500 font-bold h-full flex justify-center items-center">Error: {error}</div>;

  return (
    <div className="p-8 max-w-7xl mx-auto h-full overflow-y-auto">
      <div className="mb-8 flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
        <div>
          <h1 className="text-4xl font-extrabold text-gray-900 dark:text-white tracking-tight flex items-center gap-3 transition-colors">
            <Shield className="w-10 h-10 text-primary-500" /> Admin Dashboard
          </h1>
          <p className="text-gray-500 dark:text-gray-400 mt-2 text-lg transition-colors">
            Manage apartment residents and approval requests via the portal.
          </p>
        </div>
        
        <div className="bg-gray-100 dark:bg-gray-800 p-1.5 rounded-lg flex shadow-inner transition-colors border border-gray-200 dark:border-gray-700">
          <button 
            onClick={() => setActiveTab('requests')} 
            className={`px-5 py-2.5 rounded-md text-sm font-bold transition-all flex items-center gap-2 ${activeTab === 'requests' ? 'bg-white dark:bg-gray-700 shadow text-amber-600 dark:text-amber-400 border border-amber-100 dark:border-amber-900/30' : 'text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 hover:bg-white/50 dark:hover:bg-gray-700/50'}`}
          >
            Pending Requests 
            {pendingUsers.length > 0 && (
              <span className="bg-amber-500 text-white text-xs px-2 py-0.5 rounded-full">{pendingUsers.length}</span>
            )}
          </button>
          <button 
            onClick={() => setActiveTab('residents')} 
            className={`px-5 py-2.5 rounded-md text-sm font-bold transition-all flex items-center gap-2 ${activeTab === 'residents' ? 'bg-white dark:bg-gray-700 shadow text-emerald-600 dark:text-emerald-400 border border-emerald-100 dark:border-emerald-900/30' : 'text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 hover:bg-white/50 dark:hover:bg-gray-700/50'}`}
          >
            Approved Residents 
            <span className="bg-gray-200 dark:bg-gray-600 text-gray-700 dark:text-gray-300 text-xs px-2 py-0.5 rounded-full min-w-[1.5rem] text-center transition-colors">{approvedUsers.length}</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 pb-10">
        {displayedUsers.length === 0 ? (
          <div className="col-span-full glass-card p-12 text-center mt-4 border border-gray-100 dark:border-gray-800 transition-colors">
            {activeTab === 'requests' ? <UserX className="w-16 h-16 mx-auto text-gray-300 dark:text-gray-600 mb-4 transition-colors" /> : <Users className="w-16 h-16 mx-auto text-gray-300 dark:text-gray-600 mb-4 transition-colors" />}
            <h3 className="text-xl font-bold text-gray-700 dark:text-gray-200 transition-colors">
              {activeTab === 'requests' ? 'No Pending Requests' : 'No Residents Found'}
            </h3>
            <p className="text-gray-500 dark:text-gray-400 mt-2 transition-colors">
              {activeTab === 'requests' ? "There are currently no users waiting for approval." : "There are no approved users in the system yet."}
            </p>
          </div>
        ) : (
          displayedUsers.map(userItem => (
            <div key={userItem._id} className="glass-card flex flex-col rounded-2xl overflow-hidden shadow-lg border border-gray-100 dark:border-gray-700 hover:shadow-xl hover:shadow-primary-500/5 transition-all duration-300 bg-white dark:bg-gray-800">
              <div className={`h-2 w-full ${activeTab === 'requests' ? 'bg-amber-400' : 'bg-emerald-400'}`}></div>
              <div className="p-6">
                <div className="flex justify-between items-start mb-4 gap-2">
                  <div className="flex items-center gap-4 overflow-hidden">
                    <div className="w-12 h-12 rounded-full overflow-hidden border-2 border-primary-100 dark:border-primary-900/50 shadow-sm bg-gray-100 dark:bg-gray-800 flex items-center justify-center flex-shrink-0">
                      {userItem.image ? (
                        <img src={`data:image/jpeg;base64,${userItem.image}`} alt={`${userItem.firstname} ${userItem.lastname}`} className="w-full h-full object-cover" />
                      ) : (
                        <User className="w-6 h-6 text-gray-400" />
                      )}
                    </div>
                    <div className="overflow-hidden">
                      <h3 className="text-lg font-bold text-gray-900 dark:text-white truncate transition-colors leading-tight">
                        {userItem.firstname} {userItem.lastname}
                      </h3>
                      <p className="text-sm text-gray-500 dark:text-gray-400 font-medium transition-colors truncate mt-0.5">@{userItem.username || 'user'}</p>
                    </div>
                  </div>
                  <div className={`flex-shrink-0 px-2.5 py-1 rounded-md text-[10px] font-black uppercase tracking-wider transition-colors mt-1 ${activeTab === 'requests' ? 'bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-400 border border-amber-200 dark:border-amber-800/50' : 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800/50'}`}>
                    {activeTab === 'requests' ? 'Pending' : 'Resident'}
                  </div>
                </div>

                <div className="space-y-3 mb-6 bg-gray-50 dark:bg-gray-900/50 p-4 rounded-xl text-sm border border-gray-100 dark:border-gray-800 transition-colors">
                  <div className="flex flex-col gap-1">
                    <span className="text-xs text-gray-400 dark:text-gray-500 uppercase font-bold tracking-wider transition-colors">Contact</span>
                    <div className="flex items-center gap-2 text-gray-700 dark:text-gray-300 transition-colors">
                      <Mail className="w-4 h-4 text-primary-500 flex-shrink-0" /> <span className="truncate">{userItem.email}</span>
                    </div>
                    {userItem.phone && (
                      <div className="flex items-center gap-2 text-gray-700 dark:text-gray-300 mt-1 transition-colors">
                        <Phone className="w-4 h-4 text-emerald-500 flex-shrink-0" /> <span className="truncate">{userItem.phone}</span>
                      </div>
                    )}
                  </div>
                  
                  <div className="border-t border-gray-200 dark:border-gray-700 pt-3 flex flex-col gap-1 transition-colors">
                    <span className="text-xs text-gray-400 dark:text-gray-500 uppercase font-bold tracking-wider transition-colors">Apartment Details</span>
                    <div className="flex items-center gap-2 text-gray-700 dark:text-gray-300 transition-colors">
                      <Home className="w-4 h-4 text-indigo-500 flex-shrink-0" />
                      <span className="truncate">{userItem.floor_no ? `Floor ${userItem.floor_no}, ` : ''} Door {userItem.door_no || 'N/A'}</span>
                    </div>
                  </div>
                </div>

                <div className="mt-auto grid grid-cols-2 gap-3">
                  {activeTab === 'requests' ? (
                    <>
                      <button 
                        onClick={() => handleAction(userItem._id, 'approve')}
                        className="flex items-center justify-center gap-2 py-2.5 bg-emerald-100/80 hover:bg-emerald-200 text-emerald-700 dark:bg-emerald-900/40 dark:hover:bg-emerald-900/60 dark:text-emerald-400 font-bold rounded-lg transition-colors border border-emerald-200/50 dark:border-emerald-800/50 shadow-sm hover:shadow"
                      >
                        <CheckCircle className="w-4 h-4" /> Approve
                      </button>
                      <button 
                        onClick={() => handleAction(userItem._id, 'reject')}
                        className="flex items-center justify-center gap-2 py-2.5 bg-red-100/80 hover:bg-red-200 text-red-700 dark:bg-red-900/40 dark:hover:bg-red-900/60 dark:text-red-400 font-bold rounded-lg transition-colors border border-red-200/50 dark:border-red-800/50 shadow-sm hover:shadow"
                      >
                        <XCircle className="w-4 h-4" /> Reject
                      </button>
                    </>
                  ) : (
                    <>
                      <div 
                        className="flex items-center justify-center gap-2 py-2.5 bg-gray-100 text-gray-400 dark:bg-gray-900/50 dark:text-gray-600 font-bold rounded-lg cursor-not-allowed border border-gray-200 dark:border-gray-800 transition-colors"
                      >
                        <CheckCircle className="w-4 h-4" /> Approved
                      </div>
                      <button 
                        onClick={() => handleAction(userItem._id, 'remove')} 
                        className="flex items-center justify-center gap-2 py-2.5 bg-rose-50 hover:bg-rose-100 text-rose-600 dark:bg-rose-900/20 dark:hover:bg-rose-900/40 dark:text-rose-400 font-bold rounded-lg transition-colors border border-rose-100 dark:border-rose-900/30 shadow-sm hover:shadow"
                      >
                        <Trash2 className="w-4 h-4" /> Remove
                      </button>
                    </>
                  )}
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
