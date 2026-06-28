import React, { useState } from 'react';
import { Truck, Package, AlertCircle, RefreshCw } from 'lucide-react';
import { toast } from 'react-hot-toast';
import axios from '../utils/Axios';

const QuickShipButton = ({ order, onUpdate, size = 'sm' }) => {
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [weight, setWeight] = useState(order?.shipping?.weight || 0.5);

  const createShipment = async (finalWeight) => {
    if (!order?._id) {
      toast.error('Order ID not found');
      return;
    }

    if (weight <= 0 || weight > 20) {
      toast.error('Weight must be between 0.01kg and 20kg');
      return;
    }

    setLoading(true);
    try {
      const response = await axios.post(`/shipping/create-shipment/${order._id}`, { 
        weight: finalWeight || weight 
      });
      
      if (response.data.success) {
        toast.success('🚚 Shipment created successfully!');
        setShowModal(false);
        onUpdate && onUpdate(); 
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

  const handleShipClick = (e) => {
    e.stopPropagation();
    setShowModal(true);
  };

  const WeightModal = () => (
    <div 
      className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/40 backdrop-blur-sm p-4"
      onClick={() => setShowModal(false)}
    >
      <div 
        className="bg-white rounded-2xl shadow-2xl w-full max-w-sm overflow-hidden transform transition-all animate-in fade-in zoom-in duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="bg-gradient-to-r from-blue-600 to-indigo-600 px-6 py-4 flex items-center gap-3">
          <div className="p-2 bg-white/20 rounded-lg">
            <Truck className="w-6 h-6 text-white" />
          </div>
          <div>
            <h3 className="text-white font-bold text-lg leading-tight">Confirm Shipment</h3>
            <p className="text-blue-100 text-[10px] font-black uppercase tracking-widest">Weight Confirmation Required</p>
          </div>
        </div>
        
        <div className="p-6 space-y-4">
          <div className="bg-blue-50 border border-blue-100 rounded-xl p-3 flex items-start gap-3">
            <AlertCircle className="w-4 h-4 text-blue-500 mt-0.5" />
            <p className="text-xs text-blue-700 leading-relaxed font-medium">
              Please verify the actual weight in kilograms. Standard pricing applies below 1kg.
            </p>
          </div>

          <div>
            <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1.5 ml-1">
              Package Weight (KG)
            </label>
            <div className="relative group">
              <input
                type="number"
                min="0.01"
                max="20"
                step="0.01"
                autoFocus
                value={weight}
                onChange={(e) => {
                  const val = e.target.value;
                  if (val === '') {
                    setWeight('');
                  } else {
                    const num = parseFloat(val);
                    if (num >= 0 && num <= 20) {
                      setWeight(val);
                    }
                  }
                }}
                className="w-full pl-4 pr-12 py-3 bg-gray-50 border-2 border-gray-100 rounded-xl font-black text-lg text-gray-800 focus:border-blue-500 focus:bg-white focus:ring-0 transition-all outline-none"
              />
              <div className="absolute right-4 top-1/2 -translate-y-1/2 font-black text-gray-400 group-focus-within:text-blue-500 transition-colors">
                KG
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3 pt-2">
            <button
              onClick={() => setShowModal(false)}
              className="flex-1 px-4 py-3 text-gray-500 font-bold text-sm hover:text-gray-700 hover:bg-gray-50 rounded-xl transition-all"
            >
              Cancel
            </button>
            <button
              onClick={() => createShipment()}
              disabled={loading || !weight || parseFloat(weight) <= 0 || parseFloat(weight) > 20}
              className="flex-[2] items-center justify-center flex gap-2 px-4 py-3 bg-blue-600 text-white font-black text-sm rounded-xl hover:bg-blue-700 active:scale-95 disabled:opacity-50 disabled:active:scale-100 transition-all shadow-lg shadow-blue-200"
            >
              {loading ? (
                <RefreshCw className="w-4 h-4 animate-spin" />
              ) : (
                <Truck className="w-4 h-4" />
              )}
              {loading ? 'Processing...' : 'Ship Now'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  // Don't show button if already shipped or cancelled
  if (order.orderStatus === 'Delivered' || order.orderStatus === 'Cancelled') {
    return null;
  }

  // Show different states based on shipping status
  if (order.shipping?.shiprocket?.order_id || order.shipping?.delhivery?.waybill || order.shipping?.shiprocket?.awb_code) {
    return (
      <div className={`flex items-center gap-1 ${size === 'sm' ? 'text-xs' : 'text-sm'} text-green-600`}>
        <Package className={size === 'sm' ? 'w-3 h-3' : 'w-4 h-4'} />
        <span>Shipped</span>
      </div>
    );
  }

  // Show create shipment button
  if (order.orderStatus === 'Processing' || order.orderStatus === 'Pending') {
    return (
      <>
        <button
          onClick={handleShipClick}
          disabled={loading}
          className={`flex items-center gap-1 px-2 py-1 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50 transition-colors ${
            size === 'sm' ? 'text-xs' : 'text-sm'
          }`}
          title="Create Shipment"
        >
          <Truck className={size === 'sm' ? 'w-3 h-3' : 'w-4 h-4'} />
          {loading ? 'Creating...' : 'Ship Now'}
        </button>
        {showModal && <WeightModal />}
      </>
    );
  }

  // Show status message for other states
  return (
    <div className={`flex items-center gap-1 ${size === 'sm' ? 'text-xs' : 'text-sm'} text-gray-500`}>
      <AlertCircle className={size === 'sm' ? 'w-3 h-3' : 'w-4 h-4'} />
      <span>Not Ready</span>
    </div>
  );
};

export default QuickShipButton;