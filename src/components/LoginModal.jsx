import { useState } from "react";
import { useAuth } from "@/context/AuthContext";

export default function LoginModal({ show, onClose }) {
  const { login, signUp, loginWithGoogle } = useAuth();
  const [isLogin, setIsLogin] = useState(true);
  const [form, setForm] = useState({
    email: "",
    password: "",
    confirm: "",
    slug: "",
  });
  const [error, setError] = useState("");

  if (!show) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    try {
      if (isLogin) {
        await login(form.email, form.password);
        onClose();
      } else {
        if (form.password !== form.confirm)
          throw new Error("Passwords don't match");
        if (!form.slug) throw new Error("Slug is required");
        await signUp({
          email: form.email,
          password: form.password,
          slug: form.slug,
        });
        onClose();
      }
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div
      className="position-fixed top-0 start-0 w-100 h-100 d-flex justify-content-center align-items-center"
      style={{
        backgroundColor: "rgba(255,255,255,0.95)",
        zIndex: 1050,
      }}
      onClick={onClose}
    >
      <div
        className="bg-white border rounded shadow p-4"
        style={{ width: "100%", maxWidth: "400px" }}
        onClick={(e) => e.stopPropagation()}
      >
        <h5 className="mb-3 text-center">
          {isLogin ? "Login" : "Create Account"}
        </h5>

        <form onSubmit={handleSubmit}>
          {!isLogin && (
            <input
              type="text"
              placeholder="Username (slug)"
              className="form-control mb-2"
              value={form.slug}
              onChange={(e) => setForm({ ...form, slug: e.target.value })}
              required
            />
          )}

          <input
            type="email"
            placeholder="Email"
            className="form-control mb-2"
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
            required
          />

          <input
            type="password"
            placeholder="Password"
            className="form-control mb-2"
            value={form.password}
            onChange={(e) => setForm({ ...form, password: e.target.value })}
            required
          />

          {!isLogin && (
            <input
              type="password"
              placeholder="Confirm Password"
              className="form-control mb-3"
              value={form.confirm}
              onChange={(e) => setForm({ ...form, confirm: e.target.value })}
              required
            />
          )}

          {error && <div className="alert alert-danger">{error}</div>}

          <button type="submit" className="btn btn-primary w-100 mb-2">
            {isLogin ? "Login" : "Register"}
          </button>
        </form>

        <button
          className="btn btn-outline-dark w-100 mb-3"
          onClick={async () => {
            try {
              await loginWithGoogle();
              onClose();
            } catch (err) {
              setError(err.message);
            }
          }}
        >
          Continue with Google
        </button>

        <div className="text-center">
          <button
            className="btn btn-link p-0"
            onClick={() => setIsLogin(!isLogin)}
          >
            {isLogin ? "Need an account? Register" : "Have an account? Login"}
          </button>
        </div>
      </div>
    </div>
  );
}
