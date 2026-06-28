import React, { useState } from 'react';
import { toast } from 'react-hot-toast';
import { 
  Search, 
  Package, 
  Truck, 
  Clock, 
  CheckCircle, 
  XCircle,
  MapPin,
  AlertCircle
} from 'lucide-react';
import { getOrderTracking } from '../services/ShiprocketApi';

const OrderTrackingWidget = ({ orderId: initialOrderId, showSearch = true }) => {
  const [orderId, setOrderId] = useState(initialOrderId || '');
  const [trackingData, setTrackingData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleTrackOrder = async (e) => {
    if (e) e.preventDefault();
    
    const orderIdToTrack = orderId.trim();
    if (!orderIdToTrack) {
      toast.error('Please enter an Order ID');
      return;
    }

    try {
      setLoading(true);
      setError('');
      setTrackingData(null);

      const response = await getOrderTracking(orderIdToTrack);
      
      if (response.success) {
        setTrackingData(response);
        toast.success('Order tracking information retrieved');
      } else {
        setError(response.message || 'Order not found or tracking information unavailable');
      }
    } catch (error) {
      console.error('Error tracking order:', error);
      setError(error.message || 'Failed to track order. Please check your Order ID.');
    } finally {
      setLoading(false);
    }
  };

  // Auto-track if orderId is provided initially
  React.useEffect(() => {
    if (initialOrderId && !trackingData) {
      handleTrackOrder();
    }
  }, [initialOrderId]);

  const getStatusColor = (status) => {
    const statusColors = {
      'Delivered': 'bg-green-100 text-green-800 border-green-200',
      'Shipped': 'bg-blue-100 text-blue-800 border-blue-200',
      'Processing': 'bg-yellow-100 text-yellow-800 border-yellow-200',
      'Cancelled': 'bg-red-100 text-red-800 border-red-200',
      'Pending': 'bg-gray-100 text-gray-800 border-gray-200',
      'default': 'bg-gray-100 text-gray-800 border-gray-200'
    };
    return statusColors[status] || statusColors.default;
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'Delivered':
        return <CheckCircle className="w-4 h-4" />;
      case 'Shipped':
        return <Truck className="w-4 h-4" />;
      case 'Processing':
        return <Clock className="w-4 h-4" />;
      case 'Cancelled':
        return <XCircle className="w-4 h-4" />;
      default:
        return <Package className="w-4 h-4" />;
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleString('en-IN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="max-w-2xl mx-auto">
      {/* Search Form */}
      {showSearch && (
        <div className="bg-white rounded-lg shadow-md border border-gray-200 p-4 mb-4">
          <form onSubmit={handleTrackOrder} className="flex gap-2">
            <div className="flex-1 relative">
              <Package className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                value={orderId}
                onChange={(e) => setOrderId(e.target.value)}
                placeholder="Enter your order ID"
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-400 focus:border-orange-400"
                disabled={loading}
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="flex items-center gap-2 px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 disabled:opacity-50"
            >
              <Search className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
              {loading ? 'Tracking...' : 'Track'}
            </button>
          </form>
        </div>
      )}

      {/* Error Message */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-5 h-5 text-red-500" />
            <p className="text-red-700">{error}</p>
          </div>
        </div>
      )}

      {/* Tracking Results */}
      {trackingData && (
        <div className="space-y-4">
          {/* Order Summary */}
          <div className="bg-white rounded-lg shadow-md border border-gray-200 p-4">
            <div className="flex justify-between items-start mb-3">
              <div>
                <h3 className="font-semibold text-gray-900">Order #{trackingData.order.order_number}</h3>
                <p className="text-sm text-gray-500">₹{trackingData.order.total_amount?.toFixed(2)}</p>
              </div>
              <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm font-medium border ${getStatusColor(trackingData.order.status)}`}>
                {getStatusIcon(trackingData.order.status)}
                {trackingData.order.status}
              </span>
            </div>
            
            {trackingData.tracking.awb_code && (
              <div className="text-sm text-gray-600">
                <p><span className="font-medium">AWB:</span> {trackingData.tracking.awb_code}</p>
                <p><span className="font-medium">Courier:</span> {trackingData.tracking.courier_name}</p>
              </div>
            )}
          </div>

          {/* Tracking Timeline */}
          {trackingData.tracking.timeline && trackingData.tracking.timeline.length > 0 && (
            <div className="bg-white rounded-lg shadow-md border border-gray-200 p-4">
              <h4 className="font-medium text-gray-900 mb-4">Tracking Timeline</h4>
              <div className="space-y-3">
                {trackingData.tracking.timeline.map((update, index) => (
                  <div key={index} className="flex items-start gap-3">
                    <div className="flex-shrink-0">
                      <div className={`w-3 h-3 rounded-full mt-1.5 ${update.completed ? 'bg-orange-400' : 'bg-gray-300'}`}></div>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <p className={`text-sm font-medium ${update.completed ? 'text-gray-900' : 'text-gray-500'}`}>
                          {update.status}
                        </p>
                        <span className="text-xs text-gray-500">
                          {formatDate(update.timestamp)}
                        </span>
                      </div>
                      <p className="text-sm text-gray-600">{update.description}</p>
                      {update.location && (
                        <div className="flex items-center gap-1 mt-1">
                          <MapPin className="w-3 h-3 text-gray-400" />
                          <span className="text-xs text-gray-500">{update.location}</span>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Estimated Delivery */}
          {trackingData.order.estimated_delivery && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="flex items-center gap-2">
                <Clock className="w-5 h-5 text-blue-500" />
                <div>
                  <p className="font-medium text-blue-900">Estimated Delivery</p>
                  <p className="text-sm text-blue-700">
                    {formatDate(trackingData.order.estimated_delivery)}
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default OrderTrackingWidget;