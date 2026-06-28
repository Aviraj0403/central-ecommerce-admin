import React from 'react';
import { X } from 'lucide-react';

const LeadDetailsModal = ({ lead, onClose }) => {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center">
      <div className="bg-white w-full max-w-3xl mx-4 rounded-lg shadow-xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex justify-between items-center border-b p-4">
          <h3 className="text-lg font-bold text-orange-600">
            Order Lead Details
          </h3>
          <button onClick={onClose}>
            <X className="w-5 h-5 text-gray-600" />
          </button>
        </div>

        {/* Body */}
        <div className="p-4 space-y-4">
          {/* Basic Info */}
          <div className="grid grid-cols-2 gap-3 text-sm">
            <p><strong>Status:</strong> {lead.orderStatus}</p>
            <p><strong>Date:</strong> {new Date(lead.createdAt).toLocaleString()}</p>
            <p><strong>Amount:</strong> ₹{lead.totalAmount}</p>
            <p><strong>Currency:</strong> {lead.currency}</p>
          </div>

          {/* Shipping */}
          <div className="border rounded-lg p-3">
            <h4 className="font-semibold mb-2">Shipping Address</h4>
            <p>{lead.shippingAddress?.name}</p>
            <p>{lead.shippingAddress?.street}</p>
            <p>
              {lead.shippingAddress?.city},{' '}
              {lead.shippingAddress?.state} -{' '}
              {lead.shippingAddress?.postalCode}
            </p>
            <p>{lead.shippingAddress?.country}</p>
            <p>📞 {lead.shippingAddress?.phoneNumber}</p>
          </div>

          {/* Items */}
          <div className="border rounded-lg p-3">
            <h4 className="font-semibold mb-2">Items</h4>
            <table className="w-full text-sm">
              <thead className="bg-gray-100">
                <tr>
                  <th className="p-2 text-left">Variant</th>
                  <th className="p-2">Qty</th>
                  <th className="p-2 text-right">Price</th>
                </tr>
              </thead>
              <tbody>
                {lead.items.map((item, i) => (
                  <tr key={i} className="border-t">
                    <td className="p-2">
                      {item.selectedVariant?.size} / {item.selectedVariant?.color}
                    </td>
                    <td className="p-2 text-center">{item.quantity}</td>
                    <td className="p-2 text-right">
                      ₹{item.selectedVariant?.price}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LeadDetailsModal;
