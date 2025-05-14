import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signInWithPopup,
  signOut,
  onAuthStateChanged,
} from "firebase/auth";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { createContext, useContext, useEffect, useState } from "react";
import { auth, db, googleProvider } from "../firebase";

const AuthContext = createContext();

// Convierte texto en slug único (ej: "martin brumana" => "martin-brumana")
const slugify = (text) =>
  text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");

// Genera un slug único verificando en Firestore
const generateUniqueSlug = async (baseName) => {
  let slug = slugify(baseName);
  let suffix = 1;

  while (true) {
    const query = doc(db, "users", slug);
    const exists = await getDoc(query);
    if (!exists.exists()) break;
    slug = `${slugify(baseName)}-${suffix++}`;
  }

  return slug;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  // Carga el perfil extendido del usuario desde Firestore
  const loadProfile = async (uid) => {
    const ref = doc(db, "users", uid);
    const snap = await getDoc(ref);
    if (snap.exists()) setProfile(snap.data());
  };

  // Crea el perfil en Firestore si aún no existe
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

  // Escuchar cambios de autenticación
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

  // Funciones públicas
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
    await createProfileIfNeeded(firebaseUser);
  };

  const logout = async () => {
    await signOut(auth);
  };

  const refreshProfile = async () => {
    if (user) await loadProfile(user.uid);
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
        refreshProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
