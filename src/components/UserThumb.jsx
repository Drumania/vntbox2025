import { Link } from "react-router-dom";

const UserThumb = ({ user }) => {
  return (
    <li className="avatar-user">
      <Link
        to={`/${user.slug}`}
        className="event-in-cal"
        style={{
          backgroundImage: `url(${
            user.avatar_url || "/avatar_placeholder.png"
          })`,
        }}
        alt={user.slug}
      >
        {user.slug}
      </Link>
      <Link
        to={`/${user.slug}`}
        className="avatar-name"
        title={user.display_name}
      >
        {user.display_name}
      </Link>
      <Link
        to={`/${user.slug}`}
        className="avatar-next-event"
        title="Next event"
      >
        next event in 1 day {/* opcional: calcular desde Firestore */}
      </Link>
      <button className="avatar-add">add</button>
    </li>
  );
};

export default UserThumb;
