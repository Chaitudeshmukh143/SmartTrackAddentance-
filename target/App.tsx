
import React, { useState, useEffect } from 'react';
import { Classroom, ViewType, User } from './types';
import { api } from './api';
import Dashboard from './components/Dashboard';
import ClassroomView from './components/ClassroomView';
import StudentClassroomView from './components/StudentClassroomView';
import AuthView from './components/AuthView';
import SettingsView from './components/SettingsView';
import { GraduationCap, LayoutDashboard, LogOut, Menu, X, Loader2, Settings, CloudLightning, CloudOff } from 'lucide-react';

const App: React.FC = () => {
  const [classrooms, setClassrooms] = useState<Classroom[]>([]);
  const [currentUser, setCurrentUser] = useState<User | null>(api.getCurrentUser());
  const [activeView, setActiveView] = useState<ViewType>('dashboard');
  const [selectedClassId, setSelectedClassId] = useState<string | null>(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [serverAwake, setServerAwake] = useState(false);
  const [wakingUp, setWakingUp] = useState(false);

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
    if (currentUser) {
      loadData();
    } else {
      setLoading(false);
    }
  }, [currentUser]);

  const loadData = async () => {
    try {
      setLoading(true);
      // Give the server 2 seconds, if it doesn't respond, show "Waking Up" message
      const wakeTimer = setTimeout(() => setWakingUp(true), 2500);
      
      const data = await api.getClassrooms();
      setClassrooms(data);
      setServerAwake(true);
      clearTimeout(wakeTimer);
      setWakingUp(false);
    } catch (err) {
      console.error("Failed to load classrooms");
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

  const handleUpdateProfile = (updatedUser: User) => {
    setCurrentUser(updatedUser);
    loadData();
  };

  const activeClassroom = classrooms.find(c => c.id === selectedClassId);

  const handleCreateClassroom = async (name: string, subject: string) => {
    try {
      const newClass = await api.createClassroom(name, subject);
      setClassrooms(prev => [...prev, newClass]);
    } catch (err) {
      console.error("Failed to create classroom:", err);
    }
  };

  const handleUpdateClassroom = (updatedClass: Classroom) => {
    setClassrooms(prev => prev.map(c => c.id === updatedClass.id ? updatedClass : c));
  };

  const navigateToClass = (id: string) => {
    setSelectedClassId(id);
    setActiveView('classroom');
    setIsSidebarOpen(false);
  };

  if (loading) {
    return (
      <div className="h-screen w-screen flex flex-col items-center justify-center bg-white text-indigo-600">
        <div className="relative">
          <div className="absolute inset-0 bg-indigo-100 rounded-full animate-ping opacity-25"></div>
          <GraduationCap className="relative z-10 mb-4 text-indigo-600" size={64} />
        </div>
        <div className="flex flex-col items-center gap-3 mt-4">
          <div className="flex items-center gap-2">
            <Loader2 className="animate-spin" size={20} />
            <p className="font-black text-sm uppercase tracking-widest animate-pulse">
              {wakingUp ? 'Waking up cloud server...' : 'Initializing Portal...'}
            </p>
          </div>
          {wakingUp && (
            <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest max-w-[200px] text-center">
              Free hosting spins down after inactivity. This may take 30 seconds.
            </p>
          )}
        </div>
      </div>
    );
  }

  if (!currentUser) {
    return <AuthView onLogin={handleLogin} />;
  }

  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden font-sans">
      <button 
        className="lg:hidden fixed top-4 left-4 z-50 p-2 bg-white rounded-xl shadow-lg border border-gray-100"
        onClick={() => setIsSidebarOpen(!isSidebarOpen)}
      >
        {isSidebarOpen ? <X size={24} /> : <Menu size={24} />}
      </button>

      <div className={`
        fixed inset-y-0 left-0 z-40 w-72 bg-white border-r border-gray-100 transition-transform duration-500 cubic-bezier(0.4, 0, 0.2, 1) transform
        ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}
        lg:relative lg:translate-x-0
      `}>
        <div className="flex flex-col h-full">
          <div className="p-8 flex items-center gap-4">
            <div className="bg-gradient-to-br from-indigo-500 to-indigo-700 p-2.5 rounded-2xl text-white shadow-lg shadow-indigo-200">
              <GraduationCap size={28} />
            </div>
            <div>
              <h1 className="text-2xl font-black text-gray-900 tracking-tighter leading-none">EduAttend</h1>
              <p className="text-[9px] text-gray-400 font-black uppercase tracking-[0.2em] mt-1.5">{currentUser.role} Portal</p>
            </div>
          </div>

          <nav className="flex-1 overflow-y-auto px-6 space-y-2 py-4">
            <button 
              onClick={() => { setActiveView('dashboard'); setIsSidebarOpen(false); setSelectedClassId(null); }}
              className={`w-full flex items-center gap-4 px-5 py-4 rounded-2xl transition-all duration-300 ${activeView === 'dashboard' ? 'bg-indigo-600 text-white shadow-xl shadow-indigo-100' : 'text-gray-500 hover:bg-indigo-50 hover:text-indigo-600 font-bold'}`}
            >
              <LayoutDashboard size={22} />
              <span className="font-bold">Home Dashboard</span>
            </button>
            
            <div className="pt-10 pb-4 px-2 uppercase text-[10px] font-black text-gray-300 tracking-[0.25em] flex items-center gap-3">
              <div className="h-px bg-gray-100 flex-1"></div>
              {currentUser.role === 'teacher' ? 'My Classes' : 'Enrolled'}
              <div className="h-px bg-gray-100 flex-1"></div>
            </div>

            <div className="space-y-1.5">
              {classrooms.filter(c => currentUser.role === 'teacher' ? true : c.students.some(s => s.id === currentUser.id)).map(cls => (
                <button 
                  key={cls.id}
                  onClick={() => navigateToClass(cls.id)}
                  className={`w-full flex flex-col gap-0.5 px-5 py-3.5 rounded-2xl text-left transition-all duration-300 ${selectedClassId === cls.id && activeView === 'classroom' ? 'bg-indigo-50 text-indigo-700 ring-1 ring-indigo-100 shadow-sm' : 'text-gray-500 hover:bg-gray-50 hover:pl-6'}`}
                >
                  <span className="font-black truncate text-sm">{cls.name}</span>
                  <span className="text-[9px] opacity-60 uppercase font-black tracking-widest">{cls.subject}</span>
                </button>
              ))}
            </div>
          </nav>

          <div className="p-6">
            {/* Status Indicator */}
            <div className={`mb-4 flex items-center gap-2 px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest border ${serverAwake ? 'bg-emerald-50 text-emerald-600 border-emerald-100' : 'bg-amber-50 text-amber-600 border-amber-100'}`}>
              {serverAwake ? <CloudLightning size={14} /> : <CloudOff size={14} />}
              {serverAwake ? 'Cloud Synced' : 'Local Offline Mode'}
            </div>

            <div className="bg-gray-50 rounded-[2.5rem] p-6 border border-gray-100">
              <div className="flex items-center gap-4 mb-6">
                <div className="w-12 h-12 rounded-2xl bg-indigo-600 flex items-center justify-center text-white font-black text-xl shadow-lg shadow-indigo-100 overflow-hidden ring-2 ring-white">
                  {currentUser.avatar ? <img src={currentUser.avatar} className="w-full h-full object-cover" /> : currentUser.name.charAt(0)}
                </div>
                <div className="overflow-hidden">
                  <p className="text-sm font-black truncate text-gray-900">{currentUser.name}</p>
                  <p className="text-[10px] text-indigo-500 font-black uppercase tracking-tighter opacity-80">{currentUser.role}</p>
                </div>
              </div>
              <div className="space-y-2">
                <button 
                  onClick={() => { setActiveView('settings'); setIsSidebarOpen(false); setSelectedClassId(null); }}
                  className={`w-full flex items-center justify-center gap-3 py-3 rounded-xl font-bold text-xs border transition-all shadow-sm ${activeView === 'settings' ? 'bg-indigo-600 text-white border-indigo-600' : 'bg-white text-gray-500 border-gray-200 hover:bg-gray-100'}`}
                >
                  <Settings size={16} />
                  <span>Account Settings</span>
                </button>
                <button 
                  onClick={handleLogout}
                  className="w-full flex items-center justify-center gap-3 py-3 rounded-xl bg-red-50 text-red-600 font-bold text-xs border border-red-100 hover:bg-red-600 hover:text-white transition-all shadow-sm"
                >
                  <LogOut size={16} />
                  <span>Log Out</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <main className="flex-1 overflow-y-auto relative p-4 lg:p-10">
        <div className="max-w-7xl mx-auto">
          {activeView === 'dashboard' && (
            <Dashboard 
              classrooms={classrooms} 
              onCreateClassroom={handleCreateClassroom} 
              onSelectClass={navigateToClass}
              role={currentUser.role}
            />
          )}
          {activeView === 'classroom' && activeClassroom && (
            currentUser.role === 'teacher' ? (
              <ClassroomView classroom={activeClassroom} onUpdate={handleUpdateClassroom} />
            ) : (
              <StudentClassroomView classroom={activeClassroom} onUpdate={handleUpdateClassroom} studentId={currentUser.id} />
            )
          )}
          {activeView === 'settings' && (
            <SettingsView 
              user={currentUser} 
              onUpdate={handleUpdateProfile} 
              onBack={() => setActiveView('dashboard')} 
            />
          )}
        </div>
      </main>
    </div>
  );
};

export default App;
