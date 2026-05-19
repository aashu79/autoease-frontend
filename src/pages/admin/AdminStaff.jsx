import { message, Spin } from "antd";
import { useEffect, useState } from "react";
import { adminService } from "../../api/services";
import StaffPanel from "../../components/dashboard/StaffPanel";
import { apiMessage, listData } from "../../utils/api";

function AdminStaff() {
  const [staff, setStaff] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);

  // ── Data helpers ───────────────────────────────────────────────────────────

  /** Reload the staff list (called after every mutation). */
  const loadStaff = async () => {
    const response = await adminService.getUsersByRole("staff");
    setStaff(listData(response));
  };

  // Initial fetch on mount
  useEffect(() => {
    let ignore = false;

    const initialize = async () => {
      try {
        const response = await adminService.getUsersByRole("staff");
        if (!ignore) {
          setStaff(listData(response));
        }
      } catch (error) {
        if (!ignore) {
          message.error(apiMessage(error, "Failed to load staff."));
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

  const createStaff = async (values) => {
    try {
      setActionLoading(true);
      await adminService.createStaff(values);
      await loadStaff();
    } catch (error) {
      message.error(apiMessage(error, "Failed to create staff member."));
      throw error; // let StaffPanel know the operation failed
    } finally {
      setActionLoading(false);
    }
  };

  const updateRole = async (id, values) => {
    try {
      setActionLoading(true);
      await adminService.updateRole(id, values);
      await loadStaff();
    } catch (error) {
      message.error(apiMessage(error, "Failed to update role."));
      throw error; // let StaffPanel know the operation failed
    } finally {
      setActionLoading(false);
    }
  };

  const deleteStaff = async (id) => {
    try {
      setActionLoading(true);
      await adminService.deleteStaff(id);
      await loadStaff();
    } catch (error) {
      message.error(apiMessage(error, "Failed to delete staff member."));
      throw error; // let StaffPanel know the operation failed
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
    <StaffPanel
      staff={staff}
      onCreateStaff={createStaff}
      onUpdateRole={updateRole}
      onDeleteStaff={deleteStaff}
      loading={actionLoading}
    />
  );
}

export default AdminStaff;
