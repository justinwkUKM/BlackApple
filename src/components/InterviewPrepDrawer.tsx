import React from 'react';
import { InterviewPrep } from '../types';
import { X, HelpCircle, MessageSquare, Lightbulb, CheckCircle2 } from 'lucide-react';

interface InterviewPrepDrawerProps {
  interviewPrep: InterviewPrep;
  onClose: () => void;
}

export const InterviewPrepDrawer: React.FC<InterviewPrepDrawerProps> = ({ interviewPrep, onClose }) => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm no-print">
      <div className="bg-[#0E0E0E] w-full max-w-3xl max-h-[90vh] flex flex-col overflow-hidden border border-white/10 rounded-md shadow-2xl">
        {/* Header */}
        <div className="p-5 border-b border-white/10 flex items-center justify-between bg-[#0A0A0A]">
          <div className="flex items-center gap-2">
            <HelpCircle className="w-4 h-4 text-[#00FF41]" />
            <div>
              <h3 className="text-sm font-bold text-white uppercase tracking-wider">Interview Prep Guide</h3>
              <p className="text-xs text-white/50">Focus: {interviewPrep.roleFocus}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-sm text-white/50 hover:text-white bg-white/5 hover:bg-white/10 transition-colors cursor-pointer border border-white/10"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 overflow-y-auto space-y-6 text-xs text-white/80 font-sans leading-relaxed bg-[#0E0E0E]">
          {/* Key Talking Points */}
          <div>
            <h4 className="text-[10px] font-bold font-mono uppercase tracking-[0.2em] text-[#00FF41] flex items-center gap-1.5 mb-2">
              <Lightbulb className="w-3.5 h-3.5" />
              Core Resume Talking Points
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {interviewPrep.keyTalkingPoints.map((point, idx) => (
                <div key={idx} className="p-2.5 rounded-sm bg-white/5 border border-white/10 text-white/90 flex items-start gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-[#00FF41] shrink-0 mt-0.5" />
                  <span>{point}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Anticipated Questions */}
          <div>
            <h4 className="text-[10px] font-bold font-mono uppercase tracking-[0.2em] text-white/60 flex items-center gap-1.5 mb-3">
              <MessageSquare className="w-3.5 h-3.5 text-white/60" />
              Anticipated Interview Questions
            </h4>
            <div className="space-y-3">
              {interviewPrep.likelyQuestions.map((item, idx) => (
                <div key={idx} className="p-4 rounded-sm bg-white/5 border border-white/10 space-y-2">
                  <p className="font-bold text-white text-xs">
                    Q{idx + 1}: "{item.question}"
                  </p>
                  <p className="text-[11px] text-white/50 italic font-serif">
                    Why asked: {item.whyAsked}
                  </p>
                  <div className="p-2.5 rounded-xs bg-[#00FF41]/10 border border-[#00FF41]/20 text-white/90 text-[11px] leading-relaxed">
                    <span className="font-bold text-[#00FF41] font-mono block mb-0.5 uppercase tracking-wider text-[10px]">Suggested Strategy:</span>
                    {item.suggestedAnswer}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Strategic Questions to Ask Employer */}
          <div>
            <h4 className="text-[10px] font-bold font-mono uppercase tracking-[0.2em] text-white/60 mb-2">
              Questions to Ask Employer
            </h4>
            <ul className="list-disc pl-4 space-y-1 text-white/80 text-xs">
              {interviewPrep.questionsToAskEmployer.map((q, idx) => (
                <li key={idx}>{q}</li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

