
import React, { useState, useRef } from 'react';
import { User } from '../types';
import { api } from '../api';
import { Camera, Save, ArrowLeft, Loader2, LogOut, Sparkles } from 'lucide-react';

interface SettingsViewProps {
  user: User;
  onUpdate: (user: User) => void;
  onBack: () => void;
  onLogout: () => void;
}

const SettingsView: React.FC<SettingsViewProps> = ({ user, onUpdate, onBack, onLogout }) => {
  const [name, setName] = useState(user.name);
  const [avatar, setAvatar] = useState(user.avatar || `https://picsum.photos/seed/${user.id}/200`);
  const [loading, setLoading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        alert("File is too large! Please select an image under 2MB.");
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setAvatar(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const updated = await api.updateUserProfile({ name, avatar });
      onUpdate(updated);
      alert('Profile Synced Successfully!');
    } catch (err) {
      alert('Failed to update profile. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-700 pb-32 lg:pb-20">
      <button 
        onClick={onBack} 
        className="flex items-center gap-2 text-indigo-600 font-black text-[10px] uppercase tracking-widest bg-white px-5 py-3 rounded-2xl shadow-sm mb-10 border border-gray-100 hover:bg-indigo-50 transition-all"
      >
        <ArrowLeft size={16} /> Back to Hub
      </button>

      <div className="mb-12">
        <h1 className="text-4xl lg:text-6xl font-black text-gray-900 tracking-tighter italic uppercase">Identity</h1>
        <p className="text-gray-500 font-medium text-lg mt-2 italic tracking-tight">Customize your digital scholar persona.</p>
      </div>

      <div className="space-y-8">
        <form onSubmit={handleSave} className="bg-white p-8 lg:p-12 rounded-[2.5rem] lg:rounded-[4rem] shadow-xl border border-gray-50 space-y-10">
          <div className="space-y-12">
            <div className="flex flex-col items-center lg:items-end lg:flex-row gap-8 lg:gap-12">
               <div className="relative group cursor-pointer" onClick={() => fileInputRef.current?.click()}>
                 <div className="w-40 h-40 lg:w-56 lg:h-56 rounded-[3rem] lg:rounded-[4rem] border-8 border-white shadow-2xl overflow-hidden relative transition-transform duration-500 group-hover:scale-105">
                   <img src={avatar} className="w-full h-full object-cover" alt="Profile" />
                   <div className="absolute inset-0 bg-indigo-600/40 backdrop-blur-sm flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300 text-white">
                     <Camera size={32} className="mb-2" />
                     <span className="text-[10px] font-black uppercase tracking-widest">Update Photo</span>
                   </div>
                 </div>
                 <div className="absolute -bottom-4 -right-4 bg-indigo-600 p-4 rounded-3xl text-white shadow-xl ring-8 ring-white">
                    <Sparkles size={24} />
                 </div>
                 <input 
                   type="file" 
                   ref={fileInputRef} 
                   className="hidden" 
                   accept="image/*" 
                   onChange={handleFileChange} 
                 />
               </div>

               <div className="flex-1 text-center lg:text-left space-y-2">
                 <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-indigo-50 text-indigo-600 rounded-full text-[10px] font-black uppercase tracking-widest mb-2">
                    Verified {user.role}
                 </div>
                 <h2 className="text-3xl lg:text-5xl font-black text-gray-900 tracking-tighter leading-none">{user.name}</h2>
                 <p className="text-gray-400 font-black text-xs uppercase tracking-[0.2em]">{user.role} ID: {user.id}</p>
               </div>
            </div>

            <div className="grid grid-cols-1 gap-8">
              <div className="space-y-4">
                <label className="block text-[10px] font-black text-gray-400 uppercase tracking-[0.3em] ml-6">Scholar Name</label>
                <input 
                  type="text" 
                  value={name} 
                  onChange={e => setName(e.target.value)} 
                  className="w-full px-10 py-6 bg-gray-50 border-2 border-transparent focus:border-indigo-600 rounded-[2.5rem] outline-none font-black text-xl transition-all shadow-inner placeholder:text-gray-300" 
                  placeholder="Enter your name..."
                />
              </div>
            </div>
          </div>

          <button 
            type="submit" 
            disabled={loading} 
            className="w-full bg-indigo-600 text-white py-8 rounded-[2.5rem] lg:rounded-[3rem] font-black text-xl lg:text-2xl italic tracking-tighter shadow-[0_25px_50px_rgba(79,70,229,0.3)] hover:bg-indigo-700 hover:-translate-y-1 active:scale-95 transition-all flex items-center justify-center gap-4"
          >
            {loading ? <Loader2 className="animate-spin" size={28} /> : <Save size={28} />}
            {loading ? 'Syncing...' : 'Save Profile Changes'}
          </button>
        </form>

        {/* Action Blocks */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-gray-50 p-8 lg:p-12 rounded-[2.5rem] lg:rounded-[3rem] border border-gray-100 flex flex-col justify-between">
                <div>
                    <h3 className="text-xl font-black text-gray-900 tracking-tight uppercase italic mb-2">Institutional Help</h3>
                    <p className="text-gray-500 text-sm font-medium">Having trouble with your credentials? Reach out to the department head.</p>
                </div>
                <button className="mt-8 text-indigo-600 font-black text-xs uppercase tracking-widest flex items-center gap-2 hover:gap-4 transition-all">
                    Contact Support <Sparkles size={16} />
                </button>
            </div>

            <div className="bg-rose-50/50 p-8 lg:p-12 rounded-[2.5rem] lg:rounded-[3rem] border border-rose-100 flex flex-col justify-between">
                <div>
                    <h3 className="text-xl font-black text-rose-900 tracking-tight uppercase italic mb-2">Danger Zone</h3>
                    <p className="text-rose-600/60 text-sm font-medium">Securely terminate your current session on this device.</p>
                </div>
                <button 
                    onClick={onLogout} 
                    className="mt-8 w-full lg:w-auto px-10 py-5 bg-rose-600 text-white rounded-[1.8rem] font-black text-xs uppercase tracking-widest shadow-xl shadow-rose-100 hover:bg-rose-700 active:scale-95 transition-all flex items-center justify-center gap-3"
                >
                    <LogOut size={18} />
                    Secure Logout
                </button>
            </div>
        </div>
      </div>
    </div>
  );
};

export default SettingsView;
