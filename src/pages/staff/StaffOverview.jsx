import { Spin, Card, Row, Col, Table, Typography } from "antd";
import { useEffect, useMemo, useState } from "react";
import { partsService, vendorService, reportService } from "../../api/services";
import OverviewCards from "../../components/dashboard/OverviewCards";
import { useAuth } from "../../hooks/useAuth";
import { listData } from "../../utils/api";

const { Title } = Typography;

function StaffOverview() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [counts, setCounts] = useState({ parts: 0, vendors: 0 });
  const [reports, setReports] = useState({
    regulars: [],
    highSpenders: [],
    pendingCredits: [],
  });

  useEffect(() => {
    let ignore = false;

    const loadOverview = async () => {
      const [
        partsResult,
        vendorsResult,
        regularsResult,
        highSpendersResult,
        pendingCreditsResult,
      ] = await Promise.allSettled([
        partsService.getParts(),
        vendorService.getVendors(),
        reportService.getRegularCustomers(),
        reportService.getHighSpendingCustomers(),
        reportService.getPendingCredits(),
      ]);

      if (ignore) {
        return;
      }

      setCounts({
        parts:
          partsResult.status === "fulfilled"
            ? listData(partsResult.value).length
            : 0,
        vendors:
          vendorsResult.status === "fulfilled"
            ? listData(vendorsResult.value).length
            : 0,
      });

      setReports({
        regulars:
          regularsResult.status === "fulfilled"
            ? listData(regularsResult.value)
            : [],
        highSpenders:
          highSpendersResult.status === "fulfilled"
            ? listData(highSpendersResult.value)
            : [],
        pendingCredits:
          pendingCreditsResult.status === "fulfilled"
            ? listData(pendingCreditsResult.value)
            : [],
      });

      setLoading(false);
    };

    void loadOverview();

    return () => {
      ignore = true;
    };
  }, []);

  const stats = useMemo(
    () => [
      { label: "Available parts", value: counts.parts },
      { label: "Vendors", value: counts.vendors },
      { label: "Your role", value: user?.Role || "Staff" },
      { label: "Staff ID", value: user?.Id || "-" },
    ],
    [counts, user],
  );

  if (loading) {
    return (
      <div className="grid min-h-[50vh] place-items-center">
        <Spin size="large" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <OverviewCards stats={stats} />

      <Row gutter={[16, 16]}>
        <Col xs={24} lg={12}>
          <Card
            title={
              <Title level={5} className="!m-0">
                Regular Customers
              </Title>
            }
            className="h-full shadow-sm"
          >
            <Table
              size="small"
              dataSource={reports.regulars}
              rowKey="id"
              pagination={{ pageSize: 5 }}
              columns={[
                { title: "ID", dataIndex: "id" },
                { title: "Name", dataIndex: "name" },
                { title: "Phone", dataIndex: "phoneNumber" },
                { title: "Invoices", dataIndex: "invoiceCount" },
              ]}
            />
          </Card>
        </Col>

        <Col xs={24} lg={12}>
          <Card
            title={
              <Title level={5} className="!m-0">
                High Spending Customers
              </Title>
            }
            className="h-full shadow-sm"
          >
            <Table
              size="small"
              dataSource={reports.highSpenders}
              rowKey="id"
              pagination={{ pageSize: 5 }}
              columns={[
                { title: "ID", dataIndex: "id" },
                { title: "Name", dataIndex: "name" },
                { title: "Phone", dataIndex: "phoneNumber" },
                {
                  title: "Total Spent",
                  dataIndex: "totalSpent",
                  render: (val) => `$${val?.toFixed(2)}`,
                },
              ]}
            />
          </Card>
        </Col>

        <Col xs={24}>
          <Card
            title={
              <Title level={5} className="!m-0">
                Customers with Pending Credits
              </Title>
            }
            className="h-full shadow-sm"
          >
            <Table
              size="small"
              dataSource={reports.pendingCredits}
              rowKey="id"
              pagination={{ pageSize: 5 }}
              columns={[
                { title: "ID", dataIndex: "id" },
                { title: "Name", dataIndex: "name" },
                { title: "Phone", dataIndex: "phoneNumber" },
                {
                  title: "Pending Amt",
                  dataIndex: "pendingAmount",
                  render: (val) => (
                    <span className="text-red-500 font-semibold">
                      ${val?.toFixed(2)}
                    </span>
                  ),
                },
              ]}
            />
          </Card>
        </Col>
      </Row>
    </div>
  );
}

export default StaffOverview;
