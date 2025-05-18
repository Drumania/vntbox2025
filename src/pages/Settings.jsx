import { useState, useRef } from "react";
import { useAuth } from "@/context/AuthContext";
import slugify from "slugify";
import { db, storage } from "@/firebase";
import { doc, updateDoc } from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";

export default function Settings() {
  const { user, profile } = useAuth();
  const [displayName, setDisplayName] = useState(profile?.display_name || "");
  const [slug, setSlug] = useState(profile?.slug || "");
  const [bio, setBio] = useState(profile?.bio || "");
  const [social, setSocial] = useState(profile?.social_links || {});
  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef();

  const save = async () => {
    try {
      const cleanSlug = slugify(slug, { lower: true });
      const payload = {
        display_name: displayName,
        slug: cleanSlug,
        bio,
        social_links: social,
      };

      await updateDoc(doc(db, "users", user.uid), payload);
      setSuccess("Profile updated!");
    } catch (err) {
      setError(err.message);
    }
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setUploading(true);
    setError("");
    try {
      const storageRef = ref(storage, `avatars/${user.uid}`);
      await uploadBytes(storageRef, file);
      const url = await getDownloadURL(storageRef);
      await updateDoc(doc(db, "users", user.uid), {
        avatar_url: url,
      });
      setSuccess("Avatar updated!");
    } catch (err) {
      setError("Error uploading image.");
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="container py-4" style={{ maxWidth: 600 }}>
      <h3>Edit Your Profile</h3>

      {/* Avatar */}
      <div className="text-center mb-3">
        <img
          src={profile.avatar_url || "/avatar_placeholder.png"}
          alt="avatar"
          className="rounded-circle border"
          width="120"
          height="120"
        />
        <div>
          <button
            className="btn btn-sm btn-outline-secondary mt-2"
            onClick={() => fileInputRef.current.click()}
            disabled={uploading}
          >
            {uploading ? "Uploading..." : "Change Photo"}
          </button>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            className="d-none"
            onChange={handleImageUpload}
          />
        </div>
      </div>

      <div className="mb-3">
        <label className="form-label">Name</label>
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
          value={slug}
          onChange={(e) => setSlug(e.target.value)}
        />
        <div className="form-text">
          Public profile URL: <code>/ {slugify(slug, { lower: true })}</code>
        </div>
      </div>

      <div className="mb-3">
        <label className="form-label">Bio</label>
        <textarea
          className="form-control"
          rows="3"
          value={bio}
          onChange={(e) => setBio(e.target.value)}
        ></textarea>
      </div>

      {/* Social links */}
      <div className="mb-3">
        <label className="form-label">Social Links</label>

        <input
          type="text"
          placeholder="Instagram"
          className="form-control mb-2"
          value={social.instagram || ""}
          onChange={(e) =>
            setSocial((s) => ({ ...s, instagram: e.target.value }))
          }
        />
        <input
          type="text"
          placeholder="Twitter / X"
          className="form-control mb-2"
          value={social.twitter || ""}
          onChange={(e) =>
            setSocial((s) => ({ ...s, twitter: e.target.value }))
          }
        />
        <input
          type="text"
          placeholder="YouTube"
          className="form-control mb-2"
          value={social.youtube || ""}
          onChange={(e) =>
            setSocial((s) => ({ ...s, youtube: e.target.value }))
          }
        />
        <input
          type="text"
          placeholder="LinkedIn"
          className="form-control mb-2"
          value={social.linkedin || ""}
          onChange={(e) =>
            setSocial((s) => ({ ...s, linkedin: e.target.value }))
          }
        />
      </div>

      <button className="btn btn-primary w-100" onClick={save}>
        Save Profile
      </button>

      {success && <div className="alert alert-success mt-3">{success}</div>}
      {error && <div className="alert alert-danger mt-3">{error}</div>}
    </div>
  );
}
