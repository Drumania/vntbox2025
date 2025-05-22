import { useState, useEffect } from "react";
import { Link } from "react-router-dom";

const Calendar = ({ events = [], mode = "profile" }) => {
  const today = new Date();
  const [year, setYear] = useState(today.getFullYear());
  const [month, setMonth] = useState(today.getMonth());
  const dayNow = today.getDate();
  const [loadedImages, setLoadedImages] = useState({});

  const locale = "es";
  const monthName = new Intl.DateTimeFormat(locale, { month: "long" }).format(
    new Date(year, month)
  );
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const startsOn = new Date(year, month, 1).getDay();

  const prevMonth = () => {
    setMonth((prev) => (prev - 1 + 12) % 12);
    if (month === 0) setYear((prev) => prev - 1);
  };

  const nextMonth = () => {
    setMonth((prev) => (prev + 1) % 12);
    if (month === 11) setYear((prev) => prev + 1);
  };

  const getEventsForDay = (day) => {
    return events.filter((event) => {
      const [y, m, d] = event.date.split("-").map(Number);
      return y === year && m === month + 1 && d === day;
    });
  };

  useEffect(() => {
    events.forEach((event) => {
      if (!loadedImages[event.slug]) {
        const img = new Image();
        const src =
          mode === "home"
            ? event.owner_avatar_url || "/avatar_placeholder.png"
            : event.image_url;
        img.src = src;
        img.onload = () => {
          setLoadedImages((prev) => ({ ...prev, [event.slug]: true }));
        };
      }
    });
  }, [events, mode]);

  useEffect(() => {
    const handleClick = (e) => {
      const allEventElements = document.querySelectorAll(".event-in-cal");
      allEventElements.forEach((el) => {
        const tooltip = el.querySelector(".event-tooltip");
        if (!tooltip) return;

        if (el.contains(e.target)) {
          allEventElements.forEach((otherEl) =>
            otherEl.classList.remove("show-tooltip")
          );
          el.classList.add("show-tooltip");
        } else {
          el.classList.remove("show-tooltip");
        }
      });
    };

    document.addEventListener("click", handleClick);
    return () => {
      document.removeEventListener("click", handleClick);
    };
  }, []);

  return (
    <div className="custom-box custom-box-height-full p-3">
      <div className="row">
        <div className="col-12 wraper-calendar">
          <div className="calendar-tools d-flex justify-content-between align-items-center mb-3">
            <div className="d-flex align-items-center gap-2">
              <button onClick={prevMonth}>
                <i className="bi bi-chevron-left"></i>
              </button>
              <button onClick={nextMonth}>
                <i className="bi bi-chevron-right"></i>
              </button>
              <h2 className="mb-0 ms-3">
                {monthName} {year}
              </h2>
            </div>
          </div>

          <div className="calendar">
            <div className="day-name">Lunes</div>
            <div className="day-name">Martes</div>
            <div className="day-name">Miércoles</div>
            <div className="day-name">Jueves</div>
            <div className="day-name">Viernes</div>
            <div className="day-name">Sábado</div>
            <div className="day-name">Domingo</div>

            {[...Array(daysInMonth)].map((_, i) => {
              const day = i + 1;
              const weekday = new Date(year, month, day).getDay();
              const eventList = getEventsForDay(day);

              let className = "day";
              if (day === dayNow) className += " today";
              if (day === 1) className += ` first-day-${startsOn}`;
              if (weekday === 0 || weekday === 6) className += " finde";

              return (
                <div key={day} className={className}>
                  <label className="day-label">{day}</label>
                  <ul>
                    {eventList.map((event, idx) => (
                      <li key={idx}>
                        <div
                          className={`event-in-cal ${
                            loadedImages[event.slug] ? "loaded" : ""
                          }`}
                          style={{
                            backgroundImage: loadedImages[event.slug]
                              ? mode === "home"
                                ? `url(${
                                    event.owner_avatar_url ||
                                    "/avatar_placeholder.png"
                                  })`
                                : `url(${event.image_url})`
                              : "none",
                          }}
                        >
                          <div className="event-tooltip">
                            {mode === "home" ? (
                              <div className="d-flex flex-column align-items-center text-center">
                                {/* Avatar del usuario */}
                                <div className="et-header">
                                  <img
                                    src={
                                      event.owner_avatar_url ||
                                      "/avatar_placeholder.png"
                                    }
                                    alt={event.owner_name}
                                    className="rounded-circle mb-2"
                                    width={40}
                                    height={40}
                                  />
                                  <Link
                                    to={`/${event.owner_slug}`}
                                    className="et-owner"
                                  >
                                    {event.owner_name}
                                  </Link>
                                </div>
                                {/* Imagen del evento */}
                                <img
                                  src={event.image_url}
                                  alt={event.title}
                                  className="img-fluid event rounded mb-1"
                                  style={{
                                    maxHeight: "100px",
                                    objectFit: "cover",
                                  }}
                                />
                                <strong>{event.title}</strong>
                                <Link
                                  to={`/e/${event.slug}`}
                                  className="btn btn-sm btn-outline-light mt-1"
                                >
                                  View event
                                </Link>
                              </div>
                            ) : (
                              <div className="text-center">
                                {/* Solo en modo profile */}
                                <img
                                  src={event.image_url}
                                  alt={event.title}
                                  className="img-fluid rounded mb-2"
                                  style={{
                                    maxHeight: "140px",
                                    objectFit: "cover",
                                  }}
                                />
                                <div>
                                  <strong>{event.title}</strong>
                                  <br />
                                  <Link
                                    to={`/e/${event.slug}`}
                                    className="btn btn-sm btn-outline-light mt-1"
                                  >
                                    Ver evento
                                  </Link>
                                </div>
                              </div>
                            )}
                          </div>
                        </div>
                      </li>
                    ))}
                  </ul>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Calendar;
