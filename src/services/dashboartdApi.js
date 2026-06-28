// api.js
import axios from '../utils/Axios';

export const getTodayOrders = async () => {
  try {
    const response = await axios.get('/orders/reports/today');
    return response.data;
  } catch (err) {
    console.error('Error fetching today\'s orders:', err);
  }
};

export const getTotalRevenue = async () => {
  try {
    const response = await axios.get('/orders/total-revenue');
    return response.data.totalRevenue;
  } catch (err) {
    console.error('Error fetching total revenue:', err);
  }
};

export const getTotalOrders = async () => {
  try {
    const response = await axios.get('/orders/reports/total');
    return response.data.totalOrders;
  } catch (err) {
    console.error('Error fetching total orders:', err);
  }
};

export const getWeeklyStats = async () => {
  try {
    const response = await axios.get('/orders/stats/weekly');
    return response.data.stats;
  } catch (err) {
    console.error('Error fetching weekly stats:', err);
  }
};

export const getMonthlyStats = async () => {
  try {
    const response = await axios.get('/orders/stats/monthly');
    return response.data.stats;
  } catch (err) {
    console.error('Error fetching monthly stats:', err);
  }
};

export const getTotalUsers = async () => {
  try {
    const response = await axios.get('/users/gettotalusers');
    return response.data.totalUsers;
  } catch (err) {
    console.error('Error fetching total users:', err);
  }
};

export const getTotalProducts = async () => {
  try {
    const response = await axios.get('/products/getTotalProduct');
    return response.data.totalProduct;  // Assuming the response contains { success: true, totalProducts: <number> }
  } catch (err) {
    console.error('Error fetching total products:', err);
  }
};

export const redisCache = async () => {
  try {
    const response = await axios.post('/redis/clear-redis');
    return response.data;
  } catch (err) {
    console.error('Error triggering Redis cache:', err);
  }
};

export const clearRedisCache = async () => {
  try {
    const response = await axios.delete('/redis/clear-redis-cache');
    return response.data;
  } catch (err) {
    console.error('Error clearing Redis cache:', err);
  }
};