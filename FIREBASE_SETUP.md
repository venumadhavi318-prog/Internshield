# Firebase setup

1. Create a Firebase project.
2. Enable Authentication → Sign-in method → **Email/Password** → Enable.
   Also enable **Google** if you want the "Continue with Google" button to work.
3. Create a Firestore database.
4. Enable Storage.
5. The Web App config is already set in `public/js/firebase-config.js`
   (Firebase Web config is public by design; access is enforced by rules).
6. In Firebase Console → Firestore → Rules, paste `firestore.rules`.
7. In Storage → Rules, paste `storage.rules`.
8. Run the project:
   npm install
   npm start
9. Open http://localhost:3000

## Sign-in methods
- Email/password: the login modal's form (student signup + login).
- Google: the "Continue with Google" button in the same modal, using
  `signInWithPopup`. A Google user gets a `users/{uid}` profile created on
  first sign-in. The Google popup requires the current domain to be listed
  under Authentication → Settings → Authorized domains (`localhost` is
  allowed by default).

## Troubleshooting
- `auth/configuration-not-found` (HTTP 400 `CONFIGURATION_NOT_FOUND`): the
  Email/Password provider is not enabled. Go to
  Authentication → Sign-in method → Email/Password → Enable, then retry.
- `auth/operation-not-allowed`: same cause — enable the provider.
- `auth/unauthorized-domain`: add `localhost` (and your deploy domain) under
  Authentication → Settings → Authorized domains.
- Firestore `permission-denied`: confirm `firestore.rules` was published and
  the student is signed in before writing history.

## Admin
There is no visible admin button or link. Admin sign-in happens through the same
login form used by students; the app detects the role and routes admins to
`/admin.html` and students to `/history.html`. The server issues an in-memory
session token; set `ADMIN_EMAIL` / `ADMIN_PASSWORD` in `.env`.

To grant Firebase admin privileges, set the user's `users/{uid}` document
`role` field to `"admin"` in Firestore. The app reads that field after sign-in to
choose the destination. For a production deployment, enforce this with the
Firebase Admin SDK and custom claims instead of a self-writable `role` field,
and add persistent server-side session validation.

## Gemini
No Gemini key is required for the included detector. If you add Gemini, call it from the Express backend and store the key in `.env`, never in frontend code.
