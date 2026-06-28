import React from 'react'
import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from "recharts";
import { TrendingUp, Calendar, Sparkles, Award, Target } from "lucide-react";

// Weekly Stats Pie Chart
const WeeklyStatsPieChart = ({ statsData }) => {
  const COLORS = [
    "#6366f1", "#8b5cf6", "#ec4899", "#f59e0b", 
    "#10b981", "#3b82f6", "#ef4444", "#84cc16"
  ];

  // Prepare data for the pie chart from the statsData
  const formattedData = statsData.map((stat, index) => ({
    name: `Day ${index + 1}`,
    fullDate: new Date(stat._id).toLocaleDateString(),
    value: stat.totalRevenue,
    orders: stat.totalOrders || 0,
  }));

  // Calculate total revenue for percentage calculation
  const totalRevenue = formattedData.reduce((sum, item) => sum + item.value, 0);
  const totalOrders = formattedData.reduce((sum, item) => sum + item.orders, 0);

  // Custom tooltip with enhanced styling
  const CustomTooltip = ({ payload, active }) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      const percentage = ((data.value / totalRevenue) * 100).toFixed(1);
      
      return (
        <div className="bg-white/95 backdrop-blur-xl p-6 rounded-2xl shadow-2xl border border-white/30">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-gradient-to-br from-indigo-100 to-purple-100 rounded-lg">
              <Calendar className="w-5 h-5 text-indigo-600" />
            </div>
            <div>
              <p className="font-bold text-gray-800 text-lg">{data.fullDate}</p>
              <p className="text-sm text-gray-500">{data.name}</p>
            </div>
          </div>
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600 flex items-center gap-2">
                <div className="w-3 h-3 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-full"></div>
                Revenue
              </span>
              <span className="font-bold text-indigo-600 text-lg">₹{data.value.toLocaleString()}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600 flex items-center gap-2">
                <div className="w-3 h-3 bg-gradient-to-r from-emerald-500 to-teal-600 rounded-full"></div>
                Orders
              </span>
              <span className="font-bold text-emerald-600 text-lg">{data.orders}</span>
            </div>
            <div className="flex justify-between items-center pt-2 border-t border-gray-200">
              <span className="text-sm text-gray-600">Market Share</span>
              <span className="font-bold text-purple-600 text-lg">{percentage}%</span>
            </div>
          </div>
        </div>
      );
    }
    return null;
  };

  // Custom label function with better positioning
  const renderCustomLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent, index }) => {
    if (percent < 0.05) return null; // Don't show labels for slices less than 5%
    
    const RADIAN = Math.PI / 180;
    const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
    const x = cx + radius * Math.cos(-midAngle * RADIAN);
    const y = cy + radius * Math.sin(-midAngle * RADIAN);

    return (
      <text 
        x={x} 
        y={y} 
        fill="white" 
        textAnchor={x > cx ? 'start' : 'end'} 
        dominantBaseline="central"
        className="text-sm font-bold drop-shadow-lg"
      >
        {`${(percent * 100).toFixed(0)}%`}
      </text>
    );
  };

  return (
    <div className="bg-white/70 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/30 p-8 hover:shadow-3xl transition-all duration-500 group overflow-hidden">
      {/* Decorative Background Elements */}
      <div className="absolute inset-0 bg-gradient-to-br from-indigo-50/50 via-purple-50/30 to-pink-50/50 rounded-3xl"></div>
      <div className="absolute -top-20 -right-20 w-40 h-40 bg-gradient-to-br from-indigo-400/10 to-purple-600/10 rounded-full blur-3xl"></div>
      <div className="absolute -bottom-10 -left-10 w-32 h-32 bg-gradient-to-br from-pink-400/10 to-rose-600/10 rounded-full blur-2xl"></div>

      {/* Header */}
      <div className="relative z-10 flex items-center justify-between mb-8">
        <div className="flex items-center gap-4">
          <div className="p-4 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl shadow-lg group-hover:shadow-xl transition-all duration-300">
            <Target className="w-8 h-8 text-white" />
          </div>
          <div>
            <h3 className="text-2xl font-bold text-gray-900 mb-1">Revenue Distribution</h3>
            <p className="text-gray-600">Weekly performance breakdown</p>
          </div>
        </div>
        
        <div className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-indigo-100 to-purple-100 rounded-xl shadow-lg border border-indigo-200/50">
          <Sparkles className="w-5 h-5 text-indigo-600" />
          <span className="text-indigo-700 font-semibold">Analytics</span>
        </div>
      </div>

      {/* Chart Container */}
      <div className="relative z-10">
        <ResponsiveContainer width="100%" height={400}>
          <PieChart>
            <defs>
              {COLORS.map((color, index) => (
                <linearGradient key={index} id={`gradient-${index}`} x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor={color} stopOpacity={0.9} />
                  <stop offset="100%" stopColor={color} stopOpacity={1} />
                </linearGradient>
              ))}
              <filter id="shadow" x="-50%" y="-50%" width="200%" height="200%">
                <feDropShadow dx="0" dy="4" stdDeviation="8" floodColor="#000" floodOpacity="0.1"/>
              </filter>
            </defs>
            <Pie
              data={formattedData}
              cx="50%"
              cy="50%"
              labelLine={false}
              label={renderCustomLabel}
              outerRadius={140}
              innerRadius={70}
              fill="#8884d8"
              dataKey="value"
              paddingAngle={3}
              animationBegin={0}
              animationDuration={2000}
              animationEasing="ease-out"
              filter="url(#shadow)"
            >
              {formattedData.map((entry, index) => (
                <Cell 
                  key={`cell-${index}`} 
                  fill={`url(#gradient-${index % COLORS.length})`}
                  stroke="white"
                  strokeWidth={3}
                />
              ))}
            </Pie>
            <Tooltip content={<CustomTooltip />} />
            <Legend 
              verticalAlign="bottom" 
              height={36}
              iconType="circle"
              wrapperStyle={{
                paddingTop: '20px',
                fontSize: '14px',
                fontWeight: '500'
              }}
            />
          </PieChart>
        </ResponsiveContainer>

        {/* Center Stats with Enhanced Design */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div className="text-center bg-white/95 backdrop-blur-sm rounded-2xl p-6 shadow-xl border border-white/50">
            <div className="flex items-center justify-center gap-2 mb-2">
              <Award className="w-6 h-6 text-indigo-600" />
              <span className="text-sm font-semibold text-gray-600 uppercase tracking-wide">Total</span>
            </div>
            <p className="text-3xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
              ₹{totalRevenue.toLocaleString()}
            </p>
            <p className="text-sm text-gray-500 mt-1">{totalOrders} Orders</p>
          </div>
        </div>
      </div>

      {/* Bottom Stats */}
      <div className="relative z-10 grid grid-cols-2 gap-4 mt-8 pt-6 border-t border-gray-200/50">
        <div className="text-center p-4 bg-gradient-to-br from-indigo-50 to-purple-50 rounded-xl">
          <p className="text-2xl font-bold text-indigo-600">
            ₹{(totalRevenue / formattedData.length).toLocaleString()}
          </p>
          <p className="text-sm text-gray-600 mt-1">Avg Daily Revenue</p>
        </div>
        <div className="text-center p-4 bg-gradient-to-br from-emerald-50 to-teal-50 rounded-xl">
          <p className="text-2xl font-bold text-emerald-600">
            {Math.round(totalOrders / formattedData.length)}
          </p>
          <p className="text-sm text-gray-600 mt-1">Avg Daily Orders</p>
        </div>
      </div>
    </div>
  );
};

export default WeeklyStatsPieChart;
