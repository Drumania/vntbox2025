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

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<Layout />}>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/settings" element={<Settings />} />
          <Route path="/addevent" element={<AddEvent />} />
          <Route path="/search" element={<SearchResults />} />
          <Route path="/logout" element={<Logout />} />
          <Route path="/admin" element={<AdminTools />} />
          <Route path="/:slug" element={<Profile />} />
          <Route path="/e/:slug" element={<Event />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
