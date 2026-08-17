import axios from "axios";

const BASE_URL = "http://localhost:8080/api";

const getHeaders = () => {
  const token =
    localStorage.getItem("token") ||
    localStorage.getItem("jwt") ||
    localStorage.getItem("accessToken");
  return token ? { Authorization: `Bearer ${token}` } : {};
};

// ---------- Products ----------
export const getProducts = () => 
  axios.get(`${BASE_URL}/products`);

export const getProductById = (id) => 
  axios.get(`${BASE_URL}/products/${id}`, { headers: getHeaders() });

// ---------- Wishlist ----------
export const getWishlist = () =>
  axios.get(`${BASE_URL}/customer/wishlist`, { headers: getHeaders() });

export const addToWishlist = (productId) =>
  axios.post(`${BASE_URL}/customer/wishlist`, { productId }, { headers: getHeaders() });

export const removeFromWishlist = (productId) =>
  axios.delete(`${BASE_URL}/customer/wishlist/${productId}`, { headers: getHeaders() });

// ---------- Cart ----------
export const getCart = () =>
  axios.get(`${BASE_URL}/customer/cart`, { headers: getHeaders() });

export const addToCart = (productId, quantity = 1) =>
  axios.post(`${BASE_URL}/customer/cart`, { productId, quantity }, { headers: getHeaders() });

export const updateCartQty = (id, quantity) =>
  axios.put(`${BASE_URL}/customer/cart/${id}`, { productId: id, quantity }, { headers: getHeaders() });

export const removeCartItem = (id) =>
  axios.delete(`${BASE_URL}/customer/cart/${id}`, { headers: getHeaders() });

export const clearCart = () =>
  axios.delete(`${BASE_URL}/customer/cart`, { headers: getHeaders() });

// ---------- Orders ----------
export const getMyOrders = () => 
  axios.get(`${BASE_URL}/customer/orders`, { headers: getHeaders() });

export const cancelOrder = (id) => 
  axios.put(`${BASE_URL}/customer/orders/${id}/cancel`, {}, { headers: getHeaders() });

// ---------- Profile ----------
export const getProfile = () => 
  axios.get(`${BASE_URL}/customer/profile`, { headers: getHeaders() });

export const updateProfile = (data) => 
  axios.put(`${BASE_URL}/customer/profile`, data, { headers: getHeaders() });

// ---------- ADDRESS MANAGEMENT ----------
export const getAddresses = () =>
  axios.get(`${BASE_URL}/customer/address`, { headers: getHeaders() });

export const addAddress = (address) =>
  axios.post(`${BASE_URL}/customer/address`, address, { headers: getHeaders() });

export const updateAddress = (id, address) =>
  axios.put(`${BASE_URL}/customer/address/${id}`, address, { headers: getHeaders() });

export const deleteAddress = (id) =>
  axios.delete(`${BASE_URL}/customer/address/${id}`, { headers: getHeaders() });

export const setDefaultAddress = (id) =>
  axios.put(`${BASE_URL}/customer/address/${id}/default`, {}, { headers: getHeaders() });

export const requestReturn = (orderId, reason) =>
  axios.put(`${BASE_URL}/customer/orders/${orderId}/return`, null, { 
    params: { reason }, 
    headers: getHeaders() 
  });