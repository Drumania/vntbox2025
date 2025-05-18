import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function Logout() {
  const { logout } = useAuth();
  const [done, setDone] = useState(false);
  const [seconds, setSeconds] = useState(5);
  const navigate = useNavigate();

  useEffect(() => {
    const doLogout = async () => {
      await logout();
      setDone(true);
    };

    doLogout();
  }, []);

  useEffect(() => {
    if (!done) return;

    const interval = setInterval(() => {
      setSeconds((prev) => prev - 1);
    }, 1000);

    return () => clearInterval(interval);
  }, [done]);

  useEffect(() => {
    if (seconds === 0) {
      navigate("/");
    }
  }, [seconds, navigate]);

  return (
    <div className="container py-5 text-center">
      {done ? (
        <>
          <h1>You have been logged out...</h1>
          <p className="mt-3 text-muted">
            Redirecting to home in {seconds} second{seconds !== 1 && "s"}...
          </p>
        </>
      ) : (
        <p>Logging out...</p>
      )}
    </div>
  );
}
