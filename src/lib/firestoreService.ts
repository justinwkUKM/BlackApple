import {
  doc,
  setDoc,
  getDoc,
  getDocs,
  collection,
  deleteDoc,
} from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from './firebase';
import { UserAccount, SavedCVItem, FullAnalysisReport } from '../types';
import { convertReportToSavedCV } from './authStore';

export async function syncUserToFirestore(user: UserAccount): Promise<void> {
  const path = `users/${user.id}`;
  try {
    await setDoc(doc(db, 'users', user.id), {
      id: user.id,
      name: user.name || 'User',
      email: user.email || '',
      avatarUrl: user.avatarUrl || '',
      createdAt: user.createdAt || new Date().toISOString(),
    }, { merge: true });
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
  }
}

export async function fetchUserFromFirestore(userId: string): Promise<UserAccount | null> {
  const path = `users/${userId}`;
  try {
    const docSnap = await getDoc(doc(db, 'users', userId));
    if (docSnap.exists()) {
      return docSnap.data() as UserAccount;
    }
    return null;
  } catch (error) {
    handleFirestoreError(error, OperationType.GET, path);
  }
}

export async function fetchUserCVsFromFirestore(userId: string): Promise<SavedCVItem[]> {
  const path = `users/${userId}/saved_cvs`;
  try {
    const querySnapshot = await getDocs(collection(db, 'users', userId, 'saved_cvs'));
    const items: SavedCVItem[] = [];
    querySnapshot.forEach((doc) => {
      items.push(doc.data() as SavedCVItem);
    });
    return items.sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());
  } catch (error) {
    handleFirestoreError(error, OperationType.LIST, path);
  }
}

export async function saveUserCVToFirestore(
  userId: string,
  reportOrItem: FullAnalysisReport | SavedCVItem
): Promise<void> {
  const cvItem: SavedCVItem = 'jobProfile' in reportOrItem
    ? convertReportToSavedCV(reportOrItem, userId)
    : reportOrItem;

  const path = `users/${userId}/saved_cvs/${cvItem.id}`;
  try {
    await setDoc(doc(db, 'users', userId, 'saved_cvs', cvItem.id), {
      ...cvItem,
      userId,
      company: cvItem.company || 'Company',
      role: cvItem.role || 'Role',
      updatedAt: new Date().toISOString(),
    });
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
  }
}

export async function deleteUserCVFromFirestore(userId: string, cvId: string): Promise<void> {
  const path = `users/${userId}/saved_cvs/${cvId}`;
  try {
    await deleteDoc(doc(db, 'users', userId, 'saved_cvs', cvId));
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, path);
  }
}
