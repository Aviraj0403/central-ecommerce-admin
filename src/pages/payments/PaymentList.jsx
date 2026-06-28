import React, {
  useEffect,
  useState,
  useCallback,
  useRef,
} from 'react';
import Axios from '../../utils/Axios';               // <-- same instance used everywhere
import { toast } from 'react-hot-toast';
import {
  ChevronLeft,
  ChevronRight,
  Eye,
} from 'lucide-react';
import PaymentDetails from './PaymentDetails';

const statuses = ['Pending', 'Processing', 'Shipped', 'Delivered', 'Cancelled'];
const paymentStatuses = ['Pending', 'Paid', 'Failed', 'Refunded'];

/* --------------------------------------------------------------
   Helper – fetch the paginated list
   -------------------------------------------------------------- */
const fetchPayments = async (params) => {
  try {
    const res = await Axios.get('/razorpay/orders-with-payments', { params });
    return res.data;               // { success, data[], totalOrders, page, limit, totalPages }
  } catch (err) {
    console.error(err);
    toast.error(err.response?.data?.message || 'Failed to load payments');
    return { success: false, data: [], totalOrders: 0 };
  }
};

const PaymentList = () => {
  /* ---------------------- STATE ---------------------- */
  const [payments, setPayments] = useState([]);
  const [totalRows, setTotalRows] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState(null);
  const [loadingDetails, setLoadingDetails] = useState(false);

  // Filters
  const [filterMonth, setFilterMonth] = useState('');
  const [filterYear, setFilterYear] = useState('');
  const [filterOrderStatus, setFilterOrderStatus] = useState('');
  const [filterPaymentStatus, setFilterPaymentStatus] = useState('');
  const [search, setSearch] = useState('');

  // Pagination
  const [page, setPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const mounted = useRef(false);

  /* ---------------------- FETCH ---------------------- */
  const load = useCallback(async () => {
    setLoading(true);
    const params = {
      page,
      limit: rowsPerPage,
      search: search || undefined,
      orderStatus: filterOrderStatus || undefined,
      paymentStatus: filterPaymentStatus || undefined,
    };

    // month / year filter
    if (filterMonth && filterYear) {
      const month = filterMonth.padStart(2, '0');
      params.startDate = `${filterYear}-${month}-01`;
      const lastDay = new Date(filterYear, Number(filterMonth), 0);
      params.endDate = lastDay.toISOString().split('T')[0];
    }

    const res = await fetchPayments(params);
    if (res.success) {
      setPayments(res.data);
      setTotalRows(res.totalOrders);
      setTotalPages(res.totalPages);
    } else {
      setPayments([]);
      setTotalRows(0);
      setTotalPages(0);
    }
    setLoading(false);
  }, [
    page,
    rowsPerPage,
    search,
    filterOrderStatus,
    filterPaymentStatus,
    filterMonth,
    filterYear,
  ]);

  // first mount
  useEffect(() => {
    if (!mounted.current) {
      mounted.current = true;
      load();
    }
  }, [load]);

  /* ---------------------- FILTER HANDLERS ---------------------- */
  const applyFilters = () => {
    if ((filterMonth && !filterYear) || (!filterMonth && filterYear)) {
      toast.error('Select both month & year or none');
      return;
    }
    setPage(1);
    load();
  };

  const clearFilters = () => {
    setFilterMonth('');
    setFilterYear('');
    setFilterOrderStatus('');
    setFilterPaymentStatus('');
    setSearch('');
    setPage(1);
    load();
  };

  /* ---------------------- ACTIONS ---------------------- */
  // ---- view single record (use the same list endpoint with orderId) ----
  const viewDetails = async (orderId) => {
    setLoadingDetails(true);
    try {
      const res = await Axios.get('/razorpay/orders-with-payments', {
        params: { orderId },
      });
      // console.log(res.data);
      if (res.data.success && res.data.data?.length > 0) {
        setSelected(res.data.data[0]);
      } else {
        toast.error('Order not found');
        setSelected(null);
      }
    } catch (e) {
      toast.error('Failed to load details');
      setSelected(null);
    } finally {
      setLoadingDetails(false);
    }
  };

  // ---- update order status ----
  //   const updateOrderStatus = async (orderId, newStatus) => {
  //     try {
  //       await Axios.put(`/razorpay/orders-with-payments/${orderId}/status`, {
  //         orderStatus: newStatus,
  //       });
  //       toast.success('Status updated');
  //       load();                     // refresh list
  //       if (selected?.orderId === orderId) viewDetails(orderId);
  //     } catch (e) {
  //       toast.error('Update failed');
  //     }
  //   };

  /* ---------------------- UI HELPERS ---------------------- */
  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: currentYear - 2019 }, (_, i) => currentYear - i);
  const isFiltered =
    filterMonth ||
    filterYear ||
    filterOrderStatus ||
    filterPaymentStatus ||
    search;

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      {/* Header & Search */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-white border border-zinc-200/80 rounded-xl p-4 shadow-sm">
        <div>
          <h1 className="text-xl font-bold text-zinc-900">Payment List</h1>
          <p className="text-xs text-zinc-500">Track and inspect user transaction histories and gateway payloads.</p>
        </div>
        <div className="flex flex-wrap gap-2 items-center">
          <input
            type="text"
            placeholder="Search by Razorpay ID / Order ID..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            className="border border-zinc-200 rounded-lg px-3 py-2 text-sm bg-white text-zinc-800 placeholder-zinc-400 focus:outline-none focus:ring-1 focus:ring-orange-500 focus:border-orange-500 transition w-full sm:w-auto"
            disabled={loading}
          />
          <button
            onClick={applyFilters}
            disabled={loading}
            className="px-3.5 py-2 bg-orange-600 hover:bg-orange-700 text-white rounded-lg transition text-sm font-semibold shadow-sm disabled:opacity-50"
          >
            Apply
          </button>
          {isFiltered && (
            <button
              onClick={clearFilters}
              disabled={loading}
              className="px-3.5 py-2 bg-white border border-zinc-200 hover:bg-zinc-50 text-zinc-700 rounded-lg transition text-sm font-semibold disabled:opacity-50"
            >
              Clear
            </button>
          )}
        </div>
      </div>

      {/* Filters Card */}
      <div className="bg-white border border-zinc-200/80 rounded-xl p-4 shadow-sm grid grid-cols-1 sm:grid-cols-3 gap-4">
        {/* Month */}
        <div>
          <label className="block text-xs font-semibold text-zinc-600 mb-1.5 uppercase tracking-wider">
            Month
          </label>
          <select
            value={filterMonth}
            onChange={(e) => setFilterMonth(e.target.value)}
            disabled={loading}
            className="w-full border border-zinc-200 rounded-lg p-2.5 text-sm bg-white focus:ring-1 focus:ring-orange-500 focus:border-orange-500 focus:outline-none transition"
          >
            <option value="">All</option>
            {Array.from({ length: 12 }, (_, i) => (
              <option key={i + 1} value={String(i + 1).padStart(2, '0')}>
                {new Date(0, i).toLocaleString('default', { month: 'long' })}
              </option>
            ))}
          </select>
        </div>

        {/* Year */}
        <div>
          <label className="block text-xs font-semibold text-zinc-600 mb-1.5 uppercase tracking-wider">
            Year
          </label>
          <select
            value={filterYear}
            onChange={(e) => setFilterYear(e.target.value)}
            disabled={loading}
            className="w-full border border-zinc-200 rounded-lg p-2.5 text-sm bg-white focus:ring-1 focus:ring-orange-500 focus:border-orange-500 focus:outline-none transition"
          >
            <option value="">All</option>
            {years.map((y) => (
              <option key={y} value={y}>
                {y}
              </option>
            ))}
          </select>
        </div>

        {/* Payment Status */}
        <div>
          <label className="block text-xs font-semibold text-zinc-600 mb-1.5 uppercase tracking-wider">
            Payment Status
          </label>
          <select
            value={filterPaymentStatus}
            onChange={(e) => setFilterPaymentStatus(e.target.value)}
            disabled={loading}
            className="w-full border border-zinc-200 rounded-lg p-2.5 text-sm bg-white focus:ring-1 focus:ring-orange-500 focus:border-orange-500 focus:outline-none transition"
          >
            <option value="">All</option>
            {paymentStatuses.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Loading / Empty */}
      {loading ? (
        <div className="text-center py-12 text-sm text-zinc-500 bg-white border border-zinc-200/80 rounded-xl shadow-sm">Loading payments...</div>
      ) : payments.length === 0 ? (
        <div className="text-center py-12 text-sm text-zinc-500 bg-white border border-zinc-200/80 rounded-xl shadow-sm space-y-2">
          <p>No payments match the filters.</p>
          {isFiltered && (
            <button onClick={clearFilters} className="text-orange-600 hover:text-orange-700 font-semibold underline">
              Clear filters
            </button>
          )}
        </div>
      ) : (
        <>
          {/* Desktop Table */}
          <div className="hidden md:block overflow-hidden bg-white border border-zinc-200/80 rounded-xl shadow-sm">
            <table className="min-w-full border-collapse">
              <thead className="bg-gradient-to-r from-orange-50 to-orange-100/40 border-b border-orange-200/60">
                <tr>
                  {[
                    'Razorpay Order ID',
                    'Order ID',
                    'Customer',
                    'Amount',
                    'Payment Status',
                    'Date',
                    'Actions',
                  ].map((h) => (
                    <th
                      key={h}
                      className="px-4 py-3 text-left text-[10px] font-bold text-orange-950/80 uppercase tracking-wider"
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-200/60">
                {payments.map((p, i) => (
                  <tr
                    key={p.orderId}
                    className="hover:bg-orange-50/30 transition-colors"
                  >
                    {/* Razorpay Order ID */}
                    <td className="px-4 py-3.5 text-sm text-zinc-800 font-mono">
                      {p.payment?.razorpayOrderId?.slice(0, 14) || '-'}
                    </td>

                    {/* Order ID */}
                    <td className="px-4 py-3.5 text-sm text-zinc-800 font-medium">
                      {p.orderId?.slice(-8) || '-'}
                    </td>

                    {/* Customer */}
                    <td className="px-4 py-3.5 text-sm text-zinc-900 font-semibold">
                      {p.shippingAddress?.name || p.user?.name || 'Guest'}
                    </td>

                    {/* Amount */}
                    <td className="px-4 py-3.5 text-sm text-zinc-950 font-bold">
                      ₹{Number(p.totalAmount || 0).toFixed(2)}
                    </td>

                    {/* Payment Status – read-only badge */}
                    <td className="px-4 py-3.5 text-sm">
                      <span
                        className={`inline-block px-2.5 py-0.5 rounded text-[10px] font-bold border ${
                          p.payment?.paymentStatus === 'Paid'
                            ? 'bg-green-50 text-green-700 border-green-200'
                            : p.payment?.paymentStatus === 'Failed'
                              ? 'bg-red-50 text-red-600 border-red-200'
                              : 'bg-amber-50 text-amber-600 border-amber-200'
                        }`}
                      >
                        {(p.payment?.paymentStatus || 'Pending').toUpperCase()}
                      </span>
                    </td>

                    {/* Date */}
                    <td className="px-4 py-3.5 text-xs text-zinc-500">
                      {new Date(p.placedAt).toLocaleDateString()}
                    </td>

                    {/* View */}
                    <td className="px-4 py-3.5 text-sm text-center">
                      <button
                        onClick={() => viewDetails(p.orderId)}
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

          {/* Mobile Cards */}
          <div className="block md:hidden space-y-4">
            {payments.map((p) => (
              <div
                key={p.orderId}
                className="p-4 bg-white border border-zinc-200/80 rounded-xl shadow-sm space-y-3"
              >
                <div className="flex justify-between items-start">
                  <p className="font-mono text-zinc-900 text-sm font-semibold">
                    {p.payment?.razorpayOrderId?.slice(0, 14) || 'CASH-PAY'}
                  </p>
                  <span
                    className={`inline-block px-2.5 py-0.5 rounded text-[10px] font-bold border ${
                      p.payment?.paymentStatus === 'Paid'
                        ? 'bg-green-50 text-green-700 border-green-200'
                        : p.payment?.paymentStatus === 'Failed'
                          ? 'bg-red-50 text-red-600 border-red-200'
                          : 'bg-amber-50 text-amber-600 border-amber-200'
                    }`}
                  >
                    {(p.payment?.paymentStatus || 'Pending').toUpperCase()}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-2 text-xs text-zinc-600 pt-1.5 border-t border-zinc-100">
                  <div>
                    <p>
                      <span className="font-semibold text-zinc-400">Order:</span>{' '}
                      {p.orderId?.slice(-8)}
                    </p>
                    <p>
                      <span className="font-semibold text-zinc-400">Customer:</span>{' '}
                      <span className="font-bold text-zinc-800">
                        {p.shippingAddress?.name || p.user?.name || 'Guest'}
                      </span>
                    </p>
                  </div>
                  <div>
                    <p>
                      <span className="font-semibold text-zinc-400">Amount:</span> ₹
                      {Number(p.totalAmount).toFixed(2)}
                    </p>
                    <p>
                      <span className="font-semibold text-zinc-400">Gateway:</span>{' '}
                      <span className="text-zinc-700 font-semibold">{p.payment?.paymentStatus || 'COD'}</span>
                    </p>
                  </div>
                </div>

                <div className="flex justify-end pt-2 border-t border-zinc-100">
                  <button
                    onClick={() => viewDetails(p.orderId)}
                    className="text-zinc-400 hover:text-zinc-800 transition-colors p-1"
                  >
                    <Eye size={16} />
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Pagination */}
          {totalRows > 0 && (
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-white border border-zinc-200/80 rounded-xl p-4 shadow-sm">
              <div className="flex items-center space-x-2">
                <label className="text-xs text-zinc-500 font-semibold uppercase">Rows:</label>
                <select
                  value={rowsPerPage}
                  onChange={(e) => {
                    setRowsPerPage(Number(e.target.value));
                    setPage(1);
                    load();
                  }}
                  disabled={loading}
                  className="border border-zinc-200 rounded-lg p-1.5 text-xs bg-white text-zinc-800 focus:ring-1 focus:ring-orange-500 focus:border-orange-500 focus:outline-none transition"
                >
                  {[10, 20, 50].map((v) => (
                    <option key={v} value={v}>
                      {v}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex items-center space-x-2">
                <button
                  onClick={() => {
                    setPage((p) => Math.max(p - 1, 1));
                    load();
                  }}
                  disabled={page === 1 || loading}
                  className="p-1.5 border border-zinc-200 hover:bg-zinc-50 rounded-lg transition disabled:opacity-50 bg-white"
                >
                  <ChevronLeft size={16} />
                </button>
                <span className="text-xs font-medium text-zinc-600">
                  Page {page} of {totalPages}
                </span>
                <button
                  onClick={() => {
                    setPage((p) => Math.min(p + 1, totalPages));
                    load();
                  }}
                  disabled={page === totalPages || loading}
                  className="p-1.5 border border-zinc-200 hover:bg-zinc-50 rounded-lg transition disabled:opacity-50 bg-white"
                >
                  <ChevronRight size={16} />
                </button>
              </div>
            </div>
          )}
        </>
      )}

      {/* Details Modal */}
      {(loadingDetails || selected) && (
        <PaymentDetails
          payment={selected}
          onClose={() => setSelected(null)}
          loading={loadingDetails}
        />
      )}
    </div>
  );
};

export default PaymentList;