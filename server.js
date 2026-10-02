const express = require("express");
const fs = require("fs");
const path = require("path");
const crypto = require("crypto");

const app = express();
const PORT = process.env.PORT || 3000;
const ROOT = __dirname;
const DATA = path.join(ROOT, "data");
const PUBLIC = path.join(ROOT, "public");

if (!fs.existsSync(DATA)) fs.mkdirSync(DATA, { recursive: true });

const usersFile = path.join(DATA, "users.json");
const submissionsFile = path.join(DATA, "submissions.json");

function readJson(file, fallback=[]) {
  try {
    if (!fs.existsSync(file)) fs.writeFileSync(file, JSON.stringify(fallback, null, 2));
    return JSON.parse(fs.readFileSync(file, "utf8"));
  } catch { return fallback; }
}
function writeJson(file, data) {
  fs.writeFileSync(file, JSON.stringify(data, null, 2));
}
function hash(value) {
  return crypto.createHash("sha256").update(value).digest("hex");
}

const ADMIN_EMAIL = process.env.ADMIN_EMAIL || "admin@internshield.local";
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || "Admin@12345";

app.use(express.json({ limit: "1mb" }));
app.use(express.static(PUBLIC));

function clean(value, max=5000) {
  return String(value || "").trim().slice(0, max);
}

function analyzeOffer(input) {
  const title = clean(input.title, 250);
  const company = clean(input.company, 250);
  const description = clean(input.description, 7000);
  const contact = clean(input.contact, 500);
  const link = clean(input.link, 1000);
  const combined = `${title} ${company} ${description} ${contact} ${link}`.toLowerCase();

  let score = 0;
  const signals = [];

  const add = (points, label, detail) => {
    score += points;
    signals.push({ points, label, detail });
  };

  if (/registration fee|application fee|processing fee|training fee|security deposit|pay.*internship|fee.*internship|₹\s?\d+|\brs\.?\s?\d+|\binr\s?\d+/i.test(combined)) {
    add(30, "Payment requested", "The offer appears to ask for money such as a registration, processing, training, or security fee.");
  }
  if (/guaranteed job|100% job|guaranteed placement|earn \d+.*day|earn.*daily|instant selection|selected without interview/i.test(combined)) {
    add(20, "Unrealistic promise", "The wording contains unusually strong guarantees or instant-selection claims.");
  }
  if (/whatsapp only|telegram only|contact.*whatsapp|message.*telegram/i.test(combined)) {
    add(12, "Informal contact channel", "The offer relies heavily on messaging apps rather than a verifiable company channel.");
  }
  if (/urgent|act now|limited seats|today only|within \d+ hours/i.test(combined)) {
    add(10, "Pressure language", "Urgency can make it harder for candidates to verify an offer independently.");
  }
  if (!company) add(8, "Missing company name", "A company name is needed for meaningful verification.");
  if (!description || description.length < 80) add(8, "Limited job details", "The internship description contains very little information.");
  if (!link) add(5, "No company/job link", "There is no website or job link to verify.");
  if (link && !/^https?:\/\//i.test(link)) add(7, "Unclear link format", "The supplied link does not look like a normal HTTP/HTTPS URL.");
  if (/@(gmail|yahoo|outlook|hotmail)\./i.test(contact)) {
    add(8, "Free email address", "A free mailbox can be legitimate, but an official company domain is easier to verify.");
  }
  if (/pay.*upi|upi.*pay|send.*otp|share.*otp|share.*password|bank details|card details/i.test(combined)) {
    add(35, "Sensitive information request", "The text appears to request money or sensitive account information.");
  }

  score = Math.min(100, score);
  let level = score >= 55 ? "HIGH" : score >= 30 ? "MEDIUM" : "LOW";

  const advice = level === "HIGH"
    ? "Pause before responding. Do not pay or share passwords, OTPs, card/bank credentials, or identity documents until the organization is independently verified."
    : level === "MEDIUM"
      ? "Verify the company, recruiter, domain, job posting, and contact details using independent sources before proceeding."
      : "No major warning signals were detected by this basic checker. This is not proof that the internship is genuine; verify the organization independently.";

  return {
    score, level, signals, advice,
    checkedAt: new Date().toISOString(),
    disclaimer: "This tool provides a risk assessment, not a legal or definitive determination that an internship is fake."
  };
}

app.post("/api/auth/signup", (req,res) => {
  const name = clean(req.body.name,100);
  const email = clean(req.body.email,150).toLowerCase();
  const password = String(req.body.password || "");
  if (!name || !email || password.length < 6) return res.status(400).json({error:"Enter a name, valid email, and password of at least 6 characters."});
  if (email === ADMIN_EMAIL) return res.status(400).json({error:"That email is reserved."});

  const users = readJson(usersFile, []);
  if (users.some(u => u.email === email)) return res.status(409).json({error:"Account already exists."});
  users.push({ id: crypto.randomUUID(), name, email, passwordHash: hash(password), createdAt:new Date().toISOString() });
  writeJson(usersFile, users);
  res.json({message:"Account created.", user:{name,email}});
});

app.post("/api/auth/login", (req,res) => {
  const email = clean(req.body.email,150).toLowerCase();
  const password = String(req.body.password || "");

  if (email === ADMIN_EMAIL && password === ADMIN_PASSWORD) {
    return res.json({role:"admin", name:"Administrator", email});
  }

  const users = readJson(usersFile, []);
  const user = users.find(u => u.email === email && u.passwordHash === hash(password));
  if (!user) return res.status(401).json({error:"Invalid email or password."});
  res.json({role:"student", name:user.name, email:user.email});
});

app.post("/api/analyze", (req,res) => {
  const result = analyzeOffer(req.body);
  const submissions = readJson(submissionsFile, []);
  submissions.unshift({
    id: crypto.randomUUID(),
    studentName: clean(req.body.studentName,100) || "Guest",
    studentEmail: clean(req.body.studentEmail,150),
    title: clean(req.body.title,250),
    company: clean(req.body.company,250),
    link: clean(req.body.link,1000),
    level: result.level,
    score: result.score,
    result,
    createdAt: new Date().toISOString()
  });
  writeJson(submissionsFile, submissions.slice(0, 1000));
  res.json(result);
});

function adminOnly(req,res,next) {
  const key = req.headers["x-admin-key"];
  if (key !== hash(ADMIN_EMAIL + ADMIN_PASSWORD)) return res.status(401).json({error:"Admin authentication required."});
  next();
}

app.get("/api/admin/key", (req,res) => {
  // Demo-only helper. In production use a proper session/JWT instead.
  res.json({key: hash(ADMIN_EMAIL + ADMIN_PASSWORD)});
});

app.get("/api/admin/submissions", adminOnly, (req,res) => {
  res.json(readJson(submissionsFile, []));
});

app.get("/api/admin/stats", adminOnly, (req,res) => {
  const data = readJson(submissionsFile, []);
  res.json({
    total:data.length,
    high:data.filter(x=>x.level==="HIGH").length,
    medium:data.filter(x=>x.level==="MEDIUM").length,
    low:data.filter(x=>x.level==="LOW").length
  });
});

app.get("*", (req,res) => res.sendFile(path.join(PUBLIC, "index.html")));

app.listen(PORT, () => console.log(`InternShield running at http://localhost:${PORT}`));
