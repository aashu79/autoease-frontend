import { zodResolver } from "@hookform/resolvers/zod";
import {
  Button,
  Descriptions,
  Drawer,
  Empty,
  Input,
  List,
  Modal,
  Rate,
  Space,
  Spin,
  Table,
  Tabs,
  Tag,
  Typography,
  message,
} from "antd";
import { cloneElement, useEffect, useRef, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import {
  FiCalendar,
  FiTruck,
  FiDollarSign,
  FiEye,
  FiPackage,
  FiPlus,
  FiSearch,
  FiStar,
  FiUser,
} from "react-icons/fi";
import { staffCustomerService } from "../../api/services";
import DashboardSection from "../../components/dashboard/DashboardSection";
import FormError from "../../components/form/FormError";
import { apiMessage, listData } from "../../utils/api";
import { fieldStatus, staffCustomerSchema } from "../../utils/forms";

const { Text, Title } = Typography;

// ─── Status Color Maps ───────────────────────────────────────────────────────

const APPOINTMENT_STATUS_COLOR = {
  Pending: "orange",
  Confirmed: "blue",
  Completed: "green",
  Cancelled: "red",
};

const PAYMENT_STATUS_COLOR = {
  Pending: "orange",
  Paid: "green",
  Overdue: "red",
};

const PART_REQUEST_STATUS_COLOR = {
  Requested: "blue",
  Approved: "green",
  Rejected: "red",
  Fulfilled: "purple",
};

// ─── Section Header ──────────────────────────────────────────────────────────

function SectionHeader({ icon, label, count }) {
  return (
    <div className="mb-3 flex items-center gap-2">
      <span className="text-slate-500">{icon}</span>
      <Title level={5} className="!mb-0 !text-slate-700">
        {label}
        {count != null && (
          <span className="ml-2 rounded-full bg-slate-100 px-2 py-0.5 text-xs font-normal text-slate-500">
            {count}
          </span>
        )}
      </Title>
    </div>
  );
}

// ─── Customer Detail Drawer ──────────────────────────────────────────────────

function CustomerDetailDrawer({ open, onClose, customer, loading }) {
  const drawerTitle = customer ? (
    <div className="flex items-center gap-2">
      <div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-100">
        <FiUser className="text-blue-600" />
      </div>
      <div className="leading-tight">
        <div className="font-semibold">{customer.name}</div>
        <div className="text-xs font-normal text-slate-400">
          {customer.email}
        </div>
      </div>
    </div>
  ) : (
    "Customer Details"
  );

  return (
    <Drawer
      title={drawerTitle}
      open={open}
      onClose={onClose}
      width={680}
      extra={
        customer?.role ? (
          <Tag color="blue" className="!text-sm">
            {customer.role}
          </Tag>
        ) : null
      }
      styles={{ body: { paddingTop: 16 } }}
    >
      {loading ? (
        <div className="grid min-h-[300px] place-items-center">
          <Spin size="large" tip="Loading customer details…" />
        </div>
      ) : !customer ? (
        <Empty description="No customer data available." />
      ) : (
        <div className="space-y-8">
          {/* ── Customer Info ── */}
          <section>
            <SectionHeader icon={<FiUser />} label="Customer Info" />
            <Descriptions
              bordered
              size="small"
              column={1}
              className="[&_.ant-descriptions-item-label]:w-32 [&_.ant-descriptions-item-label]:font-medium"
              items={[
                {
                  key: "id",
                  label: "ID",
                  children: <Text code>#{customer.id}</Text>,
                },
                { key: "name", label: "Name", children: customer.name },
                {
                  key: "email",
                  label: "Email",
                  children: (
                    <a href={`mailto:${customer.email}`}>{customer.email}</a>
                  ),
                },
                {
                  key: "phone",
                  label: "Phone",
                  children: (
                    <a href={`tel:${customer.phone}`}>{customer.phone}</a>
                  ),
                },
                {
                  key: "role",
                  label: "Role",
                  children: <Tag color="blue">{customer.role}</Tag>,
                },
              ]}
            />
          </section>

          {/* ── Vehicles ── */}
          <section>
            <SectionHeader
              icon={<FiTruck />}
              label="Vehicles"
              count={customer.vehicles?.length ?? 0}
            />
            {customer.vehicles?.length ? (
              <List
                bordered
                size="small"
                dataSource={customer.vehicles}
                renderItem={(v) => (
                  <List.Item className="!px-4">
                    <div className="flex w-full items-center justify-between">
                      <Space>
                        <FiTruck className="text-slate-400" />
                        <Text strong>{v.model}</Text>
                      </Space>
                      <Tag className="!font-mono">{v.plateNumber}</Tag>
                    </div>
                  </List.Item>
                )}
              />
            ) : (
              <Empty
                image={Empty.PRESENTED_IMAGE_SIMPLE}
                description="No vehicles registered."
              />
            )}
          </section>

          {/* ── Appointments ── */}
          <section>
            <SectionHeader
              icon={<FiCalendar />}
              label="Appointments"
              count={customer.appointments?.length ?? 0}
            />
            {customer.appointments?.length ? (
              <Table
                size="small"
                rowKey="id"
                dataSource={customer.appointments}
                pagination={false}
                scroll={{ x: 480 }}
                columns={[
                  {
                    title: "ID",
                    dataIndex: "id",
                    width: 55,
                    render: (v) => <Text code>#{v}</Text>,
                  },
                  {
                    title: "Vehicle",
                    dataIndex: "vehicleModel",
                    ellipsis: true,
                  },
                  { title: "Staff", dataIndex: "staffName", ellipsis: true },
                  {
                    title: "Scheduled",
                    dataIndex: "scheduledAt",
                    render: (v) =>
                      v
                        ? new Date(v).toLocaleDateString(undefined, {
                            year: "numeric",
                            month: "short",
                            day: "numeric",
                          })
                        : "—",
                  },
                  {
                    title: "Status",
                    dataIndex: "status",
                    width: 100,
                    render: (status) => (
                      <Tag
                        color={APPOINTMENT_STATUS_COLOR[status] ?? "default"}
                      >
                        {status}
                      </Tag>
                    ),
                  },
                ]}
              />
            ) : (
              <Empty
                image={Empty.PRESENTED_IMAGE_SIMPLE}
                description="No appointments found."
              />
            )}
          </section>

          {/* ── Invoices ── */}
          <section>
            <SectionHeader
              icon={<FiDollarSign />}
              label="Invoices"
              count={customer.invoices?.length ?? 0}
            />
            {customer.invoices?.length ? (
              <Table
                size="small"
                rowKey="id"
                dataSource={customer.invoices}
                pagination={false}
                scroll={{ x: 520 }}
                columns={[
                  {
                    title: "ID",
                    dataIndex: "id",
                    width: 55,
                    render: (v) => <Text code>#{v}</Text>,
                  },
                  { title: "Vendor", dataIndex: "vendorName", ellipsis: true },
                  { title: "Staff", dataIndex: "staffName", ellipsis: true },
                  {
                    title: "Type",
                    dataIndex: "type",
                    width: 90,
                    render: (v) => <Tag>{v}</Tag>,
                  },
                  {
                    title: "Amount",
                    dataIndex: "totalAmount",
                    width: 100,
                    render: (v) =>
                      v != null ? (
                        <Text strong>Rs. {Number(v).toFixed(2)}</Text>
                      ) : (
                        "—"
                      ),
                  },
                  {
                    title: "Payment",
                    dataIndex: "paymentStatus",
                    width: 100,
                    render: (status) => (
                      <Tag color={PAYMENT_STATUS_COLOR[status] ?? "default"}>
                        {status}
                      </Tag>
                    ),
                  },
                ]}
              />
            ) : (
              <Empty
                image={Empty.PRESENTED_IMAGE_SIMPLE}
                description="No invoices found."
              />
            )}
          </section>

          {/* ── Part Requests ── */}
          <section>
            <SectionHeader
              icon={<FiPackage />}
              label="Part Requests"
              count={customer.partRequests?.length ?? 0}
            />
            {customer.partRequests?.length ? (
              <List
                bordered
                size="small"
                dataSource={customer.partRequests}
                renderItem={(p) => (
                  <List.Item className="!px-4">
                    <div className="flex w-full items-center justify-between">
                      <Space>
                        <FiPackage className="text-slate-400" />
                        <Text>{p.partName}</Text>
                      </Space>
                      <Tag
                        color={PART_REQUEST_STATUS_COLOR[p.status] ?? "default"}
                      >
                        {p.status}
                      </Tag>
                    </div>
                  </List.Item>
                )}
              />
            ) : (
              <Empty
                image={Empty.PRESENTED_IMAGE_SIMPLE}
                description="No part requests found."
              />
            )}
          </section>

          {/* ── Reviews ── */}
          <section>
            <SectionHeader
              icon={<FiStar />}
              label="Reviews"
              count={customer.reviews?.length ?? 0}
            />
            {customer.reviews?.length ? (
              <List
                bordered
                size="small"
                dataSource={customer.reviews}
                renderItem={(r) => (
                  <List.Item className="!px-4">
                    <div className="w-full space-y-1">
                      <Rate disabled value={r.rating} className="!text-base" />
                      {r.comment && (
                        <Text className="block text-slate-600 italic">
                          "{r.comment}"
                        </Text>
                      )}
                    </div>
                  </List.Item>
                )}
              />
            ) : (
              <Empty
                image={Empty.PRESENTED_IMAGE_SIMPLE}
                description="No reviews found."
              />
            )}
          </section>
        </div>
      )}
    </Drawer>
  );
}

// ─── Search Customers Panel ──────────────────────────────────────────────────

function SearchCustomersPanel({ refreshKey }) {
  const [query, setQuery] = useState("");
  const [allCustomers, setAllCustomers] = useState([]);
  const [results, setResults] = useState([]);
  const [searchLoading, setSearchLoading] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [detailLoading, setDetailLoading] = useState(false);

  // Load all customers initially
  const loadAllCustomers = async () => {
    try {
      setSearchLoading(true);
      // Trying search with empty query to get all customers, or fallback to fetching all if exists
      const response = await staffCustomerService.searchCustomers("");
      const data = listData(response);
      setAllCustomers(data);
      setResults(data);
    } catch (error) {
      // In case search("") fails, fallback or handle error
      message.error(apiMessage(error, "Failed to load customers."));
    } finally {
      setSearchLoading(false);
    }
  };

  useEffect(() => {
    void loadAllCustomers();
  }, [refreshKey]);

  useEffect(() => {
    if (!query.trim()) {
      setResults(allCustomers);
      return;
    }
    const lowerQuery = query.toLowerCase();
    const filtered = allCustomers.filter(
      (c) =>
        c.name?.toLowerCase().includes(lowerQuery) ||
        c.email?.toLowerCase().includes(lowerQuery) ||
        c.phone?.toLowerCase().includes(lowerQuery),
    );
    setResults(filtered);
  }, [query, allCustomers]);

  const handleViewCustomer = async (id) => {
    try {
      setSelectedCustomer(null);
      setDetailLoading(true);
      setDrawerOpen(true);
      const response = await staffCustomerService.getCustomer(id);
      setSelectedCustomer(response.data);
    } catch (error) {
      message.error(apiMessage(error, "Failed to load customer details."));
      setDrawerOpen(false);
    } finally {
      setDetailLoading(false);
    }
  };

  const columns = [
    {
      title: "ID",
      dataIndex: "id",
      width: 65,
      render: (v) => <Text code>#{v}</Text>,
    },
    {
      title: "Name",
      dataIndex: "name",
      render: (name) => (
        <Space>
          <div className="flex h-7 w-7 items-center justify-center rounded-full bg-blue-100">
            <FiUser className="text-sm text-blue-500" />
          </div>
          <Text strong>{name}</Text>
        </Space>
      ),
    },
    { title: "Email", dataIndex: "email", ellipsis: true },
    { title: "Phone", dataIndex: "phone", width: 140 },
    {
      title: "Vehicles",
      dataIndex: "vehicles",
      render: (vehicles) =>
        vehicles?.length ? (
          <Space size={4} wrap>
            {vehicles.map((v, i) => (
              <Tag key={i} icon={<FiTruck className="mr-1" />} color="geekblue">
                {v.model}
              </Tag>
            ))}
          </Space>
        ) : (
          <Text type="secondary">—</Text>
        ),
    },
    {
      title: "Action",
      width: 90,
      fixed: "right",
      render: (_, record) => (
        <Button
          size="small"
          type="primary"
          ghost
          icon={<FiEye />}
          onClick={() => handleViewCustomer(record.id)}
        >
          View
        </Button>
      ),
    },
  ];

  return (
    <>
      <div className="mb-5 flex flex-col gap-3 sm:flex-row">
        <Input
          size="large"
          placeholder="Search by name, email, or phone…"
          prefix={<FiSearch className="text-slate-400" />}
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="max-w-lg"
          allowClear
        />
      </div>

      <Table
        rowKey="id"
        dataSource={results}
        columns={columns}
        loading={searchLoading}
        pagination={{ pageSize: 8, showSizeChanger: true }}
        scroll={{ x: 740 }}
        locale={{
          emptyText: <Empty description="No customers match your search." />,
        }}
        onRow={(record) => ({
          className: "cursor-pointer",
          onDoubleClick: () => handleViewCustomer(record.id),
        })}
      />

      <CustomerDetailDrawer
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        customer={selectedCustomer}
        loading={detailLoading}
      />
    </>
  );
}

// ─── Create Customer Tab Content ─────────────────────────────────────────────

function AddCustomerTab({ onCreated }) {
  const [modalOpen, setModalOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  const {
    control,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(staffCustomerSchema),
    defaultValues: {
      name: "",
      email: "",
      password: "",
      phone: "",
      vehicleModel: "",
      plateNumber: "",
    },
  });

  const closeModal = () => {
    setModalOpen(false);
    reset();
  };

  const submitCustomer = async (values) => {
    try {
      setLoading(true);
      await staffCustomerService.createCustomer(values);
      message.success("Customer created successfully.");
      closeModal();
      onCreated?.();
    } catch (error) {
      message.error(apiMessage(error, "Failed to create customer."));
    } finally {
      setLoading(false);
    }
  };

  const customerFields = [
    {
      name: "name",
      label: "Full Name",
      element: <Input size="large" placeholder="e.g. Nabin Karki" />,
    },
    {
      name: "email",
      label: "Email Address",
      element: <Input size="large" placeholder="e.g. nabin@example.com" />,
    },
    {
      name: "phone",
      label: "Phone Number",
      element: <Input size="large" placeholder="e.g. 9811111111" />,
    },
    {
      name: "password",
      label: "Password",
      element: (
        <Input.Password size="large" placeholder="Minimum 6 characters" />
      ),
    },
  ];

  const vehicleFields = [
    {
      name: "vehicleModel",
      label: "Vehicle Model",
      element: <Input size="large" placeholder="e.g. Suzuki Swift" />,
    },
    {
      name: "plateNumber",
      label: "Plate Number",
      element: <Input size="large" placeholder="e.g. BA-6-CHA-4321" />,
    },
  ];

  return (
    <>
      {/* Prompt Card */}
      <div className="mx-auto flex max-w-md flex-col items-center justify-center py-16 text-center">
        <div className="mb-5 flex h-20 w-20 items-center justify-center rounded-full bg-blue-50">
          <FiUser className="text-4xl text-blue-400" />
        </div>
        <Title level={4} className="!mb-2">
          Register a New Customer
        </Title>
        <Text className="mb-8 block text-slate-500">
          Create a customer account and register their first vehicle in one
          step. The customer can log in with the credentials you provide.
        </Text>
        <div className="flex gap-3">
          <Button
            type="primary"
            size="large"
            icon={<FiPlus />}
            onClick={() => setModalOpen(true)}
          >
            Add Customer
          </Button>
        </div>
      </div>

      {/* Create Modal */}
      <Modal
        title={
          <div className="flex items-center gap-2">
            <div className="flex h-7 w-7 items-center justify-center rounded-full bg-blue-100">
              <FiPlus className="text-sm text-blue-600" />
            </div>
            <span>Add New Customer</span>
          </div>
        }
        open={modalOpen}
        onCancel={closeModal}
        footer={null}
        destroyOnHidden
        width={540}
        maskClosable={!loading}
      >
        <form
          onSubmit={handleSubmit(submitCustomer)}
          className="mt-5 space-y-4"
        >
          {/* Customer Info Block */}
          <div className="rounded-lg border border-slate-200 bg-slate-50 p-4">
            <div className="mb-3 flex items-center gap-2 text-slate-500">
              <FiUser className="text-sm" />
              <Text className="text-xs font-semibold uppercase tracking-widest text-slate-400">
                Customer Info
              </Text>
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              {customerFields.map(({ name, label, element }) => (
                <div
                  key={name}
                  className={name === "email" ? "sm:col-span-2" : ""}
                >
                  <label className="form-label">{label}</label>
                  <Controller
                    name={name}
                    control={control}
                    render={({ field }) =>
                      cloneElement(element, {
                        ...field,
                        status: fieldStatus(errors[name]),
                      })
                    }
                  />
                  <FormError message={errors[name]?.message} />
                </div>
              ))}
            </div>
          </div>

          {/* Vehicle Info Block */}
          <div className="rounded-lg border border-slate-200 bg-slate-50 p-4">
            <div className="mb-3 flex items-center gap-2 text-slate-500">
              <FiTruck className="text-sm" />
              <Text className="text-xs font-semibold uppercase tracking-widest text-slate-400">
                First Vehicle
              </Text>
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              {vehicleFields.map(({ name, label, element }) => (
                <div key={name}>
                  <label className="form-label">{label}</label>
                  <Controller
                    name={name}
                    control={control}
                    render={({ field }) =>
                      cloneElement(element, {
                        ...field,
                        status: fieldStatus(errors[name]),
                      })
                    }
                  />
                  <FormError message={errors[name]?.message} />
                </div>
              ))}
            </div>
          </div>

          <Button
            type="primary"
            htmlType="submit"
            size="large"
            loading={loading}
            icon={<FiPlus />}
            block
          >
            {loading ? "Creating Customer…" : "Create Customer"}
          </Button>
        </form>
      </Modal>
    </>
  );
}

// ─── Main Page ───────────────────────────────────────────────────────────────

export default function StaffCustomers() {
  const [activeTab, setActiveTab] = useState("search");
  const [searchRefreshKey, setSearchRefreshKey] = useState(0);

  const handleCustomerCreated = () => {
    // Switch back to search tab and trigger a refresh of any active query
    setActiveTab("search");
    setSearchRefreshKey((k) => k + 1);
  };

  const tabItems = [
    {
      key: "search",
      label: (
        <span className="flex items-center gap-2">
          <FiSearch />
          Search Customers
        </span>
      ),
      children: <SearchCustomersPanel refreshKey={searchRefreshKey} />,
    },
    {
      key: "create",
      label: (
        <span className="flex items-center gap-2">
          <FiPlus />
          Add Customer
        </span>
      ),
      children: <AddCustomerTab onCreated={handleCustomerCreated} />,
    },
  ];

  return (
    <DashboardSection
      title="Customer Management"
      subtitle="Search existing customers or register a new customer with their first vehicle."
      extra={
        <Button
          type="primary"
          icon={<FiPlus />}
          onClick={() => setActiveTab("create")}
          disabled={activeTab === "create"}
        >
          Add Customer
        </Button>
      }
    >
      <Tabs
        activeKey={activeTab}
        onChange={setActiveTab}
        items={tabItems}
        size="large"
        destroyInactiveTabPane={false}
      />
    </DashboardSection>
  );
}
