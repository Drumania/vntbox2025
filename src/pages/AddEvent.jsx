import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  doc,
  updateDoc,
  setDoc,
  getDoc,
  getDocs,
  collection,
  deleteDoc,
} from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { db, storage } from "../firebase";
import { useAuth } from "../context/AuthContext";
import slugify from "slugify";
import useGenerateKeywords from "../hooks/useGenerateKeywords";
import Select from "react-select";

export default function AddEvent() {
  const { slug } = useParams();
  const navigate = useNavigate();
  const { user, profile } = useAuth();
  const generateKeywords = useGenerateKeywords();
  const isEditing = !!slug;
  const isAdmin = profile?.role === "admin";

  const [categories, setCategories] = useState([]);
  const [allUsers, setAllUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [slugError, setSlugError] = useState(false);

  const [form, setForm] = useState({
    title: "",
    slug: "",
    description: "",
    date: "",
    time: "",
    location: "",
    category: "",
    tags: [],
    external_link: "",
    status: "activo",
    visibility: "public",
    image_url: "",
    featured: false,
    priority: 0,
    owner_name: "",
    user_id: "",
  });

  const [tagInput, setTagInput] = useState("");
  const [imageFile, setImageFile] = useState(null);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    const fetchCategories = async () => {
      const snap = await getDocs(collection(db, "categories"));
      const data = snap.docs.map((doc) => ({
        ...doc.data(),
        slug: doc.id,
      }));
      setCategories(data.sort((a, b) => a.order - b.order));
    };
    fetchCategories();

    if (isAdmin) {
      const fetchUsers = async () => {
        const snap = await getDocs(collection(db, "users"));
        const users = snap.docs.map((doc) => ({
          value: doc.id,
          label:
            doc.data().display_name || doc.data().email || "Usuario sin nombre",
        }));
        setAllUsers(users);
      };
      fetchUsers();
    }

    const loadEvent = async () => {
      if (!isEditing) return;
      const ref = doc(db, "events", slug);
      const snap = await getDoc(ref);
      if (snap.exists()) {
        const data = snap.data();
        setForm({
          ...data,
          slug: snap.id,
        });
      }
    };
    loadEvent();
  }, [slug, isEditing]);

  useEffect(() => {
    if (isEditing || !form.slug) return;
    const checkSlug = async () => {
      const ref = doc(db, "events", form.slug);
      const snap = await getDoc(ref);
      setSlugError(snap.exists());
    };
    checkSlug();
  }, [form.slug, isEditing]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => {
      const updated = { ...prev, [name]: value };
      if (name === "title" && !isEditing) {
        updated.slug = slugify(value, { lower: true, strict: true });
      }
      return updated;
    });
  };

  const handleFileChange = (e) => {
    setImageFile(e.target.files[0]);
  };

  const uploadImage = async () => {
    if (!imageFile) return form.image_url;
    const storageRef = ref(
      storage,
      `event-covers/${Date.now()}-${imageFile.name}`
    );
    await uploadBytes(storageRef, imageFile);
    return await getDownloadURL(storageRef);
  };

  const validate = () => {
    const errs = {};
    if (!form.title) errs.title = "El título es obligatorio";
    if (!form.date) errs.date = "La fecha es obligatoria";
    if (!form.time) errs.time = "La hora es obligatoria";
    if (!form.location) errs.location = "La ubicación es obligatoria";
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate() || slugError) return;

    setLoading(true);
    setMessage("");

    try {
      const imageUrl = await uploadImage();
      const keywords = generateKeywords(form.title, form.location);

      const eventData = {
        ...form,
        image_url: imageUrl,
        keywords,
        created_by: user.uid,
        user_id: isAdmin && form.user_id ? form.user_id : user.uid,
        owner_name:
          isAdmin && form.owner_name
            ? form.owner_name
            : profile?.display_name || "Anónimo",
        created_at: Date.now(),
      };

      if (isEditing) {
        const ref = doc(db, "events", slug);
        await updateDoc(ref, eventData);
        navigate(`/e/${slug}`);
      } else {
        const newRef = doc(db, "events", form.slug);
        await setDoc(newRef, eventData);
        navigate(`/e/${form.slug}`);
      }
    } catch (error) {
      console.error("Error al guardar evento:", error);
      setMessage("❌ Error al guardar evento. " + error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container py-4">
      <h2>{isEditing ? "Editar Evento" : "Crear Nuevo Evento"}</h2>
      {message && <div className="alert alert-danger">{message}</div>}

      {isAdmin && (
        <div className="alert alert-secondary mb-4">
          <h5 className="mb-3">⚙️ Acciones de administrador</h5>

          <div className="mb-3">
            <label className="form-label">Usuario creador del evento</label>
            <Select
              options={allUsers}
              placeholder="Buscar usuario..."
              isClearable
              value={allUsers.find((u) => u.value === form.user_id) || null}
              onChange={(selected) => {
                setForm((prev) => ({
                  ...prev,
                  user_id: selected?.value || "",
                  owner_name: selected?.label || "",
                }));
              }}
            />
          </div>

          <div className="d-flex flex-wrap gap-2">
            <button
              type="button"
              className="btn btn-warning"
              onClick={() =>
                setForm((prev) => ({
                  ...prev,
                  status: prev.status === "activo" ? "pausado" : "activo",
                }))
              }
            >
              {form.status === "activo"
                ? "⏸️ Pausar Evento"
                : "▶️ Activar Evento"}
            </button>

            <button
              type="button"
              className="btn btn-outline-danger"
              onClick={async () => {
                const confirm = window.confirm(
                  "¿Estás seguro que querés eliminar este evento?"
                );
                if (!confirm) return;
                try {
                  await deleteDoc(doc(db, "events", slug));
                  navigate("/"); // o a una ruta tipo /admin/events
                } catch (err) {
                  console.error("Error al eliminar evento", err);
                  alert("Error al eliminar el evento.");
                }
              }}
            >
              🗑️ Eliminar Evento
            </button>
          </div>

          <div className="mt-3 text-muted small">
            Slug: <strong>/e/{form.slug}</strong> — Fecha:{" "}
            <strong>{form.date || "sin fecha"}</strong> — Estado:{" "}
            <strong>{form.status}</strong>
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit}>
        {/* {isAdmin && (
          <div className="form-group">
            <label>Usuario creador del evento</label>
            <Select
              options={allUsers}
              placeholder="Buscar usuario..."
              isClearable
              value={allUsers.find((u) => u.value === form.user_id) || null}
              onChange={(selected) => {
                setForm((prev) => ({
                  ...prev,
                  user_id: selected?.value || "",
                  owner_name: selected?.label || "",
                }));
              }}
            />
            <small className="form-text text-muted">
              Este evento se publicará como si fuera de ese usuario.
            </small>
          </div>
        )} */}

        <div className="form-group">
          <label>Título</label>
          <input
            type="text"
            name="title"
            className="form-control"
            value={form.title}
            onChange={handleChange}
            required
          />
          {errors.title && (
            <small className="text-danger">{errors.title}</small>
          )}
        </div>

        {!isEditing && (
          <div className="form-group mt-2">
            <label>Slug (URL)</label>
            <div className="input-group">
              <input
                type="text"
                name="slug"
                className={`form-control ${slugError ? "is-invalid" : ""}`}
                value={form.slug}
                onChange={(e) =>
                  setForm((prev) => ({
                    ...prev,
                    slug: slugify(e.target.value, {
                      lower: true,
                      strict: true,
                    }),
                  }))
                }
              />
              <div className="input-group-append">
                <button
                  type="button"
                  className="btn btn-outline-secondary"
                  onClick={() =>
                    setForm((prev) => ({
                      ...prev,
                      slug: slugify(prev.title, { lower: true, strict: true }),
                    }))
                  }
                >
                  🔁
                </button>
              </div>
            </div>
            {slugError && (
              <small className="text-danger">Este slug ya está en uso.</small>
            )}
            {!slugError && form.slug && (
              <small className="text-muted">URL final: /e/{form.slug}</small>
            )}
          </div>
        )}

        <div className="form-group">
          <label>Descripción</label>
          <textarea
            name="description"
            className="form-control"
            value={form.description}
            onChange={handleChange}
          />
        </div>

        <div className="form-row">
          <div className="form-group col-md-6">
            <label>Fecha</label>
            <input
              type="date"
              name="date"
              className="form-control"
              value={form.date}
              onChange={handleChange}
              required
            />
            {errors.date && (
              <small className="text-danger">{errors.date}</small>
            )}
          </div>
          <div className="form-group col-md-6">
            <label>Hora</label>
            <input
              type="time"
              name="time"
              className="form-control"
              value={form.time}
              onChange={handleChange}
              required
            />
            {errors.time && (
              <small className="text-danger">{errors.time}</small>
            )}
          </div>
        </div>

        <div className="form-group">
          <label>Ubicación</label>
          <input
            type="text"
            name="location"
            className="form-control"
            value={form.location}
            onChange={handleChange}
          />
          {errors.location && (
            <small className="text-danger">{errors.location}</small>
          )}
        </div>

        <div className="form-group">
          <label>Categoría</label>
          <div className="btn-group d-block" role="group">
            {categories.map((cat) => (
              <button
                key={cat.slug}
                type="button"
                className={`btn btn-sm btn-outline-secondary mr-2 mb-1 ${
                  form.category === cat.slug ? "active btn-primary" : ""
                }`}
                onClick={() => setForm({ ...form, category: cat.slug })}
              >
                {cat.icon} {cat.name}
              </button>
            ))}
          </div>
        </div>

        <div className="form-group">
          <label>Tags</label>
          <div className="input-group mb-2">
            <input
              type="text"
              className="form-control"
              placeholder="Escribí un tag y presioná Enter"
              value={tagInput}
              onChange={(e) => setTagInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && tagInput.trim()) {
                  e.preventDefault();
                  setForm((prev) => ({
                    ...prev,
                    tags: [...prev.tags, tagInput.trim()],
                  }));
                  setTagInput("");
                }
              }}
            />
          </div>
          <div>
            {form.tags.map((tag, index) => (
              <span
                key={index}
                className="badge badge-primary text-muted mr-2"
                onClick={() =>
                  setForm((prev) => ({
                    ...prev,
                    tags: prev.tags.filter((_, i) => i !== index),
                  }))
                }
                style={{ cursor: "pointer" }}
              >
                {tag} ×
              </span>
            ))}
          </div>
        </div>

        <div className="form-group">
          <label>Enlace externo (opcional)</label>
          <input
            type="text"
            name="external_link"
            className="form-control"
            value={form.external_link}
            onChange={handleChange}
          />
        </div>

        <div className="form-group">
          <label>Imagen destacada</label>
          <input
            type="file"
            accept="image/*"
            onChange={handleFileChange}
            className="form-control"
          />
          {form.image_url && (
            <img
              src={form.image_url}
              alt="preview"
              className="img-fluid mt-2 rounded"
              style={{ maxHeight: 200 }}
            />
          )}
        </div>

        <button
          type="submit"
          className="btn btn-success mt-3"
          disabled={loading || slugError}
        >
          {loading
            ? "Guardando..."
            : isEditing
            ? "Guardar Cambios"
            : "Crear Evento"}
        </button>
      </form>
    </div>
  );
}
