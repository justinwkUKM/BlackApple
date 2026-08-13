import React, { useState, useEffect } from 'react';
import { ResearchInput, FullAnalysisReport, TailoredCV, UserAccount, SavedUserProfile, UserProfileData } from './types';
import { getCurrentUser, getUserCVs, saveUserCV, deleteUserCV, clearUserCVs, signOut as localSignOut, setCurrentUser as setLocalUser } from './lib/authStore';
import { auth } from './lib/firebase';
import { onAuthStateChanged, signOut as firebaseSignOut } from 'firebase/auth';
import {
  syncUserToFirestore,
  fetchUserCVsFromFirestore,
  saveUserCVToFirestore,
  deleteUserCVFromFirestore,
} from './lib/firestoreService';
import {
  getSavedUserProfileLocal,
  saveUserProfileLocal,
  clearSavedUserProfileLocal,
  fetchUserProfileFirestore,
  saveUserProfileFirestore,
  deleteUserProfileFirestore,
} from './lib/profileService';
import { Navbar } from './components/Navbar';
import { HeroHeader } from './components/HeroHeader';
import { InputForm } from './components/InputForm';
import { AnalysisProgress } from './components/AnalysisProgress';
import { QualificationScorecard } from './components/QualificationScorecard';
import { CVEditorPreview } from './components/CVEditorPreview';
import { CoverLetterModal } from './components/CoverLetterModal';
import { InterviewPrepDrawer } from './components/InterviewPrepDrawer';
import { SavedReportsHistoryModal } from './components/SavedReportsHistoryModal';
import { AuthModal } from './components/AuthModal';
import { AlertCircle } from 'lucide-react';

