import { useAuth } from "@/context/AuthContext";
import useFollow from "@/hooks/useFollow";

export default function FollowButton({ targetUid, small }) {
  const { user } = useAuth();
  const { isFollowing, toggleFollow, loading } = useFollow(targetUid);

  // No mostrar si es uno mismo o no hay sesión
  if (!user || !targetUid || user.uid === targetUid) return null;

  const label = loading ? "…" : isFollowing ? "Added" : "Add";

  // Base class según si está siguiendo o no
  const base = isFollowing ? "avatar-added" : "avatar-add";

  // Modificadores de estado

  const size = small ? `${base}--sm` : "";

  const className = `${base}  ${size}`.trim();

  return (
    <a
      href="#!"
      role="button"
      aria-pressed={isFollowing}
      className={className}
      onClick={(e) => {
        e.preventDefault();
        if (!loading) toggleFollow();
      }}
    >
      {label}
    </a>
  );
}
