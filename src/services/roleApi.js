import Axios from '../utils/Axios';

export const getRoles = async () => {
  try {
    const res = await Axios.get('/roles');
    return res.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

export const createRole = async (roleData) => {
  try {
    const res = await Axios.post('/roles', roleData);
    return res.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

export const updateRole = async (id, roleData) => {
  try {
    const res = await Axios.patch(`/roles/${id}`, roleData);
    return res.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

export const deleteRole = async (id) => {
  try {
    const res = await Axios.delete(`/roles/${id}`);
    return res.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};
