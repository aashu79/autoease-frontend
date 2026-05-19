import { Button, Empty, Space, Table, Tag, Typography, message } from "antd";
import { useEffect, useState } from "react";
import { FiPackage, FiRefreshCw, FiUser } from "react-icons/fi";
import { partRequestService } from "../../api/services";
import DashboardSection from "../../components/dashboard/DashboardSection";
import { apiMessage, listData } from "../../utils/api";

const { Text } = Typography;

const STATUS_COLOR = {
  Requested: "blue",
  Approved: "green",
  Rejected: "red",
  Fulfilled: "purple",
};

function AdminPartRequests() {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);

  const loadRequests = async () => {
    try {
      setLoading(true);
      const response = await partRequestService.getPartRequests();
      setRequests(listData(response));
    } catch (error) {
      message.error(apiMessage(error, "Failed to load part requests."));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadRequests();
  }, []);

  const columns = [
    {
      title: "ID",
      dataIndex: "id",
      width: 70,
      render: (value) => <Text code>#{value}</Text>,
    },
    {
      title: "Part Name",
      dataIndex: "partName",
      render: (value) => (
        <Space>
          <FiPackage className="text-slate-400" />
          <span className="font-medium">{value}</span>
        </Space>
      ),
    },
    {
      title: "Customer",
      dataIndex: "customerName",
      render: (value, record) => (
        <Space>
          <FiUser className="text-slate-400" />
          <span>{value ?? `Customer #${record.customerId}`}</span>
        </Space>
      ),
    },
    {
      title: "Customer Email",
      dataIndex: "customerEmail",
      ellipsis: true,
      render: (value) =>
        value ? <a href={`mailto:${value}`}>{value}</a> : <Text type="secondary">-</Text>,
    },
    {
      title: "Status",
      dataIndex: "status",
      width: 130,
      filters: Object.keys(STATUS_COLOR).map((value) => ({ text: value, value })),
      onFilter: (value, record) => record.status === value,
      render: (status) => (
        <Tag color={STATUS_COLOR[status] ?? "default"}>{status ?? "-"}</Tag>
      ),
    },
  ];

  return (
    <DashboardSection
      title="Part Requests"
      subtitle="Customer part requests awaiting admin review."
      extra={
        <Button icon={<FiRefreshCw />} loading={loading} onClick={loadRequests}>
          Refresh
        </Button>
      }
    >
      <Table
        rowKey="id"
        dataSource={requests}
        columns={columns}
        loading={loading}
        scroll={{ x: 760 }}
        pagination={{ pageSize: 10, showSizeChanger: true }}
        locale={{
          emptyText: (
            <Empty
              image={Empty.PRESENTED_IMAGE_SIMPLE}
              description="No part requests found."
            />
          ),
        }}
      />
    </DashboardSection>
  );
}

export default AdminPartRequests;
