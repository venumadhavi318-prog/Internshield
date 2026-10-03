import { initializeApp } from "https://www.gstatic.com/firebasejs/12.3.0/firebase-app.js";
import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut, onAuthStateChanged, GoogleAuthProvider, signInWithPopup } from "https://www.gstatic.com/firebasejs/12.3.0/firebase-auth.js";
import { getFirestore, doc, setDoc, getDoc, addDoc, collection, query, orderBy, limit, getDocs, serverTimestamp } from "https://www.gstatic.com/firebasejs/12.3.0/firebase-firestore.js";
import { getStorage, ref, uploadBytes, getDownloadURL } from "https://www.gstatic.com/firebasejs/12.3.0/firebase-storage.js";
import { firebaseConfig } from "./firebase-config.js";

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);

async function ensureUserProfile(user) {
  const userRef = doc(db, "users", user.uid);
  const snap = await getDoc(userRef);
  if (!snap.exists()) {
    await setDoc(userRef, {
      uid: user.uid,
      name: user.displayName || "",
      email: user.email || "",
      role: "student",
      createdAt: serverTimestamp()
    });
  }
}

export async function signupStudent(name,email,password){
  const cred=await createUserWithEmailAndPassword(auth,email,password);
  await setDoc(doc(db,"users",cred.user.uid),{
    uid:cred.user.uid,name,email,role:"student",createdAt:serverTimestamp()
  });
  return cred.user;
}
export async function loginStudent(email,password){
  const cred=await signInWithEmailAndPassword(auth,email,password);
  return cred.user;
}
export async function loginWithGoogle(){
  const provider=new GoogleAuthProvider();
  provider.setCustomParameters({ prompt:"select_account" });
  const cred=await signInWithPopup(auth,provider);
  await ensureUserProfile(cred.user);
  return cred.user;
}
export async function logoutStudent(){ await signOut(auth); }

export async function saveAnalysis(user, input, result, file){
  let fileUrl="";
  if(file){
    const storageRef=ref(storage,`offers/${user.uid}/${Date.now()}_${file.name}`);
    await uploadBytes(storageRef,file);
    fileUrl=await getDownloadURL(storageRef);
  }
  return addDoc(collection(db,"analyses"),{
    uid:user.uid,email:user.email,title:input.title,company:input.company,
    contact:input.contact,link:input.link,description:input.description,
    level:result.level,score:result.score,signals:result.signals,advice:result.advice,
    fileUrl,createdAt:serverTimestamp()
  });
}
export async function getMyAnalyses(user){
  const q=query(collection(db,"analyses"),orderBy("createdAt","desc"),limit(20));
  const snap=await getDocs(q);
  return snap.docs.map(d=>({id:d.id,...d.data()})).filter(x=>x.uid===user.uid);
}
export function watchAuth(callback){ return onAuthStateChanged(auth,callback); }

/* Role is read from the user's own Firestore profile (rules permit self-read).
   Missing/failed lookups fall back to the least-privileged role. */
export async function getUserRole(user){
  if(!user) return "student";
  try{
    const snap=await getDoc(doc(db,"users",user.uid));
    return (snap.exists() && snap.data().role) || "student";
  }catch{ return "student"; }
}
