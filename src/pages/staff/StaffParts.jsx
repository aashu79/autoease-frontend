import { message, Spin } from "antd";
import { useEffect, useState } from "react";
import { partsService, vendorService } from "../../api/services";
import PartsPanel from "../../components/dashboard/PartsPanel";
import { apiMessage, listData } from "../../utils/api";

function StaffParts() {
  const [parts, setParts] = useState([]);
  const [vendors, setVendors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);

  // ── Data helpers ───────────────────────────────────────────────────────────

  /** Reload both lists (called after every mutation). */
  const loadData = async () => {
    const [partsRes, vendorsRes] = await Promise.all([
      partsService.getParts(),
      vendorService.getVendors(),
    ]);
    setParts(listData(partsRes));
    setVendors(listData(vendorsRes));
  };

  // Initial parallel fetch on mount
  useEffect(() => {
    let ignore = false;

    const initialize = async () => {
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
          message.error(apiMessage(error, "Failed to load parts data."));
        }
      } finally {
        if (!ignore) {
          setLoading(false);
        }
      }
    };

    void initialize();

    return () => {
      ignore = true;
    };
  }, []);

  // ── CRUD handlers ──────────────────────────────────────────────────────────

  const savePart = async (id, values) => {
    try {
      setActionLoading(true);
      if (id == null) {
        await partsService.createPart(values);
      } else {
        await partsService.updatePart(id, values);
      }
      await loadData();
    } catch (error) {
      message.error(apiMessage(error, "Failed to save part."));
      throw error; // let PartsPanel know the operation failed
    } finally {
      setActionLoading(false);
    }
  };

  const deletePart = async (id) => {
    try {
      setActionLoading(true);
      await partsService.deletePart(id);
      await loadData();
    } catch (error) {
      message.error(apiMessage(error, "Failed to delete part."));
      throw error; // let PartsPanel know the operation failed
    } finally {
      setActionLoading(false);
    }
  };

  // ── Render ─────────────────────────────────────────────────────────────────

  if (loading) {
    return (
      <div className="grid min-h-[50vh] place-items-center">
        <Spin size="large" />
      </div>
    );
  }

  return (
    <PartsPanel
      parts={parts}
      vendors={vendors}
      canEdit
      onSavePart={savePart}
      onDeletePart={deletePart}
      loading={actionLoading}
    />
  );
}

export default StaffParts;
