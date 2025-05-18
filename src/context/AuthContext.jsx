// src/context/AuthContext.jsx
import { createContext, useContext, useEffect, useState } from "react";
import {
  onAuthStateChanged,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signInWithPopup,
  GoogleAuthProvider,
  signOut,
} from "firebase/auth";
import {
  doc,
  setDoc,
  getDoc,
  collection,
  query,
  where,
  getDocs,
  serverTimestamp,
} from "firebase/firestore";
import slugify from "slugify";
import { auth, db } from "@/firebase";

const AuthContext = createContext();
export const useAuth = () => useContext(AuthContext);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  const slugExists = async (slug) => {
    const q = query(collection(db, "users"), where("slug", "==", slug));
    const snap = await getDocs(q);
    return !snap.empty;
  };

  const generateUniqueSlug = async (base) => {
    let slug = slugify(base, { lower: true });
    let i = 1;
    while (await slugExists(slug)) {
      slug = `${slugify(base, { lower: true })}-${i}`;
      i++;
    }
    return slug;
  };

  const refreshProfile = async (uid) => {
    const snap = await getDoc(doc(db, "users", uid));
    if (snap.exists()) setProfile(snap.data());
  };

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (fbUser) => {
      setUser(fbUser);
      if (fbUser) await refreshProfile(fbUser.uid);
      setLoading(false);
    });
    return unsub;
  }, []);

  const signUp = async ({ email, password, slug }) => {
    const res = await createUserWithEmailAndPassword(auth, email, password);
    const uniqueSlug = await generateUniqueSlug(slug);
    await setDoc(doc(db, "users", res.user.uid), {
      email,
      slug: uniqueSlug,
      created_at: serverTimestamp(),
    });
    await refreshProfile(res.user.uid);
  };

  const login = (email, password) =>
    signInWithEmailAndPassword(auth, email, password);

  const loginWithGoogle = async () => {
    const provider = new GoogleAuthProvider();
    const res = await signInWithPopup(auth, provider);
    const snap = await getDoc(doc(db, "users", res.user.uid));
    if (!snap.exists()) {
      const displayName = res.user.displayName || res.user.email;
      const slug = await generateUniqueSlug(displayName);
      await setDoc(doc(db, "users", res.user.uid), {
        email: res.user.email,
        slug,
        created_at: serverTimestamp(),
      });
    }
    await refreshProfile(res.user.uid);
  };

  const logout = () => signOut(auth);

  return (
    <AuthContext.Provider
      value={{ user, profile, login, signUp, loginWithGoogle, logout }}
    >
      {!loading && children}
    </AuthContext.Provider>
  );
}
