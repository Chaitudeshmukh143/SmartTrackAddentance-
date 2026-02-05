
import React, { useState, useEffect } from 'react';
import { Role, User, AttendanceRecord, AttendanceQuery, Course } from './types';
import { MOCK_STUDENTS } from './constants';
import { analyzeAttendanceQuery, generateAttendanceSummary } from './services/geminiService';
import { AttendanceCharts } from './components/AttendanceCharts';
import { QRScanner } from './components/QRScanner';
import { ApiService } from './services/apiService';

// --- Auth Portal Component (Login + Registration) ---
interface AuthPortalProps {
  onAuthSuccess: (user: User) => void;
}

const AuthPortal: React.FC<AuthPortalProps> = ({ onAuthSuccess }) => {
  const [isRegistering, setIsRegistering] = useState(false);
  const [role, setRole] = useState<Role>(Role.STUDENT);
  const [isLoading, setIsLoading] = useState(false);

  // Form States
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    studentId: '',
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleAuthSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      if (isRegistering) {
        const user = await ApiService.register({
          name: formData.name,
          email: formData.email,
          role: role,
          studentId: role === Role.STUDENT ? formData.studentId : undefined,
        });
        alert("Registration successful! You can now log in.");
        setIsRegistering(false);
      } else {
        const identifier = role === Role.STUDENT ? (formData.studentId || formData.email) : formData.email;
        const user = await ApiService.login(identifier, role);
        onAuthSuccess(user);
      }
    } catch (err) {
      alert(isRegistering ? "Registration failed." : "Login failed. Check credentials and role.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-indigo-600 flex items-center justify-center p-4 text-slate-900">
      <div className="bg-white w-full max-w-md rounded-[3rem] shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-500">
        <div className="p-8 text-center bg-indigo-50/50 border-b border-indigo-100">
          <div className="w-16 h-16 bg-indigo-600 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-xl">
            {isRegistering ? (
              <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
              </svg>
            ) : (
              <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 11c0 3.517-1.009 6.799-2.753 9.571m-3.44-2.04l.054-.09A13.916 13.916 0 008 11a4 4 0 118 0c0 1.017-.07 2.019-.203 3m-2.118 6.844A21.88 21.88 0 0015.171 17m3.839 1.132c.645-2.266.99-4.659.99-7.132A8 8 0 008 4.07M3 15.364c.64-1.319 1-2.8 1-4.364 0-1.457.39-2.823 1.07-4" />
              </svg>
            )}
          </div>
          <h1 className="text-3xl font-black tracking-tight text-slate-900">{isRegistering ? 'Create Account' : 'Welcome Back'}</h1>
          <p className="text-slate-500 font-medium mt-1">SmartTrack Attendance Portal</p>
        </div>

        <div className="p-8">
          <div className="flex bg-slate-100 p-1.5 rounded-[1.2rem] mb-6">
            <button 
              onClick={() => setRole(Role.STUDENT)}
              className={`flex-1 py-3 rounded-xl text-xs font-bold transition-all ${role === Role.STUDENT ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-500'}`}
            >
              Student
            </button>
            <button 
              onClick={() => setRole(Role.TEACHER)}
              className={`flex-1 py-3 rounded-xl text-xs font-bold transition-all ${role === Role.TEACHER ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-500'}`}
            >
              Teacher
            </button>
          </div>

          <form onSubmit={handleAuthSubmit} className="space-y-4">
            {isRegistering && (
              <input 
                required
                name="name"
                type="text" 
                placeholder="Full Name"
                value={formData.name}
                onChange={handleInputChange}
                className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 outline-none transition-all font-medium"
              />
            )}
            
            {(isRegistering || role === Role.TEACHER) && (
              <input 
                required
                name="email"
                type="email" 
                placeholder="University Email"
                value={formData.email}
                onChange={handleInputChange}
                className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 outline-none transition-all font-medium"
              />
            )}

            {role === Role.STUDENT && (
              <input 
                required
                name="studentId"
                type="text" 
                placeholder="Student ID (e.g. STU001)"
                value={formData.studentId}
                onChange={handleInputChange}
                className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 outline-none transition-all font-medium"
              />
            )}

            <input 
              required
              name="password"
              type="password" 
              placeholder="Password"
              value={formData.password}
              onChange={handleInputChange}
              className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 outline-none transition-all font-medium"
            />

            <button 
              disabled={isLoading}
              type="submit"
              className="w-full py-5 bg-indigo-600 hover:bg-indigo-700 text-white font-black rounded-2xl shadow-xl shadow-indigo-100 transition-all active:scale-[0.98] disabled:opacity-50 flex items-center justify-center mt-2"
            >
              {isLoading ? (
                <div className="w-6 h-6 border-4 border-white/30 border-t-white rounded-full animate-spin"></div>
              ) : (
                isRegistering ? 'Register as ' + (role === Role.TEACHER ? 'Teacher' : 'Student') : 'Sign In'
              )}
            </button>
          </form>

          <div className="mt-8 text-center">
            <button 
              onClick={() => setIsRegistering(!isRegistering)}
              className="text-sm font-bold text-indigo-600 hover:text-indigo-800 transition-colors"
            >
              {isRegistering ? 'Already have an account? Login' : "Don't have an account? Register"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

// --- Main App Component ---
export default function App() {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [attendance, setAttendance] = useState<AttendanceRecord[]>([]);
  const [queries, setQueries] = useState<AttendanceQuery[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);
  const [activeTab, setActiveTab] = useState<'DASHBOARD' | 'HISTORY' | 'QUERIES' | 'PENDING'>('DASHBOARD');
  const [isLoading, setIsLoading] = useState(false);
  const [showScanner, setShowScanner] = useState(false);
  const [summary, setSummary] = useState("Syncing with Oracle Server...");

  useEffect(() => {
    if (currentUser) {
      const fetchData = async () => {
        setIsLoading(true);
        try {
          const [attData, queryData, courseData] = await Promise.all([
            ApiService.getAttendance(currentUser.role === Role.STUDENT ? currentUser.id : undefined),
            ApiService.getQueries(currentUser.role === Role.STUDENT ? currentUser.id : undefined),
            ApiService.getCourses()
          ]);
          setAttendance(attData);
          setQueries(queryData);
          setCourses(courseData);
          
          const confirmedAtt = attData.filter(a => a.status === 'PRESENT');
          const stats = {
            totalStudents: MOCK_STUDENTS.length,
            todayAttendance: confirmedAtt.filter(a => a.date === new Date().toISOString().split('T')[0]).length,
            attendanceRate: Math.round((confirmedAtt.length / Math.max(1, attData.length)) * 100)
          };
          const msg = await generateAttendanceSummary(stats);
          setSummary(msg);
        } catch (err) {
          console.error("Oracle Sync Error:", err);
        } finally {
          setIsLoading(false);
        }
      };
      fetchData();
    }
  }, [currentUser]);

  const handleStudentRegistration = async (courseId: string) => {
    if (!currentUser) return;
    const course = courses.find(c => c.id === courseId);
    if (!course) return;

    try {
      const newRec = await ApiService.markAttendance({
        studentId: currentUser.id,
        studentName: currentUser.name,
        courseId: course.id,
        courseName: course.name,
        date: new Date().toISOString().split('T')[0],
        status: 'PENDING' 
      });
      setAttendance(prev => [newRec, ...prev]);
      setShowScanner(false);
      alert("Registration Successful! Your teacher must now mark you as 'Attend' in their portal.");
    } catch (err) {
      alert("Registration failed. Please try again.");
    }
  };

  const markAsAttend = (id: string) => {
    setAttendance(prev => prev.map(a => a.id === id ? { ...a, status: 'PRESENT' } : a));
  };

  if (!currentUser) return <AuthPortal onAuthSuccess={setCurrentUser} />;
  
  const isTeacher = currentUser.role === Role.TEACHER;
  const confirmedAttendance = attendance.filter(a => a.status === 'PRESENT');
  const pendingCheckins = attendance.filter(a => a.status === 'PENDING');

  if (isLoading && !attendance.length) return (
    <div className="min-h-screen bg-indigo-50 flex items-center justify-center flex-col gap-6">
      <div className="w-16 h-16 border-8 border-indigo-600 border-t-transparent rounded-full animate-spin shadow-xl"></div>
      <p className="text-indigo-900 font-black uppercase tracking-[0.2em] text-xs">Oracle Session Active</p>
    </div>
  );

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col md:flex-row text-slate-900 font-sans">
      <aside className="no-print hidden md:flex flex-col w-72 bg-white border-r border-slate-200 h-screen sticky top-0 p-8 shadow-sm">
        <div className="flex items-center gap-4 mb-12">
          <div className="w-12 h-12 bg-indigo-600 rounded-2xl flex items-center justify-center text-white font-black text-2xl shadow-lg shadow-indigo-100">S</div>
          <span className="font-black text-2xl text-slate-900 tracking-tight">SmartTrack</span>
        </div>
        
        <nav className="flex-1 space-y-3">
          <button onClick={() => setActiveTab('DASHBOARD')} className={`w-full flex items-center gap-4 px-5 py-4 rounded-2xl font-bold transition-all ${activeTab === 'DASHBOARD' ? 'bg-indigo-600 text-white shadow-xl shadow-indigo-100' : 'text-slate-500 hover:bg-slate-50'}`}>Dashboard</button>
          {isTeacher && (
            <button onClick={() => setActiveTab('PENDING')} className={`w-full flex items-center justify-between px-5 py-4 rounded-2xl font-bold transition-all ${activeTab === 'PENDING' ? 'bg-indigo-600 text-white shadow-xl shadow-indigo-100' : 'text-slate-500 hover:bg-slate-50'}`}>
              <div className="flex items-center gap-4">Approve Scans</div>
              {pendingCheckins.length > 0 && <span className="bg-orange-500 text-white text-[10px] px-2 py-0.5 rounded-full font-black">{pendingCheckins.length}</span>}
            </button>
          )}
          <button onClick={() => setActiveTab('HISTORY')} className={`w-full flex items-center gap-4 px-5 py-4 rounded-2xl font-bold transition-all ${activeTab === 'HISTORY' ? 'bg-indigo-600 text-white shadow-xl shadow-indigo-100' : 'text-slate-500 hover:bg-slate-50'}`}>Full Log</button>
          <button onClick={() => setActiveTab('QUERIES')} className={`w-full flex items-center gap-4 px-5 py-4 rounded-2xl font-bold transition-all ${activeTab === 'QUERIES' ? 'bg-indigo-600 text-white shadow-xl shadow-indigo-100' : 'text-slate-500 hover:bg-slate-50'}`}>Disputes</button>
        </nav>

        <div className="mt-auto pt-8 border-t border-slate-100">
          <div className="flex items-center gap-4 p-3 rounded-3xl bg-slate-50">
            <img src={currentUser.avatar} alt="" className="w-12 h-12 rounded-2xl object-cover ring-2 ring-white" />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-black truncate">{currentUser.name}</p>
              <button onClick={() => setCurrentUser(null)} className="text-[10px] text-red-500 font-black uppercase hover:underline tracking-widest">Logout</button>
            </div>
          </div>
        </div>
      </aside>

      <main className="flex-1 p-6 md:p-12 max-w-7xl mx-auto w-full overflow-y-auto">
        {activeTab === 'DASHBOARD' && (
          <div className="space-y-10 animate-in fade-in slide-in-from-bottom-6 duration-700">
            <header className="flex flex-col md:flex-row md:items-center justify-between gap-6">
              <div>
                <h1 className="text-4xl font-black text-slate-900 tracking-tight">Portal Dashboard</h1>
                <p className="text-indigo-600 font-bold mt-2 flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-indigo-600 animate-pulse"></span>
                  {summary}
                </p>
              </div>
              {!isTeacher && (
                <button 
                  onClick={() => setShowScanner(true)} 
                  className="px-10 py-5 bg-indigo-600 text-white rounded-[2rem] font-black shadow-2xl shadow-indigo-100 hover:bg-indigo-700 hover:-translate-y-1 transition-all"
                >
                  Scan Presence QR
                </button>
              )}
            </header>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
               <div className="bg-white p-10 rounded-[3rem] border border-slate-200 shadow-sm flex flex-col">
                  <h3 className="text-2xl font-black mb-10">Performance Graph</h3>
                  <AttendanceCharts data={isTeacher ? attendance : confirmedAttendance} type={isTeacher ? 'TEACHER' : 'STUDENT'} />
               </div>
               
               <div className="bg-white p-10 rounded-[3rem] border border-slate-200 shadow-sm flex flex-col h-[500px]">
                  <h3 className="text-2xl font-black mb-8">Attendance List</h3>
                  <div className="flex-1 overflow-y-auto space-y-4 pr-2">
                     {(isTeacher ? attendance : confirmedAttendance).slice(0, 15).map(a => (
                       <div key={a.id} className="flex items-center justify-between p-5 bg-slate-50 rounded-[1.5rem] border border-slate-100">
                          <div className="flex items-center gap-4">
                             <div className={`w-12 h-12 rounded-2xl flex items-center justify-center font-black ${a.status === 'PRESENT' ? 'bg-emerald-100 text-emerald-600' : 'bg-slate-200 text-slate-500'}`}>
                                {isTeacher ? a.studentName.charAt(0) : a.courseName.charAt(0)}
                             </div>
                             <div>
                                <p className="font-black text-slate-800">{isTeacher ? a.studentName : a.courseName}</p>
                                <p className="text-xs text-slate-400 font-bold">{a.date}</p>
                             </div>
                          </div>
                          <span className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest ${a.status === 'PRESENT' ? 'bg-emerald-50 text-emerald-600' : 'bg-orange-50 text-orange-600'}`}>
                            {a.status === 'PRESENT' ? 'Confirmed' : 'Pending'}
                          </span>
                       </div>
                     ))}
                  </div>
               </div>
            </div>
          </div>
        )}
        {/* Verification Queue (PENDING) logic as before... */}
        {activeTab === 'PENDING' && isTeacher && (
           <div className="space-y-6">
              <h2 className="text-3xl font-black">Verification Queue</h2>
              {pendingCheckins.map(p => (
                 <div key={p.id} className="bg-white p-6 rounded-3xl border border-slate-200 flex items-center justify-between shadow-sm">
                    <div>
                       <p className="font-black text-xl">{p.studentName}</p>
                       <p className="text-sm text-slate-500">{p.courseName} • {p.date}</p>
                    </div>
                    <button 
                       onClick={() => markAsAttend(p.id)} 
                       className="px-8 py-3 bg-emerald-600 text-white rounded-xl font-bold"
                    >
                       Mark Attend
                    </button>
                 </div>
              ))}
              {pendingCheckins.length === 0 && <p className="text-center py-20 text-slate-400 font-bold">No students awaiting marking.</p>}
           </div>
        )}
        
        {/* Placeholder for History and Queries... */}
        {activeTab === 'HISTORY' && <div className="p-10 text-center text-slate-400 font-bold">Attendance Master Log Loaded from Oracle</div>}
        {activeTab === 'QUERIES' && <div className="p-10 text-center text-slate-400 font-bold">Dispute Resolution Portal</div>}
      </main>

      {showScanner && <QRScanner onScan={handleStudentRegistration} onClose={() => setShowScanner(false)} availableCourses={courses} />}
    </div>
  );
}
