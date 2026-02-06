
import React, { useState } from 'react';
import { Classroom } from '../types';
import { Plus, Users, BookOpen, Clock, ChevronRight, TrendingUp, Calendar, QrCode } from 'lucide-react';
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

  const handleScanSuccess = async (code: string) => {
    setShowScanner(false);
    try {
      if (!user) return;
      const updatedClass = await api.enrollByCode(code, user);
      alert(`Successfully enrolled in ${updatedClass.name}!`);
      // Update the local state or reload
      window.location.reload(); 
    } catch (err: any) {
      alert(err.message || "Failed to enroll. Check the code.");
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-gray-900 tracking-tight">
            {role === 'teacher' ? 'Faculty Overview' : 'Student Learning Hub'}
          </h1>
          <p className="text-gray-500 mt-1 font-medium">
            {role === 'teacher' 
              ? 'Track student engagement and classroom progress.' 
              : 'Keep track of your classes, attendance, and study materials.'}
          </p>
        </div>
        <div className="flex gap-3">
          {role === 'student' && (
            <button 
              onClick={() => setShowScanner(true)}
              className="inline-flex items-center justify-center gap-2 bg-indigo-600 text-white px-6 py-3 rounded-2xl font-black hover:bg-indigo-700 shadow-xl shadow-indigo-100 transition-all active:scale-95"
            >
              <QrCode size={20} />
              Scan QR to Join
            </button>
          )}
          {role === 'teacher' && (
            <button 
              onClick={() => setIsModalOpen(true)}
              className="inline-flex items-center justify-center gap-2 bg-indigo-600 text-white px-6 py-3 rounded-2xl font-black hover:bg-indigo-700 shadow-xl shadow-indigo-100 transition-all active:scale-95"
            >
              <Plus size={24} />
              Create New Class
            </button>
          )}
        </div>
      </header>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-[2.5rem] shadow-sm border border-gray-100 flex items-center gap-5">
          <div className="bg-blue-50 text-blue-600 p-4 rounded-2xl"><Users size={24} /></div>
          <div>
            <p className="text-sm font-medium text-gray-500">{role === 'teacher' ? 'Total Students' : 'Joined Classes'}</p>
            <p className="text-2xl font-black text-gray-900">{role === 'teacher' ? totalStudents : myClasses.length}</p>
          </div>
        </div>
        <div className="bg-white p-6 rounded-[2.5rem] shadow-sm border border-gray-100 flex items-center gap-5">
          <div className="bg-amber-50 text-amber-600 p-4 rounded-2xl"><BookOpen size={24} /></div>
          <div>
            <p className="text-sm font-medium text-gray-500">{role === 'teacher' ? 'Active Batches' : 'Materials Found'}</p>
            <p className="text-2xl font-black text-gray-900">{role === 'teacher' ? classrooms.length : totalNotes}</p>
          </div>
        </div>
        <div className="bg-white p-6 rounded-[2.5rem] shadow-sm border border-gray-100 flex items-center gap-5">
          <div className="bg-emerald-50 text-emerald-600 p-4 rounded-2xl"><TrendingUp size={24} /></div>
          <div>
            <p className="text-sm font-medium text-gray-500">{role === 'teacher' ? 'Total Materials' : 'Active Classes'}</p>
            <p className="text-2xl font-black text-gray-900">{role === 'teacher' ? totalNotes : myClasses.length}</p>
          </div>
        </div>
      </div>

      {/* Classroom Grid */}
      <section className="space-y-6">
        <h2 className="text-xl font-black text-gray-900 flex items-center gap-3">
          {role === 'teacher' ? 'Your Classrooms' : 'Your Enrolled Classes'}
          <span className="bg-indigo-50 text-indigo-600 text-[10px] font-black uppercase px-2.5 py-1 rounded-full">{myClasses.length}</span>
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {myClasses.map(cls => (
            <div 
              key={cls.id} 
              onClick={() => onSelectClass(cls.id)}
              className="group bg-white rounded-[2.5rem] border border-gray-100 shadow-sm hover:shadow-2xl hover:border-indigo-100 transition-all cursor-pointer overflow-hidden flex flex-col active:scale-[0.98]"
            >
              <div className="h-32 bg-gradient-to-br from-indigo-500 via-indigo-600 to-purple-600 p-8 flex items-end relative">
                <div className="absolute top-6 right-6 bg-white/20 backdrop-blur-md p-2 rounded-xl text-white">
                  <Calendar size={18} />
                </div>
                <span className="bg-white/10 backdrop-blur-lg text-white text-[10px] font-black px-3 py-1 rounded-full uppercase tracking-widest border border-white/20">
                  {cls.subject}
                </span>
              </div>
              <div className="p-8 space-y-6 flex-1">
                <div>
                  <h3 className="text-xl font-black text-gray-900 group-hover:text-indigo-600 transition-colors mb-1">{cls.name}</h3>
                  <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">Instructor: {role === 'teacher' ? 'You' : 'Faculty Staff'}</p>
                </div>
                
                {role === 'student' && (
                  <div className="space-y-2">
                    <div className="flex justify-between text-[10px] font-black uppercase tracking-widest text-indigo-600">
                      <span>Attendance</span>
                      <span>{cls.attendance.filter(a => a.studentId === user?.id && a.status === 'present').length / Math.max(1, cls.attendance.filter(a => a.studentId === user?.id).length) * 100}%</span>
                    </div>
                    <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                      <div className="h-full bg-indigo-500 w-[85%] rounded-full"></div>
                    </div>
                  </div>
                )}

                <div className="flex items-center justify-between pt-6 border-t border-gray-50">
                  <div className="flex -space-x-3">
                    {cls.students.slice(0, 3).map((s, i) => (
                      <img key={i} src={s.avatar} alt={s.name} className="w-10 h-10 rounded-2xl border-4 border-white shadow-sm" />
                    ))}
                    {cls.students.length > 3 && (
                      <div className="w-10 h-10 rounded-2xl border-4 border-white bg-indigo-50 flex items-center justify-center text-[10px] font-black text-indigo-600 shadow-sm">
                        +{cls.students.length - 3}
                      </div>
                    )}
                  </div>
                  <div className="flex items-center gap-2 text-indigo-600 font-black text-xs uppercase tracking-widest">
                    Enter <ChevronRight size={16} />
                  </div>
                </div>
              </div>
            </div>
          ))}
          {myClasses.length === 0 && (
            <div 
              onClick={() => role === 'student' ? setShowScanner(true) : setIsModalOpen(true)}
              className="col-span-full py-20 bg-indigo-50/30 border-2 border-dashed border-indigo-100 rounded-[2.5rem] flex flex-col items-center justify-center text-center space-y-4 cursor-pointer hover:bg-indigo-50 transition-all group"
            >
              <div className="p-5 bg-white rounded-3xl text-indigo-600 shadow-lg shadow-indigo-100 group-hover:scale-110 transition-transform">
                {role === 'student' ? <QrCode size={40} /> : <Plus size={40} />}
              </div>
              <div>
                <h3 className="text-xl font-black text-gray-900 tracking-tight">No active classes</h3>
                <p className="text-sm text-gray-400 font-medium">{role === 'student' ? 'Scan your teacher\'s QR code to enroll in a class.' : 'Create your first classroom to start managing attendance.'}</p>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* Modal for Creating Class */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-white rounded-[2rem] shadow-2xl w-full max-w-md animate-in zoom-in-95 duration-200 overflow-hidden">
            <div className="p-8 border-b border-gray-100 flex items-center justify-between bg-indigo-600 text-white">
              <h3 className="text-2xl font-black tracking-tight">New Classroom</h3>
              <button onClick={() => setIsModalOpen(false)} className="opacity-70 hover:opacity-100 transition-opacity">
                <Plus size={28} className="rotate-45" />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="p-8 space-y-6">
              <div>
                <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Class Name</label>
                <input autoFocus type="text" value={newName} onChange={e => setNewName(e.target.value)} className="w-full px-5 py-4 bg-gray-50 border-none rounded-2xl focus:ring-2 focus:ring-indigo-500 outline-none font-bold text-gray-700" placeholder="e.g. Advanced Calculus" />
              </div>
              <div>
                <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Subject</label>
                <input type="text" value={newSubject} onChange={e => setNewSubject(e.target.value)} className="w-full px-5 py-4 bg-gray-50 border-none rounded-2xl focus:ring-2 focus:ring-indigo-500 outline-none font-bold text-gray-700" placeholder="e.g. Mathematics" />
              </div>
              <button type="submit" className="w-full bg-indigo-600 text-white py-5 rounded-2xl font-black shadow-xl shadow-indigo-100 hover:bg-indigo-700 transition-all active:scale-95">
                Build Classroom
              </button>
            </form>
          </div>
        </div>
      )}

      {showScanner && (
        <ScannerModal 
          title="Scan to Join Class" 
          onScan={handleScanSuccess} 
          onClose={() => setShowScanner(false)} 
        />
      )}
    </div>
  );
};

export default Dashboard;
