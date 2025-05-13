import React from "react";
import { Link } from "react-router-dom";

import mashinky from "../img/avatar/mashinky.png";
import overwatch from "../img/avatar/overwatch.png";
import platzi from "../img/avatar/platzi.png";
import ufc from "../img/avatar/ufc.jpg";

const WhoAdd = () => {
  return (
    <div className="custom-box mb-4">
      <div className="row">
        <div className="col-12">
          <h2>
            Who add?
            <a href="#!">
              <i className="fas fa-redo-alt float-right mt-2" />
            </a>
          </h2>
          <ul>
            <li className="avatar-user">
              <Link
                to={"/Profile"}
                className="event-in-cal"
                style={{
                  backgroundImage: `url(${ufc})`
                }}
                alt="ufc"
              >
                ufc
              </Link>
              <Link to={"/Profile"} className="avatar-name" title="ufc">
                UFC
              </Link>
              <Link to={"/Profile"} className="avatar-next-event" title="ufc">
                next event in 1 day
              </Link>
              <button className="avatar-add">add</button>
            </li>
            <li className="avatar-user">
              <Link
                to={"/Profile"}
                className="event-in-cal"
                style={{
                  backgroundImage: `url(${mashinky})`
                }}
                alt="mashinky"
              >
                mashinky
              </Link>
              <Link to={"/Profile"} className="avatar-name" alt="ufc">
                Mashinky
              </Link>
              <Link to={"/Profile"} className="avatar-next-event" alt="ufc">
                next event in 1 month
              </Link>
              <button className="avatar-add">add</button>
            </li>
            <li className="avatar-user">
              <Link
                to={"/Profile"}
                className="event-in-cal"
                style={{
                  backgroundImage: `url(${platzi})`
                }}
                alt="platzi"
              >
                platzi
              </Link>
              <Link to={"/Profile"} className="avatar-name" alt="ufc">
                Platzi
              </Link>
              <Link to={"/Profile"} className="avatar-next-event" alt="ufc">
                next event in 14 hours
              </Link>
              <button className="avatar-add">add</button>
            </li>

            <li className="avatar-user">
              <Link
                to={"/Profile"}
                className="event-in-cal"
                style={{
                  backgroundImage: `url(${overwatch})`
                }}
                alt="overwatch"
              >
                overwatch
              </Link>
              <Link to={"/Profile"} className="avatar-name" alt="ufc">
                Overwatch
              </Link>
              <Link to={"/Profile"} className="avatar-next-event" alt="ufc">
                next event in 17 days
              </Link>
              <button className="avatar-add">add</button>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default WhoAdd;
