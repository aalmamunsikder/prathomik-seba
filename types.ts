
export enum Role {
  SUPER_ADMIN = 'SUPER_ADMIN',
  SCHOOL_ADMIN = 'SCHOOL_ADMIN', // Headmaster
  TEACHER = 'TEACHER',
  VIEWER = 'VIEWER'
}

export enum SchoolStatus {
  PENDING = 'PENDING',
  APPROVED = 'APPROVED',
  REJECTED = 'REJECTED'
}

export enum SubscriptionPlan {
  FREE = 'FREE',
  BASIC = 'BASIC', // 100 certificates
  PREMIUM = 'PREMIUM' // Unlimited
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: Role;
  schoolId?: string; // If null, super admin
  phone?: string;
  emailVerified?: boolean; // New field for verification status
}

export interface Teacher extends User {
  subject?: string;
  designation?: string;
  joinDate?: string;
}

export interface Notification {
  id: string;
  userId: string;
  title: string;
  message: string;
  read: boolean;
  date: string;
  type: 'info' | 'success' | 'warning' | 'error';
}

export interface School {
  id: string;
  name: string;
  eiin: string;
  division: string;
  district: string;
  upazila: string;
  email: string;
  phone: string;
  headMasterName: string;
  status: SchoolStatus;
  subscriptionPlan: SubscriptionPlan;
  subscriptionExpiry: string; // ISO Date
  balance: number; // For micropayments wallet
}

export interface Student {
  id: string;
  name: string;
  fatherName: string;
  motherName: string;
  roll: string;
  class: string;
  section: string;
  dob: string;
  address: string;
  gpa?: number;
  attendance?: number;
}

export interface CertificateRequest {
  id: string;
  schoolId: string;
  studentId: string;
  issueDate: string;
  verifiedBy?: string; // Super admin ID
  status: 'DRAFT' | 'SUBMITTED' | 'APPROVED';
  content: string; // JSON string of specific fields
  remarks: string;
}

export interface AuditLog {
  id: string;
  timestamp: string;
  userId: string;
  action: string;
  details: string;
}

export const DIVISIONS = ["Dhaka", "Chittagong", "Rajshahi", "Khulna", "Barisal", "Sylhet", "Rangpur", "Mymensingh"];
export const MOCK_DISTRICTS: Record<string, string[]> = {
  "Dhaka": ["Dhaka", "Gazipur", "Narayanganj"],
  "Chittagong": ["Chittagong", "Cox's Bazar", "Comilla"],
  // Simplified for demo
};
