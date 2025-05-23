import { useState, useRef, useEffect } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import LoginModal from "@/components/LoginModal";
import { useTheme } from "@/context/ThemeContext";

export default function HeaderAvatar() {
  const { user, profile, logout, isAdmin } = useAuth();
  const { darkMode, toggleTheme } = useTheme();
  const [open, setOpen] = useState(false);
  const [showAuth, setShowAuth] = useState(false);
  const menuRef = useRef();

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const displayName =
    profile?.display_name || user?.displayName || user?.email || "";

  const avatarUrl = profile?.avatar_url || user?.photoURL || null;

  function getInitials(name) {
    if (!name) return "";
    const parts = name.trim().split(" ");
    const first = parts[0]?.[0] || "";
    const second = parts[1]?.[0] || "";
    return (first + second).toUpperCase();
  }

  // 🟡 SIN LOGIN
  if (!user) {
    return (
      <>
        <div className="text-end me-3">
          <button
            className="btn btn-outline-dark btn-sm"
            onClick={() => setShowAuth(true)}
          >
            Login / Register
          </button>
        </div>
        <LoginModal show={showAuth} onClose={() => setShowAuth(false)} />
      </>
    );
  }

  // 🟢 LOGUEADO
  return (
    <div className="user-perfil position-relative me-3" ref={menuRef}>
      <h4 className="user-perfil-name text-end text-truncate mb-0">
        <Link
          to={`/${profile?.slug || "profile"}`}
          className="text-decoration-none"
        >
          {displayName}
        </Link>
      </h4>

      <Link
        to={`/${profile?.slug || "profile"}`}
        className="user-perfil-img d-inline-block rounded-circle overflow-hidden"
        style={{ width: "40px", height: "40px", backgroundColor: "#eee" }}
      >
        {avatarUrl ? (
          <img
            src={avatarUrl}
            alt="Avatar"
            className="w-100 h-100 object-fit-cover"
          />
        ) : (
          <div className="d-flex align-items-center justify-content-center h-100 fw-bold text-uppercase text-muted">
            {getInitials(displayName)}
          </div>
        )}
      </Link>

      <button
        className="btn p-0 border-0 bg-transparent user-perfil-dots ms-2"
        onClick={() => setOpen((prev) => !prev)}
      >
        <i className="bi bi-three-dots-vertical fs-5"></i>
      </button>

      {open && (
        <div
          className="dropdown-menu show position-absolute end-0 mt-2 shadow-sm"
          style={{ minWidth: "180px", zIndex: 1050 }}
        >
          {isAdmin && (
            <Link to="/admin" className="dropdown-item text-primary">
              <i className="bi bi-wrench-adjustable-circle me-2"></i> Admin
              Tools
            </Link>
          )}
          <li>
            <button
              className="dropdown-item d-flex justify-content-between align-items-center"
              onClick={toggleTheme}
            >
              Modo oscuro
              <i
                className={`bi ${
                  darkMode ? "bi-moon-stars-fill" : "bi-sun"
                } ms-2`}
              ></i>
            </button>
          </li>
          <Link className="dropdown-item" to="/settings">
            <i className="bi bi-gear me-2"></i> Settings
          </Link>
          <Link className="dropdown-item" to="/addevent">
            <i className="bi bi-plus-circle me-2"></i> Add Event
          </Link>
          <button className="dropdown-item text-danger" onClick={logout}>
            <i className="bi bi-box-arrow-right me-2"></i> Logout
          </button>
        </div>
      )}
    </div>
  );
}
