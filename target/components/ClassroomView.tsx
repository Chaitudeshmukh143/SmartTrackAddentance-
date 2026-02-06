
import React, { useState } from 'react';
import { Classroom, Note, Student } from '../types';
import { QrCode, FileText, CheckCircle, Users, MessageSquare, Inbox, Download, ArrowLeft, Upload } from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';
import AttendanceTab from './AttendanceTab';
import NotesTab from './NotesTab';
import ChatTab from './ChatTab';
import StudentsTab from './StudentsTab';
import RequestsTab from './RequestsTab';

interface ClassroomViewProps {
  classroom: Classroom;
  onUpdate: (updated: Classroom) => void;
}

type TabType = 'attendance' | 'notes' | 'students' | 'chat' | 'qr' | 'requests';

const ClassroomView: React.FC<ClassroomViewProps> = ({ classroom, onUpdate }) => {
  const [activeTab, setActiveTab] = useState<TabType>('attendance');
  const [selectedChatStudentId, setSelectedChatStudentId] = useState<string | null>(null);

  const pendingRequestsCount = (classroom.leaveRequests?.filter(r => r.status === 'pending').length || 0) + 
                          (classroom.attendanceQueries?.filter(q => q.status === 'pending').length || 0);

  const tabs = [
    { id: 'attendance', label: 'Attendance', icon: CheckCircle },
    { id: 'notes', label: 'Notes', icon: FileText },
    { id: 'students', label: 'Students', icon: Users },
    { id: 'requests', label: 'Requests', icon: Inbox, count: pendingRequestsCount },
    { id: 'chat', label: 'Chat', icon: MessageSquare },
    { id: 'qr', label: 'Invite', icon: QrCode },
  ];

  const handleStartPrivateChat = (studentId: string) => {
    setSelectedChatStudentId(studentId);
    setActiveTab('chat');
  };

  // Back button triggers a custom event or you can handle it by updating a state in App.tsx
  // Since App.tsx controls which view is active, we can use window.dispatchEvent or a prop
  const handleBack = () => {
    window.dispatchEvent(new CustomEvent('navigate', { detail: 'dashboard' }));
  };

  return (
    <div className="max-w-6xl mx-auto animate-in fade-in slide-in-from-right-4 duration-500">
      <div className="mb-6">
        <button 
          onClick={handleBack}
          className="group flex items-center gap-2 text-indigo-600 font-black text-xs uppercase tracking-widest bg-white px-5 py-3 rounded-2xl shadow-sm border border-gray-100 hover:bg-indigo-600 hover:text-white transition-all"
        >
          <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" />
          Back to Dashboard
        </button>
      </div>

      <header className="mb-8 flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <div className="flex items-center gap-2 text-indigo-600 font-semibold mb-2">
            <span className="bg-indigo-100 text-[10px] uppercase px-2 py-0.5 rounded-full">{classroom.subject}</span>
          </div>
          <h1 className="text-4xl font-black text-gray-900 leading-tight tracking-tighter">{classroom.name}</h1>
          <p className="text-gray-500 mt-1">Section A • Teacher Portal</p>
        </div>

        <div className="flex flex-col gap-3">
          <div className="flex items-center gap-2 p-1 bg-gray-100 rounded-xl overflow-x-auto shadow-inner border border-gray-200">
            {tabs.map(tab => (
              <button
                key={tab.id}
                onClick={() => {
                  setActiveTab(tab.id as TabType);
                  if (tab.id !== 'chat') setSelectedChatStudentId(null);
                }}
                className={`
                  flex items-center gap-2 px-4 py-2.5 rounded-lg font-bold whitespace-nowrap transition-all relative
                  ${activeTab === tab.id ? 'bg-white text-indigo-600 shadow-sm' : 'text-gray-500 hover:text-gray-800'}
                `}
              >
                <tab.icon size={18} />
                {tab.label}
                {tab.count !== undefined && tab.count > 0 && (
                  <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-[10px] flex items-center justify-center rounded-full border-2 border-white">
                    {tab.count}
                  </span>
                )}
              </button>
            ))}
          </div>
          {activeTab !== 'notes' && (
            <button 
              onClick={() => setActiveTab('notes')}
              className="flex items-center justify-center gap-2 bg-indigo-50 text-indigo-600 px-4 py-2.5 rounded-xl font-bold text-xs uppercase tracking-widest border border-indigo-100 hover:bg-indigo-100 transition-all"
            >
              <Upload size={16} />
              Quick Upload Notes
            </button>
          )}
        </div>
      </header>

      <div className="bg-white rounded-3xl border border-gray-100 shadow-xl shadow-gray-200/50 overflow-hidden min-h-[600px]">
        {activeTab === 'attendance' && <AttendanceTab classroom={classroom} onUpdate={onUpdate} />}
        {activeTab === 'notes' && <NotesTab classroom={classroom} onUpdate={onUpdate} />}
        {activeTab === 'students' && <StudentsTab classroom={classroom} onUpdate={onUpdate} onStartChat={handleStartPrivateChat} />}
        {activeTab === 'chat' && <ChatTab classroom={classroom} onUpdate={onUpdate} initialRecipientId={selectedChatStudentId} />}
        {activeTab === 'requests' && <RequestsTab classroom={classroom} onUpdate={onUpdate} />}
        {activeTab === 'qr' && (
          <div className="p-12 flex flex-col items-center justify-center h-full text-center space-y-8 animate-in zoom-in-95 duration-300">
            <div className="p-8 bg-indigo-50 rounded-3xl border-2 border-indigo-100 shadow-inner">
              <QRCodeSVG value={classroom.qrCode} size={256} className="mx-auto" />
            </div>
            <div className="max-w-md">
              <h2 className="text-3xl font-black mb-2 text-gray-900">Invite Your Students</h2>
              <p className="text-gray-500 mb-6 font-medium">Students can scan this unique code to instantly enroll. You'll see them in the "Students" tab once they join.</p>
              <div className="flex flex-col items-center gap-4">
                <button className="w-full flex items-center justify-center gap-2 bg-indigo-600 text-white px-8 py-4 rounded-2xl font-black hover:bg-indigo-700 transition-all shadow-xl shadow-indigo-100 active:scale-95">
                  <Download size={20} />
                  Save QR Code Image
                </button>
                <div className="bg-gray-50 border border-gray-200 px-6 py-3 rounded-xl font-mono text-sm font-black text-indigo-600 select-all tracking-wider">
                  {classroom.qrCode}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ClassroomView;
