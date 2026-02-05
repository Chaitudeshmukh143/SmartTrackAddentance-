
export enum Role {
  TEACHER = 'TEACHER',
  STUDENT = 'STUDENT'
}

export interface Course {
  id: string;
  name: string;
  code: string;
  schedule: string;
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: Role;
  studentId?: string;
  avatar?: string;
}

export interface AttendanceRecord {
  id: string;
  studentId: string;
  studentName: string;
  courseId: string;
  courseName: string;
  date: string;
  status: 'PRESENT' | 'ABSENT' | 'LATE' | 'PENDING'; // Added PENDING
}

export interface AttendanceQuery {
  id: string;
  studentId: string;
  studentName: string;
  date: string;
  reason: string;
  status: 'PENDING' | 'RESOLVED' | 'REJECTED';
  aiAnalysis?: string;
}

export interface DashboardStats {
  totalStudents: number;
  todayAttendance: number;
  attendanceRate: number;
  pendingQueries: number;
}
