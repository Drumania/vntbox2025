import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";

export default function RequireSlug({ children }) {
  const { redirectToSettings, loading } = useAuth();
  const location = useLocation();

  // Esperar que cargue el perfil
  if (loading) return null;

  // Ya está en /settings o ya tiene slug → dejar pasar
  if (!redirectToSettings || location.pathname === "/settings") {
    return children;
  }

  // Redirigir a /settings si no tiene username
  return <Navigate to="/settings" replace />;
}
