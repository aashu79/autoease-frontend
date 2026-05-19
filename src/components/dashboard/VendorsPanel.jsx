import { zodResolver } from "@hookform/resolvers/zod";
import {
  Button,
  Divider,
  Input,
  Modal,
  Popconfirm,
  Space,
  Table,
  Tooltip,
  Typography,
  message,
} from "antd";
import { useEffect, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import {
  FiEdit2,
  FiPhone,
  FiPlus,
  FiShoppingBag,
  FiTrash2,
} from "react-icons/fi";
import FormError from "../form/FormError";
import DashboardSection from "./DashboardSection";
import { fieldStatus, vendorSchema } from "../../utils/forms";

const { Text } = Typography;

const DEFAULT_VALUES = { name: "", phone: "" };

function VendorsPanel({
  vendors = [],
  canEdit = false,
  onSaveVendor,
  onDeleteVendor,
  loading = false,
}) {
  const [modalOpen, setModalOpen] = useState(false);
  const [editingVendor, setEditingVendor] = useState(null);
  const [deletingId, setDeletingId] = useState(null);

  const {
    control,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(vendorSchema),
    defaultValues: DEFAULT_VALUES,
  });

  // Sync form values when the modal opens or the target changes
  useEffect(() => {
    if (!modalOpen) return;
    reset({
      name: editingVendor?.name ?? "",
      phone: editingVendor?.phone ?? "",
    });
  }, [editingVendor, modalOpen, reset]);

  const openCreate = () => {
    setEditingVendor(null);
    setModalOpen(true);
  };

  const openEdit = (vendor) => {
    setEditingVendor(vendor);
    setModalOpen(true);
  };

  const closeModal = () => {
    setModalOpen(false);
    setEditingVendor(null);
  };

  const submitVendor = async (values) => {
    try {
      await onSaveVendor(editingVendor?.id ?? undefined, values);
      message.success(
        editingVendor
          ? "Vendor updated successfully."
          : "Vendor added successfully.",
      );
      closeModal();
    } catch {
      message.error("Could not save vendor. Please try again.");
    }
  };

  const handleDelete = async (id) => {
    setDeletingId(id);
    try {
      await onDeleteVendor(id);
      message.success("Vendor deleted successfully.");
    } catch {
      message.error("Could not delete vendor.");
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
      title: "Vendor Name",
      dataIndex: "name",
      sorter: (a, b) => a.name.localeCompare(b.name),
      render: (value) => (
        <Space>
          <FiShoppingBag className="text-slate-400" />
          <Text strong>{value}</Text>
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
    ...(canEdit
      ? [
          {
            title: "Actions",
            width: 120,
            align: "center",
            render: (_, record) => (
              <Space size="small">
                <Tooltip title="Edit vendor">
                  <Button
                    size="small"
                    icon={<FiEdit2 />}
                    onClick={() => openEdit(record)}
                  />
                </Tooltip>
                <Popconfirm
                  title="Delete vendor"
                  description="This will permanently remove the vendor."
                  okText="Yes, delete"
                  okButtonProps={{ danger: true }}
                  cancelText="Cancel"
                  onConfirm={() => handleDelete(record.id)}
                >
                  <Tooltip title="Delete vendor">
                    <Button
                      danger
                      size="small"
                      icon={<FiTrash2 />}
                      loading={deletingId === record.id}
                    />
                  </Tooltip>
                </Popconfirm>
              </Space>
            ),
          },
        ]
      : []),
  ];

  // ── Render ─────────────────────────────────────────────────────────────────

  return (
    <DashboardSection
      title="Vendors"
      subtitle={`${vendors.length} vendor${vendors.length !== 1 ? "s" : ""} registered`}
      extra={
        canEdit ? (
          <Button type="primary" icon={<FiPlus />} onClick={openCreate}>
            Add Vendor
          </Button>
        ) : null
      }
    >
      <Table
        rowKey="id"
        dataSource={vendors}
        columns={columns}
        loading={loading}
        pagination={{ pageSize: 8, showSizeChanger: false }}
        size="middle"
        rowClassName="hover:bg-slate-50 transition-colors"
      />

      {/* ── Add / Edit Modal ─────────────────────────────────────────────── */}
      <Modal
        title={
          <Space>
            <FiShoppingBag className="text-primary" />
            <span>{editingVendor ? "Edit Vendor" : "Add New Vendor"}</span>
          </Space>
        }
        open={modalOpen}
        onCancel={closeModal}
        footer={null}
        destroyOnHidden
        width={440}
      >
        <Divider className="!mt-3 !mb-5" />

        <form
          onSubmit={handleSubmit(submitVendor)}
          className="grid gap-4"
          noValidate
        >
          {/* Vendor Name */}
          <div>
            <label className="form-label">Vendor Name</label>
            <Controller
              name="name"
              control={control}
              render={({ field }) => (
                <Input
                  {...field}
                  size="large"
                  placeholder="e.g. AutoParts Co."
                  status={fieldStatus(errors.name)}
                  prefix={<FiShoppingBag className="text-slate-400" />}
                />
              )}
            />
            <FormError message={errors.name?.message} />
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
                  placeholder="e.g. +94 77 123 4567"
                  status={fieldStatus(errors.phone)}
                  prefix={<FiPhone className="text-slate-400" />}
                />
              )}
            />
            <FormError message={errors.phone?.message} />
          </div>

          <Divider className="!my-1" />

          <Button
            type="primary"
            htmlType="submit"
            size="large"
            loading={isSubmitting}
            block
          >
            {editingVendor ? "Update Vendor" : "Add Vendor"}
          </Button>
        </form>
      </Modal>
    </DashboardSection>
  );
}

export default VendorsPanel;
