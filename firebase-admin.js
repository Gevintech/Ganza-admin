// admin/firebase-admin.js
// Shared Firebase init and admin helpers
import { initializeApp } from "https://www.gstatic.com/firebasejs/9.22.2/firebase-app.js";
import { getAnalytics } from "https://www.gstatic.com/firebasejs/9.22.2/firebase-analytics.js";
import { getAuth, signInWithEmailAndPassword, signOut, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/9.22.2/firebase-auth.js";
import { getFirestore, collection, addDoc, deleteDoc, doc, updateDoc, getDocs, onSnapshot, query, orderBy } from "https://www.gstatic.com/firebasejs/9.22.2/firebase-firestore.js";

const firebaseConfig = {
  apiKey: "AIzaSyCwUFo1k8jqgE2FLSILhV1I9rf1M7x5S_4",
  authDomain: "make-money-7aea2.firebaseapp.com",
  databaseURL: "https://make-money-7aea2-default-rtdb.firebaseio.com",
  projectId: "make-money-7aea2",
  storageBucket: "make-money-7aea2.firebasestorage.app",
  messagingSenderId: "584084915395",
  appId: "1:584084915395:web:a5cb8ef3410a1312048e76",
  measurementId: "G-ZQJ3M74ERQ"
};

const app = initializeApp(firebaseConfig);
try { getAnalytics(app); } catch(e){}

export const auth = getAuth(app);
export const firestore = getFirestore(app);

// ADMIN_EMAILS - only these emails can access admin dashboard (client-side check)
export const ADMIN_EMAILS = [
  "youremail@example.com" // << REPLACE this with your admin email(s)
];

// Admin sign in
export async function adminSignIn(email, password){
  const uc = await signInWithEmailAndPassword(auth, email, password);
  // check admin
  if (!ADMIN_EMAILS.includes(uc.user.email)){
    await signOut(auth);
    throw new Error('Not authorized as admin');
  }
  return uc.user;
}

export async function adminSignOut(){ await signOut(auth); }

// Firestore CRUD for predictions
export async function addPrediction(pred){
  // pred: { date, league, match, tip, odds, time, status, outline }
  const col = collection(firestore, 'predictions');
  const docRef = await addDoc(col, pred);
  return docRef.id;
}

export async function updatePrediction(id, data){
  const d = doc(firestore, 'predictions', id);
  await updateDoc(d, data);
}

export async function deletePrediction(id){
  const d = doc(firestore, 'predictions', id);
  await deleteDoc(d);
}

// realtime subscription for dashboard
export function onPredictionsSnapshot(cb){
  const col = collection(firestore, 'predictions');
  const q = query(col, orderBy('date','desc'));
  return onSnapshot(q, (snap) => {
    const list = [];
    snap.forEach(d => list.push({ id: d.id, ...d.data() }));
    cb(list);
  });
}