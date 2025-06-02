import { useEffect, useState } from "react";
import { collection, query, orderBy, limit, getDocs } from "firebase/firestore";
import { db } from "@/firebase";
import UserThumb from "./UserThumb";
import { getNextEventInfoByUser } from "@/utils/getNextEventInfoByUser";

export default function WhoAdd({ max = 3 }) {
  const [users, setUsers] = useState([]);

  useEffect(() => {
    (async () => {
      try {
        const q = query(
          collection(db, "users"),
          orderBy("created_at", "desc"),
          limit(max)
        );
        const snap = await getDocs(q);
        const list = snap.docs.map((doc) => ({ id: doc.id, ...doc.data() }));

        // 🔁 Agregamos info del próximo evento a cada user
        const enriched = await Promise.all(
          list.map(async (user) => {
            console.log("➡️ Procesando user:", user.id); // 👈 AÑADILO ACÁ
            const next_event_text = await getNextEventInfoByUser(user.id);
            return { ...user, next_event_text };
          })
        );

        setUsers(enriched);
      } catch (err) {
        console.error("Error loading users:", err);
      }
    })();
  }, [max]);

  return (
    <div className="custom-box mb-4">
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h2 className="h5 mb-0">Who add?</h2>
        <button className="btn btn-sm btn-link p-0">
          <i className="fas fa-redo-alt" />
        </button>
      </div>

      <ul className="m-0 p-0 list-unstyled">
        {users.map((user) => (
          <UserThumb key={user.id} user={user} />
        ))}
      </ul>
    </div>
  );
}
