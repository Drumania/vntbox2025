import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signInWithPopup,
  signOut,
  onAuthStateChanged,
} from "firebase/auth";
import { doc, getDoc, setDoc } from "firebase/firestore";
import {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
} from "react";
import { auth, db, googleProvider } from "../firebase";
import useGenerateKeywords from "../hooks/useGenerateKeywords";

const AuthContext = createContext();

// Convierte texto en slug único
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
  const generateKeywords = useGenerateKeywords(); // HOOK usado correctamente aquí

  const loadProfile = async (uid) => {
    const ref = doc(db, "users", uid);
    const snap = await getDoc(ref);
    if (snap.exists()) setProfile(snap.data());
  };

  const createProfileIfNeeded = useCallback(
    async (firebaseUser) => {
      const uid = firebaseUser.uid;
      const ref = doc(db, "users", uid);
      const snap = await getDoc(ref);

      if (!snap.exists()) {
        const rawName =
          firebaseUser.displayName ||
          firebaseUser.email?.split("@")[0] ||
          `usuario-${uid.slice(0, 6)}`;

        const safeDisplayName = rawName.trim() || `usuario-${uid.slice(0, 6)}`;

        // Si rawName no está definido o no es usable, generamos el fallback basado en UID
        const baseSlug = slugify(safeDisplayName);
        const uniqueSlug = await generateUniqueSlug(baseSlug);

        const newProfile = {
          display_name: safeDisplayName,
          username: uniqueSlug,
          avatar_url: firebaseUser.photoURL || "",
          bio: "",
          role: "user",
          created_at: Date.now(),
          keywords: generateKeywords(safeDisplayName, uniqueSlug),
        };

        await setDoc(ref, newProfile);
        setProfile(newProfile);
      } else {
        setProfile(snap.data());
      }
    },
    [generateKeywords]
  );

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
  }, [createProfileIfNeeded]);

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
    const result = await signInWithPopup(auth, googleProvider);
    await createProfileIfNeeded(result.user);
    return result.user;
  };

  const logout = async () => {
    await signOut(auth);
  };

  const refreshProfile = async () => {
    if (user) await loadProfile(user.uid);
  };

  const isAdmin = profile?.role === "admin";

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
        isAdmin,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
