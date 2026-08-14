import React, { useState } from 'react';
import { UserProfileData, SavedUserProfile } from '../types';
import { X, Check, Plus, Trash2, User, Globe, Linkedin, Link as LinkIcon, ShieldCheck, RefreshCw, Sparkles, AlertCircle, Mail, Phone } from 'lucide-react';
import { fetchAndParseUserProfile } from '../lib/profileService';

interface ProfileEditorModalProps {
  initialProfile: SavedUserProfile;
  onSave: (updatedProfile: UserProfileData, updatedUrls: { linkedinUrl?: string; websiteUrl?: string; githubUrl?: string }) => void;
  onClose: () => void;
}

export const ProfileEditorModal: React.FC<ProfileEditorModalProps> = ({
  initialProfile,
  onSave,
  onClose,
}) => {
  const [profile, setProfile] = useState<UserProfileData>(initialProfile.userProfile);
  const [urls, setUrls] = useState(initialProfile.urls);
  const [newSkill, setNewSkill] = useState('');
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncStatus, setSyncStatus] = useState<{ message: string; isError?: boolean } | null>(null);

  const handleSyncFromUrls = async () => {
    if (!urls.websiteUrl && !urls.linkedinUrl && !urls.githubUrl) {
      setSyncStatus({ message: 'Please enter at least one URL (Website, LinkedIn, or GitHub) below to extract.', isError: true });
      return;
    }

    setIsSyncing(true);
    setSyncStatus({ message: 'Crawling digital footprint and extracting exhaustive profile...' });

    try {
      const data = await fetchAndParseUserProfile({
        websiteUrl: urls.websiteUrl?.trim() || undefined,
        linkedinUrl: urls.linkedinUrl?.trim() || undefined,
        githubUrl: urls.githubUrl?.trim() || undefined,
      });

      if (data && data.userProfile) {
        setProfile(data.userProfile);
        if (data.urls) {
          setUrls({
            websiteUrl: data.urls.websiteUrl || urls.websiteUrl,
            linkedinUrl: data.urls.linkedinUrl || urls.linkedinUrl,
            githubUrl: data.urls.githubUrl || urls.githubUrl,
          });
        }
        setSyncStatus({ message: `Successfully extracted ${data.userProfile.experience?.length || 0} roles and ${data.userProfile.projects?.length || 0} projects!` });
      }
    } catch (err: any) {
      console.error('Extraction error inside modal:', err);
      setSyncStatus({ message: err.message || 'Failed to extract profile from provided URLs.', isError: true });
    } finally {
      setIsSyncing(false);
    }
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(profile, urls);
    onClose();
  };

  const handleAddSkill = () => {
    if (!newSkill.trim()) return;
    setProfile({
      ...profile,
      topSkills: [...(profile.topSkills || []), newSkill.trim()],
    });
    setNewSkill('');
  };

  const handleRemoveSkill = (idx: number) => {
    setProfile({
      ...profile,
      topSkills: profile.topSkills.filter((_, i) => i !== idx),
    });
  };

  const handleExperienceChange = (index: number, field: string, val: any) => {
    const updated = [...profile.experience];
    updated[index] = { ...updated[index], [field]: val };
    setProfile({ ...profile, experience: updated });
  };

  const handleAddExperience = () => {
    setProfile({
      ...profile,
      experience: [
        ...profile.experience,
        {
          company: 'Company Name',
          role: 'Role Title',
          period: '2023 - Present',
          description: 'Key role summary',
          keyAchievements: ['Impact metric or key deliverable'],
        },
      ],
    });
  };

  const handleRemoveExperience = (index: number) => {
    setProfile({
      ...profile,
      experience: profile.experience.filter((_, i) => i !== index),
    });
  };

  const handleProjectChange = (index: number, field: string, val: any) => {
    const updated = [...(profile.projects || [])];
    if (field === 'technologies') {
      val = typeof val === 'string' ? val.split(',').map(s => s.trim()).filter(Boolean) : val;
    }
    updated[index] = { ...updated[index], [field]: val };
    setProfile({ ...profile, projects: updated });
  };

  const handleAddProject = () => {
    setProfile({
      ...profile,
      projects: [
        ...(profile.projects || []),
        {
          name: 'Project Name',
          description: 'Key project features and architectural impact',
          technologies: ['TypeScript', 'React', 'Node.js'],
          link: 'https://github.com/username/project',
        },
      ],
    });
  };

  const handleRemoveProject = (index: number) => {
    setProfile({
      ...profile,
      projects: (profile.projects || []).filter((_, i) => i !== index),
    });
  };

  const handleEducationChange = (index: number, field: string, val: any) => {
    const updated = [...(profile.education || [])];
    updated[index] = { ...updated[index], [field]: val };
    setProfile({ ...profile, education: updated });
  };

  const handleAddEducation = () => {
    setProfile({
      ...profile,
      education: [
        ...(profile.education || []),
        {
          degree: 'Degree / Field of Study',
          institution: 'University / College Name',
          year: '2020',
        },
      ],
    });
  };

  const handleRemoveEducation = (index: number) => {
    setProfile({
      ...profile,
      education: (profile.education || []).filter((_, i) => i !== index),
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm no-print font-sans">
      <div className="bg-[#0E0E0E] w-full max-w-3xl max-h-[90vh] flex flex-col border border-white/10 rounded-md shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="p-5 border-b border-white/10 flex items-center justify-between bg-[#0A0A0A]">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-xs bg-[#00FF41] flex items-center justify-center text-black font-mono font-bold text-xs">
              01
            </div>
            <div>
              <h3 className="text-sm font-bold text-white uppercase tracking-wider font-mono">
                Truthful Baseline Candidate Profile
              </h3>
              <p className="text-[11px] text-white/50">Ground-truth experience reused across tailored resumes</p>
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
        <form onSubmit={handleSave} className="p-6 overflow-y-auto space-y-6 flex-1 bg-[#0E0E0E]">
          {/* Ground Truth Banner & Auto-Extract Action */}
          <div className="p-4 bg-white/5 border border-white/10 rounded-sm space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-center gap-2 text-xs text-[#00FF41] font-mono">
                <ShieldCheck className="w-4 h-4 shrink-0 text-[#00FF41]" />
                <span className="font-bold">Truthful Candidate Profile (Ground-Truth)</span>
              </div>
              <button
                type="button"
                onClick={handleSyncFromUrls}
                disabled={isSyncing}
                className="px-3 py-1.5 bg-[#00FF41] hover:bg-[#00E03A] text-black font-mono font-bold text-xs rounded-xs flex items-center justify-center gap-1.5 transition-all shadow-[0_0_12px_rgba(0,255,65,0.2)] disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
              >
                {isSyncing ? (
                  <>
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                    <span>Extracting Profile Details...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>Re-Sync / Auto-Extract from URLs</span>
                  </>
                )}
              </button>
            </div>
            {syncStatus && (
              <div className={`text-[11px] font-mono px-2.5 py-1 rounded-xs flex items-center gap-1.5 ${syncStatus.isError ? 'bg-red-500/10 text-red-400 border border-red-500/20' : 'bg-[#00FF41]/10 text-[#00FF41] border border-[#00FF41]/20'}`}>
                {syncStatus.isError ? <AlertCircle className="w-3.5 h-3.5 shrink-0" /> : <Check className="w-3.5 h-3.5 shrink-0" />}
                <span>{syncStatus.message}</span>
              </div>
            )}
            <p className="text-[11px] text-white/50">
              Resumes generated for any job description are anchored to this verified background to ensure 100% truthful representations without fabricated claims.
            </p>
          </div>

          {/* Personal Info */}
          <div className="space-y-4">
            <h4 className="text-xs font-bold text-white uppercase tracking-wider font-mono border-b border-white/10 pb-2">
              Candidate Identity & URLs
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-[10px] font-bold uppercase text-white/60 mb-1 font-mono">Full Name</label>
                <input
                  type="text"
                  required
                  value={profile.name}
                  onChange={(e) => setProfile({ ...profile, name: e.target.value })}
                  className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-xs text-xs text-white outline-none focus:border-[#00FF41]"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold uppercase text-white/60 mb-1 font-mono">Headline / Title</label>
                <input
                  type="text"
                  required
                  value={profile.headline}
                  onChange={(e) => setProfile({ ...profile, headline: e.target.value })}
                  className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-xs text-xs text-white outline-none focus:border-[#00FF41]"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold uppercase text-white/60 mb-1 font-mono">Location</label>
                <input
                  type="text"
                  value={profile.location || ''}
                  onChange={(e) => setProfile({ ...profile, location: e.target.value })}
                  placeholder="e.g. San Francisco, CA or Remote"
                  className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-xs text-xs text-white outline-none focus:border-[#00FF41]"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold uppercase text-white/60 mb-1 font-mono flex items-center gap-1">
                  <Mail className="w-3 h-3 text-[#00FF41]" />
                  <span>Email Address</span>
                </label>
                <input
                  type="email"
                  value={profile.email || ''}
                  onChange={(e) => setProfile({ ...profile, email: e.target.value })}
                  placeholder="e.g. candidate@example.com"
                  className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-xs text-xs text-white outline-none focus:border-[#00FF41] font-mono"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold uppercase text-white/60 mb-1 font-mono flex items-center gap-1">
                  <Phone className="w-3 h-3 text-[#00FF41]" />
                  <span>Phone Number</span>
                </label>
                <input
                  type="tel"
                  value={profile.phone || ''}
                  onChange={(e) => setProfile({ ...profile, phone: e.target.value })}
                  placeholder="e.g. +1 (555) 019-2834"
                  className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-xs text-xs text-white outline-none focus:border-[#00FF41] font-mono"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold uppercase text-white/60 mb-1 font-mono">Personal / Portfolio Website</label>
                <input
                  type="url"
                  value={urls.websiteUrl || ''}
                  onChange={(e) => setUrls({ ...urls, websiteUrl: e.target.value })}
                  placeholder="https://myportfolio.com"
                  className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-xs text-xs text-white outline-none focus:border-[#00FF41] font-mono"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold uppercase text-white/60 mb-1 font-mono">LinkedIn URL</label>
                <input
                  type="url"
                  value={urls.linkedinUrl || ''}
                  onChange={(e) => setUrls({ ...urls, linkedinUrl: e.target.value })}
                  placeholder="https://linkedin.com/in/username"
                  className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-xs text-xs text-white outline-none focus:border-[#00FF41] font-mono"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold uppercase text-white/60 mb-1 font-mono">GitHub URL</label>
                <input
                  type="url"
                  value={urls.githubUrl || ''}
                  onChange={(e) => setUrls({ ...urls, githubUrl: e.target.value })}
                  placeholder="https://github.com/username"
                  className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-xs text-xs text-white outline-none focus:border-[#00FF41] font-mono"
                />
              </div>
            </div>

            <div>
              <label className="block text-[10px] font-bold uppercase text-white/60 mb-1 font-mono">Executive Summary</label>
              <textarea
                rows={3}
                value={profile.summary || ''}
                onChange={(e) => setProfile({ ...profile, summary: e.target.value })}
                className="w-full p-3 bg-white/5 border border-white/10 rounded-xs text-xs text-white outline-none focus:border-[#00FF41] font-mono"
              />
            </div>
          </div>

          {/* Top Skills */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold text-white uppercase tracking-wider font-mono border-b border-white/10 pb-2">
              Verified Skills & Tools
            </h4>
            <div className="flex flex-wrap gap-1.5">
              {profile.topSkills?.map((skill, idx) => (
                <span key={idx} className="px-2.5 py-1 bg-white/10 border border-white/10 text-white text-xs rounded-xs flex items-center gap-1.5 font-mono">
                  <span>{skill}</span>
                  <button type="button" onClick={() => handleRemoveSkill(idx)} className="text-white/40 hover:text-rose-400 cursor-pointer">
                    <X className="w-3 h-3" />
                  </button>
                </span>
              ))}
            </div>

            <div className="flex items-center gap-2 pt-1">
              <input
                type="text"
                placeholder="Add skill..."
                value={newSkill}
                onChange={(e) => setNewSkill(e.target.value)}
                className="px-3 py-1.5 bg-white/5 border border-white/10 rounded-xs text-xs text-white outline-none focus:border-[#00FF41]"
              />
              <button
                type="button"
                onClick={handleAddSkill}
                className="px-3 py-1.5 bg-white/10 hover:bg-white/20 text-white font-mono text-xs font-bold uppercase rounded-xs cursor-pointer flex items-center gap-1"
              >
                <Plus className="w-3 h-3" />
                <span>Add</span>
              </button>
            </div>
          </div>

          {/* Real Work Experience */}
          <div className="space-y-4">
            <div className="flex items-center justify-between border-b border-white/10 pb-2">
              <h4 className="text-xs font-bold text-white uppercase tracking-wider font-mono">
                Real Professional Experience
              </h4>
              <button
                type="button"
                onClick={handleAddExperience}
                className="px-2.5 py-1 bg-[#00FF41]/10 text-[#00FF41] border border-[#00FF41]/30 hover:bg-[#00FF41]/20 rounded-xs text-[10px] font-mono font-bold uppercase flex items-center gap-1 cursor-pointer"
              >
                <Plus className="w-3 h-3" />
                <span>Add Position</span>
              </button>
            </div>

            <div className="space-y-4">
              {profile.experience?.map((exp, idx) => (
                <div key={idx} className="p-4 bg-white/5 border border-white/10 rounded-xs space-y-3 relative group">
                  <button
                    type="button"
                    onClick={() => handleRemoveExperience(idx)}
                    className="absolute top-3 right-3 text-white/40 hover:text-rose-400 cursor-pointer"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pr-8">
                    <div>
                      <label className="block text-[9px] font-bold uppercase text-white/40 mb-1 font-mono">Role Title</label>
                      <input
                        type="text"
                        value={exp.role}
                        onChange={(e) => handleExperienceChange(idx, 'role', e.target.value)}
                        className="w-full px-2.5 py-1.5 bg-black/40 border border-white/10 rounded-xs text-xs text-white"
                      />
                    </div>
                    <div>
                      <label className="block text-[9px] font-bold uppercase text-white/40 mb-1 font-mono">Company</label>
                      <input
                        type="text"
                        value={exp.company}
                        onChange={(e) => handleExperienceChange(idx, 'company', e.target.value)}
                        className="w-full px-2.5 py-1.5 bg-black/40 border border-white/10 rounded-xs text-xs text-white"
                      />
                    </div>
                    <div>
                      <label className="block text-[9px] font-bold uppercase text-white/40 mb-1 font-mono">Period</label>
                      <input
                        type="text"
                        value={exp.period}
                        onChange={(e) => handleExperienceChange(idx, 'period', e.target.value)}
                        className="w-full px-2.5 py-1.5 bg-black/40 border border-white/10 rounded-xs text-xs text-white font-mono"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[9px] font-bold uppercase text-white/40 mb-1 font-mono">Role Overview</label>
                    <textarea
                      rows={2}
                      value={exp.description || ''}
                      onChange={(e) => handleExperienceChange(idx, 'description', e.target.value)}
                      className="w-full p-2 bg-black/40 border border-white/10 rounded-xs text-xs text-white font-mono"
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Projects & Applications */}
          <div className="space-y-4">
            <div className="flex items-center justify-between border-b border-white/10 pb-2">
              <h4 className="text-xs font-bold text-white uppercase tracking-wider font-mono">
                Key Projects & Repositories
              </h4>
              <button
                type="button"
                onClick={handleAddProject}
                className="px-2.5 py-1 bg-[#00FF41]/10 text-[#00FF41] border border-[#00FF41]/30 hover:bg-[#00FF41]/20 rounded-xs text-[10px] font-mono font-bold uppercase flex items-center gap-1 cursor-pointer"
              >
                <Plus className="w-3 h-3" />
                <span>Add Project</span>
              </button>
            </div>

            <div className="space-y-4">
              {profile.projects?.map((proj, idx) => (
                <div key={idx} className="p-4 bg-white/5 border border-white/10 rounded-xs space-y-3 relative group">
                  <button
                    type="button"
                    onClick={() => handleRemoveProject(idx)}
                    className="absolute top-3 right-3 text-white/40 hover:text-rose-400 cursor-pointer"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pr-8">
                    <div>
                      <label className="block text-[9px] font-bold uppercase text-white/40 mb-1 font-mono">Project Name</label>
                      <input
                        type="text"
                        value={proj.name}
                        onChange={(e) => handleProjectChange(idx, 'name', e.target.value)}
                        className="w-full px-2.5 py-1.5 bg-black/40 border border-white/10 rounded-xs text-xs text-white font-bold"
                      />
                    </div>
                    <div>
                      <label className="block text-[9px] font-bold uppercase text-white/40 mb-1 font-mono">Project Link / Repo URL</label>
                      <input
                        type="text"
                        value={proj.link || ''}
                        onChange={(e) => handleProjectChange(idx, 'link', e.target.value)}
                        className="w-full px-2.5 py-1.5 bg-black/40 border border-white/10 rounded-xs text-xs text-white font-mono"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[9px] font-bold uppercase text-white/40 mb-1 font-mono">Description & Key Features</label>
                    <textarea
                      rows={2}
                      value={proj.description || ''}
                      onChange={(e) => handleProjectChange(idx, 'description', e.target.value)}
                      className="w-full p-2 bg-black/40 border border-white/10 rounded-xs text-xs text-white font-mono"
                    />
                  </div>

                  <div>
                    <label className="block text-[9px] font-bold uppercase text-white/40 mb-1 font-mono">Technologies (comma-separated)</label>
                    <input
                      type="text"
                      value={proj.technologies?.join(', ') || ''}
                      onChange={(e) => handleProjectChange(idx, 'technologies', e.target.value)}
                      className="w-full px-2.5 py-1.5 bg-black/40 border border-white/10 rounded-xs text-xs text-white font-mono"
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Education & Credentials */}
          <div className="space-y-4">
            <div className="flex items-center justify-between border-b border-white/10 pb-2">
              <h4 className="text-xs font-bold text-white uppercase tracking-wider font-mono">
                Education & Credentials
              </h4>
              <button
                type="button"
                onClick={handleAddEducation}
                className="px-2.5 py-1 bg-[#00FF41]/10 text-[#00FF41] border border-[#00FF41]/30 hover:bg-[#00FF41]/20 rounded-xs text-[10px] font-mono font-bold uppercase flex items-center gap-1 cursor-pointer"
              >
                <Plus className="w-3 h-3" />
                <span>Add Education</span>
              </button>
            </div>

            <div className="space-y-3">
              {profile.education?.map((edu, idx) => (
                <div key={idx} className="p-3 bg-white/5 border border-white/10 rounded-xs relative flex items-center gap-3">
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 flex-1 pr-6">
                    <div>
                      <label className="block text-[9px] font-bold uppercase text-white/40 mb-1 font-mono">Degree / Certificate</label>
                      <input
                        type="text"
                        value={edu.degree}
                        onChange={(e) => handleEducationChange(idx, 'degree', e.target.value)}
                        className="w-full px-2.5 py-1.5 bg-black/40 border border-white/10 rounded-xs text-xs text-white"
                      />
                    </div>
                    <div>
                      <label className="block text-[9px] font-bold uppercase text-white/40 mb-1 font-mono">Institution</label>
                      <input
                        type="text"
                        value={edu.institution}
                        onChange={(e) => handleEducationChange(idx, 'institution', e.target.value)}
                        className="w-full px-2.5 py-1.5 bg-black/40 border border-white/10 rounded-xs text-xs text-white"
                      />
                    </div>
                    <div>
                      <label className="block text-[9px] font-bold uppercase text-white/40 mb-1 font-mono">Graduation Year</label>
                      <input
                        type="text"
                        value={edu.year}
                        onChange={(e) => handleEducationChange(idx, 'year', e.target.value)}
                        className="w-full px-2.5 py-1.5 bg-black/40 border border-white/10 rounded-xs text-xs text-white font-mono"
                      />
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleRemoveEducation(idx)}
                    className="text-white/40 hover:text-rose-400 cursor-pointer shrink-0"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          </div>

          <div className="pt-4 border-t border-white/10 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-white/10 hover:bg-white/20 text-white font-mono text-xs font-bold uppercase tracking-wider rounded-xs cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 bg-[#00FF41] hover:bg-[#00FF41]/90 text-black font-mono text-xs font-bold uppercase tracking-wider rounded-xs flex items-center gap-1.5 cursor-pointer shadow-md"
            >
              <Check className="w-4 h-4" />
              <span>Save Truthful Profile</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
