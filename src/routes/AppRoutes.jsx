import { Navigate, Route, Routes } from "react-router-dom";
import ProtectedRoute from "../components/ProtectedRoute";
import { useAuth } from "../hooks/useAuth";
import AdminDashboard from "../pages/AdminDashboard";
import AdminAppointments from "../pages/admin/AdminAppointments";
import AdminCustomers from "../pages/admin/AdminCustomers";
import AdminInvoice from "../pages/admin/AdminInvoice";
import AdminOverview from "../pages/admin/AdminOverview";
import AdminPartRequests from "../pages/admin/AdminPartRequests";
import AdminParts from "../pages/admin/AdminParts";
import AdminProfile from "../pages/admin/AdminProfile";
import AdminStaff from "../pages/admin/AdminStaff";
import AdminVendors from "../pages/admin/AdminVendors";
import CustomerDashboard from "../pages/CustomerDashboard";
import CustomerAppointment from "../pages/customer/CustomerAppointment";
import CustomerFeedback from "../pages/customer/CustomerFeedback";
import CustomerInvoices from "../pages/customer/CustomerInvoices";
import CustomerOverview from "../pages/customer/CustomerOverview";
import CustomerParts from "../pages/customer/CustomerParts";
import CustomerProfile from "../pages/customer/CustomerProfile";
import CustomerVehicles from "../pages/customer/CustomerVehicles";
import Home from "../pages/Home";
import Login from "../pages/Login";
import NotFound from "../pages/NotFound";
import Register from "../pages/Register";
import StaffDashboard from "../pages/StaffDashboard";
import StaffCustomers from "../pages/staff/StaffCustomers";
import StaffInvoice from "../pages/staff/StaffInvoice";
import StaffOverview from "../pages/staff/StaffOverview";
import StaffParts from "../pages/staff/StaffParts";
import StaffProfile from "../pages/staff/StaffProfile";
import StaffVendors from "../pages/staff/StaffVendors";
import { getDashboardPath } from "../utils/auth";

function DashboardRedirect() {
  const { user } = useAuth();

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return <Navigate to={getDashboardPath(user.Role)} replace />;
}

function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/dashboard" element={<DashboardRedirect />} />

      <Route
        path="/dashboard/customer"
        element={
          <ProtectedRoute allowedRoles={["Customer"]}>
            <CustomerDashboard />
          </ProtectedRoute>
        }
      >
        <Route index element={<Navigate to="overview" replace />} />
        <Route path="overview" element={<CustomerOverview />} />
        <Route path="vehicles" element={<CustomerVehicles />} />
        <Route path="appointments" element={<CustomerAppointment />} />
        <Route path="invoices" element={<CustomerInvoices />} />
        <Route path="parts" element={<CustomerParts />} />
        <Route path="feedback" element={<CustomerFeedback />} />
        <Route path="profile" element={<CustomerProfile />} />
      </Route>

      <Route
        path="/dashboard/staff"
        element={
          <ProtectedRoute allowedRoles={["Staff"]}>
            <StaffDashboard />
          </ProtectedRoute>
        }
      >
        <Route index element={<Navigate to="overview" replace />} />
        <Route path="overview" element={<StaffOverview />} />
        <Route path="customers" element={<StaffCustomers />} />
        <Route path="invoices" element={<StaffInvoice />} />
        <Route path="parts" element={<StaffParts />} />
        <Route path="vendors" element={<StaffVendors />} />
        <Route path="profile" element={<StaffProfile />} />
      </Route>

      <Route
        path="/dashboard/admin"
        element={
          <ProtectedRoute allowedRoles={["Admin"]}>
            <AdminDashboard />
          </ProtectedRoute>
        }
      >
        <Route index element={<Navigate to="overview" replace />} />
        <Route path="overview" element={<AdminOverview />} />
        <Route path="staff" element={<AdminStaff />} />
        <Route path="customers" element={<AdminCustomers />} />
        <Route path="appointments" element={<AdminAppointments />} />
        <Route path="invoices" element={<AdminInvoice />} />
        <Route path="parts" element={<AdminParts />} />
        <Route path="part-requests" element={<AdminPartRequests />} />
        <Route path="vendors" element={<AdminVendors />} />
        <Route path="profile" element={<AdminProfile />} />
      </Route>

      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}

export default AppRoutes;
