import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signInWithPopup,
  signOut,
  onAuthStateChanged,
  updateProfile,
} from "firebase/auth";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { createContext, useContext, useEffect, useState } from "react";
import { auth, db, googleProvider } from "../firebase";

const AuthContext = createContext();

const slugify = (text) =>
  text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");

const generateUniqueSlug = async (baseName) => {
  let slug = slugify(baseName);
  let suffix = 1;

  while (true) {
    const ref = doc(db, "profiles", slug);
    const exists = await getDoc(ref);
    if (!exists.exists()) break;
    slug = `${slugify(baseName)}-${suffix++}`;
  }

  return slug;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  // Cargar perfil desde Firestore
  const loadProfile = async (uid) => {
    const ref = doc(db, "users", uid);
    const snap = await getDoc(ref);
    if (snap.exists()) setProfile(snap.data());
  };

  // Crear perfil si no existe
  const createProfileIfNeeded = async (firebaseUser) => {
    const uid = firebaseUser.uid;
    const ref = doc(db, "users", uid);
    const snap = await getDoc(ref);

    if (!snap.exists()) {
      const baseName =
        firebaseUser.displayName || firebaseUser.email.split("@")[0];
      const slug = await generateUniqueSlug(baseName);

      const newProfile = {
        display_name: baseName,
        username: slug,
        avatar_url: firebaseUser.photoURL || "",
        bio: "",
        created_at: Date.now(),
      };

      await setDoc(ref, newProfile);
      setProfile(newProfile);
    } else {
      setProfile(snap.data());
    }
  };

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        setUser(firebaseUser);
        await createProfileIfNeeded(firebaseUser);
      } else {
        setUser(null);
        setProfile(null);
      }
      setLoading(false);
    });

    return () => unsub();
  }, []);

  const register = async (email, password) => {
    const { user } = await createUserWithEmailAndPassword(
      auth,
      email,
      password
    );
    return user;
  };

  const login = async (email, password) => {
    const { user } = await signInWithEmailAndPassword(auth, email, password);
    return user;
  };

  const loginWithGoogle = async () => {
    const { user } = await signInWithPopup(auth, googleProvider);
    return user;
  };

  const logout = async () => {
    await signOut(auth);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        profile,
        loading,
        register,
        login,
        loginWithGoogle,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
