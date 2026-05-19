import AppLayout from "../components/AppLayout";

const sections = [
  { key: "overview", label: "Overview", path: "/dashboard/admin/overview" },
  { key: "staff", label: "Staff", path: "/dashboard/admin/staff" },
  { key: "customers", label: "Customers", path: "/dashboard/admin/customers" },
  { key: "appointments", label: "Appointments", path: "/dashboard/admin/appointments" },
  { key: "invoice", label: "Invoices", path: "/dashboard/admin/invoices" },
  { key: "parts", label: "Parts", path: "/dashboard/admin/parts" },
  { key: "part-requests", label: "Part Requests", path: "/dashboard/admin/part-requests" },
  { key: "vendors", label: "Vendors", path: "/dashboard/admin/vendors" },
  { key: "profile", label: "Profile", path: "/dashboard/admin/profile" },
];

function AdminDashboard() {
  return <AppLayout title="Admin Dashboard" sections={sections} />;
}

export default AdminDashboard;
