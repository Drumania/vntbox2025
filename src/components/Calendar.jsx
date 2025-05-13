import React, { useState } from "react";
import Month from "./Month";

const Calendar = () => {
  const d = new Date();

  const [year, setYear] = useState(d.getFullYear());
  const [month, setMonth] = useState(d.getMonth());
  // const [day, setDay] = useState(d.getDate());
  const day = d.getDate();
  const locale = "es";

  const intlForMonths = new Intl.DateTimeFormat(locale, { month: "long" });
  //  const intlForWeeks = new Intl.DateTimeFormat(locale, { weekday: "long" });
  const monthName = intlForMonths.format(new Date(year, month));

  const prevMonth = () => {
    if (month - 1 === "-1") {
      setMonth(11);
      setYear(year - 1);
    } else {
      setMonth(month - 1);
    }
    console.log(month);
  };

  const nextMonth = () => {
    if (month + 1 === "12") {
      setMonth(0);
      setYear(year + 1);
    } else {
      setMonth(month + 1);
    }
    console.log(month);
  };

  return (
    <div className="custom-box custom-box-height-full p-3">
      <div className="row">
        <div className="col-12 wraper-calendar">
          <div className="calendar-tools">
            <div>
              <a href="#!" onClick={() => prevMonth()}>
                <i className="fas fa-chevron-left"></i>
              </a>
              <a href="#!" onClick={() => nextMonth()}>
                <i className="fas fa-chevron-right"></i>
              </a>
              <h2>
                {monthName} {year}
              </h2>
            </div>
            <div>
              <a href="#!" className="opacity-10">
                <i className="fas fa-th"></i>
              </a>
              <a href="#!" className="opacity-5">
                <i className="fas fa-bars"></i>
              </a>
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

            <Month year={year} month={month} dayNow={day} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Calendar;
