import React from "react";
import Day from "./Day";

const Month = ({ year, month, dayNow, events = [] }) => {
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const startsOn = new Date(year, month, 1).getDay();

  return (
    <>
      {[...Array(daysInMonth)].map((_, i) => {
        const currentDay = i + 1;
        const dayEvents = (events || []).filter((event) => {
          const [y, m, d] = event.date.split("-").map(Number);
          return y === year && m === month + 1 && d === currentDay;
        });

        return (
          <div
            key={i}
            className={
              currentDay === dayNow
                ? "today day"
                : currentDay === 1
                ? `first-day-${startsOn} day`
                : [6, 0].includes(new Date(year, month, currentDay).getDay())
                ? "day finde"
                : "day"
            }
          >
            <label className="day-label">{currentDay}</label>
            <Day events={dayEvents} />
          </div>
        );
      })}
    </>
  );
};

export default Month;
