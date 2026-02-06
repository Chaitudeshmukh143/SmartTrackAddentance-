
import React, { useState } from 'react';
import { Classroom, Student } from '../types';
import { User, Mail, Calendar, MoreVertical, Search, ExternalLink, Plus, MessageCircle, Info, CheckCircle, XCircle, Activity } from 'lucide-react';

interface StudentsTabProps {
  classroom: Classroom;
  onUpdate: (updated: Classroom) => void;
  onStartChat: (studentId: string) => void;
}

const StudentsTab: React.FC<StudentsTabProps> = ({ classroom, onUpdate, onStartChat }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);

  const filteredStudents = classroom.students.filter(s => 
    s.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    s.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getStudentAttendance = (studentId: string) => {
    return classroom.attendance
      .filter(a => a.studentId === studentId)
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  };

  const calculatePresenceRate = (studentId: string) => {
    const records = classroom.attendance.filter(a => a.studentId === studentId);
    if (records.length === 0) return 0;
    const presentCount = records.filter(r => r.status === 'present').length;
    return Math.round((presentCount / records.length) * 100);
  };

  return (
    <div className="p-8 space-y-8 h-full overflow-y-auto">
      <div className="flex items-center justify-between gap-4">
        <div className="relative w-full md:w-96">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
          <input 
            type="text" 
            placeholder="Search students..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-3 bg-white border border-gray-200 rounded-2xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all shadow-sm"
          />
        </div>
        <div className="text-sm font-black text-gray-400 uppercase tracking-widest bg-gray-50 px-4 py-2 rounded-xl">
          Enrolled: {classroom.students.length}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {filteredStudents.map(student => {
          const rate = calculatePresenceRate(student.id);
          return (
            <div key={student.id} className="group bg-white rounded-[2.5rem] border border-gray-100 p-8 hover:shadow-2xl hover:border-indigo-100 transition-all flex flex-col items-center text-center space-y-5 relative overflow-hidden">
              <div className="absolute top-0 right-0 p-4">
                <div className={`text-[10px] font-black px-2 py-1 rounded-lg border ${rate >= 75 ? 'bg-emerald-50 text-emerald-600 border-emerald-100' : 'bg-rose-50 text-rose-600 border-rose-100'}`}>
                  {rate}% RATE
                </div>
              </div>
              
              <div className="relative">
                <img src={student.avatar} className="w-24 h-24 rounded-[2rem] border-4 border-white shadow-xl group-hover:scale-105 transition-transform duration-500" alt="" />
                <div className="absolute -bottom-1 -right-1 bg-emerald-500 w-5 h-5 rounded-full border-4 border-white"></div>
              </div>
              
              <div>
                <h4 className="text-xl font-black text-gray-900 group-hover:text-indigo-600 transition-colors tracking-tight">{student.name}</h4>
                <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mt-1">{student.id}</p>
              </div>

              <div className="w-full flex items-center justify-between gap-4 bg-gray-50/50 p-4 rounded-2xl border border-gray-100">
                <div className="text-left">
                  <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Attendance</p>
                  <p className="text-sm font-black text-indigo-600">{rate}%</p>
                </div>
                <div className="flex -space-x-1.5">
                  {getStudentAttendance(student.id).slice(0, 5).map((a, i) => (
                    <div key={i} title={a.date} className={`w-2.5 h-2.5 rounded-full border border-white shadow-sm ${a.status === 'present' ? 'bg-emerald-500' : 'bg-rose-500'}`}></div>
                  ))}
                </div>
              </div>

              <button 
                onClick={() => setSelectedStudent(student)}
                className="w-full flex items-center justify-center gap-2 py-4 rounded-2xl bg-indigo-600 text-white font-black text-xs uppercase tracking-widest hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-100 active:scale-95"
              >
                View Records
                <ExternalLink size={16} />
              </button>
            </div>
          );
        })}
        {filteredStudents.length === 0 && (
          <div className="col-span-full py-32 flex flex-col items-center justify-center text-center space-y-4 bg-gray-50 rounded-[3rem] border-2 border-dashed border-gray-200">
             <User size={48} className="text-gray-200" />
             <p className="text-gray-400 font-black uppercase text-xs tracking-[0.2em]">No students found</p>
          </div>
        )}
      </div>

      {/* Student Profile Detail Modal */}
      {selectedStudent && (
        <div className="fixed inset-0 z-[70] flex items-center justify-center bg-black/60 backdrop-blur-md p-4 animate-in fade-in duration-300">
          <div className="bg-white rounded-[3rem] shadow-2xl w-full max-w-2xl animate-in zoom-in-95 duration-500 overflow-hidden flex flex-col max-h-[90vh]">
            <div className="h-40 bg-indigo-600 relative overflow-hidden flex-shrink-0">
               <div className="absolute inset-0 opacity-20">
                 <div className="absolute top-0 right-0 w-64 h-64 bg-white rounded-full -mr-20 -mt-20"></div>
                 <div className="absolute bottom-0 left-0 w-40 h-40 bg-white rounded-full -ml-10 -mb-10"></div>
               </div>
               <button 
                 onClick={() => setSelectedStudent(null)} 
                 className="absolute top-6 right-6 p-2 bg-white/20 hover:bg-white/40 text-white rounded-xl transition-all z-10"
               >
                 <Plus size={24} className="rotate-45" />
               </button>
            </div>
            
            <div className="px-10 pb-10 -mt-16 relative flex flex-col flex-1 overflow-hidden">
              <div className="flex flex-col sm:flex-row items-end gap-6 mb-8 flex-shrink-0">
                <img src={selectedStudent.avatar} className="w-36 h-36 rounded-[2.5rem] border-8 border-white shadow-2xl bg-white" alt="" />
                <div className="pb-4 text-center sm:text-left">
                  <h3 className="text-3xl font-black text-gray-900 tracking-tighter">{selectedStudent.name}</h3>
                  <p className="text-indigo-600 font-black uppercase tracking-widest text-[10px] mt-1">Student ID: {selectedStudent.id}</p>
                </div>
              </div>

              <div className="flex-1 overflow-y-auto pr-2 space-y-8 custom-scrollbar">
                {/* Stats Section */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="bg-indigo-50 p-6 rounded-3xl border border-indigo-100 shadow-sm flex items-center gap-5">
                    <div className="bg-white p-3 rounded-2xl text-indigo-600 shadow-sm">
                      <Activity size={24} />
                    </div>
                    <div>
                      <p className="text-[10px] font-black text-indigo-900/40 uppercase tracking-widest">Global Attendance</p>
                      <p className="text-2xl font-black text-indigo-900">{calculatePresenceRate(selectedStudent.id)}%</p>
                    </div>
                  </div>
                  <div className="bg-gray-50 p-6 rounded-3xl border border-gray-100 shadow-sm flex items-center gap-5">
                    <div className="bg-white p-3 rounded-2xl text-gray-400 shadow-sm">
                      <Calendar size={24} />
                    </div>
                    <div>
                      <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Enrollment Date</p>
                      <p className="text-lg font-black text-gray-700">{selectedStudent.joinDate}</p>
                    </div>
                  </div>
                </div>

                {/* bio section */}
                {selectedStudent.bio && (
                  <div className="p-6 bg-emerald-50/50 rounded-3xl border border-emerald-100/50 flex items-start gap-4">
                    <Info className="text-emerald-400 shrink-0 mt-1" size={20} />
                    <p className="text-sm font-medium text-emerald-900 leading-relaxed italic">"{selectedStudent.bio}"</p>
                  </div>
                )}

                {/* Attendance History Section */}
                <div className="space-y-4">
                  <div className="flex items-center justify-between border-b border-gray-100 pb-4">
                    <h4 className="font-black text-gray-900 text-xs uppercase tracking-[0.2em] flex items-center gap-2">
                      <CheckCircle size={16} className="text-indigo-600" />
                      Attendance History
                    </h4>
                    <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">
                      {getStudentAttendance(selectedStudent.id).length} Records
                    </span>
                  </div>

                  <div className="grid gap-3">
                    {getStudentAttendance(selectedStudent.id).map((record, i) => (
                      <div key={i} className="flex items-center justify-between p-4 bg-white border border-gray-100 rounded-2xl hover:border-indigo-100 transition-all group">
                        <div className="flex items-center gap-4">
                          <div className={`w-2.5 h-2.5 rounded-full ${record.status === 'present' ? 'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.4)]' : 'bg-rose-500 shadow-[0_0_8px_rgba(244,63,94,0.4)]'}`}></div>
                          <span className="text-sm font-bold text-gray-700">
                            {new Date(record.date).toLocaleDateString(undefined, { weekday: 'short', year: 'numeric', month: 'short', day: 'numeric' })}
                          </span>
                        </div>
                        <div className={`text-[9px] font-black uppercase tracking-widest px-3 py-1 rounded-lg ${record.status === 'present' ? 'bg-emerald-50 text-emerald-600 border border-emerald-100' : 'bg-rose-50 text-rose-600 border border-rose-100'}`}>
                          {record.status}
                        </div>
                      </div>
                    ))}
                    {getStudentAttendance(selectedStudent.id).length === 0 && (
                      <div className="py-12 text-center">
                        <p className="text-sm text-gray-400 font-medium">No attendance records found for this student.</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              <div className="mt-8 flex gap-3 flex-shrink-0">
                <button 
                  onClick={() => {
                    onStartChat(selectedStudent.id);
                    setSelectedStudent(null);
                  }}
                  className="flex-1 flex items-center justify-center gap-2 bg-indigo-600 text-white py-4 rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl shadow-indigo-100 hover:bg-indigo-700 transition-all active:scale-95"
                >
                  <MessageCircle size={18} />
                  Private Message
                </button>
                <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-2xl border border-gray-100">
                  <Mail className="text-gray-400" size={18} />
                  <span className="text-xs font-bold text-gray-600">{selectedStudent.email}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default StudentsTab;
