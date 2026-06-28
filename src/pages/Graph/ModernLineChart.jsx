import React from 'react'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, ReferenceLine, Area, AreaChart } from 'recharts';
import { Activity, TrendingUp, Zap, BarChart3, Globe } from 'lucide-react';

const ModernLineChart = ({ statsData }) => {
  // Format the data for better display
  const formattedData = statsData.map((stat, index) => ({
    day: `Day ${index + 1}`,
    date: new Date(stat._id).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
    totalRevenue: stat.totalRevenue || 0,
    totalOrders: stat.totalOrders || 0,
  }));

  // Calculate metrics for insights
  const avgRevenue = formattedData.reduce((sum, item) => sum + item.totalRevenue, 0) / formattedData.length;
  const avgOrders = formattedData.reduce((sum, item) => sum + item.totalOrders, 0) / formattedData.length;
  const maxRevenue = Math.max(...formattedData.map(item => item.totalRevenue));
  const maxOrders = Math.max(...formattedData.map(item => item.totalOrders));

  // Custom tooltip with premium styling
  const CustomTooltip = ({ payload, label, active }) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      
      return (
        <div className="bg-white/95 backdrop-blur-xl p-6 rounded-2xl shadow-2xl border border-white/30">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-gradient-to-br from-blue-100 to-indigo-100 rounded-lg">
              <Activity className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <p className="font-bold text-gray-800 text-lg">{data.date}</p>
              <p className="text-sm text-gray-500">{data.day}</p>
            </div>
          </div>
          <div className="space-y-3">
            {payload.map((entry, index) => (
              <div key={index} className="flex items-center justify-between gap-6">
                <div className="flex items-center gap-3">
                  <div 
                    className="w-4 h-4 rounded-full shadow-sm" 
                    style={{ backgroundColor: entry.color }}
                  ></div>
                  <span className="text-sm font-medium text-gray-600">
                    {entry.dataKey === 'totalRevenue' ? 'Revenue' : 'Orders'}
                  </span>
                </div>
                <span className="font-bold text-lg" style={{ color: entry.color }}>
                  {entry.dataKey === 'totalRevenue' ? `₹${entry.value.toLocaleString()}` : entry.value}
                </span>
              </div>
            ))}
            <div className="pt-3 border-t border-gray-200">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-500">Conversion Rate</span>
                <span className="font-bold text-purple-600">
                  {data.totalOrders > 0 ? ((data.totalRevenue / data.totalOrders).toFixed(0)) : 0}₹/order
                </span>
              </div>
            </div>
          </div>
        </div>
      );
    }
    return null;
  };

  // Custom dot component with enhanced styling
  const CustomDot = (props) => {
    const { cx, cy, fill, dataKey, payload } = props;
    const isHighPerformer = dataKey === 'totalRevenue' ? 
      payload.totalRevenue > avgRevenue : 
      payload.totalOrders > avgOrders;
    
    return (
      <g>
        <circle 
          cx={cx} 
          cy={cy} 
          r={isHighPerformer ? 6 : 4} 
          fill={fill} 
          stroke="white" 
          strokeWidth={3}
          className="drop-shadow-sm"
        />
        {isHighPerformer && (
          <circle 
            cx={cx} 
            cy={cy} 
            r={10} 
            fill="none" 
            stroke={fill} 
            strokeWidth={2}
            strokeOpacity={0.3}
            className="animate-ping"
          />
        )}
      </g>
    );
  };

  return (
    <div className="bg-white/70 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/30 p-8 hover:shadow-3xl transition-all duration-500 group overflow-hidden">
      {/* Decorative Background Elements */}
      <div className="absolute inset-0 bg-gradient-to-br from-blue-50/50 via-indigo-50/30 to-purple-50/50 rounded-3xl"></div>
      <div className="absolute -top-20 -right-20 w-40 h-40 bg-gradient-to-br from-blue-400/10 to-indigo-600/10 rounded-full blur-3xl"></div>
      <div className="absolute -bottom-10 -left-10 w-32 h-32 bg-gradient-to-br from-emerald-400/10 to-teal-600/10 rounded-full blur-2xl"></div>

      {/* Header */}
      <div className="relative z-10 flex items-center justify-between mb-8">
        <div className="flex items-center gap-4">
          <div className="p-4 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl shadow-lg group-hover:shadow-xl transition-all duration-300">
            <BarChart3 className="w-8 h-8 text-white" />
          </div>
          <div>
            <h3 className="text-2xl font-bold text-gray-900 mb-1">Performance Trends</h3>
            <p className="text-gray-600">Revenue and orders correlation analysis</p>
          </div>
        </div>
        
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-emerald-100 to-teal-100 rounded-xl shadow-lg border border-emerald-200/50">
            <TrendingUp className="w-5 h-5 text-emerald-600" />
            <span className="text-emerald-700 font-semibold">Trending</span>
          </div>
          <div className="p-2 bg-white/80 backdrop-blur-sm rounded-xl shadow-lg border border-white/20">
            <Globe className="w-5 h-5 text-gray-600" />
          </div>
        </div>
      </div>

      {/* Chart Container */}
      <div className="relative z-10">
        <ResponsiveContainer width="100%" height={400}>
          <LineChart data={formattedData} margin={{ top: 20, right: 30, left: 20, bottom: 20 }}>
            <defs>
              <linearGradient id="revenueGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.4}/>
                <stop offset="95%" stopColor="#3b82f6" stopOpacity={0.05}/>
              </linearGradient>
              <linearGradient id="ordersGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#10b981" stopOpacity={0.4}/>
                <stop offset="95%" stopColor="#10b981" stopOpacity={0.05}/>
              </linearGradient>
              <filter id="glow" x="-50%" y="-50%" width="200%" height="200%">
                <feGaussianBlur stdDeviation="3" result="coloredBlur"/>
                <feMerge> 
                  <feMergeNode in="coloredBlur"/>
                  <feMergeNode in="SourceGraphic"/>
                </feMerge>
              </filter>
            </defs>
            
            {/* Enhanced Grid */}
            <CartesianGrid 
              strokeDasharray="3 3" 
              stroke="#e2e8f0" 
              vertical={false}
              opacity={0.6}
            />
            
            {/* Axes with better styling */}
            <XAxis 
              dataKey="date" 
              axisLine={false}
              tickLine={false}
              tick={{ fontSize: 12, fill: '#64748b', fontWeight: '500' }}
              dy={10}
            />
            <YAxis 
              yAxisId="revenue"
              orientation="left"
              axisLine={false}
              tickLine={false}
              tick={{ fontSize: 12, fill: '#64748b', fontWeight: '500' }}
              tickFormatter={(value) => `₹${(value / 1000).toFixed(0)}k`}
            />
            <YAxis 
              yAxisId="orders"
              orientation="right"
              axisLine={false}
              tickLine={false}
              tick={{ fontSize: 12, fill: '#64748b', fontWeight: '500' }}
            />
            
            {/* Reference Lines with enhanced styling */}
            <ReferenceLine 
              yAxisId="revenue"
              y={avgRevenue} 
              stroke="#3b82f6" 
              strokeDasharray="8 8" 
              strokeOpacity={0.6}
              strokeWidth={2}
              label={{ 
                value: `Avg: ₹${avgRevenue.toFixed(0)}`, 
                position: "topLeft", 
                fill: "#3b82f6",
                fontSize: 12,
                fontWeight: 'bold'
              }}
            />
            
            {/* Tooltip and Legend */}
            <Tooltip content={<CustomTooltip />} />
            <Legend 
              verticalAlign="top" 
              height={36}
              iconType="circle"
              wrapperStyle={{ 
                paddingBottom: '20px',
                fontSize: '14px',
                fontWeight: '500'
              }}
            />
            
            {/* Enhanced Lines with glow effect */}
            <Line
              yAxisId="revenue"
              type="monotone"
              dataKey="totalRevenue"
              stroke="#3b82f6"
              strokeWidth={4}
              dot={<CustomDot />}
              activeDot={{ 
                r: 8, 
                stroke: '#3b82f6', 
                strokeWidth: 3, 
                fill: '#ffffff',
                filter: 'url(#glow)',
                className: 'drop-shadow-lg'
              }}
              animationDuration={2500}
              animationEasing="ease-out"
              name="Revenue (₹)"
              filter="url(#glow)"
            />
            <Line
              yAxisId="orders"
              type="monotone"
              dataKey="totalOrders"
              stroke="#10b981"
              strokeWidth={4}
              dot={<CustomDot />}
              activeDot={{ 
                r: 8, 
                stroke: '#10b981', 
                strokeWidth: 3, 
                fill: '#ffffff',
                filter: 'url(#glow)',
                className: 'drop-shadow-lg'
              }}
              animationDuration={2500}
              animationEasing="ease-out"
              name="Orders"
              filter="url(#glow)"
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Enhanced Stats Summary */}
      <div className="relative z-10 grid grid-cols-2 lg:grid-cols-4 gap-4 mt-8 pt-6 border-t border-gray-200/50">
        <div className="text-center p-4 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl">
          <div className="flex items-center justify-center gap-2 mb-2">
            <Zap className="w-4 h-4 text-blue-600" />
            <span className="text-xs text-gray-600 uppercase tracking-wide font-semibold">Avg Revenue</span>
          </div>
          <p className="text-xl font-bold text-blue-600">₹{avgRevenue.toLocaleString()}</p>
        </div>
        <div className="text-center p-4 bg-gradient-to-br from-emerald-50 to-teal-50 rounded-xl">
          <div className="flex items-center justify-center gap-2 mb-2">
            <Activity className="w-4 h-4 text-emerald-600" />
            <span className="text-xs text-gray-600 uppercase tracking-wide font-semibold">Avg Orders</span>
          </div>
          <p className="text-xl font-bold text-emerald-600">{Math.round(avgOrders)}</p>
        </div>
        <div className="text-center p-4 bg-gradient-to-br from-purple-50 to-pink-50 rounded-xl">
          <div className="flex items-center justify-center gap-2 mb-2">
            <TrendingUp className="w-4 h-4 text-purple-600" />
            <span className="text-xs text-gray-600 uppercase tracking-wide font-semibold">Peak Revenue</span>
          </div>
          <p className="text-xl font-bold text-purple-600">₹{maxRevenue.toLocaleString()}</p>
        </div>
        <div className="text-center p-4 bg-gradient-to-br from-orange-50 to-red-50 rounded-xl">
          <div className="flex items-center justify-center gap-2 mb-2">
            <BarChart3 className="w-4 h-4 text-orange-600" />
            <span className="text-xs text-gray-600 uppercase tracking-wide font-semibold">Peak Orders</span>
          </div>
          <p className="text-xl font-bold text-orange-600">{maxOrders}</p>
        </div>
      </div>
    </div>
  );
};

export default ModernLineChart;
