import { Spin } from "antd";
import { useEffect, useMemo, useState } from "react";
import { partsService, vendorService } from "../../api/services";
import OverviewCards from "../../components/dashboard/OverviewCards";
import { useAuth } from "../../hooks/useAuth";
import { listData } from "../../utils/api";

function CustomerOverview() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [counts, setCounts] = useState({ parts: 0, vendors: 0 });

  useEffect(() => {
    let ignore = false;

    const loadOverview = async () => {
      const [partsResult, vendorsResult] = await Promise.allSettled([
        partsService.getParts(),
        vendorService.getVendors(),
      ]);

      if (ignore) {
        return;
      }

      setCounts({
        parts: partsResult.status === "fulfilled" ? listData(partsResult.value).length : 0,
        vendors: vendorsResult.status === "fulfilled" ? listData(vendorsResult.value).length : 0,
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
      { label: "Role", value: user?.Role || "Customer" },
      { label: "Profile ID", value: user?.Id || "-" },
    ],
    [counts, user],
  );

  if (loading) {
    return <div className="grid min-h-[50vh] place-items-center"><Spin size="large" /></div>;
  }

  return <OverviewCards stats={stats} />;
}

export default CustomerOverview;
