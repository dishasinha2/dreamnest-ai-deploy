import { api } from "./client";

export const AuthAPI = {
  register: (payload) => api("/api/auth/register", { method: "POST", body: payload }),
  login: (payload) => api("/api/auth/login", { method: "POST", body: payload }),
  me: (token) => api("/api/auth/me", { token })
};

export const ProjectAPI = {
  list: (token) => api("/api/projects", { token }),
  get: (id, token) => api(`/api/projects/${id}`, { token }),
  create: (payload, token) => api("/api/projects", { method: "POST", body: payload, token }),
  remove: (id, token) => api(`/api/projects/${id}`, { method: "DELETE", token }),
  progress: (id, token) => api(`/api/projects/${id}/progress`, { token }),
  shortlist: (id, product_id, token) => api(`/api/projects/${id}/shortlist`, { method: "POST", body: { product_id }, token }),
  shortlistVendor: (id, vendor_id, token) => api(`/api/projects/${id}/vendors/shortlist`, { method: "POST", body: { vendor_id }, token }),
  shortlistedVendors: (id, token) => api(`/api/projects/${id}/vendors/shortlist`, { token })
};

export const RequirementsAPI = {
  add: (payload, token) => api("/api/requirements", { method: "POST", body: payload, token }),
  list: (projectId, token) => api(`/api/requirements/project/${projectId}`, { token })
};

export const ProductsAPI = {
  list: (params, token) => api(`/api/products?${new URLSearchParams(params)}`, { token }),
  live: (params) => api(`/api/products/live?${new URLSearchParams(params)}`)
};

export const VendorsAPI = {
  list: (params) => api(`/api/vendors?${new URLSearchParams(params)}`),
  get: (id) => api(`/api/vendors/${id}`),
  apply: (payload) => api("/api/vendors/apply", { method: "POST", body: payload }),
  applyForm: (formData) => api("/api/vendors/apply/form", { method: "POST", body: formData, isForm: true }),
  review: (vendorId, payload, token) => api(`/api/vendors/${vendorId}/reviews`, { method: "POST", body: payload, token }),
  view: (vendorId, payload, token) => api(`/api/vendors/${vendorId}/view`, { method: "POST", body: payload, token })
};

export const AdminAPI = {
  listApplications: (adminSecret) =>
    api("/api/vendors/applications", { headers: { "x-admin-secret": adminSecret } }),
  approveApplication: (id, adminSecret) =>
    api(`/api/vendors/applications/${id}/approve`, { method: "POST", headers: { "x-admin-secret": adminSecret } }),
  rejectApplication: (id, adminSecret) =>
    api(`/api/vendors/applications/${id}/reject`, { method: "POST", headers: { "x-admin-secret": adminSecret } }),
  createVendor: (payload, adminSecret) =>
    api("/api/vendors/admin", { method: "POST", body: payload, headers: { "x-admin-secret": adminSecret } }),
  uploadVendorImage: (formData, adminSecret) =>
    api("/api/vendors/admin/upload", { method: "POST", body: formData, isForm: true, headers: { "x-admin-secret": adminSecret } }),
  analytics: (adminSecret) =>
    api("/api/analytics/admin", { headers: { "x-admin-secret": adminSecret } }),
  ingestProducts: (items, adminSecret) =>
    api("/api/products/admin/ingest", { method: "POST", body: { items }, headers: { "x-admin-secret": adminSecret } }),
  deleteVendor: (id, adminSecret) =>
    api(`/api/vendors/admin/${id}`, { method: "DELETE", headers: { "x-admin-secret": adminSecret } }),
  deleteProduct: (id, adminSecret) =>
    api(`/api/products/admin/${id}`, { method: "DELETE", headers: { "x-admin-secret": adminSecret } })
};

export const ClicksAPI = {
  create: (payload, token) => api("/api/clicks", { method: "POST", body: payload, token })
};

export const AIAPI = {
  chat: (payload, token) => api("/api/ai/chat", { method: "POST", body: payload, token }),
  vision: (formData, token) => api("/api/ai/vision", { method: "POST", body: formData, token, isForm: true }),
  plan: (payload, token) => api("/api/ai/plan", { method: "POST", body: payload, token }),
  pinterest: (payload, token) => api("/api/ai/pinterest", { method: "POST", body: payload, token })
};

export const FeedbackAPI = {
  submit: (payload) => api("/api/feedback", { method: "POST", body: payload })
};
