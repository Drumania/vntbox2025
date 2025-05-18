import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import slugify from "slugify";
import { useAuth } from "@/context/AuthContext";

export default function Settings() {
  const { user, profile, addOrUpdateSlug, logout } = useAuth();
  const [displayName, setDisplayName] = useState(profile?.display_name || "");
  const [slug, setSlug] = useState(profile?.slug || "");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    if (!user) navigate("/");
  }, [user, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError(null);
    try {
      const clean = slugify(slug, { lower: true });
      await addOrUpdateSlug(clean);
      navigate("/");
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="container py-4">
      <h2 className="mb-4">Profile Settings</h2>

      <form onSubmit={handleSubmit} style={{ maxWidth: 480 }}>
        <div className="mb-3">
          <label className="form-label">Email (read-only)</label>
          <input
            className="form-control"
            value={profile?.email || ""}
            disabled
          />
        </div>

        <div className="mb-3">
          <label className="form-label">Display name</label>
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
            required
          />
          <div className="form-text">
            Public URL: <code>vntbox.com/{slugify(slug, { lower: true })}</code>
          </div>
        </div>

        {error && <div className="alert alert-danger">{error}</div>}

        <button className="btn btn-primary w-100 mb-2" disabled={saving}>
          Save changes
        </button>

        <button
          type="button"
          className="btn btn-outline-danger w-100"
          onClick={logout}
        >
          Log out
        </button>
      </form>
    </div>
  );
}
