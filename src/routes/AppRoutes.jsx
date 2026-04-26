import { NavLink, Route, Routes } from "react-router-dom";
import Home from "../pages/Home";
import About from "../pages/About";
import Contact from "../pages/Contact";
import NotFound from "../pages/NotFound";

function Layout({ children }) {
  return (
    <div className="app-shell">
      <header className="app-header">
        <nav className="app-nav" aria-label="Primary">
          <span className="app-brand">React Router</span>
          <NavLink
            className={({ isActive }) => `app-link${isActive ? " active" : ""}`}
            to="/"
            end
          >
            Home
          </NavLink>
          <NavLink
            className={({ isActive }) => `app-link${isActive ? " active" : ""}`}
            to="/about"
          >
            About
          </NavLink>
          <NavLink
            className={({ isActive }) => `app-link${isActive ? " active" : ""}`}
            to="/contact"
          >
            Contact
          </NavLink>
        </nav>
      </header>

      <main>{children}</main>
    </div>
  );
}

function AppRoutes() {
  return (
    <Layout>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/about" element={<About />} />
        <Route path="/contact" element={<Contact />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </Layout>
  );
}

export default AppRoutes;
