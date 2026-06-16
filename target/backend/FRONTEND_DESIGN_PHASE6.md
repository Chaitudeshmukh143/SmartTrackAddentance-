# Phase 6 – React Frontend Design

## Technology Stack

- **React 19** with **Vite** for fast builds
- **TypeScript** for type safety
- **Tailwind CSS** for styling
- **ShadCN UI** for accessible, customizable components
- **React Router DOM** for client-side routing
- **React Hook Form** with **Zod** for form validation
- **Axios** for HTTP requests
- **Zustand** for state management
- **TanStack Query (React Query)** for server state and caching
- **Socket.IO Client** for real-time WebSocket communication
- **QR Scanner Library** (e.g., `html5-qrcode`) for QR code scanning
- **Framer Motion** for animations
- **Recharts** for data visualization

## Folder Structure

```
src/
├── api/                 # Axios instance and interceptors
├── assets/              # Static assets (images, icons, etc.)
├── components/          # Reusable UI components
│   ├── ui/              # ShadCN UI components (button, input, etc.)
│   ├── layout/          # Layout components (header, footer, sidebar)
│   ├── forms/           # Form components
│   ├── charts/          # Chart components
│   └── ...              # Other reusable components
├── contexts/            # React Context providers (if not using Zustand)
├── features/            # Feature-based modules (each feature has its own slice)
│   ├── auth/            # Authentication feature
│   ├── attendance/      # Attendance feature
│   ├── classroom/       # Classroom feature
│   ├── leave/           # Leave management feature
│   ├── notification/    # Notification feature
│   ├── chat/            # Chat feature
│   ├── security/        # Security dashboard feature
│   ├── analytics/       # Analytics feature
│   └── profile/         # User profile feature
├── hooks/               # Custom React hooks
├── layouts/             # Page layouts (PublicLayout, StudentLayout, etc.)
├── pages/               # Page components (views)
├── routes/              # Route definitions and protected route wrappers
├── services/            # Service classes that encapsulate API calls (optional, can be in api/)
├── store/               # Zustand stores
├── types/               # TypeScript types and interfaces
├── utils/               # Utility functions (date formatting, helpers, etc.)
└── App.tsx              # Main app component
```

## Routing Map

### Public Routes (accessible without authentication)
- `/` - Landing page (redirects to login if not authenticated, or to dashboard based on role)
- `/login` - Login page
- `/register` - Register page
- `/forgot-password` - Forgot password page
- `/reset-password/:token` - Reset password page
- `/verify-email/:token` - Email verification page

### Protected Routes (require authentication)
#### Student Layout
- `/student/dashboard` - Student dashboard
- `/student/attendance` - Attendance history and calendar
- `/student/leave` - Leave requests and apply leave
- `/student/profile` - Profile management
- `/student/notifications` - Notification center
- `/student/chat` - Chat interface (with sub-routes for specific conversations)
  - `/student/chat/:conversationId` - Specific chat conversation

#### Teacher Layout
- `/teacher/dashboard` - Teacher dashboard
- `/teacher/classroom` - Classroom management (create, view, update)
  - `/teacher/classroom/:classroomId` - View/manage specific classroom
- `/teacher/attendance` - Attendance management (mark attendance, view reports)
  - `/teacher/attendance/session/:sessionId` - Active attendance session details
- `/teacher/leave` - Leave requests (approve/reject)
  - `/teacher/leave/:leaveRequestId` - View/manage specific leave request
- `/teacher/profile` - Profile management
- `/teacher/notifications` - Notification center
- `/teacher/chat` - Chat interface
  - `/teacher/chat/:conversationId` - Specific chat conversation
- `/teacher/security` - Security dashboard (for admin/teacher roles with permissions)
- `/teacher/analytics` - Analytics dashboard

#### Admin Layout (if admin role exists)
- `/admin/dashboard` - Admin dashboard
- `/admin/users` - User management
  - `/admin/users/:userId` - View/manage specific user
- `/admin/security` - Security dashboard (global)
  - `/admin/security/events` - Security events list
  - `/admin/security/events/:eventId` - Specific security event
- `/admin/analytics` - Global analytics
- `/admin/settings` - System settings

### Special Routes
- `/qr-scan` - QR scanner page (used by student to scan attendance QR)
- `/attendance-session/:sessionId` - Teacher view for active attendance session (alternative to nested route)
- `/chat/:conversationId` - Specific chat conversation (if not nested under role)

