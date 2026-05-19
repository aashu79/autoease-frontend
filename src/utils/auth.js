export const TOKEN_KEY = "auth_token";
export const USER_KEY = "auth_user";
export const AUTH_SESSION_CLEARED_EVENT = "autoease:auth-session-cleared";

function decodeJwtPayload(token) {
  const [, payload] = String(token).split(".");

  if (!payload) {
    return null;
  }

  try {
    const normalizedPayload = payload.replace(/-/g, "+").replace(/_/g, "/");
    const paddedPayload = normalizedPayload.padEnd(
      normalizedPayload.length + ((4 - (normalizedPayload.length % 4)) % 4),
      "=",
    );

    return JSON.parse(window.atob(paddedPayload));
  } catch {
    return null;
  }
}

export function isTokenExpired(token) {
  const expiryTime = getTokenExpiryTime(token);

  if (!expiryTime) {
    return false;
  }

  return expiryTime <= Date.now();
}

export function getTokenExpiryTime(token) {
  const payload = decodeJwtPayload(token);

  return payload?.exp ? payload.exp * 1000 : null;
}

export function clearStoredAuth({ notify = false } = {}) {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(USER_KEY);

  if (notify && typeof window !== "undefined") {
    window.dispatchEvent(new Event(AUTH_SESSION_CLEARED_EVENT));
  }
}

export function getStoredToken({ notifyOnExpired = false } = {}) {
  const token = localStorage.getItem(TOKEN_KEY) || "";

  if (token && isTokenExpired(token)) {
    clearStoredAuth({ notify: notifyOnExpired });
    return "";
  }

  return token;
}

export function storeAuthToken(token) {
  localStorage.setItem(TOKEN_KEY, token);
}

export function storeAuthUser(user) {
  localStorage.setItem(USER_KEY, JSON.stringify(user));
}

export function normalizeRole(role = "") {
  return String(role).trim().toLowerCase();
}

export function normalizeProfile(profile = null) {
  if (!profile) {
    return null;
  }

  return {
    id: profile.id ?? profile.Id,
    name: profile.name ?? profile.Name,
    email: profile.email ?? profile.Email,
    phoneNumber: profile.phoneNumber ?? profile.PhoneNumber ?? profile.phone ?? profile.Phone,
    phone: profile.phone ?? profile.Phone ?? profile.phoneNumber ?? profile.PhoneNumber,
    role: profile.role ?? profile.Role,
    Id: profile.id ?? profile.Id,
    Name: profile.name ?? profile.Name,
    Email: profile.email ?? profile.Email,
    PhoneNumber: profile.phoneNumber ?? profile.PhoneNumber ?? profile.phone ?? profile.Phone,
    Phone: profile.phone ?? profile.Phone ?? profile.phoneNumber ?? profile.PhoneNumber,
    Role: profile.role ?? profile.Role,
  };
}

export function getDashboardPath(role = "") {
  const normalizedRole = normalizeRole(role);

  if (normalizedRole === "admin") {
    return "/dashboard/admin/overview";
  }

  if (normalizedRole === "staff") {
    return "/dashboard/staff/overview";
  }

  return "/dashboard/customer/overview";
}

export function isRoleAllowed(role, allowedRoles = []) {
  return allowedRoles
    .map((item) => normalizeRole(item))
    .includes(normalizeRole(role));
}
