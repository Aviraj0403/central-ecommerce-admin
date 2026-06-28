import React ,{ useEffect, useState, useRef } from 'react';
import { io } from 'socket.io-client';
import { 
  Printer, TrendingUp, Users, Package, DollarSign, Download, BarChart3, 
  Activity, Zap, Star, Award, ArrowUpRight, Eye, RefreshCw, Calendar,
  Filter, Settings, Bell, Search, Sparkles, Target, Globe
} from 'lucide-react';
import SalesChart from '../pages/report/SalesChart';
import WeeklyStatsPieChart from '../pages/Graph/WeeklyStatsPieChart';
import { getTodayOrders, getTotalRevenue, getTotalOrders, getWeeklyStats, getMonthlyStats, getTotalUsers ,getTotalProducts} from '../services/dashboartdApi'; // Import the necessary API functions
import ModernLineChart from './Graph/ModernLineChart';

export default function Dashboard() {
  const [orders, setOrders] = useState([]);
  const [totalRevenue, setTotalRevenue] = useState(0);
  const [totalOrders, setTotalOrders] = useState(0);
  const [totalUsers, setTotalUsers] = useState(0);
  const [weeklyStats, setWeeklyStats] = useState([]);
  const [monthlyStats, setMonthlyStats] = useState([]);
  const [totalProducts, setTotalProducts] = useState(0);
  const [socket, setSocket] = useState(null);
  const [loading, setLoading] = useState(true);
  const ordersRef = useRef();

  const socketURL = 'https://api.gurmeetkaurstore.com';

  useEffect(() => {
    const socket = io(socketURL, {
      withCredentials: true,
      transports: ['websocket', 'polling'],
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
    });
    setSocket(socket);

    fetchData();

    socket.on('newOrder', (order) => {
      console.log('📦 New order received: ', order);
      setOrders((prevOrders) => [order, ...prevOrders]);
    });

    socket.on('connect', () => {
      console.log('📡 Connected to WebSocket server');
    });

    socket.on('disconnect', (reason) => {
      console.warn('📡 Disconnected from WebSocket:', reason);
    });

    socket.on('reconnect', (attemptNumber) => {
      console.log('📡 Reconnected after', attemptNumber, 'attempts');
      fetchData();
    });

    socket.on('connect_error', (error) => {
      console.error('📡 Connection error:', error);
    });

    return () => {
      socket.disconnect();
    };
  }, []);

  // Fetch data from all APIs
  const fetchData = async () => {
    try {
      setLoading(true);

      const todayOrdersResponse = await getTodayOrders();
      const totalRevenueResponse = await getTotalRevenue();
      const totalOrdersResponse = await getTotalOrders();
      const weeklyStatsResponse = await getWeeklyStats();
      const monthlyStatsResponse = await getMonthlyStats();
      const totalUsersResponse = await getTotalUsers();
      const totalProductsResponse = await getTotalProducts();
      setOrders(todayOrdersResponse.orders || []);
      setTotalRevenue(totalRevenueResponse || 0);
      setTotalOrders(totalOrdersResponse || 0);
      setWeeklyStats(weeklyStatsResponse || []);
      setMonthlyStats(monthlyStatsResponse || []);
      setTotalUsers(totalUsersResponse || 0);
      setTotalProducts(totalProductsResponse || 0);

    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handlePrintOrders = () => {
    const printContent = ordersRef.current.innerHTML;
    const printWindow = window.open('', '', 'width=800,height=600');

    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>Today's Orders</title>
          <style>
            body { padding: 20px; font-family: Arial, sans-serif; }
            h2 { font-size: 24px; margin-bottom: 20px; color: #ea580c; }
            .order-card { 
              border: 1px solid #ddd; 
              padding: 15px; 
              margin-bottom: 15px; 
              border-radius: 12px;
              page-break-inside: avoid;
              box-shadow: 0 2px 10px rgba(0,0,0,0.1);
            }
            .order-header { 
              display: flex; 
              justify-content: space-between; 
              margin-bottom: 10px;
              font-weight: bold;
            }
            .order-details { font-size: 14px; line-height: 1.6; }
            .badge { 
              padding: 4px 8px; 
              border-radius: 4px; 
              font-size: 12px;
              font-weight: bold;
            }
            .badge-pending { background: #fed7aa; color: #c2410c; }
            .badge-delivered { background: #dcfce7; color: #15803d; }
            .badge-cancelled { background: #fee2e2; color: #b91c1c; }
            @media print {
              body { margin: 0; }
            }
          </style>
        </head>
        <body>
          <h2>Today's Orders - ${new Date().toLocaleDateString()}</h2>
          ${printContent}
        </body>
      </html>
    `);

    printWindow.document.close();
    printWindow.focus();
    setTimeout(() => {
      printWindow.print();
      printWindow.close();
    }, 250);
  };

  return (
    <div className="min-h-screen bg-[#FAF9F6] relative overflow-hidden">
      {/* Premium Subtle Accents */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-orange-500/[0.02] blur-[120px] rounded-full"></div>
        <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-amber-500/[0.02] blur-[120px] rounded-full"></div>
      </div>

      {/* Main Content Container */}
      <div className="relative z-10 p-2 sm:p-4">
        {/* Page Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
          <div>
            <h2 className="text-2xl font-black tracking-tight text-zinc-900 uppercase">Store Analytics</h2>
            <p className="text-sm text-zinc-500 mt-1">Real-time performance metrics and sales overview.</p>
          </div>
        </div>

        {/* Enhanced KPI Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-5 mb-8">
          <PremiumKPICard 
            title="Total Revenue" 
            value={`₹${totalRevenue.toLocaleString()}`} 
            color="orange" 
            icon={<DollarSign className="w-5 h-5 text-orange-600" />}
            trend="+12.5%"
            subtitle="vs last month"
            sparkline={[65, 78, 66, 44, 56, 67, 75]}
          />
          <PremiumKPICard 
            title="Today's Orders" 
            value={orders.length} 
            color="orange" 
            icon={<Package className="w-5 h-5 text-orange-600" />}
            trend="+8.2%"
            subtitle="vs yesterday"
            sparkline={[45, 52, 38, 24, 33, 26, 21]}
          />
          <PremiumKPICard 
            title="Products Available" 
            value={totalProducts.toLocaleString()} 
            color="orange" 
            icon={<BarChart3 className="w-5 h-5 text-orange-600" />}
            trend="+5.1%"
            subtitle="inventory growth"
            sparkline={[35, 41, 62, 42, 13, 18, 29]}
          />
          <PremiumKPICard 
            title="Active Customers" 
            value={totalUsers.toLocaleString()} 
            color="orange" 
            icon={<Users className="w-5 h-5 text-orange-600" />}
            trend="+15.3%"
            subtitle="user engagement"
            sparkline={[24, 13, 98, 39, 48, 38, 58]}
          />
        </div>

      {/* Today's Orders */}
      <section className="z-10 relative mt-8 sm:mt-12">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h3 className="text-lg font-bold text-zinc-900 uppercase tracking-tight">
              Today's Orders {orders.length > 0 && `(${orders.length})`}
            </h3>
            <p className="text-xs text-zinc-500 mt-0.5">Live orders coming from your online store channel.</p>
          </div>
          {orders.length > 0 && (
            <button
              onClick={handlePrintOrders}
              className="flex items-center gap-2 px-4 py-2 bg-zinc-900 text-white rounded-lg hover:bg-zinc-800 transition-all font-semibold text-xs shadow cursor-pointer"
            >
              <Printer size={14} />
              Print Orders
            </button>
          )}
        </div>

  {loading ? (
    <div className="text-center text-gray-500 py-10 sm:py-20">
      <div className="inline-block w-12 h-12 border-4 border-orange-500 border-t-transparent rounded-full animate-spin"></div>
      <p className="mt-4">Loading orders...</p>
    </div>
  ) : (
    <div ref={ordersRef} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
      {orders.length > 0 ? (
        orders.map((order) => (
          <div
            key={order._id}
            className="order-card bg-white p-6 rounded-lg shadow-xl border border-gray-200 hover:shadow-2xl transition-shadow"
          >
            <div className="space-y-4">
              {/* Customer & Status */}
              <div className="order-header flex justify-between items-start">
                <h4 className="text-base sm:text-lg font-semibold text-gray-800">
                  {order?.shippingAddress?.name || 'N/A'}
                </h4>
                <span
                  className={`badge px-2 py-1 rounded-full text-xs font-semibold shadow-sm ${
                    order.orderStatus === 'Delivered'
                      ? 'bg-green-100 text-green-600'
                      : order.orderStatus === 'Cancelled'
                      ? 'bg-red-100 text-red-600'
                      : 'bg-orange-100 text-orange-600'
                  }`}
                >
                  {order.orderStatus || 'Pending'}
                </span>
              </div>

              {/* Order Details */}
              <div className="order-details text-sm text-gray-600">
                <p>
                  <span className="font-medium">Order ID:</span>{' '}
                  {order?._id ? order._id.slice(0, 10) + '...' : 'N/A'}
                </p>
                <p>
                  <span className="font-medium">Time:</span>{' '}
                  {order?.placedAt ? new Date(order.placedAt).toLocaleString() : 'N/A'}
                </p>
              </div>

              {/* Payment Method & Status */}
              <div className="text-sm text-gray-600">
                <p>
                  <span className="font-medium">Payment:</span> {order?.paymentMethod || 'N/A'}
                </p>
                <p>
                  <span className="font-medium">Status:</span>{' '}
                  <span
                    className={`inline-block px-2 py-1 rounded-full text-xs font-semibold shadow-sm ${
                      order.paymentStatus === 'Paid'
                        ? 'bg-green-100 text-green-600'
                        : 'bg-red-100 text-red-600'
                    }`}
                  >
                    {order.paymentStatus || 'N/A'}
                  </span>
                </p>
              </div>

              {/* Items */}
              <div className="border-t border-gray-300 pt-4">
                <h5 className="text-lg font-semibold text-gray-800 mb-2">Items:</h5>
                <div className="overflow-auto max-h-60">
                  {order?.items?.length > 0 ? (
                    <ul className="space-y-4 text-sm text-gray-700">
                      {order.items.map((item, i) => (
                        <li
                          key={i}
                          className="flex justify-between items-center py-3 px-4 rounded-lg bg-gray-50 shadow-sm hover:bg-gray-100 transition duration-200"
                        >
                          <div className="flex flex-col sm:flex-row sm:space-x-4 w-full">
                            <div className="flex flex-col sm:flex-row w-full">
                              <span className="font-medium text-gray-800 w-full sm:w-auto">
                                {item?.selectedVariant?.name || item?.product?.name || 'Unknown'}
                              </span>
                              <span className="text-xs sm:text-sm text-gray-600 sm:ml-4">
                                ({item?.selectedVariant?.size}/{item?.selectedVariant?.color})
                              </span>
                            </div>

                            <div className="flex flex-col sm:flex-row sm:justify-end items-end text-sm space-x-1 sm:space-x-3">
                              <span className="font-semibold text-gray-900">
                                {item?.quantity || 0} × ₹
                                {item?.selectedVariant?.price || item?.product?.price || 0}
                              </span>
                            </div>
                          </div>
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <div className="text-center text-gray-500">No items available</div>
                  )}
                </div>
              </div>

              {/* Total */}
              <p className="text-base sm:text-lg font-bold text-gray-900 border-t pt-2">
                Total: ₹{order?.totalAmount?.toFixed(2) || '0.00'}
              </p>
            </div>
          </div>
        ))
      ) : (
        <div className="col-span-full text-center py-12 text-gray-600">
          <p className="text-lg font-medium">No orders yet today.</p>
          <p className="text-sm text-gray-500 mt-2">New orders will appear here automatically.</p>
        </div>
      )}
    </div>
  )}
</section>


        {/* Premium Analytics Section */}
        <section className="mb-12">

          {/* Charts Grid */}
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
            <div className="bg-white rounded-2xl border border-zinc-200/60 p-4 shadow-sm">
              <WeeklyStatsPieChart statsData={weeklyStats} />
            </div>
            <div className="bg-white rounded-2xl border border-zinc-200/60 p-4 shadow-sm">
              <ModernLineChart statsData={weeklyStats} />
            </div>
          </div>
        </section>

        {/* Enhanced Sales Performance */}
        <section className="mb-12">
          <div className="bg-white rounded-2xl border border-zinc-200/60 p-6 shadow-sm">
            <div className="flex flex-col xl:flex-row justify-between items-start xl:items-center mb-8 gap-6">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-xl shadow-sm">
                  <Target className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-gray-900 mb-0.5">Sales Performance</h3>
                  <p className="text-sm text-gray-500">Monthly revenue trends and target analysis</p>
                </div>
              </div>
              
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-green-100 to-emerald-100 rounded-xl shadow-lg border border-emerald-200/50">
                  <TrendingUp className="w-5 h-5 text-emerald-600" />
                  <span className="text-emerald-700 font-bold">+18.5% Growth</span>
                </div>
                <div className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-100 to-indigo-100 rounded-xl shadow-lg border border-blue-200/50">
                  <Award className="w-5 h-5 text-blue-600" />
                  <span className="text-blue-700 font-bold">Target Achieved</span>
                </div>
              </div>
            </div>
            <SalesChart />
          </div>
        </section>
      </div>
    </div>
  );
}

// Premium KPI Card Component with Sparkline
const PremiumKPICard = ({ title, value, color, icon, trend, subtitle, sparkline }) => {
  const colorMap = {
    orange: {
      gradient: 'from-orange-500 via-orange-600 to-amber-700',
      light: 'from-orange-50 to-amber-50',
      accent: 'text-orange-600',
      shadow: 'shadow-orange-500/25',
      border: 'border-orange-200/50'
    },
    indigo: {
      gradient: 'from-indigo-500 via-indigo-600 to-purple-700',
      light: 'from-indigo-50 to-purple-50',
      accent: 'text-indigo-600',
      shadow: 'shadow-indigo-500/25',
      border: 'border-indigo-200/50'
    },
    emerald: {
      gradient: 'from-emerald-500 via-green-600 to-teal-700',
      light: 'from-emerald-50 to-teal-50',
      accent: 'text-emerald-600',
      shadow: 'shadow-emerald-500/25',
      border: 'border-emerald-200/50'
    },
    purple: {
      gradient: 'from-purple-500 via-purple-600 to-pink-700',
      light: 'from-purple-50 to-pink-50',
      accent: 'text-purple-600',
      shadow: 'shadow-purple-500/25',
      border: 'border-purple-200/50'
    },
    rose: {
      gradient: 'from-rose-500 via-pink-600 to-red-700',
      light: 'from-rose-50 to-pink-50',
      accent: 'text-rose-600',
      shadow: 'shadow-rose-500/25',
      border: 'border-rose-200/50'
    },
  };

  const colors = colorMap[color];

  // Simple sparkline SVG
  const SparklineChart = ({ data }) => {
    const max = Math.max(...data);
    const min = Math.min(...data);
    const range = max - min || 1;
    
    const points = data.map((value, index) => {
      const x = (index / (data.length - 1)) * 100;
      const y = 100 - ((value - min) / range) * 100;
      return `${x},${y}`;
    }).join(' ');

    return (
      <svg className="w-20 h-8" viewBox="0 0 100 100" preserveAspectRatio="none">
        <polyline
          fill="none"
          stroke="currentColor"
          strokeWidth="3"
          points={points}
          className={colors.accent}
        />
        <defs>
          <linearGradient id={`gradient-${color}`} x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="currentColor" stopOpacity="0.3" />
            <stop offset="100%" stopColor="currentColor" stopOpacity="0.05" />
          </linearGradient>
        </defs>
        <polyline
          fill={`url(#gradient-${color})`}
          stroke="none"
          points={`0,100 ${points} 100,100`}
          className={colors.accent}
        />
      </svg>
    );
  };

  return (
    <div className={`group relative bg-white rounded-2xl p-6 shadow-sm border ${colors.border} overflow-hidden`}>
      {/* Subtle Background Accent */}
      <div className={`absolute inset-0 bg-gradient-to-br ${colors.light} opacity-30`}></div>
      
      {/* Content */}
      <div className="relative z-10">
        {/* Header with Icon and Trend */}
        <div className="flex items-start justify-between mb-4">
          <div className={`p-2.5 bg-gradient-to-br ${colors.gradient} rounded-xl shadow-sm`}>
            <div className="text-white">
              {icon}
            </div>
          </div>
          
          {trend && (
            <div className="flex flex-col items-end">
              <div className="flex items-center gap-1 px-3 py-1 bg-green-100/80 backdrop-blur-sm rounded-lg shadow-sm">
                <ArrowUpRight className="w-4 h-4 text-green-600" />
                <span className="text-sm font-bold text-green-700">{trend}</span>
              </div>
              <span className="text-xs text-gray-500 mt-1">{subtitle}</span>
            </div>
          )}
        </div>
        
        {/* Title and Value */}
        <div className="mb-4">
          <h3 className="text-sm font-semibold text-gray-600 mb-2 uppercase tracking-wide">{title}</h3>
          <p className="text-4xl font-bold text-gray-900 mb-1">{value}</p>
        </div>

        {/* Sparkline Chart */}
        <div className="flex items-center justify-between">
          <div className="flex-1">
            <SparklineChart data={sparkline} />
          </div>
          <div className="ml-4">
            <div className={`p-2 ${colors.light} bg-gradient-to-br rounded-lg`}>
              <Zap className={`w-4 h-4 ${colors.accent}`} />
            </div>
          </div>
        </div>

        {/* Progress Indicator */}
        <div className="mt-6">
          <div className="flex justify-between items-center mb-2">
            <span className="text-xs text-gray-500">Performance</span>
            <span className="text-xs font-semibold text-gray-700">85%</span>
          </div>
          <div className="w-full bg-gray-200/50 rounded-full h-2 overflow-hidden">
            <div 
              className={`h-2 bg-gradient-to-r ${colors.gradient} rounded-full transition-all duration-1000 ease-out transform origin-left`} 
              style={{width: '85%'}}
            ></div>
          </div>
        </div>
      </div>

      {/* Hover Glow Effect */}
      <div className={`absolute inset-0 bg-gradient-to-br ${colors.gradient} opacity-0 group-hover:opacity-5 rounded-3xl transition-opacity duration-500`}></div>
    </div>
  );
};