export default function App() {
  const [currentUser, setCurrentUser] = useState<UserAccount | null>(() => getCurrentUser());
  const [isLoading, setIsLoading] = useState(false);
  const [activeReport, setActiveReport] = useState<FullAnalysisReport | null>(null);
  const [viewMode, setViewMode] = useState<'input' | 'scorecard' | 'cv'>('input');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Modals state
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);
  const [isCoverLetterOpen, setIsCoverLetterOpen] = useState(false);
  const [isInterviewPrepOpen, setIsInterviewPrepOpen] = useState(false);

  // User-specific saved CV reports
  const [savedReports, setSavedReports] = useState<any[]>(() => {
    return currentUser ? getUserCVs(currentUser.id) : [];
  });

  // User-specific saved compiled profile
  const [savedProfile, setSavedProfile] = useState<SavedUserProfile | null>(() => {
    return getSavedUserProfileLocal(currentUser?.id || null);
  });

  // Sync profile from Firestore on load/login
  useEffect(() => {
    if (currentUser) {
      fetchUserProfileFirestore(currentUser.id).then((fsProfile) => {
        if (fsProfile) {
          setSavedProfile(fsProfile);
          saveUserProfileLocal(currentUser.id, fsProfile.userProfile, fsProfile.urls);
        }
      });
    } else {
      setSavedProfile(getSavedUserProfileLocal(null));
    }
  }, [currentUser?.id]);

  const handleSaveProfile = async (
    profile: UserProfileData,
    urls: { linkedinUrl?: string; websiteUrl?: string; githubUrl?: string }
  ) => {
    if (currentUser) {
      const saved = await saveUserProfileFirestore(currentUser.id, profile, urls);
      setSavedProfile(saved);
    } else {
      const saved = saveUserProfileLocal(null, profile, urls);
      setSavedProfile(saved);
    }
  };

  const handleClearProfile = async () => {
    if (currentUser) {
      await deleteUserProfileFirestore(currentUser.id);
    } else {
      clearSavedUserProfileLocal(null);
    }
    setSavedProfile(null);
  };

  // Listen to Firebase Auth state changes
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (fbUser) => {
      if (fbUser) {
        const userAcc: UserAccount = {
          id: fbUser.uid,
          name: fbUser.displayName || fbUser.email?.split('@')[0] || 'User',
          email: fbUser.email || '',
          avatarUrl: fbUser.photoURL || undefined,
          createdAt: new Date().toISOString(),
        };
        setLocalUser(userAcc);
        setCurrentUser(userAcc);
        await syncUserToFirestore(userAcc);

        // Load CVs from Firestore
        try {
          const firestoreCVs = await fetchUserCVsFromFirestore(userAcc.id);
          if (firestoreCVs && firestoreCVs.length > 0) {
            setSavedReports(firestoreCVs);
          } else {
            setSavedReports(getUserCVs(userAcc.id));
          }
        } catch {
          setSavedReports(getUserCVs(userAcc.id));
        }
      }
    });

    return () => unsubscribe();
  }, []);

  // Sync user saved CVs when user changes
  useEffect(() => {
    if (currentUser) {
      fetchUserCVsFromFirestore(currentUser.id)
        .then((cvs) => {
          if (cvs && cvs.length > 0) {
            setSavedReports(cvs);
          } else {
            setSavedReports(getUserCVs(currentUser.id));
          }
        })
        .catch(() => {
          setSavedReports(getUserCVs(currentUser.id));
        });
    } else {
      setSavedReports([]);
    }
  }, [currentUser?.id]);

  const handleUserChanged = async (user: UserAccount) => {
    setCurrentUser(user);
    setLocalUser(user);
    try {
      const cvs = await fetchUserCVsFromFirestore(user.id);
      setSavedReports(cvs.length > 0 ? cvs : getUserCVs(user.id));
    } catch {
      setSavedReports(getUserCVs(user.id));
    }
  };

  const handleSignOut = async () => {
    try {
      await firebaseSignOut(auth);
    } catch (e) {
      console.error('Firebase signout error:', e);
    }
    localSignOut();
    setCurrentUser(null);
    setSavedReports([]);
    setActiveReport(null);
    setViewMode('input');
  };

  // Main Submit Handler
  const handleAnalyzeAndGenerate = async (input: ResearchInput) => {
    setIsLoading(true);
    setErrorMessage(null);

    try {
      const response = await fetch('/api/analyze-and-generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(input),
      });

      if (!response.ok) {
        const errData = await response.json();
        throw new Error(errData.error || 'Failed to generate report.');
      }

      const report: FullAnalysisReport = await response.json();
      setActiveReport(report);

      // Save report into user database and Firestore
      if (currentUser) {
        saveUserCV(currentUser.id, report);
        await saveUserCVToFirestore(currentUser.id, report);
        const updatedCVs = await fetchUserCVsFromFirestore(currentUser.id);
        setSavedReports(updatedCVs.length > 0 ? updatedCVs : getUserCVs(currentUser.id));
      } else {
        // Guest temp storage
        setSavedReports((prev) => [report, ...prev.filter((r) => r.id !== report.id)]);
      }

      // Switch view to qualification scorecard
      setViewMode('scorecard');
    } catch (err: any) {
      console.error('Error during analysis:', err);
      setErrorMessage(err.message || 'An error occurred during AI evaluation.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpdateCV = async (updatedCV: TailoredCV) => {
    if (!activeReport) return;
    const updatedReport = { ...activeReport, tailoredCV: updatedCV };
    setActiveReport(updatedReport);

    if (currentUser) {
      saveUserCV(currentUser.id, updatedReport);
      await saveUserCVToFirestore(currentUser.id, updatedReport);
      const updatedCVs = await fetchUserCVsFromFirestore(currentUser.id);
      setSavedReports(updatedCVs.length > 0 ? updatedCVs : getUserCVs(currentUser.id));
    } else {
      setSavedReports((prev) =>
        prev.map((r) => (r.id === updatedReport.id ? updatedReport : r))
      );
    }
  };

  const handleDeleteReport = async (id: string) => {
    if (currentUser) {
      deleteUserCV(currentUser.id, id);
      await deleteUserCVFromFirestore(currentUser.id, id);
      const updatedCVs = await fetchUserCVsFromFirestore(currentUser.id);
      setSavedReports(updatedCVs);
    } else {
      setSavedReports((prev) => prev.filter((r) => r.id !== id));
    }

    if (activeReport?.id === id) {
      setActiveReport(null);
      setViewMode('input');
    }
  };

  const handleClearAllHistory = () => {
    if (currentUser) {
      clearUserCVs(currentUser.id);
      setSavedReports([]);
    } else {
      setSavedReports([]);
    }
    setActiveReport(null);
    setViewMode('input');
    setIsHistoryOpen(false);
  };

  const handleResetToNew = () => {
    setActiveReport(null);
    setViewMode('input');
    setErrorMessage(null);
  };

  return (
    <div className="min-h-screen bg-[#0A0A0A] text-[#F0F0F0] selection:bg-[#00FF41] selection:text-black font-sans">
      {/* Top Navigation */}
      <Navbar
        currentUser={currentUser}
        onOpenAuth={() => setIsAuthOpen(true)}
        onSignOut={handleSignOut}
        onOpenHistory={() => setIsHistoryOpen(true)}
        onReset={handleResetToNew}
        savedReportsCount={savedReports.length}
        hasActiveReport={!!activeReport}
      />

      <main className="pb-16 pt-4">
        {/* Error Alert Display */}
        {errorMessage && (
          <div className="max-w-4xl mx-auto px-4 mb-6">
            <div className="p-4 rounded-xs bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-center justify-between gap-3 font-mono">
              <div className="flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
                <span>{errorMessage}</span>
              </div>
              <button
                onClick={() => setErrorMessage(null)}
                className="text-rose-400 font-bold hover:underline cursor-pointer uppercase"
              >
                Dismiss
              </button>
            </div>
          </div>
        )}

        {/* View Mode 1: Input / Search Form */}
        {viewMode === 'input' && !isLoading && (
          <div>
            <HeroHeader />
            <InputForm
              onSubmit={handleAnalyzeAndGenerate}
              isLoading={isLoading}
              savedProfile={savedProfile}
              onSaveProfile={handleSaveProfile}
              onClearProfile={handleClearProfile}
              currentUserId={currentUser?.id}
            />
          </div>
        )}

        {/* Loading Stepper Progress */}
        {isLoading && <AnalysisProgress />}

        {/* View Mode 2: Qualification Scorecard Evaluation */}
        {viewMode === 'scorecard' && activeReport && !isLoading && (
          <div className="pt-6">
            <QualificationScorecard
              qualification={activeReport.qualification}
              jobProfile={activeReport.jobProfile}
              userProfile={activeReport.userProfile}
              onProceedToCV={() => setViewMode('cv')}
            />
          </div>
        )}

        {/* View Mode 3: Interactive CV Studio */}
        {viewMode === 'cv' && activeReport && !isLoading && (
          <div className="pt-6">
            <CVEditorPreview
              cv={activeReport.tailoredCV}
              jobProfile={activeReport.jobProfile}
              onUpdateCV={handleUpdateCV}
              onOpenCoverLetter={() => setIsCoverLetterOpen(true)}
              onOpenInterviewPrep={() => setIsInterviewPrepOpen(true)}
              onBackToScorecard={() => setViewMode('scorecard')}
            />
          </div>
        )}
      </main>

      {/* MODALS */}
      {isAuthOpen && (
        <AuthModal
          currentUser={currentUser}
          onUserChanged={handleUserChanged}
          onSignOut={handleSignOut}
          onClose={() => setIsAuthOpen(false)}
        />
      )}

      {isHistoryOpen && (
        <SavedReportsHistoryModal
          reports={savedReports}
          onSelectReport={(report: any) => {
            setActiveReport(report);
            setViewMode('scorecard');
            setIsHistoryOpen(false);
          }}
          onDeleteReport={handleDeleteReport}
          onClearAll={handleClearAllHistory}
          onClose={() => setIsHistoryOpen(false)}
        />
      )}

      {isCoverLetterOpen && activeReport && (
        <CoverLetterModal
          coverLetter={activeReport.coverLetter}
          onClose={() => setIsCoverLetterOpen(false)}
        />
      )}

      {isInterviewPrepOpen && activeReport && (
        <InterviewPrepDrawer
          interviewPrep={activeReport.interviewPrep}
          onClose={() => setIsInterviewPrepOpen(false)}
        />
      )}
    </div>
  );
}
