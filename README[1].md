# InternShield

InternShield is a full-stack web app that helps students assess internship offers for suspicious signals.

## Stack
- Frontend: HTML, CSS, Vanilla JavaScript
- Backend: Node.js + Express
- Storage: JSON files (easy to understand for an interview assignment)
- Authentication: Student signup/login + one admin login
- AI/API: Optional. The included detector works without an external API.

## Run
1. Install Node.js.
2. Open a terminal in this folder.
3. Run:
   npm install
   npm start
4. Open http://localhost:3000

## Demo admin
Email: admin@internshield.local
Password: Admin@12345

Change the admin credentials in `server.js` before publishing.

## API
The backend exposes:
POST /api/analyze
POST /api/auth/signup
POST /api/auth/login
GET /api/admin/submissions
GET /api/admin/stats

The `/api/analyze` endpoint uses a transparent rule-based scoring engine. This is intentional: the project runs without paid API keys.

## Optional AI upgrade
You can later connect Gemini/OpenAI in the backend. Keep the API key only in a server-side `.env` file; never put it in frontend JavaScript.


## Firebase edition
Firebase is now integrated for student authentication, Firestore analysis history, and optional offer-file storage. See `FIREBASE_SETUP.md`.


## Scroll-Driven Hero Assignment Features
The homepage now includes the requested animation-focused assignment layer:
- Full first-screen hero section with letter-spaced headline.
- Percentage impact metrics with staggered entrance/count-up animation.
- GSAP + ScrollTrigger initial-load and scroll-driven motion.
- Main InternShield visual moves, scales and rotates from scroll progress.
- A dedicated scroll-story section demonstrates Detect → Verify → Decide motion.
- Uses transform-based animation and `scrub` interpolation for smooth scrolling.
- Respects `prefers-reduced-motion`.
- Existing internship checker, Firebase student history, authentication, and admin dashboard are preserved.
