import { useAuth } from "@/context/AuthContext"; // o la ruta correcta
import { Navigate } from "react-router-dom";
import UpdateUsersKeywords from "@/components/adminComponents/UpdateUsersKeywords";
import UpdateEventsKeywords from "@/components/adminComponents/UpdateEventsKeywords";
import CreateUserManual from "@/components/adminComponents/CreateUserManual";
import AddCategory from "@/components/adminComponents/AddCategory";

const AdminTools = () => {
  const { isAdmin, loading } = useAuth();

  if (loading) return <p>Cargando...</p>;
  if (!isAdmin) return <Navigate to="/" replace />;

  return (
    <div className="container mt-4">
      <h3>🔐 Herramientas de administración</h3>
      <AddCategory />
      <CreateUserManual />
      <div className="d-flex gap-3">
        <div>
          <UpdateUsersKeywords />
        </div>
        <div>
          <UpdateEventsKeywords />
        </div>
      </div>
    </div>
  );
};

export default AdminTools;
