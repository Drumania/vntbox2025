import { useEffect, useState } from "react";
import { useSearchParams, Link } from "react-router-dom";
import { collection, query, where, getDocs } from "firebase/firestore";
import { db } from "../firebase";
import UserThumb from "@/components/UserThumb";
import EventThumb from "@/components/EventThumb";

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
    return (
      <p className="text-center mt-5 text-muted">No search term provided.</p>
    );
  }

  if (term.length < 3) {
    return (
      <p className="text-center mt-5 text-muted">
        Escribí al menos 3 letras para buscar.
      </p>
    );
  }

  return (
    <div className="container mt-4">
      <h2 className="fw-bold mb-4">
        Search Results for <span className="text-primary">"{term}"</span>
      </h2>

      {loading ? (
        <p className="text-center text-muted">Loading...</p>
      ) : (
        <>
          {(!type || type === "users") && (
            <section className="mb-5">
              <h5 className="mb-3">Users</h5>
              {users.length > 0 ? (
                <ul className="list-unstyled row gx-4 gy-4">
                  {users.map((user) => (
                    <li key={user.id} className="col-md-6 col-12">
                      <UserThumb user={user} />
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-muted">No users found.</p>
              )}
            </section>
          )}

          {(!type || type === "events") && (
            <section>
              <h5 className="mb-3">Events</h5>
              {events.length > 0 ? (
                <ul className="list-unstyled row gx-4 gy-4">
                  {events.map((event) => (
                    <li key={event.id} className="col-md-6 col-12">
                      <EventThumb event={event} />
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-muted">No events found.</p>
              )}
            </section>
          )}
        </>
      )}
    </div>
  );
};

export default SearchResults;
