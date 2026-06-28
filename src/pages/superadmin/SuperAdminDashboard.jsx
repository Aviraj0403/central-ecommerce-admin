import React, { useEffect, useState } from "react";
import SuperAdminAxios from "../../utils/SuperAdminAxios";
import { toast } from "react-toastify";
import { Users, ShoppingCart, DollarSign, Building2, TrendingUp, Activity } from "lucide-react";

const SuperAdminDashboard = () => {
  const [stats, setStats] = useState({
    totalProjects: 0,
    totalUsers: 0,
    totalOrders: 0,
    totalRevenue: 0
  });
  const [loading, setLoading] = useState(true);

  const fetchStats = async () => {
    try {
      setLoading(true);
      const res = await SuperAdminAxios.get("/superadmin/tenants/global/stats");
      if (res.data.success) {
        setStats(res.data.stats);
      }
    } catch (err) {
      toast.error("Failed to load global metrics");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(amount);
  };

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white tracking-tight">System Dashboard</h1>
        <p className="text-gray-400 mt-1">Real-time aggregated metrics across all active tenants.</p>
      </div>

      {loading ? (
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500"></div>
        </div>
      ) : (
        <>
          {/* Key Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6 relative overflow-hidden group hover:border-purple-500/50 hover:bg-white/10 transition-all shadow-xl">
              <div className="absolute -right-4 -top-4 w-24 h-24 bg-purple-600/10 rounded-full blur-2xl group-hover:bg-purple-600/20 transition-all"></div>
              <div className="flex justify-between items-start mb-4 relative z-10">
                <div className="w-12 h-12 rounded-xl bg-purple-500/20 text-purple-400 flex items-center justify-center shadow-inner border border-purple-500/20">
                  <DollarSign size={24} />
                </div>
                <span className="flex items-center text-emerald-400 text-xs font-bold bg-emerald-500/10 border border-emerald-500/20 px-2.5 py-1 rounded-full">
                  <TrendingUp size={12} className="mr-1" /> +12%
                </span>
              </div>
              <h3 className="text-gray-400 text-sm font-semibold uppercase tracking-wider relative z-10">Total Gross Revenue</h3>
              <p className="text-3xl font-bold text-white mt-1 relative z-10">{formatCurrency(stats.totalRevenue)}</p>
            </div>

            <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6 relative overflow-hidden group hover:border-blue-500/50 hover:bg-white/10 transition-all shadow-xl">
              <div className="absolute -right-4 -top-4 w-24 h-24 bg-blue-600/10 rounded-full blur-2xl group-hover:bg-blue-600/20 transition-all"></div>
              <div className="flex justify-between items-start mb-4 relative z-10">
                <div className="w-12 h-12 rounded-xl bg-blue-500/20 text-blue-400 flex items-center justify-center shadow-inner border border-blue-500/20">
                  <ShoppingCart size={24} />
                </div>
              </div>
              <h3 className="text-gray-400 text-sm font-semibold uppercase tracking-wider relative z-10">Total Orders Processed</h3>
              <p className="text-3xl font-bold text-white mt-1 relative z-10">{stats.totalOrders.toLocaleString()}</p>
            </div>

            <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6 relative overflow-hidden group hover:border-emerald-500/50 hover:bg-white/10 transition-all shadow-xl">
              <div className="absolute -right-4 -top-4 w-24 h-24 bg-emerald-600/10 rounded-full blur-2xl group-hover:bg-emerald-600/20 transition-all"></div>
              <div className="flex justify-between items-start mb-4 relative z-10">
                <div className="w-12 h-12 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center shadow-inner border border-emerald-500/20">
                  <Users size={24} />
                </div>
              </div>
              <h3 className="text-gray-400 text-sm font-semibold uppercase tracking-wider relative z-10">Global Registered Users</h3>
              <p className="text-3xl font-bold text-white mt-1 relative z-10">{stats.totalUsers.toLocaleString()}</p>
            </div>

            <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6 relative overflow-hidden group hover:border-orange-500/50 hover:bg-white/10 transition-all shadow-xl">
              <div className="absolute -right-4 -top-4 w-24 h-24 bg-orange-600/10 rounded-full blur-2xl group-hover:bg-orange-600/20 transition-all"></div>
              <div className="flex justify-between items-start mb-4 relative z-10">
                <div className="w-12 h-12 rounded-xl bg-orange-500/20 text-orange-400 flex items-center justify-center shadow-inner border border-orange-500/20">
                  <Building2 size={24} />
                </div>
              </div>
              <h3 className="text-gray-400 text-sm font-semibold uppercase tracking-wider relative z-10">Active Tenants (Stores)</h3>
              <p className="text-3xl font-bold text-white mt-1 relative z-10">{stats.totalProjects}</p>
            </div>
          </div>
          
          {/* Charts Area Placeholder */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
             <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6 h-96 flex flex-col justify-center items-center text-gray-500 relative overflow-hidden group">
               <div className="absolute top-0 right-0 w-64 h-64 bg-purple-500/5 rounded-full blur-3xl pointer-events-none"></div>
               <Activity size={48} className="mb-4 opacity-50" />
               <p className="font-semibold">Revenue Growth Chart</p>
               <p className="text-xs mt-2 text-gray-600">(Chart.js / Recharts implementation pending)</p>
             </div>
             <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6 h-96 flex flex-col justify-center items-center text-gray-500 relative overflow-hidden group">
               <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/5 rounded-full blur-3xl pointer-events-none"></div>
               <Users size={48} className="mb-4 opacity-50" />
               <p className="font-semibold">User Acquisition Chart</p>
               <p className="text-xs mt-2 text-gray-600">(Chart.js / Recharts implementation pending)</p>
             </div>
          </div>
        </>
      )}
    </div>
  );
};

export default SuperAdminDashboard;
