import { auth, signupStudent, loginStudent, loginWithGoogle, saveAnalysis, watchAuth, getUserRole } from "./js/firebase.js";

let isSignup = false, currentUser = null;
const $ = id => document.getElementById(id);
const modal = $("authModal");

/* ------------------------------------------------------------------ *
 * Existing InternShield functionality (preserved)
 * ------------------------------------------------------------------ */
watchAuth(user => {
  currentUser = user;
  const b = $("loginBtn");
  if (user) {
    b.textContent = "Logout";
    b.onclick = () => import("./js/firebase.js").then(m => m.logoutStudent());
  } else {
    b.textContent = "Login";
    b.onclick = () => openAuth(false);
  }
});

$("checkerForm").addEventListener("submit", async e => {
  e.preventDefault();
  $("formMsg").textContent = "Analyzing…";
  const payload = { title: $("title").value, company: $("company").value, contact: $("contact").value, link: $("link").value, description: $("description").value };
  try {
    const r = await fetch("/api/analyze", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ ...payload, studentEmail: currentUser?.email || "", studentName: currentUser?.displayName || "Guest" }) });
    const data = await r.json();
    if (!r.ok) throw new Error(data.error || "Analysis failed");
    if (currentUser) await saveAnalysis(currentUser, payload, data, $("offerFile").files[0]);
    renderResult(data);
    $("formMsg").textContent = currentUser ? "Analysis saved to your account." : "Analysis complete. Login to save your history.";
  } catch (err) { $("formMsg").textContent = err.message; }
});

function renderResult(d) {
  const r = $("result"); r.className = "panel result";
  r.innerHTML = `<p class="eyebrow">ANALYSIS COMPLETE</p>
  <div class="riskBadge ${d.level.toLowerCase()}">${d.level} RISK</div>
  <div class="score">${d.score}<small>/100</small></div>
  <p>${esc(d.advice)}</p><div class="signals">${d.signals.length ? d.signals.map(x => `<div class="signal"><b>⚠️ ${esc(x.label)} <small>(+${x.points})</small></b><span>${esc(x.detail)}</span></div>`).join("") : "<div class='signal'><b>✓ No major warning signals detected</b><span>Still verify the company independently.</span></div>"}</div>
  <p><small>${esc(d.disclaimer)}</small></p>`;
}
function esc(s) { return String(s).replace(/[&<>"']/g, m => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[m])); }

$("loginBtn").onclick = () => openAuth(false);
$("toggleAuth").onclick = () => openAuth(!isSignup);
$("googleBtn").onclick = async () => {
  const btn = $("googleBtn");
  btn.disabled = true;
  $("authMsg").textContent = "";
  try {
    await loginWithGoogle();
    modal.classList.add("hidden");
  } catch (err) {
    if (err && err.code !== "auth/popup-closed-by-user" && err.code !== "auth/cancelled-popup-request") {
      $("authMsg").textContent = friendlyAuthError(err);
    }
  } finally { btn.disabled = false; }
};
document.querySelector("[data-close]").onclick = () => modal.classList.add("hidden");
modal.addEventListener("click", e => { if (e.target === modal) modal.classList.add("hidden"); });

function openAuth(signup) {
  isSignup = signup; $("authTitle").textContent = signup ? "Create Student Account" : "Student Login";
  $("nameWrap").classList.toggle("hidden", !signup);
  $("toggleAuth").textContent = signup ? "Already have an account? Login" : "Create a student account";
  $("authMsg").textContent = ""; modal.classList.remove("hidden");
}
$("authForm").onsubmit = async e => {
  e.preventDefault();
  const email = $("authEmail").value, password = $("authPassword").value;

  // The administrator signs in through this same form and lands on the dashboard.
  try {
    const r = await fetch("/api/auth/login", {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password })
    });
    const d = await r.json();
    if (d.role === "admin") {
      const lr = await fetch("/api/admin/login", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password })
      });
      if (!lr.ok) { $("authMsg").textContent = "Sign-in failed. Please try again."; return; }
      const { token } = await lr.json();
      localStorage.setItem("internshield_admin_token", token);
      modal.classList.add("hidden");
      location.href = "/admin.html";
      return;
    }
  } catch { /* fall through to student login */ }

  try {
    if (isSignup) {
      await signupStudent($("authName").value, email, password);
      $("authMsg").textContent = "Account created. You are signed in.";
    } else {
      const user = await loginStudent(email, password);
      modal.classList.add("hidden");
      // Role-based destination: admins to the dashboard, students to their checks.
      const role = await getUserRole(user);
      location.href = role === "admin" ? "/admin.html" : "/history.html";
    }
  } catch (err) { $("authMsg").textContent = friendlyAuthError(err); }
};

function friendlyAuthError(err) {
  const code = err && err.code ? err.code : "";
  const map = {
    "auth/configuration-not-found": "Login is not enabled yet. Enable Email/Password in Firebase Authentication.",
    "auth/operation-not-allowed": "This sign-in method is disabled in Firebase Authentication.",
    "auth/email-already-in-use": "An account with this email already exists. Try logging in.",
    "auth/invalid-email": "Please enter a valid email address.",
    "auth/weak-password": "Password should be at least 6 characters.",
    "auth/user-not-found": "No account found for that email.",
    "auth/wrong-password": "Incorrect email or password.",
    "auth/invalid-credential": "Incorrect email or password.",
    "auth/too-many-requests": "Too many attempts. Please wait a moment and try again.",
    "auth/unauthorized-domain": "This domain is not authorized in Firebase Authentication settings.",
    "auth/popup-blocked": "Your browser blocked the Google sign-in popup. Please allow popups and try again.",
    "auth/popup-closed-by-user": "",
    "auth/account-exists-with-different-credential": "An account already exists with this email using a different sign-in method.",
    "auth/network-request-failed": "Network error. Check your connection and try again."
  };
  return map[code] || "Something went wrong. Please try again.";
}

/* Mobile navigation toggle + translucent-on-scroll navbar */
(function initNav() {
  const btn = $("menuBtn"), nav = $("primaryNav"), header = document.querySelector(".nav");
  if (!btn || !nav) return;
  const close = () => { nav.classList.remove("open"); btn.setAttribute("aria-expanded", "false"); };
  btn.addEventListener("click", () => {
    const open = nav.classList.toggle("open");
    btn.setAttribute("aria-expanded", String(open));
  });
  nav.addEventListener("click", e => { if (e.target.closest("a")) close(); });

  if (header) {
    const onScroll = () => header.classList.toggle("scrolled", window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
  }
})();
