import React, { useState } from 'react';
import { UserAccount, SavedUserProfile, SavedCVItem } from '../types';
import { loginUser, registerUser, updateUserAccount } from '../lib/authStore';
import { auth, googleProvider } from '../lib/firebase';
import { signInWithPopup } from 'firebase/auth';
import { syncUserToFirestore } from '../lib/firestoreService';
import {
  X,
  User,
  Mail,
  Lock,
  ShieldCheck,
  CheckCircle2,
  LogIn,
  UserPlus,
  LogOut,
  Sparkles,
  Database,
  Globe,
  Linkedin,
  FileText,
  Phone,
  Edit3,
  ExternalLink,
  History,
  Check,
  Flame,
  Layers,
  ArrowRight,
  RefreshCw,
} from 'lucide-react';

interface AuthModalProps {
  currentUser: UserAccount | null;
  savedProfile?: SavedUserProfile | null;
  savedReportsCount?: number;
  savedReports?: SavedCVItem[];
  onUserChanged: (user: UserAccount) => void;
  onSignOut?: () => void;
  onOpenProfileEditor?: () => void;
  onOpenHistory?: () => void;
  onClose: () => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({
  currentUser,
  savedProfile,
  savedReportsCount = 0,
  savedReports = [],
  onUserChanged,
  onSignOut,
  onOpenProfileEditor,
  onOpenHistory,
  onClose,
}) => {
  // If not signed in: 'signin' | 'signup'
  // If signed in: 'profile' | 'storage' | 'account'
  const [authTab, setAuthTab] = useState<'signin' | 'signup'>('signin');
  const [settingsTab, setSettingsTab] = useState<'profile' | 'storage' | 'account'>('profile');

  // Form states
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [password, setPassword] = useState('');
  const [editDisplayName, setEditDisplayName] = useState(currentUser?.name || '');
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isAuthLoading, setIsAuthLoading] = useState(false);
  const [isSavingName, setIsSavingName] = useState(false);

