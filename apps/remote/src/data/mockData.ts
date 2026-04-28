export interface Patient {
  id: string;
  name: string;
  age: number;
  condition: string;
  status: 'Stable' | 'Critical' | 'Discharged';
  admittedAt: string;
}

export const mockPatients: Patient[] = [
  { id: 'PT-001', name: 'John Doe', age: 45, condition: 'Hypertension', status: 'Stable', admittedAt: '2023-10-01' },
  { id: 'PT-002', name: 'Jane Smith', age: 34, condition: 'Type 2 Diabetes', status: 'Stable', admittedAt: '2023-10-03' },
  { id: 'PT-003', name: 'Robert Johnson', age: 78, condition: 'Cardiac Arrest', status: 'Critical', admittedAt: '2023-10-05' },
  { id: 'PT-004', name: 'Emily Davis', age: 29, condition: 'Appendicitis', status: 'Discharged', admittedAt: '2023-09-28' },
  { id: 'PT-005', name: 'Michael Brown', age: 52, condition: 'Pneumonia', status: 'Critical', admittedAt: '2023-10-06' },
  { id: 'PT-006', name: 'Sarah Wilson', age: 61, condition: 'Fractured Femur', status: 'Stable', admittedAt: '2023-10-02' },
  { id: 'PT-007', name: 'David Lee', age: 40, condition: 'COVID-19', status: 'Stable', admittedAt: '2023-10-04' },
  { id: 'PT-008', name: 'Laura Garcia', age: 55, condition: 'Asthma Exacerbation', status: 'Discharged', admittedAt: '2023-09-30' },
];

export const mockAnalytics = [
  { name: 'Jan', patients: 400, admissions: 240, discharges: 200 },
  { name: 'Feb', patients: 300, admissions: 139, discharges: 221 },
  { name: 'Mar', patients: 200, admissions: 980, discharges: 229 },
  { name: 'Apr', patients: 278, admissions: 390, discharges: 200 },
  { name: 'May', patients: 189, admissions: 480, discharges: 218 },
  { name: 'Jun', patients: 239, admissions: 380, discharges: 250 },
  { name: 'Jul', patients: 349, admissions: 430, discharges: 210 },
];
