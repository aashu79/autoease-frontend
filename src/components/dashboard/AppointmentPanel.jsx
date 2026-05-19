import { zodResolver } from "@hookform/resolvers/zod";
import { Button, Col, InputNumber, Row, message } from "antd";
import { Controller, useForm } from "react-hook-form";
import FormError from "../form/FormError";
import DashboardSection from "./DashboardSection";
import { appointmentSchema, fieldStatus, toApiDate } from "../../utils/forms";

function AppointmentPanel({ onSubmit, loading }) {
  const {
    control,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(appointmentSchema),
    defaultValues: {
      VehicleId: null,
      StaffId: null,
      ScheduledAt: "",
    },
  });

  const submitForm = async (values) => {
    await onSubmit({
      ...values,
      ScheduledAt: toApiDate(values.ScheduledAt),
    });
    message.success("Appointment booked successfully.");
    reset();
  };

  return (
    <DashboardSection title="Book Appointment">
      <form onSubmit={handleSubmit(submitForm)}>
        <Row gutter={16}>
          <Col xs={24} md={8}>
            <label className="form-label">Vehicle ID</label>
            <Controller
              name="VehicleId"
              control={control}
              render={({ field }) => (
                <InputNumber
                  {...field}
                  className="w-full"
                  min={1}
                  size="large"
                  status={fieldStatus(errors.VehicleId)}
                />
              )}
            />
            <FormError message={errors.VehicleId?.message} />
          </Col>

          <Col xs={24} md={8}>
            <label className="form-label">Staff ID</label>
            <Controller
              name="StaffId"
              control={control}
              render={({ field }) => (
                <InputNumber
                  {...field}
                  className="w-full"
                  min={1}
                  size="large"
                  status={fieldStatus(errors.StaffId)}
                />
              )}
            />
            <FormError message={errors.StaffId?.message} />
          </Col>

          <Col xs={24} md={8}>
            <label className="form-label">Scheduled At</label>
            <Controller
              name="ScheduledAt"
              control={control}
              render={({ field }) => (
                <input {...field} type="datetime-local" className="app-native-input" />
              )}
            />
            <FormError message={errors.ScheduledAt?.message} />
          </Col>
        </Row>

        <Button type="primary" htmlType="submit" size="large" loading={loading} className="mt-4">
          Book appointment
        </Button>
      </form>
    </DashboardSection>
  );
}

export default AppointmentPanel;
