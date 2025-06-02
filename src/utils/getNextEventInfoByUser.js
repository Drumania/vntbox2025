import { collection, query, where, orderBy, getDocs } from "firebase/firestore";
import { db } from "@/firebase";

function calculateDaysRemaining(date) {
  const today = new Date();
  const target = new Date(date);
  const diffMs = target - today;
  const diffDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24));

  console.log("📅 target date:", target.toISOString());
  console.log("🕒 diff in days:", diffDays);

  if (diffDays < 0) return "event passed";
  if (diffDays === 0) return "today";
  if (diffDays === 1) return "in 1 day";
  return `in ${diffDays} days`;
}

export async function getNextEventInfoByUser(userUid) {
  if (!userUid) return "no events";

  console.log("🔍 Buscando eventos de UID:", userUid);

  const q = query(
    collection(db, "events"),
    where("user_id", "==", userUid),
    where("date", ">=", new Date().toISOString()),
    orderBy("date", "asc")
  );

  const snap = await getDocs(q);

  if (snap.empty) {
    console.log("🚫 No hay eventos futuros para:", userUid);
    return "no events";
  }

  const nextEvent = snap.docs[0].data();
  console.log("✅ Próximo evento:", nextEvent.title, nextEvent.date);

  return calculateDaysRemaining(nextEvent.date);
}
