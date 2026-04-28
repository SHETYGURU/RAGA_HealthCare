import { lazy, Suspense, useEffect } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Layout from './components/layout/Layout';
import Login from './pages/Login';
const Dashboard = lazy(() => import('./pages/Dashboard'));
const Settings = lazy(() => import('./pages/Settings'));
const DoctorManagement = lazy(() => import('./pages/DoctorManagement'));
const DoctorSchedule = lazy(() => import('./pages/DoctorSchedule'));
const PatientModule = lazy(() => import('./modules/PatientModule'));
const AnalyticsModule = lazy(() => import('./modules/AnalyticsModule'));

import { useAuthStore } from './store/useAuthStore';
import { auth } from './firebase';
import { onAuthStateChanged } from 'firebase/auth';
import { doctorService } from './services/doctorService';

const FallbackLoader = () => (
  <div className="h-[calc(100vh-80px)] w-full flex items-center justify-center">
    <div className="flex flex-col items-center gap-4">
      <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
      <p className="text-slate-500 dark:text-slate-400 font-medium animate-pulse">Loading Module...</p>
    </div>
  </div>
);

function App() {
  const { role, setUser, setRole, setDoctorInfo, setLoading } = useAuthStore();
  
  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (user) => {
      setUser(user);
      if (user) {
        // Find if this user is a doctor
        try {
          const doc = await doctorService.getDoctorById(user.uid);
          if (doc) {
            setRole('doctor');
            setDoctorInfo(doc);
          } else {
            setRole('admin');
            setDoctorInfo(null);
          }
        } catch (err) {
          console.error("Auth check failed:", err);
          // Default to admin or handle error
          setRole('admin');
          setDoctorInfo(null);
        }
      } else {
        setRole(null);
        setDoctorInfo(null);
      }
      setLoading(false);
    });
    return () => unsub();
  }, [setUser, setRole, setDoctorInfo, setLoading]);

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/" element={<Layout />}>
          <Route index element={<Suspense fallback={<FallbackLoader />}><Dashboard /></Suspense>} />
          <Route path="patients" element={<Suspense fallback={<FallbackLoader />}><PatientModule /></Suspense>} />
          <Route path="doctors" element={role === 'admin' ? <Suspense fallback={<FallbackLoader />}><DoctorManagement /></Suspense> : <Dashboard />} />
          <Route path="schedule" element={(role === 'admin' || role === 'doctor') ? <Suspense fallback={<FallbackLoader />}><DoctorSchedule /></Suspense> : <Dashboard />} />
          <Route path="analytics" element={<Suspense fallback={<FallbackLoader />}><AnalyticsModule /></Suspense>} />
          <Route path="settings" element={<Suspense fallback={<FallbackLoader />}><Settings /></Suspense>} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
