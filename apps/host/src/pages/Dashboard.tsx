import React, { useState, useEffect } from 'react';
import { Users, UserPlus, Activity, HeartPulse, TrendingUp, TrendingDown, Calendar, ArrowRight, Settings, Plus } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/useAuthStore';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';
import { patientService } from '../services/patientService';
import { useTranslation } from '../hooks/useTranslation';

function getMonthShortName(dateString: string) {
  const d = new Date(dateString);
  return d.toLocaleString('en-US', { month: 'short' });
}

const GlowSkeleton = ({ className = '', style }: { className?: string, style?: React.CSSProperties }) => (
  <div className={`skeleton-glow ${className}`} style={style}></div>
);

const StatCardSkeleton = () => (
  <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-800 flex flex-col gap-4">
    <div className="flex justify-between items-start">
      <GlowSkeleton className="h-4 w-24" />
      <GlowSkeleton className="w-12 h-12 !rounded-xl" />
    </div>
    <GlowSkeleton className="h-9 w-20" />
    <GlowSkeleton className="h-3 w-16" />
  </div>
);

const getStatusDot = (status: string) => {
  switch (status) {
    case 'Stable': return 'bg-emerald-500';
    case 'Critical': return 'bg-rose-500 animate-pulse';
    default: return 'bg-slate-400';
  }
};

