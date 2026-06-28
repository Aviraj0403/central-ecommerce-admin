import React, { useState } from 'react';
import { toast } from 'react-hot-toast';
import { Package, Truck, MapPin, ExternalLink, RefreshCw, Download, Calculator } from 'lucide-react';
import axios from '../utils/Axios';

const ShippingManager = ({ order, onUpdate }) => {
  const [manualWeight, setManualWeight] = useState('');
  const [loading, setLoading] = useState(false);
  const [trackingLoading, setTrackingLoading] = useState(false);

  const shipping = order?.shipping || {};
  const shiprocket = shipping?.shiprocket || {};

  // Create Shiprocket shipment
  const createShipment = async () => {
    if (!order?._id) {
      toast.error('Order ID not found');
      return;
    }

    setLoading(true);
    try {
      const response = await axios.post(`/shipping/create-shipment/${order._id}`, {
        weight: manualWeight || undefined
      });

      if (response.data.success) {
        toast.success('Shipment created successfully!');
        setManualWeight('');
        onUpdate && onUpdate(); // Refresh order data
      } else {
        toast.error(response.data.message || 'Failed to create shipment');
      }
    } catch (error) {
      console.error('Create shipment error:', error);
      toast.error(error.response?.data?.message || 'Failed to create shipment');
    } finally {
      setLoading(false);
    }
  };

  // Generate shipping label
  const generateLabel = async () => {
    if (!shiprocket.shipment_id) {
      toast.error('No shipment found');
      return;
    }

    setLoading(true);
    try {
      const response = await axios.post(`/shipping/generate-label/${order._id}`);

      if (response.data.success) {
        toast.success('Label generated successfully!');
        // Open label URL in new tab
        if (response.data.label_url) {
          window.open(response.data.label_url, '_blank');
        }
        onUpdate && onUpdate();
      } else {
        toast.error(response.data.message || 'Failed to generate label');
      }
    } catch (error) {
      console.error('Generate label error:', error);
      toast.error(error.response?.data?.message || 'Failed to generate label');
    } finally {
      setLoading(false);
    }
  };

  // Update tracking information
  const updateTracking = async () => {
    if (!order?._id) {
      toast.error('Order ID not found');
      return;
    }

    setTrackingLoading(true);
    try {
      const response = await axios.get(`/shipping/order/${order._id}`);

      if (response.data.success) {
        toast.success('Tracking updated successfully!');
        onUpdate && onUpdate();
      } else {
        toast.error(response.data.message || 'Failed to update tracking');
      }
    } catch (error) {
      console.error('Update tracking error:', error);
      toast.error(error.response?.data?.message || 'Failed to update tracking');
    } finally {
      setTrackingLoading(false);
    }
  };

  // Cancel shipment
  const cancelShipment = async () => {
    if (!window.confirm('Are you sure you want to cancel this shipment?')) {
      return;
    }

    setLoading(true);
    try {
      const response = await axios.delete(`/shipping/cancel-shipment/${order._id}`);

      if (response.data.success) {
        toast.success('Shipment cancelled successfully!');
        onUpdate && onUpdate();
      } else {
        toast.error(response.data.message || 'Failed to cancel shipment');
      }
    } catch (error) {
      console.error('Cancel shipment error:', error);
      toast.error(error.response?.data?.message || 'Failed to cancel shipment');
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status) => {
    const colorMap = {
      'NEW': 'bg-blue-100 text-blue-800',
      'PICKED_UP': 'bg-green-100 text-green-800',
      'IN_TRANSIT': 'bg-yellow-100 text-yellow-800',
      'OUT_FOR_DELIVERY': 'bg-orange-100 text-orange-800',
      'DELIVERED': 'bg-green-100 text-green-800',
      'CANCELLED': 'bg-red-100 text-red-800',
      'RTO': 'bg-red-100 text-red-800'
    };
    return colorMap[status] || 'bg-gray-100 text-gray-800';
  };

  return (
    <div className="bg-white rounded-lg shadow-md border border-gray-200 p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
          <Truck className="w-5 h-5" />
          Shipping Management
        </h3>

        {shiprocket.awb_code && (
          <a
            href={`https://shiprocket.co/tracking/${shiprocket.awb_code}`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1 text-blue-600 hover:text-blue-700 text-sm"
          >
            Track on Shiprocket <ExternalLink className="w-4 h-4" />
          </a>
        )}
      </div>

      {/* Shipping Status */}
      {shiprocket.order_id ? (
        <div className="space-y-4">
          {/* Shiprocket Details */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div className="bg-gray-50 p-3 rounded-lg">
              <p className="text-xs text-gray-600">Shiprocket Order ID</p>
              <p className="font-semibold text-gray-800">{shiprocket.order_id}</p>
            </div>

            {shiprocket.shipment_id && (
              <div className="bg-gray-50 p-3 rounded-lg">
                <p className="text-xs text-gray-600">Shipment ID</p>
                <p className="font-semibold text-gray-800">{shiprocket.shipment_id}</p>
              </div>
            )}

            {shiprocket.awb_code && (
              <div className="bg-gray-50 p-3 rounded-lg">
                <p className="text-xs text-gray-600">AWB Code</p>
                <p className="font-semibold text-gray-800">{shiprocket.awb_code}</p>
              </div>
            )}

            {shipping.courier?.name && (
              <div className="bg-gray-50 p-3 rounded-lg">
                <p className="text-xs text-gray-600">Courier Partner</p>
                <p className="font-semibold text-gray-800">{shipping.courier.name}</p>
              </div>
            )}

            {shipping.estimated_delivery && (
              <div className="bg-gray-50 p-3 rounded-lg">
                <p className="text-xs text-gray-600">Estimated Delivery</p>
                <p className="font-semibold text-gray-800">
                  {new Date(shipping.estimated_delivery).toLocaleDateString('en-IN')}
                </p>
              </div>
            )}

            {shiprocket.current_status && (
              <div className="bg-gray-50 p-3 rounded-lg">
                <p className="text-xs text-gray-600">Current Status</p>
                <span className={`inline-block px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(shiprocket.current_status)}`}>
                  {shiprocket.current_status}
                </span>
              </div>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex flex-wrap gap-3">
            <button
              onClick={updateTracking}
              disabled={trackingLoading}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
            >
              <RefreshCw className={`w-4 h-4 ${trackingLoading ? 'animate-spin' : ''}`} />
              {trackingLoading ? 'Updating...' : 'Update Tracking'}
            </button>

            {shiprocket.shipment_id && !shiprocket.label_url && (
              <button
                onClick={generateLabel}
                disabled={loading}
                className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50"
              >
                <Download className="w-4 h-4" />
                Generate Label
              </button>
            )}

            {shiprocket.label_url && (
              <a
                href={shiprocket.label_url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
              >
                <Download className="w-4 h-4" />
                Download Label
              </a>
            )}

            {order.orderStatus !== 'Delivered' && order.orderStatus !== 'Cancelled' && (
              <button
                onClick={cancelShipment}
                disabled={loading}
                className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50"
              >
                Cancel Shipment
              </button>
            )}
          </div>
        </div>
      ) : (
        /* No Shipment Created */
        <div className="text-center py-8">
          <Package className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h4 className="text-lg font-medium text-gray-800 mb-2">No Shipment Created</h4>
          <p className="text-gray-600 mb-4">
            Create a Shiprocket shipment to start tracking this order.
          </p>

          {order.orderStatus === 'Processing' || order.orderStatus === 'Pending' ? (
            <div className="flex flex-col items-center gap-4 max-w-xs mx-auto">
              <div className="w-full">
                <label className="block text-xs font-black text-gray-500 uppercase tracking-widest mb-2 text-left">
                  Actual Shipment Weight (KG)
                </label>
                <div className="relative">
                  <Calculator className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type="number"
                    step="0.01"
                    placeholder={`Default: ${shipping.weight || '0.50'} kg`}
                    value={manualWeight}
                    onChange={(e) => setManualWeight(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-100 rounded-xl focus:ring-2 focus:ring-orange-500 transition-all font-bold text-sm"
                  />
                </div>
              </div>
              <button
                onClick={createShipment}
                disabled={loading}
                className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-orange-600 text-white rounded-lg hover:bg-orange-700 disabled:opacity-50"
              >
                <Truck className="w-5 h-5" />
                {loading ? 'Creating Shipment...' : 'Create Shipment'}
              </button>
            </div>
          ) : (
            <p className="text-sm text-gray-500">
              Order must be in 'Processing' status to create shipment.
            </p>
          )}
        </div>
      )}

      {/* Package Details */}
      {shipping.weight && (
        <div className="mt-6 pt-6 border-t border-gray-200">
          <h4 className="font-medium text-gray-800 mb-3">Package Details</h4>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
            <div>
              <p className="text-gray-600">Weight</p>
              <p className="font-semibold">{shipping.weight} kg</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ShippingManager;