import { zodResolver } from "@hookform/resolvers/zod";
import {
  Button,
  Divider,
  Input,
  InputNumber,
  Modal,
  Popconfirm,
  Select,
  Space,
  Table,
  Tooltip,
  message,
} from "antd";
import { useEffect, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { FiEdit2, FiPackage, FiPlus, FiTrash2 } from "react-icons/fi";
import FormError from "../form/FormError";
import DashboardSection from "./DashboardSection";
import { fieldStatus, partSchema } from "../../utils/forms";

const DEFAULT_VALUES = {
  vendorId: null,
  name: "",
  unitPrice: 0,
  stockQuantity: 0,
};

function PartsPanel({
  parts = [],
  vendors = [],
  canEdit = false,
  onSavePart,
  onDeletePart,
  loading = false,
}) {
  const [modalOpen, setModalOpen] = useState(false);
  const [editingPart, setEditingPart] = useState(null);
  const [savingId, setSavingId] = useState(null);

  const {
    control,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(partSchema),
    defaultValues: DEFAULT_VALUES,
  });

  useEffect(() => {
    if (!modalOpen) return;
    reset({
      vendorId: editingPart?.vendorId ?? null,
      name: editingPart?.name ?? "",
      unitPrice: editingPart?.unitPrice ?? 0,
      stockQuantity: editingPart?.stockQuantity ?? 0,
    });
  }, [editingPart, modalOpen, reset]);

  const vendorMap = Object.fromEntries(vendors.map((v) => [v.id, v.name]));

  const openCreate = () => {
    setEditingPart(null);
    setModalOpen(true);
  };

  const openEdit = (part) => {
    setEditingPart(part);
    setModalOpen(true);
  };

  const closeModal = () => {
    setModalOpen(false);
    setEditingPart(null);
  };

  const submitPart = async (values) => {
    try {
      await onSavePart(editingPart?.id, values);
      message.success(
        editingPart ? "Part updated successfully." : "Part added successfully.",
      );
      closeModal();
    } catch {
      message.error("Something went wrong. Please try again.");
    }
  };

  const handleDelete = async (id) => {
    setSavingId(id);
    try {
      await onDeletePart(id);
      message.success("Part deleted successfully.");
    } catch {
      message.error("Could not delete part.");
    } finally {
      setSavingId(null);
    }
  };

  const columns = [
    {
      title: "ID",
      dataIndex: "id",
      width: 65,
      sorter: (a, b) => a.id - b.id,
    },
    {
      title: "Part Name",
      dataIndex: "name",
      sorter: (a, b) => a.name.localeCompare(b.name),
      render: (value) => (
        <Space>
          <FiPackage className="text-slate-400" />
          <span className="font-medium">{value}</span>
        </Space>
      ),
    },
    {
      title: "Vendor",
      dataIndex: "vendorId",
      width: 160,
      render: (vendorId) =>
        vendorMap[vendorId] ?? (
          <span className="text-slate-500">Vendor #{vendorId ?? "unknown"}</span>
        ),
    },
    {
      title: "Unit Price",
      dataIndex: "unitPrice",
      width: 120,
      align: "right",
      sorter: (a, b) => a.unitPrice - b.unitPrice,
      render: (value) => (
        <span className="font-mono font-medium">
          Rs. {Number(value ?? 0).toFixed(2)}
        </span>
      ),
    },
    {
      title: "Stock",
      dataIndex: "stockQuantity",
      width: 80,
      align: "center",
      sorter: (a, b) => a.stockQuantity - b.stockQuantity,
      render: (value) => (
        <span
          className={`font-semibold ${
            value === 0
              ? "text-red-500"
              : value < 5
                ? "text-amber-500"
                : "text-green-600"
          }`}
        >
          {value ?? 0}
        </span>
      ),
    },
    ...(canEdit
      ? [
          {
            title: "Actions",
            fixed: "right",
            width: 110,
            render: (_, record) => (
              <Space size="small">
                <Tooltip title="Edit part">
                  <Button
                    icon={<FiEdit2 />}
                    size="small"
                    onClick={() => openEdit(record)}
                  />
                </Tooltip>
                <Popconfirm
                  title="Delete part"
                  description="Are you sure you want to delete this part?"
                  okText="Yes, delete"
                  okButtonProps={{ danger: true }}
                  cancelText="Cancel"
                  onConfirm={() => handleDelete(record.id)}
                >
                  <Tooltip title="Delete part">
                    <Button
                      danger
                      size="small"
                      icon={<FiTrash2 />}
                      loading={savingId === record.id}
                    />
                  </Tooltip>
                </Popconfirm>
              </Space>
            ),
          },
        ]
      : []),
  ];

  return (
    <DashboardSection
      title="Parts Inventory"
      subtitle={`${parts.length} part${parts.length !== 1 ? "s" : ""} on record`}
      extra={
        canEdit ? (
          <Button type="primary" icon={<FiPlus />} onClick={openCreate}>
            Add Part
          </Button>
        ) : null
      }
    >
      <Table
        rowKey="id"
        dataSource={parts}
        columns={columns}
        loading={loading}
        pagination={{ pageSize: 8, showSizeChanger: false }}
        scroll={{ x: 800 }}
        size="middle"
        rowClassName="hover:bg-slate-50 transition-colors"
      />

      <Modal
        title={
          <Space>
            <FiPackage className="text-primary" />
            <span>{editingPart ? "Edit Part" : "Add New Part"}</span>
          </Space>
        }
        open={modalOpen}
        onCancel={closeModal}
        footer={null}
        destroyOnHidden
        width={560}
      >
        <Divider className="!mt-3 !mb-5" />

        <form
          onSubmit={handleSubmit(submitPart)}
          className="grid gap-4"
          noValidate
        >
          <div>
            <label className="form-label">Vendor</label>
            <Controller
              name="vendorId"
              control={control}
              render={({ field }) => (
                <Select
                  {...field}
                  className="w-full"
                  size="large"
                  placeholder="Select a vendor"
                  status={fieldStatus(errors.vendorId)}
                  options={vendors.map((v) => ({ label: v.name, value: v.id }))}
                  showSearch
                  optionFilterProp="label"
                  allowClear
                />
              )}
            />
            <FormError message={errors.vendorId?.message} />
          </div>

          <div>
            <label className="form-label">Part Name</label>
            <Controller
              name="name"
              control={control}
              render={({ field }) => (
                <Input
                  {...field}
                  size="large"
                  placeholder="e.g. Brake Pad, Oil Filter"
                  status={fieldStatus(errors.name)}
                />
              )}
            />
            <FormError message={errors.name?.message} />
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="form-label">Unit Price (Rs.)</label>
              <Controller
                name="unitPrice"
                control={control}
                render={({ field }) => (
                  <InputNumber
                    {...field}
                    className="w-full"
                    min={0}
                    step={0.01}
                    precision={2}
                    prefix="Rs."
                    size="large"
                    placeholder="0.00"
                    status={fieldStatus(errors.unitPrice)}
                  />
                )}
              />
              <FormError message={errors.unitPrice?.message} />
            </div>

            <div>
              <label className="form-label">Stock Quantity</label>
              <Controller
                name="stockQuantity"
                control={control}
                render={({ field }) => (
                  <InputNumber
                    {...field}
                    className="w-full"
                    min={0}
                    size="large"
                    placeholder="0"
                    status={fieldStatus(errors.stockQuantity)}
                  />
                )}
              />
              <FormError message={errors.stockQuantity?.message} />
            </div>
          </div>

          <Divider className="!my-1" />

          <Button
            type="primary"
            htmlType="submit"
            size="large"
            loading={isSubmitting}
            block
          >
            {editingPart ? "Update Part" : "Add Part"}
          </Button>
        </form>
      </Modal>
    </DashboardSection>
  );
}

export default PartsPanel;
