
export interface Student {
  id: string;
  name: string;
  email: string;
  avatar: string;
  joinDate: string;
  bio?: string;
}

export interface AttendanceRecord {
  studentId: string;
  date: string;
  status: 'present' | 'absent';
}

export interface Note {
  id: string;
  title: string;
  content: string;
  summary?: string;
  uploadDate: string;
  author: string;
}

export interface LeaveRequest {
  id: string;
  studentId: string;
  studentName: string;
  startDate: string;
  endDate: string;
  reason: string;
  status: 'pending' | 'approved' | 'rejected';
  requestDate: string;
}

export interface AttendanceQuery {
  id: string;
  studentId: string;
  studentName: string;
  date: string;
  description: string;
  status: 'pending' | 'resolved';
}

export interface Message {
  id: string;
  senderId: string;
  senderName: string;
  recipientId?: string;
  text: string;
  timestamp: string;
  role: 'teacher' | 'student';
  status?: 'sent' | 'delivered' | 'read';
}

export interface Classroom {
  id: string;
  name: string;
  subject: string;
  teacherId: string;
  qrCode: string;
  students: Student[];
  attendance: AttendanceRecord[];
  notes: Note[];
  messages: Message[];
  leaveRequests: LeaveRequest[];
  attendanceQueries: AttendanceQuery[];
}

export type ViewType = 'dashboard' | 'classroom' | 'student-view' | 'requests' | 'settings';

export interface UserNotifications {
  attendance: boolean;
  notes: boolean;
  messages: boolean;
  requests: boolean;
}

export interface User {
  id: string;
  name: string;
  role: 'teacher' | 'student';
  email?: string;
  avatar?: string;
  bio?: string;
  notifications?: UserNotifications;
}
