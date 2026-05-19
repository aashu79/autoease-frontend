import { zodResolver } from "@hookform/resolvers/zod";
import {
  Alert,
  Button,
  Col,
  Divider,
  Empty,
  InputNumber,
  Row,
  Select,
  Space,
  Spin,
  Table,
  Tabs,
  Tag,
  Tooltip,
  Typography,
  message,
} from "antd";
import { useEffect, useState } from "react";
import { Controller, useFieldArray, useForm } from "react-hook-form";
import {
  FiFileText,
  FiList,
  FiMail,
  FiMinus,
  FiPlus,
  FiRefreshCw,
} from "react-icons/fi";
import { z } from "zod";
import { adminService, invoiceService, partsService } from "../../api/services";
import DashboardSection from "../../components/dashboard/DashboardSection";
import FormError from "../../components/form/FormError";
import { apiMessage, listData } from "../../utils/api";
import { fieldStatus, toApiDate } from "../../utils/forms";

const { Text, Title } = Typography;

const PAYMENT_STATUS_COLOR = {
  Pending: "orange",
  Paid: "green",
  Overdue: "red",
};

function formatMoney(value) {
  return `Rs. ${Number(value || 0).toFixed(2)}`;
}

function formatDateTime(value) {
  return value ? new Date(value).toLocaleString() : "-";
}

function paymentStatus(value) {
  return value?.trim() || "Pending";
}

function customerLabel(customer, customerId) {
  if (!customer) {
    return customerId ? `Customer #${customerId}` : "-";
  }

  return customer.name ?? customer.email ?? `Customer #${customer.id}`;
}

export function ExpandedInvoiceItems({ record }) {
  const items = record?.invoiceItems ?? record?.items ?? [];

  if (!items.length) {
    return (
      <div className="px-6 py-4">
        <Text type="secondary">No item details available for this invoice.</Text>
      </div>
    );
  }

  const itemColumns = [
    {
      title: "Item ID",
      dataIndex: "id",
      width: 100,
      render: (value) =>
        value != null ? <Text code>#{value}</Text> : <Text type="secondary">-</Text>,
    },
    {
      title: "Invoice ID",
      dataIndex: "invoiceId",
      width: 120,
      render: (value) =>
        value != null ? <Text code>#{value}</Text> : <Text type="secondary">-</Text>,
    },
    {
      title: "Part ID",
      dataIndex: "partId",
      width: 120,
      render: (value) =>
        value != null ? <Text code>#{value}</Text> : <Text type="secondary">-</Text>,
    },
    {
      title: "Quantity",
      dataIndex: "quantity",
      width: 120,
      render: (value) => <Tag color="blue">x {value ?? 0}</Tag>,
    },
  ];

  return (
    <div className="bg-slate-50 px-6 py-4">
      <Text className="mb-3 block text-xs font-semibold uppercase tracking-wide text-slate-400">
        Invoice Items
      </Text>
      <Table
        size="small"
        dataSource={items}
        rowKey={(item, index) => item.id ?? `${item.partId}-${index}`}
        pagination={false}
        columns={itemColumns}
      />
    </div>
  );
}

