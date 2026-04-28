import { collection, doc, getDocs, getDoc, setDoc, updateDoc, deleteDoc } from 'firebase/firestore';
import { db } from '../firebase';
import type { Doctor, DoctorAvailability } from '../types';

const DOCTORS_COLLECTION = 'doctors';

export const doctorService = {
  getDoctors: async (): Promise<Doctor[]> => {
    const snapshot = await getDocs(collection(db, DOCTORS_COLLECTION));
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Doctor));
  },

  getDoctorById: async (id: string): Promise<Doctor | null> => {
    const docRef = doc(db, DOCTORS_COLLECTION, id);
    const snapshot = await getDoc(docRef);
    if (snapshot.exists()) {
      return { id: snapshot.id, ...snapshot.data() } as Doctor;
    }
    return null;
  },

  getDoctorByUid: async (uid: string): Promise<Doctor | null> => {
    const doctors = await doctorService.getDoctors();
    return doctors.find(d => d.uid === uid) || null;
  },

  createDoctorRecord: async (doctor: Omit<Doctor, 'id' | 'createdAt'>, uid: string): Promise<void> => {
    const newDoctor = {
      ...doctor,
      uid,
      createdAt: new Date().toISOString(),
    };
    // Use the auth UID as the document ID for easy lookup
    await setDoc(doc(db, DOCTORS_COLLECTION, uid), newDoctor);
  },

  updateDoctorAvailability: async (uid: string, availability: DoctorAvailability): Promise<void> => {
    const docRef = doc(db, DOCTORS_COLLECTION, uid);
    await updateDoc(docRef, { availability });
  },

  updateDoctor: async (uid: string, data: Partial<Doctor>): Promise<void> => {
    const docRef = doc(db, DOCTORS_COLLECTION, uid);
    await updateDoc(docRef, data);
  },

  deleteDoctor: async (uid: string): Promise<void> => {
    const docRef = doc(db, DOCTORS_COLLECTION, uid);
    // Note: This only deletes the Firestore record, not the Firebase Auth user.
    await deleteDoc(docRef);
  }
};
