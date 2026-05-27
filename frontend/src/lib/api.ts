import axios from "axios";
import type {
  ApiResponse,
  User,
  Student,
  Subject,
  Result,
  Announcement,
  Registration,
  ReportCard,
  Fee,
  TeacherAnalytics,
  PrincipalAnalytics,
} from "@/types";

const apiClient = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080/api",
  headers: {
    "Content-Type": "application/json",
  },
});

apiClient.interceptors.request.use((config) => {
  if (typeof window !== "undefined") {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  }
  return config;
});

apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      if (typeof window !== "undefined") {
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        window.location.href = "/login";
      }
    }
    return Promise.reject(error);
  }
);

export const authApi = {
  login: (email: string, password: string) =>
    apiClient.post<ApiResponse<{ token: string; user: User }>>("/auth/login", {
      email,
      password,
    }),

  invite: (email: string, role: string, name: string) =>
    apiClient.post<ApiResponse<null>>("/auth/invite", { email, role, name }),

  completeRegistration: (token: string, name: string, password: string) =>
    apiClient.post<ApiResponse<{ token: string; user: User }>>(
      "/auth/register",
      { token, name, password }
    ),

  me: () => apiClient.get<ApiResponse<User>>("/auth/me"),
};

export const studentApi = {
  getAll: () => apiClient.get<ApiResponse<Student[]>>("/students"),

  create: (data: Omit<Student, "id" | "active">) =>
    apiClient.post<ApiResponse<Student>>("/students", data),

  update: (id: number, data: Partial<Student>) =>
    apiClient.put<ApiResponse<Student>>(`/students/${id}`, data),

  getByClass: (className: string) =>
    apiClient.get<ApiResponse<Student[]>>(`/students/class/${className}`),
};

export const subjectApi = {
  getAll: () => apiClient.get<ApiResponse<Subject[]>>("/subjects"),

  create: (data: Omit<Subject, "id">) =>
    apiClient.post<ApiResponse<Subject>>("/subjects", data),
};

export const resultApi = {
  enter: (data: {
    studentId: number;
    subjectId: number;
    term: string;
    academicYear: string;
    score: number;
    remarks?: string;
  }) => apiClient.post<ApiResponse<Result>>("/results", data),

  getByStudent: (id: number) =>
    apiClient.get<ApiResponse<Result[]>>(`/results/student/${id}`),

  getReportCard: (studentId: number, term: string, year: string) =>
    apiClient.get<ApiResponse<ReportCard>>(
      `/results/report-card/${studentId}?term=${term}&year=${year}`
    ),

  myEntries: () => apiClient.get<ApiResponse<Result[]>>("/results/my-entries"),
};

export const announcementApi = {
  getPublic: () =>
    apiClient.get<ApiResponse<Announcement[]>>("/public/announcements"),

  getAll: () => apiClient.get<ApiResponse<Announcement[]>>("/announcements"),

  create: (data: {
    title: string;
    content: string;
    type: string;
    published: boolean;
  }) => apiClient.post<ApiResponse<Announcement>>("/announcements", data),

  publish: (id: number) =>
    apiClient.patch<ApiResponse<Announcement>>(
      `/announcements/${id}/publish`,
      {}
    ),

  delete: (id: number) =>
    apiClient.delete<ApiResponse<null>>(`/announcements/${id}`),
};

export const registrationApi = {
  submit: (data: {
    parentName: string;
    parentEmail: string;
    parentPhone: string;
    childFirstName: string;
    childLastName: string;
    childDateOfBirth: string;
    desiredClass: string;
    message: string;
  }) => apiClient.post<ApiResponse<Registration>>("/registrations", data),

  getAll: () =>
    apiClient.get<ApiResponse<Registration[]>>("/registrations"),

  updateStatus: (
    id: number,
    status: "PENDING" | "REVIEWED" | "ACCEPTED" | "REJECTED"
  ) =>
    apiClient.patch<ApiResponse<Registration>>(
      `/registrations/${id}/status`,
      { status }
    ),
};

export const userApi = {
  getAll: () => apiClient.get<ApiResponse<User[]>>("/users"),

  toggleActive: (id: number) =>
    apiClient.patch<ApiResponse<User>>(`/users/${id}/toggle-active`, {}),

  delete: (id: number) =>
    apiClient.delete<ApiResponse<null>>(`/users/${id}`),
};

export const feeApi = {
  enter: (data: {
    studentId: number;
    amount: number;
    description?: string;
    feeDate?: string;
  }) => apiClient.post<ApiResponse<Fee>>("/fees", data),

  myFees: () => apiClient.get<ApiResponse<Fee[]>>("/fees/my-fees"),

  myAnalytics: (params?: { startDate?: string; endDate?: string }) =>
    apiClient.get<ApiResponse<TeacherAnalytics>>("/fees/my-analytics", {
      params,
    }),

  principalAnalytics: (params?: {
    startDate?: string;
    endDate?: string;
    teacherId?: number;
    studentId?: number;
  }) =>
    apiClient.get<ApiResponse<PrincipalAnalytics>>("/fees/analytics", {
      params,
    }),

  byStudent: (studentId: number) =>
    apiClient.get<ApiResponse<Fee[]>>(`/fees/student/${studentId}`),
};

export default apiClient;
