# Firebase setup

1. Create a Firebase project.
2. Enable Authentication → Email/Password.
3. Create a Firestore database.
4. Enable Storage.
5. Create a Web App and copy its Firebase config into:
   `public/js/firebase-config.js`
6. In Firebase Console → Firestore → Rules, paste `firestore.rules`.
7. In Storage → Rules, paste `storage.rules`.
8. Run the project:
   npm install
   npm start
9. Open http://localhost:3000

## Admin
The demo admin remains server-side in `server.js`. For a production deployment, replace the demo admin key flow with Firebase Admin SDK/custom claims and server-side session validation.

## Gemini
No Gemini key is required for the included detector. If you add Gemini, call it from the Express backend and store the key in `.env`, never in frontend code.
