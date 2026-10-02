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
- Full first-screen hero section ("INTERNSHIP SAFETY, REIMAGINED") with letter-spaced eyebrow typography.
- Product demo metrics (95% / 12+ / 24/7) with individual staggered entrance and count-up animation, clearly labelled as demo values.
- GSAP + ScrollTrigger initial-load timeline and scroll-driven motion.
- The main InternShield shield visual moves right, scales, rotates, moves left and settles — driven directly by scroll progress via `scrub`.
- A dedicated scroll-story section (01 Discover → 02 Analyze → 03 Verify) whose stages reveal progressively with scroll.
- Uses transform/opacity/scale/rotation only for smooth, GPU-friendly animation.
- Responsive: movement distance and scale are reduced on tablet/mobile; no horizontal overflow.
- Respects `prefers-reduced-motion` by disabling non-essential animation and rendering the final state.
- GSAP is loaded from `public/vendor/` (vendored from the npm `gsap` package, no CDN dependency at runtime).
- The animation layer lives in `public/js/animations.js` and is independent of the Firebase module, so a Firebase/CDN failure never breaks the landing animations (and vice versa).
- Existing internship checker, Firebase student history, authentication, and admin dashboard are preserved.

## Landing page structure
Navbar → Hero → Statistics → Scroll-driven verification story → How it works → Risk signals → Call to action → Checker → Footer.

