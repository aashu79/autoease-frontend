import { Button, Modal, message, Table, Typography, Tag, Space } from "antd";
import { useState, useEffect } from "react";
import {
  appointmentService,
  vehicleService,
  adminService,
} from "../../api/services";
import { apiMessage } from "../../utils/api";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Select, Input } from "antd";
import FormError from "../../components/form/FormError";
import DashboardSection from "../../components/dashboard/DashboardSection";
import { fieldStatus, toApiDate } from "../../utils/forms";
import { FiPlus, FiCalendar } from "react-icons/fi";

const { Title, Text } = Typography;

const appointmentSchema = z.object({
  VehicleId: z.number({ required_error: "Please select a vehicle." }),
  StaffId: z.number({ required_error: "Please select a staff member." }),
  ScheduledAt: z.string().min(1, "Please select a date & time."),
});

function CustomerAppointment() {
  const [appointments, setAppointments] = useState([]);
  const [vehicles, setVehicles] = useState([]);
  const [staffList, setStaffList] = useState([]);
  const [loading, setLoading] = useState(false);
  const [fetchLoading, setFetchLoading] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);

  const {
    control,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(appointmentSchema),
    defaultValues: {
      VehicleId: undefined,
      StaffId: undefined,
      ScheduledAt: "",
    },
  });

  const fetchData = async () => {
    try {
      setFetchLoading(true);
      const [apptRes, vehRes, staffRes] = await Promise.all([
        appointmentService.getMyAppointments(),
        vehicleService.getVehicles(),
        adminService.getUsersByRole("staff"),
      ]);
      setAppointments(apptRes.data || []);
      setVehicles(vehRes.data || []);
      setStaffList(staffRes.data || []);
    } catch (error) {
      message.error(apiMessage(error, "Failed to load data."));
    } finally {
      setFetchLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const bookAppointment = async (values) => {
    try {
      setLoading(true);
      await appointmentService.bookAppointment({
        ...values,
        ScheduledAt: toApiDate(values.ScheduledAt),
      });
      message.success("Appointment booked successfully.");
      setModalOpen(false);
      reset();
      fetchData();
    } catch (error) {
      message.error(apiMessage(error, "Failed to book appointment."));
    } finally {
      setLoading(false);
    }
  };

  const columns = [
    {
      title: "ID",
      dataIndex: "id",
      key: "id",
    },
    {
      title: "Date & Time",
      dataIndex: "scheduledAt",
      key: "scheduledAt",
      render: (val) => new Date(val).toLocaleString(),
    },
    {
      title: "Status",
      dataIndex: "status",
      key: "status",
      render: (status) => (
        <Tag
          color={
            status === "Pending"
              ? "orange"
              : status === "Confirmed"
                ? "green"
                : "red"
          }
        >
          {status}
        </Tag>
      ),
    },
  ];

  return (
    <DashboardSection title="My Appointments">
      <div className="flex justify-between items-center mb-6">
        <div>
          <Title level={4} className="!mb-1">
            Bookings
          </Title>
          <Text type="secondary">Manage your service appointments</Text>
        </div>
        <Button
          type="primary"
          icon={<FiPlus />}
          onClick={() => setModalOpen(true)}
          size="large"
        >
          Book Appointment
        </Button>
      </div>

      <Table
        dataSource={appointments}
        columns={columns}
        rowKey="id"
        loading={fetchLoading}
        bordered
        className="bg-white rounded-lg shadow-sm"
      />

      <Modal
        title={
          <div className="flex items-center gap-2">
            <FiCalendar className="text-teal-600" />
            <span>Book New Appointment</span>
          </div>
        }
        open={modalOpen}
        onCancel={() => {
          setModalOpen(false);
          reset();
        }}
        footer={null}
        destroyOnClose
      >
        <form
          onSubmit={handleSubmit(bookAppointment)}
          className="mt-4 flex flex-col gap-4"
        >
          <div>
            <label className="form-label block mb-1">Select Vehicle</label>
            <Controller
              name="VehicleId"
              control={control}
              render={({ field }) => (
                <Select
                  {...field}
                  className="w-full"
                  size="large"
                  placeholder="Choose your vehicle"
                  status={fieldStatus(errors.VehicleId)}
                  options={vehicles.map((v) => ({
                    label: `${v.model} (${v.plateNumber})`,
                    value: v.id,
                  }))}
                />
              )}
            />
            <FormError message={errors.VehicleId?.message} />
          </div>

          <div>
            <label className="form-label block mb-1">
              Select Staff / Mechanic
            </label>
            <Controller
              name="StaffId"
              control={control}
              render={({ field }) => (
                <Select
                  {...field}
                  className="w-full"
                  size="large"
                  placeholder="Choose available staff"
                  status={fieldStatus(errors.StaffId)}
                  options={staffList.map((s) => ({
                    label: s.name || s.Name,
                    value: s.id || s.Id,
                  }))}
                />
              )}
            />
            <FormError message={errors.StaffId?.message} />
          </div>

          <div>
            <label className="form-label block mb-1">
              Scheduled Date & Time
            </label>
            <Controller
              name="ScheduledAt"
              control={control}
              render={({ field }) => (
                <input
                  {...field}
                  type="datetime-local"
                  className={`app-native-input w-full p-2 border rounded-md ${errors.ScheduledAt ? "border-red-500" : "border-gray-300"}`}
                />
              )}
            />
            <FormError message={errors.ScheduledAt?.message} />
          </div>

          <div className="flex justify-end gap-2 mt-4 pt-4 border-t border-gray-100">
            <Button onClick={() => setModalOpen(false)}>Cancel</Button>
            <Button type="primary" htmlType="submit" loading={loading}>
              Confirm Booking
            </Button>
          </div>
        </form>
      </Modal>
    </DashboardSection>
  );
}

export default CustomerAppointment;
