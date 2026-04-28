import { collection, doc, getDocs, addDoc, updateDoc, query, where, orderBy } from 'firebase/firestore';
import { db } from '../firebase';
import type { Appointment, AppointmentStatus } from '../types';
import { doctorService } from './doctorService';
import { patientService } from './patientService';

const APPOINTMENTS_COLLECTION = 'appointments';

export const appointmentService = {
  getAllAppointments: async (): Promise<Appointment[]> => {
    try {
      const q = query(collection(db, APPOINTMENTS_COLLECTION), orderBy('scheduledAt', 'asc'));
      const snapshot = await getDocs(q);
      return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Appointment));
    } catch (error: any) {
      if (error?.message?.includes('requires an index')) {
        const q = query(collection(db, APPOINTMENTS_COLLECTION));
        const snapshot = await getDocs(q);
        const results = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Appointment));
        return results.sort((a, b) => new Date(a.scheduledAt).getTime() - new Date(b.scheduledAt).getTime());
      }
      throw error;
    }
  },

  getAppointmentsForDoctor: async (doctorId: string): Promise<Appointment[]> => {
    try {
      const q = query(collection(db, APPOINTMENTS_COLLECTION), where('doctorId', '==', doctorId), orderBy('scheduledAt', 'asc'));
      const snapshot = await getDocs(q);
      return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Appointment));
    } catch (error: any) {
      if (error?.message?.includes('requires an index')) {
        const q = query(collection(db, APPOINTMENTS_COLLECTION), where('doctorId', '==', doctorId));
        const snapshot = await getDocs(q);
        const results = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Appointment));
        return results.sort((a, b) => new Date(a.scheduledAt).getTime() - new Date(b.scheduledAt).getTime());
      }
      throw error;
    }
  },

  getAppointmentsForPatient: async (patientId: string): Promise<Appointment[]> => {
    try {
      const q = query(collection(db, APPOINTMENTS_COLLECTION), where('patientId', '==', patientId), orderBy('scheduledAt', 'desc'));
      const snapshot = await getDocs(q);
      return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Appointment));
    } catch (error: any) {
      if (error?.message?.includes('requires an index')) {
        const q = query(collection(db, APPOINTMENTS_COLLECTION), where('patientId', '==', patientId));
        const snapshot = await getDocs(q);
        const results = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Appointment));
        return results.sort((a, b) => new Date(b.scheduledAt).getTime() - new Date(a.scheduledAt).getTime());
      }
      throw error;
    }
  },

  checkAvailability: async (doctorId: string, requestedTime: Date, duration: number): Promise<{ available: boolean, reason?: string }> => {
    const doctor = await doctorService.getDoctorById(doctorId);
    if (!doctor) return { available: false, reason: 'Doctor not found' };

    const reqStart = requestedTime.getTime();
    const reqEnd = reqStart + duration * 60000;

    // Check doctor's working hours (simplified for a single day)
    const workStart = new Date(requestedTime);
    const [wStartH, wStartM] = doctor.availability.start.split(':').map(Number);
    workStart.setHours(wStartH, wStartM, 0, 0);

    const workEnd = new Date(requestedTime);
    const [wEndH, wEndM] = doctor.availability.end.split(':').map(Number);
    workEnd.setHours(wEndH, wEndM, 0, 0);

    if (reqStart < workStart.getTime() || reqEnd > workEnd.getTime()) {
      return { available: false, reason: 'Outside working hours' };
    }

    // Check breaks
    if (doctor.availability.breaks && doctor.availability.breaks.length > 0) {
      for (const brk of doctor.availability.breaks) {
        const bStart = new Date(requestedTime);
        const [bsH, bsM] = brk.start.split(':').map(Number);
        bStart.setHours(bsH, bsM, 0, 0);

        const bEnd = new Date(requestedTime);
        const [beH, beM] = brk.end.split(':').map(Number);
        bEnd.setHours(beH, beM, 0, 0);

        if ((reqStart >= bStart.getTime() && reqStart < bEnd.getTime()) ||
            (reqEnd > bStart.getTime() && reqEnd <= bEnd.getTime()) ||
            (reqStart <= bStart.getTime() && reqEnd >= bEnd.getTime())) {
          return { available: false, reason: `Overlaps with ${brk.label || 'break'}` };
        }
      }
    }

    // Check existing appointments on the same day
    const appointments = await appointmentService.getAppointmentsForDoctor(doctorId);
    const sameDayAppts = appointments.filter(a => {
      const aDate = new Date(a.scheduledAt);
      return aDate.getFullYear() === requestedTime.getFullYear() &&
             aDate.getMonth() === requestedTime.getMonth() &&
             aDate.getDate() === requestedTime.getDate() &&
             a.status !== 'Cancelled';
    });

    for (const appt of sameDayAppts) {
      const existingStart = new Date(appt.scheduledAt).getTime();
      const existingEnd = existingStart + appt.duration * 60000;
      
      if ((reqStart >= existingStart && reqStart < existingEnd) ||
          (reqEnd > existingStart && reqEnd <= existingEnd) ||
          (reqStart <= existingStart && reqEnd >= existingEnd)) {
        return { available: false, reason: 'Time slot already booked' };
      }
    }

    return { available: true };
  },

  findNextAvailableSlot: async (doctorId: string, duration: number = 30): Promise<Date | null> => {
    // Start looking from tomorrow morning at 9am
    let currentDate = new Date();
    currentDate.setDate(currentDate.getDate() + 1);
    
    // In a real app we would loop days and check slots, here we'll just check tomorrow's slots
    for (let h = 9; h < 17; h++) {
      for (let m of [0, 30]) {
        currentDate.setHours(h, m, 0, 0);
        const availability = await appointmentService.checkAvailability(doctorId, currentDate, duration);
        if (availability.available) {
          return currentDate;
        }
      }
    }
    return null;
  },

  scheduleAppointment: async (patientId: string, doctorId: string, scheduledTime?: Date, notes?: string): Promise<string> => {
    const patient = await patientService.getPatientById(patientId);
    const doctor = await doctorService.getDoctorById(doctorId);
    
    if (!patient || !doctor) throw new Error("Patient or Doctor not found");

    let finalTime: Date | null | undefined = scheduledTime;
    if (!finalTime) {
      finalTime = await appointmentService.findNextAvailableSlot(doctorId, 30);
      if (!finalTime) throw new Error("No available slots found for this doctor");
    } else {
      const isAvailable = await appointmentService.checkAvailability(doctorId, finalTime, 30);
      if (!isAvailable.available) throw new Error(isAvailable.reason || "Time slot not available");
    }

    const newAppointment: Omit<Appointment, 'id'> = {
      patientId,
      patientName: patient.name,
      doctorId,
      doctorName: doctor.name,
      scheduledAt: finalTime.toISOString(),
      duration: 30,
      status: 'Scheduled',
      notes: notes || '',
      createdAt: new Date().toISOString()
    };

    const docRef = await addDoc(collection(db, APPOINTMENTS_COLLECTION), newAppointment);
    
    // Update patient status and assigned doctor
    await patientService.updatePatient(patientId, {
      assignedDoctorId: doctorId,
      assignedDoctorName: doctor.name,
      status: 'Assigned'
    });

    return docRef.id;
  },

  updateAppointmentStatus: async (id: string, status: AppointmentStatus): Promise<void> => {
    const docRef = doc(db, APPOINTMENTS_COLLECTION, id);
    await updateDoc(docRef, { status });
  }
};
