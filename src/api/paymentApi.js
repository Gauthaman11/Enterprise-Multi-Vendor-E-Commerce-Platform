import axios from "axios";

const BASE_URL = "http://localhost:8080/api";

const getHeaders = () => {
  const token =
    localStorage.getItem("token") ||
    localStorage.getItem("jwt") ||
    localStorage.getItem("accessToken");
  return token ? { Authorization: `Bearer ${token}` } : {};
};

export const initiatePayment = () =>
  axios.post(`${BASE_URL}/customer/payments/initiate`, {}, { headers: getHeaders() });

export const verifyPayment = (payload, addressId) =>
  axios.post(
    `${BASE_URL}/customer/payments/verify?addressId=${addressId}`,
    payload,
    { headers: getHeaders() }
  );