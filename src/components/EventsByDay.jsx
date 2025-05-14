import React from "react";

const EventsByDay = ({ nameAccount, imgAccount, eventLink }) => {
  return (
    <a
      href={eventLink}
      className="event-in-cal"
      style={{
        backgroundImage: `url(${imgAccount})`,
      }}
      title={nameAccount}
    >
      {nameAccount}
    </a>
  );
};

export default EventsByDay;
