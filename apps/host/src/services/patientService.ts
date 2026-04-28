import { collection, doc, getDocs, getDoc, addDoc, updateDoc, deleteDoc, query, where, orderBy } from 'firebase/firestore';
import { db } from '../firebase';
import type { Patient, PatientStatus } from '../types';

const PATIENTS_COLLECTION = 'patients';

export const patientService = {
  getPatients: async (): Promise<Patient[]> => {
    try {
      const q = query(collection(db, PATIENTS_COLLECTION), orderBy('createdAt', 'desc'));
      const snapshot = await getDocs(q);
      return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Patient));
    } catch (err: any) {
      // Fallback: index might not exist yet — fetch without ordering
      console.warn('Ordered patient query failed (index missing?), falling back:', err.message);
      const snapshot = await getDocs(collection(db, PATIENTS_COLLECTION));
      return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Patient));
    }
  },

  getPatientById: async (id: string): Promise<Patient | null> => {
    const docRef = doc(db, PATIENTS_COLLECTION, id);
    const snapshot = await getDoc(docRef);
    if (snapshot.exists()) {
      return { id: snapshot.id, ...snapshot.data() } as Patient;
    }
    return null;
  },

  addPatient: async (patient: Omit<Patient, 'id' | 'createdAt' | 'updatedAt'>): Promise<string> => {
    const newPatient = {
      ...patient,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    const docRef = await addDoc(collection(db, PATIENTS_COLLECTION), newPatient);
    return docRef.id;
  },

  updatePatient: async (id: string, patient: Partial<Patient>): Promise<void> => {
    const docRef = doc(db, PATIENTS_COLLECTION, id);
    await updateDoc(docRef, { ...patient, updatedAt: new Date().toISOString() });
  },

  updatePatientStatus: async (id: string, status: PatientStatus): Promise<void> => {
    const docRef = doc(db, PATIENTS_COLLECTION, id);
    await updateDoc(docRef, { status, updatedAt: new Date().toISOString() });
  },

  deletePatient: async (id: string): Promise<void> => {
    const docRef = doc(db, PATIENTS_COLLECTION, id);
    await deleteDoc(docRef);
  },

  getPatientsByDoctor: async (doctorId: string): Promise<Patient[]> => {
    const q = query(collection(db, PATIENTS_COLLECTION), where('assignedDoctorId', '==', doctorId));
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Patient));
  }
};
