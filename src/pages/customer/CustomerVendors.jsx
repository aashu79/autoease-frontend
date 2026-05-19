import { message, Spin } from "antd";
import { useEffect, useState } from "react";
import { vendorService } from "../../api/services";
import VendorsPanel from "../../components/dashboard/VendorsPanel";
import { apiMessage, listData } from "../../utils/api";

function CustomerVendors() {
  const [vendors, setVendors] = useState([]);
  const [selectedVendor, setSelectedVendor] = useState(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    let ignore = false;

    const loadVendors = async () => {
      try {
        const response = await vendorService.getVendors();
        if (!ignore) {
          setVendors(listData(response));
        }
      } catch (error) {
        if (!ignore) {
          message.error(apiMessage(error, "Failed to load vendors."));
        }
      } finally {
        if (!ignore) {
          setLoading(false);
        }
      }
    };

    void loadVendors();

    return () => {
      ignore = true;
    };
  }, []);

  const findVendor = async (id) => {
    try {
      setActionLoading(true);
      const response = await vendorService.getVendorById(id);
      setSelectedVendor(response.data);
      return response.data;
    } catch (error) {
      message.error(apiMessage(error, "Failed to find vendor."));
      throw error;
    } finally {
      setActionLoading(false);
    }
  };

  if (loading) {
    return <div className="grid min-h-[50vh] place-items-center"><Spin size="large" /></div>;
  }

  return (
    <VendorsPanel
      vendors={vendors}
      selectedVendor={selectedVendor}
      onFindVendor={findVendor}
      loading={actionLoading}
    />
  );
}

export default CustomerVendors;
