import { zodResolver } from "@hookform/resolvers/zod";
import {
  Button,
  Col,
  Empty,
  Modal,
  Popconfirm,
  Row,
  Space,
  Table,
  Tag,
  Tooltip,
  message,
} from "antd";
import { Input } from "antd";
import { useEffect, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { FiEdit2, FiPlus, FiTrash2, FiTruck } from "react-icons/fi";
import { vehicleService } from "../../api/services";
import DashboardSection from "../../components/dashboard/DashboardSection";
import FormError from "../../components/form/FormError";
import { fieldStatus, vehicleSchema } from "../../utils/forms";
import { apiMessage, listData } from "../../utils/api";

function CustomerVehicles() {
  const [vehicles, setVehicles] = useState([]);
  const [fetchLoading, setFetchLoading] = useState(false);
  const [saveLoading, setSaveLoading] = useState(false);
  const [deleteLoadingId, setDeleteLoadingId] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingVehicle, setEditingVehicle] = useState(null);

  const {
    control,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(vehicleSchema),
    defaultValues: { model: "", plateNumber: "" },
  });

  const fetchVehicles = async () => {
    try {
      setFetchLoading(true);
      const res = await vehicleService.getVehicles();
      setVehicles(listData(res));
    } catch (err) {
      message.error(apiMessage(err, "Failed to load vehicles."));
    } finally {
      setFetchLoading(false);
    }
  };

  useEffect(() => {
    fetchVehicles();
  }, []);

  useEffect(() => {
    if (!modalOpen) return;
    reset({
      model: editingVehicle?.model ?? "",
      plateNumber: editingVehicle?.plateNumber ?? "",
    });
  }, [editingVehicle, modalOpen, reset]);

  const openCreate = () => {
    setEditingVehicle(null);
    setModalOpen(true);
  };

  const openEdit = (vehicle) => {
    setEditingVehicle(vehicle);
    setModalOpen(true);
  };

  const closeModal = () => {
    setModalOpen(false);
    setEditingVehicle(null);
    reset({ model: "", plateNumber: "" });
  };

  const onSubmit = async (values) => {
    try {
      setSaveLoading(true);
      if (editingVehicle) {
        await vehicleService.updateVehicle(editingVehicle.id, values);
        message.success("Vehicle updated successfully.");
      } else {
        await vehicleService.createVehicle(values);
        message.success("Vehicle added successfully.");
      }
      closeModal();
      fetchVehicles();
    } catch (err) {
      message.error(apiMessage(err, "Failed to save vehicle."));
    } finally {
      setSaveLoading(false);
    }
  };

  const onDelete = async (id) => {
    try {
      setDeleteLoadingId(id);
      await vehicleService.deleteVehicle(id);
      message.success("Vehicle deleted successfully.");
      setVehicles((prev) => prev.filter((v) => v.id !== id));
    } catch (err) {
      message.error(apiMessage(err, "Failed to delete vehicle."));
    } finally {
      setDeleteLoadingId(null);
    }
  };

  const columns = [
    {
      title: "ID",
      dataIndex: "id",
      key: "id",
      width: 70,
      render: (val) => (
        <span className="font-mono text-slate-400 text-xs">#{val}</span>
      ),
    },
    {
      title: "Model",
      dataIndex: "model",
      key: "model",
      render: (val) => (
        <Space>
          <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-teal-50 text-teal-600">
            <FiTruck size={15} />
          </span>
          <span className="font-semibold text-slate-700">{val}</span>
        </Space>
      ),
    },
    {
      title: "Plate Number",
      dataIndex: "plateNumber",
      key: "plateNumber",
      render: (val) => (
        <Tag className="!rounded-md !border-slate-200 !bg-slate-50 !px-3 !py-0.5 !font-mono !text-sm !font-semibold !text-slate-600">
          {val}
        </Tag>
      ),
    },
    {
      title: "Actions",
      key: "actions",
      fixed: "right",
      width: 120,
      render: (_, record) => (
        <Space>
          <Tooltip title="Edit vehicle">
            <Button
              size="small"
              icon={<FiEdit2 size={14} />}
              onClick={() => openEdit(record)}
              className="!border-teal-200 !text-teal-600 hover:!border-teal-400 hover:!bg-teal-50"
            />
          </Tooltip>
          <Popconfirm
            title="Delete vehicle"
            description="Are you sure you want to delete this vehicle? This action cannot be undone."
            onConfirm={() => onDelete(record.id)}
            okText="Delete"
            okButtonProps={{ danger: true }}
            cancelText="Cancel"
            placement="topRight"
          >
            <Tooltip title="Delete vehicle">
              <Button
                size="small"
                danger
                icon={<FiTrash2 size={14} />}
                loading={deleteLoadingId === record.id}
              />
            </Tooltip>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <DashboardSection
      title="My Vehicles"
      subtitle="Manage the vehicles registered to your account"
      extra={
        <Button
          type="primary"
          icon={<FiPlus />}
          onClick={openCreate}
          size="large"
          className="!bg-teal-600 hover:!bg-teal-700"
        >
          Add Vehicle
        </Button>
      }
    >
      <Table
        rowKey="id"
        dataSource={vehicles}
        columns={columns}
        loading={fetchLoading}
        pagination={{ pageSize: 8, showSizeChanger: false }}
        scroll={{ x: 560 }}
        locale={{
          emptyText: (
            <Empty
              image={Empty.PRESENTED_IMAGE_SIMPLE}
              description={
                <span className="text-slate-400">
                  No vehicles yet.{" "}
                  <button
                    type="button"
                    className="cursor-pointer font-semibold text-teal-600 underline-offset-2 hover:underline"
                    onClick={openCreate}
                  >
                    Add your first vehicle
                  </button>
                </span>
              }
            />
          ),
        }}
        className="[&_.ant-table-thead_.ant-table-cell]:bg-slate-50 [&_.ant-table-thead_.ant-table-cell]:font-semibold [&_.ant-table-thead_.ant-table-cell]:text-slate-600"
      />

      <Modal
        title={
          <div className="flex items-center gap-2.5">
            <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-teal-50 text-teal-600">
              <FiTruck size={18} />
            </span>
            <div>
              <div className="font-display text-base font-semibold text-slate-800">
                {editingVehicle ? "Edit Vehicle" : "Add New Vehicle"}
              </div>
              <div className="text-xs font-normal text-slate-400">
                {editingVehicle
                  ? "Update your vehicle details"
                  : "Register a new vehicle to your account"}
              </div>
            </div>
          </div>
        }
        open={modalOpen}
        onCancel={closeModal}
        footer={null}
        destroyOnHidden
        width={480}
      >
        <form
          onSubmit={handleSubmit(onSubmit)}
          className="mt-5 flex flex-col gap-5"
        >
          <Row gutter={16}>
            <Col xs={24} sm={12}>
              <div>
                <label className="form-label">
                  Vehicle Model <span className="text-red-400">*</span>
                </label>
                <Controller
                  name="model"
                  control={control}
                  render={({ field }) => (
                    <Input
                      {...field}
                      size="large"
                      placeholder="e.g. Toyota Corolla"
                      status={fieldStatus(errors.model)}
                      prefix={<FiTruck className="text-slate-300" />}
                    />
                  )}
                />
                <FormError message={errors.model?.message} />
              </div>
            </Col>

            <Col xs={24} sm={12}>
              <div>
                <label className="form-label">
                  Plate Number <span className="text-red-400">*</span>
                </label>
                <Controller
                  name="plateNumber"
                  control={control}
                  render={({ field }) => (
                    <Input
                      {...field}
                      size="large"
                      placeholder="e.g. BAG-1234"
                      status={fieldStatus(errors.plateNumber)}
                      className="!font-mono !uppercase"
                      onChange={(e) =>
                        field.onChange(e.target.value.toUpperCase())
                      }
                    />
                  )}
                />
                <FormError message={errors.plateNumber?.message} />
              </div>
            </Col>
          </Row>

          <div className="flex justify-end gap-2 border-t border-slate-100 pt-4">
            <Button onClick={closeModal} size="large">
              Cancel
            </Button>
            <Button
              type="primary"
              htmlType="submit"
              size="large"
              loading={saveLoading}
              className="!bg-teal-600 hover:!bg-teal-700"
            >
              {editingVehicle ? "Save Changes" : "Add Vehicle"}
            </Button>
          </div>
        </form>
      </Modal>
    </DashboardSection>
  );
}

export default CustomerVehicles;
