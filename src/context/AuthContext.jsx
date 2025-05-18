import {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
} from "react";
import {
  getAuth,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  GoogleAuthProvider,
  signInWithPopup,
} from "firebase/auth";
import {
  collection,
  doc,
  getDoc,
  getDocs,
  query,
  setDoc,
  updateDoc,
  where,
  serverTimestamp,
} from "firebase/firestore";
import { db } from "@/firebase"; // inicializas Firebase aquí
import slugify from "slugify";

const AuthContext = createContext();
export const useAuth = () => useContext(AuthContext);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null); // Firebase user
  const [profile, setProfile] = useState(null); // Firestore doc
  const [loading, setLoading] = useState(true);

  /* ---------- helpers ---------- */

  const slugExists = async (slug) => {
    const q = query(collection(db, "users"), where("slug", "==", slug));
    const snap = await getDocs(q);
    return !snap.empty;
  };

  const createProfileDoc = async (fbUser, slug = "") => {
    const uid = fbUser.uid;
    await setDoc(doc(db, "users", uid), {
      uid,
      display_name: fbUser.displayName || "",
      email: fbUser.email,
      slug,
      avatar_url: fbUser.photoURL || "",
      created_at: serverTimestamp(),
      keywords: [],
    });
  };

  const refreshProfile = useCallback(async (uid) => {
    if (!uid) {
      setProfile(null);
      return;
    }
    const snap = await getDoc(doc(db, "users", uid));
    setProfile(snap.exists() ? snap.data() : null);
  }, []);

  /* ---------- auth listener ---------- */

  useEffect(() => {
    const auth = getAuth();
    const unsub = onAuthStateChanged(auth, async (fbUser) => {
      setUser(fbUser);
      if (fbUser) await refreshProfile(fbUser.uid);
      setLoading(false);
    });
    return unsub;
  }, [refreshProfile]);

  /* ---------- public actions ---------- */

  const signUp = async ({ email, password, displayName, slug }) => {
    const auth = getAuth();
    const { user: fbUser } = await createUserWithEmailAndPassword(
      auth,
      email,
      password
    );

    const cleanSlug = slugify(slug || displayName || email, { lower: true });
    if (await slugExists(cleanSlug))
      throw new Error("Slug already taken, choose another one.");

    await createProfileDoc({ ...fbUser, displayName }, cleanSlug);
    await refreshProfile(fbUser.uid);
  };

  const signIn = async ({ email, password }) => {
    const auth = getAuth();
    await signInWithEmailAndPassword(auth, email, password);
  };

  const signInWithGoogle = async () => {
    const auth = getAuth();
    const provider = new GoogleAuthProvider();
    const { user: fbUser } = await signInWithPopup(auth, provider);

    const snap = await getDoc(doc(db, "users", fbUser.uid));
    if (!snap.exists()) await createProfileDoc(fbUser, "");
    await refreshProfile(fbUser.uid);
  };

  const addOrUpdateSlug = async (slug) => {
    const clean = slugify(slug, { lower: true });
    if (await slugExists(clean))
      throw new Error("Slug already taken, choose another one.");
    await updateDoc(doc(db, "users", user.uid), { slug: clean });
    await refreshProfile(user.uid);
  };

  const logout = () => signOut(getAuth());

  /* ---------- value ---------- */

  const value = {
    user,
    profile,
    loading,
    signUp,
    signIn,
    signInWithGoogle,
    addOrUpdateSlug,
    logout,
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
}