## State Management Design (with Zustand)

We will use Zustand for managing client-side state that is not server state (like UI state, auth state, etc.).
For server state (data fetched from APIs), we will use TanStack Query.

### Stores (in `src/store/`)

1. **authStore.ts**
   - `user`: User object (null if not authenticated)
   - `token`: JWT token
   - `refreshToken`: Refresh token
   - `isAuthenticated`: boolean
   - `login(user, token, refreshToken)`: action
   - `logout()`: action
   - `updateUser(user)`: action

2. **themeStore.ts**
   - `theme`: 'light' | 'dark' | 'system'
   - `setTheme(theme)`: action
   - `toggleTheme()`: action

3. **notificationStore.ts**
   - `unreadCount`: number
   - `setUnreadCount(count)`: action
   - `incrementUnreadCount()`: action
   - `decrementUnreadCount()`: action

4. **uiStore.ts** (for temporary UI state like modals, drawers, etc.)
   - `isSidebarOpen`: boolean
   - `setSidebarOpen(open)`: action
   - `isNotificationDrawerOpen`: boolean
   - `setNotificationDrawerOpen(open)`: action

## API Integration Design (with Axios)

We will create an Axios instance with interceptors for:
- Automatically attaching the JWT token to requests
- Handling 401 responses (token refresh or redirect to login)
- Logging errors (optional)

### `src/api/axiosInstance.ts`
```typescript
import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080/api',
});

// Request interceptor to add token
api.interceptors.request.use((config) => {
  const token = getAuthToken(); // from authStore or localStorage
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Response interceptor for handling 401 and refreshing token
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    if (error.response.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      try {
        const refreshToken = getRefreshToken();
        const { data } = await axios.post('/api/v1/auth/refresh', { refreshToken });
        const { token, refreshToken: newRefreshToken } = data;
        updateAuthToken(token, newRefreshToken);
        originalRequest.headers.Authorization = `Bearer ${token}`;
        return api(originalRequest);
      } catch (refreshError) {
        // If refresh fails, logout
        logout();
        return Promise.reject(refreshError);
      }
    }
    return Promise.reject(error);
  }
);

export default api;
```

### Service Files (optional, but we can create service classes for each feature)
Alternatively, we can use TanStack Query directly in components or custom hooks.

Example: `src/services/authService.ts`
```typescript
import api from '../api/axiosInstance';

export const authService = {
  login: (credentials: LoginRequest) => api.post('/auth/login', credentials),
  register: (userData: RegisterRequest) => api.post('/auth/register', userData),
  // ... other methods
};
```

But note: We already have a backend with specific endpoints. We will map the frontend to the existing backend API.

## Remaining Phase 7 Work

After completing the frontend (Phase 6), Phase 7 would focus on:

1. **Testing**
   - Unit tests for components (using Vitest or Jest)
   - Integration tests (using React Testing Library and Cypress)
   - End-to-end tests for critical user flows
   - Test coverage goals (e.g., 80%+)

2. **Performance Optimization**
   - Code splitting and lazy loading (using React.lazy and Suspense)
   - Optimizing bundle size (analyzing with webpack-bundle-analyzer)
   - Implementing caching strategies (with React Query)
   - Minimizing re-renders (using useMemo, useCallback)

3. **Accessibility (a11y)**
   - Ensuring WCAG 2.1 AA compliance
   - Keyboard navigation support
   - Screen reader testing
   - Color contrast checks

4. **SEO and Social Sharing**
   - Implementing meta tags for public pages
   - Open Graph tags for social media
   - Generating sitemap (if applicable)

5. **Internationalization (i18n)**
   - Setting up i18next or similar for multi-language support
   - Creating translation files

6. **Deployment and DevOps**
   - Setting up CI/CD pipelines (GitHub Actions, etc.)
   - Containerization with Docker
   - Environment-specific configurations
   - Monitoring and error tracking (Sentry, LogRocket)

7. **Advanced Features**
   - Offline support (using service workers and IndexedDB for PWA)
   - Push notifications (using Push API)
   - Analytics integration (Google Analytics, Mixpanel)
   - Customizable themes (beyond dark/light)

8. **Documentation**
   - Code documentation (using JSDoc or TypeScript comments)
   - User guides and admin manuals
   - API documentation (if not already covered by Swagger on backend)

This design provides a scalable and maintainable foundation for the React frontend that integrates with the existing SAMS backend architecture.