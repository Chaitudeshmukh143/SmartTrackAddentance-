
import React, { useState } from 'react';
import { Classroom } from '../types';
import { Plus, Users, BookOpen, ChevronRight, TrendingUp, QrCode, Sparkles, GraduationCap, X, Calendar } from 'lucide-react';
import ScannerModal from './ScannerModal';
import { api } from '../api';

interface DashboardProps {
  classrooms: Classroom[];
  onCreateClassroom: (name: string, subject: string) => void;
  onSelectClass: (id: string) => void;
  role: 'teacher' | 'student';
}

const Dashboard: React.FC<DashboardProps> = ({ classrooms, onCreateClassroom, onSelectClass, role }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [showScanner, setShowScanner] = useState(false);
  const [newName, setNewName] = useState('');
  const [newSubject, setNewSubject] = useState('');

  const user = api.getCurrentUser();
  const myClasses = role === 'teacher' ? classrooms : classrooms.filter(c => c.students.some(s => s.id === user?.id));
  const totalStudents = classrooms.reduce((sum, c) => sum + c.students.length, 0);
  const totalNotes = myClasses.reduce((sum, c) => sum + (c.notes?.length || 0), 0);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (newName && newSubject) {
      onCreateClassroom(newName, newSubject);
      setNewName('');
      setNewSubject('');
      setIsModalOpen(false);
    }
  };

  return (
    <div className="space-y-8 lg:space-y-12 animate-in fade-in slide-in-from-bottom-8 duration-1000">
      {/* Hero Header */}
      <header className="relative p-8 lg:p-20 rounded-[3rem] lg:rounded-[4rem] bg-[#111113] overflow-hidden text-white shadow-2xl">
        <div className="absolute top-0 right-0 w-[50%] h-full bg-gradient-to-l from-indigo-600/20 to-transparent pointer-events-none"></div>
        <div className="absolute -bottom-20 -left-20 w-80 h-80 bg-purple-600/10 rounded-full blur-[100px]"></div>
        
        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-8 lg:gap-12">
          <div className="space-y-4 lg:space-y-6">
            <div className="inline-flex items-center gap-3 px-4 py-1.5 lg:px-5 lg:py-2 bg-white/5 backdrop-blur-xl rounded-full border border-white/10 text-[9px] lg:text-[10px] font-black uppercase tracking-[0.3em]">
              <Sparkles size={14} className="text-indigo-400 animate-pulse" />
              {new Date().toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' })}
            </div>
            <h1 className="text-4xl lg:text-8xl font-black tracking-tighter leading-none italic">
              Wassup, <br/>
              <span className="text-indigo-500">{user?.name.split(' ')[0]}?</span>
            </h1>
          </div>
          
          <div className="flex flex-col sm:flex-row gap-3">
            {role === 'student' ? (
              <button onClick={() => setShowScanner(true)} className="flex items-center justify-center gap-3 bg-white text-black px-8 py-4 lg:py-6 rounded-[2rem] font-black text-xs lg:text-sm uppercase tracking-widest shadow-2xl active:scale-95">
                <QrCode size={20} /> Join Space
              </button>
            ) : (
              <button onClick={() => setIsModalOpen(true)} className="flex items-center justify-center gap-3 bg-indigo-600 text-white px-8 py-4 lg:py-6 rounded-[2rem] font-black text-xs lg:text-sm uppercase tracking-widest shadow-2xl active:scale-95">
                <Plus size={20} /> New Batch
              </button>
            )}
          </div>
        </div>
      </header>

      {/* Stats Bento Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-8">
        <div className="p-6 lg:p-10 rounded-[2.5rem] bg-white border border-gray-100 flex flex-col justify-between group">
          <div className="bg-indigo-50 text-indigo-600 p-4 rounded-[1.2rem] w-fit group-hover:bg-indigo-600 group-hover:text-white transition-all">
            <Users size={24} />
          </div>
          <div className="mt-6 lg:mt-12">
            <p className="text-3xl lg:text-5xl font-black text-gray-900 tracking-tighter">{role === 'teacher' ? totalStudents : myClasses.length}</p>
            <p className="text-[9px] text-gray-400 font-black uppercase tracking-widest mt-1">{role === 'teacher' ? 'Students' : 'Classes'}</p>
          </div>
        </div>
        
        <div className="p-6 lg:p-10 rounded-[2.5rem] bg-white border border-gray-100 flex flex-col justify-between group">
          <div className="bg-amber-50 text-amber-600 p-4 rounded-[1.2rem] w-fit group-hover:bg-amber-600 group-hover:text-white transition-all">
            <BookOpen size={24} />
          </div>
          <div className="mt-6 lg:mt-12">
            <p className="text-3xl lg:text-5xl font-black text-gray-900 tracking-tighter">{totalNotes}</p>
            <p className="text-[9px] text-gray-400 font-black uppercase tracking-widest mt-1">Resources</p>
          </div>
        </div>

        <div className="sm:col-span-2 p-6 lg:p-10 rounded-[2.5rem] bg-indigo-600 flex flex-col justify-between relative overflow-hidden shadow-2xl shadow-indigo-100">
          <TrendingUp className="absolute -right-4 -bottom-4 w-32 lg:w-48 h-32 lg:h-48 text-white/10" />
          <div className="relative z-10 flex justify-between items-start">
            <h4 className="text-xl lg:text-2xl font-black text-white tracking-tighter italic uppercase">Weekly <br/> Pulse</h4>
            <div className="text-4xl lg:text-5xl font-black text-white italic">78%</div>
          </div>
          <div className="relative z-10 mt-8 lg:mt-12">
            <div className="h-3 lg:h-4 bg-white/20 rounded-full overflow-hidden">
              <div className="h-full bg-white w-[78%] rounded-full shadow-[0_0_10px_white]"></div>
            </div>
            <p className="text-[9px] text-indigo-100 font-black uppercase tracking-widest mt-4">Peak Performance</p>
          </div>
        </div>
      </div>

      {/* Classrooms Grid Section */}
      <section className="space-y-6 lg:space-y-10 px-2 lg:px-0">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl lg:text-4xl font-black text-gray-900 tracking-tighter italic uppercase">Portfolio</h2>
          <span className="text-[9px] font-black text-gray-400 uppercase tracking-widest">{myClasses.length} Spaces</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-10 pb-12">
          {myClasses.map((cls, idx) => {
            const themes = ['from-indigo-600 to-violet-700', 'from-rose-500 to-pink-600', 'from-emerald-500 to-teal-600', 'from-blue-600 to-cyan-700'];
            const theme = themes[idx % themes.length];
            return (
              <div key={cls.id} onClick={() => onSelectClass(cls.id)} className="group bg-white rounded-[2.5rem] lg:rounded-[3.5rem] border border-gray-100 shadow-sm hover:shadow-2xl transition-all cursor-pointer overflow-hidden flex flex-col active:scale-95">
                <div className={`h-32 lg:h-48 bg-gradient-to-br ${theme} p-6 lg:p-10 flex flex-col justify-between relative`}>
                  <div className="flex justify-between items-start relative z-10">
                    <div className="p-2 lg:p-3 bg-white/20 backdrop-blur-xl rounded-xl lg:rounded-2xl text-white border border-white/20">
                      <GraduationCap size={20} />
                    </div>
                  </div>
                  <span className="relative z-10 bg-white/10 backdrop-blur-lg text-white text-[8px] lg:text-[10px] font-black px-4 py-1.5 rounded-full uppercase tracking-widest border border-white/20 w-fit">
                    {cls.subject}
                  </span>
                </div>
                <div className="p-8 lg:p-10 space-y-6">
                  <h3 className="text-2xl lg:text-3xl font-black text-gray-900 tracking-tighter leading-none">{cls.name}</h3>
                  <div className="flex items-center justify-between pt-4 lg:pt-8 border-t border-gray-50">
                    <div className="flex -space-x-3">
                      {cls.students.slice(0, 3).map((s, i) => (
                        <img key={i} src={s.avatar} className="w-10 h-10 rounded-xl border-4 border-white shadow-md" alt="" />
                      ))}
                    </div>
                    <div className="flex items-center gap-2 text-indigo-600 font-black text-[10px] uppercase tracking-widest">
                      Enter <ChevronRight size={16} />
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* Creation Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center bg-black/90 backdrop-blur-2xl p-4 lg:p-6 animate-in fade-in">
          <div className="bg-white rounded-[3rem] lg:rounded-[4rem] shadow-2xl w-full max-w-xl overflow-hidden">
            <div className="p-8 lg:p-12 border-b border-gray-50 flex items-center justify-between bg-indigo-600 text-white">
              <h3 className="text-3xl lg:text-4xl font-black tracking-tighter">New Space</h3>
              <button onClick={() => setIsModalOpen(false)} className="p-3 bg-white/10 rounded-full border border-white/10">
                <X size={24} />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="p-8 lg:p-12 space-y-8">
              <div className="space-y-6">
                <input autoFocus type="text" value={newName} onChange={e => setNewName(e.target.value)} className="w-full px-6 py-5 bg-gray-50 rounded-[1.8rem] outline-none font-black text-lg border-2 border-transparent focus:border-indigo-600 transition-all" placeholder="Class Title" />
                <input type="text" value={newSubject} onChange={e => setNewSubject(e.target.value)} className="w-full px-6 py-5 bg-gray-50 rounded-[1.8rem] outline-none font-black text-lg border-2 border-transparent focus:border-indigo-600 transition-all" placeholder="Subject" />
              </div>
              <button type="submit" className="w-full bg-indigo-600 text-white py-6 rounded-[2rem] font-black text-lg shadow-2xl active:scale-95 transition-all">Manifest Classroom</button>
            </form>
          </div>
        </div>
      )}
      
      {showScanner && (
        <ScannerModal title="Scan Space" onScan={(code) => { setShowScanner(false); api.enrollByCode(code, user!).then(() => window.location.reload()); }} onClose={() => setShowScanner(false)} />
      )}
    </div>
  );
};

export default Dashboard;
