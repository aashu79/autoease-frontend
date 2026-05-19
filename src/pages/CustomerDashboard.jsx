import AppLayout from "../components/AppLayout";

const sections = [
  { key: "overview", label: "Overview", path: "/dashboard/customer/overview" },
  { key: "vehicles", label: "Vehicles", path: "/dashboard/customer/vehicles" },
  {
    key: "appointments",
    label: "Appointments",
    path: "/dashboard/customer/appointments",
  },
  // { key: "invoices", label: "Invoices", path: "/dashboard/customer/invoices" },
  {
    key: "feedback",
    label: "Requests & Reviews",
    path: "/dashboard/customer/feedback",
  },
  { key: "profile", label: "Profile", path: "/dashboard/customer/profile" },
];

function CustomerDashboard() {
  return <AppLayout title="Customer Dashboard" sections={sections} />;
}

export default CustomerDashboard;
