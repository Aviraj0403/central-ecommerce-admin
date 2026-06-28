import React, { useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';
import {
  TrendingUp,
  Package,
  Truck,
  CheckCircle,
  BarChart3,
  PieChart as PieChartIcon,
  Calendar,
  Download,
  Activity,
  Zap,
  ArrowUpRight,
  ArrowDownRight,
  Filter,
  RefreshCw
} from 'lucide-react';
import { motion } from 'framer-motion';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend
} from 'recharts';
import { getShippingAnalytics } from '../../services/ShiprocketApi';

const COLORS = ['#ea580c', '#18181b', '#71717a', '#a1a1aa', '#d4d4d8'];

const StatCard = ({ title, value, subtext, icon: Icon, color, trend }) => {
  const colorMap = {
    blue: { bg: 'bg-orange-50 border-orange-100', text: 'text-orange-650' },
    emerald: { bg: 'bg-zinc-50 border-zinc-200', text: 'text-zinc-800' },
    orange: { bg: 'bg-orange-50 border-orange-100', text: 'text-orange-650' },
    purple: { bg: 'bg-zinc-55 bg-zinc-50 border-zinc-200', text: 'text-zinc-800' }
  };
  const theme = colorMap[color] || colorMap.blue;

  return (
    <div className="bg-white rounded-xl p-5 border border-zinc-200/80 shadow-sm transition">
      <div className="flex justify-between items-start mb-4">
        <div className={`p-2.5 rounded-lg border ${theme.bg} ${theme.text}`}>
          <Icon className="w-5 h-5" />
        </div>
        {trend !== undefined && (
          <div className={`flex items-center gap-0.5 text-xs font-semibold ${trend > 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
            {trend > 0 ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
            {Math.abs(trend)}%
          </div>
        )}
      </div>
      <div className="space-y-1">
        <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider">{title}</p>
        <h3 className="text-2xl font-bold text-zinc-900 tracking-tight">{value}</h3>
        <p className="text-[10px] text-zinc-500 font-medium">{subtext}</p>
      </div>
    </div>
  );
};

const ShippingAnalytics = () => {
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [dateRange, setDateRange] = useState({
    startDate: '',
    endDate: ''
  });

  const fetchAnalytics = async () => {
    try {
      setLoading(true);
      const params = {};
      if (dateRange.startDate && dateRange.endDate) {
        params.startDate = dateRange.startDate;
        params.endDate = dateRange.endDate;
      }

      const response = await getShippingAnalytics(params);
      setAnalytics(response.analytics);
    } catch (error) {
      console.error('Error fetching analytics:', error);
      toast.error('Failed to fetch shipping analytics');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const handleDateRangeChange = (field, value) => {
    setDateRange(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const applyDateFilter = () => {
    if (dateRange.startDate && dateRange.endDate) {
      if (new Date(dateRange.startDate) > new Date(dateRange.endDate)) {
        toast.error('Start date cannot be after end date');
        return;
      }
    }
    fetchAnalytics();
  };

  const clearDateFilter = () => {
    setDateRange({ startDate: '', endDate: '' });
    setTimeout(fetchAnalytics, 100);
  };

  const exportData = () => {
    if (!analytics) return;

    const data = {
      summary: analytics.summary,
      courier_performance: analytics.courier_performance,
      status_breakdown: analytics.status_breakdown,
      generated_at: new Date().toISOString()
    };

    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `shipping-intelligence-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    toast.success('Intelligence report exported');
  };

  if (loading) {
    return (
      <div className="p-8 min-h-[60vh] flex flex-col items-center justify-center font-sans">
        <RefreshCw className="w-8 h-8 text-orange-600 animate-spin" />
        <p className="mt-3 text-xs text-zinc-500 font-medium uppercase tracking-wider">Loading Analytics Node...</p>
      </div>
    );
  }

  const statusChartData = analytics?.status_breakdown?.map(item => ({
    name: item._id,
    value: item.count
  })) || [];

  const trendData = analytics?.daily_stats?.map(item => ({
    date: item._id,
    volume: item.count,
    value: Math.round(item.total_value)
  })) || [];

  return (
    <div className="p-6 min-h-screen bg-zinc-50/50 space-y-6 max-w-[1400px] mx-auto font-sans">
      {/* Header */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6 border-b border-zinc-200/80 pb-5">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-xl font-bold text-zinc-900 flex items-center gap-2">
              <BarChart3 className="w-5 h-5 text-orange-600" /> Shiprocket Intelligence
            </h1>
          </div>
          <p className="text-xs text-zinc-500 mt-0.5">Logistics Command Center & Analytics Node</p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-2 bg-white rounded-lg border border-zinc-200 p-1.5 shadow-sm text-xs">
            <Calendar className="w-4 h-4 text-orange-600" />
            <input
              type="date"
              value={dateRange.startDate}
              onChange={(e) => handleDateRangeChange('startDate', e.target.value)}
              className="bg-transparent border-none text-[11px] font-semibold outline-none text-zinc-700"
            />
            <span className="text-zinc-300 font-bold px-1">/</span>
            <input
              type="date"
              value={dateRange.endDate}
              onChange={(e) => handleDateRangeChange('endDate', e.target.value)}
              className="bg-transparent border-none text-[11px] font-semibold outline-none text-zinc-700"
            />
            <button
              onClick={applyDateFilter}
              className="ml-2 px-2 py-1 bg-orange-600 text-white rounded text-[10px] font-semibold hover:bg-orange-700 transition"
            >
              Filter
            </button>
            {dateRange.startDate && (
              <button
                onClick={clearDateFilter}
                className="p-1 text-zinc-400 hover:text-zinc-600"
              >
                <RefreshCw className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          <button
            onClick={exportData}
            className="flex items-center gap-2 px-4 py-2 bg-zinc-900 text-white rounded-lg text-xs font-semibold hover:bg-zinc-800 transition shadow-sm cursor-pointer"
          >
            <Download className="w-4 h-4 text-orange-400" />
            Export Intel
          </button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Total Payload"
          value={analytics.summary?.total_shipments || 0}
          subtext="Total unique shipments processed"
          icon={Package}
          color="blue"
          trend={12.4}
        />
        <StatCard
          title="Revenue Pipeline"
          value={`₹${Math.round(analytics.summary?.total_value || 0).toLocaleString()}`}
          subtext="Total GMV through logistics"
          icon={TrendingUp}
          color="emerald"
          trend={8.2}
        />
        <StatCard
          title="Fulfillment Grade"
          value={`${Math.round(analytics.summary?.delivery_rate || 0)}%`}
          subtext="Success rate for deliveries"
          icon={CheckCircle}
          color="orange"
          trend={2.1}
        />
        <StatCard
          title="Efficiency Index"
          value={`₹${Math.round(analytics.summary?.avg_order_value || 0)}`}
          subtext="Average value per shipment"
          icon={Zap}
          color="purple"
          trend={-1.5}
        />
      </div>

      {/* Visualizations */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Area Chart */}
        <div className="bg-white border border-zinc-200/80 rounded-xl p-5 shadow-sm lg:col-span-2 space-y-4">
          <div>
            <h3 className="text-sm font-bold text-zinc-900 uppercase tracking-wider">Volume Matrix</h3>
            <p className="text-[10px] text-zinc-400 font-bold uppercase mt-0.5">Shipping trends over temporal segments</p>
          </div>

          <div className="h-[350px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={trendData} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorVolume" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#ea580c" stopOpacity={0.2} />
                    <stop offset="95%" stopColor="#ea580c" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#f4f4f5" />
                <XAxis
                  dataKey="date"
                  stroke="#a1a1aa"
                  fontSize={11}
                  tickLine={false}
                />
                <YAxis
                  stroke="#a1a1aa"
                  fontSize={11}
                  tickLine={false}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#ffffff',
                    border: '1px solid #e4e4e7',
                    borderRadius: '8px',
                    fontSize: '12px'
                  }}
                />
                <Area
                  type="monotone"
                  dataKey="volume"
                  stroke="#ea580c"
                  strokeWidth={2}
                  fillOpacity={1}
                  fill="url(#colorVolume)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Status Pie Chart */}
        <div className="bg-white border border-zinc-200/80 rounded-xl p-5 shadow-sm space-y-4">
          <div>
            <h3 className="text-sm font-bold text-zinc-900 uppercase tracking-wider">Status Node</h3>
            <p className="text-[10px] text-zinc-400 font-bold uppercase mt-0.5">Fulfillment Lifecycle Share</p>
          </div>

          <div className="h-[250px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={statusChartData}
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={70}
                  paddingAngle={4}
                  dataKey="value"
                >
                  {statusChartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#ffffff',
                    border: '1px solid #e4e4e7',
                    borderRadius: '8px',
                    fontSize: '12px'
                  }}
                />
                <Legend iconType="circle" wrapperStyle={{ fontSize: '10px', textTransform: 'uppercase' }} />
              </PieChart>
            </ResponsiveContainer>
          </div>

          <div className="space-y-2 pt-2">
            {statusChartData.slice(0, 3).map((item, idx) => (
              <div key={idx} className="flex justify-between items-center p-2 bg-zinc-50 border border-zinc-200/60 rounded-lg text-xs">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full" style={{ backgroundColor: COLORS[idx] }}></div>
                  <span className="font-semibold text-zinc-700 uppercase text-[10px]">{item.name}</span>
                </div>
                <span className="font-bold text-zinc-900">{item.value}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Courier Matrix */}
      <div className="bg-white border border-zinc-200/80 rounded-xl shadow-sm overflow-hidden">
        <div className="p-5 border-b border-zinc-150 flex justify-between items-center">
          <div>
            <h3 className="text-sm font-bold text-zinc-900 uppercase tracking-wider">Courier Performance Matrix</h3>
            <p className="text-[10px] text-zinc-400 font-bold uppercase mt-0.5">Performance heuristics by shipping partner</p>
          </div>
          <div className="hidden sm:flex items-center gap-1.5 px-3 py-1 bg-zinc-50 border border-zinc-200 rounded-lg text-[10px] text-zinc-500 font-semibold">
            <Truck className="w-3.5 h-3.5" />
            Live Feed
          </div>
        </div>

        <div className="overflow-x-auto text-xs">
          <table className="min-w-full text-left">
            <thead className="bg-zinc-50">
              <tr>
                <th className="px-6 py-3 font-semibold text-zinc-650 uppercase tracking-wider">Carrier Partner</th>
                <th className="px-6 py-3 font-semibold text-zinc-650 uppercase tracking-wider text-center">Operational Load</th>
                <th className="px-6 py-3 font-semibold text-zinc-650 uppercase tracking-wider text-center">Fulfilled</th>
                <th className="px-6 py-3 font-semibold text-zinc-650 uppercase tracking-wider">Efficiency index</th>
                <th className="px-6 py-3 font-semibold text-zinc-650 uppercase tracking-wider text-right">Capital flow</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-200/60">
              {analytics.courier_performance?.map((courier, idx) => {
                const successRate = Math.round((courier.delivered / courier.total_shipments) * 100);
                return (
                  <tr key={idx} className="hover:bg-zinc-50/50 transition">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 bg-zinc-900 rounded-lg flex items-center justify-center text-white font-bold text-xs">
                          {courier._id?.charAt(0) || 'U'}
                        </div>
                        <div>
                          <p className="font-semibold text-zinc-900 uppercase tracking-tight text-xs">{courier._id || 'Unknown'}</p>
                          <p className="text-[9px] text-orange-600 font-bold uppercase">Fleet Node</p>
                        </div>
                      </div>
                    </td>
                    <td className="text-center">
                      <span className="px-2 py-1 bg-orange-50 border border-orange-100 text-orange-700 text-[10px] font-semibold rounded">{courier.total_shipments} Units</span>
                    </td>
                    <td className="text-center font-semibold text-zinc-900">{courier.delivered}</td>
                    <td className="px-6 min-w-[200px]">
                      <div className="flex items-center gap-3">
                        <div className="flex-1 h-2.5 bg-zinc-100 rounded-full overflow-hidden border border-zinc-200/60">
                          <div
                            className={`h-full rounded-full transition-all duration-500 ${successRate >= 80 ? 'bg-emerald-500' : successRate >= 50 ? 'bg-orange-600' : 'bg-rose-500'}`}
                            style={{ width: `${successRate}%` }}
                          />
                        </div>
                        <span className="font-bold text-zinc-950 w-8 text-right">{successRate}%</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <p className="font-bold text-zinc-900">₹{Math.round(courier.total_value).toLocaleString()}</p>
                      <p className="text-[9px] text-zinc-400 uppercase font-semibold">Processed Capital</p>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Footer */}
      <div className="flex justify-between items-center py-4 border-t border-zinc-200/60 text-[10px] text-zinc-400 font-semibold uppercase tracking-wider">
        <div className="flex items-center gap-2">
          <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse"></div>
          <span>Shiprocket Intel Service: Active</span>
        </div>
        <p>Node Time: {new Date().toLocaleTimeString()}</p>
      </div>
    </div>
  );
};

export default ShippingAnalytics;