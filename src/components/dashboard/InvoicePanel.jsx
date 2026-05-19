import { zodResolver } from "@hookform/resolvers/zod";
import { Button, Col, Input, InputNumber, Row, message } from "antd";
import { Controller, useForm } from "react-hook-form";
import FormError from "../form/FormError";
import DashboardSection from "./DashboardSection";
import { fieldStatus, invoiceSchema, toApiDate } from "../../utils/forms";

function InvoicePanel({ onSubmit, loading }) {
  const {
    control,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(invoiceSchema),
    defaultValues: {
      VendorId: null,
      StaffId: null,
      Type: "",
      DueDate: "",
      PartId: null,
      Quantity: null,
      UnitPrice: null,
    },
  });

  const submitForm = async (values) => {
    await onSubmit({
      VendorId: values.VendorId,
      StaffId: values.StaffId,
      Type: values.Type,
      DueDate: toApiDate(values.DueDate),
      Items: [
        {
          PartId: values.PartId,
          Quantity: values.Quantity,
          UnitPrice: values.UnitPrice,
        },
      ],
    });

    message.success("Invoice created successfully.");
    reset();
  };

  return (
    <DashboardSection title="Create Invoice">
      <form onSubmit={handleSubmit(submitForm)}>
        <Row gutter={16}>
          <Col xs={24} md={8}>
            <label className="form-label">Vendor ID</label>
            <Controller
              name="VendorId"
              control={control}
              render={({ field }) => (
                <InputNumber
                  {...field}
                  className="w-full"
                  min={1}
                  size="large"
                  status={fieldStatus(errors.VendorId)}
                />
              )}
            />
            <FormError message={errors.VendorId?.message} />
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
            <label className="form-label">Invoice Type</label>
            <Controller
              name="Type"
              control={control}
              render={({ field }) => (
                <Input
                  {...field}
                  placeholder="Service"
                  size="large"
                  status={fieldStatus(errors.Type)}
                />
              )}
            />
            <FormError message={errors.Type?.message} />
          </Col>
        </Row>

        <Row gutter={16} className="mt-4">
          <Col xs={24} md={8}>
            <label className="form-label">Due Date</label>
            <Controller
              name="DueDate"
              control={control}
              render={({ field }) => (
                <input
                  {...field}
                  type="datetime-local"
                  className="app-native-input"
                />
              )}
            />
            <FormError message={errors.DueDate?.message} />
          </Col>

          <Col xs={24} md={8}>
            <label className="form-label">Part ID</label>
            <Controller
              name="PartId"
              control={control}
              render={({ field }) => (
                <InputNumber
                  {...field}
                  className="w-full"
                  min={1}
                  size="large"
                  status={fieldStatus(errors.PartId)}
                />
              )}
            />
            <FormError message={errors.PartId?.message} />
          </Col>

          <Col xs={24} md={8}>
            <label className="form-label">Quantity</label>
            <Controller
              name="Quantity"
              control={control}
              render={({ field }) => (
                <InputNumber
                  {...field}
                  className="w-full"
                  min={1}
                  size="large"
                  status={fieldStatus(errors.Quantity)}
                />
              )}
            />
            <FormError message={errors.Quantity?.message} />
          </Col>
        </Row>

        <Row gutter={16} className="mt-4">
          <Col xs={24} md={8}>
            <label className="form-label">Unit Price</label>
            <Controller
              name="UnitPrice"
              control={control}
              render={({ field }) => (
                <InputNumber
                  {...field}
                  className="w-full"
                  min={0}
                  step={0.01}
                  size="large"
                  status={fieldStatus(errors.UnitPrice)}
                />
              )}
            />
            <FormError message={errors.UnitPrice?.message} />
          </Col>
        </Row>

        <Button
          type="primary"
          htmlType="submit"
          size="large"
          loading={loading}
          className="mt-4"
        >
          Create invoice
        </Button>
      </form>
    </DashboardSection>
  );
}

export default InvoicePanel;
