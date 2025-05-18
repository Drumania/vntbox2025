import { useState } from "react";
import { collection, getDocs, updateDoc, doc } from "firebase/firestore";
import { db } from "@/firebase";
import useGenerateKeywords from "@/hooks/useGenerateKeywords";

const UpdateUsersKeywords = () => {
  const [updating, setUpdating] = useState(false);
  const [completed, setCompleted] = useState(false);
  const [errorUsers, setErrorUsers] = useState([]);
  const generateKeywords = useGenerateKeywords();

  const updateAllUsers = async () => {
    setUpdating(true);
    setErrorUsers([]);

    const snap = await getDocs(collection(db, "users"));

    for (const userDoc of snap.docs) {
      const data = userDoc.data();
      const { display_name, slug } = data;

      // Validación más estricta
      if (
        typeof display_name !== "string" ||
        typeof slug !== "string" ||
        display_name.trim().length < 3 ||
        slug.trim().length < 3
      ) {
        console.warn(`⛔ Usuario inválido: ${userDoc.id}`);
        setErrorUsers((prev) => [...prev, userDoc.id]);
        continue;
      }

      try {
        const keywords = generateKeywords(display_name, slug).filter(
          (k) => k.length > 2
        );

        await updateDoc(doc(db, "users", userDoc.id), {
          keywords,
        });

        console.log(`✅ Actualizado: ${slug}`);
      } catch (err) {
        console.error(`⚠️ Error al actualizar ${userDoc.id}:`, err);
        setErrorUsers((prev) => [...prev, userDoc.id]);
      }
    }

    setUpdating(false);
    setCompleted(true);
  };

  return (
    <div className="p-3 border rounded bg-light">
      <h5>Actualizar usuarios con keywords</h5>
      <button
        className="btn btn-primary my-3"
        onClick={updateAllUsers}
        disabled={updating}
      >
        {updating ? "Actualizando..." : "Actualizar todos los usuarios"}
      </button>

      {completed && (
        <p className="mt-2 text-success">Usuarios actualizados ✔️</p>
      )}

      {errorUsers.length > 0 && (
        <div className="mt-2 text-danger">
          <strong>Errores en los siguientes IDs:</strong>
          <ul className="small">
            {errorUsers.map((id) => (
              <li key={id}>{id}</li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

export default UpdateUsersKeywords;
