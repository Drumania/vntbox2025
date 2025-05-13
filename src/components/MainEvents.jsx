import React from "react";
import netflixCasadepapel from "../img/events/netflix-casadepapel.png";
import ufc from "../img/events/ufc.jpg";

const MainEvents = () => {
  return (
    <div className="custom-box pt-3">
      <div className="row">
        <div className="col-12">
          <h2>Main events</h2>
          <ul className="main-events">
            <li className="event-medium">
              <a
                href="Event"
                style={{
                  backgroundImage: `url(${netflixCasadepapel})`
                }}
              >
                Estreno la casa de papel 3er temporada
              </a>
              <div className="event-details row no-gutters">
                <div className="event-fecha col-2">
                  VIE
                  <strong>19</strong>
                  Jul
                </div>
                <div className="event-title pl-2 col-10">
                  Estreno la casa de papel 3er tem...
                  <br />
                  <small>0:00</small>
                </div>
              </div>
            </li>
            <li className="event-medium">
              <a
                href="Event"
                style={{
                  backgroundImage: `url(${ufc})`
                }}
              >
                UFC Fight Night: Maia vs Usman
              </a>
              <div className="event-details row no-gutters">
                <div className="event-fecha col-2">
                  SAB
                  <strong>22</strong>
                  Jul
                </div>
                <div className="event-title pl-2 col-10 text-truncate">
                  UFC Fight Night: Maia vs Usman
                  <br />
                  <small>22:00</small>
                </div>
              </div>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default MainEvents;
