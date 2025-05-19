import { useEffect, useState } from "react";
import { useSearchParams, Link } from "react-router-dom";
import {
  collection,
  query,
  where,
  getDocs,
  Timestamp,
} from "firebase/firestore";
import { db } from "../firebase";
import UserThumb from "@/components/UserThumb";
import EventThumb from "@/components/EventThumb";

const SearchResults = () => {
  const [searchParams] = useSearchParams();
  const term = searchParams.get("q")?.toLowerCase() || "";
  const type = searchParams.get("type");

  const [users, setUsers] = useState([]);
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [categories, setCategories] = useState([]);
  const [filters, setFilters] = useState({
    category: "",
    next7Days: false,
    selectedDate: "",
  });

  useEffect(() => {
    const fetchCategories = async () => {
      const snap = await getDocs(collection(db, "categories"));
      const data = snap.docs
        .map((doc) => doc.data())
        .sort((a, b) => a.order - b.order);
      setCategories(data);
    };
    fetchCategories();
  }, []);

  const fetchResults = async () => {
    setLoading(true);

    const userRef = collection(db, "users");
    const eventRef = collection(db, "events");

    const userPromise =
      !type || type === "users"
        ? getDocs(query(userRef, where("keywords", "array-contains", term)))
        : Promise.resolve({ docs: [] });

    let eventQuery = query(eventRef, where("keywords", "array-contains", term));

    if (filters.category) {
      eventQuery = query(eventQuery, where("category", "==", filters.category));
    }

    const today = new Date();
    const todayStr = today.toISOString().split("T")[0];

    if (filters.next7Days) {
      const in7Days = new Date();
      in7Days.setDate(today.getDate() + 7);
      const in7Str = in7Days.toISOString().split("T")[0];

      eventQuery = query(
        eventQuery,
        where("date", ">=", todayStr),
        where("date", "<=", in7Str)
      );
    }

    if (filters.selectedDate) {
      eventQuery = query(eventQuery, where("date", "==", filters.selectedDate));
    }

    const eventPromise =
      !type || type === "events"
        ? getDocs(eventQuery)
        : Promise.resolve({ docs: [] });

    const [userSnap, eventSnap] = await Promise.all([
      userPromise,
      eventPromise,
    ]);

    setUsers(userSnap.docs.map((doc) => ({ id: doc.id, ...doc.data() })));
    setEvents(eventSnap.docs.map((doc) => ({ id: doc.id, ...doc.data() })));
    setLoading(false);
  };

  useEffect(() => {
    if (!term || term.length < 3) {
      setUsers([]);
      setEvents([]);
      setLoading(false);
      return;
    }
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

      <div className="container">
        <div className="row">
          <aside className="col-3 d-none d-lg-block">
            <form
              className="d-flex flex-column gap-3"
              onSubmit={(e) => {
                e.preventDefault();
                fetchResults();
              }}
            >
              <div>
                <label className="form-label">Término de búsqueda</label>
                <input
                  className="form-control"
                  value={term}
                  onChange={(e) => {
                    const newTerm = e.target.value.toLowerCase();
                    searchParams.set("q", newTerm);
                    window.history.replaceState(null, "", `?${searchParams}`);
                  }}
                />
              </div>

              <div>
                <label className="form-label">Categoría</label>
                <select
                  className="form-select"
                  value={filters.category}
                  onChange={(e) =>
                    setFilters({ ...filters, category: e.target.value })
                  }
                >
                  <option value="">Todas</option>
                  {categories.map((cat) => (
                    <option key={cat.slug} value={cat.slug}>
                      {cat.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-check">
                <input
                  className="form-check-input"
                  type="checkbox"
                  id="next7Days"
                  checked={filters.next7Days}
                  onChange={(e) =>
                    setFilters({ ...filters, next7Days: e.target.checked })
                  }
                />
                <label className="form-check-label" htmlFor="next7Days">
                  Próximos 7 días
                </label>
              </div>

              <div>
                <label className="form-label">Fecha específica</label>
                <input
                  className="form-control"
                  type="date"
                  value={filters.selectedDate}
                  onChange={(e) =>
                    setFilters({ ...filters, selectedDate: e.target.value })
                  }
                />
              </div>

              <button type="submit" className="btn btn-primary mt-3">
                Aplicar filtros
              </button>
            </form>
          </aside>

          <main className="col-12 col-lg-9">
            {/* Filtros activos */}
            <div className="mb-3">
              <strong>Filtros aplicados:</strong>
              <ul className="list-inline mt-2">
                {term && (
                  <li className="list-inline-item badge bg-secondary me-2">
                    Término: {term}
                  </li>
                )}
                {filters.category && (
                  <li className="list-inline-item badge bg-info me-2">
                    Categoría: {filters.category}
                  </li>
                )}
                {filters.next7Days && (
                  <li className="list-inline-item badge bg-success me-2">
                    Próximos 7 días
                  </li>
                )}
                {filters.selectedDate && (
                  <li className="list-inline-item badge bg-warning  me-2">
                    Fecha: {filters.selectedDate}
                  </li>
                )}
              </ul>
            </div>

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
          </main>
        </div>
      </div>
    </div>
  );
};

export default SearchResults;
