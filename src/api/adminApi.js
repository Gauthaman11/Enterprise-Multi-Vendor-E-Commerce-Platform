import api from "./axios";

// Dashboard
export const getDashboard = () =>
  api.get("/admin/dashboard");

// Products
export const getPendingProducts = () =>
  api.get("/admin/products/pending");

export const getAllProducts = () =>
  api.get("/admin/products");

export const approveProduct = (id) =>
  api.put(`/admin/products/${id}/approve`);

export const rejectProduct = (id) =>
  api.put(`/admin/products/${id}/reject`);

export const enableProduct = (id) =>
  api.patch(`/admin/products/${id}/enable`);

export const disableProduct = (id) =>
  api.patch(`/admin/products/${id}/disable`);

// Categories
export const getCategories = () =>
  api.get("/admin/categories");

export const addCategory = (data) =>
  api.post("/admin/categories", data);

export const updateCategory = (id, data) =>
  api.put(`/admin/categories/${id}`, data);

export const deleteCategory = (id) =>
  api.delete(`/admin/categories/${id}`);

// Users
export const getUsers = () =>
  api.get("/admin/users");

export const getCustomers = () =>
  api.get("/admin/users/customers");

export const getVendors = () =>
  api.get("/admin/users/vendors");

export const getWarehouseStaff = () =>
  api.get("/admin/users/warehouse");

export const enableUser = (id) =>
  api.patch(`/admin/users/${id}/enable`);

export const disableUser = (id) =>
  api.patch(`/admin/users/${id}/disable`);