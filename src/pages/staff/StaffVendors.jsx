import { message, Spin } from "antd";
import { useEffect, useState } from "react";
import { vendorService } from "../../api/services";
import VendorsPanel from "../../components/dashboard/VendorsPanel";
import { apiMessage, listData } from "../../utils/api";

function StaffVendors() {
  const [vendors, setVendors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);

  // ── Data helpers ───────────────────────────────────────────────────────────

  /** Reload the vendor list (called after every mutation). */
  const loadVendors = async () => {
    const response = await vendorService.getVendors();
    setVendors(listData(response));
  };

  // Initial fetch on mount
  useEffect(() => {
    let ignore = false;

    const initialize = async () => {
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

    void initialize();

    return () => {
      ignore = true;
    };
  }, []);

  // ── CRUD handlers ──────────────────────────────────────────────────────────

  /**
   * Called by VendorsPanel for both create (id == null) and update (id is a number).
   */
  const saveVendor = async (id, values) => {
    try {
      setActionLoading(true);
      if (id == null) {
        await vendorService.createVendor(values);
      } else {
        await vendorService.updateVendor(id, values);
      }
      await loadVendors();
    } catch (error) {
      message.error(apiMessage(error, "Failed to save vendor."));
      throw error; // let VendorsPanel know the operation failed
    } finally {
      setActionLoading(false);
    }
  };

  const deleteVendor = async (id) => {
    try {
      setActionLoading(true);
      await vendorService.deleteVendor(id);
      await loadVendors();
    } catch (error) {
      message.error(apiMessage(error, "Failed to delete vendor."));
      throw error; // let VendorsPanel know the operation failed
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
    <VendorsPanel
      vendors={vendors}
      canEdit
      onSaveVendor={saveVendor}
      onDeleteVendor={deleteVendor}
      loading={actionLoading}
    />
  );
}

export default StaffVendors;
