
import React, { useState } from 'react';
import { User } from '../types';
import { api } from '../api';
import { 
  GraduationCap, 
  Mail, 
  Lock, 
  User as UserIcon, 
  ArrowRight, 
  Loader2, 
  BookOpen, 
  Users, 
  Phone,
  ShieldCheck,
  Zap,
  ChevronLeft
} from 'lucide-react';

interface AuthViewProps {
  onLogin: (user: User) => void;
}

const AuthView: React.FC<AuthViewProps> = ({ onLogin }) => {
  const [isLogin, setIsLogin] = useState(true);
  const [loading, setLoading] = useState(false);
  const [role, setRole] = useState<'teacher' | 'student'>('student');
  const [authMethod, setAuthMethod] = useState<'email' | 'phone'>('email');
  
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    password: ''
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const identifier = authMethod === 'email' ? formData.email : formData.phone;
      if (isLogin) {
        const user = await api.login(identifier, formData.password);
        onLogin(user);
      } else {
        const user = await api.signup(formData.name, identifier, role);
        onLogin(user);
      }
    } catch (err) {
      alert("Authentication failed. Use 'teacher@example.com' or a number starting with '9' for Teacher role demo.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-[#f8fafc] p-4 font-sans relative overflow-hidden">
      {/* Immersive Background Elements */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-indigo-200/30 rounded-full blur-[120px] animate-pulse"></div>
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-purple-200/30 rounded-full blur-[120px] animate-pulse delay-700"></div>

      <div className="w-full max-w-[1100px] min-h-[700px] grid grid-cols-1 lg:grid-cols-2 bg-white rounded-[3rem] shadow-[0_32px_64px_-16px_rgba(0,0,0,0.08)] overflow-hidden relative z-10 border border-white">
        
        {/* Left Branding Side (Hidden on Mobile) */}
        <div className="hidden lg:flex flex-col justify-between p-16 bg-gradient-to-br from-indigo-600 via-indigo-700 to-indigo-800 text-white relative">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-white/10 backdrop-blur-md rounded-2xl border border-white/20 shadow-xl">
              <GraduationCap size={32} />
            </div>
            <div>
              <h1 className="text-2xl font-black tracking-tighter leading-none">EduAttend</h1>
              <p className="text-[10px] text-indigo-200 font-bold uppercase tracking-[0.2em] mt-1">Institutional Portal</p>
            </div>
          </div>
          
          <div className="space-y-8 relative z-10">
            <div className="space-y-4">
              <h2 className="text-6xl font-black leading-[1.1] tracking-tighter">
                Manage your <br/>
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-200 to-white">Education.</span>
              </h2>
              <p className="text-indigo-100 text-xl font-medium max-w-md leading-relaxed opacity-90">
                The all-in-one suite for modern classrooms. Attendance, notes, and collaboration in one beautiful place.
              </p>
            </div>

            <div className="grid grid-cols-2 gap-6">
              <div className="bg-white/5 backdrop-blur-sm p-6 rounded-[2rem] border border-white/10 hover:bg-white/10 transition-all cursor-default group">
                <ShieldCheck className="text-indigo-200 mb-3 group-hover:scale-110 transition-transform" size={24} />
                <p className="font-bold text-lg">Secure Access</p>
                <p className="text-xs text-indigo-200/70 mt-1">Encrypted institutional data protection.</p>
              </div>
              <div className="bg-white/5 backdrop-blur-sm p-6 rounded-[2rem] border border-white/10 hover:bg-white/10 transition-all cursor-default group">
                <Zap className="text-indigo-200 mb-3 group-hover:scale-110 transition-transform" size={24} />
                <p className="font-bold text-lg">Live Sync</p>
                <p className="text-xs text-indigo-200/70 mt-1">Real-time attendance & chat updates.</p>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-4 text-xs font-black uppercase tracking-widest text-indigo-300">
            <span>v4.2.0 Professional</span>
            <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-pulse shadow-[0_0_12px_#34d399]"></span>
          </div>

          {/* Abstract Circle Decoration */}
          <div className="absolute right-[-20%] top-[10%] w-[300px] h-[300px] border-[40px] border-white/5 rounded-full"></div>
        </div>

        {/* Right Form Side */}
        <div className="p-8 lg:p-20 flex flex-col justify-center relative bg-white">
          {!isLogin && (
            <button 
              onClick={() => setIsLogin(true)}
              className="absolute top-10 left-10 lg:left-20 flex items-center gap-2 text-gray-400 hover:text-indigo-600 font-bold text-xs uppercase tracking-widest transition-all group"
            >
              <ChevronLeft size={16} className="group-hover:-translate-x-1 transition-transform" />
              Back to Login
            </button>
          )}

          <div className="mb-12 text-center lg:text-left">
            <h3 className="text-4xl font-black text-gray-900 mb-3 tracking-tighter">
              {isLogin ? 'Welcome Back' : 'Create Account'}
            </h3>
            <p className="text-gray-500 font-medium text-lg">
              {isLogin ? 'Login to your institutional dashboard.' : 'Join the EduAttend digital community today.'}
            </p>
          </div>

          {/* Unified Role Switcher */}
          <div className="grid grid-cols-2 gap-3 p-1.5 bg-gray-50 rounded-[1.5rem] mb-10 border border-gray-100">
            <button 
              onClick={() => setRole('student')}
              className={`flex items-center justify-center gap-3 py-4 rounded-[1.2rem] transition-all duration-300 font-black text-xs uppercase tracking-widest ${role === 'student' ? 'bg-white text-indigo-600 shadow-xl shadow-indigo-100/50' : 'text-gray-400 hover:text-gray-600'}`}
            >
              <Users size={18} />
              Student
            </button>
            <button 
              onClick={() => setRole('teacher')}
              className={`flex items-center justify-center gap-3 py-4 rounded-[1.2rem] transition-all duration-300 font-black text-xs uppercase tracking-widest ${role === 'teacher' ? 'bg-white text-indigo-600 shadow-xl shadow-indigo-100/50' : 'text-gray-400 hover:text-gray-600'}`}
            >
              <BookOpen size={18} />
              Teacher
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Method Toggle (Small Segmented) */}
            <div className="flex justify-end mb-2">
              <div className="flex bg-gray-50 p-1 rounded-xl">
                <button 
                  type="button"
                  onClick={() => setAuthMethod('email')}
                  className={`px-4 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all ${authMethod === 'email' ? 'bg-white text-indigo-600 shadow-sm' : 'text-gray-400 hover:text-gray-600'}`}
                >
                  Email
                </button>
                <button 
                  type="button"
                  onClick={() => setAuthMethod('phone')}
                  className={`px-4 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all ${authMethod === 'phone' ? 'bg-white text-indigo-600 shadow-sm' : 'text-gray-400 hover:text-gray-600'}`}
                >
                  Mobile
                </button>
              </div>
            </div>

            {!isLogin && (
              <div className="relative group animate-in slide-in-from-top-2">
                <div className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-indigo-600 transition-colors">
                  <UserIcon size={20} />
                </div>
                <input 
                  required
                  type="text"
                  placeholder="Full Legal Name"
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                  className="w-full pl-14 pr-6 py-5 bg-gray-50 rounded-3xl border-2 border-transparent focus:border-indigo-600 focus:bg-white outline-none font-bold text-gray-800 transition-all placeholder:text-gray-300"
                />
              </div>
            )}

            <div className="relative group">
              <div className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-indigo-600 transition-colors">
                {authMethod === 'email' ? <Mail size={20} /> : <Phone size={20} />}
              </div>
              <input 
                required
                type={authMethod === 'email' ? 'email' : 'tel'}
                placeholder={authMethod === 'email' ? 'Institutional Email' : 'Registered Mobile Number'}
                value={authMethod === 'email' ? formData.email : formData.phone}
                onChange={(e) => setFormData({...formData, [authMethod === 'email' ? 'email' : 'phone']: e.target.value})}
                className="w-full pl-14 pr-6 py-5 bg-gray-50 rounded-3xl border-2 border-transparent focus:border-indigo-600 focus:bg-white outline-none font-bold text-gray-800 transition-all placeholder:text-gray-300"
              />
            </div>

            <div className="relative group">
              <div className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-indigo-600 transition-colors">
                <Lock size={20} />
              </div>
              <input 
                required
                type="password"
                placeholder="Access Password"
                value={formData.password}
                onChange={(e) => setFormData({...formData, password: e.target.value})}
                className="w-full pl-14 pr-6 py-5 bg-gray-50 rounded-3xl border-2 border-transparent focus:border-indigo-600 focus:bg-white outline-none font-bold text-gray-800 transition-all placeholder:text-gray-300"
              />
            </div>

            {isLogin && (
              <div className="flex justify-end px-2">
                <button type="button" className="text-xs font-bold text-gray-400 hover:text-indigo-600 transition-colors">Forgot Password?</button>
              </div>
            )}

            <button 
              type="submit"
              disabled={loading}
              className="w-full py-5 mt-4 bg-indigo-600 text-white rounded-[2rem] font-black text-lg shadow-[0_12px_24px_-8px_rgba(79,70,229,0.4)] hover:bg-indigo-700 hover:translate-y-[-2px] transition-all active:scale-95 flex items-center justify-center gap-3 disabled:opacity-50 disabled:translate-y-0"
            >
              {loading ? (
                <Loader2 className="animate-spin" />
              ) : (
                <>
                  <span>{isLogin ? 'Sign into Portal' : 'Register Now'}</span>
                  <ArrowRight size={22} />
                </>
              )}
            </button>
          </form>

          <div className="mt-12 text-center">
            <p className="text-gray-400 font-bold text-sm">
              {isLogin ? "New to the institution?" : "Already have an account?"} 
              <button 
                onClick={() => setIsLogin(!isLogin)}
                className="ml-2 text-indigo-600 font-black hover:underline decoration-2 underline-offset-4"
              >
                {isLogin ? 'Create Account' : 'Back to Login'}
              </button>
            </p>
          </div>

          {/* Hint for Demo */}
          <div className="mt-12 p-4 bg-indigo-50/50 rounded-2xl border border-indigo-100 flex items-start gap-3">
            <div className="bg-white p-2 rounded-xl text-indigo-600 shadow-sm shrink-0">
              <Zap size={14} />
            </div>
            <p className="text-[10px] text-indigo-700/70 font-bold leading-relaxed">
              <span className="text-indigo-700 uppercase">Demo Hint:</span> For Teacher role, use any email with "teacher" or any 10-digit number starting with "9".
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AuthView;
