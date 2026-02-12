
import React, { useState } from 'react';
import { Classroom, LeaveRequest, AttendanceQuery } from '../types';
import { FileText, CheckCircle, MessageSquare, Clock, ArrowLeft, Activity, QrCode, Send, XCircle, AlertCircle, Calendar } from 'lucide-react';
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
  const [showScanner, setShowScanner] = useState(false);
  const [leaveForm, setLeaveForm] = useState({ start: '', end: '', reason: '' });

  const studentData = classroom.students.find(s => s.id === studentId);
  const myAttendance = classroom.attendance.filter(a => a.studentId === studentId);
  const myLeaves = (classroom.leaveRequests || []).filter(l => l.studentId === studentId);
  
  const attendanceRate = myAttendance.length > 0 ? Math.round((myAttendance.filter(a => a.status === 'present').length / myAttendance.length) * 100) : 0;

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
    alert("Leave request dispatched to faculty.");
  };

  const getStatusStyles = (status: string) => {
    switch (status) {
      case 'approved':
        return {
          bg: 'bg-emerald-50',
          text: 'text-emerald-700',
          border: 'border-emerald-100',
          icon: <CheckCircle size={14} className="text-emerald-500" />
        };
      case 'rejected':
        return {
          bg: 'bg-rose-50',
          text: 'text-rose-700',
          border: 'border-rose-100',
          icon: <XCircle size={14} className="text-rose-500" />
        };
      default:
        return {
          bg: 'bg-amber-50',
          text: 'text-amber-700',
          border: 'border-amber-100',
          icon: <Clock size={14} className="text-amber-500" />
        };
    }
  };

  return (
    <div className="max-w-5xl mx-auto scale-[0.95] origin-top animate-in fade-in slide-in-from-right-4 duration-500">
      <div className="mb-6 flex items-center justify-between">
        <button onClick={() => window.dispatchEvent(new CustomEvent('navigate', { detail: 'dashboard' }))} className="group flex items-center gap-2 text-indigo-600 font-black text-xs uppercase bg-white px-5 py-3 rounded-2xl shadow-sm border border-gray-100 hover:bg-indigo-50 transition-all">
          <ArrowLeft size={16} /> Back to Hub
        </button>
        <button onClick={() => setShowScanner(true)} className="flex items-center gap-2 text-indigo-600 font-black text-xs uppercase bg-indigo-50 px-5 py-3 rounded-2xl shadow-sm border border-indigo-100 hover:bg-indigo-600 hover:text-white transition-all">
          <QrCode size={16} /> Join New Class
        </button>
      </div>

      <header className="mb-8 flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <span className="bg-indigo-100 text-indigo-600 text-[10px] uppercase px-2 py-0.5 rounded-full font-black tracking-widest">{classroom.subject}</span>
          <h1 className="text-4xl font-black text-gray-900 tracking-tighter leading-tight mt-2">{classroom.name}</h1>
          <p className="text-gray-500 font-medium text-sm mt-1">Institutional Student Portal • Welcome, {studentData?.name}</p>
        </div>
        <div className="flex items-center gap-2 p-1 bg-gray-100 rounded-xl shadow-inner border border-gray-200">
          {[
            { id: 'my-attendance', label: 'Attendance', icon: CheckCircle },
            { id: 'notes', label: 'Notes', icon: FileText },
            { id: 'chat', label: 'Chat', icon: MessageSquare },
            { id: 'leave', label: 'Leave & Help', icon: Clock },
          ].map(tab => (
            <button key={tab.id} onClick={() => setActiveTab(tab.id as TabType)} className={`flex items-center gap-2 px-4 py-2.5 rounded-lg font-bold transition-all ${activeTab === tab.id ? 'bg-white text-indigo-600 shadow-sm' : 'text-gray-500 hover:text-gray-800'}`}>
              <tab.icon size={18} /> <span className="text-sm">{tab.label}</span>
            </button>
          ))}
        </div>
      </header>

      <div className="bg-white rounded-[2.5rem] border border-gray-100 shadow-xl overflow-hidden min-h-[500px]">
        {activeTab === 'my-attendance' && (
          <div className="p-10 space-y-10">
            <div className="bg-indigo-600 p-8 lg:p-12 rounded-[2.5rem] text-white flex items-center justify-between relative overflow-hidden shadow-2xl shadow-indigo-100">
              <div className="relative z-10">
                <p className="text-[10px] font-black uppercase tracking-[0.3em] opacity-80 mb-2">Presence Index</p>
                <h3 className="text-7xl font-black tracking-tighter leading-none">{attendanceRate}%</h3>
                <div className="mt-6 flex items-center gap-4">
                  <div className="h-2 w-48 bg-white/20 rounded-full overflow-hidden">
                    <div className="h-full bg-white rounded-full transition-all duration-1000" style={{ width: `${attendanceRate}%` }}></div>
                  </div>
                  <span className="text-xs font-black uppercase tracking-widest opacity-60">Verified Records</span>
                </div>
              </div>
              <Activity className="text-white/10 w-48 h-48 absolute -right-4 -bottom-4" />
            </div>

            <div className="space-y-6">
              <h4 className="font-black text-gray-900 uppercase text-xs tracking-[0.2em] opacity-40 px-2">History Log</h4>
              <div className="grid gap-3">
                {myAttendance.slice().reverse().map((record, i) => (
                  <div key={i} className="flex items-center justify-between p-6 bg-gray-50/50 rounded-3xl border border-gray-50 group hover:bg-white hover:border-indigo-100 hover:shadow-lg transition-all">
                    <div className="flex items-center gap-4">
                      <div className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-all ${record.status === 'present' ? 'bg-emerald-100 text-emerald-600' : 'bg-rose-100 text-rose-600'}`}>
                        {record.status === 'present' ? <CheckCircle size={24} /> : <XCircle size={24} />}
                      </div>
                      <div>
                        <p className="font-black text-gray-900 text-lg tracking-tight">{new Date(record.date).toLocaleDateString(undefined, { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })}</p>
                        <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mt-0.5">Automated Check-in • Terminal 4A</p>
                      </div>
                    </div>
                    <span className={`px-5 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest shadow-sm ${record.status === 'present' ? 'bg-emerald-500 text-white' : 'bg-rose-500 text-white'}`}>{record.status}</span>
                  </div>
                ))}
                {myAttendance.length === 0 && (
                  <div className="py-20 text-center text-gray-300 font-bold italic">No records found for this class.</div>
                )}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'leave' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 p-10 lg:p-14">
            {/* Leave Application Form */}
            <div className="space-y-10">
              <div>
                <h3 className="text-3xl font-black text-gray-900 tracking-tighter italic uppercase">Apply for Leave</h3>
                <p className="text-gray-500 mt-2 font-medium">Request formal absence permission from your instructor.</p>
              </div>
              <form onSubmit={handleApplyLeave} className="space-y-6">
                <div className="grid grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest ml-4">Start Date</label>
                    <input type="date" required value={leaveForm.start} onChange={e => setLeaveForm({...leaveForm, start: e.target.value})} className="w-full px-6 py-4 bg-gray-50 border-2 border-transparent focus:border-indigo-600 rounded-2xl outline-none font-bold transition-all" />
                  </div>
                  <div className="space-y-2">
                    <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest ml-4">End Date</label>
                    <input type="date" required value={leaveForm.end} onChange={e => setLeaveForm({...leaveForm, end: e.target.value})} className="w-full px-6 py-4 bg-gray-50 border-2 border-transparent focus:border-indigo-600 rounded-2xl outline-none font-bold transition-all" />
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest ml-4">Reason / Details</label>
                  <textarea required value={leaveForm.reason} onChange={e => setLeaveForm({...leaveForm, reason: e.target.value})} placeholder="Briefly explain the cause for your leave..." className="w-full px-6 py-5 bg-gray-50 border-2 border-transparent focus:border-indigo-600 rounded-[2rem] outline-none font-bold h-40 resize-none transition-all" />
                </div>
                <button type="submit" className="w-full bg-indigo-600 text-white py-6 rounded-[2rem] font-black text-lg shadow-xl shadow-indigo-100 hover:bg-indigo-700 active:scale-95 transition-all flex items-center justify-center gap-3">
                  <Send size={22} /> Dispatch Request
                </button>
              </form>
            </div>
            
            {/* Request History with Visual Status */}
            <div className="space-y-10">
              <div className="flex items-center justify-between">
                <h3 className="text-2xl font-black text-gray-900 tracking-tighter uppercase italic">History</h3>
                <div className="bg-gray-100 px-3 py-1 rounded-lg text-[9px] font-black text-gray-400 uppercase tracking-widest">{myLeaves.length} Total</div>
              </div>
              <div className="space-y-4">
                {myLeaves.length === 0 && (
                  <div className="py-24 flex flex-col items-center justify-center text-center space-y-4 bg-gray-50 rounded-[3rem] border-2 border-dashed border-gray-100">
                    <AlertCircle size={40} className="text-gray-200" />
                    <p className="text-gray-400 font-black uppercase text-[10px] tracking-widest">No request logs found</p>
                  </div>
                )}
                {myLeaves.slice().reverse().map((r) => {
                  const style = getStatusStyles(r.status);
                  return (
                    <div key={r.id} className="p-8 bg-white border border-gray-100 rounded-[2.5rem] shadow-sm hover:shadow-xl hover:border-indigo-100 transition-all group animate-in slide-in-from-right-4 duration-500">
                      <div className="flex items-center justify-between mb-6">
                        <div className="flex items-center gap-3">
                          <div className="p-2.5 bg-indigo-50 text-indigo-600 rounded-xl">
                            <Calendar size={16} />
                          </div>
                          <span className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400">Leave Application</span>
                        </div>
                        <div className={`flex items-center gap-2 px-4 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest border ${style.bg} ${style.text} ${style.border}`}>
                          {style.icon}
                          {r.status}
                        </div>
                      </div>
                      
                      <div className="space-y-4">
                        <p className="text-xl font-black text-gray-900 tracking-tight leading-none">
                          {new Date(r.startDate).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })} 
                          <span className="mx-2 text-gray-300 font-normal">→</span> 
                          {new Date(r.endDate).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                        </p>
                        <div className="bg-gray-50/50 p-5 rounded-2xl italic text-gray-500 text-sm font-medium border border-gray-100">
                          "{r.reason}"
                        </div>
                      </div>
                      
                      <div className="mt-6 flex items-center justify-between pt-6 border-t border-gray-50">
                        <span className="text-[9px] font-black text-gray-300 uppercase tracking-widest">Submitted: {new Date(r.requestDate).toLocaleDateString()}</span>
                        {r.status === 'pending' && (
                          <span className="flex items-center gap-2 text-[9px] font-black text-amber-500 uppercase tracking-widest">
                            <div className="w-1.5 h-1.5 bg-amber-500 rounded-full animate-pulse"></div>
                            Awaiting Review
                          </span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'notes' && <NotesTab classroom={classroom} onUpdate={onUpdate} />}
        {activeTab === 'chat' && <ChatTab classroom={classroom} onUpdate={onUpdate} initialRecipientId={null} />}
      </div>

      {showScanner && (
        <ScannerModal 
          title="Manifest Join Code" 
          onScan={async (code) => {
             setShowScanner(false);
             try {
               await api.enrollByCode(code, api.getCurrentUser()!);
               window.location.reload();
             } catch (err) { alert(err); }
          }} 
          onClose={() => setShowScanner(false)} 
        />
      )}
    </div>
  );
};

export default StudentClassroomView;
