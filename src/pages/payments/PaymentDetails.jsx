import React, { useRef, useState } from 'react';
import { X, Printer, RefreshCw } from 'lucide-react';
import Axios from '../../utils/Axios';
import { toast } from 'react-hot-toast';

const PaymentDetails = ({ payment, onClose, onRecoverSuccess, loading = false }) => {
  const receiptRef = useRef(null);
  const [isRecovering, setIsRecovering] = useState(false);

  const handleRecover = async () => {
    if (!payment?._id) return;
    try {
      setIsRecovering(true);
      const res = await Axios.post('/razorpay/recover-orphaned-payment', { paymentId: payment._id });
      if (res.data.success) {
        toast.success(res.data.message || 'Order recovered successfully!');
        if (onRecoverSuccess) onRecoverSuccess();
      }
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.message || 'Failed to recover order');
    } finally {
      setIsRecovering(false);
    }
  };

  const handlePrint = () => {
    const content = receiptRef.current?.innerHTML;
    if (!content) return;

    const printWindow = window.open('', '', 'width=800,height=600');
    if (!printWindow) return;

    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>Payment Receipt</title>
          <style>
            * { margin: 0; padding: 0; box-sizing: border-box; }
            body { 
              font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Arial, sans-serif;
              margin: 20px;
              color: #333;
            }
            h2 { color: #ea580c; margin-bottom: 20px; }
            h3 { margin-bottom: 10px; color: #1f2937; }
            section { 
              border: 1px solid #e5e7eb;
              border-radius: 8px;
              padding: 16px;
              margin-bottom: 16px;
            }
            .grid { 
              display: grid;
              grid-template-columns: repeat(2, 1fr);
              gap: 8px;
            }
            p { margin-bottom: 8px; font-size: 14px; }
            strong { font-weight: 600; }
            .badge {
              display: inline-block;
              padding: 4px 8px;
              border-radius: 6px;
              font-size: 12px;
              font-weight: 600;
            }
            .bg-green { background: #dcfce7; color: #15803d; }
            .bg-red { background: #fee2e2; color: #b91c1c; }
            .bg-orange { background: #fed7aa; color: #c2410c; }
            @media print {
              body { margin: 0; }
              button { display: none; }
            }
          </style>
        </head>
        <body>${content}</body>
      </html>
    `);
    
    printWindow.document.close();
    printWindow.focus();
    
    setTimeout(() => {
      printWindow.print();
      printWindow.close();
    }, 250);
  };

  const getStatusBadgeClass = (status) => {
    const statusMap = {
      'Delivered': 'bg-green-100 text-green-700',
      'Cancelled': 'bg-red-100 text-red-700',
      'Paid': 'bg-green-100 text-green-700',
      'Failed': 'bg-red-100 text-red-700',
    };
    return statusMap[status] || 'bg-orange-100 text-orange-700';
  };

  if (loading) {
    return (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
        <div className="bg-white p-6 rounded-lg w-full max-w-xl mx-4 shadow-2xl">
          <div className="flex items-center justify-center space-x-2">
            <div className="w-8 h-8 border-4 border-orange-500 border-t-transparent rounded-full animate-spin"></div>
            <p className="text-gray-600 font-medium">Loading payment details...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!payment) return null;

  return (
    <div 
      className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 overflow-y-auto p-4"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-xl w-full max-w-3xl max-h-[90vh] overflow-y-auto shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Printable Content */}
        <div ref={receiptRef} className="p-5 sm:p-8">
          {/* Header */}
          <div className="flex justify-between items-start mb-6 pb-4 border-b-2 border-orange-500">
            <div>
              <h2 className="text-2xl sm:text-3xl font-bold text-orange-600">Payment Receipt</h2>
              <p className="text-sm text-gray-500 mt-1">Transaction Details</p>
            </div>
            <button 
              onClick={onClose} 
              className="text-gray-400 hover:text-gray-600 transition-colors p-2 hover:bg-gray-100 rounded-full print:hidden"
              aria-label="Close"
            >
              <X size={24} />
            </button>
          </div>

          {/* Order Information */}
          <section className="border border-gray-200 rounded-lg p-4 sm:p-5 mb-4 bg-gradient-to-br from-orange-50 to-white">
            <h3 className="font-semibold text-lg text-gray-800 mb-3 flex items-center">
              <span className="w-1 h-6 bg-orange-500 rounded mr-2"></span>
              Order Information
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
              <div className="space-y-2">
                <p className="flex justify-between">
                  <strong className="text-gray-600">Order ID:</strong>
                  <span className="font-mono text-gray-900">{payment.orderId}</span>
                </p>
                <p className="flex justify-between">
                  <strong className="text-gray-600">Amount:</strong>
                  <span className="font-semibold text-gray-900">₹{Number(payment.totalAmount).toFixed(2)}</span>
                </p>
              </div>
              <div className="space-y-2">
                <p className="flex justify-between">
                  <strong className="text-gray-600">Date:</strong>
                  <span className="text-gray-900">{new Date(payment.placedAt).toLocaleString()}</span>
                </p>
                <p className="flex justify-between items-center">
                  <strong className="text-gray-600">Status:</strong>
                  <span className={`badge px-3 py-1 rounded-full text-xs font-semibold ${getStatusBadgeClass(payment.orderStatus)}`}>
                    {payment.orderStatus}
                  </span>
                </p>
              </div>
            </div>
          </section>

          {/* Customer Information */}
          <section className="border border-gray-200 rounded-lg p-4 sm:p-5 mb-4 bg-gradient-to-br from-blue-50 to-white">
            <h3 className="font-semibold text-lg text-gray-800 mb-3 flex items-center">
              <span className="w-1 h-6 bg-blue-500 rounded mr-2"></span>
              Customer Details
            </h3>
            <div className="text-sm space-y-2">
              <p className="flex justify-between">
                <strong className="text-gray-600">Name:</strong>
                <span className="text-gray-900">{payment.shippingAddress?.name || payment.user?.name || '—'}</span>
              </p>
              <p className="flex justify-between">
                <strong className="text-gray-600">Phone:</strong>
                <span className="text-gray-900 font-mono">{payment.shippingAddress?.phoneNumber || payment.user?.phoneNumber || '—'}</span>
              </p>
              {payment.shippingAddress?.address && (
                <p className="flex justify-between">
                  <strong className="text-gray-600">Address:</strong>
                  <span className="text-gray-900 text-right max-w-xs">{payment.shippingAddress.address}</span>
                </p>
              )}
            </div>
          </section>

          {/* Payment Information */}
          <section className="border border-gray-200 rounded-lg p-4 sm:p-5 mb-4 bg-gradient-to-br from-green-50 to-white">
            <h3 className="font-semibold text-lg text-gray-800 mb-3 flex items-center">
              <span className="w-1 h-6 bg-green-500 rounded mr-2"></span>
              Payment Details
            </h3>
            <div className="text-sm space-y-2">
              <p className="flex justify-between">
                <strong className="text-gray-600">Razorpay Order ID:</strong>
                <span className="font-mono text-gray-900 text-xs sm:text-sm">{payment.payment?.razorpayOrderId || '—'}</span>
              </p>
              <p className="flex justify-between">
                <strong className="text-gray-600">Razorpay Payment ID:</strong>
                <span className="font-mono text-gray-900 text-xs sm:text-sm">{payment.payment?.razorpayPaymentId || '—'}</span>
              </p>
              <p className="flex justify-between">
                <strong className="text-gray-600">Payment Method:</strong>
                <span className="text-gray-900 uppercase">{payment.payment?.paymentMethod || payment.orderPaymentMethod || '—'}</span>
              </p>
              <p className="flex justify-between items-center">
                <strong className="text-gray-600">Payment Status:</strong>
                <span className={`badge px-3 py-1 rounded-full text-xs font-semibold ${getStatusBadgeClass(payment.payment?.paymentStatus)}`}>
                  {payment.payment?.paymentStatus || '—'}
                </span>
              </p>
            </div>
          </section>

          {/* Order Items (if available) */}
          {payment.items && payment.items.length > 0 && (
            <section className="border border-gray-200 rounded-lg p-4 sm:p-5 mb-4">
              <h3 className="font-semibold text-lg text-gray-800 mb-3 flex items-center">
                <span className="w-1 h-6 bg-purple-500 rounded mr-2"></span>
                Order Items
              </h3>
              <div className="space-y-2">
                {payment.items.map((item, idx) => (
                  <div key={idx} className="flex justify-between text-sm py-2 border-b last:border-b-0">
                    <div>
                      <p className="font-medium text-gray-900">{item.name || item.productName}</p>
                      <p className="text-gray-500 text-xs">Qty: {item.quantity}</p>
                    </div>
                    <p className="font-semibold text-gray-900">₹{Number(item.price * item.quantity).toFixed(2)}</p>
                  </div>
                ))}
              </div>
            </section>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex justify-end gap-3 px-5 sm:px-8 pb-5 sm:pb-8 border-t pt-4 print:hidden">
          {payment.isOrphaned && (
            <button
              onClick={handleRecover}
              disabled={isRecovering}
              className="px-5 py-2.5 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors font-medium shadow-md hover:shadow-lg disabled:opacity-50 flex items-center gap-2"
            >
              {isRecovering ? (
                <>
                  <RefreshCw className="animate-spin" size={18} />
                  Recovering...
                </>
              ) : (
                <>
                  <RefreshCw size={18} />
                  Recover Order
                </>
              )}
            </button>
          )}
          <button
            onClick={onClose}
            className="px-5 py-2.5 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors font-medium"
          >
            Close
          </button>
          <button
            onClick={handlePrint}
            className="flex items-center gap-2 px-5 py-2.5 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors font-medium shadow-md hover:shadow-lg"
          >
            <Printer size={18} />
            Print Receipt
          </button>
        </div>
      </div>
    </div>
  );
};

export default PaymentDetails;