import React, { useEffect, useState, useCallback, useRef } from 'react';
import Axios from '../../utils/Axios'; // same Axios instance
import { toast } from 'react-hot-toast';
import { ChevronLeft, ChevronRight, Eye } from 'lucide-react';
import PaymentDetails from './PaymentDetails';

const fetchOrphanedPayments = async (hours) => {
  try {
    const res = await Axios.get('/razorpay/orphaned-payments', { params: { hours } });
    return res.data; // { success, count, payments }
  } catch (err) {
    console.error(err);
    toast.error(err.response?.data?.message || 'Failed to load orphaned payments');
    return { success: false, payments: [] };
  }
};

const OrphanedPayments = () => {
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState(null);
  const [loadingDetails, setLoadingDetails] = useState(false);
  const [hours, setHours] = useState(1); // filter: older than X hours

  const mounted = useRef(false);

  const load = useCallback(async () => {
    setLoading(true);
    const res = await fetchOrphanedPayments(hours);
    if (res.success) {
      setPayments(res.payments);
    } else {
      setPayments([]);
    }
    setLoading(false);
  }, [hours]);

  useEffect(() => {
    if (!mounted.current) {
      mounted.current = true;
      load();
    }
  }, [load]);

  const viewDetails = (p) => {
    // Map the orphaned payment object to what PaymentDetails.jsx expects
    const mappedPayment = {
      _id: p.paymentId,
      isOrphaned: true,
      orderId: 'N/A (Orphaned)',
      totalAmount: p.amount,
      placedAt: p.createdAt,
      orderStatus: 'Orphaned',
      shippingAddress: {
        ...(p.paymentDetails?.shippingAddress || {}),
        address: p.paymentDetails?.shippingAddress 
          ? `${p.paymentDetails.shippingAddress.street || ''}, ${p.paymentDetails.shippingAddress.city || ''}, ${p.paymentDetails.shippingAddress.state || ''} - ${p.paymentDetails.shippingAddress.postalCode || ''}`.replace(/^, | , | - $/g, '')
          : ''
      },
      user: p.user || {}, // the backend Populates userId into user array, but we mapped it to p.user in res.payments
      payment: {
        razorpayOrderId: p.razorpayOrderId,
        razorpayPaymentId: p.razorpayPaymentId,
        paymentMethod: 'Razorpay',
        paymentStatus: 'Paid'
      },
      items: (p.paymentDetails?.items || []).map(item => ({
        name: item.selectedVariant?.name || 'Unknown Product',
        quantity: item.quantity || 1,
        price: item.selectedVariant?.price || 0
      }))
    };
    setSelected(mappedPayment);
  };

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      {/* Header Card */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-white border border-zinc-200/80 rounded-xl p-4 shadow-sm">
        <div>
          <h1 className="text-xl font-bold text-zinc-900">Orphaned Payments</h1>
          <p className="text-xs text-zinc-500">Inspect and reconcile payments that were processed successfully but don't have matching orders.</p>
        </div>
        <div className="flex flex-wrap gap-2 items-center">
          <input
            type="number"
            min={1}
            value={hours}
            onChange={(e) => setHours(Number(e.target.value))}
            className="border border-zinc-200 rounded-lg px-3 py-2 text-sm bg-white text-zinc-800 focus:outline-none focus:ring-1 focus:ring-orange-500 focus:border-orange-500 transition w-20"
            disabled={loading}
          />
          <span className="text-xs text-zinc-500 font-semibold uppercase">hours old</span>
          <button
            onClick={load}
            disabled={loading}
            className="px-3.5 py-2 bg-orange-600 hover:bg-orange-700 text-white rounded-lg transition text-sm font-semibold shadow-sm disabled:opacity-50"
          >
            Refresh
          </button>
        </div>
      </div>

      {/* Loading / Empty */}
      {loading ? (
        <div className="text-center py-12 text-sm text-zinc-500 bg-white border border-zinc-200/80 rounded-xl shadow-sm">Loading orphaned payments...</div>
      ) : payments.length === 0 ? (
        <div className="text-center py-12 text-sm text-zinc-500 bg-white border border-zinc-200/80 rounded-xl shadow-sm">No orphaned payments found.</div>
      ) : (
        <div className="overflow-hidden bg-white border border-zinc-200/80 rounded-xl shadow-sm">
          <table className="min-w-full border-collapse">
             <thead className="bg-gradient-to-r from-orange-50 to-orange-100/40 border-b border-orange-200/60">
               <tr>
                 {['Payment ID', 'User', 'Amount', 'Razorpay Payment ID', 'Created At', 'Hours Old', 'Actions'].map(
                   (h) => (
                     <th
                       key={h}
                       className="px-4 py-3 text-left text-[10px] font-bold text-orange-950/80 uppercase tracking-wider"
                     >
                       {h}
                     </th>
                   )
                 )}
               </tr>
             </thead>
             <tbody className="divide-y divide-zinc-200/60">
               {payments.map((p) => (
                 <tr
                   key={p.paymentId}
                   className="hover:bg-orange-50/30 transition-colors"
                 >
                  <td className="px-4 py-3.5 text-sm text-zinc-700 font-mono">{p.paymentId.slice(-8)}</td>
                  <td className="px-4 py-3.5 text-sm text-zinc-900 font-semibold">{p.userId?.name || 'Guest'}</td>
                  <td className="px-4 py-3.5 text-sm text-zinc-950 font-bold">₹{Number(p.amount).toFixed(2)}</td>
                  <td className="px-4 py-3.5 text-sm text-zinc-800 font-mono">{p.razorpayPaymentId || '-'}</td>
                  <td className="px-4 py-3.5 text-xs text-zinc-500">
                    {new Date(p.createdAt).toLocaleString()}
                  </td>
                  <td className="px-4 py-3.5 text-sm text-zinc-800">{p.hoursOld}</td>
                  <td className="px-4 py-3.5 text-sm text-center">
                    <button
                      onClick={() => viewDetails(p)}
                      className="text-zinc-400 hover:text-zinc-800 transition-colors"
                      aria-label="View details"
                    >
                      <Eye size={16} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Details Modal */}
      {(loadingDetails || selected) && (
        <PaymentDetails
          payment={selected}
          onClose={() => setSelected(null)}
          loading={loadingDetails}
          onRecoverSuccess={() => {
            setSelected(null);
            load();
          }}
        />
      )}
    </div>
  );
};

export default OrphanedPayments;
