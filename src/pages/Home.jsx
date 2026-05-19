import { Button, Card, Col, Layout, Row, Space, Typography } from "antd";
import { FiArrowRight, FiCalendar, FiFileText, FiShield, FiTool, FiTruck } from "react-icons/fi";
import { Link } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import { getDashboardPath } from "../utils/auth";

const { Header, Content, Footer } = Layout;
const { Paragraph, Title, Text } = Typography;

const features = [
  {
    title: "Appointments",
    description: "Customers can book service visits with their vehicle and preferred staff details.",
    icon: <FiCalendar />,
  },
  {
    title: "Invoices",
    description: "Staff and admins can create service invoices with part line items.",
    icon: <FiFileText />,
  },
  {
    title: "Management",
    description: "Admins can manage staff, roles, vendors, inventory, and profile details.",
    icon: <FiShield />,
  },
];

function Home() {
  const { isAuthenticated, user } = useAuth();
  const dashboardPath = getDashboardPath(user?.Role);

  return (
    <Layout className="min-h-screen bg-slate-100">
      <Header className="border-b border-slate-200 bg-white px-4 md:px-8">
        <div className="mx-auto flex h-full max-w-7xl items-center justify-between">
          <Link to="/" className="font-display text-2xl font-bold tracking-tight text-slate-900">
            GarageHub
          </Link>

          <Space wrap>
            {isAuthenticated ? (
              <Link to={dashboardPath}>
                <Button type="primary" size="large">
                  Open Dashboard
                </Button>
              </Link>
            ) : (
              <>
                <Link to="/login">
                  <Button size="large">Login</Button>
                </Link>
                <Link to="/register">
                  <Button type="primary" size="large">
                    Get Started
                  </Button>
                </Link>
              </>
            )}
          </Space>
        </div>
      </Header>

      <Content className="px-4 py-10 md:px-8 md:py-16">
        <div className="mx-auto max-w-7xl">
          <Row gutter={[32, 32]} align="middle">
            <Col xs={24} lg={13}>
              <Space direction="vertical" size={18} className="w-full">
                <Title className="!mb-0 !font-display !text-5xl !leading-tight !text-slate-950 md:!text-6xl">
                  Garage service management made simple.
                </Title>
                <Paragraph className="!mb-0 max-w-2xl !text-lg !text-slate-600">
                  Customers, staff, and admins each get a focused dashboard for the work they need
                  to do.
                </Paragraph>

                <Space wrap size={12}>
                  <Link to={isAuthenticated ? dashboardPath : "/register"}>
                    <Button type="primary" size="large" icon={<FiArrowRight />}>
                      {isAuthenticated ? "Continue" : "Create account"}
                    </Button>
                  </Link>
                  <Link to="/login">
                    <Button size="large">Login</Button>
                  </Link>
                </Space>
              </Space>
            </Col>

            <Col xs={24} lg={11}>
              <div className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="rounded-lg bg-slate-50 p-5">
                    <FiTool className="mb-4 text-3xl text-teal-700" />
                    <p className="text-sm text-slate-500">Parts</p>
                    <h3 className="mt-2 font-display text-2xl font-semibold">Inventory</h3>
                  </div>
                  <div className="rounded-lg bg-slate-50 p-5">
                    <FiTruck className="mb-4 text-3xl text-cyan-700" />
                    <p className="text-sm text-slate-500">Vendors</p>
                    <h3 className="mt-2 font-display text-2xl font-semibold">Suppliers</h3>
                  </div>
                  <div className="rounded-lg bg-slate-50 p-5 md:col-span-2">
                    <FiFileText className="mb-4 text-3xl text-emerald-700" />
                    <p className="text-sm text-slate-500">Service</p>
                    <h3 className="mt-2 font-display text-2xl font-semibold">
                      Appointments and invoices
                    </h3>
                  </div>
                </div>
              </div>
            </Col>
          </Row>

          <div className="mt-10 grid gap-6 lg:grid-cols-3">
            {features.map((feature) => (
              <Card key={feature.title} className="!rounded-lg shadow-sm">
                <div className="mb-4 inline-flex rounded-lg bg-slate-100 p-3 text-2xl text-slate-900">
                  {feature.icon}
                </div>
                <Title level={4} className="!font-display">
                  {feature.title}
                </Title>
                <Text className="text-slate-600">{feature.description}</Text>
              </Card>
            ))}
          </div>
        </div>
      </Content>

      <Footer className="bg-transparent text-center text-slate-500">GarageHub</Footer>
    </Layout>
  );
}

export default Home;
