import React, { useState } from 'react';
import { UserProfileData, SavedUserProfile } from '../types';
import { X, Check, Plus, Trash2, User, Globe, Linkedin, Link as LinkIcon, ShieldCheck } from 'lucide-react';

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
          {/* Ground Truth Banner */}
          <div className="p-3 bg-[#00FF41]/10 border border-[#00FF41]/30 rounded-xs text-xs text-[#00FF41] flex items-center gap-2 font-mono">
            <ShieldCheck className="w-4 h-4 shrink-0" />
            <span>This profile represents your verified background. Resumes generated for new job descriptions will tailor this data truthfully.</span>
          </div>

          {/* Personal Info */}
          <div className="space-y-4">
            <h4 className="text-xs font-bold text-white uppercase tracking-wider font-mono border-b border-white/10 pb-2">
              Candidate Identity
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
                  className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-xs text-xs text-white outline-none focus:border-[#00FF41]"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold uppercase text-white/60 mb-1 font-mono">LinkedIn URL</label>
                <input
                  type="url"
                  value={urls.linkedinUrl || ''}
                  onChange={(e) => setUrls({ ...urls, linkedinUrl: e.target.value })}
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
