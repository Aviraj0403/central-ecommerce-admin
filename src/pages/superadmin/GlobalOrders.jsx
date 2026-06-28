import React, { useEffect, useState } from "react";
import SuperAdminAxios from "../../utils/SuperAdminAxios";
import { toast } from "react-toastify";
import { ShoppingCart, Package, CreditCard, Search, Calendar } from "lucide-react";

const GlobalOrders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  const fetchGlobalOrders = async () => {
    try {
      setLoading(true);
      const res = await SuperAdminAxios.get("/superadmin/tenants/global/orders");
      if (res.data.success) {
        setOrders(res.data.orders);
      }
    } catch (err) {
      toast.error("Failed to load global orders");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchGlobalOrders();
  }, []);

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(amount || 0);
  };

  const filteredOrders = orders.filter(order => 
    order.orderId?.toLowerCase().includes(searchTerm.toLowerCase()) || 
    order.tenantName?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="mb-8 flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-bold text-white tracking-tight">Global Orders Live Feed</h1>
          <p className="text-gray-400 mt-1">Real-time aggregated view of orders across all hosted stores.</p>
        </div>
        <div className="relative w-64">
          <input
            type="text"
            placeholder="Search by Order ID or Store..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-white/5 backdrop-blur-md border border-white/10 rounded-xl pl-10 pr-4 py-2.5 text-sm text-white focus:outline-none focus:border-blue-500/50 focus:bg-white/10 transition-all shadow-inner"
          />
          <Search size={16} className="absolute left-3 top-3 text-gray-500" />
        </div>
      </div>

      <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl overflow-hidden shadow-xl relative group">
        <div className="absolute top-0 right-0 w-96 h-96 bg-blue-500/5 rounded-full blur-3xl pointer-events-none"></div>
        <div className="overflow-x-auto relative z-10">
          <table className="w-full text-left text-sm text-gray-400">
            <thead className="bg-white/5 text-xs uppercase font-bold text-gray-400 border-b border-white/10 tracking-wider">
              <tr>
                <th className="px-6 py-5">Order Details</th>
                <th className="px-6 py-5">Tenant (Store)</th>
                <th className="px-6 py-5">Amount</th>
                <th className="px-6 py-5">Status</th>
                <th className="px-6 py-5">Date</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="5" className="px-6 py-12 text-center">
                    <div className="inline-block animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
                  </td>
                </tr>
              ) : filteredOrders.length === 0 ? (
                <tr>
                  <td colSpan="5" className="px-6 py-12 text-center text-gray-500 font-medium">No recent orders found.</td>
                </tr>
              ) : (
                filteredOrders.map((order, idx) => (
                  <tr key={idx} className="border-b border-white/5 hover:bg-white/5 transition-all">
                    <td className="px-6 py-4 font-medium text-white flex items-center gap-4">
                      <div className="w-10 h-10 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400 shadow-inner">
                        <Package size={16} />
                      </div>
                      <div className="flex flex-col">
                        <span className="text-gray-200 font-bold tracking-wide text-xs">{order.orderId || order._id}</span>
                        <span className="text-[11px] font-semibold text-blue-400/80 uppercase mt-0.5">{order.items?.length || 0} items</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="inline-flex items-center px-3 py-1 rounded-lg text-xs font-bold bg-blue-500/10 text-blue-400 border border-blue-500/20 shadow-sm uppercase tracking-wider">
                        {order.tenantName} <span className="opacity-50 ml-1">({order.tenantId})</span>
                      </span>
                    </td>
                    <td className="px-6 py-4 font-bold text-emerald-400 text-base">
                      {formatCurrency(order.totalAmount || order.total)}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-col space-y-1.5">
                        <span className={`text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-lg inline-block w-max border shadow-sm ${
                          order.orderStatus === 'delivered' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' :
                          order.orderStatus === 'shipped' ? 'bg-blue-500/10 text-blue-400 border-blue-500/20' :
                          'bg-orange-500/10 text-orange-400 border-orange-500/20'
                        }`}>
                          {order.orderStatus || 'Pending'}
                        </span>
                        <span className={`text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-lg border shadow-sm flex items-center gap-1.5 w-max ${
                          order.paymentStatus === 'paid' ? 'text-emerald-400 bg-emerald-500/5 border-emerald-500/10' : 'text-gray-400 bg-white/5 border-white/10'
                        }`}>
                          <CreditCard size={10} /> {order.paymentStatus || 'unpaid'}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-gray-400 flex items-center gap-2 font-medium">
                      <div className="p-1.5 bg-white/5 rounded-md border border-white/10">
                        <Calendar size={14} className="text-gray-400" />
                      </div>
                      {new Date(order.createdAt).toLocaleDateString()}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default GlobalOrders;
