import { Link } from "react-router-dom";
import FollowButton from "@/components/FollowButton";

const UserThumb = ({ user }) => {
  if (!user) return null;

  const slug = user.slug || user.id || "unknown";
  const avatar = user.avatar_url || "/avatar_placeholder.png";
  const displayName = user.display_name || slug;
  const uid = user.uid || user.id;

  return (
    <li className="avatar-user">
      <Link to={`/${slug}`} className="avatar-link-wrapper">
        <div
          className="event-in-cal"
          style={{ backgroundImage: `url(${avatar})` }}
          title={slug}
        />
        <div className="avatar-name" title={displayName}>
          {displayName}
        </div>
        <div className="avatar-next-event" title="Next event">
          {user.next_event_text || "no events"}
        </div>
      </Link>

      {/* Follow button */}
      <FollowButton targetUid={uid} small />
    </li>
  );
};

export default UserThumb;
