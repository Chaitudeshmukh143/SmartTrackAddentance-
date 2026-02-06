
import React, { useState } from 'react';
import { Classroom } from '../types';
import { QrCode, FileText, CheckCircle, Users, MessageSquare, Inbox, ArrowLeft } from 'lucide-react';
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

  const pendingRequestsCount = (classroom.leaveRequests?.filter(r => r.status === 'pending').length || 0);

  const tabs = [
    { id: 'attendance', label: 'Roll', icon: CheckCircle },
    { id: 'notes', label: 'Notes', icon: FileText },
    { id: 'students', label: 'Crew', icon: Users },
    { id: 'requests', label: 'Alerts', icon: Inbox, count: pendingRequestsCount },
    { id: 'chat', label: 'Chat', icon: MessageSquare },
    { id: 'qr', label: 'Invite', icon: QrCode },
  ];

  const handleStartPrivateChat = (studentId: string) => {
    setSelectedChatStudentId(studentId);
    setActiveTab('chat');
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6 lg:space-y-8 animate-in fade-in">
      <div className="flex items-center justify-between px-2">
        <button onClick={() => window.dispatchEvent(new CustomEvent('navigate', { detail: 'dashboard' }))} className="flex items-center gap-2 text-indigo-600 font-black text-[10px] uppercase tracking-widest bg-white px-4 py-2.5 rounded-xl shadow-sm border border-gray-100">
          <ArrowLeft size={14} /> Back
        </button>
        <div className="bg-indigo-50 text-indigo-600 text-[10px] uppercase px-3 py-1 rounded-full font-black tracking-widest">{classroom.subject}</div>
      </div>

      <header className="px-2">
        <h1 className="text-3xl lg:text-5xl font-black text-gray-900 leading-tight tracking-tighter">{classroom.name}</h1>
      </header>

      {/* Tabs - Horizontally scrollable on mobile */}
      <div className="overflow-x-auto no-scrollbar -mx-4 px-4 lg:mx-0 lg:px-0">
        <div className="flex items-center gap-2 p-1.5 bg-gray-100 rounded-2xl w-max min-w-full lg:min-w-0">
          {tabs.map(tab => (
            <button key={tab.id} onClick={() => { setActiveTab(tab.id as TabType); if (tab.id !== 'chat') setSelectedChatStudentId(null); }} className={`flex items-center gap-2 px-5 py-3 rounded-xl font-bold transition-all relative whitespace-nowrap ${activeTab === tab.id ? 'bg-white text-indigo-600 shadow-sm' : 'text-gray-500 hover:text-gray-800'}`}>
              <tab.icon size={18} /> 
              <span className="text-xs lg:text-sm">{tab.label}</span>
              {tab.count !== undefined && tab.count > 0 && <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-[9px] flex items-center justify-center rounded-full border-2 border-white">{tab.count}</span>}
            </button>
          ))}
        </div>
      </div>

      <div className="bg-white rounded-[2.5rem] lg:rounded-[3rem] border border-gray-100 shadow-xl overflow-hidden min-h-[500px]">
        {activeTab === 'attendance' && <AttendanceTab classroom={classroom} onUpdate={onUpdate} />}
        {activeTab === 'notes' && <NotesTab classroom={classroom} onUpdate={onUpdate} />}
        {activeTab === 'students' && <StudentsTab classroom={classroom} onUpdate={onUpdate} onStartChat={handleStartPrivateChat} />}
        {activeTab === 'chat' && <ChatTab classroom={classroom} onUpdate={onUpdate} initialRecipientId={selectedChatStudentId} />}
        {activeTab === 'requests' && <RequestsTab classroom={classroom} onUpdate={onUpdate} />}
        {activeTab === 'qr' && (
          <div className="p-8 lg:p-12 flex flex-col items-center justify-center h-full text-center space-y-8 animate-in zoom-in-95">
            <QRCodeSVG value={classroom.qrCode} size={220} className="mx-auto" />
            <h2 className="text-2xl lg:text-3xl font-black text-gray-900">Invite Space</h2>
            <div className="bg-gray-50 border border-gray-200 px-6 py-4 rounded-2xl font-mono text-sm font-black text-indigo-600 tracking-[0.2em] select-all">{classroom.qrCode}</div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ClassroomView;
