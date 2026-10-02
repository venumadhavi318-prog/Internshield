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
The demo admin remains server-side in `server.js`. For a production deployment, replace the demo admin key flow with Firebase Admin SDK/custom claims and server-side session validation.

## Gemini
No Gemini key is required for the included detector. If you add Gemini, call it from the Express backend and store the key in `.env`, never in frontend code.
