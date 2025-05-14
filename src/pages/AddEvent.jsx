import { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";
import { db, storage } from "../firebase";
import {
  collection,
  addDoc,
  query,
  where,
  getDocs,
  serverTimestamp,
} from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";

const slugify = (text) =>
  text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");

export default function AddEvent() {
  const { user } = useAuth();
  const [title, setTitle] = useState("");
  const [slug, setSlug] = useState("");
  const [slugAvailable, setSlugAvailable] = useState(true);
  const [checkingSlug, setCheckingSlug] = useState(false);
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [location, setLocation] = useState("");
  const [description, setDescription] = useState("");
  const [imageFile, setImageFile] = useState(null);
  const [saving, setSaving] = useState(false);
  const [showPopup, setShowPopup] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const checkSlug = async () => {
      if (!slug) return;
      setCheckingSlug(true);
      const q = query(collection(db, "events"), where("slug", "==", slug));
      const snap = await getDocs(q);
      setSlugAvailable(snap.empty);
      setCheckingSlug(false);
    };

    checkSlug();
  }, [slug]);

  const handleSubmit = async () => {
    if (!user || !slugAvailable) return;

    setSaving(true);
    let image_url = "";

    try {
      if (imageFile) {
        const fileRef = ref(storage, `event-covers/${slug}-${Date.now()}`);
        await uploadBytes(fileRef, imageFile);
        image_url = await getDownloadURL(fileRef);
      }

      await addDoc(collection(db, "events"), {
        title,
        slug,
        date,
        time,
        location,
        description,
        image_url,
        user_id: user.uid,
        created_at: serverTimestamp(),
      });

      setShowPopup(true);
      // limpiar el formulario
      setTitle("");
      setSlug("");
      setDate("");
      setTime("");
      setLocation("");
      setDescription("");
      setImageFile(null);
      setTimeout(() => {
        navigate(`/e/${slug}`);
      }, 5000);
    } catch (error) {
      console.error("Error creating event:", error);
      alert("There was an error creating the event.");
    }

    setSaving(false);
  };

  return (
    <div className="container py-4" style={{ maxWidth: "600px" }}>
      <h2 className="mb-4">Create New Event</h2>

      <div className="mb-3">
        <label className="form-label">Event Title</label>
        <input
          className="form-control"
          value={title}
          onChange={(e) => {
            setTitle(e.target.value);
            setSlug(slugify(e.target.value));
          }}
        />
      </div>

      <div className="mb-3">
        <label className="form-label">Slug (public URL)</label>
        <div className="input-group">
          <input
            className="form-control"
            value={slug}
            onChange={(e) => setSlug(slugify(e.target.value))}
          />
          <span className="input-group-text">
            {checkingSlug ? (
              <span className="spinner-border spinner-border-sm"></span>
            ) : slugAvailable ? (
              <i className="bi bi-check text-success"></i>
            ) : (
              <i className="bi bi-x text-danger"></i>
            )}
          </span>
        </div>
        {!slugAvailable && (
          <small className="text-danger">Slug not available</small>
        )}
      </div>

      <div className="mb-3">
        <label className="form-label">Date</label>
        <input
          type="date"
          className="form-control"
          value={date}
          onChange={(e) => setDate(e.target.value)}
        />
      </div>

      <div className="mb-3">
        <label className="form-label">Time</label>
        <input
          type="time"
          className="form-control"
          value={time}
          onChange={(e) => setTime(e.target.value)}
        />
      </div>

      <div className="mb-3">
        <label className="form-label">Location</label>
        <input
          className="form-control"
          value={location}
          onChange={(e) => setLocation(e.target.value)}
        />
      </div>

      <div className="mb-3">
        <label className="form-label">Description</label>
        <textarea
          className="form-control"
          rows={4}
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        />
      </div>

      <div className="mb-4">
        <label className="form-label">Cover Image</label>
        <input
          className="form-control"
          type="file"
          accept="image/*"
          onChange={(e) => setImageFile(e.target.files[0])}
        />
      </div>

      <button
        className="btn btn-primary"
        onClick={handleSubmit}
        disabled={saving || !slugAvailable}
      >
        {saving ? "Saving..." : "Create Event"}
      </button>

      {showPopup && (
        <div
          className="position-fixed top-0 start-0 w-100 h-100 d-flex align-items-center justify-content-center"
          style={{
            backdropFilter: "blur(6px)",
            WebkitBackdropFilter: "blur(6px)",
            backgroundColor: "rgba(0, 0, 0, 0.3)",
            zIndex: 1050,
          }}
        >
          <div
            className="bg-white p-4 rounded shadow text-center"
            style={{ minWidth: "280px" }}
          >
            <h4 className="mb-3">Creando evento...</h4>
            <div className="spinner-border text-primary" role="status" />
            <p className="mt-3 text-muted" style={{ fontSize: "0.9rem" }}>
              No cierres esta ventana.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
