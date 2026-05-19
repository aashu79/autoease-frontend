import { Table, Rate, Typography, message } from "antd";
import { useEffect, useState } from "react";
import { reviewService } from "../../api/services";
import DashboardSection from "../../components/dashboard/DashboardSection";
import { apiMessage, listData } from "../../utils/api";

const { Text } = Typography;

function AdminReviews() {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let ignore = false;

    const loadReviews = async () => {
      try {
        const response = await reviewService.getAllReviews();
        if (!ignore) {
          setReviews(listData(response));
        }
      } catch (error) {
        if (!ignore)
          message.error(apiMessage(error, "Failed to load reviews."));
      } finally {
        if (!ignore) setLoading(false);
      }
    };

    void loadReviews();

    return () => {
      ignore = true;
    };
  }, []);

  const columns = [
    {
      title: "ID",
      dataIndex: "id",
      width: 70,
      render: (val) => <Text code>#{val}</Text>,
    },
    {
      title: "Customer ID",
      dataIndex: "customerId",
      width: 120,
    },
    {
      title: "Rating",
      dataIndex: "rating",
      width: 150,
      render: (val) => <Rate disabled value={val} className="!text-sm" />,
    },
    {
      title: "Comment",
      dataIndex: "comment",
      render: (val) => <span className="italic">"{val}"</span>,
    },
  ];

  return (
    <DashboardSection
      title="Customer Reviews"
      subtitle="View all customer feedback."
    >
      <Table
        rowKey="id"
        dataSource={reviews}
        columns={columns}
        loading={loading}
        pagination={{ pageSize: 10, showSizeChanger: true }}
      />
    </DashboardSection>
  );
}

export default AdminReviews;
