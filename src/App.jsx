import { BrowserRouter, Routes, Route } from "react-router-dom";
import Layout from "./layout/Layout";
import Home from "./pages/Home";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Profile from "./pages/Profile";
import Settings from "./pages/Settings";
import AddEvent from "./pages/AddEvent";
import Event from "./pages/Event";
import SearchResults from "./pages/SearchResults";
import AdminTools from "./pages/AdminTools";
import Logout from "./pages/Logout";
import RequireSlug from "./pages/RequireSlug";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<Layout />}>
          {/* 🌐 Rutas públicas */}
          <Route
            path="/"
            element={
              <RequireSlug>
                <Home />
              </RequireSlug>
            }
          />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/logout" element={<Logout />} />
          <Route path="/settings" element={<Settings />} />{" "}
          {/* 👈 accesible siempre */}
          <Route path="/search" element={<SearchResults />} />
          <Route path="/e/:slug" element={<Event />} />
          <Route path="/:slug" element={<Profile />} />
          {/* 🔐 Rutas protegidas por slug */}
          <Route
            path="/profile"
            element={
              <RequireSlug>
                <Profile />
              </RequireSlug>
            }
          />
          <Route
            path="/addevent"
            element={
              <RequireSlug>
                <AddEvent />
              </RequireSlug>
            }
          />
          <Route
            path="/edit-event/:slug"
            element={
              <RequireSlug>
                <AddEvent />
              </RequireSlug>
            }
          />
          <Route
            path="/admin"
            element={
              <RequireSlug>
                <AdminTools />
              </RequireSlug>
            }
          />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
