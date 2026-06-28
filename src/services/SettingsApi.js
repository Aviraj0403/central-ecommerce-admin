import axios from '../utils/Axios';

// Fetch system settings
export const getSettings = async () => {
  try {
    const response = await axios.get('/admin/settings');
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

// Update system settings
export const updateSettings = async (settings) => {
  try {
    const response = await axios.put('/admin/settings', settings);
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};
