import React, { useState, useEffect } from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, PieChart, Pie, Cell, Legend } from 'recharts';
import { TrendingUp, Users, Activity, HeartPulse } from 'lucide-react';
import { patientService } from '../services/patientService';
import { useAuthStore } from '../store/useAuthStore';
import { useTranslation } from '../hooks/useTranslation';

function getMonthShortName(dateString: string) {
  const d = new Date(dateString);
  return d.toLocaleString('en-US', { month: 'short' });
}

const GlowSkeleton = ({ className = '', style }: { className?: string, style?: React.CSSProperties }) => (
  <div className={`skeleton-glow ${className}`} style={style}></div>
);

const StatCard = ({ icon, label, value, change, color }: { icon: React.ReactNode; label: string; value: string; change: string; color: string }) => (
  <div className={`bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm hover:shadow-md transition-all group`}>
    <div className="flex items-center justify-between mb-3">
      <span className="text-sm text-slate-500 dark:text-slate-400 font-medium">{label}</span>
      <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${color} group-hover:scale-110 transition-transform`}>
        {icon}
      </div>
    </div>
    <p className="text-2xl font-bold text-slate-900 dark:text-white">{value}</p>
    <p className="text-xs text-emerald-500 font-semibold mt-1">{change}</p>
  </div>
);

const AnalyticsModule: React.FC = () => {
  const { role, user } = useAuthStore();
  const { t } = useTranslation();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({ total: 0, critical: 0, discharged: 0, recoveryRate: 0 });
  const [wardData, setWardData] = useState<{name: string, value: number, color: string}[]>([]);
  const [chartData, setChartData] = useState<{name: string, admissions: number, discharges: number}[]>([]);

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        const patients = role === 'doctor' && user?.uid 
          ? await patientService.getPatientsByDoctor(user.uid)
          : await patientService.getPatients();
        const total = patients.length;
        const critical = patients.filter(p => p.status === 'Critical').length;
        const discharged = patients.filter(p => p.status === 'Discharged').length;
        const recoveryRate = total ? Math.round((discharged / total) * 100) : 0;

        setStats({ total, critical, discharged, recoveryRate });

        const wardCounts: Record<string, number> = {};
        patients.forEach(p => {
          wardCounts[p.ward] = (wardCounts[p.ward] || 0) + 1;
        });

        const colors = ['#ef4444', '#3b82f6', '#8b5cf6', '#f59e0b', '#10b981'];
        const mappedWards = Object.entries(wardCounts).map(([name, value], idx) => ({
          name, value, color: colors[idx % colors.length]
        }));
        setWardData(mappedWards);

        // Group by month for chart data
        const monthMap: Record<string, { admissions: number, discharges: number }> = {};
        
        // Initialize last 6 months
        for (let i = 5; i >= 0; i--) {
          const d = new Date();
          d.setMonth(d.getMonth() - i);
          const mName = d.toLocaleString('en-US', { month: 'short' });
          monthMap[mName] = { admissions: 0, discharges: 0 };
        }

        patients.forEach(p => {
          if (p.admittedAt) {
            const mName = getMonthShortName(p.admittedAt);
            if (monthMap[mName]) {
              monthMap[mName].admissions += 1;
            }
          }
          if (p.status === 'Discharged' && p.updatedAt) {
            const mName = getMonthShortName(p.updatedAt);
            if (monthMap[mName]) {
              monthMap[mName].discharges += 1;
            }
          }
        });

        const mappedChartData = Object.entries(monthMap).map(([name, data]) => ({
          name,
          admissions: data.admissions,
          discharges: data.discharges
        }));
        setChartData(mappedChartData);

      } catch (err) {
        console.error("Failed to load analytics", err);
      } finally {
        setLoading(false);
      }
    };
    fetchAnalytics();
  }, []);

  const tooltipStyle = { borderRadius: '12px', border: 'none', boxShadow: '0 4px 20px rgba(0,0,0,0.12)', fontSize: 13 };

  return (
    <div className="p-4 sm:p-6 md:p-8 max-w-7xl mx-auto animate-fade-in-up">
      <div className="mb-8">
        <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-slate-900 to-slate-600 dark:from-white dark:to-slate-400">
          {role === 'doctor' ? t('analytics.title.doctor') : t('analytics.title.admin')}
        </h1>
        <p className="text-slate-500 dark:text-slate-400 mt-1">
          {role === 'doctor' ? t('analytics.subtitle.doctor') : t('analytics.subtitle.admin')}
        </p>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5 mb-8 stagger-children">
        {loading ? (
          [...Array(4)].map((_, i) => (
            <div key={i} className="bg-white dark:bg-slate-900 rounded-2xl p-5 border border-slate-100 dark:border-slate-800 space-y-3">
              <GlowSkeleton className="h-4 w-20" /><GlowSkeleton className="h-7 w-16" /><GlowSkeleton className="h-3 w-12" />
            </div>
          ))
        ) : (
          <>
            <StatCard icon={<Users size={20} className="text-blue-600"/>} label={role === 'doctor' ? "My Patients" : "Total Admissions"} value={stats.total.toString()} change={role === 'doctor' ? "Assigned to me" : "Hospital-wide"} color="bg-blue-50 dark:bg-blue-900/30" />
            <StatCard icon={<HeartPulse size={20} className="text-emerald-600"/>} label="Recovery Rate" value={`${stats.recoveryRate}%`} change={`${stats.discharged} Discharges`} color="bg-emerald-50 dark:bg-emerald-900/30" />
            <StatCard icon={<Activity size={20} className="text-rose-600"/>} label="Critical Cases" value={stats.critical.toString()} change="Requires Attention" color="bg-rose-50 dark:bg-rose-900/30" />
            <StatCard icon={<TrendingUp size={20} className="text-indigo-600"/>} label={role === 'doctor' ? "Current Cases" : "Active Patients"} value={(stats.total - stats.discharged).toString()} change="Under treatment" color="bg-indigo-50 dark:bg-indigo-900/30" />
          </>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8 mb-8">
        {/* Admissions vs Discharges */}
        <div className="bg-white dark:bg-slate-900 p-5 sm:p-6 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-800 animate-fade-in-up" style={{ animationDelay: '0.15s' }}>
          <h3 className="text-lg font-semibold text-slate-800 dark:text-white mb-1">Patient Flow Trend</h3>
          <p className="text-sm text-slate-500 dark:text-slate-400 mb-6">Admissions vs Discharges (Jan–Jul)</p>
          {loading ? (
            <div className="h-[300px] flex items-end gap-3">
              {[...Array(7)].map((_, i) => <GlowSkeleton key={i} className="flex-1" style={{ height: `${30 + i * 10}%` } as any} />)}
            </div>
          ) : (
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData} margin={{ top: 5, right: 10, left: -10, bottom: 0 }}>
                  <defs>
                    <linearGradient id="aGrad1" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.35}/><stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                    </linearGradient>
                    <linearGradient id="aGrad2" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10b981" stopOpacity={0.35}/><stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f033" />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 12 }} dy={10} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 12 }} dx={-10} />
                  <Tooltip contentStyle={tooltipStyle} />
                  <Area type="monotone" dataKey="admissions" name="Admissions" stroke="#3b82f6" strokeWidth={2.5} fillOpacity={1} fill="url(#aGrad1)" />
                  <Area type="monotone" dataKey="discharges" name="Discharges" stroke="#10b981" strokeWidth={2.5} fillOpacity={1} fill="url(#aGrad2)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>

        {/* Ward Distribution Pie */}
        <div className="bg-white dark:bg-slate-900 p-5 sm:p-6 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-800 animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
          <h3 className="text-lg font-semibold text-slate-800 dark:text-white mb-1">Ward Distribution</h3>
          <p className="text-sm text-slate-500 dark:text-slate-400 mb-4">Patient allocation by ward</p>
          {loading ? (
            <div className="h-[300px] flex items-center justify-center">
              <GlowSkeleton className="w-48 h-48 !rounded-full" />
            </div>
          ) : (
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={wardData} cx="50%" cy="45%" innerRadius={70} outerRadius={110} paddingAngle={4} dataKey="value">
                    {wardData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} stroke="transparent" />
                    ))}
                  </Pie>
                  <Tooltip contentStyle={tooltipStyle} formatter={(val) => [`${val}%`, '']} />
                  <Legend iconType="circle" iconSize={10} formatter={(value) => <span style={{ color: '#94a3b8', fontSize: 13 }}>{value}</span>} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>
      </div>

      {/* Monthly Volume Bar */}
      <div className="bg-white dark:bg-slate-900 p-5 sm:p-6 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-800 animate-fade-in-up" style={{ animationDelay: '0.25s' }}>
        <h3 className="text-lg font-semibold text-slate-800 dark:text-white mb-1">Monthly Admissions Bar</h3>
        <p className="text-sm text-slate-500 dark:text-slate-400 mb-6">Total admissions per month</p>
        {loading ? (
          <div className="h-[260px] flex items-end gap-4 px-4">
            {[...Array(7)].map((_, i) => <GlowSkeleton key={i} className="flex-1" style={{ height: `${40 + i * 8}%` } as any} />)}
          </div>
        ) : (
          <div className="h-[260px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData} margin={{ top: 5, right: 10, left: -10, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f033" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 12 }} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 12 }} dx={-10} />
                <Tooltip contentStyle={tooltipStyle} cursor={{ fill: '#f8fafc11' }} />
                <Bar dataKey="admissions" name="Admissions" fill="#6366f1" radius={[6, 6, 0, 0]} barSize={32} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>
    </div>
  );
};

export default AnalyticsModule;
