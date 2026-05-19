import { Button, Empty, Space, Table, Tag, Typography, message } from "antd";
import { useEffect, useState } from "react";
import { FiCalendar, FiRefreshCw, FiUser } from "react-icons/fi";
import { appointmentService } from "../../api/services";
import DashboardSection from "../../components/dashboard/DashboardSection";
import { apiMessage, listData } from "../../utils/api";

const { Text } = Typography;

const STATUS_COLOR = {
  Pending: "orange",
  Confirmed: "blue",
  Completed: "green",
  Cancelled: "red",
};

function AdminAppointments() {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);

  const loadAppointments = async () => {
    try {
      setLoading(true);
      const response = await appointmentService.getAllCustomerAppointments();
      setAppointments(listData(response));
    } catch (error) {
      message.error(apiMessage(error, "Failed to load customer appointments."));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadAppointments();
  }, []);

  const columns = [
    {
      title: "ID",
      dataIndex: "id",
      width: 70,
      render: (value) => <Text code>#{value}</Text>,
    },
    {
      title: "Customer",
      dataIndex: "customerName",
      render: (value, record) => (
        <Space>
          <FiUser className="text-slate-400" />
          <span className="font-medium">
            {value ?? record.customerEmail ?? `Customer #${record.customerId}`}
          </span>
        </Space>
      ),
    },
    {
      title: "Email",
      dataIndex: "customerEmail",
      ellipsis: true,
      render: (value) =>
        value ? <a href={`mailto:${value}`}>{value}</a> : <Text type="secondary">-</Text>,
    },
    {
      title: "Vehicle",
      dataIndex: "vehicleModel",
      ellipsis: true,
      render: (value, record) =>
        value ?? record.vehicleName ?? record.vehicleId ?? <Text type="secondary">-</Text>,
    },
    {
      title: "Staff",
      dataIndex: "staffName",
      ellipsis: true,
      render: (value, record) =>
        value ?? record.staffId ?? <Text type="secondary">-</Text>,
    },
    {
      title: "Scheduled",
      dataIndex: "scheduledAt",
      width: 180,
      render: (value) =>
        value ? new Date(value).toLocaleString() : <Text type="secondary">-</Text>,
    },
    {
      title: "Status",
      dataIndex: "status",
      width: 120,
      render: (status) => (
        <Tag color={STATUS_COLOR[status] ?? "default"}>{status ?? "-"}</Tag>
      ),
    },
  ];

  return (
    <DashboardSection
      title="Customer Appointments"
      subtitle="All scheduled appointments across customers."
      extra={
        <Button icon={<FiRefreshCw />} loading={loading} onClick={loadAppointments}>
          Refresh
        </Button>
      }
    >
      <Table
        rowKey="id"
        dataSource={appointments}
        columns={columns}
        loading={loading}
        scroll={{ x: 980 }}
        pagination={{ pageSize: 10, showSizeChanger: true }}
        locale={{
          emptyText: (
            <Empty
              image={Empty.PRESENTED_IMAGE_SIMPLE}
              description="No customer appointments found."
            />
          ),
        }}
        title={() => (
          <Space className="text-slate-500">
            <FiCalendar />
            <span>{appointments.length} appointment{appointments.length === 1 ? "" : "s"}</span>
          </Space>
        )}
      />
    </DashboardSection>
  );
}

export default AdminAppointments;
