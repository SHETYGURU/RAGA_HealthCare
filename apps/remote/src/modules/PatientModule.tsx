import React, { useState, useEffect } from 'react';
import { LayoutGrid, List, Search, Filter } from 'lucide-react';

// @ts-ignore
import type { Patient } from '../../host/src/types';
// @ts-ignore
import { patientService } from '../../host/src/services/patientService';

const statusConfig: Record<string, { badge: string, dot: string }> = {
  Stable:    { badge: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800', dot: 'bg-emerald-500' },
  Critical:  { badge: 'bg-rose-100 text-rose-700 dark:bg-rose-900/40 dark:text-rose-400 border-rose-200 dark:border-rose-800', dot: 'bg-rose-500 animate-pulse' },
  Discharged:{ badge: 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400 border-slate-200 dark:border-slate-700', dot: 'bg-slate-400' },
  Pending:   { badge: 'bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-400 border-amber-200 dark:border-amber-800', dot: 'bg-amber-500' },
  Assigned:  { badge: 'bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-400 border-blue-200 dark:border-blue-800', dot: 'bg-blue-500' },
  Rescheduled:{ badge: 'bg-purple-100 text-purple-700 dark:bg-purple-900/40 dark:text-purple-400 border-purple-200 dark:border-purple-800', dot: 'bg-purple-500' },
};

const GlowSkeleton = ({ className = '' }: { className?: string }) => (
  <div className={`skeleton-glow ${className}`}></div>
);

const PatientModule: React.FC = () => {
  const [view, setView] = useState<'grid' | 'list'>('grid');
  const [loading, setLoading] = useState(true);
  const [patients, setPatients] = useState<Patient[]>([]);
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('All');

  useEffect(() => {
    const fetchPatients = async () => {
      try {
        const data = await patientService.getPatients();
        setPatients(data);
      } catch (err) {
        console.error("Failed to fetch patients", err);
      } finally {
        setLoading(false);
      }
    };
    fetchPatients();
  }, []);

  const filtered = patients.filter(p => {
    const matchSearch = p.name.toLowerCase().includes(search.toLowerCase()) || (p.id && p.id.toLowerCase().includes(search.toLowerCase())) || p.condition.toLowerCase().includes(search.toLowerCase());
    const matchStatus = filterStatus === 'All' || p.status === filterStatus;
    return matchSearch && matchStatus;
  });

  return (
    <div className="p-4 sm:p-6 md:p-8 max-w-7xl mx-auto animate-fade-in-up">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-6 gap-4">
        <div>
          <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-slate-900 to-slate-600 dark:from-white dark:to-slate-400">Patient Directory</h1>
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
              placeholder="Search patients..."
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
              <option>All</option>
              <option>Stable</option>
              <option>Critical</option>
              <option>Discharged</option>
            </select>
          </div>

          {/* Toggle */}
          <div className="flex bg-slate-100 dark:bg-slate-800 p-1 rounded-xl border border-slate-200 dark:border-slate-700">
            {(['grid', 'list'] as const).map((v) => (
              <button key={v} onClick={() => setView(v)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${view === v ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm' : 'text-slate-500 dark:text-slate-400 hover:text-slate-700'}`}
              >
                {v === 'grid' ? <LayoutGrid size={15} /> : <List size={15} />}
                {v.charAt(0).toUpperCase() + v.slice(1)}
              </button>
            ))}
          </div>
        </div>
      </div>

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
            : filtered.map((patient) => {
                const sc = statusConfig[patient.status];
                return (
                  <div key={patient.id} className="bg-white dark:bg-slate-900 rounded-2xl p-5 shadow-[0_2px_10px_-3px_rgba(6,81,237,0.08)] border border-slate-100 dark:border-slate-800 hover:shadow-lg hover:-translate-y-0.5 transition-all group cursor-pointer">
                    <div className="flex justify-between items-start mb-3">
                      <div>
                        <h3 className="font-bold text-slate-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">{patient.name}</h3>
                        <p className="text-xs text-slate-400 dark:text-slate-500 mt-0.5 font-mono">{patient.id}</p>
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
                        <span className="font-semibold text-slate-700 dark:text-slate-300 text-right">{patient.doctor}</span>
                      </div>
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
                    {['Patient', 'ID', 'Age', 'Ward', 'Condition', 'Doctor', 'Admitted', 'Status'].map((h) => (
                      <th key={h} className="px-5 py-3.5 text-left text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider whitespace-nowrap">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50 dark:divide-slate-800">
                  {filtered.map((patient) => {
                    const sc = statusConfig[patient.status];
                    return (
                      <tr key={patient.id} className="hover:bg-slate-50/60 dark:hover:bg-slate-800/40 transition-colors group">
                        <td className="px-5 py-4">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-blue-500 to-indigo-500 flex items-center justify-center text-white text-xs font-bold shrink-0">
                              {patient.name.split(' ').map((n: string) => n[0]).join('')}
                            </div>
                            <span className="font-semibold text-slate-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">{patient.name}</span>
                          </div>
                        </td>
                        <td className="px-5 py-4 font-mono text-slate-500 dark:text-slate-400 text-xs">{patient.id}</td>
                        <td className="px-5 py-4 text-slate-600 dark:text-slate-300">{patient.age}</td>
                        <td className="px-5 py-4 text-slate-600 dark:text-slate-300 whitespace-nowrap">{patient.ward}</td>
                        <td className="px-5 py-4 text-slate-600 dark:text-slate-300 whitespace-nowrap">{patient.condition}</td>
                        <td className="px-5 py-4 text-slate-600 dark:text-slate-300 whitespace-nowrap">{patient.doctor}</td>
                        <td className="px-5 py-4 text-slate-500 dark:text-slate-400 whitespace-nowrap">{new Date(patient.admittedAt).toLocaleDateString()}</td>
                        <td className="px-5 py-4">
                          <span className={`flex items-center gap-1.5 w-fit px-2.5 py-1 rounded-full text-xs font-semibold border ${sc.badge}`}>
                            <span className={`w-1.5 h-1.5 rounded-full ${sc.dot}`}></span>
                            {patient.status}
                          </span>
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
    </div>
  );
};

export default PatientModule;
