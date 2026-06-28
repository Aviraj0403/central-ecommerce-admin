import axios from '../utils/Axios';

// Calculate shipping charges
export const calculateShippingCharges = async (data) => {
  try {
    const response = await axios.post('/shipping/calculate-charges', data);
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

// Check pincode serviceability
export const checkPincodeServiceability = async (pincode) => {
  try {
    const response = await axios.get(`/shipping/check-serviceability/${pincode}`);
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

// Create shipment for order (Admin only)
export const createShipment = async (orderId, data = {}) => {
  try {
    const response = await axios.post(`/shipping/create-shipment/${orderId}`, data);
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

// Generate shipping label (Admin only)
export const generateShippingLabel = async (orderId) => {
  try {
    const response = await axios.post(`/shipping/generate-label/${orderId}`);
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

// Track order shipment
export const trackOrderShipment = async (orderId) => {
  try {
    const response = await axios.get(`/shipping/order/${orderId}`);
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

// Cancel shipment (Admin only)
export const cancelShipment = async (orderId) => {
  try {
    const response = await axios.delete(`/shipping/cancel-shipment/${orderId}`);
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

// Get all shipments (Admin only)
export const getAllShipments = async (params = {}) => {
  try {
    const response = await axios.get('/shipping/admin/shipments', { params });
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

// Bulk update tracking (Admin only)
export const bulkUpdateTracking = async () => {
  try {
    const response = await axios.post('/shipping/admin/bulk-update-tracking');
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

// Get shipping analytics (Admin only)
export const getShippingAnalytics = async (params = {}) => {
  try {
    const response = await axios.get('/shipping/admin/analytics', { params });
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

// Admin Shipping Management APIs
export const getShippingDashboard = async (params = {}) => {
  try {
    const response = await axios.get('/admin/shipping/dashboard', { params });
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

export const getOrdersReadyForShipping = async (params = {}) => {
  try {
    const response = await axios.get('/admin/shipping/ready-orders', { params });
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

export const bulkCreateShipments = async (orderIds) => {
  try {
    const response = await axios.post('/admin/shipping/bulk-create-shipments', { orderIds });
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

export const bulkGenerateLabels = async (orderIds) => {
  try {
    const response = await axios.post('/admin/shipping/bulk-generate-labels', { orderIds });
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

export const updateOrderShippingStatus = async (orderId, data) => {
  try {
    const response = await axios.put(`/admin/shipping/order-status/${orderId}`, data);
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

export const getPickupLocations = async () => {
  try {
    const response = await axios.get('/admin/shipping/pickup-locations');
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

export const getShippingReports = async (params = {}) => {
  try {
    const response = await axios.get('/admin/shipping/reports', { params });
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

export const getWalletBalance = async () => {
  try {
    const response = await axios.get('/admin/shipping/wallet-balance');
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

export const schedulePickup = async (shipmentIds) => {
  try {
    const response = await axios.post('/admin/shipping/schedule-pickup', { shipmentIds });
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

export const generateManifest = async (shipmentIds) => {
  try {
    const response = await axios.post('/admin/shipping/manifests/generate', { shipmentIds });
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

export const printManifest = async (manifestIds) => {
  try {
    const response = await axios.post('/admin/shipping/manifests/print', { manifestIds });
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

export const createReturnOrder = async (orderId, reason) => {
  try {
    const response = await axios.post('/admin/shipping/return-order', { orderId, reason });
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

// Tracking Service APIs
export const triggerBulkTrackingUpdate = async () => {
  try {
    const response = await axios.post('/admin/shipping/trigger-bulk-tracking');
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

export const updateSpecificOrdersTracking = async (orderIds) => {
  try {
    const response = await axios.post('/admin/shipping/update-specific-tracking', { orderIds });
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

export const getTrackingServiceStats = async () => {
  try {
    const response = await axios.get('/admin/shipping/tracking-stats');
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

// Customer tracking APIs
export const getCustomerOrdersWithTracking = async (params = {}) => {
  try {
    const response = await axios.get('/customer/orders', { params });
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

export const getOrderTracking = async (orderId) => {
  try {
    const response = await axios.get(`/customer/orders/${orderId}/tracking`);
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

export const cancelCustomerOrder = async (orderId, reason) => {
  try {
    const response = await axios.put(`/customer/orders/${orderId}/cancel`, { reason });
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

export const syncOrders = async () => {
  try {
    const response = await axios.post('/admin/shipping/sync-orders');
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

export const getActiveShippingGateway = async () => {
  try {
    const response = await axios.get('/admin/shipping/active-gateway');
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

export const setActiveShippingGateway = async (gateway) => {
  try {
    const response = await axios.post('/admin/shipping/active-gateway', { gateway });
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};