import { NavLink, Route, Routes, Navigate } from "react-router-dom";
import NotFound from "../pages/NotFound";
import AdminInvoices from "../pages/AdminInvoices";
import StaffSales from "../pages/StaffSales";
import ViewInvoices from "../pages/ViewInvoices";

function Layout({ children }) {
  return (
    <div className="app-shell">
      <header className="app-header">
        <nav className="app-nav" aria-label="Primary">
          <span className="app-brand">AutoEase</span>
          <NavLink
            className={({ isActive }) => `app-link${isActive ? " active" : ""}`}
            to="/admin/invoices"
          >
            Admin Invoices
          </NavLink>
          <NavLink
            className={({ isActive }) => `app-link${isActive ? " active" : ""}`}
            to="/staff/sales"
          >
            Staff Sales
          </NavLink>
          <NavLink
            className={({ isActive }) => `app-link${isActive ? " active" : ""}`}
            to="/view-invoices"
          >
            View History
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
        <Route path="/" element={<Navigate to="/admin/invoices" replace />} />
        <Route path="/admin/invoices" element={<AdminInvoices />} />
        <Route path="/staff/sales" element={<StaffSales />} />
        <Route path="/view-invoices" element={<ViewInvoices />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </Layout>
  );
}

export default AppRoutes;
