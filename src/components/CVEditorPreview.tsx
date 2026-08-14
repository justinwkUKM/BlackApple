import React, { useState } from 'react';
import { TailoredCV, JobProfileData, CustomLink, StylingConfig, TemplateStyle } from '../types';
import {
  Printer, Copy, Sparkles, Check, Edit3, Plus, Trash2, Layout, Mail,
  HelpCircle, ArrowLeft, Github, Linkedin, Globe, Twitter, Dribbble, Link as LinkIcon,
  Image as ImageIcon, Sliders, Palette, Type, Maximize2, Download, Building2
} from 'lucide-react';

interface CVEditorPreviewProps {
  cv: TailoredCV;
  jobProfile: JobProfileData;
  onUpdateCV: (updatedCV: TailoredCV) => void;
  onOpenCoverLetter: () => void;
  onOpenInterviewPrep: () => void;
  onBackToScorecard: () => void;
}

const DEFAULT_STYLING: StylingConfig = {
  fontFamily: 'sans',
  accentColor: '#00FF41',
  density: 'normal',
  paperBg: 'white',
  borderStyle: 'solid',
  photoShape: 'circle',
};

const ACCENT_OPTIONS = [
  { label: 'Neon Green', hex: '#00FF41' },
  { label: 'Obsidian Black', hex: '#0E0E0E' },
  { label: 'Cobalt Blue', hex: '#2563EB' },
  { label: 'Emerald', hex: '#059669' },
  { label: 'Sunset Amber', hex: '#D97706' },
  { label: 'Royal Purple', hex: '#7C3AED' },
];

const getLayoutClasses = (templateStyle: TemplateStyle) => {
  const isClassic = templateStyle === 'classic' || templateStyle === 'ivory' || templateStyle === 'ats';
  const isExecutive = templateStyle === 'executive';

  if (isClassic) {
    return {
      type: 'classic' as const,
      container: 'cv-print-container shadow-2xl p-8 sm:p-12 border border-slate-300 rounded-none flex flex-col gap-6 bg-[#FAFAF8] text-slate-900 font-serif max-w-4xl mx-auto transition-all',
      header: 'text-center border-b-2 border-double border-slate-800 pb-5 space-y-2',
      title: 'text-3xl sm:text-4xl font-serif font-bold tracking-normal uppercase text-slate-900',
      subtitle: 'text-sm font-serif italic text-slate-700 tracking-wide',
      contactLine: 'flex flex-wrap items-center justify-center gap-2 text-xs font-serif text-slate-700 mt-2 uppercase tracking-wider',
      sectionHeader: 'text-xs font-serif font-bold uppercase tracking-[0.25em] text-center border-b border-t border-slate-800 py-1.5 my-3 text-slate-900',
      skillsWrapper: 'p-3 bg-slate-100/80 border border-slate-300 text-center font-serif text-xs leading-relaxed text-slate-800',
      skillBadge: 'inline-block px-2.5 py-0.5 m-0.5 bg-slate-200 text-slate-800 rounded-none text-xs font-serif font-semibold',
      expItem: 'space-y-1.5 pb-3 border-b border-slate-200 last:border-none',
      expHeader: 'flex justify-between items-baseline font-serif',
      expRole: 'font-serif font-bold text-sm text-slate-900',
      expCompany: 'font-serif italic text-slate-700 ml-1',
      expPeriod: 'font-serif italic text-xs text-slate-600',
      bullets: 'list-disc pl-5 space-y-1 text-xs sm:text-sm leading-relaxed text-slate-800 font-serif',
      projectCard: 'p-3 border border-slate-300 rounded-none bg-white/60 space-y-1 font-serif',
    };
  }

  if (isExecutive) {
    return {
      type: 'executive' as const,
      container: 'cv-print-container shadow-2xl p-0 border border-slate-300 rounded-lg overflow-hidden flex flex-col bg-white dark:bg-[#0E0E0E] text-slate-900 dark:text-slate-100 font-sans transition-all',
      header: 'p-8 bg-slate-950 text-white flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 border-b-4',
      title: 'text-3xl sm:text-4xl font-extrabold uppercase tracking-widest text-white',
      subtitle: 'text-sm font-bold tracking-wider uppercase text-[#00FF41]',
      contactLine: 'flex flex-wrap items-center gap-3 text-xs text-slate-300 font-mono mt-2',
      sectionHeader: 'text-xs font-extrabold uppercase tracking-[0.2em] font-mono text-slate-900 dark:text-white border-b-2 border-slate-900 dark:border-white pb-1.5 flex items-center justify-between',
      skillsWrapper: 'grid grid-cols-1 sm:grid-cols-3 gap-3 p-4 bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-md',
      skillBadge: 'px-2 py-0.5 bg-slate-200 dark:bg-white/10 text-slate-800 dark:text-white rounded-xs text-[11px] font-mono font-semibold',
      expItem: 'p-4 bg-slate-50 dark:bg-white/5 rounded-md border border-slate-200 dark:border-white/10 space-y-2 shadow-2xs',
      expHeader: 'flex flex-col sm:flex-row justify-between items-start sm:items-baseline gap-1',
      expRole: 'font-bold text-sm text-slate-900 dark:text-white',
      expCompany: 'italic text-slate-700 dark:text-slate-300 ml-1',
      expPeriod: 'px-2.5 py-0.5 bg-slate-900 text-white dark:bg-white/15 dark:text-white font-mono text-[11px] font-bold rounded-xs shrink-0',
      bullets: 'list-disc pl-4 space-y-1.5 text-xs sm:text-sm leading-relaxed text-slate-700 dark:text-slate-300',
      projectCard: 'p-3.5 border border-slate-200 dark:border-white/10 rounded-md bg-slate-50 dark:bg-white/5 space-y-1.5',
    };
  }

  // Modern (Default)
  return {
    type: 'modern' as const,
    container: 'cv-print-container shadow-2xl p-8 sm:p-12 border border-slate-200 dark:border-white/10 rounded-lg flex flex-col gap-6 bg-white dark:bg-[#0E0E0E] text-slate-900 dark:text-slate-100 font-sans transition-all',
    header: 'border-b pb-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6',
    title: 'text-3xl sm:text-4xl font-black uppercase tracking-tight',
    subtitle: 'text-base font-bold italic mt-0.5',
    contactLine: 'flex flex-wrap items-center gap-2.5 text-xs font-mono bg-slate-100/80 dark:bg-white/5 p-2.5 rounded-md border border-slate-200 dark:border-white/10 text-slate-700 dark:text-slate-300 mt-2',
    sectionHeader: 'text-xs font-extrabold uppercase tracking-[0.2em] font-mono border-l-4 pl-3 py-1 bg-slate-50 dark:bg-white/5 rounded-r-md',
    skillsWrapper: 'flex flex-wrap gap-2 text-xs font-mono',
    skillBadge: 'px-3 py-1 bg-slate-100 dark:bg-white/10 border border-slate-200 dark:border-white/10 text-slate-800 dark:text-white rounded-full font-mono text-xs font-semibold shadow-2xs',
    expItem: 'p-4 bg-slate-50/70 dark:bg-white/5 rounded-lg border-l-4 space-y-2 shadow-2xs',
    expHeader: 'flex justify-between items-baseline',
    expRole: 'font-bold text-sm text-slate-900 dark:text-white',
    expCompany: 'italic text-slate-700 dark:text-slate-300 ml-1',
    expPeriod: 'font-mono text-xs opacity-75',
    bullets: 'list-disc pl-4 space-y-1 text-xs sm:text-sm leading-relaxed text-slate-700 dark:text-slate-300',
    projectCard: 'p-4 bg-slate-50/80 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-lg shadow-2xs space-y-1.5',
  };
};

