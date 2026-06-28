import React, { useEffect, useState, useCallback, useRef } from 'react';
import axios from '../../utils/Axios';
import { toast } from 'react-hot-toast';
import { Trash2, ChevronLeft, ChevronRight, Plus, RotateCcw } from 'lucide-react';
import { syncOrders } from '../../services/ShiprocketApi';
import AdminOrderDetails from './AdminOrderDetails';
import ManualOrderForm from './ManualOrderForm';
import QuickShipButton from '../../components/QuickShipButton';

const getOrderDetailsAdmin = async (orderId) => {
  try {
    const res = await axios.get(`/orders/getOrderById/${orderId}`);

    // Log response for debugging (remove in production if needed)
    console.log('Raw API response for order:', res.data);

    // Handle different possible response structures
    const orderData = res.data?.order || res.data?.data || res.data;

    // Validate that we actually got a valid order
    if (orderData && (orderData._id || orderData.id)) {
      return orderData;
    }

    // If no valid order found
    throw new Error(res.data?.message || 'Order not found or invalid response from server');
  } catch (error) {
    // Improve error message based on axios error
    const message =
      error.response?.data?.message ||
      error.message ||
      'Failed to fetch order details';

    // Re-throw with better context
    const err = new Error(message);
    err.status = error.response?.status;
    throw err;
  }
};

const statuses = ['Pending', 'Processing', 'Shipped', 'Delivered', 'Cancelled'];

