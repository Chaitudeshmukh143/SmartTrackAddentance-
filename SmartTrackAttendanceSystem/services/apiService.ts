
import { User, Role, AttendanceRecord, AttendanceQuery, Course } from '../types';
import { MOCK_TEACHER, MOCK_STUDENTS, MOCK_ATTENDANCE, MOCK_QUERIES, MOCK_COURSES } from '../constants';

// For production, this will use the environment variable provided by Vercel/Netlify
// For local development, it defaults to your localhost Java server
const API_BASE_URL = (import.meta as any).env?.VITE_API_URL || 'http://localhost:8080/api';

// SET THIS TO TRUE once your Java/Oracle backend is deployed!
const USE_REAL_BACKEND = false; 

class LocalDatabase {
  private static get(key: string) {
    const data = localStorage.getItem(key);
    return data ? JSON.parse(data) : null;
  }

  private static set(key: string, data: any) {
    localStorage.setItem(key, JSON.stringify(data));
  }

  static init() {
    if (!this.get('st_users')) {
      this.set('st_users', [...MOCK_STUDENTS, MOCK_TEACHER]);
    }
    if (!this.get('st_attendance')) this.set('st_attendance', MOCK_ATTENDANCE);
    if (!this.get('st_queries')) this.set('st_queries', MOCK_QUERIES);
    if (!this.get('st_courses')) this.set('st_courses', MOCK_COURSES);
  }

  static getUsers(): User[] { return this.get('st_users') || []; }
  static saveUser(user: User) {
    const current = this.getUsers();
    this.set('st_users', [...current, user]);
  }

  static getAttendance() { return this.get('st_attendance'); }
  static saveAttendance(record: AttendanceRecord) {
    const current = this.getAttendance();
    this.set('st_attendance', [record, ...current]);
  }
  
  static getQueries() { return this.get('st_queries'); }
  static saveQuery(query: AttendanceQuery) {
    const current = this.getQueries();
    this.set('st_queries', [query, ...current]);
  }

  static getCourses() { return this.get('st_courses'); }

  static updateQuery(queryId: string, status: string) {
    const current = this.getQueries() as AttendanceQuery[];
    this.set('st_queries', current.map(q => q.id === queryId ? { ...q, status } : q));
  }
}

LocalDatabase.init();

export class ApiService {
  private static async request<T>(path: string, options?: RequestInit): Promise<T> {
    if (!USE_REAL_BACKEND) {
      console.log(`[MOCK API] ${options?.method || 'GET'} ${path}`);
      await new Promise(r => setTimeout(r, 800)); 
      return this.handleMockRequest<T>(path, options);
    }

    const response = await fetch(`${API_BASE_URL}${path}`, {
      ...options,
      headers: { 
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        ...options?.headers 
      },
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || 'Server Connection Error');
    }
    return response.json();
  }

  private static handleMockRequest<T>(path: string, options?: RequestInit): any {
    if (path.includes('/auth/register') && options?.method === 'POST') {
      const body = JSON.parse(options.body as string);
      const newUser = { 
        ...body, 
        id: `u${Date.now()}`,
        avatar: `https://picsum.photos/seed/${body.name}/200`
      };
      LocalDatabase.saveUser(newUser);
      return newUser;
    }

    if (path.includes('/auth/login') && options?.method === 'POST') {
      const { identifier, role } = JSON.parse(options.body as string);
      const users = LocalDatabase.getUsers();
      const user = users.find(u => (u.email === identifier || u.studentId === identifier) && u.role === role);
      if (!user) throw new Error('User not found in local mock database');
      return user;
    }

    if (path.includes('/attendance') && options?.method === 'POST') {
      const body = JSON.parse(options.body as string);
      const newRecord = { ...body, id: `a${Date.now()}` };
      LocalDatabase.saveAttendance(newRecord);
      return newRecord;
    }
    
    if (path.includes('/queries') && options?.method === 'POST') {
      const body = JSON.parse(options.body as string);
      const newQuery = { ...body, id: `q${Date.now()}`, status: 'PENDING' };
      LocalDatabase.saveQuery(newQuery);
      return newQuery;
    }

    if (path.includes('/attendance')) return LocalDatabase.getAttendance();
    if (path.includes('/queries')) return LocalDatabase.getQueries();
    if (path.includes('/courses')) return LocalDatabase.getCourses();
    
    return [];
  }

  static async register(user: Partial<User>): Promise<User> {
    return this.request<User>('/auth/register', {
      method: 'POST',
      body: JSON.stringify(user)
    });
  }

  static async login(identifier: string, role: Role): Promise<User> {
    return this.request<User>(`/auth/login`, {
      method: 'POST',
      body: JSON.stringify({ identifier, role })
    });
  }

  static async getCourses(): Promise<Course[]> {
    return this.request<Course[]>('/courses');
  }

  static async getAttendance(userId?: string): Promise<AttendanceRecord[]> {
    const data = await this.request<AttendanceRecord[]>('/attendance');
    if (userId) return data.filter(a => a.studentId === userId);
    return data;
  }

  static async markAttendance(record: Omit<AttendanceRecord, 'id'>): Promise<AttendanceRecord> {
    return this.request<AttendanceRecord>('/attendance/mark', {
      method: 'POST',
      body: JSON.stringify(record)
    });
  }

  static async getQueries(userId?: string): Promise<AttendanceQuery[]> {
    const data = await this.request<AttendanceQuery[]>('/queries');
    if (userId) return data.filter(q => q.studentId === userId);
    return data;
  }

  static async submitQuery(query: Omit<AttendanceQuery, 'id' | 'status'>): Promise<AttendanceQuery> {
    return this.request<AttendanceQuery>('/queries/submit', {
      method: 'POST',
      body: JSON.stringify(query)
    });
  }
}
