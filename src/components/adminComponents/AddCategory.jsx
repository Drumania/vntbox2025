import { useState, useEffect } from "react";
import {
  collection,
  doc,
  setDoc,
  getDocs,
  deleteDoc,
  updateDoc,
} from "firebase/firestore";
import { db } from "@/firebase";
import slugify from "slugify";

export default function AddCategory() {
  const [name, setName] = useState("");
  const [categories, setCategories] = useState([]);
  const [message, setMessage] = useState("");

  const fetchCategories = async () => {
    const snap = await getDocs(collection(db, "categories"));
    const data = snap.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));
    const sorted = data.sort((a, b) => a.order - b.order);
    setCategories(sorted);
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const slug = slugify(name, { lower: true, strict: true });
    const nextOrder =
      categories.length > 0
        ? Math.max(...categories.map((cat) => cat.order || 0)) + 1
        : 1;

    try {
      await setDoc(doc(db, "categories", slug), {
        name,
        slug,
        order: nextOrder,
      });
      setMessage(`✅ Categoría "${name}" creada`);
      setName("");
      fetchCategories();
    } catch (err) {
      console.error("Error creando categoría:", err);
      setMessage("❌ Hubo un error");
    }
  };

  const handleEdit = async (cat) => {
    const newName = prompt("Nuevo nombre para la categoría:", cat.name);
    if (!newName || newName.trim() === "") return;

    const newSlug = slugify(newName, { lower: true, strict: true });

    try {
      // Creamos el nuevo documento con el nuevo slug
      await setDoc(doc(db, "categories", newSlug), {
        name: newName,
        slug: newSlug,
        order: cat.order,
      });
      // Borramos el viejo
      await deleteDoc(doc(db, "categories", cat.id));
      setMessage(`✅ Categoría actualizada`);
      fetchCategories();
    } catch (err) {
      console.error("Error actualizando categoría:", err);
      setMessage("❌ Error al actualizar");
    }
  };

  const handleDelete = async (cat) => {
    const confirmDelete = confirm(`¿Eliminar la categoría "${cat.name}"?`);
    if (!confirmDelete) return;
    try {
      await deleteDoc(doc(db, "categories", cat.id));
      setMessage(`🗑️ Categoría eliminada`);
      fetchCategories();
    } catch (err) {
      console.error("Error eliminando categoría:", err);
      setMessage("❌ Error al eliminar");
    }
  };

  return (
    <details
      className="my-4 border rounded bg-light"
      style={{ background: "#f8f9fa" }}
    >
      <summary className="p-3  fw-bold">
        Agregar y gestionar categorías de Eventos
      </summary>

      <div className="container p-3">
        <h5>Agregar categoría</h5>
        <form
          onSubmit={handleSubmit}
          className="d-flex align-items-center form-inline my-3"
        >
          <input
            type="text"
            name="name"
            className="form-control me-2"
            style={{ width: 200 }}
            placeholder="Nombre de categoría"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />
          <button type="submit" className="btn btn-primary">
            Agregar
          </button>
          {message && <div className="mx-3 text-success small">{message}</div>}
        </form>

        <table className="table table-sm table-striped mt-2">
          <thead>
            <tr>
              <th>Nombre</th>
              <th>Slug</th>
              <th>Orden</th>
              <th className="text-end">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {categories
              .slice()
              .sort((a, b) => a.order - b.order)
              .map((cat) => (
                <tr key={cat.id}>
                  <td>{cat.name}</td>
                  <td>
                    <code>{cat.slug}</code>
                  </td>
                  <td className="d-flex align-items-center">
                    <button
                      className="btn btn-sm btn-light px-2 py-1 mr-2"
                      onClick={async () => {
                        try {
                          await updateDoc(doc(db, "categories", cat.id), {
                            order: cat.order - 1,
                          });
                          fetchCategories();
                        } catch (err) {
                          console.error("Error al disminuir orden", err);
                          setMessage("❌ Error");
                        }
                      }}
                      title="Mover arriba"
                    >
                      ↑
                    </button>

                    <span style={{ minWidth: "20px", textAlign: "center" }}>
                      {cat.order}
                    </span>

                    <button
                      className="btn btn-sm btn-light px-2 py-1 ml-2"
                      onClick={async () => {
                        try {
                          await updateDoc(doc(db, "categories", cat.id), {
                            order: cat.order + 1,
                          });
                          fetchCategories();
                        } catch (err) {
                          console.error("Error al aumentar orden", err);
                          setMessage("❌ Error");
                        }
                      }}
                      title="Mover abajo"
                    >
                      ↓
                    </button>
                  </td>
                  <td className="text-end">
                    <button
                      className="btn btn-sm btn-outline-secondary mr-2"
                      onClick={() => handleEdit(cat)}
                    >
                      ✏️
                    </button>
                    <button
                      className="btn btn-sm btn-outline-danger"
                      onClick={() => handleDelete(cat)}
                    >
                      🗑️
                    </button>
                  </td>
                </tr>
              ))}
          </tbody>
        </table>
      </div>
    </details>
  );
}
