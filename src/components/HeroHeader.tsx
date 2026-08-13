import React from 'react';
import { Search, Github, ShieldCheck } from 'lucide-react';

export const HeroHeader: React.FC = () => {
  return (
    <div className="relative pt-8 pb-6 sm:pt-10 sm:pb-8 px-4 text-center max-w-4xl mx-auto">
      {/* Top Tag */}
      <div className="inline-flex items-center gap-2 px-3 py-1 rounded-xs bg-[#00FF41]/10 border border-[#00FF41]/30 text-[10px] font-bold uppercase tracking-[0.2em] text-[#00FF41] mb-6 font-mono">
        <span className="w-1.5 h-1.5 rounded-full bg-[#00FF41] animate-pulse"></span>
        <span>BlackApple Deep Research & LLM CV Studio</span>
      </div>

      {/* Main Title */}
      <h1 className="text-3xl sm:text-5xl lg:text-6xl font-extrabold text-white tracking-tight leading-[1.12] mb-4 font-sans">
        Deep Research Web Search & <br className="hidden sm:inline" />
        <span className="font-serif italic font-normal text-white border-b-2 border-[#00FF41]">
          Tailored LLM CV Studio
        </span>
      </h1>

      {/* Subtitle */}
      <p className="text-white/60 text-sm sm:text-base max-w-2xl mx-auto leading-relaxed mb-8 font-sans">
        Performs web search deep research on candidates (LinkedIn, GitHub, Portfolio) & job descriptions, scores qualification match, and drafts customized CVs with style templates.
      </p>

      {/* Action Badges */}
      <div className="flex flex-wrap items-center justify-center gap-2 text-xs font-mono">
        <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xs bg-white/5 border border-white/10 text-white/80">
          <Search className="w-3.5 h-3.5 text-[#00FF41]" />
          <span>LLM Grounded Web Search</span>
        </div>
        <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xs bg-white/5 border border-white/10 text-white/80">
          <Github className="w-3.5 h-3.5 text-white/60" />
          <span>GitHub & Portfolio Parsing</span>
        </div>
        <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xs bg-[#00FF41]/10 border border-[#00FF41]/30 text-[#00FF41]">
          <ShieldCheck className="w-3.5 h-3.5 text-[#00FF41]" />
          <span>Verified Experience Grounding</span>
        </div>
      </div>
    </div>
  );
};



