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
  Transcript,
  Fee,
  TeacherAnalytics,
  PrincipalAnalytics,
  SchoolClass,
  Rankings,
  SmsRequestResponse,
  ImportResult,
} from "@/types";

export type ImportMode = "UPSERT" | "SKIP_DUPLICATES";

function importExcel(path: string, file: File, mode: ImportMode) {
  const formData = new FormData();
  formData.append("file", file);
  return apiClient.post<ApiResponse<ImportResult>>(`${path}/import`, formData, {
    params: { mode },
    headers: { "Content-Type": "multipart/form-data" },
  });
}

function downloadTemplate(path: string) {
  return apiClient.get(`${path}/import/template`, { responseType: "blob" });
}

const apiClient = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || "http://localhost:8081/api",
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
      const url: string = error.config?.url ?? "";
      const isAuthRoute = url.includes("/auth/login") || url.includes("/auth/forgot-password");
      if (!isAuthRoute && typeof window !== "undefined") {
        ["token","user","authToken","jwt","auth_token","user_token","access_token","userToken","auth","session"]
          .forEach((k) => localStorage.removeItem(k));
        window.location.href = "/login";
      }
    }
    return Promise.reject(error);
  }
);

export const authApi = {
  login: (phone: string, password: string) =>
    apiClient.post<ApiResponse<{ token: string; name: string; phone: string; role: string }>>("/auth/login", {
      phone,
      password,
    }),

  invite: (phone: string, role: string, name: string) =>
    apiClient.post<ApiResponse<null>>("/auth/invite", { phone, role, name }),

  completeRegistration: (token: string, name: string, password: string) =>
    apiClient.post<ApiResponse<{ token: string; user: User }>>(
      "/auth/register",
      { token, name, password }
    ),

  me: () => apiClient.get<ApiResponse<User>>("/auth/me"),

  logout: () => apiClient.post<ApiResponse<null>>("/auth/logout"),
};

export const studentApi = {
  getAll: () => apiClient.get<ApiResponse<Student[]>>("/students"),

  create: (data: Omit<Student, "id" | "active">) =>
    apiClient.post<ApiResponse<Student>>("/students", data),

  update: (id: number, data: Partial<Student>) =>
    apiClient.put<ApiResponse<Student>>(`/students/${id}`, data),

  deactivate: (id: number) =>
    apiClient.delete<ApiResponse<null>>(`/students/${id}`),

  getByClass: (className: string) =>
    apiClient.get<ApiResponse<Student[]>>(`/students/class/${className}`),

  importExcel: (file: File, mode: ImportMode) => importExcel("/students", file, mode),
  downloadTemplate: () => downloadTemplate("/students"),
};

export const subjectApi = {
  getAll: () => apiClient.get<ApiResponse<Subject[]>>("/subjects"),
  getByClassLevel: (classLevel: string) =>
    apiClient.get<ApiResponse<Subject[]>>(`/subjects/class/${encodeURIComponent(classLevel)}`),
  create: (data: Omit<Subject, "id">) =>
    apiClient.post<ApiResponse<Subject>>("/subjects", data),
  update: (id: number, data: Omit<Subject, "id">) =>
    apiClient.put<ApiResponse<Subject>>(`/subjects/${id}`, data),
  delete: (id: number) =>
    apiClient.delete<ApiResponse<null>>(`/subjects/${id}`),

  importExcel: (file: File, mode: ImportMode) => importExcel("/subjects", file, mode),
  downloadTemplate: () => downloadTemplate("/subjects"),
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
    apiClient.get<ApiResponse<ReportCard>>("/results/report-card", {
      params: { studentId, term, academicYear: year },
    }),

  myEntries: () => apiClient.get<ApiResponse<Result[]>>("/results/my-entries"),

  rankings: (className: string, term: string, academicYear: string) =>
    apiClient.get<ApiResponse<Rankings>>("/results/rankings", {
      params: { className, term, academicYear },
    }),

  getTranscript: (studentId: number) =>
    apiClient.get<ApiResponse<Transcript>>("/results/transcript", {
      params: { studentId },
    }),

  importExcel: (file: File, mode: ImportMode) => importExcel("/results", file, mode),
  downloadTemplate: () => downloadTemplate("/results"),
};

