import { create } from 'zustand';
import type { User } from 'firebase/auth';
import type { Role, Doctor } from '../types';

interface AuthState {
  user: User | null;
  role: Role | null;
  doctorInfo: Doctor | null;
  loading: boolean;
  setUser: (user: User | null) => void;
  setRole: (role: Role | null) => void;
  setDoctorInfo: (info: Doctor | null) => void;
  setLoading: (loading: boolean) => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  role: null,
  doctorInfo: null,
  loading: true,
  setUser: (user) => set({ user }),
  setRole: (role) => set({ role }),
  setDoctorInfo: (doctorInfo) => set({ doctorInfo }),
  setLoading: (loading) => set({ loading }),
}));
