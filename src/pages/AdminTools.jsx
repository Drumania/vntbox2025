import { useAuth } from "@/context/AuthContext";
import { Navigate } from "react-router-dom";
import UpdateUsersKeywords from "@/components/adminComponents/UpdateUsersKeywords";
import UpdateEventsKeywords from "@/components/adminComponents/UpdateEventsKeywords";
import CreateUserManual from "@/components/adminComponents/CreateUserManual";
import AddCategory from "@/components/adminComponents/AddCategory";
import { runRecalculation } from "@/utils/adminFunctions"; // ⬅️ NUEVO

const AdminTools = () => {
  const { isAdmin, loading } = useAuth();

  if (loading) return <p>Cargando...</p>;
  if (!isAdmin) return <Navigate to="/" replace />;

  return (
    <div className="container mt-4">
      <div className="row">
        <h3 className="col-12">🔐 Herramientas de administración</h3>

        <div className="col-6">
          <AddCategory />
        </div>
        <div className="col-6">
          <CreateUserManual />
        </div>

        <div className="col-6">
          <UpdateUsersKeywords />
        </div>
        <div className="col-6">
          <UpdateEventsKeywords />
        </div>

        <div className="col-3 mt-4">
          <div className="p-3 border rounded bg-light">
            <h5>Actulizar followers/following</h5>
            <button className="btn btn-primary my-3" onClick={runRecalculation}>
              Recalcular followers/following
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminTools;