export const CVEditorPreview: React.FC<CVEditorPreviewProps> = ({
  cv,
  jobProfile,
  onUpdateCV,
  onOpenCoverLetter,
  onOpenInterviewPrep,
  onBackToScorecard,
}) => {
  const [template, setTemplate] = useState<TemplateStyle>('blackapple');
  const [styling, setStyling] = useState<StylingConfig>(DEFAULT_STYLING);
  const [isEditing, setIsEditing] = useState(false);
  const [showStylePanel, setShowStylePanel] = useState(false);
  const [copiedFormat, setCopiedFormat] = useState<'markdown' | null>(null);
  const [refinePrompt, setRefinePrompt] = useState('');
  const [isRefining, setIsRefining] = useState(false);

  // Local state for interactive editing
  const [editableCV, setEditableCV] = useState<TailoredCV>(() => ({
    ...cv,
    personalInfo: {
      ...cv.personalInfo,
      showPhoto: cv.personalInfo.showPhoto ?? true,
      photoUrl: cv.personalInfo.photoUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
      links: cv.personalInfo.links || [
        { id: '1', label: 'GitHub', url: cv.personalInfo.github || 'https://github.com', platform: 'github' },
        { id: '2', label: 'LinkedIn', url: cv.personalInfo.linkedin || 'https://linkedin.com', platform: 'linkedin' },
        { id: '3', label: 'Portfolio', url: cv.personalInfo.website || 'https://portfolio.dev', platform: 'portfolio' },
      ],
    },
  }));

  // New Link State for Editing
  const [newLinkLabel, setNewLinkLabel] = useState('');
  const [newLinkUrl, setNewLinkUrl] = useState('');
  const [newLinkPlatform, setNewLinkPlatform] = useState<CustomLink['platform']>('github');

  const handlePrint = () => {
    window.print();
  };

  const handleCopyMarkdown = () => {
    const md = `# ${editableCV.personalInfo.fullName}
${editableCV.personalInfo.professionalTitle}
Email: ${editableCV.personalInfo.email} | Phone: ${editableCV.personalInfo.phone} | Location: ${editableCV.personalInfo.location}

## Relevant Links
${editableCV.personalInfo.links?.map((l) => `- [${l.label}](${l.url})`).join('\n') || ''}

## Summary
${editableCV.personalInfo.summary}

## Core Specialties
${editableCV.skills.coreSpecialties.join(', ')}

## Experience
${editableCV.experience
  .map(
    (e) => `### ${e.role} — ${e.company} (${e.period})
${e.bullets.map((b) => `- ${b}`).join('\n')}`
  )
  .join('\n\n')}

## Education
${editableCV.education
  .map((e) => `- ${e.degree}, ${e.institution} (${e.year})`)
  .join('\n')}

## Projects
${editableCV.projects
  .map(
    (p) => `### ${p.name}
${p.description}
Technologies: ${p.technologies.join(', ')}
${p.highlights.map((h) => `- ${h}`).join('\n')}`
  )
  .join('\n\n')}
`;

    navigator.clipboard.writeText(md);
    setCopiedFormat('markdown');
    setTimeout(() => setCopiedFormat(null), 2500);
  };

  const handleAIRefine = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!refinePrompt.trim()) return;

    setIsRefining(true);
    try {
      const response = await fetch('/api/refine-cv', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          currentCV: editableCV,
          instruction: refinePrompt,
          jobProfile,
        }),
      });

      const data = await response.json();
      if (data.updatedCV) {
        setEditableCV(data.updatedCV);
        onUpdateCV(data.updatedCV);
        setRefinePrompt('');
      }
    } catch (err) {
      console.error('Failed to refine CV:', err);
    } finally {
      setIsRefining(false);
    }
  };

  // Helper update handlers
  const updatePersonalInfo = (field: keyof typeof cv.personalInfo, value: any) => {
    setEditableCV((prev) => {
      const updated = {
        ...prev,
        personalInfo: { ...prev.personalInfo, [field]: value },
      };
      onUpdateCV(updated);
      return updated;
    });
  };

  const addCustomLink = () => {
    if (!newLinkLabel.trim() || !newLinkUrl.trim()) return;
    const newLink: CustomLink = {
      id: 'link-' + Date.now(),
      label: newLinkLabel.trim(),
      url: newLinkUrl.trim(),
      platform: newLinkPlatform,
    };
    setEditableCV((prev) => {
      const existing = prev.personalInfo.links || [];
      const updated = {
        ...prev,
        personalInfo: {
          ...prev.personalInfo,
          links: [...existing, newLink],
        },
      };
      onUpdateCV(updated);
      return updated;
    });
    setNewLinkLabel('');
    setNewLinkUrl('');
  };

  const removeCustomLink = (id: string) => {
    setEditableCV((prev) => {
      const existing = prev.personalInfo.links || [];
      const updated = {
        ...prev,
        personalInfo: {
          ...prev.personalInfo,
          links: existing.filter((l) => l.id !== id),
        },
      };
      onUpdateCV(updated);
      return updated;
    });
  };

  const updateBullet = (expIdx: number, bulletIdx: number, value: string) => {
    setEditableCV((prev) => {
      const newExp = [...prev.experience];
      newExp[expIdx].bullets[bulletIdx] = value;
      const updated = { ...prev, experience: newExp };
      onUpdateCV(updated);
      return updated;
    });
  };

  const addBullet = (expIdx: number) => {
    setEditableCV((prev) => {
      const newExp = [...prev.experience];
      newExp[expIdx].bullets.push('Architected scalable pipelines driving measurable metric growth.');
      const updated = { ...prev, experience: newExp };
      onUpdateCV(updated);
      return updated;
    });
  };

  const removeBullet = (expIdx: number, bulletIdx: number) => {
    setEditableCV((prev) => {
      const newExp = [...prev.experience];
      newExp[expIdx].bullets.splice(bulletIdx, 1);
      const updated = { ...prev, experience: newExp };
      onUpdateCV(updated);
      return updated;
    });
  };

  // Helper font class generator
  const getFontClass = () => {
    switch (styling.fontFamily) {
      case 'serif':
        return 'font-serif';
      case 'mono':
        return 'font-mono';
      case 'display':
        return 'font-sans tracking-tight';
      default:
        return 'font-sans';
    }
  };

  // Helper paper background class
  const getPaperBgStyle = () => {
    switch (styling.paperBg) {
      case 'ivory':
        return { backgroundColor: '#FAFAF8', color: '#111111' };
      case 'dark':
        return { backgroundColor: '#0E0E0E', color: '#FFFFFF' };
      default:
        return { backgroundColor: '#FFFFFF', color: '#000000' };
    }
  };

  // Render platform icon helper
  const renderLinkIcon = (platform: CustomLink['platform']) => {
    switch (platform) {
      case 'github':
        return <Github className="w-3.5 h-3.5" />;
      case 'linkedin':
        return <Linkedin className="w-3.5 h-3.5" />;
      case 'twitter':
        return <Twitter className="w-3.5 h-3.5" />;
      case 'dribbble':
        return <Dribbble className="w-3.5 h-3.5" />;
      case 'portfolio':
        return <Globe className="w-3.5 h-3.5" />;
      default:
        return <LinkIcon className="w-3.5 h-3.5" />;
    }
  };

  const layout = getLayoutClasses(template);

  return (
    <div className="max-w-6xl mx-auto px-4 space-y-6">
      {/* Top Controls Toolbar */}
      <div className="bg-[#0E0E0E] border border-white/10 rounded-md p-4 flex flex-wrap items-center justify-between gap-4 no-print shadow-xl">
        <div className="flex flex-wrap items-center gap-3">
          <button
            onClick={onBackToScorecard}
            className="px-3 py-1.5 rounded-xs bg-white/5 hover:bg-white/10 border border-white/10 text-white/80 transition-colors flex items-center gap-1.5 text-xs font-mono cursor-pointer"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Scorecard</span>
          </button>

          {/* Pre-generated Template Selector */}
          <div className="flex items-center gap-1 bg-white/5 p-1 rounded-xs border border-white/10 text-xs">
            <Layout className="w-3.5 h-3.5 text-[#00FF41] ml-1.5 mr-1" />
            {[
              { id: 'modern' as TemplateStyle, name: 'Modern' },
              { id: 'classic' as TemplateStyle, name: 'Classic' },
              { id: 'executive' as TemplateStyle, name: 'Executive' },
            ].map((t) => (
              <button
                key={t.id}
                onClick={() => setTemplate(t.id)}
                className={`px-2.5 py-1 rounded-xs capitalize text-[11px] font-mono transition-all cursor-pointer ${
                  template === t.id
                    ? 'bg-[#00FF41] text-black font-bold'
                    : 'text-white/50 hover:text-white'
                }`}
              >
                {t.name}
              </button>
            ))}
          </div>

          <button
            onClick={() => setShowStylePanel(!showStylePanel)}
            className={`px-3 py-1.5 rounded-xs border font-mono text-xs flex items-center gap-1.5 transition-colors cursor-pointer ${
              showStylePanel
                ? 'bg-[#00FF41]/20 text-[#00FF41] border-[#00FF41]/40'
                : 'bg-white/5 text-white/80 border-white/10 hover:bg-white/10'
            }`}
          >
            <Sliders className="w-3.5 h-3.5" />
            <span>Style Customizer</span>
          </button>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center gap-2 text-xs font-mono">
          <button
            onClick={() => setIsEditing(!isEditing)}
            className={`px-3 py-1.5 rounded-xs border font-bold text-xs uppercase tracking-wider transition-colors cursor-pointer ${
              isEditing
                ? 'bg-amber-500/20 text-amber-300 border-amber-500/30'
                : 'bg-white/5 text-white/80 border-white/10 hover:bg-white/10'
            }`}
          >
            <Edit3 className="w-3.5 h-3.5 inline mr-1" />
            <span>{isEditing ? 'Exit Edit' : 'Edit CV'}</span>
          </button>

          <button
            onClick={onOpenCoverLetter}
            className="px-3 py-1.5 rounded-xs bg-white/5 hover:bg-white/10 text-white/90 border border-white/10 transition-colors flex items-center gap-1.5 cursor-pointer"
          >
            <Mail className="w-3.5 h-3.5 text-[#00FF41]" />
            <span>Cover Letter</span>
          </button>

          <button
            onClick={onOpenInterviewPrep}
            className="px-3 py-1.5 rounded-xs bg-white/5 hover:bg-white/10 text-white/90 border border-white/10 transition-colors flex items-center gap-1.5 cursor-pointer"
          >
            <HelpCircle className="w-3.5 h-3.5 text-white/60" />
            <span>Interview Prep</span>
          </button>

          <button
            onClick={handleCopyMarkdown}
            className="px-3 py-1.5 rounded-xs bg-white/5 hover:bg-white/10 text-white/90 border border-white/10 transition-colors flex items-center gap-1.5 cursor-pointer"
          >
            {copiedFormat === 'markdown' ? <Check className="w-3.5 h-3.5 text-[#00FF41]" /> : <Copy className="w-3.5 h-3.5 text-white/40" />}
            <span>Markdown</span>
          </button>

          <button
            onClick={handlePrint}
            title="Trigger browser print dialog to save CV as PDF"
            className="px-4 py-1.5 rounded-xs bg-[#00FF41] text-black font-bold uppercase tracking-wider text-xs hover:bg-[#00FF41]/90 transition-colors flex items-center gap-1.5 cursor-pointer shadow-sm font-mono"
          >
            <Download className="w-3.5 h-3.5 text-black" />
            <span>Download as PDF</span>
          </button>
        </div>
      </div>

      {/* Style & Image Customizer Panel (Collapsible) */}
      {showStylePanel && (
        <div className="bg-[#0A0A0A] border border-[#00FF41]/30 rounded-md p-5 space-y-4 no-print text-xs font-mono">
          <div className="flex items-center justify-between pb-3 border-b border-white/10">
            <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
              <Palette className="w-4 h-4 text-[#00FF41]" /> Custom Styling & Image Controls
            </h3>
            <span className="text-[10px] text-[#00FF41]">REALTIME PREVIEW SYNC</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
            {/* Font Selector */}
            <div className="space-y-1.5">
              <label className="text-white/60 block uppercase text-[10px]">Typography Font</label>
              <select
                value={styling.fontFamily}
                onChange={(e) => setStyling({ ...styling, fontFamily: e.target.value as any })}
                className="w-full bg-white/5 border border-white/10 text-white p-2 rounded-xs outline-none"
              >
                <option value="sans" className="bg-black">Modern Sans (Inter/Plus Jakarta)</option>
                <option value="serif" className="bg-black">Executive Serif (Playfair/Georgia)</option>
                <option value="mono" className="bg-black">Code Mono (JetBrains Mono)</option>
                <option value="display" className="bg-black">Clean Display</option>
              </select>
            </div>

            {/* Accent Color Picker */}
            <div className="space-y-1.5">
              <label className="text-white/60 block uppercase text-[10px]">Accent Color</label>
              <div className="flex items-center gap-1.5 pt-1">
                {ACCENT_OPTIONS.map((acc) => (
                  <button
                    key={acc.hex}
                    onClick={() => setStyling({ ...styling, accentColor: acc.hex })}
                    className={`w-6 h-6 rounded-full border-2 transition-transform cursor-pointer ${
                      styling.accentColor === acc.hex ? 'border-white scale-110' : 'border-transparent opacity-70'
                    }`}
                    style={{ backgroundColor: acc.hex }}
                    title={acc.label}
                  />
                ))}
              </div>
            </div>

            {/* Paper Theme */}
            <div className="space-y-1.5">
              <label className="text-white/60 block uppercase text-[10px]">Paper Theme</label>
              <select
                value={styling.paperBg}
                onChange={(e) => setStyling({ ...styling, paperBg: e.target.value as any })}
                className="w-full bg-white/5 border border-white/10 text-white p-2 rounded-xs outline-none"
              >
                <option value="white" className="bg-black">Pure White Paper</option>
                <option value="ivory" className="bg-black">Warm Editorial Ivory</option>
                <option value="dark" className="bg-black">Dark Matrix Theme</option>
              </select>
            </div>

            {/* Candidate Photo Settings */}
            <div className="space-y-1.5">
              <label className="text-white/60 block uppercase text-[10px]">Profile Photo Display</label>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => updatePersonalInfo('showPhoto', !editableCV.personalInfo.showPhoto)}
                  className={`px-3 py-1.5 rounded-xs border font-bold cursor-pointer ${
                    editableCV.personalInfo.showPhoto ? 'bg-[#00FF41]/20 border-[#00FF41] text-[#00FF41]' : 'bg-white/5 border-white/10 text-white/50'
                  }`}
                >
                  {editableCV.personalInfo.showPhoto ? 'Photo On' : 'Photo Off'}
                </button>
                {editableCV.personalInfo.showPhoto && (
                  <select
                    value={styling.photoShape}
                    onChange={(e) => setStyling({ ...styling, photoShape: e.target.value as any })}
                    className="bg-white/5 border border-white/10 text-white p-1.5 rounded-xs outline-none text-[11px]"
                  >
                    <option value="circle" className="bg-black">Circle Shape</option>
                    <option value="rounded" className="bg-black">Rounded Box</option>
                    <option value="square" className="bg-black">Square Box</option>
                  </select>
                )}
              </div>
            </div>
          </div>

          {/* Photo URL Input & Link Manager in Style Panel */}
          {editableCV.personalInfo.showPhoto && (
            <div className="pt-2 border-t border-white/10">
              <label className="text-white/60 block uppercase text-[10px] mb-1">Candidate Photo URL</label>
              <div className="flex gap-2">
                <input
                  type="url"
                  placeholder="https://images.unsplash.com/..."
                  value={editableCV.personalInfo.photoUrl || ''}
                  onChange={(e) => updatePersonalInfo('photoUrl', e.target.value)}
                  className="flex-1 bg-white/5 border border-white/10 text-white p-2 rounded-xs outline-none text-xs"
                />
              </div>
            </div>
          )}
        </div>
      )}

      {/* Relevant Links & App Integrations Editor (When in Edit Mode) */}
      {isEditing && (
        <div className="bg-[#0E0E0E] border border-white/10 rounded-md p-5 space-y-4 no-print text-xs font-mono">
          <div className="flex items-center justify-between pb-3 border-b border-white/10">
            <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
              <LinkIcon className="w-4 h-4 text-[#00FF41]" /> Add Relevant Apps & Links (GitHub, LinkedIn, Portfolio)
            </h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-4 gap-2">
            <input
              type="text"
              placeholder="Label (e.g. GitHub Repos)"
              value={newLinkLabel}
              onChange={(e) => setNewLinkLabel(e.target.value)}
              className="bg-white/5 border border-white/10 text-white p-2 rounded-xs outline-none"
            />
            <input
              type="url"
              placeholder="URL (https://github.com/username)"
              value={newLinkUrl}
              onChange={(e) => setNewLinkUrl(e.target.value)}
              className="bg-white/5 border border-white/10 text-white p-2 rounded-xs outline-none sm:col-span-2"
            />
            <div className="flex gap-2">
              <select
                value={newLinkPlatform}
                onChange={(e) => setNewLinkPlatform(e.target.value as any)}
                className="bg-white/5 border border-white/10 text-white p-2 rounded-xs outline-none flex-1"
              >
                <option value="github" className="bg-black">GitHub</option>
                <option value="linkedin" className="bg-black">LinkedIn</option>
                <option value="portfolio" className="bg-black">Portfolio</option>
                <option value="twitter" className="bg-black">Twitter</option>
                <option value="dribbble" className="bg-black">Dribbble</option>
                <option value="custom" className="bg-black">Custom App</option>
              </select>
              <button
                type="button"
                onClick={addCustomLink}
                className="px-4 py-2 bg-[#00FF41] text-black font-bold uppercase rounded-xs cursor-pointer hover:bg-[#00FF41]/90"
              >
                Add
              </button>
            </div>
          </div>

          {/* Existing Links List */}
          <div className="flex flex-wrap gap-2 pt-2">
            {editableCV.personalInfo.links?.map((l) => (
              <div key={l.id} className="flex items-center gap-2 p-2 bg-white/5 border border-white/10 rounded-xs text-white">
                {renderLinkIcon(l.platform)}
                <span className="font-bold">{l.label}</span>
                <span className="text-white/40 text-[10px] truncate max-w-[150px]">{l.url}</span>
                <button
                  onClick={() => removeCustomLink(l.id)}
                  className="text-rose-400 hover:text-rose-300 ml-1 cursor-pointer"
                >
                  <Trash2 className="w-3 h-3" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TEMPLATE VISUAL SELECTOR CARD */}
      <div className="bg-[#0E0E0E] border border-white/10 rounded-md p-4 no-print space-y-3 shadow-lg">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Layout className="w-4 h-4 text-[#00FF41]" />
            <span className="text-xs font-bold text-white uppercase tracking-wider font-mono">
              Resume Visual Layout Selector
            </span>
          </div>
          <span className="text-[10px] font-mono text-white/50">
            Swaps predefined CSS layout structure & component styles
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {[
            {
              id: 'modern' as TemplateStyle,
              label: 'Modern',
              badge: 'Tech & Product',
              description: 'Clean badge pills, left-accent border cards & contemporary grid layout',
              icon: <Sparkles className="w-4 h-4 text-[#00FF41]" />,
            },
            {
              id: 'classic' as TemplateStyle,
              label: 'Classic',
              badge: 'Editorial & Legal',
              description: 'Centered serif headings, double horizontal rules & traditional layout',
              icon: <Type className="w-4 h-4 text-amber-400" />,
            },
            {
              id: 'executive' as TemplateStyle,
              label: 'Executive',
              badge: 'Corporate C-Suite',
              description: 'Dark executive header banner, timeline badges & structured grid',
              icon: <Building2 className="w-4 h-4 text-blue-400" />,
            },
          ].map((tpl) => {
            const isSelected =
              template === tpl.id ||
              (tpl.id === 'modern' && (template === 'blackapple' || template === 'portfolio')) ||
              (tpl.id === 'classic' && (template === 'ivory' || template === 'ats'));

            return (
              <button
                key={tpl.id}
                type="button"
                onClick={() => setTemplate(tpl.id)}
                className={`p-3.5 rounded-xs border text-left transition-all cursor-pointer flex flex-col justify-between gap-2.5 font-mono ${
                  isSelected
                    ? 'bg-[#00FF41]/10 border-[#00FF41] shadow-[0_0_15px_rgba(0,255,65,0.15)] text-white'
                    : 'bg-white/5 border-white/10 hover:bg-white/10 text-white/70 hover:text-white'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    {tpl.icon}
                    <span className="text-xs font-bold uppercase tracking-wider text-white">{tpl.label}</span>
                  </div>
                  <span
                    className={`text-[9px] px-2 py-0.5 rounded-xs font-bold uppercase ${
                      isSelected ? 'bg-[#00FF41] text-black' : 'bg-white/10 text-white/60'
                    }`}
                  >
                    {tpl.badge}
                  </span>
                </div>
                <p className="text-[11px] text-white/50 font-sans leading-tight">{tpl.description}</p>
              </button>
            );
          })}
        </div>
      </div>

      {/* AI Refine Assistant Input Box */}
      <div className="bg-[#0E0E0E] border border-white/10 rounded-md p-3.5 no-print">
        <form onSubmit={handleAIRefine} className="flex items-center gap-3">
          <Sparkles className="w-4 h-4 text-[#00FF41] shrink-0 ml-1" />
          <input
            type="text"
            placeholder="AI Refine Prompt: e.g. 'Emphasize cloud architecture', 'Add GitHub project metrics', 'Make summary punchy'..."
            value={refinePrompt}
            onChange={(e) => setRefinePrompt(e.target.value)}
            className="flex-1 bg-transparent border-none text-xs text-white placeholder-white/30 outline-none font-mono"
          />
          <button
            type="submit"
            disabled={isRefining || !refinePrompt.trim()}
            className="px-3.5 py-1.5 rounded-xs bg-[#00FF41] text-black font-bold text-xs uppercase tracking-wider transition-colors disabled:opacity-50 flex items-center gap-1 cursor-pointer shrink-0 font-mono"
          >
            {isRefining ? 'Refining...' : 'Refine with AI'}
          </button>
        </form>
      </div>

      {/* CV DISPLAY CANVAS (Customizable Paper Preview & Print Target) */}
      <div className="bg-[#121212] p-4 sm:p-8 rounded-md border border-white/10">
        <div className="flex items-center justify-between mb-4 no-print font-mono text-[10px] text-white/40">
          <span className="uppercase tracking-widest font-bold">
            BlackApple Document Engine • Visual Layout: {layout.type.toUpperCase()}
          </span>
          <button
            onClick={handlePrint}
            className="flex items-center gap-1.5 text-[#00FF41] hover:underline cursor-pointer font-bold text-xs uppercase tracking-wider"
          >
            <Download className="w-3.5 h-3.5 text-[#00FF41]" />
            <span>Download as PDF</span>
          </button>
        </div>

        <div
          className={`${layout.container} ${getFontClass()}`}
          style={getPaperBgStyle()}
        >
          {/* Header Section */}
          <header
            className={layout.header}
            style={{
              borderColor: layout.type === 'executive' ? styling.accentColor : (styling.accentColor + '50')
            }}
          >
            <div className="flex-1 space-y-2">
              {isEditing ? (
                <div className="space-y-2 font-mono text-xs text-black">
                  <input
                    type="text"
                    value={editableCV.personalInfo.fullName}
                    onChange={(e) => updatePersonalInfo('fullName', e.target.value)}
                    className="text-2xl font-bold border-b border-black/30 w-full outline-none uppercase bg-white/80 p-1"
                  />
                  <input
                    type="text"
                    value={editableCV.personalInfo.professionalTitle}
                    onChange={(e) => updatePersonalInfo('professionalTitle', e.target.value)}
                    className="text-sm italic opacity-80 border-b border-black/30 w-full outline-none bg-white/80 p-1"
                  />
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <input
                      type="text"
                      value={editableCV.personalInfo.email}
                      onChange={(e) => updatePersonalInfo('email', e.target.value)}
                      className="border p-1 rounded bg-white"
                    />
                    <input
                      type="text"
                      value={editableCV.personalInfo.phone}
                      onChange={(e) => updatePersonalInfo('phone', e.target.value)}
                      className="border p-1 rounded bg-white"
                    />
                    <input
                      type="text"
                      value={editableCV.personalInfo.location}
                      onChange={(e) => updatePersonalInfo('location', e.target.value)}
                      className="border p-1 rounded bg-white"
                    />
                  </div>
                </div>
              ) : (
                <div>
                  <h1 className={layout.title} style={{ color: layout.type === 'executive' ? '#FFFFFF' : (styling.paperBg === 'dark' ? '#FFFFFF' : '#000000') }}>
                    {editableCV.personalInfo.fullName}
                  </h1>
                  <p className={layout.subtitle} style={{ color: styling.accentColor }}>
                    {editableCV.personalInfo.professionalTitle}
                  </p>
                  <div className={layout.contactLine}>
                    <span>{editableCV.personalInfo.email}</span>
                    <span>•</span>
                    <span>{editableCV.personalInfo.phone}</span>
                    <span>•</span>
                    <span>{editableCV.personalInfo.location}</span>
                  </div>
                </div>
              )}

              {/* Render Relevant Links / Apps */}
              {editableCV.personalInfo.links && editableCV.personalInfo.links.length > 0 && (
                <div className="flex flex-wrap items-center gap-3 pt-2 text-xs font-mono">
                  {editableCV.personalInfo.links.map((link) => (
                    <a
                      key={link.id}
                      href={link.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 hover:underline font-bold"
                      style={{ color: styling.accentColor }}
                    >
                      {renderLinkIcon(link.platform)}
                      <span>{link.label}</span>
                    </a>
                  ))}
                </div>
              )}
            </div>

            {/* Candidate Photo */}
            {editableCV.personalInfo.showPhoto && editableCV.personalInfo.photoUrl && (
              <div className="shrink-0">
                <img
                  src={editableCV.personalInfo.photoUrl}
                  alt={editableCV.personalInfo.fullName}
                  className={`w-24 h-24 object-cover border-2 shadow-md ${
                    styling.photoShape === 'circle'
                      ? 'rounded-full'
                      : styling.photoShape === 'rounded'
                      ? 'rounded-lg'
                      : 'rounded-none'
                  }`}
                  style={{ borderColor: styling.accentColor }}
                />
              </div>
            )}
          </header>

          {/* Wrapper for Executive Layout Padding if Executive */}
          <div className={layout.type === 'executive' ? 'p-6 sm:p-8 space-y-6' : 'contents space-y-6'}>
            {/* Professional Summary */}
            <section className="space-y-2">
              <h2 className={layout.sectionHeader} style={{ color: layout.type === 'classic' ? undefined : styling.accentColor, borderColor: styling.accentColor }}>
                Executive Profile & Objective
              </h2>
              {isEditing ? (
                <textarea
                  rows={3}
                  value={editableCV.personalInfo.summary}
                  onChange={(e) => updatePersonalInfo('summary', e.target.value)}
                  className="w-full p-2 border border-black/20 rounded text-xs font-sans bg-white text-black"
                />
              ) : (
                <p className="text-xs sm:text-sm leading-relaxed opacity-90">{editableCV.personalInfo.summary}</p>
              )}
            </section>

            {/* Core Competencies & Skills */}
            <section className="space-y-2">
              <h2 className={layout.sectionHeader} style={{ color: layout.type === 'classic' ? undefined : styling.accentColor, borderColor: styling.accentColor }}>
                Core Competencies & Tooling
              </h2>
              <div className={layout.skillsWrapper}>
                <div>
                  <span className="font-bold font-mono block opacity-60 uppercase text-[10px]">Specialties</span>
                  <p className="font-semibold text-xs">{editableCV.skills.coreSpecialties.join(', ')}</p>
                </div>
                <div>
                  <span className="font-bold font-mono block opacity-60 uppercase text-[10px]">Technical Tools</span>
                  <p className="font-semibold text-xs">{editableCV.skills.technicalTools.join(', ')}</p>
                </div>
                <div>
                  <span className="font-bold font-mono block opacity-60 uppercase text-[10px]">Domain & Leadership</span>
                  <p className="font-semibold text-xs">{editableCV.skills.softDomainSkills.join(', ')}</p>
                </div>
              </div>
            </section>

            {/* Work Experience */}
            <section className="space-y-4">
              <h2 className={layout.sectionHeader} style={{ color: layout.type === 'classic' ? undefined : styling.accentColor, borderColor: styling.accentColor }}>
                Professional Experience
              </h2>
              <div className="space-y-4">
                {editableCV.experience.map((exp, expIdx) => (
                  <div
                    key={exp.id || expIdx}
                    className={layout.expItem}
                    style={layout.type === 'modern' ? { borderColor: styling.accentColor } : undefined}
                  >
                    <div className={layout.expHeader}>
                      <span className={layout.expRole}>
                        {exp.role} — <span className={layout.expCompany}>{exp.company}</span>
                      </span>
                      <span className={layout.expPeriod}>{exp.period}</span>
                    </div>

                    <ul className={layout.bullets}>
                      {exp.bullets.map((bullet, bulletIdx) => (
                        <li key={bulletIdx} className="group">
                          {isEditing ? (
                            <div className="flex items-center gap-2 no-print my-1">
                              <input
                                type="text"
                                value={bullet}
                                onChange={(e) => updateBullet(expIdx, bulletIdx, e.target.value)}
                                className="flex-1 p-1 border border-black/20 rounded text-xs font-sans bg-white text-black"
                              />
                              <button
                                onClick={() => removeBullet(expIdx, bulletIdx)}
                                className="text-rose-600 hover:text-rose-800 p-1 cursor-pointer"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          ) : (
                            <span>{bullet}</span>
                          )}
                        </li>
                      ))}
                    </ul>

                    {isEditing && (
                      <button
                        onClick={() => addBullet(expIdx)}
                        className="text-[10px] font-mono font-bold uppercase text-[#00FF41] bg-black px-2 py-0.5 rounded cursor-pointer no-print inline-flex items-center gap-1"
                      >
                        <Plus className="w-3 h-3" /> Add Bullet Point
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </section>

            {/* Education & Credentials */}
            <section className="space-y-2">
              <h2 className={layout.sectionHeader} style={{ color: layout.type === 'classic' ? undefined : styling.accentColor, borderColor: styling.accentColor }}>
                Education & Professional Certifications
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                {editableCV.education.map((edu, idx) => (
                  <div key={edu.id || idx}>
                    <p className="font-bold">{edu.degree}</p>
                    <p className="opacity-80">{edu.institution} ({edu.year})</p>
                  </div>
                ))}
              </div>
            </section>

            {/* Key Projects & Code Repositories */}
            {editableCV.projects && editableCV.projects.length > 0 && (
              <section className="space-y-3">
                <h2 className={layout.sectionHeader} style={{ color: layout.type === 'classic' ? undefined : styling.accentColor, borderColor: styling.accentColor }}>
                  Highlighted Projects & Applications
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                  {editableCV.projects.map((proj, idx) => (
                    <div key={proj.id || idx} className={layout.projectCard}>
                      <div className="flex items-center justify-between font-bold text-sm mb-1">
                        <span>{proj.name}</span>
                        {proj.link && (
                          <a href={proj.link} target="_blank" rel="noopener noreferrer" className="text-[10px] font-mono underline" style={{ color: styling.accentColor }}>
                            Link ↗
                          </a>
                        )}
                      </div>
                      <p className="text-xs opacity-85 mb-2">{proj.description}</p>
                      <div className="flex flex-wrap gap-1">
                        {proj.technologies.map((tech, tIdx) => (
                          <span key={tIdx} className="px-1.5 py-0.5 bg-black/5 dark:bg-white/10 rounded text-[9px] font-mono font-bold uppercase">
                            {tech}
                          </span>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
