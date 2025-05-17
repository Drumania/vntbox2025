import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { collection, query, where, getDocs } from "firebase/firestore";
import { db } from "../firebase";
import { useAuth } from "../context/AuthContext";

import mapex from "../img/avatar/mapex.jpg";

export default function Event() {
  const { slug } = useParams();
  const { user } = useAuth();
  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    const fetchEvent = async () => {
      try {
        const q = query(collection(db, "events"), where("slug", "==", slug));
        const snap = await getDocs(q);
        if (!snap.empty) {
          const docSnap = snap.docs[0];
          const data = docSnap.data();
          setEvent({ id: docSnap.id, ...data }); // ✅ guardamos también el ID
        } else {
          setNotFound(true);
        }
      } catch (err) {
        console.error("Error loading event:", err);
        setNotFound(true);
      } finally {
        setLoading(false);
      }
    };

    fetchEvent();
  }, [slug]);

  if (loading) return <div className="container py-4">Cargando evento...</div>;
  if (notFound)
    return (
      <div className="container py-4 text-danger">Evento no encontrado.</div>
    );

  const isOwner = user?.uid === event.created_by;

  return (
    <main className="col-12">
      {/* 🔝 ToolBar arriba de todo */}
      <div className="container mb-3 d-flex justify-content-between align-items-center border-bottom pb-2">
        <div>
          <h3 className="mb-0">{event.title}</h3>
          <small className="text-muted">
            Organizado por: {event.owner_name}
          </small>
        </div>
        {isOwner && (
          <Link
            to={`/edit-event/${event.slug}`} // usamos el slug, pero ya tenemos también el id
            className="btn btn-outline-primary btn-sm"
          >
            ✏️ Editar evento
          </Link>
        )}
      </div>

      {/* Contenido visual del evento */}
      <div className="custom-box custom-box-vntbox p-3 mb-5">
        <div className="row">
          <div className="col-9">
            <div className="wrap-img-event">
              <img
                src={event.image_url || "https://via.placeholder.com/800x400"}
                alt={event.title}
              />
            </div>
          </div>

          <div className="col-3 d-flex align-items-start flex-column">
            <div className="mb-auto">
              {event.date}
              <br />
              <small>{event.time}</small>
            </div>
            <div>
              <h1>{event.title}</h1>
            </div>
            <div className="mt-auto">
              <div className="row no-gutters">
                <div className="col-9 mt-3">
                  <span className="font-weight-normal">{event.location}</span>
                  <br />
                  <span className="font-weight-lighter">
                    Av. Libertador 4101
                  </span>
                </div>
                <div className="col-3 text-center">
                  <img className="img-fluid" src="/img/mapa.jpg" alt="mapa" />
                  <small>ver mapa</small>
                </div>
              </div>
            </div>
          </div>

          <div className="row col-12 no-gutters table-secondary py-3 mt-3">
            <div className="col-9 pt-1">
              Share:
              <div className="btn-group" role="group">
                <button type="button" className="btn btn-secondary">
                  <i className="fab fa-instagram"></i>
                </button>
                <button type="button" className="btn btn-secondary">
                  <i className="fab fa-facebook-square"></i>
                </button>
                <button type="button" className="btn btn-secondary">
                  <i className="fab fa-youtube-square"></i>
                </button>
                <button type="button" className="btn btn-secondary">
                  <i className="fab fa-twitch"></i>
                </button>
                <button type="button" className="btn btn-secondary">
                  <i className="fab fa-twitter-square"></i>
                </button>
              </div>
            </div>
            <div className="col-3 text-center">
              <button
                type="button"
                className="btn btn-primary btn-lg btn-block"
              >
                Buy Tickets
              </button>
            </div>
          </div>

          <div className="col-12 row py-5">
            <div className="col-3">
              <h2>Organiza</h2>
              <ul>
                <li className="avatar-user">
                  <Link
                    to={"/Profile"}
                    className="event-in-cal"
                    style={{
                      backgroundImage: `url(${mapex})`,
                    }}
                  >
                    mapex
                  </Link>
                  <Link to={"/Profile"} className="avatar-name">
                    Mapex
                  </Link>
                  <Link to={"/Profile"} className="avatar-next-event">
                    next event in 1 day
                  </Link>
                  <Link to={"/Profile"} className="avatar-add">
                    add
                  </Link>
                </li>
              </ul>
            </div>
            <div className="col-9 border-left">
              <p>{event.description}</p>
              {/* Podés seguir con galería, comentarios, etc. */}
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
