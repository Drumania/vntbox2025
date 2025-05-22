import { useEffect, useState } from "react";
import {
  collection,
  getDocs,
  query,
  where,
  doc,
  getDoc,
} from "firebase/firestore";
import { db } from "@/firebase";
import { useAuth } from "@/context/AuthContext";
import Calendar from "./Calendar";

// Función para dividir en grupos de 10
const chunkArray = (arr, size) => {
  return arr.length > size
    ? [arr.slice(0, size), ...chunkArray(arr.slice(size), size)]
    : [arr];
};

export default function CalendarHome() {
  const { user } = useAuth();
  const [events, setEvents] = useState([]);

  useEffect(() => {
    const fetchFollowingEvents = async () => {
      if (!user) return;

      // 1. Obtener los UIDs de las cuentas que sigo
      const followingSnap = await getDocs(
        collection(db, "users", user.uid, "following")
      );
      const followingUids = followingSnap.docs.map((doc) => doc.id);

      if (followingUids.length === 0) {
        setEvents([]);
        return;
      }

      // 2. Obtener perfil de cada usuario seguido
      const userProfiles = {};
      await Promise.all(
        followingUids.map(async (uid) => {
          const userDoc = await getDoc(doc(db, "users", uid));
          if (userDoc.exists()) {
            const data = userDoc.data();
            userProfiles[uid] = {
              owner_name: data.display_name || "Unknown",
              owner_slug: data.slug || "",
              owner_avatar_url: data.avatar_url || "/avatar_placeholder.png",
            };
          }
        })
      );

      // 3. Obtener eventos en chunks de 10
      const uidChunks = chunkArray(followingUids, 10);
      const allEvents = [];

      for (const chunk of uidChunks) {
        const eventsQuery = query(
          collection(db, "events"),
          where("user_id", "in", chunk)
        );
        const eventsSnap = await getDocs(eventsQuery);
        eventsSnap.forEach((doc) => {
          const data = doc.data();
          const ownerData = userProfiles[data.user_id] || {};
          allEvents.push({
            id: doc.id,
            ...data,
            ...ownerData,
          });
        });
      }

      setEvents(allEvents);
    };

    fetchFollowingEvents();
  }, [user]);

  return <Calendar events={events} mode="home" />;
}
