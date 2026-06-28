import React, { useState } from 'react';
import { toast } from 'react-hot-toast';
import { 
  Calculator, 
  MapPin, 
  Package, 
  Truck, 
  DollarSign,
  CheckCircle,
  XCircle,
  RefreshCw
} from 'lucide-react';
import { calculateShippingCharges, checkPincodeServiceability } from '../services/ShiprocketApi';

const ShippingCalculator = ({ onClose }) => {
  const [formData, setFormData] = useState({
    pickup_pincode: '110001',
    delivery_pincode: '',
    weight: 0.5,
    declared_value: 100,
    payment_method: 'Prepaid'
  });
  const [loading, setLoading] = useState(false);
  const [checkingPincode, setCheckingPincode] = useState(false);
  const [pincodeStatus, setPincodeStatus] = useState(null);
  const [shippingOptions, setShippingOptions] = useState([]);
  const [error, setError] = useState('');

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    setError('');
    
    // Reset shipping options when key parameters change
    if (['pickup_pincode', 'delivery_pincode', 'weight'].includes(field)) {
      setShippingOptions([]);
    }
  };

  const checkPincode = async () => {
    if (!formData.delivery_pincode) {
      toast.error('Please enter a delivery pincode');
      return;
    }
    
    if (formData.delivery_pincode.length !== 6 || !/^\d{6}$/.test(formData.delivery_pincode)) {
      toast.error('Please enter a valid 6-digit pincode');
      return;
    }

    try {
      setCheckingPincode(true);
      setPincodeStatus(null);
      const response = await checkPincodeServiceability(formData.delivery_pincode);
      setPincodeStatus(response);
      
      if (response.serviceable) {
        toast.success('Delivery available to this pincode');
      } else {
        toast.error('Delivery not available to this pincode');
      }
    } catch (error) {
      console.error('Error checking pincode:', error);
      toast.error('Failed to check pincode serviceability');
      setPincodeStatus(null);
    } finally {
      setCheckingPincode(false);
    }
  };

  const calculateShipping = async () => {
    if (!formData.delivery_pincode || formData.delivery_pincode.length !== 6) {
      setError('Please enter a valid delivery pincode');
      return;
    }

    if (!formData.weight || formData.weight <= 0) {
      setError('Please enter a valid weight');
      return;
    }

    try {
      setLoading(true);
      setError('');
      
      // Mock items for calculation
      const mockItems = [{
        product: '507f1f77bcf86cd799439011', // Mock product ID
        selectedVariant: {
          price: formData.declared_value,
          size: 'Standard',
          color: 'Default'
        },
        quantity: 1
      }];

      const calculationData = {
        items: mockItems,
        delivery_pincode: formData.delivery_pincode,
        payment_method: formData.payment_method
      };

      const response = await calculateShippingCharges(calculationData);
      
      if (response.success) {
        setShippingOptions(response.shipping_options || []);
        toast.success('Shipping charges calculated successfully');
      } else {
        setError(response.message || 'Failed to calculate shipping charges');
      }
    } catch (error) {
      console.error('Error calculating shipping:', error);
      setError(error.message || 'Failed to calculate shipping charges');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold text-gray-900 flex items-center gap-2">
              <Calculator className="w-6 h-6 text-orange-500" />
              Shipping Calculator
            </h2>
            <button
              onClick={onClose}
              className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100"
            >
              <XCircle className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Form */}
        <div className="p-6 space-y-6">
          {/* Pickup & Delivery Pincodes */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Pickup Pincode
              </label>
              <div className="relative">
                <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <input
                  type="text"
                  value={formData.pickup_pincode}
                  onChange={(e) => handleInputChange('pickup_pincode', e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-400 focus:border-orange-400"
                  placeholder="110001"
                  maxLength={6}
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Delivery Pincode
              </label>
              <div className="relative">
                <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <input
                  type="text"
                  value={formData.delivery_pincode}
                  onChange={(e) => handleInputChange('delivery_pincode', e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-400 focus:border-orange-400"
                  placeholder="Enter delivery pincode"
                  maxLength={6}
                />
                <button
                  onClick={checkPincode}
                  disabled={checkingPincode || formData.delivery_pincode.length !== 6}
                  className="absolute right-2 top-1/2 transform -translate-y-1/2 p-1 text-orange-600 hover:text-orange-700 disabled:opacity-50"
                  title="Check serviceability"
                >
                  <RefreshCw className={`w-4 h-4 ${checkingPincode ? 'animate-spin' : ''}`} />
                </button>
              </div>
              {pincodeStatus && (
                <div className={`mt-1 flex items-center gap-1 text-xs ${
                  pincodeStatus.serviceable ? 'text-green-600' : 'text-red-600'
                }`}>
                  {pincodeStatus.serviceable ? (
                    <CheckCircle className="w-3 h-3" />
                  ) : (
                    <XCircle className="w-3 h-3" />
                  )}
                  {pincodeStatus.message}
                </div>
              )}
            </div>
          </div>

          {/* Weight & Value */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Weight (kg)
              </label>
              <div className="relative">
                <Package className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <input
                  type="number"
                  value={formData.weight}
                  onChange={(e) => handleInputChange('weight', parseFloat(e.target.value) || 0)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-400 focus:border-orange-400"
                  placeholder="0.5"
                  min="0.1"
                  step="0.1"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Declared Value (₹)
              </label>
              <div className="relative">
                <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <input
                  type="number"
                  value={formData.declared_value}
                  onChange={(e) => handleInputChange('declared_value', parseInt(e.target.value) || 0)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-400 focus:border-orange-400"
                  placeholder="100"
                  min="1"
                />
              </div>
            </div>
          </div>

          {/* Payment Method */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Payment Method
            </label>
            <div className="flex gap-4">
              {['Prepaid', 'COD'].map((method) => (
                <label key={method} className="flex items-center cursor-pointer">
                  <input
                    type="radio"
                    name="payment_method"
                    value={method}
                    checked={formData.payment_method === method}
                    onChange={(e) => handleInputChange('payment_method', e.target.value)}
                    className="mr-2 text-orange-600 focus:ring-orange-500"
                  />
                  <span className="text-sm text-gray-700">{method}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Error Message */}
          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-sm text-red-600">{error}</p>
            </div>
          )}

          {/* Calculate Button */}
          <button
            onClick={calculateShipping}
            disabled={loading}
            className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-orange-500 to-red-500 text-white rounded-lg hover:from-orange-600 hover:to-red-600 disabled:opacity-50 transition-all duration-200"
          >
            {loading ? (
              <RefreshCw className="w-5 h-5 animate-spin" />
            ) : (
              <Calculator className="w-5 h-5" />
            )}
            {loading ? 'Calculating...' : 'Calculate Shipping'}
          </button>

          {/* Results */}
          {shippingOptions.length > 0 && (
            <div className="space-y-4">
              <h3 className="text-lg font-medium text-gray-900">Shipping Options</h3>
              <div className="space-y-3">
                {shippingOptions.map((option, index) => (
                  <div
                    key={index}
                    className="p-4 border border-gray-200 rounded-lg hover:border-orange-300 transition-colors"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <Truck className="w-4 h-4 text-gray-600" />
                        <span className="font-medium text-gray-900">
                          {option.courier_name}
                        </span>
                      </div>
                      <span className="text-lg font-bold text-green-600">
                        ₹{option.total_charge}
                      </span>
                    </div>
                    <div className="grid grid-cols-2 gap-4 text-sm text-gray-600">
                      <div>
                        <span className="font-medium">Freight:</span> ₹{option.freight_charge}
                      </div>
                      <div>
                        <span className="font-medium">COD Charges:</span> ₹{option.cod_charges}
                      </div>
                      <div>
                        <span className="font-medium">Delivery:</span> {option.estimated_delivery_days}
                      </div>
                      <div>
                        <span className="font-medium">Rating:</span> {option.rating}/5
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ShippingCalculator;