import api from "./axios";

// Note: No need for getHeaders() or BASE_URL! 
// The './axios' file handles the baseURL ('/api') and the Bearer token automatically.

export const initiatePayment = (couponCode) =>
  api.post("/customer/payments/initiate", {}, {
    params: couponCode ? { couponCode } : {},
  });

export const verifyPayment = (payload, addressId, couponCode) =>
  api.post("/customer/payments/verify", payload, {
    params: { addressId, ...(couponCode ? { couponCode } : {}) },
  });

export const placeCodOrder = (addressId, couponCode) =>
  api.post("/customer/payments/cod", {}, {
    params: { addressId, ...(couponCode ? { couponCode } : {}) },
  });