export const announcementApi = {
  getPublic: () =>
    apiClient.get<ApiResponse<Announcement[]>>("/public/announcements"),

  getAll: () => apiClient.get<ApiResponse<Announcement[]>>("/admin/announcements"),

  create: (data: {
    title: string;
    content: string;
    type: string;
    published: boolean;
  }) => apiClient.post<ApiResponse<Announcement>>("/admin/announcements", data),

  publish: (id: number) =>
    apiClient.patch<ApiResponse<Announcement>>(`/admin/announcements/${id}/publish`, {}),

  delete: (id: number) =>
    apiClient.delete<ApiResponse<null>>(`/admin/announcements/${id}`),

  uploadMedia: (id: number, file: File) => {
    const formData = new FormData();
    formData.append("file", file);
    return apiClient.post<ApiResponse<{ id: number }>>(`/admin/announcements/${id}/media`, formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
  },
};

export const smsApi = {
  send: (data: {
    message: string;
    recipientType: "ALL" | "PARENTS" | "TEACHERS" | "CUSTOM";
    customPhones?: string[];
  }) => apiClient.post<ApiResponse<{ sent: number; failed: number; details: string }>>("/admin/sms/send", data),

  getRecipientCounts: () =>
    apiClient.get<ApiResponse<{ parents: number; teachers: number; all: number }>>("/admin/sms/count"),

  getContacts: () =>
    apiClient.get<ApiResponse<{ id: number; name: string; phone: string; type: "PARENT" | "TEACHER" }[]>>("/admin/sms/contacts"),

  getPendingRequests: () =>
    apiClient.get<ApiResponse<SmsRequestResponse[]>>("/admin/sms/requests"),

  approveRequest: (id: number) =>
    apiClient.post<ApiResponse<{ sent: number; failed: number; details: string }>>(`/admin/sms/requests/${id}/approve`, {}),

  rejectRequest: (id: number) =>
    apiClient.post<ApiResponse<null>>(`/admin/sms/requests/${id}/reject`, {}),
};

export const teacherSmsApi = {
  getContacts: () =>
    apiClient.get<ApiResponse<{ id: number; name: string; phone: string; type: "PARENT" | "TEACHER" }[]>>("/teacher/sms/contacts"),

  createRequest: (data: {
    message: string;
    recipientType: "ALL" | "PARENTS" | "TEACHERS" | "CUSTOM";
    customPhones?: string[];
  }) => apiClient.post<ApiResponse<SmsRequestResponse>>("/teacher/sms/request", data),

  getMyRequests: () =>
    apiClient.get<ApiResponse<SmsRequestResponse[]>>("/teacher/sms/my-requests"),
};

export const registrationApi = {
  submit: (data: {
    parentName: string;
    parentPhone: string;
    childFirstName: string;
    childLastName: string;
    childDateOfBirth: string;
    desiredClass: string;
    message: string;
  }) => apiClient.post<ApiResponse<Registration>>("/public/registrations", data),

  getAll: () =>
    apiClient.get<ApiResponse<Registration[]>>("/admin/registrations"),

  updateStatus: (
    id: number,
    status: "PENDING" | "REVIEWED" | "ACCEPTED" | "REJECTED"
  ) =>
    apiClient.patch<ApiResponse<Registration>>(`/admin/registrations/${id}/status`, { status }),
};

export const userApi = {
  getAll: () => apiClient.get<ApiResponse<User[]>>("/admin/users"),

  createTeacher: (data: { name: string; phone: string; password: string }) =>
    apiClient.post<ApiResponse<User>>("/admin/users", data),

  toggleActive: (id: number) =>
    apiClient.patch<ApiResponse<User>>(`/admin/users/${id}/toggle`, {}),

  delete: (id: number) =>
    apiClient.delete<ApiResponse<null>>(`/admin/users/${id}`),

  importExcel: (file: File, mode: ImportMode) => importExcel("/admin/users", file, mode),
  downloadTemplate: () => downloadTemplate("/admin/users"),
};

export const classApi = {
  getAll: () => apiClient.get<ApiResponse<SchoolClass[]>>("/admin/classes"),

  create: (data: { name: string; description?: string }) =>
    apiClient.post<ApiResponse<SchoolClass>>("/admin/classes", data),

  delete: (id: number) =>
    apiClient.delete<ApiResponse<null>>(`/admin/classes/${id}`),

  assignTeachers: (id: number, teacherIds: number[]) =>
    apiClient.put<ApiResponse<SchoolClass>>(`/admin/classes/${id}/teachers`, { teacherIds }),

  assignStudents: (id: number, studentIds: number[]) =>
    apiClient.put<ApiResponse<SchoolClass>>(`/admin/classes/${id}/students`, { studentIds }),

  myClasses: () => apiClient.get<ApiResponse<SchoolClass[]>>("/admin/classes/my-classes"),

  importExcel: (file: File, mode: ImportMode) => importExcel("/admin/classes", file, mode),
  downloadTemplate: () => downloadTemplate("/admin/classes"),
};

export const feeApi = {
  enter: (data: {
    studentId: number;
    amount: number;
    description?: string;
    feeDate?: string;
    collectedById?: number;
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
    className?: string;
  }) =>
    apiClient.get<ApiResponse<PrincipalAnalytics>>("/fees/analytics", {
      params,
    }),

  byStudent: (studentId: number) =>
    apiClient.get<ApiResponse<Fee[]>>(`/fees/student/${studentId}`),

  getAllEntries: (params?: {
    startDate?: string;
    endDate?: string;
    teacherId?: number;
    studentId?: number;
    className?: string;
  }) => apiClient.get<ApiResponse<Fee[]>>("/fees/all", { params }),

  importExcel: (file: File, mode: ImportMode) => importExcel("/fees", file, mode),
  downloadTemplate: () => downloadTemplate("/fees"),
};

export const settingsApi = {
  getAll: () =>
    apiClient.get<ApiResponse<Record<string, string>>>("/admin/settings"),

  saveAll: (data: Record<string, string>) =>
    apiClient.put<ApiResponse<Record<string, string>>>("/admin/settings", data),
};

export default apiClient;
