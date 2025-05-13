import { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";

export default function Logout() {
  const { logout } = useAuth();
  const [done, setDone] = useState(false);

  useEffect(() => {
    const doLogout = async () => {
      await logout(); // esperar a que termine
      setDone(true);
    };

    doLogout();
  }, []);

  return (
    <div className="container py-5 text-center">
      {done ? (
        <>
          <h1>You have been logged out...</h1>
        </>
      ) : (
        <p>Logging out...</p>
      )}
    </div>
  );
}
