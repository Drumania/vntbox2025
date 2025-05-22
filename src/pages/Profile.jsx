import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { db } from "../firebase";
import {
  doc,
  getDocs,
  collection,
  query,
  where,
  onSnapshot,
} from "firebase/firestore";

import FollowButton from "@/components/FollowButton";
import WhoAdd from "@/components/WhoAdd";
import Footer from "@/components/Footer";
import Calendar from "@/components/Calendar";

export default function Profile() {
  const { slug } = useParams();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [userEvents, setUserEvents] = useState([]);

  useEffect(() => {
    let unsubscribeUser = null;

    const loadProfileAndEvents = async () => {
      try {
        const q = query(collection(db, "users"), where("slug", "==", slug));
        const snap = await getDocs(q);

        if (snap.empty) {
          setNotFound(true);
          setLoading(false);
          return;
        }

        const userDoc = snap.docs[0];
        const userId = userDoc.id;

        // Escuchar en vivo los cambios del perfil (followersCount, etc)
        unsubscribeUser = onSnapshot(doc(db, "users", userId), (docSnap) => {
          if (docSnap.exists()) {
            const liveData = docSnap.data();
            console.log({ ...liveData, uid: userId });
            setProfile({ ...liveData, uid: userId });
          }
        });

        // Cargar eventos del usuario (una sola vez)
        const eventsQuery = query(
          collection(db, "events"),
          where("user_id", "==", userId)
        );
        const eventSnap = await getDocs(eventsQuery);
        const events = eventSnap.docs.map((doc) => doc.data());
        setUserEvents(events);
      } catch (error) {
        console.error("Error loading profile or events:", error);
        setNotFound(true);
      } finally {
        setLoading(false);
      }
    };

    loadProfileAndEvents();

    return () => {
      if (unsubscribeUser) unsubscribeUser();
    };
  }, [slug]);

  if (loading) return <div className="container py-5">Loading...</div>;
  if (notFound)
    return <div className="container py-5 text-danger">User not found 😢</div>;

  return (
    <div className="row">
      <aside className="col-12 col-lg-3">
        <div className="custom-box row mb-4 no-gutters">
          <div className="avatar-container">
            <div className="avatar-wrapper">
              <img
                src={profile.avatar_url || "/avatar_placeholder.png"}
                alt={profile.display_name}
                className="avatar-image"
              />
              <Link to="/settings" className="avatar-overlay">
                <i className="bi bi-gear-fill"></i>
              </Link>
            </div>
          </div>

          <div className="col-12 row no-gutters">
            <h1>{profile.display_name}</h1>
            <h2 className="col-10">/{profile.slug}</h2>
            <div className="col-2 text-right">
              <FollowButton targetUid={profile.uid} />
            </div>

            <div className="col-12 d-flex gap-4 mt-2">
              <div className="text-center">
                <strong className="d-block text-dark">
                  {profile.followersCount ?? 0}
                </strong>
                <small className="text-muted">Followers</small>
              </div>

              <div className="text-center">
                <strong className="d-block text-dark">
                  {profile.followingCount ?? 0}
                </strong>
                <small className="text-muted">Following</small>
              </div>
            </div>

            <small className="col-12 text-secondary mb-3">
              Next event in 3 days
            </small>
          </div>

          {/* BIO y redes sociales */}
          {profile.bio && (
            <div className="my-3">
              <p className="mb-2">{profile.bio}</p>
            </div>
          )}

          {profile.social_links && (
            <div className="d-flex flex-wrap gap-2 mt-3">
              {profile.social_links.instagram && (
                <a
                  href={profile.social_links.instagram}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn btn-sm btn-outline-secondary"
                >
                  Instagram
                </a>
              )}
              {profile.social_links.facebook && (
                <a
                  href={profile.social_links.facebook}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn btn-sm btn-outline-secondary"
                >
                  Facebook
                </a>
              )}
              {profile.social_links.youtube && (
                <a
                  href={profile.social_links.youtube}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn btn-sm btn-outline-secondary"
                >
                  YouTube
                </a>
              )}
              {profile.social_links.twitch && (
                <a
                  href={profile.social_links.twitch}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn btn-sm btn-outline-secondary"
                >
                  Twitch
                </a>
              )}
              {profile.social_links.twitter && (
                <a
                  href={profile.social_links.twitter}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn btn-sm btn-outline-secondary"
                >
                  Twitter
                </a>
              )}
              {profile.social_links.linkedin && (
                <a
                  href={profile.social_links.linkedin}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn btn-sm btn-outline-secondary"
                >
                  LinkedIn
                </a>
              )}
            </div>
          )}
        </div>

        <WhoAdd />
        <Footer />
      </aside>

      <main className="col-12 col-lg-9">
        <Calendar events={userEvents} />
      </main>
    </div>
  );
}
