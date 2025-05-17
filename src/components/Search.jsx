import React, { useState, useEffect } from "react";
import { collection, query, where, getDocs, limit } from "firebase/firestore";
import { Link, useNavigate } from "react-router-dom";
import { db } from "../firebase";

const Search = () => {
  const [term, setTerm] = useState("");
  const [users, setUsers] = useState([]);
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    if (term.trim().length < 3) {
      setUsers([]);
      setEvents([]);
      setShowResults(false);
      return;
    }

    const fetchResults = async () => {
      setLoading(true);

      const userRef = collection(db, "users");
      const eventRef = collection(db, "events");

      const qUsers = query(
        userRef,
        where("keywords", "array-contains", term.toLowerCase()),
        limit(3)
      );

      const qEvents = query(
        eventRef,
        where("keywords", "array-contains", term.toLowerCase()),
        limit(3)
      );

      const [userSnap, eventSnap] = await Promise.all([
        getDocs(qUsers),
        getDocs(qEvents),
      ]);

      const usersMap = new Map();
      userSnap.forEach((doc) =>
        usersMap.set(doc.id, { id: doc.id, ...doc.data() })
      );

      const eventsMap = new Map();
      eventSnap.forEach((doc) =>
        eventsMap.set(doc.id, { id: doc.id, ...doc.data() })
      );

      setUsers(Array.from(usersMap.values()));
      setEvents(Array.from(eventsMap.values()));
      setLoading(false);
      setShowResults(true);
    };

    fetchResults();
  }, [term]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (term.trim()) {
      navigate(`/search?q=${encodeURIComponent(term.trim())}`);
      setShowResults(false);
    }
  };

  return (
    <div className="wrap-search position-relative">
      <i className="fas fa-search opacity-3" />
      <form onSubmit={handleSearchSubmit}>
        <input
          type="search"
          className="input-search"
          id="search"
          placeholder="Search..."
          value={term}
          onChange={(e) => setTerm(e.target.value)}
        />
      </form>

      {term.length > 0 && term.length < 3 && (
        <div className="search-loading bg-white px-3 py-2 shadow-sm text-muted">
          Escribí al menos 3 letras para buscar...
        </div>
      )}

      {loading && (
        <div className="search-loading bg-white px-3 py-2 shadow-sm">
          Buscando...
        </div>
      )}

      {showResults && !loading && (
        <div className="search-dropdown shadow bg-white p-3 mt-1 rounded">
          <div className="dropdown-group mb-3">
            <strong className="d-block mb-1 text-muted">Users</strong>
            {users.length > 0 ? (
              users.map((user) => (
                <Link
                  key={user.id}
                  to={`/${user.username}`}
                  className="dropdown-item px-0 py-2 d-flex align-items-center gap-2"
                >
                  <img
                    src={user.avatar_url || "/avatar_placeholder.png"}
                    alt={user.display_name}
                    className="rounded-circle"
                    style={{
                      width: "32px",
                      height: "32px",
                      objectFit: "cover",
                    }}
                  />
                  <span>{user.display_name || user.username}</span>
                </Link>
              ))
            ) : (
              <div className="text-muted small">No users found</div>
            )}
            <Link
              to={`/search?q=${term}&type=users`}
              className="dropdown-item see-all mt-2 text-primary"
            >
              See all users
            </Link>
          </div>

          <div className="dropdown-group">
            <strong className="d-block mb-1 text-muted">Events</strong>
            {events.length > 0 ? (
              events.map((event) => (
                <Link
                  key={event.id}
                  to={`/e/${event.slug}`}
                  className="dropdown-item px-0 py-2 d-flex align-items-center gap-2"
                >
                  <img
                    src={event.cover_url || "/event_placeholder.png"}
                    alt={event.title}
                    className="rounded"
                    style={{
                      width: "40px",
                      height: "32px",
                      objectFit: "cover",
                    }}
                  />
                  <span>{event.title}</span>
                </Link>
              ))
            ) : (
              <div className="text-muted small">No events found</div>
            )}
            <Link
              to={`/search?q=${term}&type=events`}
              className="dropdown-item see-all mt-2 text-primary"
            >
              See all events
            </Link>
          </div>
        </div>
      )}
    </div>
  );
};

export default Search;