const Dashboard: React.FC = () => {
  const { t, language } = useTranslation();
  const { role } = useAuthStore();
  const [loading, setLoading] = useState(true);
  const [dashboardStats, setDashboardStats] = useState({ total: 0, newAdm: 0, recovered: 0, active: 0 });
  const [chartData, setChartData] = useState<{name: string, patients: number, admissions: number, discharges: number}[]>([]);
  const [recentPatientsList, setRecentPatientsList] = useState<any[]>([]);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        const patients = await patientService.getPatients();
        
        // Stats
        const total = patients.length;
        const recovered = patients.filter(p => p.status === 'Discharged').length;
        const active = total - recovered;
        
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
        const newAdm = patients.filter(p => p.admittedAt && new Date(p.admittedAt) > thirtyDaysAgo).length;

        setDashboardStats({ total, newAdm, recovered, active });

        // Month formatting chart logic
        const monthMap: Record<string, { patients: number, admissions: number, discharges: number }> = {};
        for (let i = 5; i >= 0; i--) {
          const d = new Date();
          d.setMonth(d.getMonth() - i);
          const mName = d.toLocaleString('en-US', { month: 'short' });
          monthMap[mName] = { patients: 0, admissions: 0, discharges: 0 };
        }

        patients.forEach(p => {
          if (p.admittedAt) {
            const mName = getMonthShortName(p.admittedAt);
            if (monthMap[mName]) {
              monthMap[mName].admissions += 1;
              monthMap[mName].patients += 1; // Running total simplistic approximation
            }
          }
          if (p.status === 'Discharged' && p.updatedAt) {
            const mName = getMonthShortName(p.updatedAt);
            if (monthMap[mName]) {
              monthMap[mName].discharges += 1;
            }
          }
        });

        setChartData(Object.entries(monthMap).map(([name, data]) => ({ name, ...data })));

        // Recent limit 4
        const recent = [...patients].sort((a,b) => new Date(b.createdAt||0).getTime() - new Date(a.createdAt||0).getTime()).slice(0, 4);
        setRecentPatientsList(recent.map(p => ({
          id: p.id?.substring(0, 8),
          name: p.name,
          condition: p.condition,
          status: p.status,
          time: new Date(p.createdAt || '').toLocaleDateString()
        })));


      } catch(err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchDashboard();
  }, []);

  const stats = [
    { title: t('dashboard.total_patients'), value: dashboardStats.total.toLocaleString(), change: 'Sandbox data', isPositive: true, icon: <Users size={24} className="text-blue-600" />, bgColor: 'bg-blue-50 dark:bg-blue-900/30' },
    { title: t('dashboard.new_admissions'), value: dashboardStats.newAdm.toString(), change: 'Last 30 Days', isPositive: true, icon: <UserPlus size={24} className="text-indigo-600" />, bgColor: 'bg-indigo-50 dark:bg-indigo-900/30' },
    { title: t('dashboard.recovered'), value: dashboardStats.recovered.toLocaleString(), change: 'Discharged status', isPositive: true, icon: <HeartPulse size={24} className="text-emerald-600" />, bgColor: 'bg-emerald-50 dark:bg-emerald-900/30' },
    { title: t('dashboard.active_cases'), value: dashboardStats.active.toString(), change: 'In system', isPositive: false, icon: <Activity size={24} className="text-amber-600" />, bgColor: 'bg-amber-50 dark:bg-amber-900/30' }
  ];

  return (
    <div className="p-4 sm:p-6 md:p-8 max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-8 animate-fade-in-up">
        <div className="flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400 mb-2">
          <Calendar size={14} /> {new Date().toLocaleDateString(language === 'hi' ? 'hi-IN' : language === 'ar' ? 'ar-SA' : 'en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
        </div>
        <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-slate-900 via-slate-700 to-slate-500 dark:from-white dark:via-slate-200 dark:to-slate-400">{t('nav.dashboard')}</h1>
        <p className="text-slate-500 dark:text-slate-400 mt-1">{t('dashboard.overview')}</p>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-8 stagger-children">
        {loading ? (
          [...Array(4)].map((_, i) => <StatCardSkeleton key={i} />)
        ) : (
          stats.map((stat, index) => (
            <div key={index} className="bg-white dark:bg-slate-900 p-5 sm:p-6 rounded-2xl shadow-[0_2px_10px_-3px_rgba(6,81,237,0.08)] border border-slate-100 dark:border-slate-800 hover:shadow-lg dark:hover:shadow-blue-900/10 transition-all group animate-fade-in-up">
              <div className="flex justify-between items-start mb-4">
                <span className="text-sm text-slate-500 dark:text-slate-400 font-medium">{stat.title}</span>
                <div className={`w-11 h-11 rounded-xl flex items-center justify-center ${stat.bgColor} group-hover:scale-110 transition-transform`}>
                  {stat.icon}
                </div>
              </div>
              <h3 className="text-2xl sm:text-3xl font-bold text-slate-800 dark:text-white tracking-tight">{stat.value}</h3>
              <div className="flex items-center gap-1.5 mt-2">
                {stat.isPositive ? <TrendingUp size={14} className="text-emerald-500" /> : <TrendingDown size={14} className="text-rose-500" />}
                <span className={`text-sm font-semibold ${stat.isPositive ? 'text-emerald-500' : 'text-rose-500'}`}>{stat.change}</span>
                <span className="text-xs text-slate-400 dark:text-slate-500">{t('dashboard.vs_last_month')}</span>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8 animate-fade-in-up" style={{ animationDelay: '0.1s' }}>
        <button onClick={() => navigate('/patients')} className="flex items-center gap-3 p-4 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-2xl hover:border-blue-300 dark:hover:border-blue-900 shadow-sm transition-all group">
          <div className="p-2 bg-blue-50 dark:bg-blue-900/30 rounded-xl group-hover:bg-blue-600 group-hover:text-white transition-colors">
            <Plus size={20} className="text-blue-600 dark:text-blue-400 group-hover:text-white" />
          </div>
          <span className="font-semibold text-slate-700 dark:text-slate-200">{role === 'admin' ? 'Add Patient' : 'Patient List'}</span>
        </button>
        <button onClick={() => navigate('/schedule')} className="flex items-center gap-3 p-4 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-2xl hover:border-indigo-300 dark:hover:border-indigo-900 shadow-sm transition-all group">
          <div className="p-2 bg-indigo-50 dark:bg-indigo-900/30 rounded-xl group-hover:bg-indigo-600 group-hover:text-white transition-colors">
            <Calendar size={20} className="text-indigo-600 dark:text-indigo-400 group-hover:text-white" />
          </div>
          <span className="font-semibold text-slate-700 dark:text-slate-200">Schedule</span>
        </button>
        <button onClick={() => navigate('/analytics')} className="flex items-center gap-3 p-4 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-2xl hover:border-emerald-300 dark:hover:border-emerald-900 shadow-sm transition-all group">
          <div className="p-2 bg-emerald-50 dark:bg-emerald-900/30 rounded-xl group-hover:bg-emerald-600 group-hover:text-white transition-colors">
            <Activity size={20} className="text-emerald-600 dark:text-emerald-400 group-hover:text-white" />
          </div>
          <span className="font-semibold text-slate-700 dark:text-slate-200">Analytics</span>
        </button>
        <button onClick={() => navigate('/settings')} className="flex items-center gap-3 p-4 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-2xl hover:border-amber-300 dark:hover:border-amber-900 shadow-sm transition-all group">
          <div className="p-2 bg-amber-50 dark:bg-amber-900/30 rounded-xl group-hover:bg-amber-600 group-hover:text-white transition-colors">
            <Settings size={20} className="text-amber-600 dark:text-amber-400 group-hover:text-white" />
          </div>
          <span className="font-semibold text-slate-700 dark:text-slate-200">Settings</span>
        </button>
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 sm:gap-8 mb-8">
        <div className="lg:col-span-2 bg-white dark:bg-slate-900 p-5 sm:p-6 rounded-2xl shadow-[0_2px_10px_-3px_rgba(6,81,237,0.08)] border border-slate-100 dark:border-slate-800 animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-slate-800 dark:text-white">{t('dashboard.flow_trend')}</h3>
            <button onClick={() => navigate('/analytics')} className="text-sm text-blue-600 dark:text-blue-400 hover:text-blue-700 font-medium flex items-center gap-1">
              {t('dashboard.view_all')} <ArrowRight size={14} />
            </button>
          </div>
          {loading ? (
            <div className="h-[280px] flex items-end gap-3 px-4">
              {[...Array(7)].map((_, i) => <GlowSkeleton key={i} className="flex-1" style={{ height: `${Math.random() * 60 + 30}%` } as any} />)}
            </div>
          ) : (
            <div className="h-[280px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData} margin={{ top: 5, right: 10, left: -10, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorAdm" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                    </linearGradient>
                    <linearGradient id="colorDis" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f044" />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 12 }} dy={10} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 12 }} dx={-10} />
                  <Tooltip contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 20px rgba(0,0,0,0.12)', fontSize: 13 }} />
                  <Area type="monotone" dataKey="admissions" stroke="#3b82f6" strokeWidth={2.5} fillOpacity={1} fill="url(#colorAdm)" />
                  <Area type="monotone" dataKey="discharges" stroke="#10b981" strokeWidth={2.5} fillOpacity={1} fill="url(#colorDis)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>

        {/* Capacity Card */}
        <div className="bg-gradient-to-br from-blue-600 to-indigo-600 rounded-2xl shadow-lg p-5 sm:p-6 text-white flex flex-col justify-between relative overflow-hidden animate-fade-in-up" style={{ animationDelay: '0.3s' }}>
          <div className="absolute top-[-20%] right-[-10%] w-[60%] h-[60%] rounded-full bg-white/10 blur-[40px] pointer-events-none"></div>
          <div>
            <h3 className="text-lg font-bold mb-1">{t('dashboard.capacity')}</h3>
            <p className="text-blue-100 text-sm border-b border-white/20 pb-4">{t('dashboard.capacity_desc')}</p>
          </div>
          <div className="space-y-5 z-10 mt-4">
            {[
              { label: 'ICU Beds', pct: 85 },
              { label: 'General Ward', pct: 60 },
              { label: 'Emergency', pct: 42 },
            ].map((bed) => (
              <div key={bed.label}>
                <div className="flex justify-between text-sm mb-1.5 font-medium">
                  <span>{bed.label}</span>
                  <span>{bed.pct}%</span>
                </div>
                <div className="w-full bg-white/20 rounded-full h-2">
                  <div className="bg-white rounded-full h-2 transition-all duration-1000" style={{ width: loading ? '0%' : `${bed.pct}%`, boxShadow: bed.pct > 75 ? '0 0 10px rgba(255,255,255,0.5)' : 'none' }}></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Bottom Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8">
        {/* Recent Patients */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-[0_2px_10px_-3px_rgba(6,81,237,0.08)] border border-slate-100 dark:border-slate-800 overflow-hidden animate-fade-in-up" style={{ animationDelay: '0.4s' }}>
          <div className="flex items-center justify-between px-5 sm:px-6 py-4 border-b border-slate-100 dark:border-slate-800">
            <h3 className="text-lg font-semibold text-slate-800 dark:text-white">{t('dashboard.recent_patients')}</h3>
            <button onClick={() => navigate('/patients')} className="text-sm text-blue-600 dark:text-blue-400 hover:text-blue-700 font-medium flex items-center gap-1">{t('dashboard.view_all')} <ArrowRight size={14} /></button>
          </div>
          <div className="divide-y divide-slate-50 dark:divide-slate-800">
            {recentPatientsList.map((p) => (
              <div key={p.id} className="flex items-center justify-between px-5 sm:px-6 py-3.5 hover:bg-slate-50/50 dark:hover:bg-slate-800/50 transition-colors">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-xs font-bold text-slate-600 dark:text-slate-300">
                    {p.name.split(' ').map((n: string) => n[0]).join('')}
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-slate-800 dark:text-100">{p.name}</p>
                    <p className="text-xs text-slate-500 dark:text-slate-400">{p.condition}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className={`w-2 h-2 rounded-full ${getStatusDot(p.status)}`}></div>
                  <span className="text-xs text-slate-500 dark:text-slate-400">{p.time}</span>
                  {role === 'doctor' && p.status === 'Critical' && (
                    <button 
                      onClick={async (e) => {
                        e.stopPropagation();
                        await patientService.updatePatientStatus(p.id, 'Stable');
                        window.location.reload();
                      }}
                      className="ml-2 px-2 py-1 bg-emerald-50 text-emerald-600 rounded-lg text-[10px] font-bold hover:bg-emerald-100 transition-colors"
                    >
                      Mark Stable
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Monthly Bar Chart */}
        <div className="bg-white dark:bg-slate-900 p-5 sm:p-6 rounded-2xl shadow-[0_2px_10px_-3px_rgba(6,81,237,0.08)] border border-slate-100 dark:border-slate-800 animate-fade-in-up" style={{ animationDelay: '0.5s' }}>
          <h3 className="text-lg font-semibold text-slate-800 dark:text-white mb-6">{t('dashboard.monthly_volume')}</h3>
          {loading ? (
            <div className="h-[250px] flex items-end gap-3 px-4">
              {[...Array(7)].map((_, i) => <GlowSkeleton key={i} className="flex-1" style={{ height: `${Math.random() * 60 + 30}%` } as any} />)}
            </div>
          ) : (
            <div className="h-[250px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData} margin={{ top: 5, right: 10, left: -10, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f044" />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 12 }} dy={10} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 12 }} dx={-10} />
                  <Tooltip contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 20px rgba(0,0,0,0.12)', fontSize: 13 }} cursor={{ fill: '#f8fafc' }} />
                  <Bar dataKey="admissions" fill="#6366f1" radius={[6, 6, 0, 0]} barSize={28} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
