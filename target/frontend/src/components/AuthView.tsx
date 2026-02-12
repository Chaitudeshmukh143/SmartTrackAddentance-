
import React, { useState } from 'react';
import { User } from '../types';
import { api } from '../api';
import { GraduationCap, ArrowRight, Loader2, Sparkles, Mail, Smartphone } from 'lucide-react';

interface AuthViewProps {
  onLogin: (user: User) => void;
}

const AuthView: React.FC<AuthViewProps> = ({ onLogin }) => {
  const [isLogin, setIsLogin] = useState(true);
  const [loading, setLoading] = useState(false);
  const [role, setRole] = useState<'teacher' | 'student'>('student');
  const [authMethod, setAuthMethod] = useState<'email' | 'mobile'>('email');
  const [formData, setFormData] = useState({ name: '', email: '', mobile: '', password: '' });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const identifier = authMethod === 'email' ? formData.email : formData.mobile;
      const user = isLogin 
        ? await api.login(identifier, formData.password) 
        : await api.signup(formData.name, identifier, role);
      onLogin(user);
    } catch (err) {
      alert("Auth failed. Check credentials.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-[#050507] p-4 lg:p-6 font-sans relative overflow-hidden">
      {/* Background Gradients */}
      <div className="absolute top-[-20%] left-[-20%] w-[70%] h-[70%] bg-indigo-600/20 rounded-full blur-[160px]"></div>
      <div className="absolute bottom-[-20%] right-[-20%] w-[70%] h-[70%] bg-purple-600/20 rounded-full blur-[160px]"></div>

      <div className="w-full max-w-[1200px] min-h-[600px] lg:min-h-[750px] grid grid-cols-1 lg:grid-cols-2 bg-white/5 backdrop-blur-3xl rounded-[3rem] lg:rounded-[4rem] shadow-2xl overflow-hidden relative z-10 border border-white/10">
        
        {/* Left Side: Desktop Branding */}
        <div className="hidden lg:flex flex-col justify-between p-20 bg-gradient-to-br from-indigo-600 to-indigo-800 text-white relative">
          <div className="relative z-10">
            <div className="flex items-center gap-4 mb-16">
              <div className="p-4 bg-white/10 backdrop-blur-xl rounded-[1.5rem] border border-white/20">
                <GraduationCap size={44} />
              </div>
              <div>
                <h1 className="text-4xl font-black tracking-tighter italic uppercase">EduAttend</h1>
                <p className="text-[10px] text-indigo-200 font-black uppercase tracking-[0.4em] mt-2">Institutional v4.2</p>
              </div>
            </div>
            <h2 className="text-7xl font-black leading-[1.0] tracking-tighter">
              Elevate your <br/>
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-200 to-white">Academic Vibe.</span>
            </h2>
          </div>
          <div className="relative z-10 flex items-center gap-3 text-[10px] font-black uppercase tracking-[0.3em] text-indigo-300">
            <Sparkles size={16} />
            <span>AI Augmented Portal</span>
          </div>
        </div>

        {/* Right Side: Form */}
        <div className="p-8 lg:p-24 flex flex-col justify-center bg-black/20">
          <div className="mb-10 text-center lg:text-left">
            <h3 className="text-4xl lg:text-5xl font-black text-white mb-2 tracking-tighter">
              {isLogin ? 'Sign In' : 'Join Us'}
            </h3>
            <p className="text-gray-500 font-medium text-base lg:text-lg">Unlock your digital classroom.</p>
          </div>

          {/* Role Segmented Control */}
          <div className="flex bg-white/5 p-1 rounded-[1.8rem] mb-8 border border-white/5 relative">
            <div className={`absolute top-1 bottom-1 w-[calc(50%-4px)] bg-indigo-600 rounded-[1.5rem] transition-all duration-500 cubic-bezier(0.4, 0, 0.2, 1) ${role === 'student' ? 'left-1' : 'left-[calc(50%+1px)]'}`}></div>
            <button onClick={() => setRole('student')} className={`flex-1 py-4 relative z-10 font-black text-[10px] uppercase tracking-[0.2em] transition-colors duration-500 ${role === 'student' ? 'text-white' : 'text-gray-500 hover:text-gray-400'}`}>Student</button>
            <button onClick={() => setRole('teacher')} className={`flex-1 py-4 relative z-10 font-black text-[10px] uppercase tracking-[0.2em] transition-colors duration-500 ${role === 'teacher' ? 'text-white' : 'text-gray-500 hover:text-gray-400'}`}>Teacher</button>
          </div>

          {/* Method Segmented Control */}
          <div className="flex bg-white/5 p-1 rounded-2xl mb-8 border border-white/5 relative">
            <div className={`absolute top-1 bottom-1 w-[calc(50%-4px)] bg-white/10 border border-white/10 rounded-xl transition-all duration-500 ${authMethod === 'email' ? 'left-1' : 'left-[calc(50%+1px)]'}`}></div>
            <button onClick={() => setAuthMethod('email')} className={`flex-1 py-3 relative z-10 flex items-center justify-center gap-2 font-black text-[9px] uppercase tracking-widest ${authMethod === 'email' ? 'text-white' : 'text-gray-500'}`}>
              <Mail size={14} /> Email
            </button>
            <button onClick={() => setAuthMethod('mobile')} className={`flex-1 py-3 relative z-10 flex items-center justify-center gap-2 font-black text-[9px] uppercase tracking-widest ${authMethod === 'mobile' ? 'text-white' : 'text-gray-500'}`}>
              <Smartphone size={14} /> Mobile
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4 lg:space-y-6">
            {!isLogin && (
              <input required type="text" placeholder="Full Name" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} className="w-full px-6 py-4 lg:py-5 bg-white/5 border-2 border-transparent focus:border-indigo-600 focus:bg-white/10 rounded-2xl outline-none font-bold text-white transition-all" />
            )}
            
            {authMethod === 'email' ? (
              <input required type="email" placeholder="Email Address" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} className="w-full px-6 py-4 lg:py-5 bg-white/5 border-2 border-transparent focus:border-indigo-600 focus:bg-white/10 rounded-2xl outline-none font-bold text-white transition-all" />
            ) : (
              <input required type="tel" placeholder="Mobile Number" value={formData.mobile} onChange={e => setFormData({...formData, mobile: e.target.value})} className="w-full px-6 py-4 lg:py-5 bg-white/5 border-2 border-transparent focus:border-indigo-600 focus:bg-white/10 rounded-2xl outline-none font-bold text-white transition-all" />
            )}

            <input required type="password" placeholder="Password" value={formData.password} onChange={e => setFormData({...formData, password: e.target.value})} className="w-full px-6 py-4 lg:py-5 bg-white/5 border-2 border-transparent focus:border-indigo-600 focus:bg-white/10 rounded-2xl outline-none font-bold text-white transition-all" />

            <button type="submit" disabled={loading} className="w-full py-5 lg:py-6 mt-4 bg-indigo-600 text-white rounded-[2rem] font-black text-lg shadow-2xl hover:bg-indigo-700 active:scale-95 transition-all flex items-center justify-center gap-3">
              {loading ? <Loader2 className="animate-spin" /> : <><span>{isLogin ? 'Sign In' : 'Sign Up'}</span> <ArrowRight size={20} /></>}
            </button>
          </form>
          
          <button onClick={() => setIsLogin(!isLogin)} className="mt-8 text-gray-500 font-black text-[10px] uppercase tracking-[0.2em] hover:text-indigo-400 transition-colors">
            {isLogin ? "New here? Create account" : "Got an account? Log in"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default AuthView;
