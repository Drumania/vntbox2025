import React from "react";
import EventsByDay from "./EventsByDay";

const Day = ({ events }) => {
  return (
    <ul>
      {events.map((event, idx) => (
        <li key={idx}>
          <EventsByDay
            nameAccount={event.title}
            imgAccount={event.image_url}
            eventLink={`/e/${event.slug}`}
          />
        </li>
      ))}
    </ul>
  );
};

export default Day;
