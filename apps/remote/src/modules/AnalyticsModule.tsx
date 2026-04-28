import React, { useState, useEffect } from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, PieChart, Pie, Cell, Legend } from 'recharts';
import { TrendingUp, Users, Activity, HeartPulse } from 'lucide-react';

const analyticsData = [
  { name: 'Jan', admissions: 240, discharges: 200, revenue: 48 },
  { name: 'Feb', admissions: 139, discharges: 221, revenue: 38 },
  { name: 'Mar', admissions: 380, discharges: 229, revenue: 62 },
  { name: 'Apr', admissions: 390, discharges: 300, revenue: 71 },
  { name: 'May', admissions: 480, discharges: 418, revenue: 85 },
  { name: 'Jun', admissions: 380, discharges: 350, revenue: 69 },
  { name: 'Jul', admissions: 430, discharges: 410, revenue: 78 },
];

const wardData = [
  { name: 'ICU', value: 35, color: '#ef4444' },
  { name: 'General', value: 42, color: '#3b82f6' },
  { name: 'Surgery', value: 15, color: '#8b5cf6' },
  { name: 'Pediatrics', value: 8, color: '#f59e0b' },
];

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
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 1200);
    return () => clearTimeout(timer);
  }, []);

  const tooltipStyle = { borderRadius: '12px', border: 'none', boxShadow: '0 4px 20px rgba(0,0,0,0.12)', fontSize: 13 };

  return (
    <div className="p-4 sm:p-6 md:p-8 max-w-7xl mx-auto animate-fade-in-up">
      <div className="mb-8">
        <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-slate-900 to-slate-600 dark:from-white dark:to-slate-400">Analytics Overview</h1>
        <p className="text-slate-500 dark:text-slate-400 mt-1">Hospital performance metrics and statistics</p>
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
            <StatCard icon={<Users size={20} className="text-blue-600"/>} label="Total Admissions" value="2,850" change="↑ 14.2% from last month" color="bg-blue-50 dark:bg-blue-900/30" />
            <StatCard icon={<HeartPulse size={20} className="text-emerald-600"/>} label="Recovery Rate" value="94.2%" change="↑ 2.1% from last month" color="bg-emerald-50 dark:bg-emerald-900/30" />
            <StatCard icon={<Activity size={20} className="text-rose-600"/>} label="Critical Cases" value="38" change="↓ 5.3% from last month" color="bg-rose-50 dark:bg-rose-900/30" />
            <StatCard icon={<TrendingUp size={20} className="text-indigo-600"/>} label="Avg Stay (days)" value="4.7" change="↓ 0.3 days improvement" color="bg-indigo-50 dark:bg-indigo-900/30" />
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
                <AreaChart data={analyticsData} margin={{ top: 5, right: 10, left: -10, bottom: 0 }}>
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
              <BarChart data={analyticsData} margin={{ top: 5, right: 10, left: -10, bottom: 0 }}>
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
