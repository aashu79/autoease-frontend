import { zodResolver } from "@hookform/resolvers/zod";
import {
  Button,
  Col,
  Input,
  InputNumber,
  Modal,
  Row,
  Space,
  message,
} from "antd";
import { useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { FiFileText, FiPlus } from "react-icons/fi";
import FormError from "../form/FormError";
import { fieldStatus, invoiceSchema, toApiDate } from "../../utils/forms";

function InvoicePanel({ onSubmit, loading }) {
  const [open, setOpen] = useState(false);
  const {
    control,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(invoiceSchema),
    defaultValues: {
      customerId: null,
      vendorId: null,
      type: "",
      dueDate: "",
      partId: null,
      quantity: null,
      unitPrice: null,
    },
  });

  const submitForm = async (values) => {
    let finalUnitPrice = values.unitPrice;
    const totalAmount = values.quantity * values.unitPrice;
    let applyDiscount = false;

    if (totalAmount > 5000) {
      finalUnitPrice = values.unitPrice * 0.9;
      applyDiscount = true;
    }

    await onSubmit({
      CustomerId: values.customerId,
      VendorId: values.vendorId,
      Type: values.type,
      DueDate: toApiDate(values.dueDate),
      Items: [
        {
          PartId: values.partId,
          Quantity: values.quantity,
          UnitPrice: finalUnitPrice,
        },
      ],
    });

    if (applyDiscount) {
      message.success(
        "Invoice created successfully with a 10% discount applied!",
      );
    } else {
      message.success("Invoice created successfully.");
    }

    reset();
    setOpen(false);
  };

  const closeModal = () => {
    if (loading) {
      return;
    }

    reset();
    setOpen(false);
  };

  return (
    <>
      <Button type="primary" icon={<FiPlus />} onClick={() => setOpen(true)}>
        Create invoice
      </Button>

      <Modal
        title={
          <Space>
            <FiFileText />
            Create Invoice
          </Space>
        }
        open={open}
        onCancel={closeModal}
        footer={null}
        width={860}
        maskClosable={!loading}
      >
        <form onSubmit={handleSubmit(submitForm)} className="pt-2">
          <Row gutter={[16, 16]}>
            <Col xs={24} md={8}>
              <label className="form-label">Customer ID</label>
              <Controller
                name="customerId"
                control={control}
                render={({ field }) => (
                  <InputNumber
                    {...field}
                    className="w-full"
                    min={1}
                    size="large"
                    status={fieldStatus(errors.customerId)}
                  />
                )}
              />
              <FormError message={errors.customerId?.message} />
            </Col>

            <Col xs={24} md={8}>
              <label className="form-label">Vendor ID</label>
              <Controller
                name="vendorId"
                control={control}
                render={({ field }) => (
                  <InputNumber
                    {...field}
                    className="w-full"
                    min={1}
                    size="large"
                    status={fieldStatus(errors.vendorId)}
                  />
                )}
              />
              <FormError message={errors.vendorId?.message} />
            </Col>

            <Col xs={24} md={8}>
              <label className="form-label">Invoice Type</label>
              <Controller
                name="type"
                control={control}
                render={({ field }) => (
                  <Input
                    {...field}
                    placeholder="Service"
                    size="large"
                    status={fieldStatus(errors.type)}
                  />
                )}
              />
              <FormError message={errors.type?.message} />
            </Col>

            <Col xs={24} md={8}>
              <label className="form-label">Due Date</label>
              <Controller
                name="dueDate"
                control={control}
                render={({ field }) => (
                  <input
                    {...field}
                    type="datetime-local"
                    className="app-native-input"
                  />
                )}
              />
              <FormError message={errors.dueDate?.message} />
            </Col>

            <Col xs={24} md={8}>
              <label className="form-label">Part ID</label>
              <Controller
                name="partId"
                control={control}
                render={({ field }) => (
                  <InputNumber
                    {...field}
                    className="w-full"
                    min={1}
                    size="large"
                    status={fieldStatus(errors.partId)}
                  />
                )}
              />
              <FormError message={errors.partId?.message} />
            </Col>

            <Col xs={24} md={8}>
              <label className="form-label">Quantity</label>
              <Controller
                name="quantity"
                control={control}
                render={({ field }) => (
                  <InputNumber
                    {...field}
                    className="w-full"
                    min={1}
                    size="large"
                    status={fieldStatus(errors.quantity)}
                  />
                )}
              />
              <FormError message={errors.quantity?.message} />
            </Col>

            <Col xs={24} md={8}>
              <label className="form-label">Unit Price</label>
              <Controller
                name="unitPrice"
                control={control}
                render={({ field }) => (
                  <InputNumber
                    {...field}
                    className="w-full"
                    min={0}
                    step={0.01}
                    size="large"
                    status={fieldStatus(errors.unitPrice)}
                  />
                )}
              />
              <FormError message={errors.unitPrice?.message} />
            </Col>
          </Row>

          <div className="mt-6 flex justify-end gap-3">
            <Button onClick={closeModal} disabled={loading}>
              Cancel
            </Button>
            <Button type="primary" htmlType="submit" loading={loading}>
              Create invoice
            </Button>
          </div>
        </form>
      </Modal>
    </>
  );
}

export default InvoicePanel;
