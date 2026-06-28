import React from 'react';
import { 
  Package, 
  CreditCard, 
  Clock, 
  Truck, 
  CheckCircle, 
  XCircle,
  MapPin,
  Calendar
} from 'lucide-react';

const OrderStatusTimeline = ({ order, tracking }) => {
  const getStatusIcon = (status) => {
    switch (status) {
      case 'Order Placed':
        return Package;
      case 'Payment Confirmed':
        return CreditCard;
      case 'Order Processing':
        return Clock;
      case 'Shipped':
        return Truck;
      case 'Delivered':
        return CheckCircle;
      case 'Cancelled':
        return XCircle;
      default:
        return Package;
    }
  };

  const getStatusColor = (status, completed) => {
    if (!completed) return 'text-gray-400 bg-gray-100';
    
    switch (status) {
      case 'Order Placed':
        return 'text-blue-600 bg-blue-100';
      case 'Payment Confirmed':
        return 'text-green-600 bg-green-100';
      case 'Order Processing':
        return 'text-yellow-600 bg-yellow-100';
      case 'Shipped':
        return 'text-purple-600 bg-purple-100';
      case 'Delivered':
        return 'text-green-600 bg-green-100';
      case 'Cancelled':
        return 'text-red-600 bg-red-100';
      default:
        return 'text-gray-600 bg-gray-100';
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'Pending';
    return new Date(dateString).toLocaleString('en-IN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const timeline = tracking?.timeline || [];

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-6 flex items-center gap-2">
        <Calendar className="w-5 h-5 text-orange-500" />
        Order Timeline
      </h3>

      <div className="space-y-6">
        {timeline.map((step, index) => {
          const Icon = getStatusIcon(step.status);
          const isLast = index === timeline.length - 1;
          
          return (
            <div key={index} className="relative flex items-start gap-4">
              {/* Timeline Line */}
              {!isLast && (
                <div className="absolute left-6 top-12 w-0.5 h-16 bg-gray-200"></div>
              )}
              
              {/* Status Icon */}
              <div className={`flex-shrink-0 w-12 h-12 rounded-full flex items-center justify-center ${getStatusColor(step.status, step.completed)}`}>
                <Icon className="w-5 h-5" />
              </div>
              
              {/* Content */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between mb-1">
                  <h4 className={`text-sm font-medium ${step.completed ? 'text-gray-900' : 'text-gray-500'}`}>
                    {step.status}
                  </h4>
                  <span className={`text-xs ${step.completed ? 'text-gray-600' : 'text-gray-400'}`}>
                    {formatDate(step.timestamp)}
                  </span>
                </div>
                
                <p className={`text-sm ${step.completed ? 'text-gray-600' : 'text-gray-400'}`}>
                  {step.description}
                </p>
                
                {/* Additional Info */}
                {step.awb_code && (
                  <div className="mt-2 flex items-center gap-4 text-xs text-gray-500">
                    <span className="flex items-center gap-1">
                      <Package className="w-3 h-3" />
                      AWB: {step.awb_code}
                    </span>
                    {step.courier_name && (
                      <span className="flex items-center gap-1">
                        <Truck className="w-3 h-3" />
                        {step.courier_name}
                      </span>
                    )}
                  </div>
                )}
                
                {step.location && (
                  <div className="mt-1 flex items-center gap-1 text-xs text-gray-500">
                    <MapPin className="w-3 h-3" />
                    {step.location}
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Estimated Delivery */}
      {order?.estimated_delivery && order.status !== 'Delivered' && (
        <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
          <div className="flex items-center gap-2">
            <Clock className="w-5 h-5 text-blue-500" />
            <div>
              <p className="text-sm font-medium text-blue-900">Estimated Delivery</p>
              <p className="text-sm text-blue-700">
                {formatDate(order.estimated_delivery)}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Live Tracking Link */}
      {tracking?.awb_code && (
        <div className="mt-4 pt-4 border-t border-gray-200">
          <button className="text-sm text-orange-600 hover:text-orange-700 font-medium flex items-center gap-1">
            <Truck className="w-4 h-4" />
            Track on Courier Website
          </button>
        </div>
      )}
    </div>
  );
};

export default OrderStatusTimeline;