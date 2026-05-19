import { zodResolver } from "@hookform/resolvers/zod";
import {
  Button,
  Divider,
  Empty,
  Input,
  Modal,
  Space,
  Table,
  Tag,
  Typography,
  message,
} from "antd";
import { useEffect, useState, useMemo } from "react";
import { Controller, useForm } from "react-hook-form";
import {
  FiLock,
  FiMail,
  FiPhone,
  FiPlus,
  FiRefreshCw,
  FiUser,
  FiSearch,
} from "react-icons/fi";
import { adminService, authService } from "../../api/services";
import DashboardSection from "../../components/dashboard/DashboardSection";
import FormError from "../../components/form/FormError";
import { apiMessage, listData } from "../../utils/api";
import { fieldStatus, staffSchema } from "../../utils/forms";

const { Text } = Typography;
const DEFAULT_VALUES = { name: "", email: "", password: "", phone: "" };

function AdminCustomers() {
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [query, setQuery] = useState("");

  const {
    control,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(staffSchema),
    defaultValues: DEFAULT_VALUES,
  });

  const loadCustomers = async () => {
    try {
      setLoading(true);
      const response = await adminService.getUsersByRole("customer");
      setCustomers(listData(response));
    } catch (error) {
      message.error(apiMessage(error, "Failed to load customers."));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadCustomers();
  }, []);

  const closeModal = () => {
    setModalOpen(false);
    reset(DEFAULT_VALUES);
  };

  const createCustomer = async (values) => {
    try {
      await authService.adminRegisterUser({ ...values, role: "customer" });
      message.success("Customer created successfully.");
      closeModal();
      await loadCustomers();
    } catch (error) {
      message.error(apiMessage(error, "Failed to create customer."));
    }
  };

  const filteredCustomers = useMemo(() => {
    if (!query.trim()) return customers;
    const lowerQuery = query.toLowerCase();
    return customers.filter(
      (c) =>
        c.name?.toLowerCase().includes(lowerQuery) ||
        c.email?.toLowerCase().includes(lowerQuery) ||
        c.phone?.toLowerCase().includes(lowerQuery),
    );
  }, [customers, query]);

  const columns = [
    {
      title: "ID",
      dataIndex: "id",
      width: 70,
      render: (value) => <Text code>#{value}</Text>,
    },
    {
      title: "Name",
      dataIndex: "name",
      render: (value) => (
        <Space>
          <FiUser className="text-slate-400" />
          <span className="font-medium">{value}</span>
        </Space>
      ),
    },
    {
      title: "Email",
      dataIndex: "email",
      ellipsis: true,
      render: (value) => <a href={`mailto:${value}`}>{value}</a>,
    },
    {
      title: "Phone",
      dataIndex: "phone",
      width: 150,
      render: (value) =>
        value ? (
          <a href={`tel:${value}`}>{value}</a>
        ) : (
          <Text type="secondary">-</Text>
        ),
    },
    {
      title: "Role",
      dataIndex: "role",
      width: 120,
      render: (value) => <Tag color="blue">{value ?? "customer"}</Tag>,
    },
  ];

  return (
    <DashboardSection
      title="Customers"
      subtitle="Customer users fetched by role."
      extra={
        <Space wrap>
          <Button
            type="primary"
            icon={<FiPlus />}
            onClick={() => setModalOpen(true)}
          >
            Add Customer
          </Button>
          <Button
            icon={<FiRefreshCw />}
            loading={loading}
            onClick={loadCustomers}
          >
            Refresh
          </Button>
        </Space>
      }
    >
      <div className="mb-4">
        <Input
          size="middle"
          placeholder="Search by name, email, or phone…"
          prefix={<FiSearch className="text-slate-400" />}
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="max-w-sm"
          allowClear
        />
      </div>

      <Table
        rowKey="id"
        dataSource={filteredCustomers}
        columns={columns}
        loading={loading}
        scroll={{ x: 720 }}
        pagination={{ pageSize: 10, showSizeChanger: true }}
        locale={{
          emptyText: (
            <Empty
              image={Empty.PRESENTED_IMAGE_SIMPLE}
              description="No customers found."
            />
          ),
        }}
      />

      <Modal
        title={
          <Space>
            <FiUser className="text-primary" />
            <span>Add New Customer</span>
          </Space>
        }
        open={modalOpen}
        onCancel={closeModal}
        footer={null}
        destroyOnHidden
        width={480}
      >
        <Divider className="!mt-3 !mb-5" />

        <form
          onSubmit={handleSubmit(createCustomer)}
          className="grid gap-4"
          noValidate
        >
          <div>
            <label className="form-label">Full Name</label>
            <Controller
              name="name"
              control={control}
              render={({ field }) => (
                <Input
                  {...field}
                  size="large"
                  placeholder="Aayush Sharma"
                  status={fieldStatus(errors.name)}
                  prefix={<FiUser className="text-slate-400" />}
                />
              )}
            />
            <FormError message={errors.name?.message} />
          </div>

          <div>
            <label className="form-label">Email Address</label>
            <Controller
              name="email"
              control={control}
              render={({ field }) => (
                <Input
                  {...field}
                  type="email"
                  size="large"
                  placeholder="aayush@example.com"
                  status={fieldStatus(errors.email)}
                  prefix={<FiMail className="text-slate-400" />}
                />
              )}
            />
            <FormError message={errors.email?.message} />
          </div>

          <div>
            <label className="form-label">Phone</label>
            <Controller
              name="phone"
              control={control}
              render={({ field }) => (
                <Input
                  {...field}
                  size="large"
                  placeholder="9800000000"
                  status={fieldStatus(errors.phone)}
                  prefix={<FiPhone className="text-slate-400" />}
                />
              )}
            />
            <FormError message={errors.phone?.message} />
          </div>

          <div>
            <label className="form-label">Password</label>
            <Controller
              name="password"
              control={control}
              render={({ field }) => (
                <Input.Password
                  {...field}
                  size="large"
                  placeholder="Min. 6 characters"
                  status={fieldStatus(errors.password)}
                  prefix={<FiLock className="text-slate-400" />}
                />
              )}
            />
            <FormError message={errors.password?.message} />
          </div>

          <Divider className="!my-1" />

          <Button
            type="primary"
            htmlType="submit"
            size="large"
            loading={isSubmitting}
            icon={<FiPlus />}
            block
          >
            Create Customer
          </Button>
        </form>
      </Modal>
    </DashboardSection>
  );
}

export default AdminCustomers;
