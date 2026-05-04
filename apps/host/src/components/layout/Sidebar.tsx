import React from 'react';
import { NavLink } from 'react-router-dom';
import { LayoutDashboard, Users, Activity, Settings, LogOut, HeartPulse, X } from 'lucide-react';
import { auth } from '../../firebase';
import { useAppStore } from '../../store/useAppStore';
import { useAuthStore } from '../../store/useAuthStore';
import { useTranslation } from '../../hooks/useTranslation';

const Sidebar: React.FC = () => {
  const { sidebarOpen, setSidebarOpen, sectionVisibility } = useAppStore();

  const { role } = useAuthStore();

  const { t } = useTranslation();

  const navLinks = [
    { to: '/', icon: <LayoutDashboard size={20} />, label: t('nav.dashboard'), key: 'dashboard' as const, roles: ['admin', 'doctor'] },
    { to: '/patients', icon: <Users size={20} />, label: t('nav.patients'), key: 'patients' as const, roles: ['admin', 'doctor'] },
    { to: '/doctors', icon: <HeartPulse size={20} />, label: t('nav.doctors'), key: 'doctors' as const, roles: ['admin'] },
    { to: '/analytics', icon: <Activity size={20} />, label: t('nav.analytics'), key: 'analytics' as const, roles: ['admin', 'doctor'] },
    { to: '/settings', icon: <Settings size={20} />, label: t('nav.settings'), key: 'settings' as const, roles: ['admin', 'doctor'] },
  ];

  const visibleLinks = navLinks.filter((link) => {
    const isVisible = (link.key as any) in sectionVisibility 
      ? sectionVisibility[link.key as keyof typeof sectionVisibility] !== false 
      : true;
    return isVisible && link.roles.includes(role || '');
  });

  return (
    <>
      {sidebarOpen && (
        <div className="fixed inset-0 bg-black/30 z-40 md:hidden" onClick={() => setSidebarOpen(false)} />
      )}
      <aside className={`fixed inset-y-0 left-0 z-50 w-64 bg-white dark:bg-slate-900 border-r border-slate-100 dark:border-slate-800 flex flex-col transition-transform duration-300 ease-in-out md:translate-x-0 md:static md:inset-auto ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="h-16 flex items-center justify-between px-6 border-b border-slate-100/50 dark:border-slate-800">
          <div className="flex items-center">
            <img src="/assets/logo.png" alt="RAGA Logo" className="h-12 w-auto mr-3 object-contain drop-shadow-md" />
            <span className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-indigo-600 tracking-tight">RAGA HealthCare</span>
          </div>
          <button onClick={() => setSidebarOpen(false)} className="md:hidden p-1 rounded-lg text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800">
            <X size={18} />
          </button>
        </div>

        <nav className="flex-1 px-4 py-6 space-y-1">
          {visibleLinks.map((link, i) => (
            <NavLink key={link.to} to={link.to}
              onClick={() => setSidebarOpen(false)}
              style={{ animationDelay: `${i * 0.05}s` }}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200 mt-1 animate-slide-in-left ${
                  isActive
                    ? 'bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 font-semibold shadow-[0_1px_4px_rgba(37,99,235,0.1)]'
                    : 'text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-slate-200 font-medium'
                }`
              }
            >
              {link.icon}
              {link.label}
            </NavLink>
          ))}
        </nav>

        <div className="p-4 border-t border-slate-100/50 dark:border-slate-800 mt-auto">
          <button onClick={() => auth.signOut()}
            className="flex items-center w-full gap-3 px-3 py-2.5 text-slate-500 dark:text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-900/20 rounded-xl transition-colors font-medium">
            <LogOut size={20} />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
