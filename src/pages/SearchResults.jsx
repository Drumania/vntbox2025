import { useEffect, useState } from "react";
import { useSearchParams, Link } from "react-router-dom";
import { collection, query, where, getDocs } from "firebase/firestore";
import { db } from "../firebase";

const SearchResults = () => {
  const [searchParams] = useSearchParams();
  const term = searchParams.get("q")?.toLowerCase() || "";
  const type = searchParams.get("type"); // puede ser "users" o "events"

  const [users, setUsers] = useState([]);
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!term || term.length < 3) {
      setUsers([]);
      setEvents([]);
      setLoading(false);
      return;
    }

    const fetchResults = async () => {
      setLoading(true);

      const userRef = collection(db, "users");
      const eventRef = collection(db, "events");

      const userPromise =
        !type || type === "users"
          ? getDocs(query(userRef, where("keywords", "array-contains", term)))
          : Promise.resolve({ docs: [] });

      const eventPromise =
        !type || type === "events"
          ? getDocs(query(eventRef, where("keywords", "array-contains", term)))
          : Promise.resolve({ docs: [] });

      const [userSnap, eventSnap] = await Promise.all([
        userPromise,
        eventPromise,
      ]);

      setUsers(userSnap.docs.map((doc) => ({ id: doc.id, ...doc.data() })));
      setEvents(eventSnap.docs.map((doc) => ({ id: doc.id, ...doc.data() })));
      setLoading(false);
    };

    fetchResults();
  }, [term, type]);

  if (!term) {
    return <p className="text-center mt-5">No search term provided.</p>;
  }

  if (term.length < 3) {
    return (
      <p className="text-center mt-5">Escribí al menos 3 letras para buscar.</p>
    );
  }

  return (
    <div className="container mt-4">
      <h2 className="mb-4">
        Results for "<span className="text-primary">{term}</span>"
      </h2>

      {loading ? (
        <p>Loading...</p>
      ) : (
        <>
          {(!type || type === "users") && (
            <div className="mb-5">
              <h4>Users</h4>
              {users.length > 0 ? (
                <ul className="list-unstyled">
                  {users.map((user) => (
                    <li key={user.id}>
                      <Link to={`/${user.username}`}>
                        {user.display_name || user.username}
                      </Link>
                    </li>
                  ))}
                </ul>
              ) : (
                <p>No users found.</p>
              )}
            </div>
          )}

          {(!type || type === "events") && (
            <div>
              <h4>Events</h4>
              {events.length > 0 ? (
                <ul className="list-unstyled">
                  {events.map((event) => (
                    <li key={event.id}>
                      <Link to={`/e/${event.slug}`}>{event.title}</Link>
                    </li>
                  ))}
                </ul>
              ) : (
                <p>No events found.</p>
              )}
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default SearchResults;
