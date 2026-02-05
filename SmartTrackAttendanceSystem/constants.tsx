
import { Role, User, AttendanceRecord, AttendanceQuery, Course } from './types';

export const MOCK_COURSES: Course[] = [
  { id: 'c1', name: 'Advanced Mathematics', code: 'MATH402', schedule: 'Mon, Wed 09:00 AM' },
  { id: 'c2', name: 'Computer Architecture', code: 'CS301', schedule: 'Tue, Thu 11:30 AM' },
  { id: 'c3', name: 'Data Structures', code: 'CS202', schedule: 'Fri 02:00 PM' },
];

export const MOCK_TEACHER: User = {
  id: 't1',
  name: 'Dr. Sarah Wilson',
  email: 'sarah.wilson@university.edu',
  role: Role.TEACHER,
  avatar: 'https://picsum.photos/seed/teacher/200'
};

export const MOCK_STUDENTS: User[] = [
  { id: 's1', name: 'Alex Johnson', email: 'alex.j@student.edu', role: Role.STUDENT, studentId: 'STU001', avatar: 'https://picsum.photos/seed/s1/200' },
  { id: 's2', name: 'Maria Garcia', email: 'maria.g@student.edu', role: Role.STUDENT, studentId: 'STU002', avatar: 'https://picsum.photos/seed/s2/200' },
  { id: 's3', name: 'Jordan Lee', email: 'jordan.l@student.edu', role: Role.STUDENT, studentId: 'STU003', avatar: 'https://picsum.photos/seed/s3/200' },
  { id: 's4', name: 'Taylor Swift', email: 'taylor.s@student.edu', role: Role.STUDENT, studentId: 'STU004', avatar: 'https://picsum.photos/seed/s4/200' },
];

export const MOCK_ATTENDANCE: AttendanceRecord[] = [
  { id: 'a1', studentId: 's1', studentName: 'Alex Johnson', courseId: 'c1', courseName: 'Advanced Mathematics', date: '2023-10-24', status: 'PRESENT' },
  { id: 'a2', studentId: 's2', studentName: 'Maria Garcia', courseId: 'c1', courseName: 'Advanced Mathematics', date: '2023-10-24', status: 'PRESENT' },
  { id: 'a3', studentId: 's3', studentName: 'Jordan Lee', courseId: 'c1', courseName: 'Advanced Mathematics', date: '2023-10-24', status: 'ABSENT' },
  { id: 'a4', studentId: 's1', studentName: 'Alex Johnson', courseId: 'c2', courseName: 'Computer Architecture', date: '2023-10-23', status: 'PRESENT' },
  { id: 'a5', studentId: 's2', studentName: 'Maria Garcia', courseId: 'c2', courseName: 'Computer Architecture', date: '2023-10-23', status: 'ABSENT' },
  { id: 'a6', studentId: 's3', studentName: 'Jordan Lee', courseId: 'c3', courseName: 'Data Structures', date: '2023-10-23', status: 'PRESENT' },
];

export const MOCK_QUERIES: AttendanceQuery[] = [
  { 
    id: 'q1', 
    studentId: 's3', 
    studentName: 'Jordan Lee', 
    date: '2023-10-24', 
    reason: 'I was present but my scan didn\'t register. I was sitting in the front row.', 
    status: 'PENDING' 
  }
];
