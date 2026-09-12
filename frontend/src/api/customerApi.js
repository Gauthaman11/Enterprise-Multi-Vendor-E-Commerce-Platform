import api from "./axios"; 

// Note: We do NOT need getHeaders() anymore! 
// Your axios.js interceptor automatically adds the Bearer token to EVERY request.
// Also, axios.js already sets the baseURL to '/api', so we just use the path.

// ---------- Products ----------
export const getProducts = () => 
  api.get("/products");

export const getProductById = (id) => 
  api.get(`/products/${id}`);

// ---------- Wishlist ----------
export const getWishlist = () =>
  api.get("/customer/wishlist");

export const addToWishlist = (productId) =>
  api.post("/customer/wishlist", { productId });

export const removeFromWishlist = (productId) =>
  api.delete(`/customer/wishlist/${productId}`);

// ---------- Cart ----------
export const getCart = () =>
  api.get("/customer/cart");

export const addToCart = (productId, quantity = 1) =>
  api.post("/customer/cart", { productId, quantity });

export const updateCartQty = (id, quantity) =>
  api.put(`/customer/cart/${id}`, { productId: id, quantity });

export const removeCartItem = (id) =>
  api.delete(`/customer/cart/${id}`);

export const clearCart = () =>
  api.delete("/customer/cart");

// ---------- Orders ----------
export const getMyOrders = () => 
  api.get("/customer/orders");

export const cancelOrder = (id) => 
  api.put(`/customer/orders/${id}/cancel`, {});

// ---------- Profile ----------
export const getProfile = () => 
  api.get("/customer/profile");

export const updateProfile = (data) => 
  api.put("/customer/profile", data);

// ---------- ADDRESS MANAGEMENT ----------
export const getAddresses = () =>
  api.get("/customer/address");

export const addAddress = (address) =>
  api.post("/customer/address", address);

export const updateAddress = (id, address) =>
  api.put(`/customer/address/${id}`, address);

export const deleteAddress = (id) =>
  api.delete(`/customer/address/${id}`);

export const setDefaultAddress = (id) =>
  api.put(`/customer/address/${id}/default`, {});

export const validateCoupon = (code, orderTotal) =>
  api.get("/customer/coupons/validate", {
    params: { code, orderTotal }
  });
