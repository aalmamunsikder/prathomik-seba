
import { Role, School, SchoolStatus, SubscriptionPlan, User, AuditLog, CertificateRequest, Teacher, Notification } from '../types';

// Initial Mock Data
let schools: School[] = [
  {
    id: 'sch_1',
    name: 'Model Govt Primary School',
    eiin: '123456',
    division: 'Dhaka',
    district: 'Dhaka',
    upazila: 'Savar',
    email: 'headmaster@model.com',
    phone: '01700000000',
    headMasterName: 'Abdul Karim',
    status: SchoolStatus.APPROVED,
    subscriptionPlan: SubscriptionPlan.PREMIUM,
    subscriptionExpiry: '2025-12-31',
    balance: 500
  },
  {
    id: 'sch_2',
    name: 'Village Primary School',
    eiin: '987654',
    division: 'Chittagong',
    district: 'Comilla',
    upazila: 'Sadar',
    email: 'village@school.com',
    phone: '01800000000',
    headMasterName: 'Rahima Begum',
    status: SchoolStatus.PENDING,
    subscriptionPlan: SubscriptionPlan.FREE,
    subscriptionExpiry: '2024-01-01',
    balance: 0
  }
];

let users: User[] = [
  {
    id: 'u_admin',
    name: 'Central Admin',
    email: 'admin@dpe.gov.bd',
    role: Role.SUPER_ADMIN,
    phone: '01555555555'
  },
  {
    id: 'u_hm_1',
    name: 'Abdul Karim',
    email: 'headmaster@model.com',
    role: Role.SCHOOL_ADMIN,
    schoolId: 'sch_1',
    phone: '01700000000'
  }
];

let teachers: Teacher[] = [
    {
        id: 't_1',
        name: 'Rahim Uddin',
        email: 'rahim@model.com',
        role: Role.TEACHER,
        schoolId: 'sch_1',
        phone: '01711111111',
        subject: 'Bangla',
        designation: 'Assistant Teacher'
    }
];

let notifications: Notification[] = [
    {
        id: 'n_1',
        userId: 'u_hm_1',
        title: 'স্বাগতম!',
        message: 'প্রাথমিক সেবা পোর্টালে আপনাকে স্বাগতম।',
        read: false,
        date: new Date().toISOString(),
        type: 'info'
    }
];

let certificates: CertificateRequest[] = [];
let auditLogs: AuditLog[] = [];

// Service Methods
export const MockService = {
  login: async (email: string): Promise<User | null> => {
    await new Promise(r => setTimeout(r, 800)); // Simulate network
    return users.find(u => u.email === email) || null;
  },

  registerSchool: async (schoolData: Omit<School, 'id' | 'status' | 'subscriptionPlan' | 'subscriptionExpiry' | 'balance'>): Promise<School> => {
    await new Promise(r => setTimeout(r, 1000));
    const newSchool: School = {
      ...schoolData,
      id: `sch_${Date.now()}`,
      status: SchoolStatus.PENDING,
      subscriptionPlan: SubscriptionPlan.FREE,
      subscriptionExpiry: new Date().toISOString(),
      balance: 0
    };
    schools.push(newSchool);
    
    // Create a user for the headmaster automatically
    const newUser: User = {
      id: `u_${Date.now()}`,
      name: schoolData.headMasterName,
      email: schoolData.email,
      role: Role.SCHOOL_ADMIN,
      schoolId: newSchool.id,
      phone: schoolData.phone
    };
    users.push(newUser);
    
    MockService.logAction(newUser.id, 'REGISTRATION', `School ${newSchool.name} registered`);
    return newSchool;
  },

  getSchools: async (): Promise<School[]> => {
    return [...schools];
  },

  approveSchool: async (adminId: string, schoolId: string): Promise<void> => {
    const school = schools.find(s => s.id === schoolId);
    if (school) {
      school.status = SchoolStatus.APPROVED;
      MockService.logAction(adminId, 'APPROVE_SCHOOL', `Approved school ${school.name}`);
      // Add notification for school admin
       const adminUser = users.find(u => u.schoolId === schoolId && u.role === Role.SCHOOL_ADMIN);
       if(adminUser) {
           notifications.push({
               id: Date.now().toString(),
               userId: adminUser.id,
               title: 'আবেদন অনুমোদিত',
               message: 'আপনার স্কুলের নিবন্ধন সফলভাবে অনুমোদিত হয়েছে।',
               read: false,
               date: new Date().toISOString(),
               type: 'success'
           });
       }
    }
  },

  subscribe: async (schoolId: string, plan: SubscriptionPlan, amount: number): Promise<void> => {
    await new Promise(r => setTimeout(r, 1500)); // Processing payment
    const school = schools.find(s => s.id === schoolId);
    if (school) {
      school.subscriptionPlan = plan;
      // Add 1 year
      const current = new Date();
      current.setFullYear(current.getFullYear() + 1);
      school.subscriptionExpiry = current.toISOString();
      school.balance += 0; // In real app, balance might be used or deducted
      MockService.logAction(schoolId, 'SUBSCRIPTION', `Upgraded to ${plan} plan. Paid BDT ${amount}`);
    }
  },

  createCertificate: async (data: CertificateRequest): Promise<void> => {
    certificates.push(data);
    MockService.logAction(data.schoolId, 'CREATE_CERT', `Certificate generated for student ${data.studentId}`);
  },

  getCertificates: async (schoolId: string): Promise<CertificateRequest[]> => {
    return certificates.filter(c => c.schoolId === schoolId);
  },
  
  // Teacher Management
  getTeachers: async (schoolId: string): Promise<Teacher[]> => {
      return teachers.filter(t => t.schoolId === schoolId);
  },

  addTeacher: async (teacherData: Partial<Teacher>): Promise<void> => {
      const newTeacher = {
          ...teacherData,
          id: `t_${Date.now()}`,
          role: Role.TEACHER,
      } as Teacher;
      teachers.push(newTeacher);
      // Also add to users to allow login
      users.push(newTeacher);
      MockService.logAction(teacherData.schoolId!, 'ADD_TEACHER', `Added teacher ${teacherData.name}`);
  },

  removeTeacher: async (teacherId: string): Promise<void> => {
      teachers = teachers.filter(t => t.id !== teacherId);
      users = users.filter(u => u.id !== teacherId);
  },

  // Notifications
  getNotifications: async (userId: string): Promise<Notification[]> => {
      return notifications.filter(n => n.userId === userId);
  },

  markAsRead: async (notifId: string): Promise<void> => {
      const n = notifications.find(n => n.id === notifId);
      if(n) n.read = true;
  },

  logAction: (userId: string, action: string, details: string) => {
    auditLogs.unshift({
      id: `log_${Date.now()}`,
      timestamp: new Date().toISOString(),
      userId,
      action,
      details
    });
  },

  getAuditLogs: async (): Promise<AuditLog[]> => {
    return [...auditLogs];
  }
};
