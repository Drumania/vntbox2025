import { useState } from "react";
import { useAuth } from "../context/AuthContext";

export default function AuthModal({ show, onClose }) {
  const { register, login, loginWithGoogle } = useAuth();
  const [isRegistering, setIsRegistering] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  if (!show) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      if (!email || !password) throw new Error("All fields are required");

      if (isRegistering) {
        if (password !== confirm) throw new Error("Passwords do not match");
        await register(email, password);
      } else {
        await login(email, password);
      }

      onClose();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleGoogle = async () => {
    setError(null);
    setLoading(true);
    try {
      await loginWithGoogle();
      onClose();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="modal fade show d-block"
      tabIndex="-1"
      style={{ backgroundColor: "rgba(0,0,0,0.5)" }}
    >
      <div className="modal-dialog">
        <div className="modal-content">
          <div className="modal-header">
            <h5 className="modal-title">
              {isRegistering ? "Register" : "Login"}
            </h5>
            <button
              type="button"
              className="btn-close"
              onClick={onClose}
            ></button>
          </div>

          <div className="modal-body">
            <form onSubmit={handleSubmit}>
              <div className="mb-3">
                <label className="form-label">Email</label>
                <input
                  type="email"
                  className="form-control"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>

              <div className="mb-3">
                <label className="form-label">Password</label>
                <input
                  type="password"
                  className="form-control"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>

              {isRegistering && (
                <div className="mb-3">
                  <label className="form-label">Confirm Password</label>
                  <input
                    type="password"
                    className="form-control"
                    value={confirm}
                    onChange={(e) => setConfirm(e.target.value)}
                    required
                  />
                </div>
              )}

              {error && <p className="text-danger small">{error}</p>}

              <button
                type="submit"
                className="btn btn-primary w-100"
                disabled={loading}
              >
                {loading
                  ? "Please wait..."
                  : isRegistering
                  ? "Register"
                  : "Login"}
              </button>

              <button
                type="button"
                className="btn btn-outline-dark w-100 mt-3"
                onClick={handleGoogle}
                disabled={loading}
              >
                <i className="bi bi-google me-2"></i> Continue with Google
              </button>

              <div className="text-center mt-3">
                <small>
                  {isRegistering
                    ? "Already have an account?"
                    : "Don't have an account?"}{" "}
                  <button
                    type="button"
                    className="btn btn-link p-0"
                    onClick={() => setIsRegistering(!isRegistering)}
                  >
                    {isRegistering ? "Login" : "Register"}
                  </button>
                </small>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
