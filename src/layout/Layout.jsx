// src/layout/MainLayout.jsx
import { Outlet, Link } from "react-router-dom";
import Header from "../components/Header";

export default function Layout() {
  return (
    <>
      <main className="container">
        <Header />
        <Outlet />
      </main>
    </>
  );
}
