import { Spin } from "antd";
import { useEffect, useMemo, useState } from "react";
import { adminService, partsService, vendorService } from "../../api/services";
import OverviewCards from "../../components/dashboard/OverviewCards";
import { useAuth } from "../../hooks/useAuth";
import { listData } from "../../utils/api";

function AdminOverview() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [counts, setCounts] = useState({ parts: 0, vendors: 0, staff: 0 });

  useEffect(() => {
    let ignore = false;

    const loadOverview = async () => {
      const [partsResult, vendorsResult, staffResult] = await Promise.allSettled([
        partsService.getParts(),
        vendorService.getVendors(),
        adminService.getUsersByRole("staff"),
      ]);

      if (ignore) {
        return;
      }

      setCounts({
        parts: partsResult.status === "fulfilled" ? listData(partsResult.value).length : 0,
        vendors: vendorsResult.status === "fulfilled" ? listData(vendorsResult.value).length : 0,
        staff: staffResult.status === "fulfilled" ? listData(staffResult.value).length : 0,
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
    return <div className="grid min-h-[50vh] place-items-center"><Spin size="large" /></div>;
  }

  return <OverviewCards stats={stats} />;
}

export default AdminOverview;
