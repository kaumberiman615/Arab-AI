import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { 
  BookOpen, 
  Lock, 
  Mail, 
  Sparkles, 
  ShieldCheck, 
  ArrowRight, 
  Eye, 
  EyeOff, 
  AlertCircle,
  CheckCircle2,
  GraduationCap,
  Languages
} from 'lucide-react';

export const LoginPage: React.FC = () => {
  const { loginWithEmail, loginWithGoogleHandler } = useAuth();
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Quick fill helper for requested Admin account
  const fillAdminCredentials = () => {
    setEmail('fakhitaruqayyah04@gmail.com');
    setPassword('Kauman615');
    setError(null);
  };

  const fillStudentCredentials = () => {
    setEmail('santri@alarabiya.id');
    setPassword('Santri123');
    setError(null);
  };

  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      await loginWithEmail(email, password);
      setSuccessMsg('Ahlan wa Sahlan! Login berhasil, mengalihkan ke media pembelajaran...');
    } catch (err: any) {
      setError(err.message || 'Login gagal. Periksa kembali email dan kata sandi Anda.');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setError(null);
    setLoading(true);
    try {
      await loginWithGoogleHandler();
      setSuccessMsg('Login Google berhasil! Mengalihkan...');
    } catch (err: any) {
      setError(err.message || 'Gagal masuk dengan Google.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-950 via-slate-900 to-teal-950 flex flex-col justify-center items-center p-4 selection:bg-emerald-500 selection:text-white">
      {/* Background ambient lighting */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

      <div className="w-full max-w-md relative z-10">
        {/* Brand Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-3xl bg-gradient-to-tr from-emerald-600 via-teal-500 to-amber-500 shadow-xl shadow-emerald-900/40 mb-4 border border-emerald-400/30">
            <span className="text-3xl font-extrabold text-white font-arabic">ع</span>
          </div>
          <div className="text-emerald-400 font-arabic text-xl font-bold mb-1">
            العَرَبِيَّةُ الذَّكِيَّةُ
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight flex items-center justify-center gap-2">
            Al-Arabiya <span className="text-amber-400">Pintar</span>
          </h1>
          <p className="text-slate-300 text-xs sm:text-sm mt-1">
            Media Pembelajaran Bahasa Arab Interaktif & Asisten Gemini AI
          </p>
        </div>

        {/* Main Login Card */}
        <div className="bg-slate-900/85 backdrop-blur-xl border border-emerald-800/40 rounded-3xl p-6 sm:p-8 shadow-2xl shadow-black/60">
          <div className="flex items-center justify-between pb-4 border-b border-slate-800 mb-6">
            <div>
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                <span>Masuk ke Portal</span>
                <span className="font-arabic text-emerald-400 text-sm">تَسْجِيلُ الدُّخُولِ</span>
              </h2>
              <p className="text-xs text-slate-400">Silakan login untuk mengakses materi & kuis</p>
            </div>
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-semibold bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
              <ShieldCheck className="w-3.5 h-3.5" />
              Wajib Login
            </span>
          </div>

          {/* Error / Success Alerts */}
          {error && (
            <div className="mb-4 p-3.5 rounded-xl bg-rose-500/15 border border-rose-500/30 text-rose-300 text-xs flex items-start gap-2.5">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-400 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          {successMsg && (
            <div className="mb-4 p-3.5 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-xs flex items-center gap-2.5">
              <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-400" />
              <span>{successMsg}</span>
            </div>
          )}

          {/* Login Form */}
          <form onSubmit={handleEmailSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Email / Username Pengguna
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="fakhitaruqayyah04@gmail.com"
                  required
                  className="w-full bg-slate-800/90 border border-slate-700 rounded-xl py-2.5 pl-10 pr-4 text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition"
                />
              </div>
            </div>

            <div>
              <div className="flex justify-between items-center mb-1.5">
                <label className="block text-xs font-semibold text-slate-300">
                  Kata Sandi (Password)
                </label>
                <span className="text-[11px] text-slate-500">Min. 6 karakter</span>
              </div>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Kauman615"
                  required
                  className="w-full bg-slate-800/90 border border-slate-700 rounded-xl py-2.5 pl-10 pr-10 text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-200 transition"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-emerald-600 to-teal-500 hover:from-emerald-500 hover:to-teal-400 text-white font-bold py-3 px-4 rounded-xl shadow-lg shadow-emerald-700/30 flex items-center justify-center gap-2 text-sm transition disabled:opacity-50 cursor-pointer group"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  <span>Masuk Belajar</span>
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition" />
                </>
              )}
            </button>
          </form>

          {/* Divider */}
          <div className="relative my-6 text-center">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-slate-800" />
            </div>
            <span className="relative px-3 bg-slate-900 text-[11px] uppercase tracking-wider text-slate-500 font-medium">
              atau masuk dengan
            </span>
          </div>

          {/* Google Sign-In (Firebase Auth) */}
          <button
            type="button"
            onClick={handleGoogleSignIn}
            disabled={loading}
            className="w-full bg-slate-800 hover:bg-slate-750 border border-slate-700 text-white text-xs sm:text-sm font-semibold py-2.5 px-4 rounded-xl flex items-center justify-center gap-3 transition cursor-pointer hover:border-slate-600"
          >
            <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24">
              <path
                fill="#4285F4"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              />
              <path
                fill="#34A853"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              />
              <path
                fill="#FBBC05"
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
              />
              <path
                fill="#EA4335"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
              />
            </svg>
            <span>Google Sign-In (Firebase Auth)</span>
          </button>

          {/* Quick-Fill Credentials Helper (Akun Admin Resmi) */}
          <div className="mt-6 pt-5 border-t border-slate-800">
            <p className="text-[11px] font-semibold text-slate-400 mb-2.5 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              Pintasan Akun Resmi & Uji Cepat:
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              <button
                type="button"
                onClick={fillAdminCredentials}
                className="text-left p-2.5 rounded-xl bg-emerald-950/60 hover:bg-emerald-900/60 border border-emerald-700/40 text-xs transition group cursor-pointer"
              >
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-emerald-300">Akun Admin / Ustadzah</span>
                  <span className="text-[9px] px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-300 font-mono">Full</span>
                </div>
                <p className="text-slate-300 text-[11px] truncate mt-0.5 font-mono">fakhitaruqayyah04@gmail.com</p>
                <p className="text-slate-400 text-[10px] font-mono">Pass: Kauman615</p>
              </button>

              <button
                type="button"
                onClick={fillStudentCredentials}
                className="text-left p-2.5 rounded-xl bg-slate-800/60 hover:bg-slate-750 border border-slate-700 text-xs transition group cursor-pointer"
              >
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-slate-300">Akun Santri / Murid</span>
                  <span className="text-[9px] px-1.5 py-0.5 rounded bg-slate-600/30 text-slate-400 font-mono">Student</span>
                </div>
                <p className="text-slate-300 text-[11px] truncate mt-0.5 font-mono">santri@alarabiya.id</p>
                <p className="text-slate-400 text-[10px] font-mono">Pass: Santri123</p>
              </button>
            </div>
          </div>
        </div>

        {/* Footer badges */}
        <div className="mt-6 flex flex-wrap items-center justify-center gap-3 text-xs text-slate-400">
          <span className="flex items-center gap-1">
            <Languages className="w-3.5 h-3.5 text-emerald-400" />
            Bahasa Arab Berharakat Lengkap
          </span>
          <span>•</span>
          <span className="flex items-center gap-1">
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            Gemini AI Tutor Server-Side
          </span>
          <span>•</span>
          <span>Vercel Ready</span>
        </div>
      </div>
    </div>
  );
};
