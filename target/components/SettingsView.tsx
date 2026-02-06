
import React, { useState, useRef } from 'react';
import { User, UserNotifications } from '../types';
import { api } from '../api';
import { Camera, Save, ArrowLeft, User as UserIcon, Mail, Info, CheckCircle, Loader2, Bell, FileText, MessageSquare, Inbox } from 'lucide-react';

interface SettingsViewProps {
  user: User;
  onUpdate: (user: User) => void;
  onBack: () => void;
}

const SettingsView: React.FC<SettingsViewProps> = ({ user, onUpdate, onBack }) => {
  const [name, setName] = useState(user.name);
  const [bio, setBio] = useState(user.bio || '');
  const [avatar, setAvatar] = useState(user.avatar || '');
  const [notifications, setNotifications] = useState<UserNotifications>(user.notifications || {
    attendance: true,
    notes: true,
    messages: true,
    requests: true
  });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setAvatar(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleNotificationToggle = (key: keyof UserNotifications) => {
    setNotifications(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setSuccess(false);
    try {
      const updated = await api.updateUserProfile({ name, bio, avatar, notifications });
      onUpdate(updated);
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (err) {
      alert("Failed to update profile.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-500 pb-20">
      <div className="mb-8">
        <button 
          onClick={onBack}
          className="group flex items-center gap-2 text-indigo-600 font-black text-xs uppercase tracking-widest bg-white px-5 py-3 rounded-2xl shadow-sm border border-gray-100 hover:bg-indigo-600 hover:text-white transition-all"
        >
          <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" />
          Return to Dashboard
        </button>
      </div>

      <header className="mb-12">
        <h1 className="text-4xl font-black text-gray-900 tracking-tighter">Account Settings</h1>
        <p className="text-gray-500 mt-2 font-medium">Personalize your digital presence and notification preferences.</p>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
        {/* Left: Avatar Upload */}
        <div className="flex flex-col items-center space-y-6">
          <div className="relative group">
            <div className="w-48 h-48 rounded-[3rem] overflow-hidden border-8 border-white shadow-2xl relative">
              <img src={avatar || `https://picsum.photos/seed/${user.id}/200`} alt="Avatar" className="w-full h-full object-cover transition-transform group-hover:scale-110 duration-500" />
              <div 
                onClick={() => fileInputRef.current?.click()}
                className="absolute inset-0 bg-indigo-600/60 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center text-white cursor-pointer backdrop-blur-sm"
              >
                <Camera size={32} className="mb-2" />
                <span className="text-[10px] font-black uppercase tracking-widest">Update Photo</span>
              </div>
            </div>
            <input 
              type="file" 
              ref={fileInputRef} 
              className="hidden" 
              accept="image/*" 
              onChange={handleImageUpload} 
            />
          </div>
          <div className="text-center">
            <h3 className="font-black text-gray-900 text-xl">{name}</h3>
            <p className="text-indigo-600 font-bold uppercase text-[10px] tracking-[0.2em] mt-1">{user.role} ID: {user.id}</p>
          </div>
        </div>

        {/* Right: Form & Notifications */}
        <div className="lg:col-span-2 space-y-10">
          <form onSubmit={handleSave} className="bg-white rounded-[2.5rem] border border-gray-100 p-10 shadow-xl shadow-gray-100/50 space-y-8">
            <div className="space-y-6">
              <div className="relative group">
                <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-3 ml-1">Display Name</label>
                <div className="relative">
                  <div className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-indigo-600 transition-colors">
                    <UserIcon size={18} />
                  </div>
                  <input 
                    type="text"
                    value={name}
                    onChange={e => setName(e.target.value)}
                    className="w-full pl-14 pr-6 py-4 bg-gray-50 rounded-2xl border-2 border-transparent focus:border-indigo-600 focus:bg-white outline-none font-bold text-gray-800 transition-all"
                  />
                </div>
              </div>

              <div className="relative">
                <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-3 ml-1">About / Bio</label>
                <div className="relative">
                  <div className="absolute left-5 top-5 text-gray-400">
                    <Info size={18} />
                  </div>
                  <textarea 
                    value={bio}
                    onChange={e => setBio(e.target.value)}
                    placeholder="Tell your students or classmates a bit about yourself..."
                    className="w-full pl-14 pr-6 py-4 bg-gray-50 rounded-2xl border-2 border-transparent focus:border-indigo-600 focus:bg-white outline-none font-bold text-gray-800 transition-all h-32 resize-none"
                  />
                </div>
              </div>

              <div className="p-4 bg-indigo-50/50 rounded-2xl border border-indigo-100/50 flex items-start gap-4">
                <div className="bg-white p-2 rounded-xl text-indigo-600 shadow-sm">
                  <Mail size={16} />
                </div>
                <div>
                  <p className="text-[10px] font-black text-indigo-900/40 uppercase tracking-widest mb-1">Institutional Email</p>
                  <p className="text-sm font-bold text-indigo-900 opacity-70 italic">{user.email || 'Not verified'}</p>
                </div>
              </div>
            </div>

            {/* Notification Settings Section */}
            <div className="pt-8 border-t border-gray-100">
              <div className="flex items-center gap-3 mb-6">
                <div className="bg-indigo-100 text-indigo-600 p-2 rounded-xl">
                  <Bell size={18} />
                </div>
                <h4 className="font-black text-gray-900 text-sm uppercase tracking-widest">Notification Preferences</h4>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {[
                  { key: 'attendance', label: 'Attendance Updates', icon: CheckCircle, desc: 'Alerts for marked records' },
                  { key: 'notes', label: 'Study Resources', icon: FileText, desc: 'New notes and summaries' },
                  { key: 'messages', label: 'Message Alerts', icon: MessageSquare, desc: 'Class and private chats' },
                  { key: 'requests', label: 'Admin Requests', icon: Inbox, desc: 'Leaves and disputes', hidden: user.role === 'student' && !notifications.requests },
                ].map((item) => {
                  if (item.hidden) return null;
                  const isActive = notifications[item.key as keyof UserNotifications];
                  return (
                    <div 
                      key={item.key}
                      onClick={() => handleNotificationToggle(item.key as keyof UserNotifications)}
                      className={`group flex items-center justify-between p-4 rounded-3xl border transition-all cursor-pointer ${isActive ? 'bg-indigo-50 border-indigo-200' : 'bg-white border-gray-100 hover:border-gray-200'}`}
                    >
                      <div className="flex items-center gap-4">
                        <div className={`p-2.5 rounded-xl transition-colors ${isActive ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-100' : 'bg-gray-100 text-gray-400'}`}>
                          <item.icon size={18} />
                        </div>
                        <div>
                          <p className={`text-[11px] font-black uppercase tracking-tight ${isActive ? 'text-indigo-900' : 'text-gray-500'}`}>{item.label}</p>
                          <p className="text-[9px] text-gray-400 font-bold leading-none mt-1">{item.desc}</p>
                        </div>
                      </div>
                      <div className={`w-10 h-6 rounded-full relative transition-colors duration-300 ${isActive ? 'bg-indigo-600' : 'bg-gray-200'}`}>
                        <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all duration-300 ${isActive ? 'left-5' : 'left-1'}`} />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="pt-4 flex flex-col sm:flex-row items-center gap-4">
              <button 
                type="submit"
                disabled={loading}
                className="w-full sm:flex-1 bg-indigo-600 text-white py-5 rounded-2xl font-black shadow-xl shadow-indigo-100 hover:bg-indigo-700 transition-all active:scale-95 flex items-center justify-center gap-3 disabled:opacity-50"
              >
                {loading ? <Loader2 className="animate-spin" /> : <Save size={20} />}
                {loading ? 'Saving Profile...' : 'Save Changes'}
              </button>
              
              {success && (
                <div className="flex items-center gap-2 text-emerald-600 font-black text-xs uppercase tracking-widest animate-in fade-in slide-in-from-left-2">
                  <CheckCircle size={18} />
                  Updated!
                </div>
              )}
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default SettingsView;
