import Axios from '../utils/Axios';
export const fetchOrdersWithPayments = async (page = 1, limit = 10) => {
  try {
    const response = await Axios.get('/v1/api/razorpay/orders-with-payments', {
      params: { page, limit },
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching orders:', error);
    return { success: false, data: [], message: error.message };
  }
};