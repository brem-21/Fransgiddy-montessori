export interface User {
  id: number;
  name: string;
  email: string;
  role: "SUPER_ADMIN" | "TEACHER";
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
  parentEmail: string;
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
}

export interface Registration {
  id: number;
  parentName: string;
  parentEmail: string;
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
}
