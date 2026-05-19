import api from "./client";

export const authService = {
  register: (payload) => api.post("/api/auth/register", payload),
  adminRegisterUser: (payload) =>
    api.post("/api/auth/admin/register-user", payload),
  login: (payload) => api.post("/api/auth/login", payload),
};

export const profileService = {
  getProfile: () => api.get("/api/profile"),
  updateProfile: (payload) => api.put("/api/profile", payload),
};

export const vehicleService = {
  getVehicles: () => api.get("/api/vehicles"),
  createVehicle: (payload) => api.post("/api/vehicles", payload),
  updateVehicle: (id, payload) => api.put(`/api/vehicles/${id}`, payload),
  deleteVehicle: (id) => api.delete(`/api/vehicles/${id}`),
};

export const appointmentService = {
  bookAppointment: (payload) => api.post("/api/appointments", payload),
  getMyAppointments: () => api.get("/api/appointments/my-appointments"),
  getAllCustomerAppointments: () => api.get("/api/appointments/customer/"),
};

export const partRequestService = {
  createPartRequest: (payload) => api.post("/api/partrequests", payload),
  getPartRequests: () => api.get("/api/partrequests"),
};

export const reviewService = {
  createReview: (payload) => api.post("/api/reviews", payload),
  getMyReviews: () => api.get("/api/reviews/my-reviews"),
  getAllReviews: () => api.get("/api/reviews/all"),
};

export const partsService = {
  getParts: () => api.get("/api/parts"),
  getPartById: (id) => api.get(`/api/parts/${id}`),
  createPart: (payload) => api.post("/api/parts", payload),
  updatePart: (id, payload) => api.put(`/api/parts/${id}`, payload),
  deletePart: (id) => api.delete(`/api/parts/${id}`),
};

export const vendorService = {
  createVendor: (payload) => api.post("/api/vendor/create", payload),
  getVendors: () => api.get("/api/vendor/list"),
  getVendorById: (id) => api.get(`/api/vendor/${id}`),
  updateVendor: (id, payload) => api.put(`/api/vendor/update/${id}`, payload),
  deleteVendor: (id) => api.delete(`/api/vendor/delete/${id}`),
};

export const staffCustomerService = {
  createCustomer: (payload) => api.post("/api/staff/customers", payload),
  getCustomer: (customerId) => api.get(`/api/staff/customers/${customerId}`),
  searchCustomers: (query) =>
    api.get("/api/staff/customers/search", { params: { query } }),
};

export const adminService = {
  createStaff: (payload) => api.post("/api/admin/create-staff", payload),
  getStaffList: () => api.get("/api/admin/staff-list"),
  getUsersByRole: (role) => api.get("/api/admin/users", { params: { role } }),
  updateRole: (id, payload) => api.put(`/api/admin/update-role/${id}`, payload),
  deleteStaff: (id) => api.delete(`/api/admin/delete-staff/${id}`),
};

export const invoiceService = {
  createInvoice: (customerId, payload) =>
    api.post("/api/invoices", payload, { params: { customerId } }),
  getHistory: () => api.get("/api/invoices/history"),
  getAllInvoices: () => api.get("/api/Invoice"),
  sendSalesInvoiceEmail: (id) => api.post(`/api/invoices/${id}/send-email`),
};

export const reportService = {
  getDailyFinancial: () => api.get("/api/reports/financial/daily"),
  getMonthlyFinancial: () => api.get("/api/reports/financial/monthly"),
  getYearlyFinancial: () => api.get("/api/reports/financial/yearly"),

  getRegularCustomers: () => api.get("/api/reports/customers/regulars"),
  getHighSpendingCustomers: () =>
    api.get("/api/reports/customers/high-spenders"),
  getPendingCredits: () => api.get("/api/reports/customers/pending-credits"),
};
