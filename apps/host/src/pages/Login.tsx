import React, { useState } from 'react';
import { signInWithEmailAndPassword, sendPasswordResetEmail } from 'firebase/auth';
import { auth } from '../firebase';
import { useNavigate } from 'react-router-dom';
import { Mail, Lock, ArrowRight, AlertCircle, KeyRound, CheckCircle2 } from 'lucide-react';
import emailjs from '@emailjs/browser';

const Login: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const [isForgotPassword, setIsForgotPassword] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e?: React.FormEvent, emailOverride?: string, passwordOverride?: string) => {
    if (e) e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    const loginEmail = emailOverride || email;
    const loginPassword = passwordOverride || password;

    try {
      if (isForgotPassword) {
        if (!loginEmail) {
          setError('Please enter your email to reset password.');
          setLoading(false);
          return;
        }

        // 1. Trigger Firebase Reset (Core Logic)
        await sendPasswordResetEmail(auth, loginEmail);

        // 2. Notify via EmailJS (Enhanced Notification)
        // Use try-catch to ensure EmailJS failures don't block the UI success message
        try {
          if (typeof emailjs !== 'undefined') {
            await emailjs.send(
              import.meta.env.VITE_EMAILJS_SERVICE_ID,
              import.meta.env.VITE_EMAILJS_TEMPLATE_ID, 
              {
                to_name: loginEmail.split('@')[0],
                to_email: loginEmail,
                reset_link: 'https://reagahealthcare.netlify.app/login',
                message: 'A password reset request was initiated.'
              },
              import.meta.env.VITE_EMAILJS_PUBLIC_KEY
            );
          }
        } catch (mailErr) {
          console.warn('EmailJS notification skipped or failed:', mailErr);
        }

        setSuccess('Password reset link sent! Please check your inbox.');
        setIsForgotPassword(false);
      } else {
        await signInWithEmailAndPassword(auth, loginEmail, loginPassword);
        navigate('/');
      }
    } catch (err: any) {
      console.error(err);
      if (err.code === 'auth/invalid-credential' || err.code === 'auth/user-not-found') {
        setError('Invalid email or password. Please contact your administrator if you do not have an account.');
      } else if (err.code === 'auth/too-many-requests') {
        setError('Too many failed attempts. Please try again later.');
      } else {
        setError(err.message || 'Authentication failed. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleQuickLogin = async (e: string, p: string) => {
     setEmail(e);
     setPassword(p);
     handleSubmit(undefined, e, p);
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4 relative overflow-hidden">
      {/* Decorative background Elements */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-blue-400/20 blur-[100px] pointer-events-none"></div>
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full bg-indigo-400/20 blur-[100px] pointer-events-none"></div>

      <div className="w-full max-w-md bg-white rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-slate-100 p-8 relative z-10 animate-in fade-in zoom-in-95 duration-500">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center p-2 rounded-2xl mb-6">
            <img src="/assets/logo.png" alt="RAGA Logo" className="h-24 w-auto object-contain drop-shadow-md" />
          </div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
            {isForgotPassword ? 'Reset Password' : 'Welcome to RAGA HealthCare'}
          </h1>
          <p className="text-slate-500 mt-2 text-sm">
            {isForgotPassword ? 'Enter your email to receive a reset link' : 'Sign in to manage your healthcare platform'}
          </p>
        </div>

        {error && (
          <div className="mb-6 p-4 rounded-xl bg-rose-50 text-rose-600 flex flex-col gap-2 border border-rose-100 animate-in slide-in-from-top-2">
            <div className="flex items-start gap-3">
              <AlertCircle size={20} className="shrink-0 mt-0.5" />
              <p className="text-sm font-medium">{error}</p>
            </div>
          </div>
        )}

        {success && (
          <div className="mb-6 p-4 rounded-xl bg-emerald-50 text-emerald-700 flex items-start gap-3 border border-emerald-100 animate-in slide-in-from-top-2">
            <CheckCircle2 size={20} className="shrink-0 mt-0.5 text-emerald-600" />
            <p className="text-sm font-medium">{success}</p>
          </div>
        )}

        <form onSubmit={(e) => handleSubmit(e)} className="space-y-5">
          <div className="space-y-1.5">
            <label className="text-sm font-semibold text-slate-700 block">Email Address</label>
            <div className="relative group">
              <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-500 transition-colors" size={20} />
              <input
                type="email"
                required
                placeholder="admin@raga.ai"
                className="w-full pl-11 pr-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all font-medium text-slate-900 placeholder:text-slate-300"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
          </div>

          {!isForgotPassword && (
            <div className="space-y-1.5 animate-in fade-in slide-in-from-bottom-2 duration-300">
              <div className="flex items-center justify-between">
                <label className="text-sm font-semibold text-slate-700 block">Password</label>
                <button type="button" onClick={() => { setIsForgotPassword(true); setError(''); setSuccess(''); }} className="text-xs font-semibold text-blue-600 hover:text-blue-700">Forgot Password?</button>
              </div>
              <div className="relative group">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-500 transition-colors" size={20} />
                <input
                  type="password"
                  required
                  placeholder="••••••••"
                  className="w-full pl-11 pr-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all font-medium text-slate-900 text-lg tracking-widest placeholder:tracking-normal placeholder:text-slate-300"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 px-4 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white rounded-xl font-semibold shadow-md shadow-blue-500/20 transition-all flex items-center justify-center gap-2 group disabled:opacity-70 mt-4"
          >
            {loading ? (
              <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
            ) : (
              <>
                {isForgotPassword ? 'Send Reset Link' : 'Sign In'}
                {isForgotPassword ? <KeyRound size={18} /> : <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />}
              </>
            )}
          </button>
        </form>

        {!isForgotPassword && (
           <div className="mt-6">
              <div className="relative flex items-center justify-center mb-6">
                 <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-slate-100"></div></div>
                 <span className="relative px-3 bg-white text-[10px] font-bold text-slate-400 uppercase tracking-widest">Demo Quick Access</span>
              </div>
              <div className="grid grid-cols-2 gap-3">
                 <button 
                   onClick={() => handleQuickLogin('admin@raga.ai', 'admin123')}
                   className="py-2.5 px-3 bg-blue-50 hover:bg-blue-600 border border-blue-100 hover:border-blue-600 rounded-xl text-xs font-bold text-blue-700 hover:text-white transition-all shadow-sm flex items-center justify-center gap-2"
                 >
                    <div className="w-1.5 h-1.5 rounded-full bg-blue-500 group-hover:bg-white"></div>
                    Admin Portal
                 </button>
                 <button 
                   onClick={() => handleQuickLogin('koushi098@gmail.com', 'tu6uwq2lA1!')}
                   className="py-2.5 px-3 bg-indigo-50 hover:bg-indigo-600 border border-indigo-100 hover:border-indigo-600 rounded-xl text-xs font-bold text-indigo-700 hover:text-white transition-all shadow-sm flex items-center justify-center gap-2"
                 >
                    <div className="w-1.5 h-1.5 rounded-full bg-indigo-500 group-hover:bg-white"></div>
                    Doctor Portal
                 </button>
              </div>
           </div>
        )}

        {isForgotPassword && (
          <div className="mt-6 text-center animate-in fade-in duration-300">
            <button
              type="button"
              onClick={() => { setIsForgotPassword(false); setError(''); setSuccess(''); }}
              className="text-sm font-semibold text-slate-500 hover:text-slate-700 transition-colors flex items-center justify-center gap-1 mx-auto"
            >
              <ArrowRight size={14} className="rotate-180" /> Back to Sign In
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default Login;
