import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface Notification {
  id: string;
  title: string;
  message: string;
  time: string;
  read: boolean;
  type: 'info' | 'warning' | 'success' | 'critical';
}

interface SectionVisibility {
  dashboard: boolean;
  patients: boolean;
  doctors: boolean;
  analytics: boolean;
  settings: boolean;
}

interface AppState {
  sidebarOpen: boolean;
  darkMode: boolean;
  language: string;
  sectionVisibility: SectionVisibility;
  notifications: Notification[];
  toggleSidebar: () => void;
  setSidebarOpen: (open: boolean) => void;
  toggleDarkMode: () => void;
  setLanguage: (lang: string) => void;
  setSectionVisibility: (section: keyof SectionVisibility, visible: boolean) => void;
  markNotificationRead: (id: string) => void;
  markAllRead: () => void;
}

const mockNotifications: Notification[] = [
  { id: '1', title: 'New Patient Admitted', message: 'John Doe (PT-001) admitted to Cardiology Ward.', time: '2 min ago', read: false, type: 'info' },
  { id: '2', title: 'Critical Alert', message: 'Robert Johnson (PT-003) vitals are unstable.', time: '15 min ago', read: false, type: 'critical' },
  { id: '3', title: 'Discharge Complete', message: 'Emily Davis (PT-004) has been discharged.', time: '1 hr ago', read: false, type: 'success' },
  { id: '4', title: 'Lab Results Ready', message: 'Lab results for Michael Brown are available.', time: '2 hrs ago', read: true, type: 'info' },
  { id: '5', title: 'Bed Capacity Warning', message: 'ICU occupancy has reached 90%.', time: '3 hrs ago', read: true, type: 'warning' },
  { id: '6', title: 'Shift Change', message: 'Dr. Sarah Wilson is now on duty for Ward B.', time: '5 hrs ago', read: true, type: 'info' },
];

export const useAppStore = create<AppState>()(
  persist(
    (set) => ({
      sidebarOpen: true,
      darkMode: false,
      language: 'en',
      sectionVisibility: {
        dashboard: true,
        patients: true,
        doctors: true,
        analytics: true,
        settings: true,
      },
      notifications: mockNotifications,
      toggleSidebar: () => set((state) => ({ sidebarOpen: !state.sidebarOpen })),
      setSidebarOpen: (open) => set({ sidebarOpen: open }),
      toggleDarkMode: () => set((state) => ({ darkMode: !state.darkMode })),
      setLanguage: (lang) => set({ language: lang }),
      setSectionVisibility: (section, visible) =>
        set((state) => ({
          sectionVisibility: { ...state.sectionVisibility, [section]: visible },
        })),
      markNotificationRead: (id) =>
        set((state) => ({
          notifications: state.notifications.map((n) =>
            n.id === id ? { ...n, read: true } : n
          ),
        })),
      markAllRead: () =>
        set((state) => ({
          notifications: state.notifications.map((n) => ({ ...n, read: true })),
        })),
    }),
    { name: 'raga-app-settings', version: 3 }
  )
);