  const handleGoogleSignIn = async () => {
    setIsAuthLoading(true);
    setError(null);
    try {
      const result = await signInWithPopup(auth, googleProvider);
      const fbUser = result.user;
      const userAcc: UserAccount = {
        id: fbUser.uid,
        name: fbUser.displayName || fbUser.email?.split('@')[0] || 'User',
        email: fbUser.email || '',
        avatarUrl: fbUser.photoURL || undefined,
        createdAt: new Date().toISOString(),
      };
      await syncUserToFirestore(userAcc);
      onUserChanged(userAcc);
      setMessage(`Authenticated as ${userAcc.name} via Google`);
      setTimeout(() => onClose(), 800);
    } catch (err: any) {
      console.error('Google Auth Error:', err);
      setError(err.message || 'Google Sign-In failed');
    } finally {
      setIsAuthLoading(false);
    }
  };

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;
    setError(null);
    try {
      const user = loginUser(email);
      await syncUserToFirestore(user);
      onUserChanged(user);
      setMessage(`Welcome back, ${user.name}!`);
      setTimeout(() => onClose(), 800);
    } catch (err: any) {
      setError(err.message || 'Failed to sign in');
    }
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !name.trim()) return;
    setError(null);
    try {
      const user = registerUser(name, email);
      await syncUserToFirestore(user);
      onUserChanged(user);
      setMessage(`Account created successfully for ${user.name}!`);
      setTimeout(() => onClose(), 800);
    } catch (err: any) {
      setError(err.message || 'Failed to register account');
    }
  };

  const handleDemoSwitch = async (demoEmail: string, demoName: string) => {
    const user = registerUser(demoName, demoEmail);
    await syncUserToFirestore(user);
    onUserChanged(user);
    setMessage(`Switched active profile to ${user.name}`);
    setTimeout(() => onClose(), 800);
  };

  const handleSaveDisplayName = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser || !editDisplayName.trim()) return;
    setIsSavingName(true);
    try {
      const updated = updateUserAccount(currentUser.id, { name: editDisplayName.trim() });
      await syncUserToFirestore(updated);
      onUserChanged(updated);
      setMessage('Profile display name updated successfully.');
      setTimeout(() => setMessage(null), 3000);
    } catch (err: any) {
      setError(err.message || 'Failed to update name');
    } finally {
      setIsSavingName(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md no-print font-sans">
      <div className="bg-[#0E0E0E] w-full max-w-lg border border-white/10 rounded-md shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Top Header */}
        <div className="p-5 border-b border-white/10 flex items-center justify-between bg-[#0A0A0A] shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xs bg-[#00FF41] flex items-center justify-center text-black font-black text-xs font-mono">
              BA
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-bold text-white uppercase tracking-wider font-mono">
                  {currentUser ? 'Account & Studio Settings' : 'BlackApple Authentication'}
                </h3>
                {currentUser && (
                  <span className="px-1.5 py-0.5 text-[9px] font-mono font-bold bg-[#00FF41]/10 text-[#00FF41] border border-[#00FF41]/30 rounded-xs">
                    CLOUD ACTIVE
                  </span>
                )}
              </div>
              <p className="text-[11px] text-white/50 font-sans">
                {currentUser
                  ? 'Manage your ground-truth profile, cloud storage & sync preferences'
                  : 'Sign in to access truthful CV generation & Firebase Firestore cloud persistence'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xs text-white/50 hover:text-white bg-white/5 hover:bg-white/10 transition-colors cursor-pointer border border-white/10"
            title="Close"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Dynamic Mode Switcher: NOT LOGGED IN vs LOGGED IN */}
        {!currentUser ? (
          /* ========================================================================= */
          /* 1. NOT LOGGED IN: SIGN IN & SIGN UP PORTAL                                */
          /* ========================================================================= */
          <div className="overflow-y-auto flex-1 p-6 space-y-5">
            {/* Toggle Tabs: Sign In vs Sign Up */}
            <div className="grid grid-cols-2 bg-black/60 p-1 rounded-xs border border-white/10 font-mono text-xs">
              <button
                type="button"
                onClick={() => {
                  setAuthTab('signin');
                  setError(null);
                }}
                className={`py-2 px-3 rounded-xs font-bold uppercase transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                  authTab === 'signin'
                    ? 'bg-[#00FF41] text-black shadow-sm'
                    : 'text-white/60 hover:text-white hover:bg-white/5'
                }`}
              >
                <LogIn className="w-3.5 h-3.5" />
                <span>Sign In</span>
              </button>
              <button
                type="button"
                onClick={() => {
                  setAuthTab('signup');
                  setError(null);
                }}
                className={`py-2 px-3 rounded-xs font-bold uppercase transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                  authTab === 'signup'
                    ? 'bg-[#00FF41] text-black shadow-sm'
                    : 'text-white/60 hover:text-white hover:bg-white/5'
                }`}
              >
                <UserPlus className="w-3.5 h-3.5" />
                <span>Create Account</span>
              </button>
            </div>

            {/* Notification Messages */}
            {message && (
              <div className="p-3 bg-[#00FF41]/10 border border-[#00FF41]/30 text-[#00FF41] text-xs font-mono rounded-xs flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 shrink-0" />
                <span>{message}</span>
              </div>
            )}

            {error && (
              <div className="p-3 bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs font-mono rounded-xs flex items-center gap-2">
                <X className="w-4 h-4 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            {/* Google OAuth One-Click */}
            <div>
              <button
                onClick={handleGoogleSignIn}
                disabled={isAuthLoading}
                className="w-full py-2.5 px-4 bg-white hover:bg-white/90 text-black font-bold text-xs uppercase tracking-wider transition-colors rounded-xs flex items-center justify-center gap-2.5 cursor-pointer font-mono shadow-md disabled:opacity-50"
              >
                {isAuthLoading ? (
                  <RefreshCw className="w-4 h-4 animate-spin text-black" />
                ) : (
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
                )}
                <span>{isAuthLoading ? 'Connecting to Google...' : 'Continue with Google'}</span>
              </button>

              <div className="flex items-center my-4">
                <div className="flex-1 border-t border-white/10"></div>
                <span className="px-3 text-[10px] text-white/40 uppercase tracking-widest font-mono">
                  OR EMAIL LOGIN
                </span>
                <div className="flex-1 border-t border-white/10"></div>
              </div>
            </div>

            {/* Email Form */}
            {authTab === 'signin' ? (
              <form onSubmit={handleSignIn} className="space-y-3.5">
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-white/60 mb-1 font-mono">
                    Email Address
                  </label>
                  <div className="relative">
                    <Mail className="w-4 h-4 absolute left-3 top-2.5 text-white/40" />
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="user@company.com"
                      className="w-full pl-9 pr-3 py-2 bg-white/5 border border-white/10 rounded-xs text-xs text-white placeholder-white/30 outline-none focus:border-[#00FF41] font-mono"
                    />
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="block text-[10px] font-bold uppercase tracking-wider text-white/60 font-mono">
                      Password
                    </label>
                    <span className="text-[10px] text-white/40 font-mono">Optional for demo</span>
                  </div>
                  <div className="relative">
                    <Lock className="w-4 h-4 absolute left-3 top-2.5 text-white/40" />
                    <input
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full pl-9 pr-3 py-2 bg-white/5 border border-white/10 rounded-xs text-xs text-white placeholder-white/30 outline-none focus:border-[#00FF41] font-mono"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  className="w-full py-2.5 bg-[#00FF41] hover:bg-[#00E03A] text-black font-bold text-xs uppercase tracking-widest transition-all rounded-xs flex items-center justify-center gap-1.5 cursor-pointer font-mono shadow-[0_0_12px_rgba(0,255,65,0.2)]"
                >
                  <LogIn className="w-3.5 h-3.5" />
                  <span>Sign In to BlackApple</span>
                </button>
              </form>
            ) : (
              <form onSubmit={handleSignUp} className="space-y-3.5">
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-white/60 mb-1 font-mono">
                    Full Name
                  </label>
                  <div className="relative">
                    <User className="w-4 h-4 absolute left-3 top-2.5 text-white/40" />
                    <input
                      type="text"
                      required
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="e.g. Waqas Obeidy"
                      className="w-full pl-9 pr-3 py-2 bg-white/5 border border-white/10 rounded-xs text-xs text-white placeholder-white/30 outline-none focus:border-[#00FF41]"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-white/60 mb-1 font-mono">
                    Email Address
                  </label>
                  <div className="relative">
                    <Mail className="w-4 h-4 absolute left-3 top-2.5 text-white/40" />
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="waqas@company.com"
                      className="w-full pl-9 pr-3 py-2 bg-white/5 border border-white/10 rounded-xs text-xs text-white placeholder-white/30 outline-none focus:border-[#00FF41] font-mono"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-white/60 mb-1 font-mono">
                    Password
                  </label>
                  <div className="relative">
                    <Lock className="w-4 h-4 absolute left-3 top-2.5 text-white/40" />
                    <input
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Create password"
                      className="w-full pl-9 pr-3 py-2 bg-white/5 border border-white/10 rounded-xs text-xs text-white placeholder-white/30 outline-none focus:border-[#00FF41] font-mono"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  className="w-full py-2.5 bg-[#00FF41] hover:bg-[#00E03A] text-black font-bold text-xs uppercase tracking-widest transition-all rounded-xs flex items-center justify-center gap-1.5 cursor-pointer font-mono shadow-[0_0_12px_rgba(0,255,65,0.2)]"
                >
                  <UserPlus className="w-3.5 h-3.5" />
                  <span>Create Account & Save Profile</span>
                </button>
              </form>
            )}

            {/* Quick Demo Logins Section */}
            <div className="p-3.5 bg-black/40 border border-white/10 rounded-xs space-y-2 font-mono">
              <div className="flex items-center justify-between text-[10px] text-white/60 uppercase font-bold">
                <span className="flex items-center gap-1">
                  <Flame className="w-3 h-3 text-[#00FF41]" />
                  Fast-Track Test Profiles:
                </span>
                <span className="text-[9px] text-[#00FF41]">1-Click Demo</span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => handleDemoSwitch('alex@blackapple.ai', 'Alex Vance')}
                  className="p-2 bg-white/5 hover:bg-white/10 border border-white/10 hover:border-[#00FF41]/40 rounded-xs text-left transition-colors cursor-pointer"
                >
                  <div className="text-xs font-bold text-white truncate">Alex Vance</div>
                  <div className="text-[10px] text-white/50 truncate">Principal Architect</div>
                </button>
                <button
                  type="button"
                  onClick={() => handleDemoSwitch('waqasobeidy@gmail.com', 'Waqas Obeidy')}
                  className="p-2 bg-white/5 hover:bg-white/10 border border-white/10 hover:border-[#00FF41]/40 rounded-xs text-left transition-colors cursor-pointer"
                >
                  <div className="text-xs font-bold text-white truncate">Waqas Obeidy</div>
                  <div className="text-[10px] text-white/50 truncate">PhD Researcher & HCI</div>
                </button>
              </div>
            </div>
          </div>
        ) : (
          /* ========================================================================= */
          /* 2. LOGGED IN: DYNAMIC ACCOUNT SETTINGS & PROFILE HUB                      */
          /* ========================================================================= */
          <div className="flex flex-col flex-1 overflow-hidden">
            {/* User Overview Top Card */}
            <div className="p-5 bg-[#121212] border-b border-white/10 flex items-center justify-between gap-4">
              <div className="flex items-center gap-3.5 min-w-0">
                <div className="w-12 h-12 rounded-full bg-[#00FF41]/10 border border-[#00FF41]/40 flex items-center justify-center text-[#00FF41] font-bold text-lg shrink-0 overflow-hidden shadow-inner">
                  {currentUser.avatarUrl ? (
                    <img src={currentUser.avatarUrl} alt="" className="w-full h-full object-cover" />
                  ) : (
                    currentUser.name.charAt(0).toUpperCase()
                  )}
                </div>
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <h4 className="text-sm font-bold text-white truncate font-sans">{currentUser.name}</h4>
                    <span className="px-1.5 py-0.2 text-[9px] font-mono font-bold bg-[#00FF41]/10 text-[#00FF41] border border-[#00FF41]/30 rounded-xs">
                      VERIFIED USER
                    </span>
                  </div>
                  <p className="text-xs text-white/60 font-mono truncate">{currentUser.email}</p>
                  <p className="text-[10px] text-white/40 font-mono">UID: {currentUser.id.slice(0, 16)}...</p>
                </div>
              </div>

              {onSignOut && (
                <button
                  type="button"
                  onClick={() => {
                    onSignOut();
                    onClose();
                  }}
                  className="px-3 py-1.5 bg-rose-500/10 hover:bg-rose-500/20 text-rose-300 border border-rose-500/30 rounded-xs text-xs font-mono font-bold uppercase transition-colors cursor-pointer flex items-center gap-1.5 shrink-0"
                  title="Sign Out"
                >
                  <LogOut className="w-3.5 h-3.5 text-rose-400" />
                  <span>Log Out</span>
                </button>
              )}
            </div>

            {/* Navigation Tabs */}
            <div className="flex border-b border-white/10 bg-[#0A0A0A] font-mono text-xs">
              <button
                type="button"
                onClick={() => setSettingsTab('profile')}
                className={`flex-1 py-2.5 text-center uppercase tracking-wider font-bold transition-colors border-b-2 flex items-center justify-center gap-1.5 ${
                  settingsTab === 'profile'
                    ? 'border-[#00FF41] text-[#00FF41] bg-white/5'
                    : 'border-transparent text-white/50 hover:text-white'
                }`}
              >
                <User className="w-3.5 h-3.5" />
                <span>Ground-Truth Profile</span>
              </button>
              <button
                type="button"
                onClick={() => setSettingsTab('storage')}
                className={`flex-1 py-2.5 text-center uppercase tracking-wider font-bold transition-colors border-b-2 flex items-center justify-center gap-1.5 ${
                  settingsTab === 'storage'
                    ? 'border-[#00FF41] text-[#00FF41] bg-white/5'
                    : 'border-transparent text-white/50 hover:text-white'
                }`}
              >
                <Database className="w-3.5 h-3.5" />
                <span>Cloud Resumes ({savedReportsCount})</span>
              </button>
              <button
                type="button"
                onClick={() => setSettingsTab('account')}
                className={`flex-1 py-2.5 text-center uppercase tracking-wider font-bold transition-colors border-b-2 flex items-center justify-center gap-1.5 ${
                  settingsTab === 'account'
                    ? 'border-[#00FF41] text-[#00FF41] bg-white/5'
                    : 'border-transparent text-white/50 hover:text-white'
                }`}
              >
                <Layers className="w-3.5 h-3.5" />
                <span>Account & Sync</span>
              </button>
            </div>

            {/* Tab Body */}
            <div className="p-6 overflow-y-auto flex-1 space-y-4">
              {message && (
                <div className="p-3 bg-[#00FF41]/10 border border-[#00FF41]/30 text-[#00FF41] text-xs font-mono rounded-xs flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 shrink-0" />
                  <span>{message}</span>
                </div>
              )}

              {error && (
                <div className="p-3 bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs font-mono rounded-xs">
                  <span>{error}</span>
                </div>
              )}

              {/* TAB 1: Ground-Truth Profile (User Uploaded Profile) */}
              {settingsTab === 'profile' && (
                <div className="space-y-4">
                  {savedProfile ? (
                    <div className="bg-white/5 border border-white/10 rounded-sm p-4 space-y-3.5">
                      <div className="flex items-start justify-between gap-3 pb-3 border-b border-white/10">
                        <div>
                          <div className="flex items-center gap-2">
                            <h4 className="text-sm font-bold text-white font-sans">
                              {savedProfile.userProfile.name}
                            </h4>
                            <span className="px-1.5 py-0.2 text-[9px] font-mono font-bold uppercase bg-[#00FF41]/10 text-[#00FF41] border border-[#00FF41]/30 rounded-xs">
                              ACTIVE BASELINE
                            </span>
                          </div>
                          <p className="text-xs text-white/70 font-mono mt-0.5">
                            {savedProfile.userProfile.headline}
                          </p>
                        </div>

                        {onOpenProfileEditor && (
                          <button
                            type="button"
                            onClick={() => {
                              onClose();
                              onOpenProfileEditor();
                            }}
                            className="px-2.5 py-1.5 bg-[#00FF41] hover:bg-[#00E03A] text-black font-bold font-mono text-xs uppercase rounded-xs transition-colors cursor-pointer flex items-center gap-1 shrink-0 shadow-sm"
                          >
                            <Edit3 className="w-3.5 h-3.5" />
                            <span>Edit Profile</span>
                          </button>
                        )}
                      </div>

                      {/* Contact and Location Chips */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs font-mono">
                        <div className="flex items-center gap-2 text-white/70 bg-black/40 p-2 rounded-xs border border-white/5">
                          <Globe className="w-3.5 h-3.5 text-[#00FF41] shrink-0" />
                          <span className="truncate">{savedProfile.userProfile.location || 'Remote'}</span>
                        </div>

                        {savedProfile.userProfile.email && (
                          <div className="flex items-center gap-2 text-white/70 bg-black/40 p-2 rounded-xs border border-white/5">
                            <Mail className="w-3.5 h-3.5 text-[#00FF41] shrink-0" />
                            <span className="truncate">{savedProfile.userProfile.email}</span>
                          </div>
                        )}

                        {savedProfile.userProfile.phone && (
                          <div className="flex items-center gap-2 text-white/70 bg-black/40 p-2 rounded-xs border border-white/5">
                            <Phone className="w-3.5 h-3.5 text-[#00FF41] shrink-0" />
                            <span className="truncate">{savedProfile.userProfile.phone}</span>
                          </div>
                        )}

                        {savedProfile.urls?.websiteUrl && (
                          <a
                            href={savedProfile.urls.websiteUrl}
                            target="_blank"
                            rel="noreferrer"
                            className="flex items-center justify-between text-white/70 hover:text-[#00FF41] bg-black/40 p-2 rounded-xs border border-white/5 transition-colors"
                          >
                            <span className="truncate">{savedProfile.urls.websiteUrl.replace(/^https?:\/\//, '')}</span>
                            <ExternalLink className="w-3 h-3 shrink-0 ml-1" />
                          </a>
                        )}
                      </div>

                      {/* Experience & Credentials Counter */}
                      <div className="grid grid-cols-3 gap-2 text-center font-mono py-1">
                        <div className="p-2 bg-white/5 rounded-xs border border-white/10">
                          <div className="text-sm font-bold text-[#00FF41]">
                            {savedProfile.userProfile.experience?.length || 0}
                          </div>
                          <div className="text-[10px] text-white/50 uppercase">Work Roles</div>
                        </div>
                        <div className="p-2 bg-white/5 rounded-xs border border-white/10">
                          <div className="text-sm font-bold text-white">
                            {savedProfile.userProfile.education?.length || 0}
                          </div>
                          <div className="text-[10px] text-white/50 uppercase">Degrees</div>
                        </div>
                        <div className="p-2 bg-white/5 rounded-xs border border-white/10">
                          <div className="text-sm font-bold text-white">
                            {savedProfile.userProfile.projects?.length || 0}
                          </div>
                          <div className="text-[10px] text-white/50 uppercase">Projects</div>
                        </div>
                      </div>

                      {/* Top Skills */}
                      {savedProfile.userProfile.topSkills?.length > 0 && (
                        <div className="space-y-1 pt-1">
                          <div className="text-[10px] font-bold uppercase text-white/40 font-mono">
                            Verified Core Competencies:
                          </div>
                          <div className="flex flex-wrap gap-1.5">
                            {savedProfile.userProfile.topSkills.slice(0, 7).map((skill, i) => (
                              <span
                                key={i}
                                className="px-2 py-0.5 bg-black/50 border border-white/10 text-white/80 text-[10px] font-mono rounded-xs"
                              >
                                {skill}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  ) : (
                    /* Empty profile state */
                    <div className="p-6 bg-white/5 border border-white/10 rounded-sm text-center space-y-3 font-sans">
                      <div className="w-10 h-10 rounded-full bg-[#00FF41]/10 text-[#00FF41] flex items-center justify-center mx-auto">
                        <User className="w-5 h-5" />
                      </div>
                      <div>
                        <h4 className="text-sm font-bold text-white">No Baseline Profile Saved Yet</h4>
                        <p className="text-xs text-white/50 mt-1 max-w-sm mx-auto">
                          Import your personal website, LinkedIn, or GitHub repository to store your ground-truth background for zero-hallucination resume tailoring.
                        </p>
                      </div>
                      {onOpenProfileEditor && (
                        <button
                          type="button"
                          onClick={() => {
                            onClose();
                            onOpenProfileEditor();
                          }}
                          className="px-4 py-2 bg-[#00FF41] text-black font-bold font-mono text-xs uppercase rounded-xs transition-colors cursor-pointer inline-flex items-center gap-1.5"
                        >
                          <Sparkles className="w-3.5 h-3.5" />
                          <span>Import & Extract Profile</span>
                        </button>
                      )}
                    </div>
                  )}
                </div>
              )}

              {/* TAB 2: Cloud Storage & Resumes */}
              {settingsTab === 'storage' && (
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-3 font-mono">
                    <div className="p-3.5 bg-white/5 border border-white/10 rounded-xs">
                      <div className="text-[10px] text-white/50 uppercase">Tailored CVs Stored</div>
                      <div className="text-lg font-bold text-[#00FF41] mt-1">{savedReportsCount}</div>
                      <div className="text-[10px] text-white/40 mt-1">Multi-device cloud synced</div>
                    </div>
                    <div className="p-3.5 bg-white/5 border border-white/10 rounded-xs">
                      <div className="text-[10px] text-white/50 uppercase">Firestore Database</div>
                      <div className="text-xs font-bold text-white mt-1.5 flex items-center gap-1">
                        <span className="w-2 h-2 rounded-full bg-[#00FF41]"></span>
                        <span>Connected (Live)</span>
                      </div>
                      <div className="text-[10px] text-white/40 mt-1">Auto-sync on generation</div>
                    </div>
                  </div>

                  {savedReports && savedReports.length > 0 ? (
                    <div className="space-y-2">
                      <div className="text-[10px] font-bold uppercase text-white/40 font-mono flex items-center justify-between">
                        <span>Recent Saved CVs</span>
                        {onOpenHistory && (
                          <button
                            type="button"
                            onClick={() => {
                              onClose();
                              onOpenHistory();
                            }}
                            className="text-[#00FF41] hover:underline cursor-pointer text-[10px]"
                          >
                            View All →
                          </button>
                        )}
                      </div>
                      <div className="space-y-1.5 max-h-48 overflow-y-auto">
                        {savedReports.slice(0, 3).map((item) => (
                          <div
                            key={item.id}
                            className="p-2.5 bg-black/40 border border-white/10 rounded-xs flex items-center justify-between text-xs font-mono"
                          >
                            <div className="min-w-0 pr-2">
                              <div className="font-bold text-white truncate">{item.title}</div>
                              <div className="text-[10px] text-white/50">
                                {new Date(item.updatedAt).toLocaleDateString()} • {item.company}
                              </div>
                            </div>
                            {item.qualificationScore && (
                              <span className="px-2 py-0.5 bg-[#00FF41]/10 border border-[#00FF41]/30 text-[#00FF41] text-[10px] font-bold rounded-xs shrink-0">
                                {item.qualificationScore}% MATCH
                              </span>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  ) : (
                    <div className="p-4 bg-black/40 border border-white/5 rounded-xs text-center text-xs text-white/50 font-mono">
                      No tailored CV drafts generated yet. Submit a job posting to create your first tailored resume.
                    </div>
                  )}

                  {onOpenHistory && (
                    <button
                      type="button"
                      onClick={() => {
                        onClose();
                        onOpenHistory();
                      }}
                      className="w-full py-2 bg-white/10 hover:bg-white/20 text-white font-mono font-bold text-xs uppercase rounded-xs transition-colors flex items-center justify-center gap-1.5 cursor-pointer border border-white/10"
                    >
                      <History className="w-3.5 h-3.5 text-[#00FF41]" />
                      <span>Open Full Saved Resumes History</span>
                    </button>
                  )}
                </div>
              )}

              {/* TAB 3: Account & Sync */}
              {settingsTab === 'account' && (
                <div className="space-y-4 font-sans">
                  <form onSubmit={handleSaveDisplayName} className="space-y-3">
                    <div>
                      <label className="block text-[10px] font-bold uppercase tracking-wider text-white/60 mb-1 font-mono">
                        Display Name
                      </label>
                      <div className="flex gap-2">
                        <input
                          type="text"
                          required
                          value={editDisplayName}
                          onChange={(e) => setEditDisplayName(e.target.value)}
                          className="flex-1 px-3 py-2 bg-white/5 border border-white/10 rounded-xs text-xs text-white outline-none focus:border-[#00FF41]"
                        />
                        <button
                          type="submit"
                          disabled={isSavingName}
                          className="px-3 py-2 bg-[#00FF41] hover:bg-[#00E03A] text-black font-bold font-mono text-xs uppercase rounded-xs transition-colors cursor-pointer disabled:opacity-50"
                        >
                          {isSavingName ? 'Saving...' : 'Save'}
                        </button>
                      </div>
                    </div>
                  </form>

                  <div className="space-y-2 border-t border-white/10 pt-3">
                    <div className="text-[10px] font-bold uppercase text-white/40 font-mono">
                      Switch Active Demo Profile:
                    </div>
                    <div className="grid grid-cols-2 gap-2 font-mono">
                      <button
                        type="button"
                        onClick={() => handleDemoSwitch('alex@blackapple.ai', 'Alex Vance')}
                        className="p-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xs text-left transition-colors cursor-pointer text-xs"
                      >
                        <div className="font-bold text-white truncate">Alex Vance</div>
                        <div className="text-[10px] text-white/50 truncate">Principal Architect</div>
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDemoSwitch('waqasobeidy@gmail.com', 'Waqas Obeidy')}
                        className="p-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xs text-left transition-colors cursor-pointer text-xs"
                      >
                        <div className="font-bold text-white truncate">Waqas Obeidy</div>
                        <div className="text-[10px] text-white/50 truncate">PhD Researcher & HCI</div>
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Footer */}
        <div className="p-4 border-t border-white/10 bg-[#0A0A0A] flex items-center justify-between text-[10px] text-white/40 font-mono shrink-0">
          <span className="flex items-center gap-1.5">
            <ShieldCheck className="w-3.5 h-3.5 text-[#00FF41]" />
            <span>Firebase Authentication & Firestore Database</span>
          </span>
          <button
            onClick={onClose}
            className="hover:text-white cursor-pointer uppercase tracking-wider text-xs font-bold font-mono"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
