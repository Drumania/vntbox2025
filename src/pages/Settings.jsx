import { useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { db, storage } from "@/firebase";
import {
  doc,
  getDoc,
  updateDoc,
  setDoc,
  serverTimestamp,
} from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";

const socialPlatforms = [
  { name: "youtube", icon: "youtube" },
  { name: "instagram", icon: "instagram" },
  { name: "x", icon: "twitter" },
  { name: "twitch", icon: "twitch" },
  { name: "kick", icon: "person-video2" },
  { name: "linkedin", icon: "linkedin" },
];

export default function Settings() {
  const { user, profile, refreshProfile } = useAuth();
  const [displayName, setDisplayName] = useState("");
  const [username, setUsername] = useState("");
  const [bio, setBio] = useState("");
  const [avatarFile, setAvatarFile] = useState(null);
  const [socialLinks, setSocialLinks] = useState({});
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!user) return;

    const load = async () => {
      const ref = doc(db, "users", user.uid);
      const snap = await getDoc(ref);

      if (snap.exists()) {
        const data = snap.data();
        setDisplayName(data.display_name || "");
        setUsername(data.username || "");
        setBio(data.bio || "");
        setSocialLinks(data.social_links || {});
      }
    };

    load();
  }, [user]);

  const handleSave = async () => {
    if (!user) return;
    setSaving(true);

    const userRef = doc(db, "users", user.uid);

    let avatar_url = profile?.avatar_url || "";

    if (avatarFile) {
      const storageRef = ref(storage, `avatars/${user.uid}`);
      await uploadBytes(storageRef, avatarFile);
      avatar_url = await getDownloadURL(storageRef);
    }

    await setDoc(
      userRef,
      {
        display_name: displayName,
        username,
        bio,
        avatar_url,
        social_links: socialLinks,
        updated_at: serverTimestamp(),
      },
      { merge: true }
    );

    await refreshProfile();
    setSaving(false);
    alert("Profile updated!");
  };

  return (
    <div className="container py-4" style={{ maxWidth: "600px" }}>
      <h2 className="mb-4">Account Settings</h2>

      <div className="mb-3">
        <label className="form-label d-flex justify-content-between">
          Email
          {profile?.role === "admin" && (
            <span className="text-muted"> Rol: {profile?.role}</span>
          )}
        </label>
        <input
          className="form-control"
          value={user?.email || ""}
          disabled
          readOnly
        />
      </div>

      <div className="mb-4">
        <label className="form-label">Profile Picture</label>
        {profile?.avatar_url && (
          <div className="mb-3">
            <img
              src={profile.avatar_url}
              alt="avatar"
              width="80"
              height="80"
              className="rounded-circle border"
            />
          </div>
        )}
        <input
          className="form-control"
          type="file"
          accept="image/*"
          onChange={(e) => setAvatarFile(e.target.files[0])}
        />
      </div>

      <div className="mb-3">
        <label className="form-label">Display Name</label>

        <input
          className="form-control"
          value={displayName}
          onChange={(e) => setDisplayName(e.target.value)}
        />
      </div>

      <div className="mb-3">
        <label className="form-label">Username (slug)</label>
        <input
          className="form-control"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
        />
      </div>

      <div className="mb-3">
        <label className="form-label">Bio</label>
        <textarea
          className="form-control"
          rows={3}
          value={bio}
          onChange={(e) => setBio(e.target.value)}
        />
      </div>

      <div className="mb-4">
        <label className="form-label">Social Links</label>
        {socialPlatforms.map(({ name, icon }) => (
          <div className="input-group mb-2" key={name}>
            <span
              className="input-group-text text-capitalize"
              style={{ width: "150px" }}
            >
              <i className={`bi bi-${icon} me-2`}></i>
              {name}
            </span>
            <input
              className="form-control"
              placeholder={`https://${name}.com/your-profile`}
              value={socialLinks[name] || ""}
              onChange={(e) =>
                setSocialLinks((prev) => ({
                  ...prev,
                  [name]: e.target.value,
                }))
              }
            />
          </div>
        ))}
      </div>

      <button
        className="btn btn-primary"
        onClick={handleSave}
        disabled={saving}
      >
        {saving ? "Saving..." : "Save Changes"}
      </button>
    </div>
  );
}
