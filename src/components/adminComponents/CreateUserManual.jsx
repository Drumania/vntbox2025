import { useState, useEffect } from "react";
import { doc, setDoc, getDoc } from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { db, storage } from "@/firebase";
import useGenerateKeywords from "@/hooks/useGenerateKeywords";
import slugify from "slugify";
import { useAuth } from "@/context/AuthContext";

const generateRandomPassword = () =>
  Math.random().toString(36).slice(-8) +
  "-" +
  Math.random().toString(36).slice(-4);

export default function CreateUserManual() {
  const { isAdmin } = useAuth();
  const [form, setForm] = useState({
    display_name: "",
    password: "",
    role: "user",
  });
  const [avatarFile, setAvatarFile] = useState(null);
  const [slug, setSlug] = useState("");
  const [slugError, setSlugError] = useState(false);
  const [checkingSlug, setCheckingSlug] = useState(false);
  const [generated, setGenerated] = useState(null);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const generateKeywords = useGenerateKeywords();

  useEffect(() => {
    const newSlug = slugify(form.display_name, { lower: true, strict: true });
    setSlug(newSlug);
  }, [form.display_name]);

  useEffect(() => {
    const checkSlug = async () => {
      if (!slug || slug.length < 3) {
        setSlugError(true);
        return;
      }
      setCheckingSlug(true);
      const snap = await getDoc(doc(db, "usernames", slug));
      setSlugError(snap.exists());
      setCheckingSlug(false);
    };

    if (slug) checkSlug();
  }, [slug]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e) => {
    setAvatarFile(e.target.files[0]);
  };

  const handleGeneratePassword = () => {
    const newPass = generateRandomPassword();
    setForm((prev) => ({ ...prev, password: newPass }));
  };

  const uploadAvatar = async () => {
    if (!avatarFile) return "";
    const uniqueName = `${Date.now()}-${avatarFile.name}`;
    const avatarRef = ref(storage, `avatars/${uniqueName}`);
    await uploadBytes(avatarRef, avatarFile);
    return await getDownloadURL(avatarRef);
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");
    setGenerated(null);

    try {
      if (!form.password || form.password.length < 6) {
        throw new Error("La contraseña debe tener al menos 6 caracteres");
      }

      if (slugError) {
        throw new Error("El slug ya está en uso");
      }

      const avatar_url = await uploadAvatar();
      const keywords = generateKeywords(form.display_name, slug);

      // 1. Guardar en /users/{slug}
      await setDoc(doc(db, "users", slug), {
        display_name: form.display_name,
        username: slug,
        avatar_url,
        bio: "",
        role: form.role,
        created_at: Date.now(),
        keywords,
        reserved: true,
        manual_password: form.password,
        auth_uid: null,
      });

      // 2. Registrar el slug
      await setDoc(doc(db, "usernames", slug), {
        uid: null,
        reserved: true,
        created_by: "admin",
        created_at: Date.now(),
      });

      setGenerated({ slug, password: form.password });
      setForm({ display_name: "", password: "", role: "user" });
      setAvatarFile(null);
    } catch (err) {
      console.error("Error al crear perfil:", err);
      setMessage("❌ " + err.message);
    } finally {
      setLoading(false);
    }
  };

  if (!isAdmin) return null;

  return (
    <details className="my-4 border rounded bg-light">
      <summary className="p-3 fw-bold">
        Crear nueva cuenta manual (reservada)
      </summary>
      <div className="p-3">
        <form onSubmit={handleCreate}>
          <div className="form-group mb-3">
            <label>Nombre para mostrar</label>
            <input
              type="text"
              name="display_name"
              className={`form-control ${slugError ? "is-invalid" : ""}`}
              style={{ width: 250 }}
              value={form.display_name}
              onChange={handleChange}
              required
            />
            {checkingSlug && (
              <small className="text-muted">Verificando slug…</small>
            )}
            {!slugError && slug && (
              <small className="text-success">Slug: /{slug}</small>
            )}
            {slugError && (
              <small className="text-danger">Este slug ya está en uso.</small>
            )}
          </div>

          <div className="form-group mb-3">
            <label>Contraseña</label>
            <div className="d-flex">
              <input
                type="text"
                name="password"
                className="form-control"
                style={{ width: 200 }}
                value={form.password}
                onChange={handleChange}
                required
              />
              <button
                type="button"
                className="btn btn-outline-secondary"
                onClick={handleGeneratePassword}
                title="Generar aleatoria"
              >
                🔁
              </button>
            </div>
          </div>

          <div className="form-group mb-3">
            <label>Foto de perfil (opcional)</label>
            <input
              type="file"
              accept="image/*"
              style={{ width: 300 }}
              onChange={handleFileChange}
              className="form-control"
            />
          </div>

          <div className="form-group mb-3">
            <label>Rol</label>
            <select
              name="role"
              className="form-control"
              value={form.role}
              onChange={handleChange}
              style={{ width: 200 }}
            >
              <option value="user">user</option>
              <option value="admin">admin</option>
            </select>
          </div>

          <button
            type="submit"
            className="btn btn-primary"
            disabled={loading || slugError}
          >
            {loading ? "Guardando..." : "Crear cuenta"}
          </button>
        </form>

        {generated && (
          <div className="alert alert-info mt-3">
            ✅ Cuenta creada: <code>/{generated.slug}</code>
            <br />
            Contraseña: <code>{generated.password}</code>
            <br />
            <small>
              Podés pasársela al usuario para que reclame la cuenta.
            </small>
          </div>
        )}

        {message && <div className="mt-2 text-danger">{message}</div>}
      </div>
    </details>
  );
}