const AdminOrderManager = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [loadingDetails, setLoadingDetails] = useState(false);
  const [filterMonth, setFilterMonth] = useState('');
  const [filterYear, setFilterYear] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [totalRows, setTotalRows] = useState(0);
  const [showManualOrderForm, setShowManualOrderForm] = useState(false);
  const mounted = useRef(false);

  const fetchOrders = useCallback(async (filter = {}) => {
    try {
      setLoading(true);
      const params = {
        page,
        limit: rowsPerPage,
        search: search || undefined,
        status: filterStatus || undefined,
      };
      if (filter.month && filter.year) {
        const month = filter.month.padStart(2, '0');
        params.startDate = `${filter.year}-${month}-01`;
        params.endDate = new Date(filter.year, Number(filter.month), 0).toISOString().split('T')[0];
      }

      const res = await axios.get('/orders/getAllOrders', { params });
      const fetchedOrders = Array.isArray(res.data.orders) ? res.data.orders : [];
      const validOrders = fetchedOrders.filter(
        (order) =>
          order &&
          order._id &&
          typeof order.totalAmount === 'number' &&
          typeof order.orderStatus === 'string' &&
          typeof order.paymentStatus === 'string' &&
          order.createdAt
      );

      setOrders(validOrders);
      setTotalRows(res.data.total || 0);
    } catch (error) {
      console.error('Error fetching orders:', error);
      toast.error('Failed to fetch orders');
      setOrders([]);
      setTotalRows(0);
    } finally {
      setLoading(false);
    }
  }, [page, rowsPerPage, search, filterStatus]);

  const handleFetch = useCallback(() => {
    fetchOrders({ month: filterMonth, year: filterYear });
  }, [fetchOrders, filterMonth, filterYear]);

  const fetchOrderDetails = async (orderId) => {
    try {
      setLoadingDetails(true);
      const order = await getOrderDetailsAdmin(orderId);
      setSelectedOrder(order);
    } catch (error) {
      console.error('Error fetching order details:', error);
      toast.error(error.response?.data?.message || 'Failed to fetch order details');
      setSelectedOrder(null);
    } finally {
      setLoadingDetails(false);
    }
  };

  const updateStatus = async (id, status) => {
    try {
      await axios.put(`/orders/updateOrderStatus/${id}`, { status });
      toast.success('Order status updated');
      handleFetch();
      if (selectedOrder && selectedOrder._id === id) {
        fetchOrderDetails(id);
      }
    } catch (error) {
      console.error('Error updating status:', error);
      toast.error('Update failed');
    }
  };

  const deleteOrder = async (id) => {
    if (!window.confirm('Are you sure you want to delete this order?')) return;
    try {
      await axios.delete(`/orders/deleteOrder/${id}`);
      toast.success('Order deleted');
      handleFetch();
      if (selectedOrder && selectedOrder._id === id) setSelectedOrder(null);
    } catch (error) {
      console.error('Error deleting order:', error);
      toast.error('Delete failed');
    }
  };

  useEffect(() => {
    if (mounted.current) return;
    mounted.current = true;
    handleFetch();
  }, [handleFetch]);

  const applyFilter = () => {
    if ((filterMonth && !filterYear) || (!filterMonth && filterYear)) {
      toast.error('Please select both month and year or neither');
      return;
    }
    setPage(1);
    handleFetch();
    setSelectedOrder(null);
  };

  const clearFilter = () => {
    setFilterMonth('');
    setFilterYear('');
    setFilterStatus('');
    setSearch('');
    setPage(1);
    handleFetch();
    setSelectedOrder(null);
  };

  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: currentYear - 2019 }, (_, i) => currentYear - i);
  const isFilterApplied = filterMonth !== '' || filterYear !== '' || filterStatus !== '' || search !== '';
  const totalPages = Math.ceil(totalRows / rowsPerPage);

  return (
    <div className="p-4 sm:p-6 max-w-7xl mx-auto bg-white rounded-xl shadow-sm border border-zinc-200/60">
      <div className="flex flex-wrap items-center justify-between mb-6 gap-4">
        <h4 className="text-xl sm:text-2xl font-bold tracking-tight text-zinc-900 uppercase">Order List</h4>
        <div className="flex flex-wrap gap-2 items-center">
          <input
            type="text"
            placeholder="Search by code or user..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            className="border border-zinc-200 rounded-lg px-3 py-2 text-zinc-700 focus:outline-none focus:ring-2 focus:ring-orange-400 w-full sm:w-auto text-xs"
            disabled={loading}
          />
          <button
            onClick={() => setShowManualOrderForm(true)}
            className="inline-flex items-center px-4 py-2 bg-zinc-900 text-white rounded-lg hover:bg-zinc-800 transition-colors shadow font-medium text-xs cursor-pointer"
          >
            <Plus size={14} className="mr-1" /> Create Manual Order
          </button>
          <button
            onClick={async () => {
              const loadingToast = toast.loading('Syncing with Logistics...');
              try {
                const res = await syncOrders();
                toast.success(`Sync complete! ${res.results?.updated || 0} orders updated.`, { id: loadingToast });
                handleFetch(); // Refresh list
              } catch (err) {
                toast.error('Sync failed', { id: loadingToast });
              }
            }}
            className="inline-flex items-center px-4 py-2 bg-white text-zinc-900 rounded-lg hover:bg-zinc-50 border border-zinc-200 transition-colors shadow-sm font-medium text-xs cursor-pointer"
          >
            <RotateCcw size={14} className="mr-1" /> Sync Logistics
          </button>
          <button
            onClick={applyFilter}
            className="inline-flex items-center px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors disabled:opacity-50 text-xs font-semibold cursor-pointer"
            disabled={loading}
          >
            Apply Filters
          </button>
          {isFilterApplied && (
            <button
              onClick={clearFilter}
              className="inline-flex items-center px-4 py-2 bg-zinc-100 text-zinc-800 rounded-lg hover:bg-zinc-250 transition-colors disabled:opacity-50 text-xs font-semibold cursor-pointer"
              disabled={loading}
            >
              Clear Filters
            </button>
          )}
        </div>
      </div>

      {/* Filter Section */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 mb-6">
        <div>
          <label className="block text-[10px] font-bold text-zinc-500 uppercase tracking-wider mb-1">Month</label>
          <select
            value={filterMonth}
            onChange={(e) => setFilterMonth(e.target.value)}
            className="w-full p-2 border border-zinc-200 rounded-lg focus:ring-2 focus:ring-orange-400 focus:border-orange-400 disabled:opacity-50 text-xs"
            disabled={loading}
          >
            <option value="">Select Month</option>
            {Array.from({ length: 12 }, (_, i) => (
              <option key={i + 1} value={String(i + 1).padStart(2, '0')}>
                {new Date(0, i).toLocaleString('default', { month: 'long' })}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-[10px] font-bold text-zinc-500 uppercase tracking-wider mb-1">Year</label>
          <select
            value={filterYear}
            onChange={(e) => setFilterYear(e.target.value)}
            className="w-full p-2 border border-zinc-200 rounded-lg focus:ring-2 focus:ring-orange-400 focus:border-orange-400 disabled:opacity-50 text-xs"
            disabled={loading}
          >
            <option value="">Select Year</option>
            {years.map((y) => (
              <option key={y} value={y}>{y}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-[10px] font-bold text-zinc-500 uppercase tracking-wider mb-1">Status</label>
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="w-full p-2 border border-zinc-200 rounded-lg focus:ring-2 focus:ring-orange-400 focus:border-orange-400 disabled:opacity-50 text-xs"
            disabled={loading}
          >
            <option value="">All Statuses</option>
            {statuses.map((s) => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>
        </div>
      </div>

      {loading ? (
        <div className="text-center text-gray-500 py-10 sm:py-20">Loading orders...</div>
      ) : (
        <>
          {/* Desktop Table */}
          <div className="hidden md:block overflow-x-auto rounded-xl border border-zinc-200/60 shadow-sm bg-white">
            <table className="min-w-full bg-white">
              <thead className="bg-zinc-50 border-b border-zinc-200/60">
                <tr>
                  {[
                    { label: 'Order ID', field: '_id' },
                    { label: 'Customer', field: 'user.name' },
                    { label: 'Total', field: 'totalAmount' },
                    { label: 'Status', field: 'orderStatus' },
                    { label: 'Payment', field: 'paymentStatus' },
                    { label: 'Date', field: 'createdAt' },
                    { label: 'Shipping', field: 'shipping' },
                    { label: 'Actions', field: null },
                  ].map(({ label }) => (
                    <th
                      key={label}
                      className="px-6 py-3.5 text-left text-[10px] font-bold text-zinc-500 uppercase tracking-wider"
                    >
                      {label}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-100">
                {orders.length === 0 ? (
                  <tr>
                    <td colSpan="8" className="text-center py-6 text-zinc-500">
                      No orders available.
                    </td>
                  </tr>
                ) : (
                  orders.map((order, idx) => (
                    <tr
                      key={order._id}
                      className={`hover:bg-zinc-50/50 transition-colors ${idx % 2 === 0 ? 'bg-white' : 'bg-zinc-50/20'}`}
                    >
                      <td className="px-6 py-4 text-xs font-semibold text-zinc-900">
                        {order._id ? order._id.slice(0, 8) + '...' : 'N/A'}
                      </td>
                      {/* {console.log(order)} */}
                      <td className="px-6 py-4 text-xs font-medium text-zinc-800">{order.shippingAddress?.name || 'Guest'}</td>
                      <td className="px-6 py-4 text-xs font-bold text-zinc-900">
                        {order.totalAmount ? `₹${order.totalAmount.toFixed(2)}` : 'N/A'}
                      </td>
                      <td className="px-4 sm:px-6 py-3 sm:py-4 text-sm">
                        <div className="space-y-1">
                          <select
                            value={order.orderStatus || 'Pending'}
                            onChange={(e) => updateStatus(order._id, e.target.value)}
                            className="border rounded px-2 py-1 text-gray-700 focus:outline-none focus:ring-2 focus:ring-orange-400 disabled:opacity-50 w-full sm:w-auto text-xs"
                            disabled={!order._id || loading}
                          >
                            {statuses.map((s) => (
                              <option key={s} value={s}>{s}</option>
                            ))}
                          </select>
                          {/* Logistics / Shipping Status */}
                          {(order.shipping?.shiprocket?.current_status || order.shipping?.delhivery?.current_status) && (
                            <div className="text-xs text-blue-600 font-medium">
                              📦 {order.shipping.shiprocket?.current_status || order.shipping.delhivery?.current_status}
                            </div>
                          )}
                          {(order.shipping?.shiprocket?.awb_code || order.shipping?.delhivery?.waybill || order.shipping?.courier?.awb_code) && (
                            <div className="text-xs text-gray-500">
                              AWB: {order.shipping.shiprocket?.awb_code || order.shipping.delhivery?.waybill || order.shipping.courier?.awb_code}
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="px-4 sm:px-6 py-3 sm:py-4 text-sm text-gray-900">{order.paymentStatus || 'N/A'}</td>
                      <td className="px-4 sm:px-6 py-3 sm:py-4 text-sm text-gray-900">
                        {order.createdAt ? new Date(order.createdAt).toLocaleDateString() : 'N/A'}
                      </td>
                      <td className="px-4 sm:px-6 py-3 sm:py-4 text-sm">
                        <QuickShipButton
                          order={order}
                          onUpdate={handleFetch}
                          size="sm"
                        />
                      </td>
                      <td className="px-4 sm:px-6 py-3 sm:py-4 text-sm flex space-x-3 sm:space-x-4 justify-center">
                        <button
                          onClick={() => fetchOrderDetails(order._id)}
                          className="text-gray-600 hover:text-gray-800 transition transform hover:scale-110"
                          aria-label="View order details"
                        >
                          <svg
                            className="w-5 h-5"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                            xmlns="http://www.w3.org/2000/svg"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth="2"
                              d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                            />
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth="2"
                              d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                            />
                          </svg>
                        </button>
                        
                        <button
                          onClick={() => deleteOrder(order._id)}
                          className="text-red-600 hover:text-red-800 transition transform hover:scale-110"
                          disabled={!order._id || loading}
                          aria-label="Delete order"
                        >
                          <Trash2 size={18} />
                        </button>
                        
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Mobile View */}
          <div className="block md:hidden space-y-4">
            {orders.length === 0 ? (
              <div className="text-center py-6 text-gray-600">
                <p className="text-sm sm:text-base font-medium">No orders available.</p>
                {isFilterApplied && (
                  <button
                    onClick={clearFilter}
                    className="mt-2 text-orange-600 hover:text-orange-800 underline text-sm"
                    disabled={loading}
                  >
                    Clear Filters
                  </button>
                )}
              </div>
            ) : (
              orders.map((order) => (
                <div
                  key={order._id}
                  className="p-4 bg-white border border-gray-200 rounded-lg shadow-md hover:shadow-lg transition-shadow"
                >
                  <div className="space-y-2">
                    <div className="flex justify-between items-start">
                      <p className="text-base sm:text-lg font-semibold text-gray-900">
                        Order ID: {order._id ? order._id.slice(0, 10) + '...' : 'N/A'}
                      </p>
                      <span
                        className={`px-2 py-1 rounded-full text-xs font-semibold shadow-sm ${order.orderStatus === 'Delivered'
                          ? 'bg-green-100 text-green-600 border border-green-200'
                          : order.orderStatus === 'Cancelled'
                            ? 'bg-red-100 text-red-600 border border-red-200'
                            : 'bg-orange-100 text-orange-600 border border-orange-200'
                          }`}
                      >
                        {order.orderStatus || 'Pending'}
                      </span>
                    </div>
                    <div className="grid grid-cols-2 gap-2 text-sm text-gray-600">
                      <div>
                        <p>
                          <span className="font-medium">Customer:</span> {order.shippingAddress?.name || 'Guest'}
                        </p>
                        <p>
                          <span className="font-medium">Total:</span>{' '}
                          {order.totalAmount ? `₹${order.totalAmount.toFixed(2)}` : 'N/A'}
                        </p>
                      </div>
                      <div>
                        <p>
                          <span className="font-medium">Payment:</span> {order.paymentStatus || 'N/A'}
                        </p>
                        <p>
                          <span className="font-medium">Date:</span>{' '}
                          {order.createdAt ? new Date(order.createdAt).toLocaleDateString() : 'N/A'}
                        </p>
                      </div>
                    </div>
                    <div className="mt-3">
                      <label className="block text-sm font-medium text-gray-700 mb-1">Update Status</label>
                      <select
                        value={order.orderStatus || 'Pending'}
                        onChange={(e) => updateStatus(order._id, e.target.value)}
                        className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-orange-400 disabled:opacity-50 text-sm"
                        disabled={!order._id || loading}
                      >
                        {statuses.map((s) => (
                          <option key={s} value={s}>{s}</option>
                        ))}
                      </select>

                      {/* Logistics Status for Mobile */}
                      {(order.shipping?.shiprocket?.current_status || order.shipping?.delhivery?.current_status) && (
                        <div className="mt-2 p-2 bg-blue-50 rounded-md">
                          <p className="text-xs text-blue-700 font-medium">
                            📦 Shipping Status: {order.shipping.shiprocket?.current_status || order.shipping.delhivery?.current_status}
                          </p>
                          {(order.shipping.shiprocket?.awb_code || order.shipping.delhivery?.waybill || order.shipping.courier?.awb_code) && (
                            <p className="text-xs text-gray-600 mt-1">
                              AWB: {order.shipping.shiprocket?.awb_code || order.shipping.delhivery?.waybill || order.shipping.courier?.awb_code}
                            </p>
                          )}
                          {(order.shipping.shiprocket?.courier_name || order.shipping.courier?.name) && (
                            <p className="text-xs text-gray-600">
                              Courier: {order.shipping.shiprocket?.courier_name || order.shipping.courier?.name || (order.shipping.method === 'Delhivery' ? 'Delhivery B2C' : '')}
                            </p>
                          )}
                        </div>
                      )}
                    </div>

                    {/* Quick Ship Button for Mobile */}
                    <div className="mt-3 pt-3 border-t border-gray-200">
                      <QuickShipButton
                        order={order}
                        onUpdate={handleFetch}
                        size="md"
                      />
                    </div>

                    <div className="mt-3 pt-3 border-t border-gray-200 flex justify-end space-x-3">
                      <button
                        onClick={() => fetchOrderDetails(order._id)}
                        className="text-gray-600 hover:text-gray-800 transition transform hover:scale-110"
                        aria-label="View order details"
                      >
                        <svg
                          className="w-5 h-5"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                          xmlns="http://www.w3.org/2000/svg"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth="2"
                            d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                          />
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth="2"
                            d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                          />
                        </svg>
                      </button>
                      {/*}
                      <button
                        onClick={() => deleteOrder(order._id)}
                        className="text-red-600 hover:text-red-800 transition transform hover:scale-110"
                        disabled={!order._id || loading}
                        aria-label="Delete order"
                      >
                        <Trash2 size={18} />
                      </button>
                      */}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Pagination */}
          {totalRows > 0 && (
            <div className="mt-4 flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="flex items-center space-x-2">
                <label className="text-sm text-gray-600">Rows per page:</label>
                <select
                  value={rowsPerPage}
                  onChange={(e) => {
                    setRowsPerPage(Number(e.target.value));
                    setPage(1);
                    handleFetch();
                  }}
                  className="border rounded px-2 py-1 text-gray-700 focus:outline-none focus:ring-2 focus:ring-orange-400 disabled:opacity-50"
                  disabled={loading}
                >
                  {[10, 20, 50].map((size) => (
                    <option key={size} value={size}>{size}</option>
                  ))}
                </select>
              </div>
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => {
                    setPage((prev) => Math.max(prev - 1, 1));
                    handleFetch();
                  }}
                  disabled={page === 1 || loading}
                  className="px-3 sm:px-4 py-2 bg-gray-300 rounded disabled:opacity-50"
                >
                  <ChevronLeft size={20} />
                </button>
                <span className="text-sm text-gray-600">
                  Page {page} of {totalPages}
                </span>
                <button
                  onClick={() => {
                    setPage((prev) => Math.min(prev + 1, totalPages));
                    handleFetch();
                  }}
                  disabled={page === totalPages || loading}
                  className="px-3 sm:px-4 py-2 bg-gray-300 rounded disabled:opacity-50"
                >
                  <ChevronRight size={20} />
                </button>
              </div>
            </div>
          )}

          {/* Order Details Dialog */}
          {(loadingDetails || selectedOrder) && (
            <AdminOrderDetails order={selectedOrder} onClose={() => setSelectedOrder(null)} loading={loadingDetails} />
          )}

          {showManualOrderForm && (
            <ManualOrderForm
              onClose={() => setShowManualOrderForm(false)}
              onSuccess={() => {
                handleFetch();
                setShowManualOrderForm(false);
              }}
            />
          )}
        </>
      )}
    </div>
  );
};

export default AdminOrderManager;