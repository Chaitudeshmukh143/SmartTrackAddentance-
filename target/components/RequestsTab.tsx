
import React from 'react';
import { Classroom, LeaveRequest, AttendanceQuery } from '../types';
import { Check, X, Clock, AlertCircle } from 'lucide-react';

interface RequestsTabProps {
  classroom: Classroom;
  onUpdate: (updated: Classroom) => void;
}

const RequestsTab: React.FC<RequestsTabProps> = ({ classroom, onUpdate }) => {
  const updateLeaveStatus = (id: string, status: 'approved' | 'rejected') => {
    const updated = (classroom.leaveRequests || []).map(r => r.id === id ? { ...r, status } : r);
    onUpdate({ ...classroom, leaveRequests: updated });
  };

  const resolveQuery = (id: string) => {
    const updated = (classroom.attendanceQueries || []).map(q => q.id === id ? { ...q, status: 'resolved' as const } : q);
    onUpdate({ ...classroom, attendanceQueries: updated });
  };

  const pendingLeaves = (classroom.leaveRequests || []).filter(r => r.status === 'pending');
  const pendingQueries = (classroom.attendanceQueries || []).filter(q => q.status === 'pending');

  return (
    <div className="p-8 space-y-12">
      <section className="space-y-6">
        <div className="flex items-center justify-between">
          <h3 className="text-xl font-black text-gray-900 flex items-center gap-2">
            Leave Requests
            <span className="bg-amber-100 text-amber-700 text-xs px-2 py-0.5 rounded-full">{pendingLeaves.length}</span>
          </h3>
        </div>
        <div className="grid gap-4">
          {pendingLeaves.length === 0 && <p className="text-center py-8 text-gray-400 font-medium italic">No pending leave requests.</p>}
          {pendingLeaves.map(r => (
            <div key={r.id} className="bg-white border border-gray-100 rounded-[2rem] p-6 flex flex-col md:flex-row md:items-center justify-between gap-6 shadow-sm">
              <div className="flex items-start gap-4">
                <div className="bg-amber-50 text-amber-600 p-3 rounded-2xl"><Clock size={24} /></div>
                <div>
                  <h4 className="font-bold text-gray-900">{r.studentName}</h4>
                  <p className="text-xs text-indigo-600 font-bold uppercase tracking-tighter mb-2">{new Date(r.startDate).toLocaleDateString()} to {new Date(r.endDate).toLocaleDateString()}</p>
                  <p className="text-sm text-gray-500 italic">"{r.reason}"</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <button 
                  onClick={() => updateLeaveStatus(r.id, 'approved')}
                  className="bg-emerald-50 text-emerald-600 px-6 py-2.5 rounded-xl font-bold hover:bg-emerald-600 hover:text-white transition-all flex items-center gap-2"
                >
                  <Check size={18} /> Approve
                </button>
                <button 
                  onClick={() => updateLeaveStatus(r.id, 'rejected')}
                  className="bg-red-50 text-red-600 px-6 py-2.5 rounded-xl font-bold hover:bg-red-600 hover:text-white transition-all flex items-center gap-2"
                >
                  <X size={18} /> Reject
                </button>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="space-y-6">
        <div className="flex items-center justify-between">
          <h3 className="text-xl font-black text-gray-900 flex items-center gap-2">
            Attendance Disputes
            <span className="bg-red-100 text-red-700 text-xs px-2 py-0.5 rounded-full">{pendingQueries.length}</span>
          </h3>
        </div>
        <div className="grid gap-4">
          {pendingQueries.length === 0 && <p className="text-center py-8 text-gray-400 font-medium italic">All queries resolved.</p>}
          {pendingQueries.map(q => (
            <div key={q.id} className="bg-white border border-gray-100 rounded-[2rem] p-6 flex flex-col md:flex-row md:items-center justify-between gap-6 shadow-sm">
              <div className="flex items-start gap-4">
                <div className="bg-red-50 text-red-600 p-3 rounded-2xl"><AlertCircle size={24} /></div>
                <div>
                  <div className="flex items-center gap-2">
                    <h4 className="font-bold text-gray-900">{q.studentName}</h4>
                    <span className="bg-gray-100 text-gray-500 text-[10px] font-black uppercase px-2 py-0.5 rounded-md">Date: {q.date}</span>
                  </div>
                  <p className="text-sm text-gray-500 mt-2 italic">"{q.description}"</p>
                </div>
              </div>
              <button 
                onClick={() => resolveQuery(q.id)}
                className="bg-indigo-600 text-white px-8 py-3 rounded-xl font-bold hover:bg-indigo-700 transition-all flex items-center gap-2"
              >
                Mark as Resolved
              </button>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
};

export default RequestsTab;
