import { useState, useEffect } from "react";
import ReactDOM from "react-dom";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";

export default function LoginModal({ show, onHide }) {
  const { signUp, signIn, signInWithGoogle, addOrUpdateSlug, profile } =
    useAuth();
  const navigate = useNavigate();

  const [step, setStep] = useState(1); // 1 = auth, 2 = slug
  const [isLogin, setIsLogin] = useState(true);
  const [form, setForm] = useState({ email: "", password: "", username: "" });
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  /* Detectar cuando el perfil ya está disponible */
  useEffect(() => {
    if (!show || !profile) return;

    if (!profile.slug || profile.slug === "") {
      setStep(2);
    } else {
      onHide();
      navigate("/"); // o redirigir a donde quieras
    }
  }, [profile, show, onHide, navigate]);

  /* Bloquear scroll del body cuando está abierto */
  useEffect(() => {
    if (show) document.body.classList.add("modal-open");
    else document.body.classList.remove("modal-open");
    const esc = (e) => e.key === "Escape" && onHide();
    document.addEventListener("keydown", esc);
    return () => {
      document.body.classList.remove("modal-open");
      document.removeEventListener("keydown", esc);
    };
  }, [show, onHide]);

  const handleAuth = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      if (isLogin) {
        await signIn({ email: form.email, password: form.password });
      } else {
        await signUp({
          email: form.email,
          password: form.password,
          displayName: form.username,
          slug: form.username,
        });
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleGoogle = async () => {
    setError(null);
    try {
      await signInWithGoogle();
    } catch (err) {
      setError(err.message);
    }
  };

  const handleSaveSlug = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      await addOrUpdateSlug(form.username);
      onHide();
      navigate("/settings");
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const AuthStep = (
    <form onSubmit={handleAuth}>
      <h5 className="mb-3">{isLogin ? "Log In" : "Create Account"}</h5>

      {!isLogin && (
        <input
          className="form-control mb-2"
          type="text"
          placeholder="Username (slug)"
          value={form.username}
          onChange={(e) => setForm((f) => ({ ...f, username: e.target.value }))}
          required
        />
      )}

      <input
        className="form-control mb-2"
        type="email"
        placeholder="Email"
        value={form.email}
        onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
        required
      />

      <input
        className="form-control mb-3"
        type="password"
        placeholder="Password"
        value={form.password}
        onChange={(e) => setForm((f) => ({ ...f, password: e.target.value }))}
        required
      />

      {error && <div className="alert alert-danger">{error}</div>}

      <button className="btn btn-primary w-100 mb-2" disabled={loading}>
        {isLogin ? "Log In" : "Sign Up"}
      </button>

      <button
        type="button"
        className="btn btn-outline-secondary w-100 mb-3"
        onClick={handleGoogle}
        disabled={loading}
      >
        Continue with Google
      </button>

      <div className="text-center">
        {isLogin ? (
          <>
            Need an account?{" "}
            <button
              type="button"
              className="btn btn-link p-0"
              onClick={() => setIsLogin(false)}
            >
              Sign up
            </button>
          </>
        ) : (
          <>
            Already have an account?{" "}
            <button
              type="button"
              className="btn btn-link p-0"
              onClick={() => setIsLogin(true)}
            >
              Log in
            </button>
          </>
        )}
      </div>
    </form>
  );

  const SlugStep = (
    <form onSubmit={handleSaveSlug}>
      <h5 className="mb-3">Choose your username</h5>
      <input
        className="form-control mb-3"
        type="text"
        placeholder="Username (slug)"
        value={form.username}
        onChange={(e) => setForm((f) => ({ ...f, username: e.target.value }))}
        required
      />
      {error && <div className="alert alert-danger">{error}</div>}
      <button className="btn btn-primary w-100" disabled={loading}>
        Save & Go to Settings
      </button>
    </form>
  );

  if (!show) return null;

  return ReactDOM.createPortal(
    <>
      {/* backdrop */}
      <div className="modal-backdrop fade show"></div>

      {/* modal */}
      <div
        className="modal fade show d-block"
        tabIndex="-1"
        role="dialog"
        onClick={onHide}
        style={{ zIndex: 1055 }}
      >
        <div
          className="modal-dialog modal-dialog-centered"
          role="document"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="modal-content p-3">
            {step === 1 ? AuthStep : SlugStep}
          </div>
        </div>
      </div>
    </>,
    document.body
  );
}
