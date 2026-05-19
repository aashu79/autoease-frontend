import { z } from "zod";

const requiredText = (label) => z.string().trim().min(1, `${label} is required.`);
const positiveId = (label) => z.coerce.number().min(1, `${label} is required.`);
const money = (label) => z.coerce.number().min(0, `${label} is required.`);

export const loginSchema = z.object({
  email: requiredText("Email").email("Enter a valid email address."),
  password: requiredText("Password"),
});

export const registerSchema = z.object({
  name: requiredText("Name"),
  email: requiredText("Email").email("Enter a valid email address."),
  phone: requiredText("Phone"),
  password: requiredText("Password").min(6, "Password must be at least 6 characters."),
});

export const profileSchema = z.object({
  name: requiredText("Name"),
  phone: requiredText("Phone"),
});

export const vehicleSchema = z.object({
  model: requiredText("Model"),
  plateNumber: requiredText("Plate number"),
});

export const appointmentSchema = z.object({
  vehicleId: positiveId("Vehicle"),
  staffId: positiveId("Staff"),
  scheduledAt: requiredText("Schedule date"),
});

export const partRequestSchema = z.object({
  partName: requiredText("Part name"),
});

export const reviewSchema = z.object({
  rating: z.coerce.number().min(1, "Rating is required.").max(5, "Rating cannot exceed 5."),
  comment: requiredText("Comment"),
});

export const partSchema = z.object({
  vendorId: positiveId("Vendor"),
  name: requiredText("Part name"),
  unitPrice: money("Unit price"),
  stockQuantity: z.coerce.number().min(0, "Stock quantity is required."),
});

export const vendorSchema = z.object({
  name: requiredText("Vendor name"),
  phone: requiredText("Phone"),
});

export const customerSearchSchema = z.object({
  query: requiredText("Search query"),
});

export const staffCustomerSchema = z.object({
  name: requiredText("Name"),
  email: requiredText("Email").email("Enter a valid email address."),
  password: requiredText("Password").min(6, "Password must be at least 6 characters."),
  phone: requiredText("Phone"),
  vehicleModel: requiredText("Vehicle model"),
  plateNumber: requiredText("Plate number"),
});

export const staffSchema = z.object({
  name: requiredText("Name"),
  email: requiredText("Email").email("Enter a valid email address."),
  password: requiredText("Password").min(6, "Password must be at least 6 characters."),
  phone: requiredText("Phone"),
});

export const invoiceSchema = z.object({
  customerId: positiveId("Customer"),
  vendorId: positiveId("Vendor"),
  type: requiredText("Invoice type"),
  dueDate: requiredText("Due date"),
  partId: positiveId("Part"),
  quantity: z.coerce.number().min(1, "Quantity is required."),
  unitPrice: money("Unit price"),
});

export function toApiDate(value) {
  if (!value) {
    return value;
  }

  return new Date(value).toISOString();
}

export function fieldStatus(error) {
  return error ? "error" : "";
}
