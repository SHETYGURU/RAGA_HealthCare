import React, { useState, useEffect } from 'react';
import { Calendar, Clock, AlertCircle } from 'lucide-react';
import { useAuthStore } from '../store/useAuthStore';
import { appointmentService } from '../services/appointmentService';
import { patientService } from '../services/patientService';
import type { Appointment } from '../types';

const GlowSkeleton = ({ className = '' }: { className?: string }) => (
  <div className={`skeleton-glow ${className}`}></div>
);

const DoctorSchedule: React.FC = () => {
  const { user, role } = useAuthStore();
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (role === 'admin') {
      fetchAllAppointments();
    } else if (role === 'doctor' && user?.uid) {
      fetchAppointments(user.uid);
    }
  }, [user, role]);

  const fetchAllAppointments = async () => {
    try {
      setLoading(true);
      const data = await appointmentService.getAllAppointments();
      setAppointments(data);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch appointments');
    } finally {
      setLoading(false);
    }
  };

  const fetchAppointments = async (uid: string) => {
    try {
      setLoading(true);
      const data = await appointmentService.getAppointmentsForDoctor(uid);
      setAppointments(data);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch appointments');
    } finally {
      setLoading(false);
    }
  };

  const handleStatusUpdate = async (id: string, newStatus: any) => {
    try {
      await appointmentService.updateAppointmentStatus(id, newStatus);
      if (role === 'admin') {
         fetchAllAppointments();
      } else if (user?.uid) {
         fetchAppointments(user.uid);
      }
    } catch (err: any) {
      alert(`Update failed: ${err.message}`);
    }
  };

  const handleReschedule = async (appt: Appointment) => {
    try {
      setLoading(true);
      // Cancel current
      await appointmentService.updateAppointmentStatus(appt.id!, 'Cancelled');
      // Create new auto-assigned
      await appointmentService.scheduleAppointment(appt.patientId, appt.doctorId, undefined, 'Rescheduled standard checkup');
      // Update patient status to reflect rescheduled state
      await patientService.updatePatientStatus(appt.patientId, 'Rescheduled');
      
      if (role === 'admin') {
         fetchAllAppointments();
      } else if (user?.uid) {
         fetchAppointments(user.uid);
      }
    } catch (err: any) {
      alert(`Reschedule failed: ${err.message}`);
      setLoading(false);
    }
  };

  return (
    <div className="p-4 sm:p-6 md:p-8 max-w-5xl mx-auto animate-fade-in-up">
      <div className="mb-6">
        <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-slate-900 to-slate-600 dark:from-white dark:to-slate-400">
           {role === 'admin' ? 'Hospital Schedule' : 'My Schedule'}
        </h1>
        <p className="text-slate-500 dark:text-slate-400 mt-1">
           {role === 'admin' ? 'Monitor all upcoming appointments and schedules' : 'Manage your upcoming appointments and availability'}
        </p>
      </div>

      {error && (
        <div className="mb-6 p-4 rounded-xl bg-rose-50 text-rose-600 flex items-start gap-3 border border-rose-100">
          <AlertCircle size={20} className="shrink-0" />
          <p className="text-sm font-medium">{error}</p>
        </div>
      )}

      <div className="space-y-4">
        {loading ? (
          [...Array(4)].map((_, i) => (
            <div key={i} className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-100 dark:border-slate-800">
              <GlowSkeleton className="h-5 w-40 mb-2" />
              <GlowSkeleton className="h-4 w-60" />
            </div>
          ))
        ) : appointments.length === 0 ? (
          <div className="text-center py-12 text-slate-500 bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800">
            <Calendar size={48} className="mx-auto mb-4 text-slate-300 dark:text-slate-700" />
            <p className="text-lg font-medium">No schedule found</p>
            <p className="text-sm mt-1">You have no upcoming appointments.</p>
          </div>
        ) : (
          appointments.map(appt => {
            const aptDate = new Date(appt.scheduledAt);
            const isPast = aptDate < new Date();
            return (
              <div key={appt.id} className={`bg-white dark:bg-slate-900 rounded-2xl p-5 border border-slate-100 dark:border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-4 transition-all hover:shadow-md ${isPast ? 'opacity-70' : ''}`}>
                <div className="flex flex-col gap-1">
                  <div className="flex items-center gap-2">
                    <h3 className="font-bold text-slate-900 dark:text-white text-lg">
                       {appt.patientName} {role === 'admin' && <span className="text-sm font-normal text-slate-400">with {appt.doctorName}</span>}
                    </h3>
                    <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-widest ${appt.status === 'Scheduled' ? 'bg-blue-100 text-blue-700' : appt.status === 'Completed' ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-700'}`}>
                      {appt.status}
                    </span>
                  </div>
                  <div className="flex items-center gap-4 text-sm text-slate-500 dark:text-slate-400 mt-1">
                    <span className="flex items-center gap-1.5"><Calendar size={14} /> {aptDate.toLocaleDateString()}</span>
                    <span className="flex items-center gap-1.5"><Clock size={14} /> {aptDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} ({appt.duration} min)</span>
                  </div>
                  {appt.notes && <p className="text-sm text-slate-600 dark:text-slate-300 mt-2 bg-slate-50 dark:bg-slate-800 p-2 rounded-lg">{appt.notes}</p>}
                </div>

                {!isPast && appt.status === 'Scheduled' && (
                  <div className="flex gap-2 flex-wrap justify-end">
                    <button onClick={() => handleStatusUpdate(appt.id!, 'Completed')} className="px-4 py-2 bg-emerald-50 text-emerald-600 hover:bg-emerald-100 rounded-xl text-sm font-semibold transition-colors">Mark Completed</button>
                    <button onClick={() => handleReschedule(appt)} className="px-4 py-2 bg-blue-50 text-blue-600 hover:bg-blue-100 dark:bg-blue-900/30 dark:text-blue-400 rounded-xl text-sm font-semibold transition-colors">Auto-Reschedule</button>
                    <button onClick={() => handleStatusUpdate(appt.id!, 'Cancelled')} className="px-4 py-2 bg-slate-50 text-slate-600 hover:bg-slate-100 dark:bg-slate-800 dark:text-slate-400 rounded-xl text-sm font-semibold transition-colors">Cancel</button>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};

export default DoctorSchedule;
