
import { Classroom, AttendanceRecord, Note, User, Student } from './types';
import { INITIAL_CLASSROOMS, TEACHER_USER, STUDENT_USER } from './mockData';

const API_BASE = '/api';
const STORAGE_KEY = 'eduattend_local_db';
const AUTH_KEY = 'eduattend_auth_user';

const getLocalData = (): Classroom[] => {
  const saved = localStorage.getItem(STORAGE_KEY);
  return saved ? JSON.parse(saved) : INITIAL_CLASSROOMS;
};

const saveLocalData = (data: Classroom[]) => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
};

export const api = {
  async checkHealth(): Promise<boolean> {
    try {
      const controller = new AbortController();
      const id = setTimeout(() => controller.abort(), 3000); 
      const res = await fetch(`${API_BASE}/classrooms/health`, { signal: controller.signal });
      clearTimeout(id);
      return res.ok;
    } catch {
      return false;
    }
  },

  async login(identifier: string, password: string): Promise<User> {
    return new Promise((resolve) => {
      setTimeout(() => {
        const isTeacher = identifier.includes('teacher') || (identifier.length === 10 && identifier.startsWith('9'));
        const user = isTeacher ? 
          { ...TEACHER_USER, email: identifier, avatar: `https://picsum.photos/seed/${identifier}/100` } : 
          { ...STUDENT_USER, email: identifier, id: 's1' }; 
        localStorage.setItem(AUTH_KEY, JSON.stringify(user));
        resolve(user);
      }, 500);
    });
  },

  async signup(name: string, identifier: string, role: 'teacher' | 'student'): Promise<User> {
    const user: User = {
      id: role === 'student' ? 's1' : `u-${Date.now()}`,
      name,
      role,
      avatar: `https://picsum.photos/seed/${name}/100`
    };
    localStorage.setItem(AUTH_KEY, JSON.stringify(user));
    return user;
  },

  getCurrentUser(): User | null {
    const saved = localStorage.getItem(AUTH_KEY);
    return saved ? JSON.parse(saved) : null;
  },

  async updateUserProfile(userData: Partial<User>): Promise<User> {
    const current = this.getCurrentUser();
    if (!current) throw new Error("No user logged in");
    const updatedUser = { ...current, ...userData };
    localStorage.setItem(AUTH_KEY, JSON.stringify(updatedUser));
    return updatedUser;
  },

  logout() {
    localStorage.removeItem(AUTH_KEY);
  },

  async getClassrooms(): Promise<Classroom[]> {
    try {
      const res = await fetch(`${API_BASE}/classrooms`);
      if (!res.ok) throw new Error('Backend Sync Error');
      const data = await res.json();
      saveLocalData(data); 
      return data;
    } catch (e) {
      return getLocalData();
    }
  },

  async createClassroom(name: string, subject: string): Promise<Classroom> {
    const payload = { 
      id: `cls-${Date.now()}`,
      name, 
      subject, 
      teacherId: this.getCurrentUser()?.id || 'teacher-1',
      qrCode: `EDU-${subject.toUpperCase().slice(0,3)}-${Math.floor(Math.random()*900)+100}`,
      students: [], 
      attendance: [], 
      notes: [], 
      messages: [],
      leaveRequests: [],
      attendanceQueries: []
    };
    try {
      const res = await fetch(`${API_BASE}/classrooms`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      if (!res.ok) throw new Error('Cloud Save Failed');
      return await res.json();
    } catch (e) {
      const classrooms = getLocalData();
      const updated = [...classrooms, payload];
      saveLocalData(updated);
      return payload;
    }
  },

  async enrollByCode(code: string, user: User): Promise<Classroom> {
    const classrooms = getLocalData();
    const classroom = classrooms.find(c => c.qrCode === code);
    
    if (!classroom) throw new Error("Invalid Classroom Code");
    
    const isAlreadyEnrolled = classroom.students.some(s => s.id === user.id);
    if (isAlreadyEnrolled) return classroom;

    const newStudent: Student = {
      id: user.id,
      name: user.name,
      email: user.email || `${user.id}@edu.com`,
      avatar: user.avatar || `https://picsum.photos/seed/${user.id}/100`,
      joinDate: new Date().toISOString().split('T')[0]
    };

    const updatedClassroom = {
      ...classroom,
      students: [...classroom.students, newStudent]
    };

    try {
      await fetch(`${API_BASE}/classrooms/${classroom.id}/students`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newStudent),
      });
    } catch (e) {
      console.warn("Offline enrollment sync");
    }

    const updatedList = classrooms.map(c => c.id === classroom.id ? updatedClassroom : c);
    saveLocalData(updatedList);
    return updatedClassroom;
  },

  async saveAttendance(classId: string, attendance: AttendanceRecord[]): Promise<Classroom> {
    try {
      const res = await fetch(`${API_BASE}/classrooms/${classId}/attendance`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(attendance),
      });
      return await res.json();
    } catch (e) {
      const classrooms = getLocalData();
      const updated = classrooms.map(c => c.id === classId ? { ...c, attendance } : c);
      saveLocalData(updated);
      return updated.find(c => c.id === classId)!;
    }
  },

  async addNote(classId: string, note: Note): Promise<Classroom> {
    try {
      const res = await fetch(`${API_BASE}/classrooms/${classId}/notes`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(note),
      });
      return await res.json();
    } catch (e) {
      const classrooms = getLocalData();
      const updated = classrooms.map(c => c.id === classId ? { ...c, notes: [note, ...c.notes] } : c);
      saveLocalData(updated);
      return updated.find(c => c.id === classId)!;
    }
  }
};
