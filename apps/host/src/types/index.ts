export type Role = 'admin' | 'doctor';

export type PatientStatus = 'Pending' | 'Assigned' | 'Rescheduled' | 'Stable' | 'Critical' | 'Discharged';

export interface Patient {
  id?: string;
  name: string;
  age: number;
  sex: string;
  dob: string;
  email: string;
  phone: string;
  address: string;
  workPhone?: string;
  
  maritalStatus: string;
  maritalStatusSpecify?: string;
  emergencyContact1Name: string;
  emergencyContact1Phone: string;
  emergencyContact2Name?: string;
  emergencyContact2Phone?: string;
  primaryCarePhysician: string;
  primaryCarePhysicianPhone: string;
  
  reasonForAppointment: string;
  condition: string;
  ward: string;
  status: PatientStatus;
  
  admittedAt: string;
  assignedDoctorId?: string;
  assignedDoctorName?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Break {
  start: string;
  end: string;
  label?: string;
}

export interface DoctorAvailability {
  start: string;
  end: string;
  breaks: Break[];
}

export interface Doctor {
  id?: string;
  uid: string;
  name: string;
  email: string;
  phone: string;
  specialization: string;
  availability: DoctorAvailability;
  createdAt: string;
  status?: 'active' | 'inactive';
}

export type AppointmentStatus = 'Scheduled' | 'Completed' | 'Rescheduled' | 'Cancelled';

export interface Appointment {
  id?: string;
  patientId: string;
  patientName: string;
  doctorId: string;
  doctorName: string;
  scheduledAt: string;
  duration: number; // in minutes
  status: AppointmentStatus;
  notes?: string;
  rescheduledFrom?: string; // previous appointment id if rescheduled
  createdAt: string;
}
