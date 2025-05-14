import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { db } from "../firebase";
import { collection, query, where, getDocs } from "firebase/firestore";

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
    const loadProfileAndEvents = async () => {
      try {
        const q = query(collection(db, "users"), where("username", "==", slug));
        const snap = await getDocs(q);

        if (snap.empty) {
          setNotFound(true);
          setLoading(false);
          return;
        }

        const userDoc = snap.docs[0];
        const userData = userDoc.data();
        const userId = userDoc.id;

        setProfile({ ...userData, uid: userId });

        // Cargar eventos del usuario
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
  }, [slug]);

  if (loading) return <div className="container py-5">Loading...</div>;
  if (notFound)
    return <div className="container py-5 text-danger">User not found 😢</div>;

  return (
    <div className="row">
      <aside className="col-12 col-lg-3">
        <div className="custom-box row mb-4 no-gutters">
          <div className="col-10 mb-2 mr-auto ml-auto text-center">
            <img
              src={profile.avatar_url || "/avatar_placeholder.png"}
              alt={profile.display_name}
              width="180"
              className="rounded-circle border"
            />
          </div>
          <div className="col-12 row no-gutters">
            <h1>{profile.display_name}</h1>
            <h2 className="col-10">/{profile.username}</h2>
            <div className="col-2 text-right">
              <a
                href="#!"
                target="_blank"
                rel="noopener noreferrer"
                className="avatar-added mt-2 mr-1"
              >
                added
              </a>
            </div>
            <small className="col-12 text-secondary mb-3">
              Next event in 3 days
            </small>
          </div>
          <p className="my-3">
            {profile.bio}
            <br />
            {profile.social_links?.linkedin && (
              <a
                href={profile.social_links.linkedin}
                target="_blank"
                rel="noopener noreferrer"
              >
                {profile.social_links.linkedin}
              </a>
            )}
          </p>

          <div className="btn-group" role="group">
            <button type="button" className="btn">
              <i className="fab fa-instagram"></i>
            </button>
            <button type="button" className="btn">
              <i className="fab fa-facebook-square"></i>
            </button>
            <button type="button" className="btn">
              <i className="fab fa-youtube-square"></i>
            </button>
            <button type="button" className="btn">
              <i className="fab fa-twitch"></i>
            </button>
            <button type="button" className="btn">
              <i className="fab fa-twitter-square"></i>
            </button>
          </div>
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
