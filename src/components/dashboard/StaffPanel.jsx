import { zodResolver } from "@hookform/resolvers/zod";
import {
  Button,
  Divider,
  Input,
  Modal,
  Popconfirm,
  Select,
  Space,
  Table,
  Tag,
  Tooltip,
  Typography,
  message,
} from "antd";
import { useState } from "react";
import { Controller, useForm } from "react-hook-form";
import {
  FiAlertCircle,
  FiLock,
  FiMail,
  FiPhone,
  FiPlus,
  FiTrash2,
  FiUser,
  FiUsers,
} from "react-icons/fi";
import FormError from "../form/FormError";
import DashboardSection from "./DashboardSection";
import { fieldStatus, staffSchema } from "../../utils/forms";

const { Text } = Typography;

// ─── Constants ────────────────────────────────────────────────────────────────

const ROLE_OPTIONS = [
  { label: "Admin", value: "admin" },
  { label: "Staff", value: "staff" },
  { label: "Customer", value: "customer" },
];

const ROLE_TAG_COLOR = {
  admin: "volcano",
  staff: "blue",
  customer: "green",
};

const DEFAULT_VALUES = { name: "", email: "", password: "", phone: "" };

// ─── Component ────────────────────────────────────────────────────────────────

function StaffPanel({
  staff = [],
  onCreateStaff,
  onUpdateRole,
  onDeleteStaff,
  loading = false,
}) {
  const [modalOpen, setModalOpen] = useState(false);
  const [deletingId, setDeletingId] = useState(null);
  const [updatingRoleId, setUpdatingRoleId] = useState(null);

  const {
    control,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(staffSchema),
    defaultValues: DEFAULT_VALUES,
  });

  // ── Handlers ───────────────────────────────────────────────────────────────

  const openModal = () => setModalOpen(true);

  const closeModal = () => {
    setModalOpen(false);
    reset(DEFAULT_VALUES);
  };

  const submitStaff = async (values) => {
    try {
      await onCreateStaff(values);
      message.success("Staff member created successfully.");
      closeModal();
    } catch {
      message.error("Could not create staff member. Please try again.");
    }
  };

  const handleRoleChange = async (id, role) => {
    setUpdatingRoleId(id);
    try {
      await onUpdateRole(id, { role });
      message.success("Role updated successfully.");
    } catch {
      message.error("Could not update role.");
    } finally {
      setUpdatingRoleId(null);
    }
  };

  const handleDelete = async (id) => {
    setDeletingId(id);
    try {
      await onDeleteStaff(id);
      message.success("Staff member removed successfully.");
    } catch {
      message.error("Could not delete staff member.");
    } finally {
      setDeletingId(null);
    }
  };

  // ── Table columns ──────────────────────────────────────────────────────────

  const columns = [
    {
      title: "ID",
      dataIndex: "id",
      width: 65,
      sorter: (a, b) => a.id - b.id,
    },
    {
      title: "Name",
      dataIndex: "name",
      sorter: (a, b) => a.name.localeCompare(b.name),
      render: (value) => (
        <Space>
          <FiUser className="text-slate-400" />
          <Text strong>{value}</Text>
        </Space>
      ),
    },
    {
      title: "Email",
      dataIndex: "email",
      render: (value) => (
        <Space className="text-slate-600">
          <FiMail size={13} />
          <span>{value}</span>
        </Space>
      ),
    },
    {
      title: "Phone",
      dataIndex: "phone",
      render: (value) => (
        <Space className="text-slate-600">
          <FiPhone size={13} />
          <span>{value}</span>
        </Space>
      ),
    },
    {
      title: "Current Role",
      dataIndex: "role",
      width: 120,
      filters: ROLE_OPTIONS.map(({ label, value }) => ({ text: label, value })),
      onFilter: (value, record) =>
        String(record.role ?? "").toLowerCase() === value,
      render: (value) => {
        const normalized = String(value ?? "").toLowerCase();
        return (
          <Tag color={ROLE_TAG_COLOR[normalized] ?? "default"}>
            {value ?? "—"}
          </Tag>
        );
      },
    },
    {
      title: "Change Role",
      width: 160,
      render: (_, record) => (
        <Select
          value={String(record.role ?? "").toLowerCase()}
          options={ROLE_OPTIONS}
          style={{ minWidth: 140 }}
          loading={updatingRoleId === record.id}
          disabled={updatingRoleId === record.id}
          onChange={(value) => handleRoleChange(record.id, value)}
        />
      ),
    },
    {
      title: "Actions",
      width: 90,
      align: "center",
      render: (_, record) => (
        <Popconfirm
          title="Remove staff member"
          description={
            <span>
              Remove <strong>{record.name}</strong> from the system?
            </span>
          }
          okText="Yes, remove"
          okButtonProps={{ danger: true }}
          cancelText="Cancel"
          icon={<FiAlertCircle className="text-red-500" />}
          onConfirm={() => handleDelete(record.id)}
        >
          <Tooltip title="Delete staff member">
            <Button
              danger
              size="small"
              icon={<FiTrash2 />}
              loading={deletingId === record.id}
            />
          </Tooltip>
        </Popconfirm>
      ),
    },
  ];

  // ── Render ─────────────────────────────────────────────────────────────────

  return (
    <DashboardSection
      title="Staff Management"
      subtitle={`${staff.length} staff member${staff.length !== 1 ? "s" : ""}`}
      extra={
        <Button type="primary" icon={<FiPlus />} onClick={openModal}>
          Add Staff
        </Button>
      }
    >
      <Table
        rowKey="id"
        dataSource={staff}
        columns={columns}
        loading={loading}
        pagination={{ pageSize: 8, showSizeChanger: false }}
        scroll={{ x: 900 }}
        size="middle"
        rowClassName="hover:bg-slate-50 transition-colors"
      />

      {/* ── Add Staff Modal ────────────────────────────────────────────────── */}
      <Modal
        title={
          <Space>
            <FiUsers className="text-primary" />
            <span>Add New Staff Member</span>
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
          onSubmit={handleSubmit(submitStaff)}
          className="grid gap-4"
          noValidate
        >
          {/* Name */}
          <div>
            <label className="form-label">Full Name</label>
            <Controller
              name="name"
              control={control}
              render={({ field }) => (
                <Input
                  {...field}
                  size="large"
                  placeholder="Jane Doe"
                  status={fieldStatus(errors.name)}
                  prefix={<FiUser className="text-slate-400" />}
                />
              )}
            />
            <FormError message={errors.name?.message} />
          </div>

          {/* Email */}
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
                  placeholder="jane@autoease.com"
                  status={fieldStatus(errors.email)}
                  prefix={<FiMail className="text-slate-400" />}
                />
              )}
            />
            <FormError message={errors.email?.message} />
          </div>

          {/* Phone */}
          <div>
            <label className="form-label">Phone</label>
            <Controller
              name="phone"
              control={control}
              render={({ field }) => (
                <Input
                  {...field}
                  size="large"
                  placeholder="+94 77 123 4567"
                  status={fieldStatus(errors.phone)}
                  prefix={<FiPhone className="text-slate-400" />}
                />
              )}
            />
            <FormError message={errors.phone?.message} />
          </div>

          {/* Password */}
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
            icon={<FiUsers />}
            block
          >
            Create Staff Member
          </Button>
        </form>
      </Modal>
    </DashboardSection>
  );
}

export default StaffPanel;
