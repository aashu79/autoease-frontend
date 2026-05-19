import { Spin, Tabs, Card, Typography, Table } from "antd";
import { useEffect, useMemo, useState } from "react";
import {
  adminService,
  partsService,
  vendorService,
  reportService,
} from "../../api/services";
import OverviewCards from "../../components/dashboard/OverviewCards";
import { useAuth } from "../../hooks/useAuth";
import { listData } from "../../utils/api";
import dayjs from "dayjs";

const { Title } = Typography;

function AdminOverview() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [counts, setCounts] = useState({ parts: 0, vendors: 0, staff: 0 });
  const [reports, setReports] = useState({
    daily: [],
    monthly: [],
    yearly: [],
  });

  useEffect(() => {
    let ignore = false;

    const loadOverview = async () => {
      const [
        partsResult,
        vendorsResult,
        staffResult,
        dailyResult,
        monthlyResult,
        yearlyResult,
      ] = await Promise.allSettled([
        partsService.getParts(),
        vendorService.getVendors(),
        adminService.getUsersByRole("staff"),
        reportService.getDailyFinancial(),
        reportService.getMonthlyFinancial(),
        reportService.getYearlyFinancial(),
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
        staff:
          staffResult.status === "fulfilled"
            ? listData(staffResult.value).length
            : 0,
      });

      setReports({
        daily:
          dailyResult.status === "fulfilled" ? listData(dailyResult.value) : [],
        monthly:
          monthlyResult.status === "fulfilled"
            ? listData(monthlyResult.value)
            : [],
        yearly:
          yearlyResult.status === "fulfilled"
            ? listData(yearlyResult.value)
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
      { label: "Staff members", value: counts.staff },
      { label: "Vendors", value: counts.vendors },
      { label: "Parts", value: counts.parts },
      { label: "Your role", value: user?.Role || "Admin" },
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

  const formatCurrency = (val) => `$${(val || 0).toFixed(2)}`;

  return (
    <div className="space-y-6">
      <OverviewCards stats={stats} />

      <Card
        title={
          <Title level={5} className="!m-0">
            Financial Reports
          </Title>
        }
        className="shadow-sm"
      >
        <Tabs defaultActiveKey="daily">
          <Tabs.TabPane tab="Daily" key="daily">
            <Table
              size="small"
              dataSource={reports.daily}
              rowKey="date"
              pagination={{ pageSize: 5 }}
              columns={[
                {
                  title: "Date",
                  dataIndex: "date",
                  render: (val) => dayjs(val).format("YYYY-MM-DD"),
                },
                {
                  title: "Total Sales",
                  dataIndex: "totalSales",
                  render: formatCurrency,
                },
                {
                  title: "Total Purchases",
                  dataIndex: "totalPurchases",
                  render: formatCurrency,
                },
                {
                  title: "Net Profit",
                  dataIndex: "netProfit",
                  render: formatCurrency,
                },
              ]}
            />
          </Tabs.TabPane>
          <Tabs.TabPane tab="Monthly" key="monthly">
            <Table
              size="small"
              dataSource={reports.monthly}
              rowKey={(rec) => `${rec.year}-${rec.month}`}
              pagination={{ pageSize: 5 }}
              columns={[
                {
                  title: "Month/Year",
                  render: (_, rec) => `${rec.month}/${rec.year}`,
                },
                {
                  title: "Total Sales",
                  dataIndex: "totalSales",
                  render: formatCurrency,
                },
                {
                  title: "Total Purchases",
                  dataIndex: "totalPurchases",
                  render: formatCurrency,
                },
                {
                  title: "Net Profit",
                  dataIndex: "netProfit",
                  render: formatCurrency,
                },
              ]}
            />
          </Tabs.TabPane>
          <Tabs.TabPane tab="Yearly" key="yearly">
            <Table
              size="small"
              dataSource={reports.yearly}
              rowKey="year"
              pagination={{ pageSize: 5 }}
              columns={[
                { title: "Year", dataIndex: "year" },
                {
                  title: "Total Sales",
                  dataIndex: "totalSales",
                  render: formatCurrency,
                },
                {
                  title: "Total Purchases",
                  dataIndex: "totalPurchases",
                  render: formatCurrency,
                },
                {
                  title: "Net Profit",
                  dataIndex: "netProfit",
                  render: formatCurrency,
                },
              ]}
            />
          </Tabs.TabPane>
        </Tabs>
      </Card>
    </div>
  );
}

export default AdminOverview;
