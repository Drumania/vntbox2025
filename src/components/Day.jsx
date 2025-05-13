import React from "react";
import EventsByDay from "./EventsByDay";

// import axios from 'axios';

const Day = ({ eventInDay }) => {
  // const [post, setPost] = useState(null);
  // const baseURL = "https://jsonplaceholder.typicode.com/posts";

  // useEffect(() => {
  //
  //   axios.get(baseURL).then((response) => {
  //     setPost(response.data);
  //   });
  //   console.log(post)
  // }, []);

  return (
    <ul>
      <li>
        {eventInDay && (
          <EventsByDay
            nameAccount={eventInDay.nameAccount}
            imgAccount={eventInDay.imgAccount}
            eventLink={eventInDay.event_link}
          />
        )}
      </li>
    </ul>
  );
};

export default Day;
