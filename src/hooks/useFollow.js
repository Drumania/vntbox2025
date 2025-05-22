// src/hooks/useFollow.js
import { useEffect, useState, useCallback } from "react";
import {
  doc,
  setDoc,
  deleteDoc,
  onSnapshot,
  serverTimestamp,
} from "firebase/firestore";
import { db } from "@/firebase"; // tu instancia
import { useAuth } from "@/context/AuthContext";

export default function useFollow(targetUid) {
  const { user } = useAuth(); // usuario logueado
  const [isFollowing, setIsFollowing] = useState(null);
  const [loading, setLoading] = useState(true);

  // Escucha en tiempo real si ya sigo a targetUid
  useEffect(() => {
    if (!user) return;
    const ref = doc(db, "users", user.uid, "following", targetUid);
    const unsub = onSnapshot(ref, (snap) => {
      setIsFollowing(snap.exists());
      setLoading(false);
    });
    return unsub;
  }, [user, targetUid]);

  // Seguir / dejar de seguir
  const toggleFollow = useCallback(async () => {
    if (!user || loading) return;
    setLoading(true);
    const ref = doc(db, "users", user.uid, "following", targetUid);
    if (isFollowing) {
      await deleteDoc(ref);
    } else {
      await setDoc(ref, { targetUid, createdAt: serverTimestamp() });
    }
    // El onSnapshot actualizará el estado automáticamente
  }, [user, targetUid, isFollowing, loading]);

  return { isFollowing, toggleFollow, loading };
}
