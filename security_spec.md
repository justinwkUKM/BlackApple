# Security Specification for BlackApple Firestore Rules

## 1. Data Invariants
- A User profile (`/users/{userId}`) can only be created, read, updated, or deleted by the authenticated user matching `request.auth.uid == userId`.
- A Saved CV item (`/users/{userId}/saved_cvs/{cvId}`) can only be read, created, updated, or deleted by the authenticated user whose `request.auth.uid == userId`.
- User ID parameters must match valid document ID constraints (`isValidId`).
- Unauthenticated access to users or saved CV subcollections is strictly denied.

## 2. Dirty Dozen Security Test Cases
1. Unauthenticated read on `/users/{userId}` -> PERMISSION_DENIED
2. Unauthenticated write on `/users/{userId}` -> PERMISSION_DENIED
3. User A attempting to read User B's profile (`/users/{userB}`) -> PERMISSION_DENIED
4. User A attempting to write User B's profile (`/users/{userB}`) -> PERMISSION_DENIED
5. User A attempting to create a Saved CV in User B's subcollection (`/users/{userB}/saved_cvs/{cvId}`) -> PERMISSION_DENIED
6. User A attempting to read User B's Saved CVs -> PERMISSION_DENIED
7. User A attempting to update User B's Saved CVs -> PERMISSION_DENIED
8. User A attempting to delete User B's Saved CVs -> PERMISSION_DENIED
9. Authenticated user injecting giant (>128 chars or invalid symbols) document ID -> PERMISSION_DENIED
10. Authenticated user creating a Saved CV with spoofed `userId != request.auth.uid` -> PERMISSION_DENIED
11. Authenticated user mutating `id` or `userId` during update -> PERMISSION_DENIED
12. Attempting arbitrary writes to non-existent collections -> PERMISSION_DENIED
