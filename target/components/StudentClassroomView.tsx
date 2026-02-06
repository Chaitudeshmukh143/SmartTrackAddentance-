
import React, { useState } from 'react';
import { Classroom, Message, Student, LeaveRequest, AttendanceQuery } from '../types';
import { FileText, CheckCircle, MessageSquare, Clock, AlertCircle, Calendar, Send, XCircle, ArrowLeft, Activity, QrCode } from 'lucide-react';
import ChatTab from './ChatTab';
import NotesTab from './NotesTab';
import ScannerModal from './ScannerModal';
import { api } from '../api';

interface StudentClassroomViewProps {
  classroom: Classroom;
  onUpdate: (updated: Classroom) => void;
  studentId: string;
}

type TabType = 'my-attendance' | 'notes' | 'chat' | 'leave';

const StudentClassroomView: React.FC<StudentClassroomViewProps> = ({ classroom, onUpdate, studentId }) => {
  const [activeTab, setActiveTab] = useState<TabType>('my-attendance');
  const [leaveForm, setLeaveForm] = useState({ start: '', end: '', reason: '' });
  const [queryForm, setQueryForm] = useState({ date: '', description: '' });
  const [showQueryModal, setShowQueryModal] = useState(false);
  const [showScanner, setShowScanner] = useState(false);

  const studentData = classroom.students.find(s => s.id === studentId);
  const myAttendance = classroom.attendance.filter(a => a.studentId === studentId);
  const myLeaves = (classroom.leaveRequests || []).filter(l => l.studentId === studentId);
  const myQueries = (classroom.attendanceQueries || []).filter(q => q.studentId === studentId);

  const attendanceRate = myAttendance.length > 0 
    ? Math.round((myAttendance.filter(a => a.status === 'present').length / myAttendance.length) * 100) 
    : 0;

  const handleApplyLeave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!leaveForm.start || !leaveForm.end || !leaveForm.reason) return;
    const request: LeaveRequest = {
      id: `lv-${Date.now()}`,
      studentId,
      studentName: studentData?.name || 'Unknown',
      startDate: leaveForm.start,
      endDate: leaveForm.end,
      reason: leaveForm.reason,
      status: 'pending',
      requestDate: new Date().toISOString().split('T')[0]
    };
    onUpdate({ ...classroom, leaveRequests: [...(classroom.leaveRequests || []), request] });
    setLeaveForm({ start: '', end: '', reason: '' });
    alert("Leave request submitted.");
  };

  const handleRaiseQuery = (e: React.FormEvent) => {
    e.preventDefault();
    if (!queryForm.date || !queryForm.description) return;
    const query: AttendanceQuery = {
      id: `q-${Date.now()}`,
      studentId,
      studentName: studentData?.name || 'Unknown',
      date: queryForm.date,
      description: queryForm.description,
      status: 'pending'
    };
    onUpdate({ ...classroom, attendanceQueries: [...(classroom.attendanceQueries || []), query] });
    setQueryForm({ date: '', description: '' });
    setShowQueryModal(false);
    alert("Attendance dispute sent.");
  };

  const handleBack = () => {
    window.dispatchEvent(new CustomEvent('navigate', { detail: 'dashboard' }));
  };

  const handleScanSuccess = async (code: string) => {
    setShowScanner(false);
    try {
      const user = api.getCurrentUser();
      if (!user) return;
      
      const updatedClass = await api.enrollByCode(code, user);
      onUpdate(updatedClass);
      alert(`Successfully enrolled in ${updatedClass.name}!`);
      // Reload dashboard data
      window.dispatchEvent(new CustomEvent('navigate', { detail: 'dashboard' }));
    } catch (err: any) {
      alert(err.message || "Failed to enroll. Check the code.");
    }
  };

  return (
    <div className="max-w-6xl mx-auto animate-in fade-in slide-in-from-right-4 duration-500">
      <div className="mb-6 flex items-center justify-between">
        <button 
          onClick={handleBack}
          className="group flex items-center gap-2 text-indigo-600 font-black text-xs uppercase tracking-widest bg-white px-5 py-3 rounded-2xl shadow-sm border border-gray-100 hover:bg-indigo-600 hover:text-white transition-all"
        >
          <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" />
          Back to Hub
        </button>
        <button 
          onClick={() => setShowScanner(true)}
          className="flex items-center gap-2 text-indigo-600 font-black text-xs uppercase tracking-widest bg-indigo-50 px-5 py-3 rounded-2xl shadow-sm border border-indigo-100 hover:bg-indigo-600 hover:text-white transition-all"
        >
          <QrCode size={16} />
          Join New Class
        </button>
      </div>

      <header className="mb-8 flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <div className="flex items-center gap-2 text-indigo-600 font-semibold mb-2">
            <span className="bg-indigo-100 text-[10px] uppercase px-2 py-0.5 rounded-full">{classroom.subject}</span>
          </div>
          <h1 className="text-4xl font-black text-gray-900 tracking-tighter leading-tight">{classroom.name}</h1>
          <p className="text-gray-500 mt-1 font-medium">Student Dashboard • Welcome back, {studentData?.name}</p>
        </div>
        
        <div className="flex items-center gap-2 p-1 bg-gray-100 rounded-xl overflow-x-auto shadow-inner border border-gray-200">
          {[
            { id: 'my-attendance', label: 'Attendance', icon: CheckCircle },
            { id: 'notes', label: 'Notes', icon: FileText },
            { id: 'chat', label: 'Class Chat', icon: MessageSquare },
            { id: 'leave', label: 'Leave & Help', icon: Clock },
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as TabType)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-lg font-bold whitespace-nowrap transition-all ${activeTab === tab.id ? 'bg-white text-indigo-600 shadow-sm' : 'text-gray-500 hover:text-gray-800'}`}
            >
              <tab.icon size={18} />
              {tab.label}
            </button>
          ))}
        </div>
      </header>

      <div className="bg-white rounded-[2.5rem] border border-gray-100 shadow-xl overflow-hidden min-h-[500px]">
        {activeTab === 'my-attendance' && (
          <div className="p-10 space-y-10">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="bg-indigo-600 p-8 rounded-[2.5rem] text-white shadow-xl shadow-indigo-100 flex flex-col justify-between relative overflow-hidden">
                <div className="relative z-10">
                  <p className="text-[10px] font-black uppercase tracking-widest opacity-80 mb-1">My Performance</p>
                  <h3 className="text-6xl font-black tracking-tighter">{attendanceRate}%</h3>
                </div>
                <div className="mt-8 relative z-10">
                  <div className="flex justify-between text-[10px] font-bold uppercase tracking-widest mb-2 opacity-80">
                    <span>Present Rate</span>
                    <span>{myAttendance.filter(a => a.status === 'present').length}/{myAttendance.length} Days</span>
                  </div>
                  <div className="w-full h-3 bg-white/20 rounded-full overflow-hidden">
                    <div className="bg-white h-full rounded-full transition-all duration-1000" style={{ width: `${attendanceRate}%` }}></div>
                  </div>
                </div>
                <Activity className="absolute -bottom-4 -right-4 text-white/10 w-40 h-40" />
              </div>
              <div className="md:col-span-2 flex items-center justify-between bg-gradient-to-br from-indigo-50/30 to-white p-10 rounded-[2.5rem] border border-indigo-50/50">
                <div className="max-w-xs">
                  <h4 className="font-black text-gray-900 text-xl tracking-tight">Need to resolve a missing record?</h4>
                  <p className="text-sm text-gray-500 mt-3 font-medium">If you believe your attendance was incorrectly marked, reach out to your instructor by raising a dispute.</p>
                </div>
                <button 
                  onClick={() => setShowQueryModal(true)}
                  className="bg-white text-indigo-600 px-8 py-4 rounded-2xl font-black shadow-lg shadow-indigo-50 border border-indigo-50 hover:bg-indigo-50 transition-all flex items-center gap-2 active:scale-95"
                >
                  <AlertCircle size={22} />
                  Dispute
                </button>
              </div>
            </div>

            <div className="space-y-6">
              <h4 className="font-black text-gray-900 uppercase text-xs tracking-[0.2em] px-2 opacity-50">Timeline activity</h4>
              <div className="grid gap-4">
                {myAttendance.slice().reverse().map((record, i) => {
                  const isPresent = record.status === 'present';
                  return (
                    <div key={i} className="relative flex items-center justify-between p-6 bg-white border border-gray-100 rounded-3xl hover:border-indigo-100 transition-all group overflow-hidden">
                      {/* Left Status Bar */}
                      <div className={`absolute left-0 top-0 bottom-0 w-1.5 transition-colors ${isPresent ? 'bg-emerald-500' : 'bg-red-500'}`}></div>
                      
                      <div className="flex items-center gap-5">
                        <div className={`w-14 h-14 rounded-2xl flex items-center justify-center transition-all ${isPresent ? 'bg-emerald-50 text-emerald-600 shadow-[0_8px_16px_-4px_rgba(16,185,129,0.1)]' : 'bg-red-50 text-red-600 shadow-[0_8px_16px_-4px_rgba(239,68,68,0.1)]'}`}>
                          {isPresent ? <CheckCircle size={28} /> : <XCircle size={28} />}
                        </div>
                        <div>
                          <div className="flex items-center gap-3">
                            <span className="block font-black text-gray-900 text-lg tracking-tight">
                              {new Date(record.date).toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                            </span>
                            {/* Distinct Status Dot */}
                            <div className={`w-2.5 h-2.5 rounded-full border-2 border-white shadow-sm transition-all ${isPresent ? 'bg-emerald-500 animate-pulse' : 'bg-red-500'}`}></div>
                          </div>
                          <span className="block text-[10px] text-gray-400 font-bold uppercase tracking-widest mt-0.5">Automated Scan Entry • 09:15 AM</span>
                        </div>
                      </div>
                      <div className={`flex items-center gap-3 px-6 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest shadow-sm transition-all ${isPresent ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-700'}`}>
                        {/* Inline Status Icon */}
                        {isPresent ? <CheckCircle size={14} className="shrink-0" /> : <XCircle size={14} className="shrink-0" />}
                        {record.status}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'leave' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 p-12">
            <div className="space-y-10">
              <div>
                <h3 className="text-3xl font-black text-gray-900 tracking-tight">Request Leave</h3>
                <p className="text-gray-500 mt-2 font-medium">Submit your leave application for faculty approval.</p>
              </div>
              <form onSubmit={handleApplyLeave} className="space-y-5">
                <div className="grid grid-cols-2 gap-6">
                  <div>
                    <label className="block text-[10px] font-black text-gray-400 uppercase tracking-[0.1em] mb-2">From</label>
                    <input type="date" required value={leaveForm.start} onChange={e => setLeaveForm({...leaveForm, start: e.target.value})} className="w-full px-5 py-4 bg-gray-50 border-none rounded-2xl focus:ring-2 focus:ring-indigo-500 outline-none font-bold" />
                  </div>
                  <div>
                    <label className="block text-[10px] font-black text-gray-400 uppercase tracking-[0.1em] mb-2">To</label>
                    <input type="date" required value={leaveForm.end} onChange={e => setLeaveForm({...leaveForm, end: e.target.value})} className="w-full px-5 py-4 bg-gray-50 border-none rounded-2xl focus:ring-2 focus:ring-indigo-500 outline-none font-bold" />
                  </div>
                </div>
                <div>
                  <label className="block text-[10px] font-black text-gray-400 uppercase tracking-[0.1em] mb-2">Purpose</label>
                  <textarea required value={leaveForm.reason} onChange={e => setLeaveForm({...leaveForm, reason: e.target.value})} placeholder="Why do you need leave?" className="w-full px-6 py-5 bg-gray-50 border-none rounded-2xl focus:ring-2 focus:ring-indigo-500 outline-none font-bold h-36 resize-none" />
                </div>
                <button type="submit" className="w-full bg-indigo-600 text-white py-5 rounded-2xl font-black shadow-xl shadow-indigo-100 hover:bg-indigo-700 transition-all flex items-center justify-center gap-3 active:scale-95">
                  <Send size={22} />
                  Send to Instructor
                </button>
              </form>
            </div>
            
            <div className="space-y-8">
              <h4 className="font-black text-gray-900 uppercase text-xs tracking-[0.2em] opacity-50">Status updates</h4>
              <div className="space-y-4">
                {[...myLeaves, ...myQueries].length === 0 && <div className="py-20 text-center text-gray-300 italic">No activity yet.</div>}
                {myLeaves.slice().reverse().map((r) => (
                  <div key={r.id} className="p-6 bg-gray-50 rounded-3xl border border-gray-100 shadow-sm">
                    <div className="flex items-center justify-between mb-3">
                      <span className="bg-indigo-100 text-indigo-700 text-[10px] font-black px-3 py-1 rounded-full uppercase tracking-widest">Leave</span>
                      <span className={`text-[10px] font-black uppercase tracking-widest ${r.status === 'approved' ? 'text-emerald-600' : r.status === 'rejected' ? 'text-red-600' : 'text-amber-500'}`}>{r.status}</span>
                    </div>
                    <p className="text-sm font-black text-gray-800 tracking-tight">{new Date(r.startDate).toDateString()} - {new Date(r.endDate).toDateString()}</p>
                    <p className="text-xs text-gray-500 mt-2 italic">"{r.reason}"</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'notes' && <NotesTab classroom={classroom} onUpdate={onUpdate} />}
        {activeTab === 'chat' && <ChatTab classroom={classroom} onUpdate={onUpdate} initialRecipientId={null} />}
      </div>

      {showQueryModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-md p-4">
          <div className="bg-white rounded-[2.5rem] shadow-2xl w-full max-w-lg animate-in zoom-in-95 duration-200">
            <div className="p-10 border-b border-gray-50 flex items-center justify-between bg-indigo-600 text-white rounded-t-[2.5rem]">
              <div>
                <h3 className="text-3xl font-black tracking-tight">Report Issue</h3>
                <p className="text-indigo-200 text-xs font-bold uppercase tracking-widest mt-1">Attendance dispute</p>
              </div>
              <button onClick={() => setShowQueryModal(false)} className="opacity-70 hover:opacity-100 transition-opacity">
                <XCircle size={32} />
              </button>
            </div>
            <form onSubmit={handleRaiseQuery} className="p-10 space-y-6">
              <div>
                <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Select Date</label>
                <input type="date" required value={queryForm.date} onChange={e => setQueryForm({ ...queryForm, date: e.target.value })} className="w-full px-5 py-4 bg-gray-50 border-none rounded-2xl focus:ring-2 focus:ring-indigo-500 outline-none font-bold" />
              </div>
              <div>
                <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Message</label>
                <textarea required value={queryForm.description} onChange={e => setQueryForm({ ...queryForm, description: e.target.value })} className="w-full px-6 py-5 bg-gray-50 border-none rounded-2xl focus:ring-2 focus:ring-indigo-500 outline-none font-bold h-36 resize-none" placeholder="Provide proof or details..." />
              </div>
              <button type="submit" className="w-full bg-indigo-600 text-white py-5 rounded-2xl font-black shadow-xl shadow-indigo-100 hover:bg-indigo-700 transition-all active:scale-95">
                Send Dispute
              </button>
            </form>
          </div>
        </div>
      )}

      {showScanner && (
        <ScannerModal 
          title="Scan QR to Enroll" 
          onScan={handleScanSuccess} 
          onClose={() => setShowScanner(false)} 
        />
      )}
    </div>
  );
};

export default StudentClassroomView;
