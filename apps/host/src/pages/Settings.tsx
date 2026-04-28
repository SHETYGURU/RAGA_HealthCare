import React, { useState, useEffect } from 'react';
import { Moon, Sun, Globe, LayoutDashboard, Users, Activity, Settings as SettingsIcon, Palette, Clock, Save, Trash2 } from 'lucide-react';
import { useAppStore } from '../store/useAppStore';
import { useAuthStore } from '../store/useAuthStore';
import { doctorService } from '../services/doctorService';
import { useTranslation } from '../hooks/useTranslation';
import type { DoctorAvailability, Break } from '../types';
import { Database, Zap } from 'lucide-react';

const Toggle = ({ checked, onChange }: { checked: boolean; onChange: () => void }) => (
  <button
    onClick={onChange}
    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors duration-300 focus:outline-none ${checked ? 'bg-blue-600' : 'bg-slate-200 dark:bg-slate-700'}`}
  >
    <span className={`inline-block h-4 w-4 transform rounded-full bg-white shadow-md transition-transform duration-300 ${checked ? 'translate-x-6' : 'translate-x-1'}`} />
  </button>
);

const languages = [
  { code: 'en', label: 'English', flag: '🇺🇸' },
  { code: 'hi', label: 'Hindi', flag: '🇮🇳' },
  { code: 'fr', label: 'French', flag: '🇫🇷' },
  { code: 'de', label: 'German', flag: '🇩🇪' },
  { code: 'es', label: 'Spanish', flag: '🇪🇸' },
  { code: 'ar', label: 'Arabic', flag: '🇸🇦' },
];

const Settings: React.FC = () => {
  const { t } = useTranslation();
  const {
    darkMode, toggleDarkMode,
    language, setLanguage,
    sectionVisibility, setSectionVisibility,
  } = useAppStore();

  const { user, role } = useAuthStore();
  const [activeTab, setActiveTab] = useState<'appearance' | 'language' | 'professional' | 'system' | 'about'>('appearance');
  const [docTimings, setDocTimings] = useState<DoctorAvailability>({ start: '09:00', end: '17:00', breaks: [] });
  const [savingTimings, setSavingTimings] = useState(false);
  const [timingsMsg, setTimingsMsg] = useState('');
  const [seeding, setSeeding] = useState(false);

  const handleRandomizeData = async () => {
    if (!window.confirm('This will randomize statuses for ALL existing patients to improve analytics variety. Proceed?')) return;
    setSeeding(true);
    try {
      const { seedPatients } = await import('../services/seedData');
      await seedPatients(0);
      alert('Data randomized successfully! Refresh the patient list to see changes.');
    } catch (err) {
      console.error(err);
      alert('Failed to randomize data.');
    } finally {
      setSeeding(false);
    }
  };

  useEffect(() => {
    if (role === 'doctor' && user) {
      doctorService.getDoctorByUid(user.uid).then(doc => {
        if (doc && doc.availability) {
          const avail = doc.availability as any;
          setDocTimings({
            start: avail.start || '09:00',
            end: avail.end || '17:00',
            breaks: avail.breaks || (avail.lunchStart ? [{ start: avail.lunchStart, end: avail.lunchEnd, label: 'Lunch' }] : [])
          });
        }
      });
    }
  }, [role, user]);

  const handleSaveTimings = async () => {
    if (!user) return;
    setSavingTimings(true);
    setTimingsMsg('');
    try {
      await doctorService.updateDoctorAvailability(user.uid, docTimings);
      setTimingsMsg('Availability updated successfully!');
      setTimeout(() => setTimingsMsg(''), 3000);
    } catch (err) {
      setTimingsMsg('Failed to update availability.');
    } finally {
      setSavingTimings(false);
    }
  };

  const sections = [
    { key: 'dashboard' as const, label: t('nav.dashboard'), icon: <LayoutDashboard size={18} /> },
    { key: 'patients' as const, label: t('nav.patients'), icon: <Users size={18} /> },
    { key: 'doctors' as const, label: t('nav.doctors'), icon: <Users size={18} /> },
    { key: 'analytics' as const, label: t('nav.analytics'), icon: <Activity size={18} /> },
    { key: 'settings' as const, label: t('nav.settings'), icon: <SettingsIcon size={18} /> },
  ];

  const menuItems = [
    { id: 'appearance', label: t('settings.appearance'), icon: <Palette size={18} /> },
    { id: 'language', label: t('settings.language'), icon: <Globe size={18} /> },
    ...(role === 'doctor' ? [{ id: 'professional', label: t('settings.timings'), icon: <Clock size={18} /> }] : []),
    ...(role === 'admin' ? [{ id: 'system', label: 'Admin Utilities', icon: <Database size={18} /> }] : []),
    { id: 'about', label: 'About', icon: <SettingsIcon size={18} /> },
  ];

  return (
    <div className="p-4 sm:p-6 md:p-8 max-w-6xl mx-auto animate-fade-in-up">
      <div className="mb-8">
        <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-slate-900 via-slate-700 to-slate-500 dark:from-white dark:via-slate-200 dark:to-slate-400">{t('settings.title')}</h1>
        <p className="text-slate-500 dark:text-slate-400 mt-1">{t('settings.subtitle')}</p>
      </div>

      <div className="flex flex-col lg:flex-row gap-8">
        {/* Sidebar Navigation */}
        <div className="w-full lg:w-64 shrink-0">
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 overflow-hidden shadow-sm p-2 space-y-1">
            {menuItems.map((item) => (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id as any)}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${
                  activeTab === item.id
                    ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 shadow-sm'
                    : 'text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800'
                }`}
              >
                {item.icon}
                {item.label}
              </button>
            ))}
          </div>
        </div>

        {/* Content Area */}
        <div className="flex-1 space-y-6">
          {activeTab === 'appearance' && (
            <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
              {/* Theme */}
              <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 overflow-hidden shadow-sm">
                <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/30">
                  <h2 className="text-base font-semibold text-slate-800 dark:text-white">{t('settings.appearance')}</h2>
                </div>
                <div className="p-6 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${darkMode ? 'bg-slate-800 text-amber-400' : 'bg-blue-50 text-blue-600'}`}>
                      {darkMode ? <Moon size={18} /> : <Sun size={18} />}
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-slate-800 dark:text-white">{t('settings.theme')}</p>
                      <p className="text-xs text-slate-500 dark:text-slate-400">{t('settings.theme.desc')}</p>
                    </div>
                  </div>
                  <Toggle checked={darkMode} onChange={toggleDarkMode} />
                </div>
              </div>

              {/* Navigation Visibility */}
              <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 overflow-hidden shadow-sm">
                <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/30">
                  <h2 className="text-base font-semibold text-slate-800 dark:text-white">{t('settings.navigation')}</h2>
                </div>
                <div className="p-6 divide-y divide-slate-100 dark:divide-slate-800">
                  {sections.map((section) => (
                    <div key={section.key} className="flex items-center justify-between py-4 first:pt-0 last:pb-0">
                      <div className="flex items-center gap-3">
                        <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${sectionVisibility[section.key] ? 'bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400' : 'bg-slate-100 dark:bg-slate-800 text-slate-400'}`}>
                          {section.icon}
                        </div>
                        <div>
                          <p className="text-sm font-semibold text-slate-800 dark:text-white">{section.label}</p>
                          <p className="text-xs text-slate-500 dark:text-slate-400">{t('settings.nav.desc')}</p>
                        </div>
                      </div>
                      <Toggle
                        checked={sectionVisibility[section.key]}
                        onChange={() => setSectionVisibility(section.key, !sectionVisibility[section.key])}
                      />
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {activeTab === 'language' && (
            <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 overflow-hidden shadow-sm animate-in fade-in slide-in-from-right-4 duration-300">
              <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/30">
                <h2 className="text-base font-semibold text-slate-800 dark:text-white">{t('settings.language')}</h2>
              </div>
              <div className="p-6">
                <p className="text-sm text-slate-500 dark:text-slate-400 mb-4">{t('settings.language.desc')}</p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {languages.map((lang) => (
                    <button
                      key={lang.code}
                      onClick={() => setLanguage(lang.code as any)}
                      className={`flex items-center justify-between p-4 rounded-xl border transition-all ${
                        language === lang.code
                          ? 'border-blue-600 bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 font-semibold ring-2 ring-blue-100 dark:ring-blue-900/30'
                          : 'border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 hover:border-slate-300 dark:hover:border-slate-600 shadow-sm'
                      }`}
                    >
                      <span className="flex items-center gap-3">
                        <span className="text-2xl leading-none">{lang.flag}</span>
                        <span className="text-sm">{lang.label}</span>
                      </span>
                      {language === lang.code && (
                        <div className="w-2 h-2 rounded-full bg-blue-600"></div>
                      )}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {activeTab === 'professional' && role === 'doctor' && (
            <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 overflow-hidden shadow-sm animate-in fade-in slide-in-from-right-4 duration-300">
              <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/30">
                <h2 className="text-base font-semibold text-slate-800 dark:text-white">{t('settings.timings')}</h2>
                {timingsMsg && <span className="text-xs font-medium text-emerald-600">{timingsMsg}</span>}
              </div>
              <div className="p-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-8">
                  <div>
                    <label className="text-xs font-semibold text-slate-500 mb-1.5 block uppercase tracking-wider">Working Start Time</label>
                    <input type="time" value={docTimings.start} onChange={e => setDocTimings({...docTimings, start: e.target.value})} className="w-full border border-slate-200 dark:border-slate-700 rounded-xl p-3 text-sm dark:bg-slate-800 dark:text-slate-200 outline-none focus:border-blue-500 transition-all shadow-sm" />
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-slate-500 mb-1.5 block uppercase tracking-wider">Working End Time</label>
                    <input type="time" value={docTimings.end} onChange={e => setDocTimings({...docTimings, end: e.target.value})} className="w-full border border-slate-200 dark:border-slate-700 rounded-xl p-3 text-sm dark:bg-slate-800 dark:text-slate-200 outline-none focus:border-blue-500 transition-all shadow-sm" />
                  </div>
                </div>

                <div className="mb-6">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-sm font-bold text-slate-800 dark:text-slate-200">Breaks & Lunch</h3>
                    <button 
                      onClick={() => setDocTimings({...docTimings, breaks: [...docTimings.breaks, { start: '13:00', end: '14:00', label: 'Break' }]})}
                      className="text-xs font-bold text-blue-600 bg-blue-50 dark:bg-blue-900/30 px-3 py-2 rounded-xl hover:bg-blue-100 transition-colors"
                    >
                      + Add New Break
                    </button>
                  </div>

                  <div className="space-y-3">
                    {docTimings.breaks.map((brk: Break, idx: number) => (
                      <div key={idx} className="flex flex-col sm:flex-row items-end sm:items-center gap-3 p-4 bg-slate-50 dark:bg-slate-800/40 rounded-2xl border border-slate-100 dark:border-slate-800">
                        <div className="flex-1 w-full">
                          <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1 block">Label</label>
                          <input placeholder="e.g. Lunch" value={brk.label || ''} onChange={e => {
                            const newBreaks = [...docTimings.breaks];
                            newBreaks[idx].label = e.target.value;
                            setDocTimings({...docTimings, breaks: newBreaks});
                          }} className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2 text-sm outline-none focus:border-blue-500" />
                        </div>
                        <div className="flex gap-2 w-full sm:w-auto">
                          <div>
                            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1 block">Start</label>
                            <input type="time" value={brk.start} onChange={e => {
                              const newBreaks = [...docTimings.breaks];
                              newBreaks[idx].start = e.target.value;
                              setDocTimings({...docTimings, breaks: newBreaks});
                            }} className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2 text-sm outline-none focus:border-blue-500" />
                          </div>
                          <div>
                            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1 block">End</label>
                            <input type="time" value={brk.end} onChange={e => {
                              const newBreaks = [...docTimings.breaks];
                              newBreaks[idx].end = e.target.value;
                              setDocTimings({...docTimings, breaks: newBreaks});
                            }} className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2 text-sm outline-none focus:border-blue-500" />
                          </div>
                        </div>
                        <button onClick={() => {
                          const newBreaks = docTimings.breaks.filter((_: any, i: number) => i !== idx);
                          setDocTimings({...docTimings, breaks: newBreaks});
                        }} className="p-2 text-slate-400 hover:text-rose-500 hover:bg-rose-50 rounded-lg"><Trash2 size={16} /></button>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="pt-6 border-t border-slate-100 dark:border-slate-800 flex justify-end">
                  <button onClick={handleSaveTimings} disabled={savingTimings} className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl text-sm transition-all shadow-md flex items-center gap-2">
                    <Save size={18} /> {savingTimings ? 'Saving...' : t('settings.save')}
                  </button>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'system' && role === 'admin' && (
            <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 overflow-hidden shadow-sm animate-in fade-in slide-in-from-right-4 duration-300">
              <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/30">
                <h2 className="text-base font-semibold text-slate-800 dark:text-white">Admin Utilities</h2>
              </div>
              <div className="p-6">
                <div className="bg-amber-50 dark:bg-amber-900/10 p-5 rounded-2xl border border-amber-100 dark:border-amber-900/30 mb-6">
                  <div className="flex items-start gap-4">
                    <div className="p-2 bg-white dark:bg-slate-800 rounded-xl shadow-sm">
                      <Zap className="text-amber-500" size={24} />
                    </div>
                    <div>
                      <h3 className="font-bold text-amber-900 dark:text-amber-200">Data Randomization</h3>
                      <p className="text-sm text-amber-700 dark:text-amber-400/80 mt-1">Re-distributes patient statuses and ensures all doctor records have specializations. Best for demo resets.</p>
                    </div>
                  </div>
                  <button 
                    onClick={handleRandomizeData}
                    disabled={seeding}
                    className="mt-6 w-full sm:w-auto px-6 py-3 bg-amber-500 hover:bg-amber-600 text-white font-bold rounded-xl shadow-sm transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                  >
                    {seeding ? <Database size={18} className="animate-spin" /> : <Zap size={18} />}
                    {seeding ? 'Processing...' : 'Run Randomization'}
                  </button>
                </div>

                <div className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-100 dark:border-slate-700">
                  <div className="flex items-center gap-3">
                    <Database size={20} className="text-blue-500" />
                    <div>
                      <p className="text-sm font-bold text-slate-800 dark:text-white">Seed Initial Data</p>
                      <p className="text-xs text-slate-500">Populate the system with 150 test patients, doctors, and system admins.</p>
                    </div>
                  </div>
                  <button 
                    onClick={async () => {
                      const { seedPatients } = await import('../services/seedData');
                      await seedPatients(150);
                      alert('Seed complete!');
                    }}
                    className="text-xs font-bold text-blue-600 hover:underline"
                  >
                    Execute Seed
                  </button>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'about' && (
            <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 p-8 shadow-sm animate-in fade-in slide-in-from-right-4 duration-300">
              <div className="flex flex-col items-center text-center">
                <div className="w-20 h-20 rounded-3xl bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center shadow-xl mb-6">
                  <span className="text-white font-black text-3xl">R</span>
                </div>
                <h2 className="text-2xl font-bold text-slate-900 dark:text-white">RAGA HealthCare</h2>
                <p className="text-slate-500 dark:text-slate-400 mt-2">The ultimate platform for hospital and doctor management.</p>
                <div className="mt-8 grid grid-cols-2 gap-4 w-full">
                  <div className="p-4 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-slate-100 dark:border-slate-800">
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Version</p>
                    <p className="text-lg font-bold text-slate-800 dark:text-white">1.2.0</p>
                  </div>
                  <div className="p-4 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-slate-100 dark:border-slate-800">
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Status</p>
                    <p className="text-lg font-bold text-emerald-500">Production</p>
                  </div>
                </div>
                <p className="text-xs text-slate-400 mt-12">© 2026 RAGA HealthCare Systems. All rights reserved.</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Settings;
