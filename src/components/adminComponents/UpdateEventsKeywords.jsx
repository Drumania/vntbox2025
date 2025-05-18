import { useState } from "react";
import { collection, getDocs, updateDoc, doc } from "firebase/firestore";
import { db } from "@/firebase";
import useGenerateKeywords from "@/hooks/useGenerateKeywords";

const UpdateEventsKeywords = () => {
  const [updating, setUpdating] = useState(false);
  const [completed, setCompleted] = useState(false);
  const generateKeywords = useGenerateKeywords();

  const updateAllEvents = async () => {
    setUpdating(true);
    const snap = await getDocs(collection(db, "events"));

    for (const eventDoc of snap.docs) {
      const data = eventDoc.data();
      const { title, slug } = data;

      if (
        typeof title !== "string" ||
        typeof slug !== "string" ||
        title.trim().length < 3 ||
        slug.trim().length < 3
      ) {
        console.warn(`⛔ Evento inválido: ${eventDoc.id}`);
        continue;
      }

      const keywords = generateKeywords(title, slug).filter(
        (k) => k.length > 2
      );

      await updateDoc(doc(db, "events", eventDoc.id), {
        keywords,
      });

      console.log(`🎫 Evento actualizado: ${slug}`);
    }

    setUpdating(false);
    setCompleted(true);
  };

  return (
    <div className="p-3 border rounded bg-light">
      <h5>Actualizar eventos con keywords</h5>
      <button
        className="btn btn-primary my-3"
        onClick={updateAllEvents}
        disabled={updating}
      >
        {updating ? "Actualizando eventos..." : "Actualizar todos los eventos"}
      </button>
      {completed && (
        <p className="mt-2 text-success">Eventos actualizados ✔️</p>
      )}
    </div>
  );
};

export default UpdateEventsKeywords;
