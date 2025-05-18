import { useState, useEffect, useRef } from "react";
import { collection, query, where, getDocs, limit } from "firebase/firestore";
import { Link, useNavigate } from "react-router-dom";
import { db } from "../firebase";

const Search = () => {
  const [term, setTerm] = useState("");
  const [users, setUsers] = useState([]);
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const searchRef = useRef();
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

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (searchRef.current && !searchRef.current.contains(e.target)) {
        setShowResults(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (term.trim()) {
      navigate(`/search?q=${encodeURIComponent(term.trim())}`);
      setShowResults(false);
    }
  };

  return (
    <div className="wrap-search" ref={searchRef}>
      <form onSubmit={handleSearchSubmit} className="d-flex align-items-center">
        <i className="bi bi-search position-absolute ms-3 text-muted" />
        <input
          type="search"
          onFocus={() => {
            if (users.length > 0 || events.length > 0) setShowResults(true);
          }}
          className=" ps-5 py-2 rounded-pill shadow-sm search-input"
          id="search"
          placeholder="Search users or events..."
          value={term}
          onChange={(e) => setTerm(e.target.value)}
        />
      </form>

      {term.length > 0 && term.length < 3 && (
        <div className="search-loading bg-white px-3 py-2 shadow-sm text-muted rounded mt-2">
          Escribí al menos 3 letras para buscar...
        </div>
      )}

      {loading && (
        <div className="search-loading bg-white px-3 py-2 shadow-sm text-muted rounded mt-2">
          Buscando...
        </div>
      )}

      {showResults && !loading && (
        <div className="search-dropdown shadow bg-white p-3 mt-2 rounded">
          <div className="dropdown-group mb-4">
            <strong className="d-block mb-2 text-uppercase text-muted small">
              Users
            </strong>
            {users.length > 0 ? (
              users.map((user) => (
                <Link
                  key={user.id}
                  to={`/${user.slug}`}
                  className="d-flex align-items-center gap-3 mb-2 text-decoration-none text-dark hover-bg rounded px-2 py-1"
                >
                  <img
                    src={user.avatar_url || "/avatar_placeholder.png"}
                    alt={user.display_name}
                    className="rounded-circle"
                    width="36"
                    height="36"
                    style={{ objectFit: "cover" }}
                  />
                  <div>
                    <div className="fw-medium">
                      {user.display_name || user.username}
                    </div>
                    <div className="text-muted small">View profile</div>
                  </div>
                </Link>
              ))
            ) : (
              <div className="text-muted small">No users found</div>
            )}
            <Link
              to={`/search?q=${term}&type=users`}
              className="d-block mt-2 small text-primary fw-semibold"
            >
              See all users →
            </Link>
          </div>

          <div className="dropdown-group">
            <strong className="d-block mb-2 text-uppercase text-muted small">
              Events
            </strong>
            {events.length > 0 ? (
              events.map((event) => (
                <Link
                  key={event.id}
                  to={`/e/${event.slug}`}
                  className="d-flex align-items-center gap-3 mb-2 text-decoration-none text-dark hover-bg rounded px-2 py-1"
                >
                  <img
                    src={event.cover_url || "/event_placeholder.png"}
                    alt={event.title}
                    className="rounded"
                    width="48"
                    height="32"
                    style={{ objectFit: "cover" }}
                  />
                  <div>
                    <div className="fw-medium">{event.title}</div>
                    <div className="text-muted small">{event.date}</div>
                  </div>
                </Link>
              ))
            ) : (
              <div className="text-muted small">No events found</div>
            )}
            <Link
              to={`/search?q=${term}&type=events`}
              className="d-block mt-2 small text-primary fw-semibold"
            >
              See all events →
            </Link>
          </div>
        </div>
      )}
    </div>
  );
};

export default Search;
