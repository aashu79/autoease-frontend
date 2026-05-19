import { useCallback, useEffect, useMemo, useState } from "react";
import { authService, profileService } from "../api/services";
import {
  AUTH_SESSION_CLEARED_EVENT,
  TOKEN_KEY,
  USER_KEY,
  clearStoredAuth,
  getStoredToken,
  getTokenExpiryTime,
  normalizeProfile,
  storeAuthToken,
  storeAuthUser,
} from "../utils/auth";
import AuthContext from "./auth-context";

function readStoredUser() {
  const rawUser = localStorage.getItem(USER_KEY);

  if (!rawUser) {
    return null;
  }

  try {
    return normalizeProfile(JSON.parse(rawUser));
  } catch {
    clearStoredAuth();
    return null;
  }
}

export function AuthProvider({ children }) {
  const [authState, setAuthState] = useState(() => {
    const storedToken = getStoredToken();

    return {
      token: storedToken,
      user: storedToken ? readStoredUser() : null,
      loading: Boolean(storedToken),
    };
  });

  const { token, user, loading } = authState;

  useEffect(() => {
    let ignore = false;

    const syncStorage = async () => {
      if (!token) {
        setAuthState((current) => ({ ...current, loading: false }));
        return;
      }

      setAuthState((current) => ({ ...current, loading: true }));

      try {
        const response = await profileService.getProfile();
        const profile = normalizeProfile(response.data);

        storeAuthUser(profile);

        if (!ignore) {
          setAuthState({ token, user: profile, loading: false });
        }
      } catch {
        clearStoredAuth();

        if (!ignore) {
          setAuthState({ token: "", user: null, loading: false });
        }
      } finally {
        if (!ignore) {
          setAuthState((current) => ({ ...current, loading: false }));
        }
      }
    };

    void syncStorage();

    return () => {
      ignore = true;
    };
  }, [token]);

  useEffect(() => {
    const handleSessionCleared = () => {
      setAuthState({ token: "", user: null, loading: false });
    };

    const handleStorage = (event) => {
      if (event.key !== TOKEN_KEY && event.key !== USER_KEY) {
        return;
      }

      const storedToken = getStoredToken({ notifyOnExpired: true });
      setAuthState({
        token: storedToken,
        user: storedToken ? readStoredUser() : null,
        loading: Boolean(storedToken),
      });
    };

    window.addEventListener(AUTH_SESSION_CLEARED_EVENT, handleSessionCleared);
    window.addEventListener("storage", handleStorage);

    return () => {
      window.removeEventListener(AUTH_SESSION_CLEARED_EVENT, handleSessionCleared);
      window.removeEventListener("storage", handleStorage);
    };
  }, []);

  useEffect(() => {
    const expiryTime = getTokenExpiryTime(token);

    if (!token || !expiryTime) {
      return undefined;
    }

    const expireSession = () => {
      clearStoredAuth({ notify: true });
      setAuthState({ token: "", user: null, loading: false });
    };

    const delay = expiryTime - Date.now();

    if (delay <= 0) {
      window.queueMicrotask(expireSession);
      return undefined;
    }

    const timeoutId = window.setTimeout(
      expireSession,
      Math.min(delay, 2147483647),
    );

    return () => window.clearTimeout(timeoutId);
  }, [token]);

  const login = async (values) => {
    const loginResponse = await authService.login(values);
    const nextToken =
      loginResponse.data?.token ||
      loginResponse.data?.Token ||
      loginResponse.data?.accessToken ||
      loginResponse.data?.AccessToken ||
      "";

    if (!nextToken) {
      throw new Error("Login failed because the server did not return a token.");
    }

    storeAuthToken(nextToken);

    try {
      const profileResponse = await profileService.getProfile();
      const profile = normalizeProfile(profileResponse.data);

      storeAuthUser(profile);
      setAuthState({ token: nextToken, user: profile, loading: false });

      return profile;
    } catch (error) {
      clearStoredAuth({ notify: true });
      setAuthState({ token: "", user: null, loading: false });
      throw error;
    }
  };

  const register = async (values) => authService.register(values);

  const logout = useCallback(() => {
    clearStoredAuth({ notify: true });
    setAuthState({ token: "", user: null, loading: false });
  }, []);

  const refreshProfile = async () => {
    const response = await profileService.getProfile();
    const profile = normalizeProfile(response.data);

    storeAuthUser(profile);
    setAuthState((current) => ({ ...current, user: profile }));

    return profile;
  };

  const setUser = useCallback((nextUser) => {
    const profile = normalizeProfile(nextUser);

    if (profile) {
      storeAuthUser(profile);
    } else {
      localStorage.removeItem(USER_KEY);
    }

    setAuthState((current) => ({ ...current, user: profile }));
  }, []);

  const value = useMemo(
    () => ({
      token,
      user,
      loading,
      isAuthenticated: Boolean(token && user),
      login,
      register,
      logout,
      refreshProfile,
      setUser,
    }),
    [token, user, loading, logout, setUser],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
