import React, { useState, useEffect } from 'react';
import { ResearchInput, SavedUserProfile, UserProfileData } from '../types';
import { Globe, Linkedin, FileText, Link as LinkIcon, Building2, UserCheck, ArrowRight, Sparkles, ShieldCheck, Edit3, Trash2, ExternalLink, CheckCircle } from 'lucide-react';
import { fetchAndParseUserProfile, getSavedCandidateUrlsLocal, saveCandidateUrlsLocal } from '../lib/profileService';
import { ProfileEditorModal } from './ProfileEditorModal';

interface InputFormProps {
  onSubmit: (input: ResearchInput) => void;
  isLoading: boolean;
  savedProfile: SavedUserProfile | null;
  onSaveProfile: (profile: UserProfileData, urls: { linkedinUrl?: string; websiteUrl?: string; githubUrl?: string }) => void;
  onClearProfile: () => void;
  currentUserId?: string | null;
}

export const InputForm: React.FC<InputFormProps> = ({
  onSubmit,
  isLoading,
  savedProfile,
  onSaveProfile,
  onClearProfile,
  currentUserId = null,
}) => {
  // Initialize links from savedProfile or saved local URLs
  const initialUrls = savedProfile?.urls || getSavedCandidateUrlsLocal(currentUserId);
  const [websiteUrl, setWebsiteUrl] = useState(initialUrls.websiteUrl || '');
  const [linkedinUrl, setLinkedinUrl] = useState(initialUrls.linkedinUrl || '');
  const [githubUrl, setGithubUrl] = useState(initialUrls.githubUrl || '');

  const [jobInputType, setJobInputType] = useState<'text' | 'url'>('text');
  const [jobInput, setJobInput] = useState('');
  const [targetCompany, setTargetCompany] = useState('');
  const [targetRole, setTargetRole] = useState('');

  const [isFetchingProfile, setIsFetchingProfile] = useState(false);
  const [profileFetchError, setProfileFetchError] = useState<string | null>(null);
  const [showProfileEditor, setShowProfileEditor] = useState(false);

  // Sync state if savedProfile changes
  useEffect(() => {
    if (savedProfile?.urls) {
      if (savedProfile.urls.websiteUrl) setWebsiteUrl(savedProfile.urls.websiteUrl);
      if (savedProfile.urls.linkedinUrl) setLinkedinUrl(savedProfile.urls.linkedinUrl);
      if (savedProfile.urls.githubUrl) setGithubUrl(savedProfile.urls.githubUrl);
    }
  }, [savedProfile]);

  // Save candidate URLs immediately as user types
  const handleWebsiteChange = (val: string) => {
    setWebsiteUrl(val);
    saveCandidateUrlsLocal(currentUserId, { websiteUrl: val.trim(), linkedinUrl: linkedinUrl.trim(), githubUrl: githubUrl.trim() });
  };

  const handleLinkedinChange = (val: string) => {
    setLinkedinUrl(val);
    saveCandidateUrlsLocal(currentUserId, { websiteUrl: websiteUrl.trim(), linkedinUrl: val.trim(), githubUrl: githubUrl.trim() });
  };

  const handleGithubChange = (val: string) => {
    setGithubUrl(val);
    saveCandidateUrlsLocal(currentUserId, { websiteUrl: websiteUrl.trim(), linkedinUrl: linkedinUrl.trim(), githubUrl: val.trim() });
  };

  const handleFetchUserProfile = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const hasWeb = websiteUrl.trim().length > 0;
    const hasLi = linkedinUrl.trim().length > 0;
    const hasGh = githubUrl.trim().length > 0;

    if (!hasWeb && !hasLi && !hasGh) {
      setProfileFetchError('Please enter at least one link (e.g. Personal Website, LinkedIn, or GitHub) to import your profile.');
      return;
    }

    setProfileFetchError(null);
    setIsFetchingProfile(true);

    const urlsToSave = {
      websiteUrl: websiteUrl.trim() || undefined,
      linkedinUrl: linkedinUrl.trim() || undefined,
      githubUrl: githubUrl.trim() || undefined,
    };

    // Save URLs immediately
    saveCandidateUrlsLocal(currentUserId, urlsToSave);

    try {
      const data = await fetchAndParseUserProfile(urlsToSave);
      onSaveProfile(data.userProfile, data.urls);
    } catch (err: any) {
      console.error('Profile fetch error:', err);
      setProfileFetchError(err.message || 'Failed to fetch and parse candidate profile from provided links.');
    } finally {
      setIsFetchingProfile(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!jobInput.trim()) return;

    const currentUrls = {
      websiteUrl: websiteUrl.trim() || savedProfile?.urls?.websiteUrl,
      linkedinUrl: linkedinUrl.trim() || savedProfile?.urls?.linkedinUrl,
      githubUrl: githubUrl.trim() || savedProfile?.urls?.githubUrl,
    };

    saveCandidateUrlsLocal(currentUserId, currentUrls);

    onSubmit({
      websiteUrl: currentUrls.websiteUrl || '',
      linkedinUrl: currentUrls.linkedinUrl || '',
      githubUrl: currentUrls.githubUrl || '',
      jobInput: jobInput.trim(),
      jobInputType,
      targetCompany: targetCompany.trim(),
      targetRole: targetRole.trim(),
      compiledProfile: savedProfile ? savedProfile.userProfile : undefined,
    });
  };

  return (
    <div className="max-w-4xl mx-auto px-4 space-y-6">
      {/* Main Form Container */}
      <form onSubmit={handleSubmit} className="bg-[#0E0E0E] border border-white/10 rounded-md p-6 sm:p-8 space-y-6">
        <div className="flex items-center justify-between pb-4 border-b border-white/10">
          <div>
            <h2 className="text-lg font-bold text-white flex items-center gap-2 font-sans tracking-tight">
              <UserCheck className="w-4 h-4 text-[#00FF41]" />
              Candidate & Target Job Portal
            </h2>
            <p className="text-xs text-white/50 mt-1 font-sans">
              Provide your LinkedIn profile once. We'll store your ground-truth experience and tailor realistic resumes for any job posting.
            </p>
          </div>
          <span className="text-[10px] font-bold text-[#00FF41] uppercase tracking-widest border border-[#00FF41]/30 bg-[#00FF41]/10 px-2.5 py-1 rounded-xs">
            STAGE 01: INPUT
          </span>
        </div>

        {/* Section 1: Candidate Baseline Profile */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-[10px] font-bold text-white/40 uppercase tracking-[0.2em] font-mono">
              1. Ground-Truth Candidate Profile
            </h3>
            <span className="text-[10px] text-[#00FF41] font-mono">
              {savedProfile ? '● PROFILE SAVED & ACTIVE' : 'NO PROFILE SAVED YET'}
            </span>
          </div>

          {/* Condition A: User Profile is Saved */}
          {savedProfile ? (
            <div className="p-5 bg-white/5 border border-[#00FF41]/40 rounded-md space-y-4 relative">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-3 border-b border-white/10">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <h4 className="text-sm font-bold text-white">{savedProfile.userProfile.name}</h4>
                    <span className="px-2 py-0.5 text-[9px] font-mono font-bold uppercase bg-[#00FF41]/10 border border-[#00FF41]/30 text-[#00FF41] rounded-xs flex items-center gap-1">
                      <ShieldCheck className="w-3 h-3" />
                      <span>Truthful Experience Reused</span>
                    </span>
                  </div>
                  <p className="text-xs text-white/70 font-mono">{savedProfile.userProfile.headline}</p>
                  <p className="text-[10px] text-white/40 font-mono">
                    {savedProfile.userProfile.location || 'Remote'} • {savedProfile.userProfile.experience?.length || 0} Positions • Updated {new Date(savedProfile.lastUpdated).toLocaleDateString()}
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setShowProfileEditor(true)}
                    className="px-3 py-1.5 bg-white/10 hover:bg-white/20 text-white text-xs font-mono font-bold uppercase rounded-xs border border-white/10 transition-colors cursor-pointer flex items-center gap-1.5"
                  >
                    <Edit3 className="w-3.5 h-3.5 text-[#00FF41]" />
                    <span>Edit Profile</span>
                  </button>

                  <button
                    type="button"
                    onClick={onClearProfile}
                    className="px-2.5 py-1.5 bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 text-xs font-mono font-bold uppercase rounded-xs border border-rose-500/20 transition-colors cursor-pointer flex items-center gap-1"
                    title="Clear saved profile"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              {/* Skills preview */}
              {savedProfile.userProfile.topSkills?.length > 0 && (
                <div className="space-y-1">
                  <span className="text-[10px] font-bold uppercase text-white/40 font-mono">Top Verified Skills:</span>
                  <div className="flex flex-wrap gap-1.5 pt-1">
                    {savedProfile.userProfile.topSkills.slice(0, 8).map((skill, i) => (
                      <span key={i} className="px-2 py-0.5 bg-white/10 border border-white/10 text-white/80 text-[11px] font-mono rounded-xs">
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              <p className="text-[11px] text-white/50 font-sans italic bg-black/40 p-2.5 rounded-xs border border-white/5">
                "Your ground-truth profile is locked in. Simply paste a new job description below and click submit — our AI engine will generate a customized, 100% realistic resume without forging fake credentials."
              </p>
            </div>
          ) : (
            /* Condition B: No Profile Saved -> Multi-Link Importer (Personal Website, LinkedIn, GitHub) */
            <div className="p-5 bg-white/5 border border-white/10 rounded-md space-y-4">
              <div className="space-y-1">
                <label className="text-xs text-white/90 font-bold flex items-center gap-1.5 font-mono uppercase tracking-wider">
                  <Globe className="w-4 h-4 text-[#00FF41]" />
                  <span>Import Candidate Profile From Links</span>
                </label>
                <p className="text-[11px] text-white/60 font-sans">
                  Provide your personal website/portfolio URL, LinkedIn profile, or GitHub repositories. Our server crawler will research your actual footprint—especially your website—to compile your permanent baseline profile.
                </p>
              </div>

              {/* 1. Primary Field: Personal Website */}
              <div className="space-y-1 bg-black/40 p-3 rounded-xs border border-[#00FF41]/30">
                <div className="flex items-center justify-between">
                  <label className="text-xs text-[#00FF41] font-bold font-mono flex items-center gap-1.5">
                    <Globe className="w-3.5 h-3.5" />
                    <span>Personal / Portfolio Website URL (Primary Source)</span>
                  </label>
                  <span className="text-[9px] bg-[#00FF41]/10 text-[#00FF41] px-2 py-0.5 rounded-xs font-mono font-bold uppercase">
                    SPECIAL FOCUS
                  </span>
                </div>
                <input
                  type="url"
                  placeholder="https://johndoe.com or https://johndoe.design"
                  value={websiteUrl}
                  onChange={(e) => handleWebsiteChange(e.target.value)}
                  className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-xs text-xs text-white placeholder-white/30 outline-none focus:border-[#00FF41] font-mono"
                />
              </div>

              {/* 2. Secondary Fields: LinkedIn and GitHub */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-[10px] text-white/60 font-mono font-bold uppercase flex items-center gap-1 mb-1">
                    <Linkedin className="w-3 h-3 text-[#00FF41]" />
                    <span>LinkedIn Profile URL</span>
                  </label>
                  <input
                    type="url"
                    placeholder="https://linkedin.com/in/johndoe"
                    value={linkedinUrl}
                    onChange={(e) => handleLinkedinChange(e.target.value)}
                    className="w-full px-3 py-2 bg-black/40 border border-white/10 rounded-xs text-xs text-white placeholder-white/30 outline-none focus:border-[#00FF41] font-mono"
                  />
                </div>

                <div>
                  <label className="text-[10px] text-white/60 font-mono font-bold uppercase flex items-center gap-1 mb-1">
                    <LinkIcon className="w-3 h-3 text-[#00FF41]" />
                    <span>GitHub / Repositories URL</span>
                  </label>
                  <input
                    type="url"
                    placeholder="https://github.com/johndoe"
                    value={githubUrl}
                    onChange={(e) => handleGithubChange(e.target.value)}
                    className="w-full px-3 py-2 bg-black/40 border border-white/10 rounded-xs text-xs text-white placeholder-white/30 outline-none focus:border-[#00FF41] font-mono"
                  />
                </div>
              </div>

              {/* Import Action Trigger */}
              <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-3">
                <p className="text-[10px] text-white/40 font-mono italic">
                  * Provide at least one URL. Your website & profile details will be saved for all future resume generations.
                </p>

                <button
                  type="button"
                  disabled={isFetchingProfile || (!websiteUrl.trim() && !linkedinUrl.trim() && !githubUrl.trim())}
                  onClick={handleFetchUserProfile}
                  className="w-full sm:w-auto px-5 py-2.5 bg-[#00FF41] hover:bg-[#00FF41]/90 text-black font-mono font-bold text-xs uppercase tracking-wider rounded-xs transition-colors disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-2 cursor-pointer shrink-0 shadow-sm"
                >
                  {isFetchingProfile ? (
                    <>
                      <div className="w-3.5 h-3.5 border-2 border-black border-t-transparent rounded-full animate-spin" />
                      <span>Researching Candidate Footprint...</span>
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-3.5 h-3.5" />
                      <span>COMPILE & SAVE CANDIDATE PROFILE</span>
                    </>
                  )}
                </button>
              </div>

              {profileFetchError && (
                <p className="text-xs text-rose-400 font-mono bg-rose-500/10 p-2.5 rounded-xs border border-rose-500/20">
                  {profileFetchError}
                </p>
              )}
            </div>
          )}
        </div>

        {/* Section 2: Target Job Details */}
        <div className="space-y-4 pt-2">
          <div className="flex items-center justify-between">
            <h3 className="text-[10px] font-bold text-white/40 uppercase tracking-[0.2em] font-mono">
              2. Target Job Description
            </h3>
            <div className="flex items-center gap-1 bg-white/5 p-1 rounded-md border border-white/10 text-xs font-mono">
              <button
                type="button"
                onClick={() => setJobInputType('text')}
                className={`px-2.5 py-1 rounded-xs text-[11px] font-bold transition-colors cursor-pointer ${
                  jobInputType === 'text'
                    ? 'bg-white text-black'
                    : 'text-white/50 hover:text-white'
                }`}
              >
                Text Input
              </button>
              <button
                type="button"
                onClick={() => setJobInputType('url')}
                className={`px-2.5 py-1 rounded-xs text-[11px] font-bold transition-colors cursor-pointer ${
                  jobInputType === 'url'
                    ? 'bg-white text-black'
                    : 'text-white/50 hover:text-white'
                }`}
              >
                URL Link
              </button>
            </div>
          </div>

          {jobInputType === 'text' ? (
            <div>
              <textarea
                rows={6}
                required
                placeholder="Paste full job description text here (skills, responsibilities, culture, requirements)..."
                value={jobInput}
                onChange={(e) => setJobInput(e.target.value)}
                className="w-full p-3 bg-white/5 border border-white/10 rounded-md text-sm text-white/90 placeholder-white/30 outline-none focus:border-[#00FF41] transition-all font-mono leading-relaxed"
              />
            </div>
          ) : (
            <div>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-white/40">
                  <LinkIcon className="w-4 h-4 text-[#00FF41]" />
                </div>
                <input
                  type="url"
                  required
                  placeholder="https://careers.stripe.com/staff-designer"
                  value={jobInput}
                  onChange={(e) => setJobInput(e.target.value)}
                  className="w-full pl-9 pr-3 py-2.5 bg-white/5 border border-white/10 rounded-md text-sm text-white/90 placeholder-white/30 outline-none focus:border-[#00FF41] font-mono transition-all"
                />
              </div>
              <p className="text-[10px] text-white/40 mt-1.5 font-mono">
                AI crawler extracts semantic requirements and hidden keyword markers from link.
              </p>
            </div>
          )}

          {/* Optional Meta Override */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
            <div className="space-y-1">
              <label className="text-xs text-white/60">
                Target Company (Optional)
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-white/40">
                  <Building2 className="w-3.5 h-3.5" />
                </div>
                <input
                  type="text"
                  placeholder="e.g. Stripe, Linear"
                  value={targetCompany}
                  onChange={(e) => setTargetCompany(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 bg-white/5 border border-white/10 rounded-md text-xs text-white/90 placeholder-white/30 outline-none focus:border-white/30 font-mono"
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-xs text-white/60">
                Target Role Title (Optional)
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-white/40">
                  <FileText className="w-3.5 h-3.5" />
                </div>
                <input
                  type="text"
                  placeholder="e.g. Staff Designer"
                  value={targetRole}
                  onChange={(e) => setTargetRole(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 bg-white/5 border border-white/10 rounded-md text-xs text-white/90 placeholder-white/30 outline-none focus:border-white/30 font-mono"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Submit Action */}
        <div className="pt-4 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="text-xs text-white/50 flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-[#00FF41]"></span>
            <span>Realistic, truthful resume tailored to target job requirements</span>
          </div>

          <button
            type="submit"
            disabled={isLoading || !jobInput.trim()}
            className="w-full sm:w-auto px-6 py-3 bg-[#00FF41] hover:bg-[#00FF41]/90 text-black font-bold font-mono text-xs uppercase tracking-widest transition-colors rounded-sm disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 cursor-pointer shadow-md"
          >
            {isLoading ? (
              <>
                <div className="w-3.5 h-3.5 border-2 border-black border-t-transparent rounded-full animate-spin" />
                <span>Generating Realistic Resume...</span>
              </>
            ) : (
              <>
                <span>SYNTHESIZE TAILORED RESUME</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </>
            )}
          </button>
        </div>
      </form>

      {/* Profile Editor Modal */}
      {showProfileEditor && savedProfile && (
        <ProfileEditorModal
          initialProfile={savedProfile}
          onSave={(updatedProfile, updatedUrls) => {
            onSaveProfile(updatedProfile, updatedUrls);
            setShowProfileEditor(false);
          }}
          onClose={() => setShowProfileEditor(false)}
        />
      )}
    </div>
  );
};
