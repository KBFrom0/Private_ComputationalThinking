import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import {
  getAuth,
  GoogleAuthProvider,
  signInWithPopup,
  signOut,
  onAuthStateChanged,
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";
import {
  getFirestore,
  collection,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  onSnapshot,
  query,
  orderBy,
  serverTimestamp,
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";
import { firebaseConfig } from "./config.js";

export const isConfigured = !firebaseConfig.apiKey.startsWith("YOUR_");

let auth, db;
if (isConfigured) {
  const app = initializeApp(firebaseConfig);
  auth = getAuth(app);
  db = getFirestore(app);
}

// ---------- Authentication ----------
export const login = () => signInWithPopup(auth, new GoogleAuthProvider());
export const logout = () => signOut(auth);
export const onUserChanged = (callback) => onAuthStateChanged(auth, callback);

// ---------- Firestore: users/{uid}/words ----------
const wordsRef = (uid) => collection(db, "users", uid, "words");

export function addWord(uid, word) {
  return addDoc(wordsRef(uid), {
    ...word,
    learned: false,
    reviewCount: 0,
    createdAt: serverTimestamp(),
  });
}

export const updateWord = (uid, id, data) => updateDoc(doc(db, "users", uid, "words", id), data);

export const deleteWord = (uid, id) => deleteDoc(doc(db, "users", uid, "words", id));

/** Lắng nghe realtime danh sách từ; trả về hàm hủy lắng nghe. */
export function watchWords(uid, callback) {
  const q = query(wordsRef(uid), orderBy("createdAt", "desc"));
  return onSnapshot(q, (snap) => {
    callback(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
  });
}
