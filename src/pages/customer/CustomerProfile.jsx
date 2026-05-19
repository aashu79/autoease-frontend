import { message } from "antd";
import { useState } from "react";
import { profileService } from "../../api/services";
import ProfilePanel from "../../components/dashboard/ProfilePanel";
import { useAuth } from "../../hooks/useAuth";
import { apiMessage } from "../../utils/api";

function CustomerProfile() {
  const { user, refreshProfile } = useAuth();
  const [loading, setLoading] = useState(false);

  const updateProfile = async (values) => {
    try {
      setLoading(true);
      await profileService.updateProfile(values);
      await refreshProfile();
    } catch (error) {
      message.error(apiMessage(error, "Failed to update profile."));
      throw error;
    } finally {
      setLoading(false);
    }
  };

  return <ProfilePanel user={user} onUpdate={updateProfile} loading={loading} />;
}

export default CustomerProfile;
