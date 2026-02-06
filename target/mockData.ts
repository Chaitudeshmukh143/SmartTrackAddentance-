
import { Classroom, User } from './types';

export const TEACHER_USER: User = {
  id: 'teacher-1',
  name: 'Prof. Anderson',
  role: 'teacher',
  notifications: {
    attendance: true,
    notes: true,
    messages: true,
    requests: true
  }
};

export const STUDENT_USER: User = {
  id: 's1',
  name: 'Alice Johnson',
  role: 'student',
  notifications: {
    attendance: true,
    notes: true,
    messages: true,
    requests: false
  }
};

// Start with Teacher
export let CURRENT_USER: User = TEACHER_USER;

export const INITIAL_CLASSROOMS: Classroom[] = [
  {
    id: 'cls-101',
    name: 'Advanced Mathematics',
    subject: 'Math',
    teacherId: 'teacher-1',
    qrCode: 'EDU-MATH-101',
    students: [
      { id: 's1', name: 'Alice Johnson', email: 'alice@example.com', avatar: 'https://picsum.photos/seed/alice/100', joinDate: '2023-09-01' },
      { id: 's2', name: 'Bob Smith', email: 'bob@example.com', avatar: 'https://picsum.photos/seed/bob/100', joinDate: '2023-09-01' },
      { id: 's3', name: 'Charlie Brown', email: 'charlie@example.com', avatar: 'https://picsum.photos/seed/charlie/100', joinDate: '2023-09-02' }
    ],
    attendance: [
      { studentId: 's1', date: '2023-10-24', status: 'present' },
      { studentId: 's2', date: '2023-10-24', status: 'present' },
      { studentId: 's3', date: '2023-10-24', status: 'absent' },
      { studentId: 's1', date: '2023-10-25', status: 'present' },
      { studentId: 's2', date: '2023-10-25', status: 'absent' },
      { studentId: 's3', date: '2023-10-25', status: 'present' }
    ],
    notes: [
      { id: 'n1', title: 'Calculus Basics', content: 'Introduction to derivatives and integrals.', uploadDate: '2023-10-20', author: 'Prof. Anderson' }
    ],
    messages: [
      { id: 'm1', senderId: 's1', senderName: 'Alice', text: 'Professor, will the homework be graded?', timestamp: '10:30 AM', role: 'student' }
    ],
    leaveRequests: [],
    attendanceQueries: []
  },
  {
    id: 'cls-102',
    name: 'Quantum Physics',
    subject: 'Science',
    teacherId: 'teacher-1',
    qrCode: 'EDU-PHYS-102',
    students: [
      { id: 's1', name: 'Alice Johnson', email: 'alice@example.com', avatar: 'https://picsum.photos/seed/alice/100', joinDate: '2023-09-01' }
    ],
    attendance: [],
    notes: [],
    messages: [],
    leaveRequests: [],
    attendanceQueries: []
  }
];
