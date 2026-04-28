import { collection, getDocs, writeBatch, doc } from 'firebase/firestore';
import { db } from '../firebase';
import type { Patient } from '../types';

const indianFirstNames = ['Aarav', 'Vivaan', 'Aditya', 'Vihaan', 'Arjun', 'Sai', 'Ayaan', 'Krishna', 'Ishaan', 'Shaurya', 'Aadhya', 'Diya', 'Ananya', 'Aaradhya', 'Pari', 'Avni', 'Aditi', 'Anika', 'Dhriti', 'Riya'];
const indianLastNames = ['Sharma', 'Verma', 'Patel', 'Singh', 'Kumar', 'Das', 'Roy', 'Chowdhury', 'Nair', 'Menon', 'Rao', 'Garg', 'Jain', 'Bose', 'Guha'];
const westernFirstNames = ['James', 'John', 'Robert', 'Michael', 'William', 'David', 'Richard', 'Joseph', 'Thomas', 'Charles', 'Mary', 'Patricia', 'Jennifer', 'Linda', 'Elizabeth', 'Barbara', 'Susan', 'Jessica', 'Sarah', 'Karen'];
const westernLastNames = ['Smith', 'Johnson', 'Williams', 'Brown', 'Jones', 'Garcia', 'Miller', 'Davis', 'Rodriguez', 'Martinez', 'Hernandez', 'Lopez', 'Gonzalez', 'Wilson', 'Anderson'];
const conditions = ['Hypertension', 'Type 2 Diabetes', 'Cardiac Arrest', 'Appendicitis', 'Pneumonia', 'Fractured Femur', 'COVID-19', 'Asthma', 'Kidney Failure', 'Migraine', 'COPD', 'Bronchitis', 'Malaria', 'Dengue'];
const wards = ['Cardiology', 'Endocrinology', 'ICU', 'Surgery', 'Pulmonology', 'Orthopedics', 'Isolation', 'Nephrology', 'Neurology', 'General', 'Pediatrics'];

const physicians = ['Dr. Ramesh', 'Dr. Suresh', 'Dr. Anil', 'Dr. Sunita', 'Dr. Meena', 'Dr. Smith', 'Dr. Johnson'];

const getRandomInt = (min: number, max: number) => Math.floor(Math.random() * (max - min + 1)) + min;
const getRandomElement = <T>(arr: T[]): T => arr[Math.floor(Math.random() * arr.length)];
const generatePhone = () => `+91 ${getRandomInt(9000000000, 9999999999)}`;
const generateEmail = (f: string, l: string) => `${f.toLowerCase()}.${l.toLowerCase()}${getRandomInt(1,99)}@hospital.com`;

