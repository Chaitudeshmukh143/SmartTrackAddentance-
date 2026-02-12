
import React, { useState } from 'react';
import { Classroom, Student } from '../types';
import { User, Mail, Calendar, ExternalLink, MessageCircle, Activity, CheckCircle, XCircle } from 'lucide-react';

interface StudentsTabProps {
  classroom: Classroom;
  onUpdate: (updated: Classroom) => void;
  onStartChat: (studentId: string) => void;
}

const StudentsTab: React.FC<StudentsTabProps> = ({ classroom, onUpdate, onStartChat }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);

  const filteredStudents = classroom.students.filter(s => 
    s.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
   <div className="p-5 space-y-6 h-full overflow-y-auto">
     <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">

        {filteredStudents.map(student => (
          <div key={student.id} className="bg-white rounded-3xl border border-gray-100 p-6 hover:shadow-xl transition-all flex flex-col items-center text-center space-y-4"
>
            <img src={student.avatar} className="w-20 h-20 rounded-[2rem] border-4 border-white shadow-xl" alt="" />
            <div>
              <h4 className="text-xl font-black text-gray-900 tracking-tight">{student.name}</h4>
              <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">{student.id}</p>
            </div>
            <button onClick={() => onStartChat(student.id)} className="w-full flex items-center justify-center gap-2 py-4 rounded-2xl bg-indigo-600 text-white font-black text-xs uppercase shadow-lg shadow-indigo-100 active:scale-95">
              <MessageCircle size={16} /> Chat
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default StudentsTab;