export function AllInvoicesTab({ canSendEmail = false }) {
  const [invoices, setInvoices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [sendingId, setSendingId] = useState(null);

  const loadInvoices = async () => {
    try {
      setLoading(true);
      const response = await invoiceService.getAllInvoices();
      setInvoices(listData(response));
    } catch (error) {
      message.error(apiMessage(error, "Failed to load invoices."));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadInvoices();
  }, []);

  const sendInvoiceEmail = async (id) => {
    try {
      setSendingId(id);
      const response = await invoiceService.sendSalesInvoiceEmail(id);
      message.success(
        response?.data?.message ?? "Invoice email sent successfully.",
      );
    } catch (error) {
      message.error(apiMessage(error, "Failed to send invoice email."));
    } finally {
      setSendingId(null);
    }
  };

  const columns = [
    {
      title: "Invoice",
      dataIndex: "id",
      width: 90,
      fixed: "left",
      render: (value) => <Text code>#{value}</Text>,
    },
    {
      title: "Customer",
      key: "customer",
      width: 240,
      render: (_, record) => (
        <div className="leading-tight">
          <Text strong>{customerLabel(record.customer, record.customerId)}</Text>
          <div className="mt-1 text-xs text-slate-500">
            ID #{record.customerId ?? record.customer?.id ?? "-"}
          </div>
          {record.customer?.email && (
            <a className="block text-xs" href={`mailto:${record.customer.email}`}>
              {record.customer.email}
            </a>
          )}
          {record.customer?.phoneNumber && (
            <a className="block text-xs" href={`tel:${record.customer.phoneNumber}`}>
              {record.customer.phoneNumber}
            </a>
          )}
        </div>
      ),
    },
    {
      title: "Customer Role",
      key: "customerRole",
      width: 130,
      render: (_, record) => (
        <Tag color="geekblue">{record.customer?.role ?? "-"}</Tag>
      ),
    },
    {
      title: "Vendor ID",
      dataIndex: "vendorId",
      width: 110,
      render: (value) =>
        value != null ? <Text code>#{value}</Text> : <Text type="secondary">-</Text>,
    },
    {
      title: "Type",
      dataIndex: "type",
      width: 110,
      filters: [
        { text: "Sales", value: "Sales" },
        { text: "Purchase", value: "Purchase" },
      ],
      onFilter: (value, record) => record.type === value,
      render: (value) => (
        <Tag color={String(value).toLowerCase() === "sales" ? "green" : "purple"}>
          {value ?? "-"}
        </Tag>
      ),
    },
    {
      title: "Total",
      dataIndex: "totalAmount",
      width: 130,
      align: "right",
      render: (value) => (
        <Text strong className="text-emerald-700">
          {formatMoney(value)}
        </Text>
      ),
      sorter: (a, b) => Number(a.totalAmount || 0) - Number(b.totalAmount || 0),
    },
    {
      title: "Discount",
      dataIndex: "discountApplied",
      width: 130,
      align: "right",
      render: (value) =>
        Number(value) > 0 ? (
          <Text type="success">{formatMoney(value)}</Text>
        ) : (
          <Text type="secondary">{formatMoney(0)}</Text>
        ),
    },
    {
      title: "Payment",
      dataIndex: "paymentStatus",
      width: 130,
      render: (value) => {
        const status = paymentStatus(value);
        return <Tag color={PAYMENT_STATUS_COLOR[status] ?? "default"}>{status}</Tag>;
      },
    },
    {
      title: "Invoice Date",
      dataIndex: "invoiceDate",
      width: 190,
      render: (value) => (
        <Tooltip title={value}>
          <span>{formatDateTime(value)}</span>
        </Tooltip>
      ),
      sorter: (a, b) => new Date(a.invoiceDate || 0) - new Date(b.invoiceDate || 0),
    },
    {
      title: "Due Date",
      dataIndex: "dueDate",
      width: 190,
      render: (value) => (
        <Tooltip title={value}>
          <span>{formatDateTime(value)}</span>
        </Tooltip>
      ),
      sorter: (a, b) => new Date(a.dueDate || 0) - new Date(b.dueDate || 0),
    },
    {
      title: "Items",
      key: "itemCount",
      width: 90,
      align: "center",
      render: (_, record) => (
        <Tag>{(record.invoiceItems ?? record.items ?? []).length}</Tag>
      ),
    },
  ];

  if (canSendEmail) {
    columns.push({
      title: "Email",
      fixed: "right",
      width: 120,
      render: (_, record) => {
        const isSalesInvoice = String(record.type ?? "").toLowerCase() === "sales";

        return (
          <Tooltip
            title={
              isSalesInvoice
                ? "Send sales invoice email"
                : "Email is available for sales invoices"
            }
          >
            <Button
              size="small"
              icon={<FiMail />}
              disabled={!isSalesInvoice}
              loading={sendingId === record.id}
              onClick={() => sendInvoiceEmail(record.id)}
            >
              Send
            </Button>
          </Tooltip>
        );
      },
    });
  }

  return (
    <DashboardSection
      title="Invoices"
      subtitle="Complete invoice details with customer and line item records."
      extra={
        <Button icon={<FiRefreshCw />} onClick={loadInvoices} loading={loading}>
          Refresh
        </Button>
      }
    >
      <Table
        rowKey="id"
        dataSource={invoices}
        columns={columns}
        loading={loading}
        scroll={{ x: canSendEmail ? 1660 : 1540 }}
        pagination={{
          pageSize: 10,
          showSizeChanger: true,
          pageSizeOptions: ["10", "20", "50"],
        }}
        expandable={{
          expandedRowRender: (record) => <ExpandedInvoiceItems record={record} />,
          rowExpandable: (record) =>
            (record?.invoiceItems?.length ?? record?.items?.length ?? 0) > 0,
        }}
        locale={{ emptyText: <Empty description="No invoices found." /> }}
        className="[&_.ant-table-thead_.ant-table-cell]:!bg-slate-50"
      />
    </DashboardSection>
  );
}

const salesInvoiceSchema = z.object({
  customerId: z.coerce.number().min(1, "Customer is required."),
  totalAmount: z.coerce.number().min(0, "Total amount is required."),
  dueDate: z.string().min(1, "Due date is required."),
  invoiceItems: z
    .array(
      z.object({
        partId: z.coerce.number().min(1, "Part is required."),
        quantity: z.coerce.number().min(1, "Quantity must be at least 1."),
      }),
    )
    .min(1, "At least one item is required."),
});

function DynamicItemRows({
  fields,
  control,
  errors,
  remove,
  parts,
  fieldName,
  disabled = false,
}) {
  return (
    <div className="space-y-3">
      {fields.map((field, index) => (
        <div
          key={field.id}
          className="rounded-lg border border-slate-200 bg-slate-50 p-4"
        >
          <Row gutter={[12, 12]} align="bottom">
            <Col xs={24} md={18}>
              <label className="form-label">Part</label>
              <Controller
                name={`${fieldName}.${index}.partId`}
                control={control}
                render={({ field: itemField }) => (
                  <Select
                    {...itemField}
                    className="w-full"
                    size="large"
                    placeholder="Select a part"
                    showSearch
                    optionFilterProp="label"
                    status={fieldStatus(errors?.[fieldName]?.[index]?.partId)}
                    disabled={disabled}
                    options={parts.map((part) => ({
                      value: part.id,
                      label: `${part.name} - Rs.${part.unitPrice} (Stock: ${part.stockQuantity ?? "-"})`,
                    }))}
                  />
                )}
              />
              <FormError message={errors?.[fieldName]?.[index]?.partId?.message} />
            </Col>

            <Col xs={18} md={4}>
              <label className="form-label">Quantity</label>
              <Controller
                name={`${fieldName}.${index}.quantity`}
                control={control}
                render={({ field: itemField }) => (
                  <InputNumber
                    {...itemField}
                    className="w-full"
                    size="large"
                    min={1}
                    status={fieldStatus(errors?.[fieldName]?.[index]?.quantity)}
                    disabled={disabled}
                  />
                )}
              />
              <FormError message={errors?.[fieldName]?.[index]?.quantity?.message} />
            </Col>

            <Col xs={6} md={2}>
              <Tooltip
                title={
                  fields.length === 1
                    ? "At least one item is required"
                    : "Remove item"
                }
              >
                <Button
                  danger
                  type="text"
                  icon={<FiMinus />}
                  size="large"
                  className="w-full"
                  disabled={fields.length === 1 || disabled}
                  onClick={() => remove(index)}
                />
              </Tooltip>
            </Col>
          </Row>
        </div>
      ))}
    </div>
  );
}

export function CreateSalesInvoiceTab() {
  const [customers, setCustomers] = useState([]);
  const [parts, setParts] = useState([]);
  const [dataLoading, setDataLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    let ignore = false;
    (async () => {
      try {
        const [customerResponse, partsResponse] = await Promise.all([
          adminService.getUsersByRole("customer"),
          partsService.getParts(),
        ]);
        if (!ignore) {
          setCustomers(listData(customerResponse));
          setParts(listData(partsResponse));
        }
      } catch (error) {
        if (!ignore) {
          message.error(apiMessage(error, "Failed to load invoice form data."));
        }
      } finally {
        if (!ignore) {
          setDataLoading(false);
        }
      }
    })();

    return () => {
      ignore = true;
    };
  }, []);

  const {
    control,
    handleSubmit,
    reset,
    watch,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(salesInvoiceSchema),
    defaultValues: {
      customerId: null,
      totalAmount: 0,
      dueDate: "",
      invoiceItems: [{ partId: null, quantity: 1 }],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: "invoiceItems",
  });

  const watchedTotal = watch("totalAmount");
  const discount = Number(watchedTotal) > 5000 ? Number(watchedTotal) * 0.1 : 0;
  const netTotal = Number(watchedTotal) - discount;

  const onSubmit = async (values) => {
    try {
      setSubmitting(true);
      await invoiceService.createInvoice(values.customerId, {
        type: "Sales",
        totalAmount: values.totalAmount,
        dueDate: toApiDate(values.dueDate),
        invoiceItems: values.invoiceItems.map((item) => ({
          partId: item.partId,
          quantity: item.quantity,
        })),
      });
      message.success("Sales invoice created successfully.");
      reset();
    } catch (error) {
      message.error(apiMessage(error, "Failed to create sales invoice."));
    } finally {
      setSubmitting(false);
    }
  };

  if (dataLoading) {
    return (
      <div className="grid min-h-[40vh] place-items-center">
        <Space direction="vertical" align="center">
          <Spin size="large" />
          <Text className="text-slate-400">Loading form data...</Text>
        </Space>
      </div>
    );
  }

  return (
    <DashboardSection
      title="Create Sales Invoice"
      subtitle="Create a customer sales invoice. Email is sent only from the invoice list."
    >
      <Alert
        type="info"
        showIcon
        message={
          <span>
            This creates a <Tag color="green">Sales</Tag> invoice for the selected
            customer. Use the table's Send button when you want to email it.
          </span>
        }
        className="mb-6"
      />

      <form onSubmit={handleSubmit(onSubmit)}>
        <Row gutter={[16, 20]}>
          <Col xs={24} md={12}>
            <label className="form-label">Customer</label>
            <Controller
              name="customerId"
              control={control}
              render={({ field }) => (
                <Select
                  {...field}
                  className="w-full"
                  size="large"
                  placeholder="Select customer"
                  showSearch
                  optionFilterProp="label"
                  status={fieldStatus(errors.customerId)}
                  options={customers.map((customer) => ({
                    value: customer.id,
                    label: `${customer.name} - ${customer.phone ?? customer.email ?? `ID #${customer.id}`}`,
                  }))}
                />
              )}
            />
            <FormError message={errors.customerId?.message} />
          </Col>

          <Col xs={24} md={12}>
            <label className="form-label">Total Amount (Rs.)</label>
            <Controller
              name="totalAmount"
              control={control}
              render={({ field }) => (
                <InputNumber
                  {...field}
                  className="w-full"
                  size="large"
                  min={0}
                  step={0.01}
                  status={fieldStatus(errors.totalAmount)}
                />
              )}
            />
            <FormError message={errors.totalAmount?.message} />

            {Number(watchedTotal) > 0 && (
              <div className="mt-2 rounded-lg bg-slate-50 px-3 py-2 text-sm">
                <div className="flex justify-between text-slate-500">
                  <span>Discount {Number(watchedTotal) > 5000 ? "(10%)" : ""}</span>
                  <span className={discount > 0 ? "font-medium text-green-600" : ""}>
                    {discount > 0 ? `- ${formatMoney(discount)}` : "Not applicable"}
                  </span>
                </div>
                {discount > 0 && (
                  <div className="mt-1 flex justify-between font-semibold text-emerald-700">
                    <span>Net Total</span>
                    <span>{formatMoney(netTotal)}</span>
                  </div>
                )}
              </div>
            )}
          </Col>

          <Col xs={24} md={12}>
            <label className="form-label">Due Date</label>
            <Controller
              name="dueDate"
              control={control}
              render={({ field }) => (
                <input {...field} type="datetime-local" className="app-native-input" />
              )}
            />
            <FormError message={errors.dueDate?.message} />
          </Col>
        </Row>

        <Divider />

        <div className="mb-4 flex items-center justify-between">
          <Title level={5} className="!mb-0">
            Invoice Items
          </Title>
          <Button
            type="dashed"
            icon={<FiPlus />}
            onClick={() => append({ partId: null, quantity: 1 })}
          >
            Add Item
          </Button>
        </div>

        {(errors.invoiceItems?.message ?? errors.invoiceItems?.root?.message) && (
          <Alert
            type="error"
            message={errors.invoiceItems?.message ?? errors.invoiceItems?.root?.message}
            showIcon
            className="mb-3"
          />
        )}

        <DynamicItemRows
          fields={fields}
          control={control}
          errors={errors}
          remove={remove}
          parts={parts}
          fieldName="invoiceItems"
          disabled={submitting}
        />

        <div className="mt-6">
          <Button
            type="primary"
            htmlType="submit"
            size="large"
            loading={submitting}
            icon={<FiFileText />}
          >
            Create Sales Invoice
          </Button>
        </div>
      </form>
    </DashboardSection>
  );
}

function StaffInvoice() {
  const [activeTab, setActiveTab] = useState("create");

  const tabItems = [
    {
      key: "create",
      label: (
        <Space>
          <FiFileText />
          Create Sales Invoice
        </Space>
      ),
      children: <CreateSalesInvoiceTab />,
    },
    {
      key: "all",
      label: (
        <Space>
          <FiList />
          All Invoices
        </Space>
      ),
      children: <AllInvoicesTab />,
    },
  ];

  return (
    <div className="p-6">
      <div className="page-toolbar">
        <h1 className="page-title">Invoice Management</h1>
      </div>
      <Tabs
        activeKey={activeTab}
        onChange={setActiveTab}
        items={tabItems}
        size="large"
        type="card"
        className="mt-2"
      />
    </div>
  );
}

export default StaffInvoice;
