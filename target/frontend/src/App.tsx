(window as any).global = window;
import React, { useState, useEffect } from 'react';
import { Classroom, ViewType, User } from './types';
import { api } from './api';
import Dashboard from './components/Dashboard';
import ClassroomView from './components/ClassroomView';
import StudentClassroomView from './components/StudentClassroomView';
import AuthView from './components/AuthView';
import SettingsView from './components/SettingsView';
import { GraduationCap, LayoutDashboard, LogOut, Menu, X, Loader2, Settings, Sparkles, User as UserIcon } from 'lucide-react';

const App: React.FC = () => {
  const [classrooms, setClassrooms] = useState<Classroom[]>([]);
  const [currentUser, setCurrentUser] = useState<User | null>(api.getCurrentUser());
  const [activeView, setActiveView] = useState<ViewType>('dashboard');
  const [selectedClassId, setSelectedClassId] = useState<string | null>(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [serverAwake, setServerAwake] = useState(false);

  useEffect(() => {
    const handleNavigate = (e: any) => {
      if (e.detail === 'dashboard') {
        setActiveView('dashboard');
        setSelectedClassId(null);
      }
    };
    window.addEventListener('navigate', handleNavigate);
    return () => window.removeEventListener('navigate', handleNavigate);
  }, []);

  useEffect(() => {
    if (currentUser) loadData();
    else setLoading(false);
  }, [currentUser]);

  const loadData = async () => {
    try {
      setLoading(true);
      const data = await api.getClassrooms();
      setClassrooms(data);
      setServerAwake(true);
    } catch (err) {
      setServerAwake(false);
    } finally {
      setTimeout(() => setLoading(false), 800);
    }
  };

  const handleLogin = (user: User) => {
    setCurrentUser(user);
    setActiveView('dashboard');
  };

  const handleLogout = () => {
    api.logout();
    setCurrentUser(null);
    setSelectedClassId(null);
    setActiveView('dashboard');
  };

  const navigateToClass = (id: string) => {
    setSelectedClassId(id);
    setActiveView('classroom');
    setIsSidebarOpen(false);
  };

  if (loading) {
    return (
      <div className="h-screen w-screen flex flex-col items-center justify-center bg-[#0a0a0c] text-indigo-400">
        <div className="relative mb-8">
          <div className="absolute inset-0 bg-indigo-500 rounded-full animate-ping opacity-20 blur-xl"></div>
          <div className="relative z-10 p-6 bg-white/5 backdrop-blur-3xl rounded-[2.5rem] border border-white/10 shadow-2xl">
            <GraduationCap size={64} className="text-white" />
          </div>
        </div>
        <div className="flex flex-col items-center gap-2">
          <div className="flex items-center gap-3">
            <Loader2 className="animate-spin text-indigo-500" size={24} />
            <p className="font-black text-xl text-white tracking-tighter uppercase italic">Vibe Checking...</p>
          </div>
          <p className="text-[10px] text-gray-500 font-black uppercase tracking-[0.3em]">EduAttend Pro v4.0</p>
        </div>
      </div>
    );
  }

  if (!currentUser) return <AuthView onLogin={handleLogin} />;

  const activeClassroom = classrooms.find(c => c.id === selectedClassId);

  return (
    <div className="flex flex-col lg:flex-row h-screen bg-[#fcfcfd] overflow-hidden font-sans selection:bg-indigo-100 selection:text-indigo-900">
      {/* Dynamic Background Blur Elements */}
      <div className="fixed top-[-10%] right-[-10%] w-[40%] h-[40%] bg-indigo-200/20 rounded-full blur-[120px] pointer-events-none"></div>
      <div className="fixed bottom-[-10%] left-[-10%] w-[40%] h-[40%] bg-purple-200/20 rounded-full blur-[120px] pointer-events-none"></div>

      {/* Sidebar - Desktop Only or Overlay Mobile */}
      <aside className={`
        fixed inset-y-0 left-0 z-40 w-80 bg-white/70 backdrop-blur-2xl border-r border-gray-100 transition-all duration-500 cubic-bezier(0.4, 0, 0.2, 1) transform
        ${isSidebarOpen ? 'translate-x-0 shadow-2xl' : '-translate-x-full lg:translate-x-0'}
        lg:relative lg:shadow-none
      `}>
        <div className="flex flex-col h-full p-8">
          <div className="flex items-center gap-4 mb-12">
            <div className="bg-indigo-600 p-3 rounded-2xl text-white shadow-xl shadow-indigo-200">
              <GraduationCap size={32} />
            </div>
            <div>
              <h1 className="text-2xl font-black text-gray-900 tracking-tighter leading-none">EduAttend</h1>
              <p className="text-[9px] text-indigo-500 font-black uppercase tracking-[0.2em] mt-1">Institutional v4.2</p>
            </div>
          </div>

          <nav className="flex-1 space-y-2 overflow-y-auto custom-scrollbar pr-2">
            <button 
              onClick={() => { setActiveView('dashboard'); setSelectedClassId(null); setIsSidebarOpen(false); }}
              className={`w-full flex items-center gap-4 px-6 py-5 rounded-[1.8rem] transition-all duration-300 ${activeView === 'dashboard' ? 'bg-indigo-600 text-white shadow-2xl shadow-indigo-200 scale-105' : 'text-gray-400 hover:bg-indigo-50 hover:text-indigo-600 font-bold'}`}
            >
              <LayoutDashboard size={22} />
              <span className="font-black text-sm uppercase tracking-widest">Feed</span>
            </button>

            <div className="pt-10 pb-4 px-4 uppercase text-[10px] font-black text-gray-300 tracking-[0.3em] flex items-center gap-3">
              <span>My Space</span>
              <div className="h-px bg-gray-100 flex-1"></div>
            </div>

            <div className="space-y-2">
              {classrooms.map(cls => (
                <button 
                  key={cls.id}
                  onClick={() => navigateToClass(cls.id)}
                  className={`w-full group relative flex flex-col px-6 py-4 rounded-[1.8rem] text-left transition-all duration-500 ${selectedClassId === cls.id ? 'bg-indigo-50 border border-indigo-100' : 'hover:bg-gray-50'}`}
                >
                  <span className={`font-black text-sm transition-colors ${selectedClassId === cls.id ? 'text-indigo-600' : 'text-gray-600 group-hover:text-gray-900'}`}>{cls.name}</span>
                  <span className="text-[9px] opacity-60 uppercase font-black tracking-widest mt-1">{cls.subject}</span>
                </button>
              ))}
            </div>
          </nav>

          <div className="mt-8 hidden lg:block">
            <div className="bg-gray-50/50 backdrop-blur-md rounded-[2.5rem] p-6 border border-white shadow-inner">
              <div className="flex items-center gap-4 mb-6">
                <div className="w-12 h-12 rounded-2xl bg-indigo-600 flex items-center justify-center text-white font-black text-xl shadow-lg overflow-hidden ring-4 ring-white">
                  {currentUser.avatar ? <img src={currentUser.avatar} className="w-full h-full object-cover" /> : currentUser.name.charAt(0)}
                </div>
                <div className="overflow-hidden">
                  <p className="text-sm font-black truncate text-gray-900">{currentUser.name}</p>
                  <p className="text-[10px] text-indigo-500 font-black uppercase tracking-widest opacity-80">{currentUser.role}</p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <button onClick={() => setActiveView('settings')} className="flex items-center justify-center p-3 rounded-xl bg-white border border-gray-100 text-gray-500 hover:text-indigo-600 transition-all shadow-sm">
                  <Settings size={18} />
                </button>
                <button onClick={handleLogout} className="flex items-center justify-center p-3 rounded-xl bg-red-50 text-red-500 hover:bg-red-500 hover:text-white transition-all shadow-sm">
                  <LogOut size={18} />
                </button>
              </div>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 overflow-y-auto relative pb-24 lg:pb-0 custom-scrollbar">
        <div className="p-4 lg:p-12 max-w-[1400px] mx-auto">
          {activeView === 'dashboard' && (
            <Dashboard 
              classrooms={classrooms} 
              onCreateClassroom={(n, s) => api.createClassroom(n, s).then(loadData)} 
              onSelectClass={navigateToClass}
              role={currentUser.role}
            />
          )}
          {activeView === 'classroom' && activeClassroom && (
            currentUser.role === 'teacher' ? (
              <ClassroomView classroom={activeClassroom} onUpdate={(c) => setClassrooms(prev => prev.map(p => p.id === c.id ? c : p))} />
            ) : (
              <StudentClassroomView classroom={activeClassroom} onUpdate={(c) => setClassrooms(prev => prev.map(p => p.id === c.id ? c : p))} studentId={currentUser.id} />
            )
          )}
          {activeView === 'settings' && (
            <SettingsView user={currentUser} onUpdate={setCurrentUser} onBack={() => setActiveView('dashboard')} onLogout={handleLogout} />
          )}
        </div>
      </main>

      {/* Mobile Bottom Navigation Bar */}
      <nav className="lg:hidden fixed bottom-6 left-6 right-6 z-[100] h-20 bg-white/70 backdrop-blur-3xl rounded-[2.5rem] border border-white/20 shadow-[0_20px_50px_rgba(0,0,0,0.1)] flex items-center justify-around px-6">
        <button 
          onClick={() => { setActiveView('dashboard'); setSelectedClassId(null); }}
          className={`flex flex-col items-center gap-1 p-2 transition-all ${activeView === 'dashboard' ? 'text-indigo-600 scale-110' : 'text-gray-400'}`}
        >
          <LayoutDashboard size={24} />
          <span className="text-[9px] font-black uppercase tracking-widest">Feed</span>
        </button>
        <button 
          onClick={() => setIsSidebarOpen(true)}
          className={`flex flex-col items-center gap-1 p-2 transition-all ${isSidebarOpen ? 'text-indigo-600 scale-110' : 'text-gray-400'}`}
        >
          <Menu size={24} />
          <span className="text-[9px] font-black uppercase tracking-widest">Spaces</span>
        </button>
        <button 
          onClick={() => setActiveView('settings')}
          className={`flex flex-col items-center gap-1 p-2 transition-all ${activeView === 'settings' ? 'text-indigo-600 scale-110' : 'text-gray-400'}`}
        >
          <UserIcon size={24} />
          <span className="text-[9px] font-black uppercase tracking-widest">Profile</span>
        </button>
      </nav>

      {/* Mobile Sidebar Close Overlay */}
      {isSidebarOpen && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-30 lg:hidden" onClick={() => setIsSidebarOpen(false)}></div>
      )}
    </div>
  );
};

export default App;
