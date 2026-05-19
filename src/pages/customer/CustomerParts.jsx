import { message, Spin } from "antd";
import { useEffect, useState } from "react";
import { partsService, vendorService } from "../../api/services";
import PartsPanel from "../../components/dashboard/PartsPanel";
import { apiMessage, listData } from "../../utils/api";

function CustomerParts() {
  const [parts, setParts] = useState([]);
  const [vendors, setVendors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    let ignore = false;

    const loadParts = async () => {
      try {
        const [partsRes, vendorsRes] = await Promise.all([
          partsService.getParts(),
          vendorService.getVendors(),
        ]);
        if (!ignore) {
          setParts(listData(partsRes));
          setVendors(listData(vendorsRes));
        }
      } catch (error) {
        if (!ignore) {
          message.error(apiMessage(error, "Failed to load parts."));
        }
      } finally {
        if (!ignore) {
          setLoading(false);
        }
      }
    };

    void loadParts();

    return () => {
      ignore = true;
    };
  }, []);

  const findPart = async (id) => {
    try {
      setActionLoading(true);
      const response = await partsService.getPartById(id);
      return response.data;
    } catch (error) {
      message.error(apiMessage(error, "Failed to find part."));
      throw error;
    } finally {
      setActionLoading(false);
    }
  };

  if (loading) {
    return <div className="grid min-h-[50vh] place-items-center"><Spin size="large" /></div>;
  }

  return <PartsPanel parts={parts} vendors={vendors} onFindPart={findPart} loading={actionLoading} />;
}

export default CustomerParts;
