import { CalendarOutlined, FileTextOutlined } from "@ant-design/icons";
import {
  Empty,
  Space,
  Spin,
  Table,
  Tag,
  Tooltip,
  Typography,
  message,
} from "antd";
import { useEffect, useState } from "react";
import {
  FiAlertCircle,
  FiCalendar,
  FiClock,
  FiDollarSign,
} from "react-icons/fi";
import { invoiceService } from "../../api/services";
import DashboardSection from "../../components/dashboard/DashboardSection";
import { apiMessage, listData } from "../../utils/api";

const { Text } = Typography;

function formatDate(value) {
  if (!value) return "-";
  return new Date(value).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

function formatMoney(value) {
  return `Rs. ${Number(value || 0).toFixed(2)}`;
}

function PaymentStatusTag({ status }) {
  const config = {
    Paid: { color: "green", icon: null },
    Pending: { color: "orange", icon: null },
  };
  const { color } = config[status] ?? { color: "red" };
  return (
    <Tag
      color={color}
      className="!rounded-full !px-3 !py-0.5 !font-semibold capitalize"
    >
      {status ?? "Unknown"}
    </Tag>
  );
}

const expandedRowRender = (record) => {
  const items = record.invoiceItems ?? record.items ?? [];
  return (
    <div className="rounded-lg border border-slate-100 bg-slate-50 px-4 py-3">
      <Text className="mb-2 block text-xs font-bold uppercase tracking-wide text-slate-400">
        Line Items
      </Text>
      {items.length === 0 ? (
        <Empty
          image={Empty.PRESENTED_IMAGE_SIMPLE}
          description={
            <span className="text-slate-400 text-xs">No line items found</span>
          }
          className="!my-2"
        />
      ) : (
        <Table
          rowKey={(item, index) => item.id ?? item.partId ?? index}
          dataSource={items}
          pagination={false}
          size="small"
          className="[&_.ant-table]:!bg-transparent [&_.ant-table-thead_.ant-table-cell]:!bg-white [&_.ant-table-thead_.ant-table-cell]:!text-slate-500"
          columns={[
            {
              title: "Part ID",
              dataIndex: "partId",
              key: "partId",
              width: 100,
              render: (val) =>
                val != null ? (
                  <span className="font-mono text-xs text-slate-500">
                    #{val}
                  </span>
                ) : (
                  <span className="text-slate-300">—</span>
                ),
            },
            {
              title: "Part Name",
              dataIndex: "partName",
              key: "partName",
              render: (val) => val ?? <span className="text-slate-300">—</span>,
            },
            {
              title: "Quantity",
              dataIndex: "quantity",
              key: "quantity",
              width: 100,
              render: (val) => (
                <Tag className="!border-blue-100 !bg-blue-50 !text-blue-600">
                  × {val ?? 0}
                </Tag>
              ),
            },
            {
              title: "Unit Price",
              dataIndex: "unitPrice",
              key: "unitPrice",
              render: (val) =>
                val != null ? (
                  <span className="font-medium text-slate-700">
                    {formatMoney(val)}
                  </span>
                ) : (
                  <span className="text-slate-300">—</span>
                ),
            },
            {
              title: "Subtotal",
              key: "subtotal",
              render: (_, item) => {
                const qty = Number(item.quantity ?? 0);
                const price = Number(item.unitPrice ?? 0);
                return qty && price ? (
                  <span className="font-semibold text-teal-700">
                    {formatMoney(qty * price)}
                  </span>
                ) : (
                  <span className="text-slate-300">—</span>
                );
              },
            },
          ]}
        />
      )}
    </div>
  );
};

const columns = [
  {
    title: "ID",
    dataIndex: "id",
    key: "id",
    width: 70,
    render: (val) => (
      <span className="font-mono text-xs text-slate-400">#{val}</span>
    ),
  },
  {
    title: "Type",
    dataIndex: "type",
    key: "type",
    render: (val) => (
      <Space size={6}>
        <FileTextOutlined className="text-slate-400" />
        <span className="font-medium text-slate-700 capitalize">
          {val ?? "—"}
        </span>
      </Space>
    ),
  },
  {
    title: "Total Amount",
    dataIndex: "totalAmount",
    key: "totalAmount",
    render: (val) => (
      <Space size={4}>
        <FiDollarSign className="text-teal-500" size={14} />
        <span className="font-bold text-slate-800">{formatMoney(val)}</span>
      </Space>
    ),
  },
  {
    title: "Discount",
    dataIndex: "discountApplied",
    key: "discountApplied",
    render: (val) =>
      val ? (
        <Tag color="purple" className="!rounded-full !px-3 !font-semibold">
          {formatMoney(val)}
        </Tag>
      ) : (
        <span className="text-slate-300">—</span>
      ),
  },
  {
    title: "Payment Status",
    dataIndex: "paymentStatus",
    key: "paymentStatus",
    render: (val) => <PaymentStatusTag status={val} />,
  },
  {
    title: "Invoice Date",
    dataIndex: "invoiceDate",
    key: "invoiceDate",
    render: (val) => (
      <Tooltip title={val ? new Date(val).toLocaleString() : undefined}>
        <Space size={5} className="text-slate-600">
          <CalendarOutlined className="text-slate-400" />
          {formatDate(val)}
        </Space>
      </Tooltip>
    ),
  },
  {
    title: "Due Date",
    dataIndex: "dueDate",
    key: "dueDate",
    render: (val) => {
      const isOverdue = val && new Date(val) < new Date();
      return (
        <Tooltip title={val ? new Date(val).toLocaleString() : undefined}>
          <Space
            size={5}
            className={isOverdue ? "text-red-500" : "text-slate-600"}
          >
            {isOverdue ? (
              <FiAlertCircle size={13} className="text-red-400" />
            ) : (
              <FiClock size={13} className="text-slate-400" />
            )}
            {formatDate(val)}
          </Space>
        </Tooltip>
      );
    },
  },
];

function CustomerInvoices() {
  const [invoices, setInvoices] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    let ignore = false;

    const fetchInvoices = async () => {
      try {
        setLoading(true);
        const res = await invoiceService.getHistory();
        if (!ignore) {
          setInvoices(listData(res));
        }
      } catch (err) {
        if (!ignore) {
          message.error(apiMessage(err, "Failed to load invoice history."));
        }
      } finally {
        if (!ignore) {
          setLoading(false);
        }
      }
    };

    fetchInvoices();
    return () => {
      ignore = true;
    };
  }, []);

  return (
    <DashboardSection
      title="Invoice History"
      subtitle="Review your billing and payment records"
    >
      {loading ? (
        <div className="flex min-h-48 items-center justify-center">
          <Spin size="large" tip="Loading invoices..." />
        </div>
      ) : (
        <Table
          rowKey="id"
          dataSource={invoices}
          columns={columns}
          scroll={{ x: 920 }}
          pagination={{ pageSize: 8, showSizeChanger: false }}
          expandable={{
            expandedRowRender,
            rowExpandable: () => true,
            expandRowByClick: false,
          }}
          locale={{
            emptyText: (
              <Empty
                image={Empty.PRESENTED_IMAGE_SIMPLE}
                description={
                  <span className="text-slate-400">No invoices found</span>
                }
              />
            ),
          }}
          className="[&_.ant-table-thead_.ant-table-cell]:bg-slate-50 [&_.ant-table-thead_.ant-table-cell]:font-semibold [&_.ant-table-thead_.ant-table-cell]:text-slate-600"
        />
      )}
    </DashboardSection>
  );
}

export default CustomerInvoices;