export const seedPatients = async (targetCount: number = 150) => {
  const doctorsCollection = collection(db, 'doctors');
  const docSnapshot = await getDocs(doctorsCollection);
  let doctorsList: any[] = docSnapshot.docs.map(d => ({ id: d.id, ...d.data() }));

  const now = new Date();
  
  if (doctorsList.length < 10) {
    console.log('Seeding doctors...');
    const docBatch = writeBatch(db);
    for (let i = doctorsList.length; i < 10; i++) {
        const isIndian = Math.random() > 0.5;
        const firstName = isIndian ? getRandomElement(indianFirstNames) : getRandomElement(westernFirstNames);
        const lastName = isIndian ? getRandomElement(indianLastNames) : getRandomElement(westernLastNames);
        const name = `Dr. ${firstName} ${lastName}`;
        const newDoc: any = {
            name,
            email: generateEmail(firstName, lastName),
            department: getRandomElement(wards),
            specialization: getRandomElement(['Cardiology', 'Neurology', 'Orthopedics', 'Pediatrics', 'General Surgery', 'Dermatology', 'Oncology', 'Radiology']),
            phone: generatePhone(),
            password: 'password123',
            availability: { start: '09:00', end: '17:00', breaks: [{ start: '13:00', end: '14:00', label: 'Lunch' }] },
            createdAt: now.toISOString(),
            status: 'active'
        };
        const ref = doc(doctorsCollection);
        docBatch.set(ref, newDoc);
        newDoc.id = ref.id;
        doctorsList.push(newDoc);
    }
    await docBatch.commit();
    console.log('Doctors seeded.');
    // Refresh doctors list after seeding
    const refreshedDocs = await getDocs(doctorsCollection);
    doctorsList = refreshedDocs.docs.map(d => ({ id: d.id, ...d.data() }));
  }

  // Ensure all doctors have specialization (including those already existing)
  const doctorUpdateBatch = writeBatch(db);
  let doctorsUpdated = 0;
  docSnapshot.docs.forEach(d => {
    const data = d.data() as any;
    if (!data.specialization || !data.password) {
      const updates: any = {};
      if (!data.specialization) updates.specialization = getRandomElement(['Cardiology', 'Neurology', 'Orthopedics', 'Pediatrics', 'General Surgery', 'Dermatology', 'Oncology', 'Radiology']);
      if (!data.password) updates.password = 'password123';
      
      doctorUpdateBatch.update(d.ref, updates);
      doctorsUpdated++;
    }
  });
  if (doctorsUpdated > 0) {
    await doctorUpdateBatch.commit();
    console.log(`Updated ${doctorsUpdated} doctors with specializations.`);
    // Refresh list again if updates were made
    const refreshedDocs = await getDocs(doctorsCollection);
    doctorsList = refreshedDocs.docs.map(d => ({ id: d.id, ...d.data() }));
  }

  // Check if patients already exist
  const snapshot = await getDocs(collection(db, 'patients'));
  const currentCount = snapshot.size;
  
  if (currentCount >= targetCount && currentCount > 0) {
    // Only skip creation if we reached target. But we still need to assign to existing if needed.
    // So we don't return early strictly, we just set countToGenerate = 0
  }

  const countToGenerate = Math.max(0, targetCount - currentCount);
  if (countToGenerate > 0) {
      console.log(`Seeding ${countToGenerate} additional patients...`);
      const batch = writeBatch(db);
    
      for (let i = 0; i < countToGenerate; i++) {
        const isIndian = Math.random() > 0.5;
    const firstName = isIndian ? getRandomElement(indianFirstNames) : getRandomElement(westernFirstNames);
    const lastName = isIndian ? getRandomElement(indianLastNames) : getRandomElement(westernLastNames);
    const name = `${firstName} ${lastName}`;
    const age = getRandomInt(1, 90);
    const timeOffset = getRandomInt(1, 200) * 24 * 60 * 60 * 1000; // up to 200 days ago
    const admittedAtDate = new Date(now.getTime() - timeOffset);
    
    // Create random DOB based on age
    const dob = new Date(now.getTime() - age * 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];

    const newPatient: Omit<Patient, 'id'> = {
      name,
      age,
      sex: Math.random() > 0.5 ? 'Male' : 'Female',
      dob,
      email: `${firstName.toLowerCase()}.${lastName.toLowerCase()}${getRandomInt(1,99)}@example.com`,
      phone: generatePhone(),
      address: `${getRandomInt(1, 999)} Main St, City`,
      maritalStatus: getRandomElement(['Single', 'Married', 'Divorced', 'Widowed']),
      emergencyContact1Name: isIndian ? getRandomElement(indianFirstNames) : getRandomElement(westernFirstNames),
      emergencyContact1Phone: generatePhone(),
      primaryCarePhysician: getRandomElement(physicians),
      primaryCarePhysicianPhone: generatePhone(),
      reasonForAppointment: getRandomElement(conditions),
      condition: getRandomElement(conditions),
      ward: getRandomElement(wards),
      status: getRandomElement(['Assigned', 'Stable', 'Critical', 'Discharged', 'Rescheduled']),
      assignedDoctorId: getRandomElement(doctorsList).id,
      assignedDoctorName: getRandomElement(doctorsList).name,
      admittedAt: admittedAtDate.toISOString(),
      createdAt: admittedAtDate.toISOString(),
      updatedAt: admittedAtDate.toISOString(),
    };

    const docRef = doc(collection(db, 'patients'));
    batch.set(docRef, newPatient);
  }
  await batch.commit();
  console.log('Successfully seeded patients!');
}

  // Assign existing generic patients to doctors if not assigned
  const assignBatch = writeBatch(db);
  let assignmentsMade = 0;
  // Update ALL existing patients with random statuses for better analytics
  snapshot.docs.forEach(d => {
    const data = d.data() as any;
    const updatePayload: any = {
      status: getRandomElement(['Assigned', 'Stable', 'Critical', 'Discharged', 'Rescheduled'])
    };
    
    if (!data.assignedDoctorId) {
        const assignedDoc = getRandomElement(doctorsList);
        updatePayload.assignedDoctorId = assignedDoc.id;
        updatePayload.assignedDoctorName = assignedDoc.name;
    }
    
    assignBatch.update(d.ref, updatePayload);
    assignmentsMade++;
  });

  if (assignmentsMade > 0) {
      await assignBatch.commit();
      console.log(`Mapped ${assignmentsMade} patients to doctors.`);
  }

  // Seed Admins
  const adminsCollection = collection(db, 'admins');
  const adminSnapshot = await getDocs(adminsCollection);
  if (adminSnapshot.size === 0) {
    console.log('Seeding admins...');
    const adminBatch = writeBatch(db);
    const adminUsers = [
      { 
        name: 'Super Admin', 
        email: 'admin@raga.ai', 
        password: 'admin123',
        role: 'admin', 
        phone: '+91 9999999999', 
        createdAt: now.toISOString(),
        status: 'active'
      },
      { 
        name: 'Hospital Manager', 
        email: 'manager@hospital.com', 
        password: 'admin123',
        role: 'admin', 
        phone: '+91 8888888888', 
        createdAt: now.toISOString(),
        status: 'active'
      }
    ];
    
    adminUsers.forEach(admin => {
      const ref = doc(adminsCollection);
      adminBatch.set(ref, admin);
    });
    
    await adminBatch.commit();
    console.log('Admins seeded.');
  } else {
    // Ensure existing admins have passwords
    const adminUpdateBatch = writeBatch(db);
    let adminsUpdated = 0;
    adminSnapshot.docs.forEach(d => {
      if (!(d.data() as any).password) {
        adminUpdateBatch.update(d.ref, { password: 'admin123' });
        adminsUpdated++;
      }
    });
    if (adminsUpdated > 0) await adminUpdateBatch.commit();
  }

};
