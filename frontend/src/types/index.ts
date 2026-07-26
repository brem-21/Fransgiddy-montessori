export interface User {
  id: number;
  name: string;
  phone: string;
  role: "PRINCIPAL" | "TEACHER";
  active: boolean;
  createdAt: string;
}

export interface Student {
  id: number;
  firstName: string;
  lastName: string;
  className: string;
  dateOfBirth: string;
  parentName: string;
  parentPhone: string;
  enrollmentDate: string;
  active: boolean;
}

export interface Subject {
  id: number;
  name: string;
  classLevel: string;
}

export interface Result {
  id: number;
  studentName: string;
  subjectName: string;
  term: "FIRST" | "SECOND" | "THIRD";
  academicYear: string;
  score: number;
  grade: string;
  remarks: string;
  teacherName: string;
}

export interface Announcement {
  id: number;
  title: string;
  content: string;
  type: "NEWS" | "EVENT" | "ANNOUNCEMENT";
  published: boolean;
  authorName: string;
  createdAt: string;
  mediaUrls?: string[];
}

export interface Registration {
  id: number;
  parentName: string;
  parentPhone: string;
  childFirstName: string;
  childLastName: string;
  childDateOfBirth: string;
  desiredClass: string;
  message: string;
  status: "PENDING" | "REVIEWED" | "ACCEPTED" | "REJECTED";
  createdAt: string;
}

export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
}

export interface ReportCardEntry {
  subjectName: string;
  score: number;
  grade: string;
  remarks: string;
}

export interface ReportCard {
  studentName: string;
  className: string;
  term: string;
  academicYear: string;
  results: ReportCardEntry[];
  totalScore: number;
  average: number;
  overallGrade: string;
  position?: number;
  totalStudents?: number;
}

export interface Fee {
  id: number;
  studentName: string;
  studentClass: string;
  collectedByName: string;
  amount: number;
  description?: string;
  feeDate: string;
  createdAt: string;
}

export interface StudentFeeSummary {
  studentId: number;
  studentName: string;
  className: string;
  totalAmount: number;
  count: number;
}

export interface TeacherFeeSummary {
  teacherId: number;
  teacherName: string;
  totalAmount: number;
  count: number;
}

export interface DailyFeeEntry {
  date: string;
  totalAmount: number;
  count: number;
}

export interface TeacherAnalytics {
  totalAmount: number;
  feeCount: number;
  todayAmount: number;
  todayCount: number;
  topStudents: StudentFeeSummary[];
  dailyTrend: DailyFeeEntry[];
  recentEntries: Fee[];
}

export interface PrincipalAnalytics {
  totalAmount: number;
  feeCount: number;
  todayAmount: number;
  todayCount: number;
  byTeacher: TeacherFeeSummary[];
  topStudents: StudentFeeSummary[];
  dailyTrend: DailyFeeEntry[];
  recentEntries: Fee[];
}

export interface SchoolClass {
  id: number;
  name: string;
  description?: string;
  teacherIds: number[];
  teacherNames: string[];
  studentCount: number;
}

export interface StudentRanking {
  rank: number;
  studentId: number;
  studentName: string;
  scores: Record<string, number>;
  total: number;
  average: number;
  overallGrade: string;
}

export interface Rankings {
  subjects: string[];
  rankings: StudentRanking[];
}

export interface TranscriptSubject {
  subjectName: string;
  score: number;
  grade: string;
  remarks: string;
}

export interface TranscriptTerm {
  academicYear: string;
  term: string;
  subjects: TranscriptSubject[];
  totalScore: number;
  average: number;
  overallGrade: string;
  position: number;
  totalStudents: number;
}

export interface Transcript {
  studentId: number;
  studentName: string;
  className: string;
  parentName: string;
  parentPhone: string;
  enrollmentDate: string;
  terms: TranscriptTerm[];
}

export interface SmsContact {
  id: number;
  name: string;
  phone: string;
  type: "PARENT" | "TEACHER";
}

export interface SmsRequestResponse {
  id: number;
  message: string;
  recipientType: "ALL" | "PARENTS" | "TEACHERS" | "CUSTOM";
  customPhones: string[];
  status: "PENDING" | "APPROVED" | "REJECTED";
  requestedByName: string;
  reviewedByName: string | null;
  createdAt: string;
  reviewedAt: string | null;
}

export interface ImportRowError {
  row: number;
  message: string;
}

export interface ImportResult {
  created: number;
  updated: number;
  skipped: number;
  errors: ImportRowError[];
}
