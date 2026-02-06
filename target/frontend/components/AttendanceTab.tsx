
import React, { useState, useMemo } from 'react';
import { Classroom, Student, AttendanceRecord } from '../types';
import { api } from '../api';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import { 
  Calendar, Save, Loader2, CheckCircle, Search, 
  Download, ArrowLeft, TrendingUp, History, User, 
  FileText, Sparkles, Filter 
} from 'lucide-react';

interface AttendanceTabProps {
  classroom: Classroom;
  onUpdate: (updated: Classroom) => void;
}

const AttendanceTab: React.FC<AttendanceTabProps> = ({ classroom, onUpdate }) => {
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [viewMode, setViewMode] = useState<'mark' | 'reports'>('mark');
  const [isSaving, setIsSaving] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStudentId, setSelectedStudentId] = useState<string | null>(null);

  const getStatus = (studentId: string, date: string) => {
    return classroom.attendance.find(a => a.studentId === studentId && a.date === date)?.status || 'absent';
  };

  const toggleAttendance = (studentId: string) => {
    const currentStatus = getStatus(studentId, selectedDate);
    const newStatus = currentStatus === 'present' ? 'absent' : 'present';
    const existingIndex = classroom.attendance.findIndex(a => a.studentId === studentId && a.date === selectedDate);
    const newAttendance = [...classroom.attendance];

    if (existingIndex > -1) {
      newAttendance[existingIndex] = { ...newAttendance[existingIndex], status: newStatus };
    } else {
      newAttendance.push({ studentId, date: selectedDate, status: newStatus });
    }
    onUpdate({ ...classroom, attendance: newAttendance });
  };

  const filteredStudents = classroom.students.filter(s => s.name.toLowerCase().includes(searchTerm.toLowerCase()));

  // PDF Export for Single Student
  const downloadStudentPDF = (student: Student) => {
    const doc = new jsPDF();
    const studentAttendance = classroom.attendance.filter(a => a.studentId === student.id);
    const presentCount = studentAttendance.filter(a => a.status === 'present').length;
    const rate = studentAttendance.length > 0 ? ((presentCount / studentAttendance.length) * 100).toFixed(1) : '0';

    doc.setFontSize(22);
    doc.setTextColor(99, 102, 241); // Indigo-600
    doc.text(`Student Attendance Report`, 14, 20);
    
    doc.setFontSize(12);
    doc.setTextColor(0);
    doc.text(`Name: ${student.name}`, 14, 32);
    doc.text(`ID: ${student.id}`, 14, 38);
    doc.text(`Class: ${classroom.name}`, 14, 44);
    doc.text(`Overall Rate: ${rate}%`, 14, 50);

    const rows = studentAttendance
      .sort((a, b) => b.date.localeCompare(a.date))
      .map(r => [r.date, r.status.toUpperCase()]);

    autoTable(doc, {
      startY: 60,
      head: [['Date', 'Status']],
      body: rows,
      theme: 'grid',
      headStyles: { fillColor: [99, 102, 241], fontStyle: 'bold' },
    });

    doc.save(`${student.name.replace(/\s+/g, '_')}_Report.pdf`);
  };

  // PDF Export for Entire Class
  const downloadClassPDF = () => {
    const doc = new jsPDF();
    doc.setFontSize(20);
    doc.text(`${classroom.name} - Class Report`, 14, 20);

    const rows = classroom.students.map(s => {
      const att = classroom.attendance.filter(a => a.studentId === s.id);
      const rate = att.length > 0 ? ((att.filter(a => a.status === 'present').length / att.length) * 100).toFixed(0) : '0';
      return [s.id, s.name, `${rate}%`];
    });

    autoTable(doc, {
      startY: 30,
      head: [['ID', 'Student Name', 'Presence Rate']],
      body: rows,
      theme: 'striped',
      headStyles: { fillColor: [99, 102, 241] },
    });

    doc.save(`${classroom.name}_Full_Report.pdf`);
  };

  const selectedStudent = classroom.students.find(s => s.id === selectedStudentId);
  const selectedStudentAttendance = selectedStudentId ? classroom.attendance.filter(a => a.studentId === selectedStudentId) : [];

  return (
    <div className="flex flex-col h-full bg-white relative">
      {/* View Switcher Header */}
      <div className="p-6 lg:p-8 border-b border-gray-100 flex items-center justify-between">
        <div className="flex bg-gray-100 p-1 rounded-2xl">
          <button 
            onClick={() => { setViewMode('mark'); setSelectedStudentId(null); }}
            className={`px-6 py-2.5 rounded-xl font-black text-xs uppercase tracking-widest transition-all ${viewMode === 'mark' ? 'bg-white text-indigo-600 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
          >
            Marking Sheet
          </button>
          <button 
            onClick={() => setViewMode('reports')}
            className={`px-6 py-2.5 rounded-xl font-black text-xs uppercase tracking-widest transition-all ${viewMode === 'reports' ? 'bg-white text-indigo-600 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
          >
            Student Reports
          </button>
        </div>

        {viewMode === 'mark' && (
          <div className="flex items-center gap-3">
            <div className="relative">
              <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 text-indigo-500" size={16} />
              <input 
                type="date" 
                value={selectedDate} 
                onChange={e => setSelectedDate(e.target.value)} 
                className="pl-10 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-xl font-black text-[10px] uppercase outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
            <button 
              onClick={() => api.saveAttendance(classroom.id, classroom.attendance).then(() => alert('Synced!'))}
              className="bg-indigo-600 text-white px-5 py-2 rounded-xl font-black text-[10px] uppercase tracking-widest shadow-xl active:scale-95 transition-all flex items-center gap-2"
            >
              <Save size={14} /> Sync
            </button>
          </div>
        )}
      </div>

      <div className="flex-1 overflow-y-auto custom-scrollbar">
        {viewMode === 'mark' ? (
          <div className="p-6 lg:p-12 space-y-8 animate-in fade-in duration-500">
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 mb-4">
              <div className="space-y-1">
                <h3 className="text-3xl font-black text-gray-900 tracking-tighter uppercase italic">Mark Roll</h3>
                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">{filteredStudents.length} students in list</p>
              </div>
              <div className="relative flex-1 max-w-md">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                <input 
                  type="text" 
                  placeholder="Find student..." 
                  value={searchTerm}
                  onChange={e => setSearchTerm(e.target.value)}
                  className="w-full pl-12 pr-6 py-3 bg-gray-50 rounded-2xl outline-none font-bold text-sm"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
              {filteredStudents.map(student => {
                const isPresent = getStatus(student.id, selectedDate) === 'present';
                return (
                  <div 
                    key={student.id} 
                    onClick={() => toggleAttendance(student.id)} 
                    className={`group p-6 rounded-[2.5rem] border-2 cursor-pointer transition-all duration-500 flex items-center justify-between active:scale-[0.98] ${isPresent ? 'bg-indigo-600 border-indigo-600 shadow-2xl shadow-indigo-100' : 'bg-white border-gray-50 hover:border-indigo-100'}`}
                  >
                    <div className="flex items-center gap-4">
                      <div className={`w-14 h-14 rounded-2xl overflow-hidden border-2 transition-all ${isPresent ? 'border-white/30' : 'border-gray-100'}`}>
                        <img src={student.avatar} className="w-full h-full object-cover" alt="" />
                      </div>
                      <div>
                        <p className={`text-lg font-black tracking-tight ${isPresent ? 'text-white' : 'text-gray-900'}`}>{student.name}</p>
                        <p className={`text-[9px] font-black uppercase tracking-widest ${isPresent ? 'text-indigo-200' : 'text-gray-400'}`}>{student.id}</p>
                      </div>
                    </div>
                    <div className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-all ${isPresent ? 'bg-white text-indigo-600 shadow-lg' : 'bg-gray-50 text-gray-300'}`}>
                      <CheckCircle size={24} />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ) : (
          <div className="p-6 lg:p-12 space-y-10 animate-in fade-in duration-500">
            {selectedStudentId ? (
              <div className="space-y-8 animate-in slide-in-from-left-4 duration-500">
                <div className="flex items-center justify-between">
                  <button onClick={() => setSelectedStudentId(null)} className="flex items-center gap-2 text-indigo-600 font-black text-xs uppercase tracking-widest">
                    <ArrowLeft size={16} /> Back to Overview
                  </button>
                  <button 
                    onClick={() => selectedStudent && downloadStudentPDF(selectedStudent)}
                    className="flex items-center gap-2 bg-indigo-50 text-indigo-600 px-6 py-3 rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-indigo-600 hover:text-white transition-all"
                  >
                    <Download size={14} /> Export Individual Report
                  </button>
                </div>

                {selectedStudent && (
                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    <div className="lg:col-span-1 p-10 bg-indigo-600 rounded-[3rem] text-white shadow-2xl shadow-indigo-100 flex flex-col items-center text-center">
                      <img src={selectedStudent.avatar} className="w-32 h-32 rounded-[2.5rem] border-4 border-white shadow-2xl mb-6" alt="" />
                      <h4 className="text-3xl font-black tracking-tighter leading-none mb-2">{selectedStudent.name}</h4>
                      <p className="text-indigo-200 font-black text-xs uppercase tracking-widest mb-8">{selectedStudent.id}</p>
                      
                      <div className="w-full space-y-4">
                        <div className="bg-white/10 p-4 rounded-2xl flex justify-between items-center">
                          <span className="text-[10px] font-black uppercase tracking-widest opacity-60">Status</span>
                          <span className="text-sm font-black">Active Enrollee</span>
                        </div>
                        <div className="bg-white/10 p-4 rounded-2xl flex justify-between items-center">
                          <span className="text-[10px] font-black uppercase tracking-widest opacity-60">Avg. Presence</span>
                          <span className="text-sm font-black">
                            {((selectedStudentAttendance.filter(a => a.status === 'present').length / Math.max(1, selectedStudentAttendance.length)) * 100).toFixed(0)}%
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="lg:col-span-2 space-y-8">
                      <div className="bg-gray-50 rounded-[3rem] p-10 border border-gray-100 h-full">
                        <h5 className="text-xl font-black text-gray-900 tracking-tighter italic uppercase mb-8 flex items-center gap-3">
                          <History size={24} className="text-indigo-600" />
                          Attendance History Log
                        </h5>
                        <div className="space-y-4">
                          {selectedStudentAttendance.sort((a,b) => b.date.localeCompare(a.date)).map((rec, i) => (
                            <div key={i} className="flex items-center justify-between p-5 bg-white rounded-[2rem] border border-gray-100 shadow-sm">
                              <div className="flex items-center gap-4">
                                <div className={`w-3 h-3 rounded-full ${rec.status === 'present' ? 'bg-emerald-500 animate-pulse' : 'bg-rose-500'}`}></div>
                                <span className="font-black text-sm text-gray-700">{new Date(rec.date).toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</span>
                              </div>
                              <span className={`px-4 py-1 rounded-lg font-black text-[10px] uppercase tracking-widest ${rec.status === 'present' ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-600'}`}>
                                {rec.status}
                              </span>
                            </div>
                          ))}
                          {selectedStudentAttendance.length === 0 && (
                            <div className="py-20 text-center text-gray-400 italic">No records found for this student.</div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="space-y-12">
                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <h3 className="text-4xl font-black text-gray-900 tracking-tighter italic uppercase leading-none">Class Reports</h3>
                    <p className="text-gray-400 text-sm font-medium">Performance analytics for all scholars.</p>
                  </div>
                  <button 
                    onClick={downloadClassPDF}
                    className="flex items-center gap-3 bg-indigo-600 text-white px-8 py-4 rounded-[2rem] font-black text-xs uppercase tracking-widest shadow-2xl shadow-indigo-100 hover:scale-105 active:scale-95 transition-all"
                  >
                    <Download size={20} /> Export Global PDF
                  </button>
                </div>

                <div className="bg-white rounded-[3rem] border border-gray-100 shadow-sm overflow-hidden">
                  <div className="p-8 bg-gray-50 border-b border-gray-100 flex items-center justify-between">
                    <h4 className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Enrollment Portfolio</h4>
                    <div className="flex items-center gap-2 text-indigo-600 font-black text-[10px] uppercase tracking-widest">
                      <Sparkles size={14} className="animate-pulse" />
                      Live Analytics
                    </div>
                  </div>
                  <div className="divide-y divide-gray-50">
                    {classroom.students.map(student => {
                      const att = classroom.attendance.filter(a => a.studentId === student.id);
                      const presentDays = att.filter(a => a.status === 'present').length;
                      const rate = att.length > 0 ? (presentDays / att.length) * 100 : 0;
                      
                      return (
                        <div key={student.id} className="p-8 flex items-center justify-between hover:bg-gray-50/50 transition-all group">
                          <div className="flex items-center gap-6">
                            <img src={student.avatar} className="w-16 h-16 rounded-2xl border-4 border-white shadow-xl group-hover:scale-110 transition-transform" alt="" />
                            <div>
                              <p className="text-xl font-black text-gray-900 tracking-tighter">{student.name}</p>
                              <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">{student.id}</p>
                            </div>
                          </div>
                          
                          <div className="flex items-center gap-12">
                            <div className="hidden md:flex flex-col items-end gap-1">
                              <span className="text-[10px] font-black text-indigo-600 uppercase tracking-widest">{rate.toFixed(0)}% Rate</span>
                              <div className="w-48 h-2.5 bg-gray-100 rounded-full overflow-hidden border border-gray-50">
                                <div className={`h-full bg-indigo-500 rounded-full transition-all duration-1000`} style={{ width: `${rate}%` }}></div>
                              </div>
                            </div>
                            <button 
                              onClick={() => setSelectedStudentId(student.id)}
                              className="px-6 py-3 bg-white border border-gray-100 rounded-2xl font-black text-[10px] uppercase tracking-widest text-gray-500 hover:bg-indigo-600 hover:text-white hover:border-indigo-600 transition-all shadow-sm active:scale-95 flex items-center gap-2"
                            >
                              <FileText size={14} /> Full Record
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default AttendanceTab;
