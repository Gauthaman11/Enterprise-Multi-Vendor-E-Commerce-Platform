import axios from "axios";

const BASE_URL = "http://localhost:8080/api";

const getHeaders = () => {
  const token =
    localStorage.getItem("token") ||
    localStorage.getItem("jwt") ||
    localStorage.getItem("accessToken") ||
    localStorage.getItem("authToken");
  return token ? { Authorization: `Bearer ${token}` } : {};
};

// ==========================================
// WISHLIST APIs (Matches /api/customer/wishlist)
// ==========================================
export const getWishlist = () =>
  axios.get(`${BASE_URL}/customer/wishlist`, { headers: getHeaders() });

// ✅ FIXED: POST to base URL with JSON body { productId }
export const addToWishlist = (productId) =>
  axios.post(
    `${BASE_URL}/customer/wishlist`,
    { productId }, 
    { headers: getHeaders() }
  );

export const removeFromWishlist = (productId) =>
  axios.delete(`${BASE_URL}/customer/wishlist/${productId}`, { headers: getHeaders() });

// ==========================================
// CART APIs (Matches /api/customer/cart)
// ==========================================
export const getCart = () =>
  axios.get(`${BASE_URL}/customer/cart`, { headers: getHeaders() });

// ✅ FIXED: POST to base URL with JSON body { productId, quantity }
export const addToCart = (productId, quantity = 1) =>
  axios.post(
    `${BASE_URL}/customer/cart`,
    { productId, quantity }, 
    { headers: getHeaders() }
  );

// Matches @PutMapping("/{id}")
export const updateCartQty = (id, quantity) =>
  axios.put(
    `${BASE_URL}/customer/cart/${id}`,
    { productId: id, quantity }, 
    { headers: getHeaders() }
  );

// Matches @DeleteMapping("/{id}")
export const removeCartItem = (id) =>
  axios.delete(`${BASE_URL}/customer/cart/${id}`, { headers: getHeaders() });

// Matches @DeleteMapping (Clear cart)
export const clearCart = () =>
  axios.delete(`${BASE_URL}/customer/cart`, { headers: getHeaders() });

// ==========================================
// PRODUCTS, ORDERS, PROFILE
// ==========================================
export const getProducts = () => 
  axios.get(`${BASE_URL}/products`);

export const getProductById = (id) => 
  axios.get(`${BASE_URL}/products/${id}`, { headers: getHeaders() });

export const searchProducts = (keyword) =>
  axios.get(`${BASE_URL}/products/search`, { params: { keyword } });

export const getMyOrders = () => 
  axios.get(`${BASE_URL}/customer/orders`, { headers: getHeaders() });

export const cancelOrder = (id) => 
  axios.put(`${BASE_URL}/customer/orders/${id}/cancel`, {}, { headers: getHeaders() });

export const getProfile = () => 
  axios.get(`${BASE_URL}/customer/profile`, { headers: getHeaders() });

export const updateProfile = (data) => 
  axios.put(`${BASE_URL}/customer/profile`, data, { headers: getHeaders() });
// Add this to your existing customerApi.js
export const checkoutOrder = () =>
  axios.post(`${BASE_URL}/customer/orders/checkout`, {}, { headers: getHeaders() });