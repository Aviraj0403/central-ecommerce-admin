import Axios from '../utils/Axios';

// =======================
// USER ADDRESS API CALLS
// =======================

// Add new address
export const addAddress = async (addressData) => {
  const res = await Axios.post('/users/user/address', addressData);
  return res.data;
};

// Update existing address
export const updateAddress = async (id, updatedData) => {
  const res = await Axios.patch(`/users/user/address/${id}`, updatedData);
  return res.data;
};

// Delete address by ID
export const deleteAddress = async (id) => {
  const res = await Axios.delete(`/users/user/address/${id}`);
  return res.data;
};

// Set default address
export const setDefaultAddress = async (id) => {
  const res = await Axios.patch(`/users/user/address/${id}/set-default`);
  return res.data;
};

// Get all addresses for logged-in user
export const getUserAddresses = async () => {
  const res = await Axios.get('/users/user/getaddresses');
  return res.data.addresses; // adjust based on your controller's return
};

// =======================
// USER METRICS / ADMIN
// =======================

// Get total users (admin/stat)
export const getTotalUsers = async () => {
  const res = await Axios.get('/users/user/gettotalusers');
  return res.data.total; // e.g., { total: 25 }
};
