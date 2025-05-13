import React from "react";
import Day from "./Day";
import { fakeEvents } from "../API/FakeDayEvents";

const Month = ({ year, month, dayNow }) => {
  function daysInMonth(year, month) {
    return new Date(year, month + 1, 0).getDate();
  }
  // console.log(month);
  let daysInMonthNumber = daysInMonth(year, month);
  const startsOn = new Date(year, month, 1).getDay();

  return (
    <>
      {[...Array(daysInMonthNumber)].map((x, i) => (
        <div
          key={i}
          className={
            i + 1 === dayNow
              ? "today day"
              : i + 1 === 1
              ? `first-day-${startsOn} day`
              : new Date(year, month, i + 1).getDay() === 6
              ? "day finde"
              : new Date(year, month, i + 1).getDay() === 0
              ? "day finde"
              : "day "
          }
        >
          <label className="day-label">{i + 1}</label>
          <Day eventInDay={fakeEvents.find(element => element.day === i + 1)} />
        </div>
      ))}
    </>
  );
};

export default Month;
