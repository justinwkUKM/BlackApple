import React, { useEffect, useState } from 'react';
import { Globe, FileSearch, ShieldCheck, FileCheck, Sparkles } from 'lucide-react';

interface AnalysisProgressProps {
  onCompleteHint?: () => void;
}

const STAGES = [
  { id: '01', label: 'Stage 01: Deep Scraping', icon: Globe, detail: 'Extracting candidate data from portfolio site and LinkedIn JSON structure.' },
  { id: '02', label: 'Stage 02: NLP Alignment', icon: FileSearch, detail: 'Parsing Job Description for hidden keywords and cultural tone markers.' },
  { id: '03', label: 'Stage 03: Qualification Gate', icon: ShieldCheck, detail: 'Evaluating skill coverage, gap matrix, and match confidence.' },
  { id: '04', label: 'Stage 04: Tailored CV Synthesis', icon: FileCheck, detail: 'Dynamic CV generation prioritizing relevant experience clusters.' },
  { id: '05', label: 'Stage 05: Interview & Outreach', icon: Sparkles, detail: 'Synthesizing tailored cover letter and interview talking points.' }
];

export const AnalysisProgress: React.FC<AnalysisProgressProps> = () => {
  const [currentStageIndex, setCurrentStageIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentStageIndex((prev) => {
        if (prev < STAGES.length - 1) return prev + 1;
        return prev;
      });
    }, 2200);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="max-w-2xl mx-auto px-4 py-12 text-center">
      {/* Top minimal status */}
      <div className="w-8 h-8 bg-white flex items-center justify-center rounded-sm mx-auto mb-4">
        <div className="w-4 h-4 border-2 border-[#0A0A0A] animate-spin"></div>
      </div>

      <h2 className="text-[10px] font-bold text-white/40 uppercase tracking-[0.2em] mb-2 font-mono">
        System Architecture Active
      </h2>
      <h3 className="text-2xl font-bold text-white mb-2 font-sans tracking-tight">
        Synthesizing CV & Qualification Engine
      </h3>
      <p className="text-xs text-white/50 mb-8 max-w-md mx-auto font-sans">
        Executing autonomous candidate research pipeline and tailoring document for job description alignment.
      </p>

      {/* Stepper list in clean minimal style */}
      <div className="bg-[#0E0E0E] border border-white/10 rounded-md p-6 text-left space-y-6">
        {STAGES.map((stage, idx) => {
          const isActive = idx === currentStageIndex;
          const isDone = idx < currentStageIndex;

          return (
            <div key={stage.id} className="relative pl-8 pb-1 border-l border-white/10 last:pb-0">
              {/* Dot */}
              <div
                className={`absolute -left-[5px] top-0.5 w-2.5 h-2.5 rounded-full transition-all ${
                  isActive
                    ? 'bg-[#00FF41] ring-4 ring-[#00FF41]/20'
                    : isDone
                    ? 'bg-white'
                    : 'bg-white/20'
                }`}
              />

              <div className="flex items-center justify-between mb-1">
                <h4 className={`text-sm font-semibold ${isActive ? 'text-white' : isDone ? 'text-white/90' : 'text-white/40'}`}>
                  {stage.label}
                </h4>
                {isActive && (
                  <span className="text-[10px] font-mono font-bold text-[#00FF41] uppercase tracking-wider animate-pulse">
                    [Executing]
                  </span>
                )}
                {isDone && (
                  <span className="text-[10px] font-mono text-white/40 uppercase">
                    [Complete]
                  </span>
                )}
              </div>
              <p className="text-xs text-white/50 leading-relaxed font-sans">{stage.detail}</p>
            </div>
          );
        })}
      </div>
    </div>
  );
};

