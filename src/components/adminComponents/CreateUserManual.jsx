import { useState } from "react";
import { db, storage } from "@/firebase";
import { collection, query, where, getDocs, addDoc } from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import slugify from "slugify";
import { v4 as uuidv4 } from "uuid";

export default function CreateUserManual() {
  const [displayName, setDisplayName] = useState("");
  const [slug, setSlug] = useState("");
  const [avatarFile, setAvatarFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  const handleSlugChange = (value) => {
    const generated = slugify(value, { lower: true });
    setSlug(generated);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");

    try {
      // 1. Validar unicidad del slug
      const slugQuery = query(
        collection(db, "users"),
        where("slug", "==", slug)
      );
      const slugSnap = await getDocs(slugQuery);
      if (!slug || slugSnap.size > 0) {
        setMessage("❌ Slug ya en uso o inválido.");
        setLoading(false);
        return;
      }

      // 2. Subir avatar si hay
      let avatarUrl = "";
      if (avatarFile) {
        const fileRef = ref(storage, `avatars/${uuidv4()}`);
        await uploadBytes(fileRef, avatarFile);
        avatarUrl = await getDownloadURL(fileRef);
      }

      // 3. Crear documento en Firestore
      await addDoc(collection(db, "users"), {
        display_name: displayName,
        slug,
        avatar_url: avatarUrl,
        created_at: new Date(),
        role: "guest",
        email: null,
        bio: "",
        social_links: {},
      });

      setMessage("✅ Usuario creado correctamente.");
      setDisplayName("");
      setSlug("");
      setAvatarFile(null);
    } catch (err) {
      console.error(err);
      setMessage("❌ Error al crear el usuario.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mt-4" style={{ maxWidth: "500px" }}>
      <h3 className="mb-3">Crear usuario manual</h3>
      <form onSubmit={handleSubmit}>
        <div className="mb-3">
          <label className="form-label">Nombre para mostrar</label>
          <input
            type="text"
            className="form-control"
            value={displayName}
            onChange={(e) => {
              setDisplayName(e.target.value);
              handleSlugChange(e.target.value);
            }}
            required
          />
        </div>

        <div className="mb-3">
          <label className="form-label">Slug (username público)</label>
          <input
            type="text"
            className="form-control"
            value={slug}
            onChange={(e) => setSlug(slugify(e.target.value, { lower: true }))}
            required
          />
        </div>

        <div className="mb-3">
          <label className="form-label">Avatar</label>
          <input
            type="file"
            className="form-control"
            accept="image/*"
            onChange={(e) => setAvatarFile(e.target.files[0])}
          />
        </div>

        <button type="submit" className="btn btn-primary" disabled={loading}>
          {loading ? "Creando..." : "Crear usuario"}
        </button>

        {message && <p className="mt-3">{message}</p>}
      </form>
    </div>
  );
}
