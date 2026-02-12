
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

  const pendingLeaves = (classroom.leaveRequests || []).filter(r => r.status === 'pending');

  return (
    <div className="p-8 space-y-12">
      <h3 className="text-xl font-black text-gray-900">Pending Leave Requests</h3>
      <div className="grid gap-4">
        {pendingLeaves.length === 0 && <p className="text-center py-8 text-gray-400 italic">No pending requests.</p>}
        {pendingLeaves.map(r => (
          <div key={r.id} className="bg-white border border-gray-100 rounded-[2rem] p-6 flex items-center justify-between gap-6 shadow-sm">
            <div className="flex items-start gap-4">
              <div className="bg-amber-50 text-amber-600 p-3 rounded-2xl"><Clock size={24} /></div>
              <div>
                <h4 className="font-bold text-gray-900">{r.studentName}</h4>
                <p className="text-sm text-gray-500 italic">"{r.reason}"</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <button onClick={() => updateLeaveStatus(r.id, 'approved')} className="bg-emerald-50 text-emerald-600 px-6 py-2.5 rounded-xl font-bold hover:bg-emerald-600 hover:text-white transition-all">Approve</button>
              <button onClick={() => updateLeaveStatus(r.id, 'rejected')} className="bg-red-50 text-red-600 px-6 py-2.5 rounded-xl font-bold hover:bg-red-600 hover:text-white transition-all">Reject</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default RequestsTab;
