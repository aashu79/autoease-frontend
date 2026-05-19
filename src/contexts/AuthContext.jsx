import { useEffect, useMemo, useState } from "react";
import { authService, profileService } from "../api/services";
import { normalizeProfile } from "../utils/auth";
import AuthContext from "./auth-context";

const TOKEN_KEY = "auth_token";
const USER_KEY = "auth_user";

function readStoredUser() {
  const rawUser = localStorage.getItem(USER_KEY);

  if (!rawUser) {
    return null;
  }

  try {
    return normalizeProfile(JSON.parse(rawUser));
  } catch {
    localStorage.removeItem(USER_KEY);
    return null;
  }
}

export function AuthProvider({ children }) {
  const [token, setToken] = useState(() => localStorage.getItem(TOKEN_KEY) || "");
  const [user, setUser] = useState(() => readStoredUser());
  const [loading, setLoading] = useState(Boolean(localStorage.getItem(TOKEN_KEY)));

  useEffect(() => {
    const syncStorage = async () => {
      if (!token) {
        setLoading(false);
        return;
      }

      if (user) {
        setLoading(false);
        return;
      }

      try {
        const response = await profileService.getProfile();
        const profile = normalizeProfile(response.data);

        setUser(profile);
        localStorage.setItem(USER_KEY, JSON.stringify(profile));
      } catch {
        localStorage.removeItem(TOKEN_KEY);
        localStorage.removeItem(USER_KEY);
        setToken("");
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    syncStorage();
  }, [token, user]);

  const login = async (values) => {
    const loginResponse = await authService.login(values);
    const nextToken =
      loginResponse.data?.token ||
      loginResponse.data?.Token ||
      loginResponse.data?.accessToken ||
      loginResponse.data?.AccessToken ||
      "";

    localStorage.setItem(TOKEN_KEY, nextToken);
    setToken(nextToken);

    const profileResponse = await profileService.getProfile();
    const profile = normalizeProfile(profileResponse.data);

    localStorage.setItem(USER_KEY, JSON.stringify(profile));
    setUser(profile);

    return profile;
  };

  const register = async (values) => authService.register(values);

  const logout = () => {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
    setToken("");
    setUser(null);
  };

  const refreshProfile = async () => {
    const response = await profileService.getProfile();
    const profile = normalizeProfile(response.data);

    localStorage.setItem(USER_KEY, JSON.stringify(profile));
    setUser(profile);

    return profile;
  };

  const value = useMemo(
    () => ({
      token,
      user,
      loading,
      isAuthenticated: Boolean(token),
      login,
      register,
      logout,
      refreshProfile,
      setUser,
    }),
    [token, user, loading],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
