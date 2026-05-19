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
