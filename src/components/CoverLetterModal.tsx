import React, { useState } from 'react';
import { CoverLetter } from '../types';
import { X, Copy, Check, FileText } from 'lucide-react';

interface CoverLetterModalProps {
  coverLetter: CoverLetter;
  onClose: () => void;
}

export const CoverLetterModal: React.FC<CoverLetterModalProps> = ({ coverLetter, onClose }) => {
  const [copied, setCopied] = useState(false);

  const fullLetterText = `${coverLetter.salutation}

${coverLetter.openingParagraph}

${coverLetter.bodyParagraphs.join('\n\n')}

${coverLetter.closingParagraph}

${coverLetter.signOff}`;

  const handleCopy = () => {
    navigator.clipboard.writeText(fullLetterText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm no-print">
      <div className="bg-[#0E0E0E] w-full max-w-2xl max-h-[90vh] flex flex-col overflow-hidden border border-white/10 rounded-md shadow-2xl">
        {/* Header */}
        <div className="p-5 border-b border-white/10 flex items-center justify-between bg-[#0A0A0A]">
          <div className="flex items-center gap-2">
            <FileText className="w-4 h-4 text-[#00FF41]" />
            <div>
              <h3 className="text-sm font-bold text-white uppercase tracking-wider">Tailored Cover Letter</h3>
              <p className="text-xs text-white/50">Target Company: {coverLetter.companyName}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-sm text-white/50 hover:text-white bg-white/5 hover:bg-white/10 transition-colors cursor-pointer border border-white/10"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content Body - Paper preview */}
        <div className="p-6 overflow-y-auto bg-[#F5F5F5]">
          <div className="bg-white p-6 sm:p-8 border border-black/10 rounded-xs text-xs text-black font-serif leading-relaxed space-y-4 shadow-md">
            <p className="font-bold font-sans text-sm">{coverLetter.salutation}</p>
            <p>{coverLetter.openingParagraph}</p>
            {coverLetter.bodyParagraphs.map((paragraph, idx) => (
              <p key={idx}>{paragraph}</p>
            ))}
            <p>{coverLetter.closingParagraph}</p>
            <p className="pt-2 font-bold font-sans text-sm">{coverLetter.signOff}</p>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="p-4 border-t border-white/10 flex items-center justify-between bg-[#0A0A0A]">
          <span className="text-[11px] text-white/40 font-mono">Custom fitted to target company & key requirements</span>
          <div className="flex items-center gap-2">
            <button
              onClick={handleCopy}
              className="px-4 py-2 rounded-sm bg-white hover:bg-white/90 text-black font-bold text-xs uppercase tracking-wider transition-colors flex items-center gap-1.5 cursor-pointer"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-black" /> : <Copy className="w-3.5 h-3.5 text-black/60" />}
              <span>{copied ? 'Copied Letter!' : 'Copy to Clipboard'}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

