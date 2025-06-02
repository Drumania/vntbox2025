import { useEffect, useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { collection, query, where, getDocs } from "firebase/firestore";
import { db } from "../firebase";
import { useAuth } from "../context/AuthContext";

// avatar temporal
import mapex from "../img/avatar/mapex.jpg";

/* ──────── componente stub de comentarios ──────── */
function CommentBox({ eventId }) {
  return (
    <div className="comment-box bg-light rounded-3 p-3">
      <textarea
        className="form-control mb-3"
        rows={3}
        placeholder="Write a comment…"
      />
      <button className="btn btn-primary btn-sm">Post</button>

      {/* listado dummy */}
      <ul className="list-unstyled mt-4">
        {[1, 2, 3].map((c) => (
          <li key={c} className="d-flex mb-4">
            <div className="flex-shrink-0 me-3">
              <div className="avatar-placeholder rounded-circle" />
            </div>
            <div className="flex-grow-1">
              <strong>User {c}</strong>
              <p className="mb-0 small">
                Lorem ipsum dolor sit amet, consectetur adipisicing elit.
              </p>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default function Event() {
  /* ───── hooks ───── */
  const { slug } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true);

  /* ───── cargar evento ───── */
  useEffect(() => {
    (async () => {
      try {
        const q = query(collection(db, "events"), where("slug", "==", slug));
        const snap = await getDocs(q);
        if (snap.empty) return navigate("/404", { replace: true });

        const docSnap = snap.docs[0];
        setEvent({ id: docSnap.id, ...docSnap.data() });
      } catch (err) {
        console.error(err);
        navigate("/404", { replace: true });
      } finally {
        setLoading(false);
      }
    })();
  }, [slug]);

  if (loading) return <div className="container py-5">Loading…</div>;
  if (!event) return null;

  const isOwner = user?.uid === event.created_by;

  /* ───── vista ───── */
  return (
    <main className="container py-4 event-view">
      <div className="d-flex justify-content-between">
        <button onClick={() => navigate(-1)} className="btn btn-link px-0 mb-4">
          ← Back
        </button>
        {isOwner && (
          <Link
            to={`/edit-event/${event.slug}`}
            className="btn btn-sm btn-outline-secondary mb-4 align-self-start"
          >
            ✏️ Edit
          </Link>
        )}
      </div>

      {/* bloque principal */}
      <div className="row g-4 custom-box custom-box-height-full align-items-start">
        {/* cover vertical 9×16 */}
        <div className="col-md-4">
          <div className="ratio ratio-9x16 rounded-3 overflow-hidden">
            <img
              src={event.image_url || "https://placehold.co/450x800?text=Event"}
              alt={event.title}
              className="w-100 h-100 object-fit-cover"
            />
          </div>
        </div>

        {/* meta-block */}
        <div className="col-md-8 d-flex flex-column">
          <h1 className="fw-bold mb-1">{event.title}</h1>
          <p className="text-muted mb-1">
            {event.date} · {event.time}
          </p>

          <p>{event.description}</p>

          <p className="d-flex align-items-center mb-4">
            <i className="bi bi-geo-alt-fill me-2" />
            {event.location}
          </p>

          <div className="d-grid gap-2 mb-5">
            {/* organizador */}
            <section className="my-5">
              <h2 className="h5 mb-3">Organizer</h2>
              <div className="d-flex align-items-center p-3 bg-light rounded-3">
                <img
                  src={mapex}
                  alt={event.owner_name}
                  width="56"
                  height="56"
                  className="rounded-circle me-3 object-fit-cover"
                />
                <div className="flex-grow-1">
                  <strong>{event.owner_name}</strong>
                  <div className="text-muted small">Next event in 1 day</div>
                </div>
                <button className="btn btn-sm btn-outline-primary">
                  Follow
                </button>
              </div>
            </section>

            <a
              href={event.external_link || "#"}
              target="_blank"
              rel="noopener noreferrer"
              className="btn btn-gradient btn-lg"
            >
              Buy Tickets
            </a>
          </div>
        </div>
      </div>

      {/* foro / discusión */}
      <section className="my-5">
        <h2 className="h5 mb-3">Discussion</h2>
        <CommentBox eventId={event.id} />
      </section>
    </main>
  );
}
