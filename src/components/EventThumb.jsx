import { Link } from "react-router-dom";

const EventThumb = ({ event }) => {
  return (
    <li className="event-medium">
      <Link
        to={`/e/${event.slug}`}
        style={{
          backgroundImage: `url(${
            event.cover_url || "/event_placeholder.png"
          })`,
        }}
      >
        {event.title}
      </Link>
      <div className="event-details row no-gutters">
        <div className="event-fecha col-2">
          {/* Podés usar date-fns o dayjs para esto */}
          {event.dayOfWeek || "VIE"}
          <strong>{event.day || "19"}</strong>
          {event.month || "Jul"}
        </div>
        <div className="event-title pl-2 col-10">
          {event.title?.slice(0, 30)}...
          <br />
          <small>{event.time || "0:00"}</small>
        </div>
      </div>
    </li>
  );
};

export default EventThumb;
