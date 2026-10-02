let isSignup=false;
const $=id=>document.getElementById(id);
const modal=$("authModal");

$("checkerForm").addEventListener("submit", async e=>{
  e.preventDefault();
  $("formMsg").textContent="Analyzing…";
  const payload={
    title:$("title").value, company:$("company").value, contact:$("contact").value,
    link:$("link").value, description:$("description").value
  };
  try{
    const r=await fetch("/api/analyze",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify(payload)});
    const data=await r.json();
    if(!r.ok) throw new Error(data.error||"Analysis failed");
    renderResult(data);
    $("formMsg").textContent="";
  }catch(err){$("formMsg").textContent=err.message}
});

function renderResult(d){
  const r=$("result");
  r.className="panel result";
  r.innerHTML=`
    <p class="eyebrow">ANALYSIS COMPLETE</p>
    <div class="riskBadge ${d.level.toLowerCase()}">${d.level} RISK</div>
    <div class="score">${d.score}<small>/100</small></div>
    <p>${escapeHtml(d.advice)}</p>
    <div class="signals">${d.signals.length?d.signals.map(s=>`<div class="signal"><b>⚠️ ${escapeHtml(s.label)} <small>(+${s.points})</small></b><span>${escapeHtml(s.detail)}</span></div>`).join(""):"<div class='signal'><b>✓ No major warning signals detected</b><span>Still verify the company independently.</span></div>"}</div>
    <p><small>${escapeHtml(d.disclaimer)}</small></p>`;
}
function escapeHtml(s){return String(s).replace(/[&<>"']/g,m=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[m]))}

$("loginBtn").onclick=()=>openAuth(false);
$("toggleAuth").onclick=()=>openAuth(!isSignup);
$("adminBtn").onclick=async()=>{
  const email=prompt("Admin email:");
  const password=prompt("Admin password:");
  if(!email||!password)return;
  const r=await fetch("/api/auth/login",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({email,password})});
  const d=await r.json();
  if(d.role!=="admin"){alert(d.error||"Admin login failed");return}
  const k=await fetch("/api/admin/key").then(x=>x.json());
  localStorage.setItem("internshield_admin_key",k.key);
  location.href="/admin.html";
};
document.querySelector("[data-close]").onclick=()=>modal.classList.add("hidden");
modal.addEventListener("click",e=>{if(e.target===modal)modal.classList.add("hidden")});

function openAuth(signup){
  isSignup=signup;
  $("authTitle").textContent=signup?"Create Student Account":"Student Login";
  $("nameWrap").classList.toggle("hidden",!signup);
  $("toggleAuth").textContent=signup?"Already have an account? Login":"Create a student account";
  $("authMsg").textContent="";
  modal.classList.remove("hidden");
}
$("authForm").onsubmit=async e=>{
  e.preventDefault();
  const endpoint=isSignup?"/api/auth/signup":"/api/auth/login";
  const body={name:$("authName").value,email:$("authEmail").value,password:$("authPassword").value};
  const r=await fetch(endpoint,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify(body)});
  const d=await r.json();
  $("authMsg").textContent=d.error||d.message;
  if(r.ok&&!isSignup){modal.classList.add("hidden");alert(`Welcome, ${d.name||"student"}!`)}
  if(r.ok&&isSignup){setTimeout(()=>openAuth(false),600)}
};
