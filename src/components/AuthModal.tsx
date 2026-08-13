import React, { useState } from 'react';
import { UserAccount } from '../types';
import { loginUser, registerUser } from '../lib/authStore';
import { auth, googleProvider } from '../lib/firebase';
import { signInWithPopup } from 'firebase/auth';
import { syncUserToFirestore } from '../lib/firestoreService';
import { X, User, Mail, ShieldCheck, CheckCircle2, LogIn, UserPlus, LogOut } from 'lucide-react';

interface AuthModalProps {
  currentUser: UserAccount | null;
  onUserChanged: (user: UserAccount) => void;
  onSignOut?: () => void;
  onClose: () => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({ currentUser, onUserChanged, onSignOut, onClose }) => {
  const [tab, setTab] = useState<'signin' | 'signup' | 'account'>(currentUser ? 'account' : 'signin');
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isAuthLoading, setIsAuthLoading] = useState(false);

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

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm no-print font-sans">
      <div className="bg-[#0E0E0E] w-full max-w-md border border-white/10 rounded-md shadow-2xl overflow-hidden">
        {/* Top Header */}
        <div className="p-5 border-b border-white/10 flex items-center justify-between bg-[#0A0A0A]">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-xs bg-[#00FF41] flex items-center justify-center text-black font-black text-xs font-mono">
              BA
            </div>
            <div>
              <h3 className="text-sm font-bold text-white uppercase tracking-wider font-mono">BlackApple Auth</h3>
              <p className="text-[11px] text-white/50">Firebase Authentication & Cloud Database</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xs text-white/50 hover:text-white bg-white/5 hover:bg-white/10 transition-colors cursor-pointer border border-white/10"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Tab Selection */}
        <div className="flex border-b border-white/10 bg-[#121212] text-xs font-mono">
          {currentUser && (
            <button
              onClick={() => setTab('account')}
              className={`flex-1 py-3 text-center uppercase tracking-wider font-bold transition-colors border-b-2 ${
                tab === 'account'
                  ? 'border-[#00FF41] text-[#00FF41] bg-white/5'
                  : 'border-transparent text-white/50 hover:text-white'
              }`}
            >
              Active Account
            </button>
          )}
          <button
            onClick={() => setTab('signin')}
            className={`flex-1 py-3 text-center uppercase tracking-wider font-bold transition-colors border-b-2 ${
              tab === 'signin'
                ? 'border-[#00FF41] text-[#00FF41] bg-white/5'
                : 'border-transparent text-white/50 hover:text-white'
            }`}
          >
            Sign In
          </button>
          <button
            onClick={() => setTab('signup')}
            className={`flex-1 py-3 text-center uppercase tracking-wider font-bold transition-colors border-b-2 ${
              tab === 'signup'
                ? 'border-[#00FF41] text-[#00FF41] bg-white/5'
                : 'border-transparent text-white/50 hover:text-white'
            }`}
          >
            Sign Up
          </button>
        </div>

        {/* Body Content */}
        <div className="p-6 space-y-4">
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

          {/* Google Sign-In Primary Banner */}
          <div className="space-y-2">
            <button
              onClick={handleGoogleSignIn}
              disabled={isAuthLoading}
              className="w-full py-2.5 px-4 bg-white hover:bg-white/90 text-black font-bold text-xs uppercase tracking-wider transition-colors rounded-xs flex items-center justify-center gap-2 cursor-pointer font-mono shadow-md disabled:opacity-50"
            >
              <svg className="w-4 h-4" viewBox="0 0 24 24">
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
              <span>{isAuthLoading ? 'Connecting to Google...' : 'Continue with Google'}</span>
            </button>

            <div className="flex items-center my-3">
              <div className="flex-1 border-t border-white/10"></div>
              <span className="px-3 text-[10px] text-white/40 uppercase tracking-widest font-mono">OR EMAIL</span>
              <div className="flex-1 border-t border-white/10"></div>
            </div>
          </div>

          {tab === 'account' && currentUser && (
            <div className="space-y-4 font-sans">
              <div className="p-4 bg-white/5 border border-white/10 rounded-xs flex items-center justify-between gap-3">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-12 h-12 rounded-full bg-[#00FF41]/20 border border-[#00FF41]/40 flex items-center justify-center text-[#00FF41] font-bold text-lg shrink-0">
                    {currentUser.name.charAt(0).toUpperCase()}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="text-sm font-bold text-white truncate">{currentUser.name}</h4>
                    <p className="text-xs text-white/50 font-mono truncate">{currentUser.email}</p>
                    <span className="inline-block mt-1 px-2 py-0.5 text-[9px] font-mono font-bold bg-[#00FF41]/10 text-[#00FF41] border border-[#00FF41]/30 rounded-xs">
                      ACTIVE SESSION
                    </span>
                  </div>
                </div>
              </div>

              {onSignOut && (
                <button
                  type="button"
                  onClick={() => {
                    onSignOut();
                    onClose();
                  }}
                  className="w-full py-2.5 bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 font-bold text-xs uppercase tracking-widest transition-colors border border-rose-500/30 rounded-xs flex items-center justify-center gap-2 cursor-pointer font-mono"
                >
                  <LogOut className="w-4 h-4 text-rose-400" />
                  <span>Log Out of Account</span>
                </button>
              )}
            </div>
          )}

          {tab === 'signin' && (
            <form onSubmit={handleSignIn} className="space-y-3 font-sans">
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
                    placeholder="user@example.com"
                    className="w-full pl-9 pr-3 py-2 bg-white/5 border border-white/10 rounded-xs text-xs text-white placeholder-white/30 outline-none focus:border-[#00FF41]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-bold uppercase tracking-wider text-white/60 mb-1 font-mono">
                  Password
                </label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-xs text-xs text-white placeholder-white/30 outline-none focus:border-[#00FF41]"
                />
              </div>

              <button
                type="submit"
                className="w-full py-2.5 bg-[#00FF41] hover:bg-[#00FF41]/90 text-black font-bold text-xs uppercase tracking-widest transition-colors rounded-xs flex items-center justify-center gap-1.5 cursor-pointer font-mono"
              >
                <LogIn className="w-3.5 h-3.5" />
                <span>Sign In to BlackApple</span>
              </button>
            </form>
          )}

          {tab === 'signup' && (
            <form onSubmit={handleSignUp} className="space-y-3 font-sans">
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
                    placeholder="e.g. Elena Rostova"
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
                    placeholder="elena@company.com"
                    className="w-full pl-9 pr-3 py-2 bg-white/5 border border-white/10 rounded-xs text-xs text-white placeholder-white/30 outline-none focus:border-[#00FF41]"
                  />
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-2.5 bg-white hover:bg-white/90 text-black font-bold text-xs uppercase tracking-widest transition-colors rounded-xs flex items-center justify-center gap-1.5 cursor-pointer font-mono"
              >
                <UserPlus className="w-3.5 h-3.5" />
                <span>Create BlackApple Account</span>
              </button>
            </form>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-white/10 bg-[#0A0A0A] flex items-center justify-between text-[10px] text-white/40 font-mono">
          <span className="flex items-center gap-1">
            <ShieldCheck className="w-3 h-3 text-[#00FF41]" /> Firebase Firestore Database
          </span>
          <button onClick={onClose} className="hover:text-white cursor-pointer uppercase tracking-wider">
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
