import React, { useState, useEffect } from 'react';
import { LayoutGrid, List, Search, Filter, Download, Plus, Edit, Eye, X, TrendingUp } from 'lucide-react';
import type { Patient, PatientStatus, Doctor } from '../types';
import { patientService } from '../services/patientService';
import { doctorService } from '../services/doctorService';
import { appointmentService } from '../services/appointmentService';
import { generatePatientPDF } from '../utils/generatePatientPDF';
import { useAuthStore } from '../store/useAuthStore';
import { useTranslation } from '../hooks/useTranslation';

const statusConfig: Record<string, { badge: string, dot: string }> = {
  Stable:    { badge: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800', dot: 'bg-emerald-500' },
  Critical:  { badge: 'bg-rose-100 text-rose-700 dark:bg-rose-900/40 dark:text-rose-400 border-rose-200 dark:border-rose-800', dot: 'bg-rose-500 animate-pulse' },
  Discharged:{ badge: 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400 border-slate-200 dark:border-slate-700', dot: 'bg-slate-400' },
  Pending:   { badge: 'bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-400 border-amber-200 dark:border-amber-800', dot: 'bg-amber-500' },
  Assigned:  { badge: 'bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-400 border-blue-200 dark:border-blue-800', dot: 'bg-blue-500' },
  Rescheduled:{ badge: 'bg-purple-100 text-purple-700 dark:bg-purple-900/40 dark:text-purple-400 border-purple-200 dark:border-purple-800', dot: 'bg-purple-500' },
  Cancelled: { badge: 'bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-400 border-red-200 dark:border-red-800', dot: 'bg-red-500' },
};

const GlowSkeleton = ({ className = '' }: { className?: string }) => (
  <div className={`skeleton-glow ${className}`}></div>
);

const PatientForm = ({ initialData, onSave, onCancel }: { initialData?: Partial<Patient>, onSave: (data: any) => Promise<void>, onCancel: () => void }) => {
  const [formData, setFormData] = useState({
    name: initialData?.name || '',
    age: initialData?.age || '',
    sex: initialData?.sex || 'Male',
    dob: initialData?.dob || '',
    email: initialData?.email || '',
    phone: initialData?.phone || '',
    address: initialData?.address || '',
    maritalStatus: initialData?.maritalStatus || 'Single',
    emergencyContact1Name: initialData?.emergencyContact1Name || '',
    emergencyContact1Phone: initialData?.emergencyContact1Phone || '',
    primaryCarePhysician: initialData?.primaryCarePhysician || '',
    condition: initialData?.condition || '',
    ward: initialData?.ward || 'General',
    status: initialData?.status || 'Pending'
  });
  const [loadingForm, setLoadingForm] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoadingForm(true);
    try {
      await onSave({ ...formData, age: Number(formData.age) });
    } finally {
      setLoadingForm(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 max-h-[60vh] overflow-y-auto pr-2">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm text-slate-800 dark:text-slate-200">
        <div><label className="text-xs font-semibold text-slate-500 mb-1 block">Full Name</label><input required name="name" value={formData.name} onChange={handleChange} className="w-full border border-slate-200 dark:border-slate-700 rounded-xl p-2.5 dark:bg-slate-800 outline-none focus:border-blue-500" /></div>
        <div><label className="text-xs font-semibold text-slate-500 mb-1 block">Age</label><input required type="number" name="age" value={formData.age} onChange={handleChange} className="w-full border border-slate-200 dark:border-slate-700 rounded-xl p-2.5 dark:bg-slate-800 outline-none focus:border-blue-500" /></div>
        <div><label className="text-xs font-semibold text-slate-500 mb-1 block">Sex</label><select name="sex" value={formData.sex} onChange={handleChange} className="w-full border border-slate-200 dark:border-slate-700 rounded-xl p-2.5 dark:bg-slate-800 outline-none focus:border-blue-500"><option>Male</option><option>Female</option></select></div>
        <div><label className="text-xs font-semibold text-slate-500 mb-1 block">DOB</label><input type="date" required name="dob" value={formData.dob} onChange={handleChange} className="w-full border border-slate-200 dark:border-slate-700 rounded-xl p-2.5 dark:bg-slate-800 outline-none focus:border-blue-500" /></div>
        <div><label className="text-xs font-semibold text-slate-500 mb-1 block">Email</label><input type="email" required name="email" value={formData.email} onChange={handleChange} className="w-full border border-slate-200 dark:border-slate-700 rounded-xl p-2.5 dark:bg-slate-800 outline-none focus:border-blue-500" /></div>
        <div><label className="text-xs font-semibold text-slate-500 mb-1 block">Phone</label><input required name="phone" value={formData.phone} onChange={handleChange} className="w-full border border-slate-200 dark:border-slate-700 rounded-xl p-2.5 dark:bg-slate-800 outline-none focus:border-blue-500" /></div>
        <div className="sm:col-span-2"><label className="text-xs font-semibold text-slate-500 mb-1 block">Address</label><input required name="address" value={formData.address} onChange={handleChange} className="w-full border border-slate-200 dark:border-slate-700 rounded-xl p-2.5 dark:bg-slate-800 outline-none focus:border-blue-500" /></div>
        <div><label className="text-xs font-semibold text-slate-500 mb-1 block">Marital Status</label><select name="maritalStatus" value={formData.maritalStatus} onChange={handleChange} className="w-full border border-slate-200 dark:border-slate-700 rounded-xl p-2.5 dark:bg-slate-800 outline-none focus:border-blue-500"><option>Single</option><option>Married</option><option>Divorced</option><option>Widowed</option></select></div>
        <div><label className="text-xs font-semibold text-slate-500 mb-1 block">Status</label><select name="status" value={formData.status} onChange={handleChange} className="w-full border border-slate-200 dark:border-slate-700 rounded-xl p-2.5 dark:bg-slate-800 outline-none focus:border-blue-500"><option>Pending</option><option>Assigned</option><option>Stable</option><option>Critical</option><option>Discharged</option></select></div>
        <div><label className="text-xs font-semibold text-slate-500 mb-1 block">Emergency Contact Name</label><input name="emergencyContact1Name" value={formData.emergencyContact1Name} onChange={handleChange} className="w-full border border-slate-200 dark:border-slate-700 rounded-xl p-2.5 dark:bg-slate-800 outline-none focus:border-blue-500" /></div>
        <div><label className="text-xs font-semibold text-slate-500 mb-1 block">Emergency Contact Phone</label><input name="emergencyContact1Phone" value={formData.emergencyContact1Phone} onChange={handleChange} className="w-full border border-slate-200 dark:border-slate-700 rounded-xl p-2.5 dark:bg-slate-800 outline-none focus:border-blue-500" /></div>
        <div><label className="text-xs font-semibold text-slate-500 mb-1 block">Prev Doctor</label><input name="primaryCarePhysician" value={formData.primaryCarePhysician} onChange={handleChange} className="w-full border border-slate-200 dark:border-slate-700 rounded-xl p-2.5 dark:bg-slate-800 outline-none focus:border-blue-500" /></div>
        <div><label className="text-xs font-semibold text-slate-500 mb-1 block">Ward</label><input required name="ward" value={formData.ward} onChange={handleChange} className="w-full border border-slate-200 dark:border-slate-700 rounded-xl p-2.5 dark:bg-slate-800 outline-none focus:border-blue-500" /></div>
        <div className="sm:col-span-2"><label className="text-xs font-semibold text-slate-500 mb-1 block">Condition</label><input required name="condition" value={formData.condition} onChange={handleChange} className="w-full border border-slate-200 dark:border-slate-700 rounded-xl p-2.5 dark:bg-slate-800 outline-none focus:border-blue-500" /></div>
      </div>
      <div className="flex justify-end gap-3 mt-6 pt-4 border-t border-slate-100 dark:border-slate-800">
        <button type="button" onClick={onCancel} className="px-4 py-2 font-medium text-slate-600 dark:text-slate-400 hover:text-slate-900 transition-colors">Cancel</button>
        <button type="submit" disabled={loadingForm} className="px-4 py-2 font-medium bg-blue-600 hover:bg-blue-700 text-white rounded-xl shadow-sm disabled:opacity-50 transition-colors">
          {loadingForm ? 'Saving...' : 'Save Patient'}
        </button>
      </div>
    </form>
  );
};

const PatientModule: React.FC = () => {
  const { t, language } = useTranslation();
  const { role, user } = useAuthStore();
  const [view, setView] = useState<'grid' | 'list'>('grid');
  const [loading, setLoading] = useState(true);
  const [patients, setPatients] = useState<Patient[]>([]);
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('All');
  const [sortBy, setSortBy] = useState<'name' | 'age' | 'admittedAt'>('admittedAt');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);
  const [editMode, setEditMode] = useState(false);
  const [fetchError, setFetchError] = useState('');
  const [pdfPreviewUrl, setPdfPreviewUrl] = useState<string | null>(null);
  const [pdfPreviewPatient, setPdfPreviewPatient] = useState<Patient | null>(null);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [batchActionLoading, setBatchActionLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const PAGE_SIZE = 12;

  const toggleSelection = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    setSelectedIds(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);
  };

  const toggleAll = () => {
    if (selectedIds.length === filtered.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(filtered.map(p => p.id!).filter(Boolean));
    }
  };

  const handleBatchStatusUpdate = async (newStatus: PatientStatus) => {
    if (!window.confirm(`Update status to "${newStatus}" for ${selectedIds.length} patients?`)) return;
    setBatchActionLoading(true);
    try {
      await Promise.all(selectedIds.map(id => patientService.updatePatientStatus(id, newStatus)));
      setPatients(prev => prev.map(p => selectedIds.includes(p.id!) ? { ...p, status: newStatus } : p));
      setSelectedIds([]);
      alert('Batch update successful!');
    } catch (err) {
      console.error(err);
      alert('Failed to update some patients.');
    } finally {
      setBatchActionLoading(false);
    }
  };

  const fetchPatients = async () => {
    try {
      setLoading(true);
      setFetchError('');
      const [pData, dData] = await Promise.all([
        role === 'doctor' && user?.uid ? patientService.getPatientsByDoctor(user.uid) : patientService.getPatients(),
        role === 'admin' ? doctorService.getDoctors() : Promise.resolve([])
      ]);
      setPatients(pData);
      if (role === 'admin') setDoctors(dData);
    } catch (err: any) {
      console.error("Failed to fetch data", err);
      setFetchError(err?.message || 'Failed to load patients. Check console for details.');
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (patientId: string, newStatus: PatientStatus) => {
    try {
      await patientService.updatePatientStatus(patientId, newStatus);
      setPatients(prev => prev.map(p => p.id === patientId ? { ...p, status: newStatus } : p));
      if (selectedPatient && selectedPatient.id === patientId) {
          setSelectedPatient({...selectedPatient, status: newStatus});
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleAssignDoctor = async (patientId: string, doctorId: string) => {
    try {
      setLoading(true);
      await appointmentService.scheduleAppointment(patientId, doctorId, undefined, 'General Checkup');
      const updatedP = await patientService.getPatients();
      setPatients(updatedP);
      if (selectedPatient && selectedPatient.id === patientId) {
          setSelectedPatient(updatedP.find((p: any) => p.id === patientId) || null);
      }
    } catch (err: any) {
      alert(`Assignment failed: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (role !== null) {
      fetchPatients();
    }
  }, [role]);

  // Reset pagination when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [search, filterStatus, sortBy, sortOrder]);

  const filtered = patients
    .filter(p => {
      const matchSearch = p.name.toLowerCase().includes(search.toLowerCase()) || (p.id && p.id.toLowerCase().includes(search.toLowerCase())) || p.condition.toLowerCase().includes(search.toLowerCase());
      const matchStatus = filterStatus === 'All' || p.status === filterStatus;
      return matchSearch && matchStatus;
    })
    .sort((a, b) => {
      let comparison = 0;
      if (sortBy === 'name') comparison = a.name.localeCompare(b.name);
      else if (sortBy === 'age') comparison = a.age - b.age;
      else if (sortBy === 'admittedAt') comparison = new Date(a.admittedAt).getTime() - new Date(b.admittedAt).getTime();
      
      return sortOrder === 'asc' ? comparison : -comparison;
    });

  const paginated = filtered.slice(0, currentPage * PAGE_SIZE);
  const hasMore = paginated.length < filtered.length;

  return (
    <>
      <div className="p-4 sm:p-6 md:p-8 max-w-7xl mx-auto animate-fade-in-up">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-6 gap-4">
        <div>
          <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-slate-900 to-slate-600 dark:from-white dark:to-slate-400">{t('patients.title')}</h1>
          <p className="text-slate-500 dark:text-slate-400 mt-1">
            {loading ? 'Loading...' : `Showing ${filtered.length} of ${patients.length} patients`}
          </p>
        </div>

        <div className="flex items-center gap-3 flex-wrap">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
            <input
              value={search} onChange={(e) => setSearch(e.target.value)}
              placeholder={t('patients.search')}
              className="pl-9 pr-4 py-2 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400/30 dark:text-slate-200 placeholder:text-slate-400 w-44 sm:w-56"
            />
          </div>

          {/* Filter */}
          <div className="relative flex items-center gap-1.5">
            <Filter size={15} className="text-slate-400" />
            <select
              value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)}
              className="pl-2 pr-7 py-2 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-sm focus:outline-none dark:text-slate-200 appearance-none cursor-pointer"
            >
              <option value="All">{t('patients.status.all')}</option>
              {Object.keys(statusConfig).map(st => <option key={st} value={st}>{st}</option>)}
            </select>
          </div>

          {/* Sort */}
          <div className="relative flex items-center gap-1.5">
            <select
              value={sortBy} onChange={(e) => setSortBy(e.target.value as any)}
              className="pl-3 pr-8 py-2 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-sm focus:outline-none dark:text-slate-200 appearance-none cursor-pointer"
            >
              <option value="admittedAt">Sort by Date</option>
              <option value="name">Sort by Name</option>
              <option value="age">Sort by Age</option>
            </select>
            <button 
              onClick={() => setSortOrder(prev => prev === 'asc' ? 'desc' : 'asc')}
              className="p-2 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-500 hover:text-blue-600 transition-colors"
            >
              <TrendingUp size={15} className={sortOrder === 'asc' ? 'rotate-180 transition-transform' : 'transition-transform'} />
            </button>
          </div>

          {/* Toggle */}
          <div className="flex bg-slate-100 dark:bg-slate-800 p-1 rounded-xl border border-slate-200 dark:border-slate-700">
            {(['grid', 'list'] as const).map((v) => (
              <button key={v} onClick={() => setView(v)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${view === v ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm' : 'text-slate-500 dark:text-slate-400 hover:text-slate-700'}`}
              >
                {v === 'grid' ? <LayoutGrid size={15} /> : <List size={15} />}
              </button>
            ))}
          </div>

          {role === 'admin' && (
            <button onClick={() => setShowAddModal(true)} className="flex items-center gap-2 px-4 py-2 text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-xl shadow-sm transition-all ml-2">
              <Plus size={16} /> {t('patients.add')}
            </button>
          )}
        </div>
      </div>

      {/* Batch Action Toolbar */}
      {selectedIds.length > 0 && (
        <div className="mb-6 p-4 bg-blue-600 text-white rounded-2xl shadow-lg flex flex-col sm:flex-row items-center justify-between gap-4 animate-in slide-in-from-top-4 duration-300">
          <div className="flex items-center gap-3">
            <div className="bg-white/20 p-2 rounded-xl">
              <TrendingUp size={18} />
            </div>
            <div>
              <p className="font-bold">{selectedIds.length} Patients Selected</p>
              <p className="text-xs text-blue-100">Apply batch updates to these records</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <select 
              disabled={batchActionLoading}
              onChange={(e) => handleBatchStatusUpdate(e.target.value as PatientStatus)}
              className="bg-white/10 border border-white/20 rounded-xl px-3 py-1.5 text-sm font-semibold outline-none focus:bg-white/20 transition-all cursor-pointer"
              value=""
            >
              <option value="" disabled className="text-slate-900">Batch Update Status...</option>
              {Object.keys(statusConfig).map(st => <option key={st} value={st} className="text-slate-900">{st}</option>)}
            </select>
            <button 
              onClick={() => setSelectedIds([])}
              className="p-1.5 hover:bg-white/10 rounded-lg transition-colors"
            >
              <X size={18} />
            </button>
          </div>
        </div>
      )}

      {/* Error Banner */}
      {fetchError && (
        <div className="mb-4 p-4 rounded-xl bg-rose-50 dark:bg-rose-900/20 border border-rose-200 dark:border-rose-800 text-rose-700 dark:text-rose-400 text-sm flex items-start gap-3">
          <span className="font-semibold shrink-0">⚠ Error:</span>
          <span>{fetchError}</span>
          <button onClick={fetchPatients} className="ml-auto shrink-0 underline font-medium">Retry</button>
        </div>
      )}

      {/* Grid View */}
      {view === 'grid' && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-5 stagger-children">
          {loading
            ? [...Array(8)].map((_, i) => (
                <div key={i} className="bg-white dark:bg-slate-900 rounded-2xl p-5 border border-slate-100 dark:border-slate-800 space-y-3">
                  <div className="flex justify-between"><GlowSkeleton className="h-5 w-28" /><GlowSkeleton className="h-6 w-20 !rounded-full" /></div>
                  <GlowSkeleton className="h-3 w-16" />
                  <div className="space-y-2 mt-2"><GlowSkeleton className="h-3 w-full" /><GlowSkeleton className="h-3 w-3/4" /><GlowSkeleton className="h-3 w-5/6" /></div>
                </div>
              ))
            : paginated.map((patient) => {
                const sc = statusConfig[patient.status];
                return (
                  <div key={patient.id} onClick={() => setSelectedPatient(patient)} className="bg-white dark:bg-slate-900 rounded-2xl p-5 shadow-[0_2px_10px_-3px_rgba(6,81,237,0.08)] border border-slate-100 dark:border-slate-800 hover:shadow-lg hover:-translate-y-0.5 transition-all group cursor-pointer">
                    <div className="flex justify-between items-start mb-3">
                      <div className="flex gap-3">
                        <button 
                          onClick={(e) => toggleSelection(e, patient.id!)}
                          className={`mt-0.5 w-5 h-5 rounded border flex items-center justify-center transition-all ${selectedIds.includes(patient.id!) ? 'bg-blue-600 border-blue-600 text-white' : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800'}`}
                        >
                          {selectedIds.includes(patient.id!) && <span className="text-[10px] font-bold">✓</span>}
                        </button>
                        <div>
                          <h3 className="font-bold text-slate-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">{patient.name}</h3>
                          <p className="text-xs text-slate-400 dark:text-slate-500 mt-0.5 font-mono">{patient.id}</p>
                        </div>
                      </div>
                      <span className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border ${sc.badge}`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${sc.dot}`}></span>
                        {patient.status}
                      </span>
                    </div>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between py-1.5 border-t border-slate-50 dark:border-slate-800">
                        <span className="text-slate-400 dark:text-slate-500">Age</span>
                        <span className="font-semibold text-slate-700 dark:text-slate-300">{patient.age} yrs</span>
                      </div>
                      <div className="flex justify-between py-1.5 border-t border-slate-50 dark:border-slate-800">
                        <span className="text-slate-400 dark:text-slate-500">Ward</span>
                        <span className="font-semibold text-slate-700 dark:text-slate-300">{patient.ward}</span>
                      </div>
                      <div className="flex justify-between py-1.5 border-t border-slate-50 dark:border-slate-800">
                        <span className="text-slate-400 dark:text-slate-500">Condition</span>
                        <span className="font-semibold text-slate-700 dark:text-slate-300 text-right">{patient.condition}</span>
                      </div>
                      <div className="flex justify-between py-1.5 border-t border-slate-50 dark:border-slate-800">
                        <span className="text-slate-400 dark:text-slate-500">Doctor</span>
                        <span className="font-semibold text-slate-700 dark:text-slate-300 text-right">{patient.assignedDoctorName || 'Unassigned'}</span>
                      </div>
                    </div>
                    <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 flex justify-end gap-2">
                      <button onClick={(e) => { e.stopPropagation(); generatePatientPDF(patient); }} className="p-2 text-slate-400 hover:text-blue-500 hover:bg-blue-50 dark:hover:bg-slate-800 rounded-lg transition-colors" title="Download Form">
                        <Download size={16} />
                      </button>
                      {role === 'admin' && (
                        <button onClick={(e) => { e.stopPropagation(); setSelectedPatient(patient); }} className="p-2 text-slate-400 hover:text-emerald-500 hover:bg-emerald-50 dark:hover:bg-slate-800 rounded-lg transition-colors relative" title="Edit/Assign">
                          <Edit size={16} />
                        </button>
                      )}
                    </div>
                  </div>
                );
              })
          }
        </div>
      )}

      {/* List View */}
      {view === 'list' && (
        <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-[0_2px_10px_-3px_rgba(6,81,237,0.08)] border border-slate-100 dark:border-slate-800 overflow-hidden animate-fade-in-scale">
          {loading ? (
            <div className="p-6 space-y-3">
              {[...Array(6)].map((_, i) => <GlowSkeleton key={i} className="h-14 w-full !rounded-xl" />)}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-slate-50/80 dark:bg-slate-800/50 border-b border-slate-100 dark:border-slate-700">
                    <th className="px-5 py-3.5 text-left">
                      <button onClick={toggleAll} className={`w-5 h-5 rounded border flex items-center justify-center transition-all ${selectedIds.length === filtered.length && filtered.length > 0 ? 'bg-blue-600 border-blue-600 text-white' : 'border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800'}`}>
                        {selectedIds.length === filtered.length && filtered.length > 0 && <span className="text-[10px] font-bold">✓</span>}
                      </button>
                    </th>
                    {['Patient', 'ID', 'Age', 'Ward', 'Condition', 'Doctor', 'Admitted', 'Status'].map((h) => (
                      <th key={h} className="px-5 py-3.5 text-left text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider whitespace-nowrap">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50 dark:divide-slate-800">
                  {paginated.map((patient) => {
                    const sc = statusConfig[patient.status];
                    return (
                      <tr key={patient.id} onClick={() => setSelectedPatient(patient)} className={`hover:bg-slate-50/60 dark:hover:bg-slate-800/40 transition-colors group cursor-pointer ${selectedIds.includes(patient.id!) ? 'bg-blue-50/50 dark:bg-blue-900/10' : ''}`}>
                        <td className="px-5 py-4">
                           <button 
                             onClick={(e) => toggleSelection(e, patient.id!)}
                             className={`w-5 h-5 rounded border flex items-center justify-center transition-all ${selectedIds.includes(patient.id!) ? 'bg-blue-600 border-blue-600 text-white' : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800'}`}
                           >
                             {selectedIds.includes(patient.id!) && <span className="text-[10px] font-bold">✓</span>}
                           </button>
                        </td>
                        <td className="px-5 py-4">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-blue-500 to-indigo-500 flex items-center justify-center text-white text-xs font-bold shrink-0">
                              {patient.name.split(' ').map(n => n[0]).join('')}
                            </div>
                            <span className="font-semibold text-slate-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">{patient.name}</span>
                          </div>
                        </td>
                        <td className="px-5 py-4 font-mono text-slate-500 dark:text-slate-400 text-xs">{patient.id}</td>
                        <td className="px-5 py-4 text-slate-600 dark:text-slate-300">{patient.age}</td>
                        <td className="px-5 py-4 text-slate-600 dark:text-slate-300 whitespace-nowrap">{patient.ward}</td>
                        <td className="px-5 py-4 text-slate-600 dark:text-slate-300 whitespace-nowrap">{patient.condition}</td>
                        <td className="px-5 py-4 text-slate-600 dark:text-slate-300 whitespace-nowrap">{patient.assignedDoctorName || 'Unassigned'}</td>
                        <td className="px-5 py-4 text-slate-500 dark:text-slate-400 whitespace-nowrap">{new Date(patient.admittedAt).toLocaleDateString()}</td>
                        <td className="px-5 py-4 flex gap-2">
                          <span className={`flex items-center gap-1.5 w-fit px-2.5 py-1 rounded-full text-xs font-semibold border ${sc.badge}`}>
                            <span className={`w-1.5 h-1.5 rounded-full ${sc.dot}`}></span>
                            {patient.status}
                          </span>
                          <button onClick={(e) => { e.stopPropagation(); generatePatientPDF(patient); }} className="opacity-0 group-hover:opacity-100 p-1 text-slate-400 hover:text-blue-500 transition-all">
                            <Download size={16} />
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
              {filtered.length === 0 && (
                <div className="py-16 text-center text-slate-400 dark:text-slate-500">
                  <p className="text-lg font-medium">No patients found</p>
                  <p className="text-sm mt-1">Try adjusting your search or filter</p>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* Load More Button */}
      {hasMore && (
        <div className="mt-8 flex justify-center">
          <button 
            onClick={() => setCurrentPage(prev => prev + 1)}
            className="px-8 py-2.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl font-semibold text-blue-600 dark:text-blue-400 hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-all shadow-sm flex items-center gap-2 group"
          >
            <span>Load More Patients</span>
            <TrendingUp size={16} className="group-hover:translate-y-1 transition-transform rotate-180" />
          </button>
        </div>
      )}
      </div>

      {/* Add Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm animate-in fade-in" onClick={() => setShowAddModal(false)}>
          <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl w-full max-w-2xl shadow-xl animate-in zoom-in-95" onClick={(e) => e.stopPropagation()}>
            <h2 className="text-xl font-bold mb-4 dark:text-white">Add New Patient</h2>
            <p className="text-slate-500 dark:text-slate-400 mb-6 text-sm">Fill in the primary details to register a patient.</p>
            <PatientForm 
              onCancel={() => setShowAddModal(false)}
              onSave={async (data) => {
                 await patientService.addPatient({...data, admittedAt: new Date().toISOString()});
                 await fetchPatients();
                 setShowAddModal(false);
              }}
            />
          </div>
        </div>
      )}

      {/* Patient Detail Modal */}
      {selectedPatient && (
        <div className="fixed inset-0 z-[60] flex flex-col justify-center items-center bg-slate-900/50 backdrop-blur-sm p-4 sm:p-6 animate-in fade-in zoom-in-95" onClick={() => { setSelectedPatient(null); setEditMode(false); }}>
          <div className="bg-white dark:bg-slate-900 w-full max-w-2xl rounded-2xl shadow-xl flex flex-col max-h-[90vh] overflow-hidden" onClick={e => e.stopPropagation()}>
            <div className="p-5 sm:p-6 border-b border-slate-100 dark:border-slate-800 flex justify-between items-start">
              <div>
                <h2 className="text-2xl font-bold text-slate-800 dark:text-white flex items-center gap-3">
                  {selectedPatient.name}
                  {!editMode && (
                      <span className={`px-2.5 py-1 text-xs font-semibold rounded-full border ${statusConfig[selectedPatient.status].badge}`}>
                        {selectedPatient.status}
                      </span>
                  )}
                </h2>
                <p className="text-sm text-slate-500 dark:text-slate-400 mt-1 font-mono text-xs">{selectedPatient.id}</p>
              </div>
              <div className="flex gap-2">
                  {role === 'admin' && !editMode && (
                     <button onClick={() => setEditMode(true)} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-50 text-emerald-600 hover:bg-emerald-100 dark:bg-slate-800 dark:text-emerald-400 transition-colors text-sm font-semibold">
                         <Edit size={14} /> Edit
                     </button>
                  )}
                  <button onClick={() => { setSelectedPatient(null); setEditMode(false); }} className="w-8 h-8 flex items-center justify-center rounded-full bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 hover:bg-slate-200 hover:text-slate-800 dark:hover:bg-slate-700 transition-colors">
                     ✕ 
                  </button>
              </div>
            </div>
            
            {editMode ? (
                <div className="p-5 sm:p-6 flex-1 overflow-y-auto">
                   <PatientForm 
                     initialData={selectedPatient}
                     onCancel={() => setEditMode(false)}
                     onSave={async (data) => {
                         await patientService.updatePatient(selectedPatient.id!, data);
                         await fetchPatients();
                         setSelectedPatient({...selectedPatient, ...data});
                         setEditMode(false);
                     }}
                   />
                </div>
            ) : (
              <>
                <div className="p-5 sm:p-6 overflow-y-auto space-y-6 flex-1">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-4 text-sm text-slate-800 dark:text-slate-200">
                     <div><span className="block text-xs font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-1">Age</span> {selectedPatient.age} </div>
                     <div><span className="block text-xs font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-1">Sex</span> {selectedPatient.sex} </div>
                     <div><span className="block text-xs font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-1">DOB</span> {selectedPatient.dob} </div>
                     <div><span className="block text-xs font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-1">Email</span> {selectedPatient.email} </div>
                     <div><span className="block text-xs font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-1">Phone</span> {selectedPatient.phone} </div>
                     <div><span className="block text-xs font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-1">Marital Status</span> {selectedPatient.maritalStatus} </div>
                     <div className="sm:col-span-2"><span className="block text-xs font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-1">Address</span> {selectedPatient.address} </div>
                     
                     <div className="col-span-1 pt-3 border-t border-slate-100 dark:border-slate-800"><span className="block text-xs font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-1">Emergency Contact</span> {selectedPatient.emergencyContact1Name} ({selectedPatient.emergencyContact1Phone}) </div>
                     <div className="col-span-1 pt-3 border-t border-slate-100 dark:border-slate-800"><span className="block text-xs font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-1">Prev Doctor</span> {selectedPatient.primaryCarePhysician} </div>
                     <div className="col-span-1 pt-3 border-t border-slate-100 dark:border-slate-800"><span className="block text-xs font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-1">Condition</span> <span className="font-medium text-rose-600 dark:text-rose-400">{selectedPatient.condition}</span> </div>
                     <div className="col-span-1 pt-3 border-t border-slate-100 dark:border-slate-800"><span className="block text-xs font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-1">Assigned Ward</span> <span className="font-medium text-blue-600 dark:text-blue-400">{selectedPatient.ward}</span> </div>
                  </div>

                  {(role === 'admin' || role === 'doctor') && (
                     <div className="bg-slate-50 dark:bg-slate-800/40 p-4 rounded-xl border border-slate-100 dark:border-slate-700/50 mt-4">
                        <h3 className="font-semibold text-sm text-slate-800 dark:text-slate-300 mb-4 flex items-center gap-2"><Edit size={16} /> {t('patients.management_actions')}</h3>
                        
                        <div className="flex flex-col sm:flex-row gap-4">
                           <div className="flex-1">
                               <label className="text-xs font-semibold text-slate-500 mb-1.5 block">{t('patients.update_status')}</label>
                               <select 
                                 value={selectedPatient.status} 
                                 onChange={(e) => handleStatusChange(selectedPatient.id!, e.target.value as PatientStatus)} 
                                 className="w-full border border-slate-300 dark:border-slate-600 rounded-lg p-2.5 text-sm dark:bg-slate-800 dark:text-slate-200 outline-none focus:border-blue-500 transition-colors"
                               >
                                   {Object.keys(statusConfig).map(st => <option key={st} value={st}>{st}</option>)}
                               </select>
                           </div>
                           {role === 'admin' && (
                           <div className="flex-1">
                               <label className="text-xs font-semibold text-slate-500 mb-1.5 block">{t('patients.assign_doctor')}</label>
                               <select 
                                 value={selectedPatient.assignedDoctorId || ''} 
                                 onChange={(e) => handleAssignDoctor(selectedPatient.id!, e.target.value)} 
                                 className="w-full border border-slate-300 dark:border-slate-600 rounded-lg p-2.5 text-sm dark:bg-slate-800 dark:text-slate-200 outline-none focus:border-blue-500 transition-colors"
                               >
                                   <option value="" disabled>Select Doctor...</option>
                                   {doctors.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
                               </select>
                           </div>
                           )}
                        </div>
                     </div>
                  )}
                </div>

                <div className="p-4 sm:p-5 border-t border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/10 flex justify-end gap-3 rounded-b-2xl">
                    <button 
                      onClick={async () => {
                        const url = await generatePatientPDF(selectedPatient, true);
                        if (url) {
                          setPdfPreviewUrl(url as string);
                          setPdfPreviewPatient(selectedPatient);
                        }
                      }}
                      className="px-5 py-2.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600 text-slate-700 dark:text-slate-300 rounded-xl font-medium shadow-sm transition-all flex items-center gap-2"
                    >
                      <Eye size={18} /> {language === 'hi' ? 'मेडिकल फॉर्म पूर्वावलोकन (PDF)' : 'Preview Medical Form (PDF)'}
                    </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
      {/* PDF Preview Modal */}
      {pdfPreviewUrl && (
        <div className="fixed inset-0 z-[70] flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4" onClick={() => { URL.revokeObjectURL(pdfPreviewUrl); setPdfPreviewUrl(null); setPdfPreviewPatient(null); }}>
          <div className="bg-white dark:bg-slate-900 w-full max-w-4xl h-[85vh] rounded-2xl shadow-2xl flex flex-col overflow-hidden" onClick={e => e.stopPropagation()}>
            <div className="p-4 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center">
              <h3 className="font-bold text-lg text-slate-800 dark:text-white">PDF Preview — {pdfPreviewPatient?.name}</h3>
              <div className="flex gap-2">
                <button
                  onClick={() => {
                    if (pdfPreviewPatient) generatePatientPDF(pdfPreviewPatient);
                    URL.revokeObjectURL(pdfPreviewUrl);
                    setPdfPreviewUrl(null);
                    setPdfPreviewPatient(null);
                  }}
                  className="px-4 py-2 bg-blue-600 text-white rounded-xl font-medium text-sm flex items-center gap-2 hover:bg-blue-700 transition-colors"
                >
                  <Download size={16} /> Download
                </button>
                <button onClick={() => { URL.revokeObjectURL(pdfPreviewUrl); setPdfPreviewUrl(null); setPdfPreviewPatient(null); }} className="w-8 h-8 flex items-center justify-center rounded-full bg-slate-100 dark:bg-slate-800 text-slate-500 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors">
                  <X size={16} />
                </button>
              </div>
            </div>
            <div className="flex-1 bg-slate-100 dark:bg-slate-800">
              <iframe src={pdfPreviewUrl} className="w-full h-full border-0" title="PDF Preview" />
            </div>
          </div>
        </div>
      )}

    </>
  );
};

export default PatientModule;
