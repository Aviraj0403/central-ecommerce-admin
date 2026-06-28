import Axios from '../utils/Axios';


export const login = (data) => Axios.post('/auth/signIn', data);

// ========== AUTH ==========

// Custom Email/Password Register
export const customRegister = async (userData) => {
  const res = await Axios.post('/auth/customRegister', userData);
  return res.data;
};

// Google OAuth Registration
export const registerViaGoogle = async (googleToken) => {
  const res = await Axios.post('/auth/register/google', { token: googleToken });
  return res.data;
};

// Phone-based Registration
export const registerViaPhone = async (phoneData) => {
  const res = await Axios.post('/auth/register/phone', phoneData);
  return res.data;
};

// Sign In
export const signIn = async (credentials) => {
  const res = await Axios.post('/auth/signIn', credentials);
  return res.data;
};

// Logout
export const logout = async () => {
  const res = await Axios.post('/auth/user/logout');
  return res.data;
};

// Forgot Password
export const forgotPassword = async (emailOrPhone) => {
  const res = await Axios.post('/auth/user/forgotPassword', emailOrPhone);
  return res.data;
};

// Reset Password
export const resetPassword = async (data) => {
  const res = await Axios.post('/auth/user/resetPassword', data);
  return res.data;
};

// Verify OTP
export const verifyOtp = async (otpData) => {
  const res = await Axios.post('/auth/user/verifyOtp', otpData);
  return res.data;
};

// Get Logged-in User Profile
export const getUserProfile = async () => {
  const res = await Axios.get('/auth/user/profile');
  return res.data.user;
};

// Update Profile
export const updateUserProfile = async (updateData) => {
  const res = await Axios.patch('/auth/user/updateProfile', updateData);
  return res.data;
};

// Upload Avatar (form-data)
export const uploadAvatar = async (file) => {
  const formData = new FormData();
  formData.append('avatar', file);

  const res = await Axios.post('/auth/user/uploadAvatar', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });

  return res.data;
};

// Authenticated User Info (from /me)
export const authMe = async () => {
  try {
    const res = await Axios.get('/auth/me'); // No need to pass withCredentials here
    return res.data; // Assuming the response contains user data
  } catch (err) {
    console.error("Error fetching user info:", err);
    if (err.response) {
      if (err.response.status === 401) {
        throw new Error("Session expired or unauthorized. Please log in again.");
      } else {
        throw new Error(`Server error: ${err.response.status}`);
      }
    } else if (err.request) {
      throw new Error("Network error. Please check your connection.");
    } else {
      throw new Error("An unexpected error occurred.");
    }
  }
};


// Refresh Token
export const refreshToken = async () => {
  const res = await Axios.post('/auth/refresh-token');
  return res.data;
};


// Fetch all customers
export const getAllCustomers = async (page = 1, limit = 10) => {
  const res = await Axios.get(`/users/customers`, { params: { page, limit } });
  return res.data;
};

// Fetch all admins
export const getAllAdmins = async (page = 1, limit = 10) => {
  const res = await Axios.get(`/users/admins`, { params: { page, limit } });
  return res.data;
};

// Fetch all delivery boys
export const getAllDeliveryBoys = async (page = 1, limit = 10) => {
  const res = await Axios.get(`/users/deliveryBoys`, { params: { page, limit } });
  return res.data;
};

// Fetch all regular users
export const getAllUsers = async (page = 1, limit = 10) => {
  const res = await Axios.get(`/users/regular`, { params: { page, limit } });
  return res.data;
};

// Fetch user details by userId
export const getUserDetails = async (userId) => {
  const res = await Axios.get(`/users/user/${userId}`);
  return res.data;
};

// Create Admin (JDInfo only)
export const createAdmin = async (adminData) => {
  const res = await Axios.post('/admin/create-admin', adminData);
  return res.data;
};

// Update Admin Permissions (JDInfo only)
export const updateAdminPermissions = async (data) => {
  const res = await Axios.put('/admin/update-permissions', data);
  return res.data;
};

// Update Admin Role (JDInfo / Superadmin only)
export const updateAdminRole = async (data) => {
  const res = await Axios.put('/admin/update-role', data);
  return res.data;
};