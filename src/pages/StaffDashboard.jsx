import AppLayout from "../components/AppLayout";

const sections = [
  { key: "overview", label: "Overview", path: "/dashboard/staff/overview" },
  { key: "customers", label: "Customers", path: "/dashboard/staff/customers" },
  { key: "invoice", label: "Invoices", path: "/dashboard/staff/invoices" },
  { key: "parts", label: "Parts", path: "/dashboard/staff/parts" },
  { key: "vendors", label: "Vendors", path: "/dashboard/staff/vendors" },
  { key: "profile", label: "Profile", path: "/dashboard/staff/profile" },
];

function StaffDashboard() {
  return <AppLayout title="Staff Dashboard" sections={sections} />;
}

export default StaffDashboard;
