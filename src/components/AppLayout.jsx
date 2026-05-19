import { Avatar, Button, Layout, Menu, Space, Tag, Typography } from "antd";
import { useMemo } from "react";
import {
  FiBox,
  FiCalendar,
  FiFileText,
  FiHome,
  FiLogOut,
  FiMessageSquare,
  FiSettings,
  FiShield,
  FiTool,
  FiTruck,
  FiUsers,
} from "react-icons/fi";
import { Link, Outlet, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";

const { Content } = Layout;
const { Text, Title } = Typography;

function iconFor(itemKey) {
  const iconMap = {
    overview: <FiHome />,
    appointments: <FiCalendar />,
    appointment: <FiCalendar />,
    vehicles: <FiTruck />,
    invoices: <FiFileText />,
    invoice: <FiFileText />,
    parts: <FiBox />,
    "part-requests": <FiMessageSquare />,
    vendors: <FiTruck />,
    staff: <FiUsers />,
    customers: <FiUsers />,
    feedback: <FiMessageSquare />,
    profile: <FiSettings />,
  };

  return iconMap[itemKey] || <FiHome />;
}

function AppLayout({ title, sections }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const menuItems = useMemo(
    () =>
      sections.map((section) => ({
        key: section.path,
        icon: iconFor(section.key),
        label: section.label,
      })),
    [sections],
  );

  const activeSection = useMemo(() => {
    const current = sections.find(
      (section) => location.pathname === section.path,
    );
    return current?.path || sections[0]?.path;
  }, [location.pathname, sections]);

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  return (
    <Layout className="min-h-screen bg-[#f4f6f8]">
      <Layout.Sider
        breakpoint="lg"
        collapsedWidth="0"
        theme="light"
        width={260}
        className="dashboard-sidebar border-r border-slate-200"
      >
        <Link to="/" className="dashboard-brand flex items-center gap-2 p-6">
          <span className="brand-mark text-teal-600 text-2xl">
            <FiTool />
          </span>
          <span className="flex flex-col">
            <strong className="text-xl leading-none text-slate-800">
              AutoEase
            </strong>
            <small className="text-xs text-slate-500">Service desk</small>
          </span>
        </Link>

        <Menu
          mode="inline"
          selectedKeys={[activeSection]}
          items={menuItems}
          onClick={({ key }) => navigate(key)}
          className="dashboard-menu border-r-0 px-3"
        />

        <div className="dashboard-user absolute bottom-0 left-0 right-0 p-6 bg-white border-t border-slate-100">
          <div className="flex items-center gap-3 mb-4">
            <Avatar size={42} className="bg-teal-700">
              {(user?.name || user?.Name || "U")[0]}
            </Avatar>
            <div className="min-w-0">
              <p className="truncate font-semibold text-slate-950">
                {user?.name || user?.Name || "User"}
              </p>
              <p className="truncate text-xs text-slate-500">
                {user?.email || user?.Email || "Signed in"}
              </p>
            </div>
          </div>

          <Button
            block
            icon={<FiLogOut />}
            onClick={handleLogout}
            type="default"
            danger
          >
            Logout
          </Button>
        </div>
      </Layout.Sider>

      <Layout className="min-w-0 bg-transparent flex-1">
        <header className="dashboard-header">
          <div>
            <Text className="text-xs font-semibold uppercase tracking-wider text-teal-700">
              AutoEase
            </Text>
            <Title level={3} className="!mb-0 !font-display !text-slate-950">
              {title}
            </Title>
          </div>

          <Space wrap>
            <Tag color="cyan" className="px-3 py-1">
              <span className="inline-flex items-center gap-2">
                <FiShield />
                {user?.role || user?.Role || "User"}
              </span>
            </Tag>
          </Space>
        </header>

        <Content className="p-4 md:p-6 xl:p-8">
          <div className="mx-auto max-w-7xl">
            <Outlet />
          </div>
        </Content>
      </Layout>
    </Layout>
  );
}

export default AppLayout;
