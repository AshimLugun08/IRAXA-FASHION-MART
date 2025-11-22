import axios from "axios";

const API = import.meta.env.VITE_BACKEND_URL;

// Get all addresses
export const getAddresses = () =>
  axios.get(`${API}/address`);

// Add new address
export const addAddress = (data) =>
  axios.post(`${API}/address`, data);

// Edit address
export const updateAddress = (id, data) =>
  axios.put(`${API}/address/${id}`, data);

// Delete address
export const deleteAddress = (id) =>
  axios.delete(`${API}/address/${id}`);
