import { useState, useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import Button from '../components/common/Button';
import { User, Mail, Phone, Home, Upload, X, ShieldCheck, Settings } from 'lucide-react';

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

export default function Profile() {
  const { user, login } = useAuth(); // login function securely saves to context
  const [profileData, setProfileData] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');
  
  // Edited state
  const [editForm, setEditForm] = useState({});
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewImage, setPreviewImage] = useState(null);
  
  const fileInputRef = useRef(null);

  useEffect(() => {
    fetchProfile();
  }, [user?.username]);

  const fetchProfile = async () => {
    if (!user?.username) return;
    try {
      const res = await fetch(`${API_URL}/user/profile/${user.username}`);
      const data = await res.json();
      if (res.ok) {
        setProfileData(data);
        setEditForm(data);
        if (data.image) {
          setPreviewImage(`data:image/jpeg;base64,${data.image}`);
        }
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setEditForm(prev => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setSelectedFile(file);
      setPreviewImage(URL.createObjectURL(file));
    }
  };

  const handleFamilyChange = (index, field, value) => {
    const newMembers = [...(editForm.family_members || [])];
    if (!newMembers[index]) newMembers[index] = {};
    newMembers[index][field] = value;
    setEditForm(prev => ({ ...prev, family_members: newMembers }));
  };

  const addFamilyMember = () => {
    setEditForm(prev => ({ 
      ...prev, 
      family_members: [...(prev.family_members || []), { name: '', age: '', gender: 'male', occupation: 'student' }] 
    }));
  };

  const removeFamilyMember = (index) => {
    setEditForm(prev => {
      const newMembers = [...(prev.family_members || [])];
      newMembers.splice(index, 1);
      return { ...prev, family_members: newMembers };
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setMessage('');

    try {
      const formData = new FormData();
      Object.keys(editForm).forEach(key => {
        if (key === 'family_members') {
          formData.append('family_members', JSON.stringify(editForm[key]));
        } else if (key !== 'image' && key !== '_id' && editForm[key] !== null) {
          formData.append(key, editForm[key]);
        }
      });
      
      if (selectedFile) {
        formData.append('photo', selectedFile);
      }

      const res = await fetch(`${API_URL}/user/profile/${user.username}`, {
        method: "PUT",
        body: formData,
      });

      const data = await res.json();
      if (res.ok) {
        setProfileData(data);
        setEditForm(data);
        setIsEditing(false);
        setMessage("Profile updated successfully!");
        login({ ...user, ...data });
      } else {
        setMessage(data.error || "Failed to update profile.");
      }
    } catch (err) {
      console.error(err);
      setMessage("Network error while saving profile.");
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="p-8"><p className="text-gray-500">Loading profile...</p></div>;
  if (!profileData) return <div className="p-8"><p className="text-red-500">Failed to load profile.</p></div>;

  return (
    <div className="p-8 max-w-5xl mx-auto h-full overflow-y-auto">
      <div className="flex justify-between items-end mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-800 dark:text-white tracking-tight transition-colors">User Profile</h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1 transition-colors">Manage your personal information, apartment details, and family preferences.</p>
        </div>
        {!isEditing && (
          <Button onClick={() => setIsEditing(true)} className="px-6 py-2">
            Edit Profile
          </Button>
        )}
      </div>

      {message && (
        <div className={`mb-6 p-4 rounded-xl text-sm font-medium ${message.includes("error") || message.includes("Failed") ? 'bg-red-50 text-red-700' : 'bg-green-50 text-green-700'}`}>
          {message}
        </div>
      )}

      <form onSubmit={isEditing ? handleSubmit : (e) => e.preventDefault()} className="space-y-8 pb-10">
        
        {/* Profile Header Card */}
        <div className="glass-card p-8 flex flex-col md:flex-row items-center gap-8 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-primary-100 dark:bg-primary-900/20 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 opacity-50"></div>
          
          <div className="relative group z-10">
            <div className="w-32 h-32 rounded-3xl overflow-hidden border-4 border-white dark:border-gray-800 shadow-xl bg-gray-100 dark:bg-gray-800 flex items-center justify-center">
              {previewImage ? (
                <img src={previewImage} alt="Profile" className="w-full h-full object-cover" />
              ) : (
                <User className="w-12 h-12 text-gray-400" />
              )}
            </div>
            {isEditing && (
              <button 
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="absolute -bottom-2 -right-2 w-10 h-10 bg-primary-600 hover:bg-primary-700 text-white rounded-full flex items-center justify-center shadow-lg transition-transform hover:scale-105"
              >
                <Upload className="w-5 h-5" />
              </button>
            )}
            <input 
              type="file" 
              ref={fileInputRef} 
              className="hidden" 
              accept="image/*" 
              onChange={handleFileChange} 
            />
          </div>

          <div className="flex-1 text-center md:text-left z-10">
            <div className="flex items-center justify-center md:justify-start gap-3 mb-2">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white transition-colors">
                {profileData.firstname} {profileData.lastname}
              </h2>
              {profileData.status === 'APPROVED' && (
                <ShieldCheck className="w-6 h-6 text-emerald-500" />
              )}
            </div>
            <p className="text-gray-500 dark:text-gray-400 font-medium capitalize mb-4 transition-colors">
              Role: <span className="text-primary-600 dark:text-primary-400">{profileData.role}</span>
            </p>
            <div className="flex flex-wrap items-center justify-center md:justify-start gap-4 text-sm font-medium text-gray-600 dark:text-gray-300 transition-colors">
              <span className="flex items-center gap-1.5"><Mail className="w-4 h-4 text-gray-400" /> {profileData.email}</span>
              <span className="flex items-center gap-1.5"><Phone className="w-4 h-4 text-gray-400" /> {profileData.phone}</span>
              <span className="flex items-center gap-1.5"><Home className="w-4 h-4 text-gray-400" /> Apt {profileData.apartment || profileData.door_no || 'N/A'}</span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Personal Details */}
          <div className="glass-card p-6">
            <h3 className="text-lg font-bold text-gray-800 dark:text-white mb-5 flex items-center gap-2 transition-colors">
              <User className="w-5 h-5 text-primary-500" /> Personal Details
            </h3>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1 transition-colors">First Name</label>
                  {isEditing ? (
                    <input type="text" name="firstname" value={editForm.firstname || ''} onChange={handleChange} className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-sm text-gray-900 dark:text-white transition-colors" />
                  ) : (
                    <p className="font-semibold text-gray-800 dark:text-gray-200 transition-colors">{profileData.firstname || '-'}</p>
                  )}
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1 transition-colors">Last Name</label>
                  {isEditing ? (
                    <input type="text" name="lastname" value={editForm.lastname || ''} onChange={handleChange} className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-sm text-gray-900 dark:text-white transition-colors" />
                  ) : (
                    <p className="font-semibold text-gray-800 dark:text-gray-200 transition-colors">{profileData.lastname || '-'}</p>
                  )}
                </div>
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1 transition-colors">Phone Number</label>
                {isEditing ? (
                  <input type="tel" name="phone" value={editForm.phone || ''} onChange={handleChange} className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-sm text-gray-900 dark:text-white transition-colors" />
                ) : (
                  <p className="font-semibold text-gray-800 dark:text-gray-200 transition-colors">{profileData.phone || '-'}</p>
                )}
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1 transition-colors">Email Address</label>
                {isEditing ? (
                  <input type="email" name="email" value={editForm.email || ''} onChange={handleChange} className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-sm text-gray-900 dark:text-white transition-colors" />
                ) : (
                  <p className="font-semibold text-gray-800 dark:text-gray-200 transition-colors">{profileData.email || '-'}</p>
                )}
              </div>
            </div>
          </div>

          {/* Apartment Details */}
          <div className="glass-card p-6">
            <h3 className="text-lg font-bold text-gray-800 dark:text-white mb-5 flex items-center gap-2 transition-colors">
              <Home className="w-5 h-5 text-indigo-500" /> Apartment Details
            </h3>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1 transition-colors">Floor No</label>
                  {isEditing ? (
                    <input type="text" name="floor_no" value={editForm.floor_no || ''} onChange={handleChange} className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-sm text-gray-900 dark:text-white transition-colors" />
                  ) : (
                    <p className="font-semibold text-gray-800 dark:text-gray-200 transition-colors">{profileData.floor_no || '-'}</p>
                  )}
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1 transition-colors">Door No</label>
                  {isEditing ? (
                    <input type="text" name="door_no" value={editForm.door_no || ''} onChange={handleChange} className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-sm text-gray-900 dark:text-white transition-colors" />
                  ) : (
                    <p className="font-semibold text-gray-800 dark:text-gray-200 transition-colors">{profileData.door_no || '-'}</p>
                  )}
                </div>
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1 transition-colors">Apartment Name</label>
                {isEditing ? (
                  <input type="text" name="apartment" value={editForm.apartment || ''} onChange={handleChange} className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-sm text-gray-900 dark:text-white transition-colors" />
                ) : (
                  <p className="font-semibold text-gray-800 dark:text-gray-200 transition-colors">{profileData.apartment || '-'}</p>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Family Details */}
        {(profileData.role === 'member' || profileData.family_details) && (
          <div className="glass-card p-6">
            <div className="flex justify-between items-center mb-5">
              <h3 className="text-lg font-bold text-gray-800 dark:text-white flex items-center gap-2 transition-colors">
                <Settings className="w-5 h-5 text-emerald-500" /> Family Members
              </h3>
            </div>
            
            {!isEditing ? (
              <div className="space-y-4">
                {profileData.family_members && profileData.family_members.length > 0 ? (
                  profileData.family_members.map((member, idx) => (
                    <div key={idx} className="bg-gray-50 dark:bg-gray-800 p-4 rounded-xl flex items-center justify-between transition-colors">
                      <div>
                        <p className="font-bold text-gray-900 dark:text-white">{member.name}</p>
                        <p className="text-sm text-gray-500 dark:text-gray-400">{member.age} yrs • {member.gender} • {member.occupation}</p>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-gray-500 dark:text-gray-400 transition-colors">No family members registered.</p>
                )}
              </div>
            ) : (
              <div className="space-y-4">
                {(editForm.family_members || []).map((member, index) => (
                  <div key={index} className="bg-gray-50 dark:bg-gray-800 p-4 rounded-xl relative transition-colors">
                    <button type="button" onClick={() => removeFamilyMember(index)} className="absolute top-4 right-4 text-red-500 hover:text-red-700">
                      <X className="w-5 h-5" />
                    </button>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mr-8">
                      <div>
                        <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 mb-1">Name</label>
                        <input type="text" value={member.name || ''} onChange={(e) => handleFamilyChange(index, 'name', e.target.value)} className="w-full px-3 py-2 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg text-sm text-gray-900 dark:text-white" />
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 mb-1">Age</label>
                        <input type="text" value={member.age || ''} onChange={(e) => handleFamilyChange(index, 'age', e.target.value)} className="w-full px-3 py-2 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg text-sm text-gray-900 dark:text-white" />
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 mb-1">Gender</label>
                        <select value={member.gender || 'male'} onChange={(e) => handleFamilyChange(index, 'gender', e.target.value)} className="w-full px-3 py-2 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg text-sm text-gray-900 dark:text-white">
                          <option value="male">Male</option>
                          <option value="female">Female</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 mb-1">Occupation</label>
                        <input type="text" value={member.occupation || ''} onChange={(e) => handleFamilyChange(index, 'occupation', e.target.value)} className="w-full px-3 py-2 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg text-sm text-gray-900 dark:text-white" />
                      </div>
                    </div>
                  </div>
                ))}
                <button type="button" onClick={addFamilyMember} className="w-full py-3 border-2 border-dashed border-gray-300 dark:border-gray-700 rounded-xl text-gray-600 dark:text-gray-400 font-bold hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                  + Add Family Member
                </button>
              </div>
            )}
          </div>
        )}

        {isEditing && (
          <div className="flex justify-end gap-4 pt-4 sticky bottom-0 bg-slate-50/80 dark:bg-gray-950/80 backdrop-blur-md p-4 rounded-xl shadow-[0_-10px_15px_-3px_rgba(0,0,0,0.05)] border border-gray-100 dark:border-gray-800 transition-colors z-20">
            <Button 
              type="button" 
              variant="secondary"
              onClick={() => {
                setIsEditing(false);
                setEditForm(profileData);
                if (profileData.image) setPreviewImage(`data:image/jpeg;base64,${profileData.image}`);
                else setPreviewImage(null);
                setSelectedFile(null);
              }} 
              className="transition-colors"
            >
              Cancel
            </Button>
            <Button type="submit" disabled={saving}>
              {saving ? 'Saving...' : 'Save Profile'}
            </Button>
          </div>
        )}

      </form>
    </div>
  );
}
