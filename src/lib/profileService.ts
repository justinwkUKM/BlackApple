import { UserProfileData, SavedUserProfile } from '../types';
import { db, handleFirestoreError, OperationType } from './firebase';
import { doc, getDoc, setDoc, deleteDoc } from 'firebase/firestore';

const LOCAL_STORAGE_KEY_PREFIX = 'BLACKAPPLE_SAVED_PROFILE_';
const LOCAL_STORAGE_URLS_KEY_PREFIX = 'BLACKAPPLE_SAVED_URLS_';

export function getLocalStorageProfileKey(userId: string | null): string {
  return LOCAL_STORAGE_KEY_PREFIX + (userId || 'guest');
}

export function getLocalStorageUrlsKey(userId: string | null): string {
  return LOCAL_STORAGE_URLS_KEY_PREFIX + (userId || 'guest');
}

export function getSavedCandidateUrlsLocal(userId: string | null): { websiteUrl?: string; linkedinUrl?: string; githubUrl?: string } {
  try {
    const raw = localStorage.getItem(getLocalStorageUrlsKey(userId));
    if (raw) {
      return JSON.parse(raw);
    }
  } catch (e) {
    console.error('Failed to parse saved candidate URLs from localStorage:', e);
  }
  const profile = getSavedUserProfileLocal(userId);
  return profile?.urls || {};
}

export function saveCandidateUrlsLocal(
  userId: string | null,
  urls: { websiteUrl?: string; linkedinUrl?: string; githubUrl?: string }
): void {
  try {
    localStorage.setItem(getLocalStorageUrlsKey(userId), JSON.stringify(urls));
  } catch (e) {
    console.error('Failed to save candidate URLs to localStorage:', e);
  }
}

export function getSavedUserProfileLocal(userId: string | null): SavedUserProfile | null {
  try {
    const raw = localStorage.getItem(getLocalStorageProfileKey(userId));
    if (!raw) return null;
    return JSON.parse(raw) as SavedUserProfile;
  } catch (e) {
    console.error('Failed to parse saved user profile from localStorage:', e);
    return null;
  }
}

export function saveUserProfileLocal(
  userId: string | null,
  profile: UserProfileData,
  urls: { websiteUrl?: string; linkedinUrl?: string; githubUrl?: string }
): SavedUserProfile {
  const saved: SavedUserProfile = {
    userProfile: profile,
    urls,
    lastUpdated: new Date().toISOString(),
  };
  try {
    localStorage.setItem(getLocalStorageProfileKey(userId), JSON.stringify(saved));
  } catch (e) {
    console.error('Failed to save user profile to localStorage:', e);
  }
  return saved;
}

export function clearSavedUserProfileLocal(userId: string | null): void {
  try {
    localStorage.removeItem(getLocalStorageProfileKey(userId));
  } catch (e) {
    console.error('Failed to clear user profile from localStorage:', e);
  }
}

// Firestore operations for logged in user
export async function fetchUserProfileFirestore(userId: string): Promise<SavedUserProfile | null> {
  const path = `users/${userId}/saved_profile/main`;
  try {
    const snap = await getDoc(doc(db, 'users', userId, 'saved_profile', 'main'));
    if (snap.exists()) {
      return snap.data() as SavedUserProfile;
    }
    return null;
  } catch (e) {
    console.warn('Could not fetch user profile from Firestore:', e);
    return null;
  }
}

export async function saveUserProfileFirestore(
  userId: string,
  profile: UserProfileData,
  urls: { websiteUrl?: string; linkedinUrl?: string; githubUrl?: string }
): Promise<SavedUserProfile> {
  const saved = saveUserProfileLocal(userId, profile, urls);
  const path = `users/${userId}/saved_profile/main`;
  try {
    await setDoc(doc(db, 'users', userId, 'saved_profile', 'main'), saved, { merge: true });
  } catch (e) {
    handleFirestoreError(e, OperationType.WRITE, path);
  }
  return saved;
}

export async function deleteUserProfileFirestore(userId: string): Promise<void> {
  clearSavedUserProfileLocal(userId);
  const path = `users/${userId}/saved_profile/main`;
  try {
    await deleteDoc(doc(db, 'users', userId, 'saved_profile', 'main'));
  } catch (e) {
    handleFirestoreError(e, OperationType.DELETE, path);
  }
}

export async function fetchAndParseUserProfile(urls: {
  websiteUrl?: string;
  linkedinUrl?: string;
  githubUrl?: string;
}): Promise<{ userProfile: UserProfileData; urls: { websiteUrl?: string; linkedinUrl?: string; githubUrl?: string } }> {
  const response = await fetch('/api/fetch-user-profile', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(urls),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.error || 'Failed to fetch and parse profile from provided links.');
  }

  const data = await response.json();
  return data;
}

// Keep backward compatible wrapper
export async function fetchAndParseLinkedInProfile(
  linkedinUrl: string,
  websiteUrl?: string,
  githubUrl?: string
): Promise<{ userProfile: UserProfileData; urls: { linkedinUrl: string; websiteUrl?: string; githubUrl?: string } }> {
  return fetchAndParseUserProfile({ linkedinUrl, websiteUrl, githubUrl }) as any;
}
