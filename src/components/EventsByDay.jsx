import React from "react";

const EventsByDay = ({ nameAccount, imgAccount, eventLink }) => {

  return (
    <a
      href={eventLink}
      className="event-in-cal"
      style={{
        backgroundImage: `url(../img/avatar/${imgAccount})`
      }}
      title={nameAccount}
    >
      {nameAccount}

           {/*     
      <div className="day">
        <label className="day-label">1</label>
        <ul>
          <li>
            <EventsByDay
              nameAccount={"Coderhouse"}
              imgAccount={"coderhouse.jpg"}
            />
          </li>
          <li>
            <EventsByDay nameAccount={"mapex"} imgAccount={"mapex.jpg"} />
          </li>
          <li>
            <EventsByDay nameAccount={"mashinky"} imgAccount={"mashinky.png"} />
          </li>
          <li>
            <EventsByDay
              nameAccount={"Overwatch"}
              imgAccount={"overwatch.png"}
            />
          </li>
          <li>
            <EventsByDay nameAccount={"Platzi"} imgAccount={"platzi.png"} />
          </li>
          <li>
            <a href="Event" className="event-in-cal-more">
              2+
            </a>
          </li>
        </ul>
      </div>
      <div className="day">
        <label className="day-label">2</label>
        <ul>
          <li>
            <EventsByDay nameAccount={"Uber"} imgAccount={"uber.png"} />
          </li>
          <li>
            <EventsByDay nameAccount={"Ufc"} imgAccount={"ufc.jpg"} />
          </li>
        </ul>
      </div>
      <div className="day">
        <label className="day-label">3</label>
      </div>
      <div className="day">
        <label className="day-label">4</label>
        <ul>
          <li>
            <EventsByDay nameAccount={"coderhouse"} />
          </li>
        </ul>
      </div>
      <div className="day">
        <label className="day-label">5</label>
      </div>
      <div className="day">
        <label className="day-label">6</label>
      </div>
      <div className="day">
        <label className="day-label">7</label>
      </div>

      <div className="day">
        <label className="day-label">8</label>
        <ul>
          <li>
            <EventsByDay nameAccount={"mapex"} imgAccount={"mapex.jpg"} />
          </li>
        </ul>
      </div>
      <div className="day">
        <label className="day-label">9</label>
      </div>
      <div className="day">
        <label className="day-label">10</label>
      </div>
      <div className="day">
        <label className="day-label">11</label>
      </div>
      <div className="day">
        <label className="day-label">12</label>
        <ul>
          <li>
            <EventsByDay nameAccount={"mapex"} imgAccount={"mapex.jpg"} />
          </li>
          <li>
            <EventsByDay nameAccount={"mashinky"} imgAccount={"mashinky.png"} />
          </li>
        </ul>
      </div>
      <div className="day">
        <label className="day-label">13</label>
      </div>
      <div className="day">
        <label className="day-label">14</label>
      </div>

      <div className="day">
        <label className="day-label">15</label>
        <ul>
          <li>
            <EventsByDay nameAccount={"netflix"} imgAccount={"netflix.png"} />
          </li>
          <li>
            <EventsByDay nameAccount={"Boca"} imgAccount={"boca.png"} />
          </li>
        </ul>
      </div>
      <div className="day">
        <label className="day-label">16</label>
      </div>
      <div className="day">
        <label className="day-label">17</label>
        <ul>
          <li>
            <EventsByDay nameAccount={"Uber"} imgAccount={"uber.png"} />
          </li>
          <li>
            <EventsByDay nameAccount={"Ufc"} imgAccount={"ufc.jpg"} />
          </li>
          <li>
            <EventsByDay nameAccount={"mashinky"} imgAccount={"mashinky.png"} />
          </li>
          <li>
            <EventsByDay
              nameAccount={"Overwatch"}
              imgAccount={"overwatch.png"}
            />
          </li>
        </ul>
      </div>
      <div className="day">
        <label className="day-label">18</label>
      </div>
      <div className="day">
        <label className="day-label">19</label>
        <ul>
          <li>
            <EventsByDay nameAccount={"netflix"} imgAccount={"netflix.png"} />
          </li>
        </ul>
      </div>
      <div className="day">
        <label className="day-label">20</label>
      </div>
      <div className="day">
        <label className="day-label">21</label>
        <ul>
          <li>
            <EventsByDay nameAccount={"Ufc"} imgAccount={"ufc.jpg"} />
          </li>
        </ul>
      </div>

      <div className="day">
        <label className="day-label">22</label>
      </div>
      <div className="day">
        <label className="day-label">23</label>
      </div>
      <div className="day">
        <label className="day-label">24</label>
        <EventsByDay nameAccount={"Coderhouse"} imgAccount={"coderhouse.jpg"} />
      </div>
      <div className="day">
        <label className="day-label">25</label>
      </div>
      <div className="day">
        <label className="day-label">26</label>
      </div>
      <div className="day">
        <label className="day-label">27</label>
        <ul>
          <li>
            <EventsByDay
              nameAccount={"Overwatch"}
              imgAccount={"overwatch.png"}
            />
          </li>
          <li>
            <EventsByDay nameAccount={"Uber"} imgAccount={"uber.png"} />
          </li>
          <li>
            <EventsByDay nameAccount={"Ufc"} imgAccount={"ufc.jpg"} />
          </li>
          <li>
            <EventsByDay nameAccount={"mashinky"} imgAccount={"mashinky.png"} />
          </li>
          <li>
            <EventsByDay
              nameAccount={"Overwatch"}
              imgAccount={"overwatch.png"}
            />
          </li>
        </ul>
      </div>
      <div className="day">
        <label className="day-label">28</label>
      </div>

      <div className="day">
        <label className="day-label">29</label>
      </div>
      <div className="day">
        <label className="day-label">30</label>
      </div>
      <div className="day">
        <label className="day-label">31</label>
      </div>
      <div className="day">
        <label className="day-label opacity-3">1</label>
      </div>
      <div className="day">
        <label className="day-label opacity-3">2</label>
      </div>
      <div className="day">
        <label className="day-label opacity-3">3</label>
      </div>
      <div className="day">
        <label className="day-label opacity-3">4</label>
      </div> */}
    </a>
    
  );
};

export default EventsByDay;



