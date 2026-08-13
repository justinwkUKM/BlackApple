import React from 'react';
import { UserAccount } from '../types';
import { History, RefreshCw, LogIn, LogOut, User, ShieldCheck } from 'lucide-react';

interface NavbarProps {
  currentUser: UserAccount | null;
  onOpenAuth: () => void;
  onSignOut: () => void;
  onOpenHistory: () => void;
  onReset: () => void;
  savedReportsCount: number;
  hasActiveReport: boolean;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentUser,
  onOpenAuth,
  onSignOut,
  onOpenHistory,
  onReset,
  savedReportsCount,
  hasActiveReport
}) => {
  return (
    <header className="sticky top-0 z-40 w-full border-b border-white/10 bg-[#0A0A0A]/90 backdrop-blur-md no-print">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
        {/* Brand Logo & Title */}
        <div className="flex items-center gap-3 cursor-pointer group" onClick={onReset}>
          <div className="w-8 h-8 bg-[#00FF41] flex items-center justify-center rounded-xs shrink-0 group-hover:scale-105 transition-transform">
            <span className="font-black text-black text-xs font-mono tracking-tighter">BA</span>
          </div>
          <div className="flex flex-col">
            <div className="flex items-center gap-2">
              <span className="font-extrabold tracking-tight text-lg text-white font-sans uppercase">BLACKAPPLE</span>
              <span className="text-[9px] font-bold text-[#00FF41] uppercase tracking-[0.2em] font-mono px-1.5 py-0.5 border border-[#00FF41]/30 rounded-xs bg-[#00FF41]/10">
                DEEP RESEARCH CV
              </span>
            </div>
            <span className="text-[10px] text-white/40 hidden sm:block font-mono tracking-wider">INTELLIGENT CV STUDIO & QUALIFICATION MATCH</span>
          </div>
        </div>

        {/* Right Actions */}
        <div className="flex items-center gap-2 sm:gap-3 text-xs">
          {/* Saved CVs Button */}
          <button
            onClick={onOpenHistory}
            className="px-3 py-1.5 rounded-xs border border-white/10 bg-white/5 hover:bg-white/10 text-white/80 hover:text-white transition-colors flex items-center gap-1.5 relative font-medium cursor-pointer font-mono"
          >
            <History className="w-3.5 h-3.5 text-[#00FF41]" />
            <span>Saved CVs</span>
            {savedReportsCount > 0 && (
              <span className="ml-1 px-1.5 py-0.2 rounded-xs text-[9px] bg-[#00FF41] text-black font-bold font-mono">
                {savedReportsCount}
              </span>
            )}
          </button>

          {hasActiveReport && (
            <button
              onClick={onReset}
              className="px-3 py-1.5 rounded-xs border border-white/20 bg-white text-black font-bold hover:bg-white/90 transition-colors flex items-center gap-1.5 cursor-pointer text-xs uppercase tracking-wider font-mono"
            >
              <RefreshCw className="w-3 h-3 text-black" />
              <span className="hidden sm:inline">New Draft</span>
            </button>
          )}

          {/* User Auth Account / LogIn / LogOut Buttons */}
          {currentUser ? (
            <div className="flex items-center gap-2">
              {/* Active Account Pill */}
              <button
                onClick={onOpenAuth}
                className="px-2.5 py-1.5 rounded-xs border border-[#00FF41]/30 bg-[#00FF41]/10 hover:bg-[#00FF41]/20 text-white transition-colors flex items-center gap-2 cursor-pointer font-mono"
                title="Account Settings"
              >
                <div className="w-5 h-5 rounded-full bg-[#00FF41] text-black font-bold text-[10px] flex items-center justify-center shrink-0">
                  {currentUser.avatarUrl ? (
                    <img src={currentUser.avatarUrl} alt="" className="w-full h-full rounded-full object-cover" />
                  ) : (
                    currentUser.name.charAt(0).toUpperCase()
                  )}
                </div>
                <span className="hidden md:inline font-bold text-xs text-white">{currentUser.name}</span>
                <ShieldCheck className="w-3.5 h-3.5 text-[#00FF41] hidden sm:block" />
              </button>

              {/* Direct Logout Button */}
              <button
                onClick={onSignOut}
                className="px-2.5 py-1.5 rounded-xs border border-rose-500/30 bg-rose-500/10 hover:bg-rose-500/20 text-rose-300 transition-colors flex items-center gap-1.5 cursor-pointer font-mono font-bold uppercase text-[11px]"
                title="Sign Out"
              >
                <LogOut className="w-3.5 h-3.5 text-rose-400" />
                <span className="hidden sm:inline">Log Out</span>
              </button>
            </div>
          ) : (
            /* Direct Login Button */
            <button
              onClick={onOpenAuth}
              className="px-3.5 py-1.5 rounded-xs bg-[#00FF41] hover:bg-[#00FF41]/90 text-black font-bold font-mono text-xs uppercase tracking-wider transition-colors flex items-center gap-1.5 cursor-pointer shadow-sm"
            >
              <LogIn className="w-3.5 h-3.5 text-black" />
              <span>Log In / Sign Up</span>
            </button>
          )}
        </div>
      </div>
    </header>
  );
};



