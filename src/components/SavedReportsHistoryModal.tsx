import React from 'react';
import { FullAnalysisReport, SavedCVItem } from '../types';
import { X, History, Trash2, ArrowRight, Calendar, UserCheck } from 'lucide-react';

type AnyReportItem = FullAnalysisReport | SavedCVItem;

interface SavedReportsHistoryModalProps {
  reports: AnyReportItem[];
  onSelectReport: (report: AnyReportItem) => void;
  onDeleteReport: (id: string) => void;
  onClearAll: () => void;
  onClose: () => void;
}

export const SavedReportsHistoryModal: React.FC<SavedReportsHistoryModalProps> = ({
  reports,
  onSelectReport,
  onDeleteReport,
  onClearAll,
  onClose,
}) => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm no-print font-sans">
      <div className="bg-[#0E0E0E] w-full max-w-2xl max-h-[85vh] flex flex-col overflow-hidden border border-white/10 rounded-md shadow-2xl">
        {/* Header */}
        <div className="p-5 border-b border-white/10 flex items-center justify-between bg-[#0A0A0A]">
          <div className="flex items-center gap-2">
            <History className="w-4 h-4 text-[#00FF41]" />
            <div>
              <h3 className="text-sm font-bold text-white uppercase tracking-wider font-mono">User Saved CVs & Research History</h3>
              <p className="text-xs text-white/50">{reports.length} saved CVs in BlackApple database</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xs text-white/50 hover:text-white bg-white/5 hover:bg-white/10 transition-colors cursor-pointer border border-white/10"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 overflow-y-auto space-y-3 bg-[#0E0E0E]">
          {reports.length === 0 ? (
            <div className="text-center py-12 text-white/40 text-xs font-mono">
              <History className="w-8 h-8 mx-auto mb-2 opacity-30 text-[#00FF41]" />
              <p>No saved research reports or CVs yet. Conduct an evaluation to save reports automatically.</p>
            </div>
          ) : (
            reports.map((item) => {
              const roleTitle = 'jobProfile' in item ? item.jobProfile.roleTitle : item.role;
              const company = 'jobProfile' in item ? item.jobProfile.company : item.company;
              const candidateName = 'userProfile' in item ? item.userProfile.name : item.tailoredCV?.personalInfo?.fullName;
              const score = 'qualification' in item ? item.qualification.qualificationScore : item.qualificationScore;
              const timestamp = 'timestamp' in item ? item.timestamp : item.updatedAt;

              return (
                <div
                  key={item.id}
                  className="p-4 rounded-xs bg-white/5 hover:bg-white/10 border border-white/10 hover:border-[#00FF41] transition-all flex items-center justify-between gap-4 group"
                >
                  <div className="space-y-1 flex-1 cursor-pointer" onClick={() => onSelectReport(item)}>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-sm text-white group-hover:text-[#00FF41]">
                        {roleTitle} @ {company}
                      </span>
                      <span className="px-2 py-0.5 rounded-xs text-[9px] font-mono font-bold bg-[#00FF41]/10 text-[#00FF41] border border-[#00FF41]/30">
                        Score: {score}%
                      </span>
                    </div>

                    <div className="flex flex-wrap items-center gap-3 text-[11px] text-white/50 font-mono">
                      <span className="flex items-center gap-1">
                        <UserCheck className="w-3 h-3 text-white/40" />
                        {candidateName || 'Candidate'}
                      </span>
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3 h-3 text-white/40" />
                        {new Date(timestamp).toLocaleDateString()}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => onSelectReport(item)}
                      className="px-3 py-1.5 rounded-xs bg-white text-black hover:bg-white/90 text-xs font-bold uppercase tracking-wider flex items-center gap-1 cursor-pointer font-mono"
                    >
                      <span>Load</span>
                      <ArrowRight className="w-3 h-3" />
                    </button>

                    <button
                      onClick={() => onDeleteReport(item.id)}
                      className="p-1.5 rounded-xs text-white/40 hover:text-rose-400 hover:bg-rose-500/10 transition-colors cursor-pointer border border-white/10"
                      title="Delete report"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Footer */}
        {reports.length > 0 && (
          <div className="p-4 border-t border-white/10 flex items-center justify-between bg-[#0A0A0A]">
            <button
              onClick={onClearAll}
              className="text-xs text-rose-400 font-mono uppercase tracking-wider hover:underline cursor-pointer"
            >
              Clear All History
            </button>
            <button
              onClick={onClose}
              className="px-4 py-2 rounded-xs bg-white/10 hover:bg-white/20 text-white text-xs font-bold uppercase tracking-wider cursor-pointer border border-white/10 font-mono"
            >
              Close
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

