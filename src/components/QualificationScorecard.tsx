import React, { useEffect } from 'react';
import { QualificationResult, JobProfileData, UserProfileData } from '../types';
import { CheckCircle2, AlertTriangle, XCircle, Award, Target, Zap, ArrowRight, ShieldCheck, HelpCircle } from 'lucide-react';
import confetti from 'canvas-confetti';

interface QualificationScorecardProps {
  qualification: QualificationResult;
  jobProfile: JobProfileData;
  userProfile: UserProfileData;
  onProceedToCV: () => void;
}

export const QualificationScorecard: React.FC<QualificationScorecardProps> = ({
  qualification,
  jobProfile,
  onProceedToCV,
}) => {
  const { qualificationScore, isQualified, matchTier, summaryVerdict, keyStrengths, skillGaps, matchingRequirements, recommendationsToStandOut } = qualification;

  useEffect(() => {
    if (isQualified || qualificationScore >= 65) {
      confetti({
        particleCount: 50,
        spread: 60,
        origin: { y: 0.6 }
      });
    }
  }, [isQualified, qualificationScore]);

  return (
    <div className="max-w-4xl mx-auto px-4 space-y-6">
      {/* Top Banner Scorecard Card */}
      <div className="bg-[#0E0E0E] border border-white/10 rounded-md p-6 sm:p-8">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 pb-6 border-b border-white/10">
          {/* Header */}
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#00FF41] border border-[#00FF41]/30 bg-[#00FF41]/10 px-2.5 py-1 rounded-xs">
                {qualificationScore >= 70 ? 'STRONG ALIGNMENT' : qualificationScore >= 50 ? 'GROWTH FIT' : 'GAP AREA'}
              </span>
              <span className="text-[10px] text-white/40 font-mono tracking-widest uppercase">
                TIER: {matchTier}
              </span>
            </div>

            <h2 className="text-2xl sm:text-3xl font-bold text-white font-sans tracking-tight">
              Qualification Match Evaluation
            </h2>
            <p className="text-xs text-white/50 mt-1 font-sans">
              Target Role: <span className="text-white font-semibold">{jobProfile.roleTitle}</span> at{' '}
              <span className="text-[#00FF41] font-semibold">{jobProfile.company}</span>
            </p>
          </div>

          {/* Match Confidence Progress Box */}
          <div className="w-full md:w-56 p-4 bg-white/5 border border-white/10 rounded-md shrink-0">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-semibold uppercase tracking-wider text-white/70">Match Confidence</span>
              <span className="text-sm font-mono font-bold text-[#00FF41]">{qualificationScore}%</span>
            </div>
            <div className="h-1.5 w-full bg-white/10 rounded-full overflow-hidden">
              <div
                className="h-full bg-[#00FF41] transition-all duration-700"
                style={{ width: `${qualificationScore}%` }}
              ></div>
            </div>
          </div>
        </div>

        {/* Verdict Callout */}
        <div className="pt-6">
          <div className="p-4 bg-white/5 border border-white/10 rounded-md flex items-start gap-3">
            <Award className="w-5 h-5 text-[#00FF41] shrink-0 mt-0.5" />
            <div>
              <h4 className="text-[10px] font-bold text-white/40 uppercase tracking-[0.2em] mb-1 font-mono">
                System Verdict
              </h4>
              <p className="text-xs sm:text-sm text-white/90 leading-relaxed font-sans">
                {summaryVerdict}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Grid Matrix: Key Strengths vs Skill Gaps */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Key Strengths */}
        <div className="bg-[#0E0E0E] border border-white/10 rounded-md p-6">
          <h3 className="text-[10px] font-bold uppercase tracking-[0.2em] text-white/60 flex items-center gap-2 mb-4 font-mono">
            <Zap className="w-3.5 h-3.5 text-[#00FF41]" />
            Alignment Strengths
          </h3>
          <ul className="space-y-2">
            {keyStrengths.map((strength, idx) => (
              <li key={idx} className="flex items-start gap-2.5 text-xs text-white/80 bg-white/5 p-2.5 rounded-sm border border-white/10 font-sans">
                <CheckCircle2 className="w-4 h-4 text-[#00FF41] shrink-0 mt-0.5" />
                <span>{strength}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Skill Gaps */}
        <div className="bg-[#0E0E0E] border border-white/10 rounded-md p-6">
          <h3 className="text-[10px] font-bold uppercase tracking-[0.2em] text-white/60 flex items-center gap-2 mb-4 font-mono">
            <Target className="w-3.5 h-3.5 text-amber-400" />
            Identified Gaps
          </h3>
          <ul className="space-y-2">
            {skillGaps.map((gap, idx) => (
              <li key={idx} className="flex items-start gap-2.5 text-xs text-white/80 bg-white/5 p-2.5 rounded-sm border border-white/10 font-sans">
                <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                <span>{gap}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Detailed Requirements Matrix Breakdown */}
      {matchingRequirements && matchingRequirements.length > 0 && (
        <div className="bg-[#0E0E0E] border border-white/10 rounded-md p-6">
          <h3 className="text-[10px] font-bold uppercase tracking-[0.2em] text-white/60 flex items-center gap-2 mb-4 font-mono">
            <ShieldCheck className="w-3.5 h-3.5 text-white/60" />
            Job Requirements Matrix
          </h3>

          <div className="space-y-2">
            {matchingRequirements.map((item, idx) => (
              <div
                key={idx}
                className="p-3 bg-white/5 border border-white/10 rounded-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs"
              >
                <div className="space-y-0.5 flex-1">
                  <span className="font-semibold text-white">{item.requirement}</span>
                  <p className="text-[11px] text-white/50">{item.userEvidence}</p>
                </div>
                <div className="shrink-0">
                  {item.status === 'met' && (
                    <span className="px-2 py-0.5 rounded-xs text-[9px] font-mono font-bold bg-[#00FF41]/20 text-[#00FF41] border border-[#00FF41]/30">
                      MET
                    </span>
                  )}
                  {item.status === 'partial' && (
                    <span className="px-2 py-0.5 rounded-xs text-[9px] font-mono font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30">
                      PARTIAL
                    </span>
                  )}
                  {item.status === 'missing' && (
                    <span className="px-2 py-0.5 rounded-xs text-[9px] font-mono font-bold bg-rose-500/20 text-rose-300 border border-rose-500/30">
                      GAP
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Recommendations */}
      {recommendationsToStandOut && recommendationsToStandOut.length > 0 && (
        <div className="bg-[#0E0E0E] border border-white/10 rounded-md p-6">
          <h3 className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#00FF41] flex items-center gap-2 mb-3 font-mono">
            <HelpCircle className="w-3.5 h-3.5" />
            Strategic Positioning Advice
          </h3>
          <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-white/80">
            {recommendationsToStandOut.map((rec, idx) => (
              <li key={idx} className="flex items-start gap-2 bg-white/5 p-2.5 rounded-sm border border-white/10 font-sans">
                <span className="text-[#00FF41] font-bold">•</span>
                <span>{rec}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Bottom CTA to view generated CV */}
      <div className="flex flex-col sm:flex-row items-center justify-between p-6 rounded-md bg-[#161616] border border-white/10 gap-4">
        <div>
          <h3 className="text-base font-bold text-white">
            Personalized CV Synthesized & Tailored
          </h3>
          <p className="text-xs text-white/50 mt-0.5 font-sans">
            Keywords, bullet points, and accomplishments custom-formatted for this role.
          </p>
        </div>

        <button
          onClick={onProceedToCV}
          className="w-full sm:w-auto px-6 py-3 bg-white text-black font-bold text-xs uppercase tracking-widest hover:bg-white/90 transition-colors rounded-sm flex items-center justify-center gap-2 cursor-pointer shrink-0"
        >
          <span>Open Interactive CV Studio</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
};

