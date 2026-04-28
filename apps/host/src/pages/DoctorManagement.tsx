import React, { useState, useEffect } from 'react';
import { Mail, Plus, UserPlus, Phone, Clock, Trash2, Power, X, Calendar } from 'lucide-react';
import { doctorService } from '../services/doctorService';
import { appointmentService } from '../services/appointmentService';
import type { Doctor, Appointment } from '../types';
import emailjs from '@emailjs/browser';
import { initializeApp } from 'firebase/app';
import { getAuth, createUserWithEmailAndPassword } from 'firebase/auth';
import { auth } from '../firebase';
import { useTranslation } from '../hooks/useTranslation';

const GlowSkeleton = ({ className = '' }: { className?: string }) => (
  <div className={`skeleton-glow ${className}`}></div>
);

const DoctorManagement: React.FC = () => {
  const { t } = useTranslation();
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  
  // Form State
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [specialization, setSpecialization] = useState('');
  const [phone, setPhone] = useState('');
  const [hoursStart, setHoursStart] = useState('09:00');
  const [hoursEnd, setHoursEnd] = useState('17:00');
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState('');
  
  // Mock Email Acknowledgment State
  const [mockEmail, setMockEmail] = useState<{username: string, email: string, tempPassword: string} | null>(null);

  // Profile Modal State
  const [selectedDoctor, setSelectedDoctor] = useState<Doctor | null>(null);
  const [doctorAppointments, setDoctorAppointments] = useState<Appointment[]>([]);
  const [loadingAppts, setLoadingAppts] = useState(false);

  useEffect(() => {
    fetchDoctors();
  }, []);

  const fetchDoctors = async () => {
    try {
      const docs = await doctorService.getDoctors();
      setDoctors(docs);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateDoctor = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setCreating(true);

    try {
      // 1. Generate temp password
      const tempPassword = Math.random().toString(36).slice(-8) + 'A1!';

      // 2. Create Firebase Auth user using a secondary app to avoid signing out the Admin
      const secondaryApp = initializeApp(auth.app.options, 'SecondaryApp_' + Date.now());
      const secondaryAuth = getAuth(secondaryApp);
      const userCredential = await createUserWithEmailAndPassword(secondaryAuth, email, tempPassword);
      const newUserUid = userCredential.user.uid;
      
      // Sign out of the secondary instance to clean up local state
      await secondaryAuth.signOut();

      // 3. Create Firestore record
      await doctorService.createDoctorRecord({
        name, email, phone, specialization, uid: newUserUid,
        status: 'active',
        availability: { start: hoursStart, end: hoursEnd, breaks: [{ start: '13:00', end: '14:00', label: 'Lunch' }] }
      }, newUserUid);

      // 4. Send real email via EmailJS
      await emailjs.send(
        import.meta.env.VITE_EMAILJS_SERVICE_ID, 
        import.meta.env.VITE_EMAILJS_TEMPLATE_ID_DOCTOR || 'template_dsbh4kf', 
        {
          to_email: email,
          to_name: name,
          username: email,
          password: tempPassword,
          login_url: 'https://reagahealthcare.netlify.app/login'
        }, 
        import.meta.env.VITE_EMAILJS_PUBLIC_KEY
      );

      // 5. Show Acknowledgment that the email was indeed sent
      setMockEmail({
        username: name,
        email,
        tempPassword
      });

      setShowAddForm(false);
      setName(''); setEmail(''); setSpecialization(''); setPhone('');
      setHoursStart('09:00'); setHoursEnd('17:00');
      
      // Refresh the list
      fetchDoctors();
      
    } catch (err: any) {
      console.error("EmailJS or Creation Error:", err);
      // EmailJS errors usually put the specific rejection reason in err.text
      const errorMsg = err.text || err.message || 'Failed to create doctor';
      setError(`Error: ${errorMsg}`);
    } finally {
      setCreating(false);
    }
  };

  const openDoctorProfile = async (doc: Doctor) => {
    setSelectedDoctor(doc);
    setLoadingAppts(true);
    try {
      const appts = await appointmentService.getAppointmentsForDoctor(doc.id!);
      setDoctorAppointments(appts);
    } catch (err) {
      console.error("Failed to load appointments:", err);
    } finally {
      setLoadingAppts(false);
    }
  };

  const handleDeleteDoctor = async (id: string) => {
    if (!window.confirm("Are you sure you want to completely delete this doctor?")) return;
    try {
      await doctorService.deleteDoctor(id);
      setSelectedDoctor(null);
      fetchDoctors();
    } catch (err) {
      console.error(err);
      alert("Failed to delete doctor.");
    }
  };

  const handleToggleStatus = async (doc: Doctor) => {
    try {
      const newStatus = doc.status === 'inactive' ? 'active' : 'inactive';
      await doctorService.updateDoctor(doc.id!, { status: newStatus });
      setSelectedDoctor({...doc, status: newStatus});
      fetchDoctors();
    } catch (err) {
      console.error(err);
      alert("Failed to update status.");
    }
  };

  return (
    <div className="p-4 sm:p-6 md:p-8 max-w-7xl mx-auto animate-fade-in-up">
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-6 gap-4">
        <div>
          <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-slate-900 to-slate-600 dark:from-white dark:to-slate-400">{t('doctors.title')}</h1>
          <p className="text-slate-500 dark:text-slate-400 mt-1">{t('doctors.subtitle')}</p>
        </div>
        <button onClick={() => setShowAddForm(true)} className="flex items-center gap-2 px-4 py-2 text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-xl shadow-sm transition-all">
          <Plus size={16} /> {t('doctors.add')}
        </button>
      </div>

      {error && (
        <div className="mb-6 p-4 rounded-xl bg-rose-50 text-rose-600 flex items-start gap-3 border border-rose-100">
          <p className="text-sm font-medium">{error}</p>
        </div>
      )}

      {showAddForm && (
        <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-800 p-6 mb-8 animate-fade-in-up">
          <h2 className="text-lg font-bold mb-4 dark:text-white flex items-center gap-2"><UserPlus size={18}/> New Doctor Profile</h2>
          <form onSubmit={handleCreateDoctor} className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-semibold text-slate-700 dark:text-slate-300 block mb-1">Full Name</label>
              <input required value={name} onChange={e=>setName(e.target.value)} className="w-full px-4 py-2 border rounded-xl dark:bg-slate-800 dark:border-slate-700 dark:text-white focus:ring-2 focus:ring-blue-500" placeholder="Dr. John Doe" />
            </div>
            <div>
              <label className="text-sm font-semibold text-slate-700 dark:text-slate-300 block mb-1">Email Address</label>
              <input required type="email" value={email} onChange={e=>setEmail(e.target.value)} className="w-full px-4 py-2 border rounded-xl dark:bg-slate-800 dark:border-slate-700 dark:text-white focus:ring-2 focus:ring-blue-500" placeholder="doctor@hospital.com" />
            </div>
            <div>
              <label className="text-sm font-semibold text-slate-700 dark:text-slate-300 block mb-1">Specialization</label>
              <input required value={specialization} onChange={e=>setSpecialization(e.target.value)} className="w-full px-4 py-2 border rounded-xl dark:bg-slate-800 dark:border-slate-700 dark:text-white focus:ring-2 focus:ring-blue-500" placeholder="e.g. Cardiology" />
            </div>
            <div>
              <label className="text-sm font-semibold text-slate-700 dark:text-slate-300 block mb-1">Phone Number</label>
              <input required value={phone} onChange={e=>setPhone(e.target.value)} className="w-full px-4 py-2 border rounded-xl dark:bg-slate-800 dark:border-slate-700 dark:text-white focus:ring-2 focus:ring-blue-500" placeholder="+1..." />
            </div>
            <div>
              <label className="text-sm font-semibold text-slate-700 dark:text-slate-300 block mb-1">Working Hours Start</label>
              <input type="time" required value={hoursStart} onChange={e=>setHoursStart(e.target.value)} className="w-full px-4 py-2 border rounded-xl dark:bg-slate-800 dark:border-slate-700 dark:text-white focus:ring-2 focus:ring-blue-500" />
            </div>
            <div>
              <label className="text-sm font-semibold text-slate-700 dark:text-slate-300 block mb-1">Working Hours End</label>
              <input type="time" required value={hoursEnd} onChange={e=>setHoursEnd(e.target.value)} className="w-full px-4 py-2 border rounded-xl dark:bg-slate-800 dark:border-slate-700 dark:text-white focus:ring-2 focus:ring-blue-500" />
            </div>
            <div className="sm:col-span-2 flex justify-end gap-3 mt-2">
              <button type="button" onClick={() => setShowAddForm(false)} className="px-4 py-2 text-slate-500 font-medium">Cancel</button>
              <button disabled={creating} type="submit" className="px-5 py-2 bg-blue-600 text-white rounded-xl font-medium disabled:opacity-70 flex items-center gap-2">
                {creating ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div> : <Mail size={16} />}
                Create Doctor
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
        {loading ? [...Array(3)].map((_, i) => (
          <div key={i} className="bg-white dark:bg-slate-900 rounded-2xl p-5 border border-slate-100 dark:border-slate-800 space-y-3">
             <GlowSkeleton className="h-5 w-32" />
             <GlowSkeleton className="h-3 w-40" />
             <div className="mt-4"><GlowSkeleton className="h-3 w-28" /></div>
          </div>
        )) : doctors.map(doc => (
          <div key={doc.id} onClick={() => openDoctorProfile(doc)} className={`bg-white dark:bg-slate-900 rounded-2xl p-5 shadow-[0_2px_10px_-3px_rgba(6,81,237,0.08)] border transition-all group cursor-pointer ${doc.status === 'inactive' ? 'border-slate-200 dark:border-slate-800 opacity-60' : 'border-slate-100 dark:border-slate-800 hover:shadow-lg'}`}>
            <div className="flex justify-between items-start mb-1">
              <h3 className="font-bold text-slate-900 dark:text-white text-lg group-hover:text-blue-600 transition-colors">{doc.name}</h3>
              {doc.status === 'inactive' && (
                <span className="px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-500 text-xs font-semibold">Inactive</span>
              )}
            </div>
            <p className="text-blue-600 dark:text-blue-400 font-medium text-sm">{doc.specialization}</p>
            <div className="mt-4 space-y-2 text-sm text-slate-500 dark:text-slate-400">
              <p className="flex items-center gap-2"><Mail size={14} className="text-slate-400" /> {doc.email}</p>
              <p className="flex items-center gap-2"><Phone size={14} className="text-slate-400" /> {doc.phone || 'N/A'}</p>
              <p className="flex items-center gap-2"><Clock size={14} className="text-slate-400" /> {doc.availability?.start || '09:00'} — {doc.availability?.end || '17:00'}</p>
            </div>
          </div>
        ))}
      </div>
      
      {doctors.length === 0 && !loading && (
        <div className="text-center py-10 text-slate-500">No doctors registered yet.</div>
      )}

      {/* Profile Modal */}
      {selectedDoctor && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 animate-fade-in" onClick={() => setSelectedDoctor(null)}>
          <div className="bg-white dark:bg-slate-900 w-full max-w-2xl rounded-2xl shadow-xl flex flex-col overflow-hidden max-h-[90vh]" onClick={e => e.stopPropagation()}>
            <div className="p-5 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center bg-slate-50/50 dark:bg-slate-800/30">
              <div>
                <h2 className="text-xl font-bold text-slate-800 dark:text-white">{selectedDoctor.name}</h2>
                <p className="text-blue-600 dark:text-blue-400 font-medium text-sm mt-0.5">{selectedDoctor.specialization}</p>
              </div>
              <button onClick={() => setSelectedDoctor(null)} className="w-8 h-8 flex items-center justify-center rounded-full bg-slate-100 dark:bg-slate-800 text-slate-500 hover:bg-slate-200 dark:hover:bg-slate-700">
                <X size={16} />
              </button>
            </div>
            
            <div className="p-6 overflow-y-auto space-y-6">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div><span className="block text-slate-400 text-xs uppercase tracking-wider mb-1">Email</span><span className="dark:text-slate-200">{selectedDoctor.email}</span></div>
                <div><span className="block text-slate-400 text-xs uppercase tracking-wider mb-1">Phone</span><span className="dark:text-slate-200">{selectedDoctor.phone}</span></div>
                <div><span className="block text-slate-400 text-xs uppercase tracking-wider mb-1">Working Hours</span><span className="dark:text-slate-200">{selectedDoctor.availability?.start} - {selectedDoctor.availability?.end}</span></div>
                <div><span className="block text-slate-400 text-xs uppercase tracking-wider mb-1">Status</span>
                  <span className={`px-2 py-0.5 rounded-md font-semibold text-xs ${selectedDoctor.status === 'inactive' ? 'bg-rose-100 text-rose-700' : 'bg-emerald-100 text-emerald-700'}`}>
                    {selectedDoctor.status === 'inactive' ? 'Inactive' : 'Active'}
                  </span>
                </div>
              </div>

              <div>
                <h3 className="font-bold text-slate-800 dark:text-white mb-3 flex items-center gap-2"><Calendar size={16}/> Upcoming Appointments</h3>
                {loadingAppts ? (
                  <div className="text-center py-4 text-slate-400 text-sm">Loading appointments...</div>
                ) : doctorAppointments.length > 0 ? (
                  <div className="space-y-2">
                    {doctorAppointments.map(appt => (
                      <div key={appt.id} className="p-3 rounded-xl border border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/30 flex justify-between items-center text-sm">
                        <div>
                          <span className="font-semibold text-slate-800 dark:text-slate-200 block">{appt.patientName}</span>
                          <span className="text-slate-500">{new Date(appt.scheduledAt).toLocaleString()}</span>
                        </div>
                        <span className="px-2 py-1 rounded-full bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-400 text-xs font-medium">
                          {appt.status}
                        </span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-4 text-slate-400 text-sm border border-dashed border-slate-200 dark:border-slate-800 rounded-xl">No upcoming appointments</div>
                )}
              </div>
            </div>

            <div className="p-4 border-t border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/30 flex justify-end gap-3">
              <button 
                onClick={() => handleToggleStatus(selectedDoctor)}
                className="px-4 py-2 border border-amber-200 bg-amber-50 text-amber-700 hover:bg-amber-100 rounded-xl font-medium text-sm flex items-center gap-2 transition-colors"
              >
                <Power size={16} /> {selectedDoctor.status === 'inactive' ? 'Enable Appointments' : 'Disable Appointments'}
              </button>
              <button 
                onClick={() => handleDeleteDoctor(selectedDoctor.id!)}
                className="px-4 py-2 border border-rose-200 bg-rose-50 text-rose-700 hover:bg-rose-100 rounded-xl font-medium text-sm flex items-center gap-2 transition-colors"
              >
                <Trash2 size={16} /> Delete Doctor
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Mock Email Acknowledgment Modal */}
      {mockEmail && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 animate-fade-in" onClick={() => setMockEmail(null)}>
          <div className="bg-white dark:bg-slate-900 w-full max-w-md rounded-2xl shadow-xl p-6" onClick={e => e.stopPropagation()}>
            <div className="w-12 h-12 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-4">
              <Mail size={24} />
            </div>
            <h2 className="text-xl font-bold text-center text-slate-800 dark:text-white mb-2">Email Sent Successfully</h2>
            <p className="text-center text-slate-500 text-sm mb-6">The onboarding credentials have been sent to the doctor via EmailJS. Here is a copy of what was sent:</p>
            
            <div className="bg-slate-50 dark:bg-slate-800 rounded-xl p-4 space-y-3 font-mono text-sm border border-slate-100 dark:border-slate-700">
              <div><span className="text-slate-400">To:</span> <span className="text-slate-800 dark:text-slate-200">{mockEmail.email}</span></div>
              <div><span className="text-slate-400">Subject:</span> <span className="text-slate-800 dark:text-slate-200">Welcome to RAGA HealthCare</span></div>
              <div className="w-full h-px bg-slate-200 dark:bg-slate-700 my-2"></div>
              <p className="text-slate-600 dark:text-slate-300">Hello Dr. {mockEmail.username},</p>
              <p className="text-slate-600 dark:text-slate-300">Your portal account has been created. Please log in using the temporary credentials below:</p>
              <div className="bg-white dark:bg-slate-900 p-3 rounded-lg border border-slate-200 dark:border-slate-700 mt-2">
                <div className="mb-1"><span className="text-slate-400">Username:</span> <span className="font-bold text-blue-600 dark:text-blue-400">{mockEmail.email}</span></div>
                <div><span className="text-slate-400">Password:</span> <span className="font-bold text-blue-600 dark:text-blue-400">{mockEmail.tempPassword}</span></div>
              </div>
              <p className="text-slate-600 dark:text-slate-300 text-xs mt-3">Please change your password immediately upon first login.</p>
            </div>
            
            <button 
              onClick={() => setMockEmail(null)}
              className="w-full mt-6 px-4 py-2.5 bg-blue-600 text-white font-medium rounded-xl hover:bg-blue-700 transition-colors"
            >
              Close & Continue
            </button>
          </div>
        </div>
      )}

    </div>
  );
};

export default DoctorManagement;
