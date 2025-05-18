// src/pages/Settings.jsx
import { useState } from "react";
import { useAuth } from "@/context/AuthContext";
import slugify from "slugify";
import { doc, updateDoc } from "firebase/firestore";
import { db } from "@/firebase";

export default function Settings() {
  const { user, profile } = useAuth();
  const [slug, setSlug] = useState(profile?.slug || "");
  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");

  const save = async () => {
    try {
      const clean = slugify(slug, { lower: true });
      await updateDoc(doc(db, "users", user.uid), { slug: clean });
      setSuccess("Saved!");
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div className="container mt-4" style={{ maxWidth: 480 }}>
      <h3>Edit Profile</h3>
      <input
        type="text"
        className="form-control mb-2"
        value={slug}
        onChange={(e) => setSlug(e.target.value)}
      />
      <button className="btn btn-primary w-100" onClick={save}>
        Save Slug
      </button>
      {success && <div className="alert alert-success mt-2">{success}</div>}
      {error && <div className="alert alert-danger mt-2">{error}</div>}
    </div>
  );
}
