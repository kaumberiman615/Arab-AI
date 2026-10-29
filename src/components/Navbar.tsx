import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { 
  BookOpen, 
  HelpCircle, 
  Sparkles, 
  Cpu, 
  LogOut, 
  ShieldCheck, 
  Menu, 
  X,
  Languages,
  Award,
  PlusCircle,
  Brain
} from 'lucide-react';

export type NavTab = 'lessons' | 'quiz' | 'analyzer' | 'tutor' | 'admin';

interface NavbarProps {
  activeTab: NavTab;
  setActiveTab: (tab: NavTab) => void;
  userXp?: number;
}

export const Navbar: React.FC<NavbarProps> = ({ activeTab, setActiveTab, userXp = 120 }) => {
  const { user, logout, isAdmin } = useAuth();
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleLogout = async () => {
    setShowLogoutConfirm(false);
    await logout();
  };

  const navItems = [
    {
      id: 'lessons' as NavTab,
      label: 'Materi Belajar',
      labelArabic: 'الدُّرُوسُ',
      icon: BookOpen
    },
    {
      id: 'quiz' as NavTab,
      label: 'Kuis & Latihan',
      labelArabic: 'الاِخْتِبَارَاتُ',
      icon: HelpCircle
    },
    {
      id: 'analyzer' as NavTab,
      label: "Analisis Nahwu & I'rob",
      labelArabic: 'الإِعْرَابُ الذَّكِيُّ',
      icon: Brain
    },
    {
      id: 'tutor' as NavTab,
      label: 'Ustadz AI Tutor',
      labelArabic: 'المُعَلِّمُ الذَّكِيُّ',
      icon: Sparkles,
      highlight: true
    },
    ...(isAdmin ? [{
      id: 'admin' as NavTab,
      label: 'Kelola Materi (Admin)',
      labelArabic: 'الإِدَارَةُ',
      icon: PlusCircle,
      adminOnly: true
    }] : [])
  ];

  return (
    <>
      <header className="sticky top-0 z-40 bg-slate-900/95 backdrop-blur-md border-b border-emerald-900/40 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            
            {/* Logo & Arabic title */}
            <div 
              className="flex items-center gap-3 cursor-pointer select-none"
              onClick={() => setActiveTab('lessons')}
            >
              <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-emerald-600 via-teal-500 to-amber-500 flex items-center justify-center shadow-lg shadow-emerald-900/40 border border-emerald-400/30">
                <span className="font-arabic font-bold text-xl text-white">ع</span>
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <span className="font-extrabold text-white text-base tracking-tight">Al-Arabiya</span>
                  <span className="text-amber-400 font-bold">Pintar</span>
                  <span className="px-1.5 py-0.2 rounded text-[9px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                    AI
                  </span>
                </div>
                <p className="text-[11px] text-emerald-400/90 font-arabic font-medium leading-none">
                  العَرَبِيَّةُ لِلنَّاطِقِينَ بِغَيْرِهَا
                </p>
              </div>
            </div>

            {/* Desktop Navigation */}
            <nav className="hidden lg:flex items-center space-x-1">
              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = activeTab === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => setActiveTab(item.id)}
                    className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold transition cursor-pointer ${
                      isActive
                        ? item.highlight
                          ? 'bg-gradient-to-r from-emerald-600 to-teal-500 text-white shadow-md shadow-emerald-900/30'
                          : 'bg-slate-800 text-white border border-emerald-700/50'
                        : item.highlight
                        ? 'text-amber-400 hover:bg-slate-800/80 hover:text-amber-300'
                        : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    <span>{item.label}</span>
                    <span className="font-arabic text-[11px] opacity-75">{item.labelArabic}</span>
                  </button>
                );
              })}
            </nav>

            {/* User Profile, XP Badge & Logout */}
            <div className="hidden sm:flex items-center gap-3">
              {/* XP indicator */}
              <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-amber-500/15 border border-amber-500/30 text-amber-300 text-xs font-bold">
                <Award className="w-3.5 h-3.5 text-amber-400" />
                <span>{userXp} XP</span>
              </div>

              {/* User Identity Chip */}
              <div className="flex items-center gap-2.5 pl-2 border-l border-slate-800">
                <img
                  src={user?.photoURL || 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&auto=format&fit=crop&q=80'}
                  alt={user?.displayName || 'User'}
                  className="w-8 h-8 rounded-full object-cover ring-2 ring-emerald-500/40"
                />
                <div className="text-left text-xs">
                  <div className="font-bold text-white flex items-center gap-1 leading-tight">
                    <span className="truncate max-w-[120px]">{user?.displayName?.split(' ')[0]}</span>
                    {isAdmin ? (
                      <span className="px-1.5 py-0.2 rounded text-[9px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
                        Admin
                      </span>
                    ) : (
                      <span className="px-1.5 py-0.2 rounded text-[9px] font-bold bg-teal-500/20 text-teal-300 border border-teal-500/40">
                        Santri
                      </span>
                    )}
                  </div>
                  <span className="text-[10px] text-slate-400 font-mono truncate block max-w-[130px]">
                    {user?.email}
                  </span>
                </div>
              </div>

              {/* Tombol Logout */}
              <button
                type="button"
                onClick={() => setShowLogoutConfirm(true)}
                title="Keluar dari akun"
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-300 hover:text-white border border-rose-500/25 text-xs font-semibold transition cursor-pointer"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span>Logout</span>
              </button>
            </div>

            {/* Mobile menu button */}
            <div className="flex lg:hidden items-center gap-2">
              <button
                type="button"
                onClick={() => setShowLogoutConfirm(true)}
                className="p-2 rounded-xl bg-rose-500/10 text-rose-400 hover:bg-rose-500/20 text-xs cursor-pointer"
                title="Keluar"
              >
                <LogOut className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="p-2 rounded-xl bg-slate-800 text-slate-300 hover:text-white"
              >
                {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </button>
            </div>

          </div>
        </div>

        {/* Mobile dropdown menu */}
        {mobileMenuOpen && (
          <div className="lg:hidden border-t border-slate-800 bg-slate-900 px-4 pt-3 pb-4 space-y-1">
            <div className="p-2.5 mb-2 rounded-xl bg-slate-800/80 flex items-center justify-between text-xs">
              <div className="flex items-center gap-2">
                <span className="font-semibold text-white">{user?.displayName}</span>
              </div>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300">
                {isAdmin ? 'ADMIN' : 'SANTRI'} • {userXp} XP
              </span>
            </div>

            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => {
                    setActiveTab(item.id);
                    setMobileMenuOpen(false);
                  }}
                  className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-semibold ${
                    isActive
                      ? 'bg-emerald-600 text-white'
                      : 'text-slate-300 hover:bg-slate-800'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <Icon className="w-4 h-4" />
                    <span>{item.label}</span>
                  </div>
                  <span className="font-arabic text-sm text-emerald-300">{item.labelArabic}</span>
                </button>
              );
            })}
          </div>
        )}
      </header>

      {/* Logout Confirmation Dialog Modal */}
      {showLogoutConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-fade-in">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-sm w-full p-6 shadow-2xl text-center">
            <div className="w-12 h-12 rounded-full bg-rose-500/10 text-rose-400 flex items-center justify-center mx-auto mb-4 border border-rose-500/20">
              <LogOut className="w-6 h-6" />
            </div>
            <div className="font-arabic text-amber-400 text-base mb-1">
              هَلْ تُرِيدُ الخُرُوجَ؟
            </div>
            <h3 className="text-base font-bold text-white mb-2">Konfirmasi Keluar (Logout)</h3>
            <p className="text-xs text-slate-400 mb-6">
              Apakah Anda yakin ingin keluar dari akun <span className="text-emerald-300 font-mono font-medium">{user?.email}</span>?
            </p>
            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => setShowLogoutConfirm(false)}
                className="flex-1 px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold transition cursor-pointer"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={handleLogout}
                className="flex-1 px-4 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold shadow-lg shadow-rose-600/30 transition cursor-pointer"
              >
                Ya, Logout
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
