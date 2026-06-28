import React from 'react'
import { useEffect, useState } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  ReferenceLine,
  Area,
  AreaChart,
} from "recharts";
import { Target, TrendingUp } from "lucide-react";
import Axios from "../../utils/Axios";

// Enhanced Custom Tooltip
const CustomTooltip = ({ payload, label, active }) => {
  if (active && payload && payload.length) {
    const { totalSales } = payload[0].payload;
    const target = 7000;
    const performance = ((totalSales / target) * 100).toFixed(1);
    
    return (
      <div className="bg-white/95 backdrop-blur-sm p-4 rounded-xl shadow-2xl border border-white/20">
        <div className="flex items-center gap-2 mb-3">
          <div className="w-3 h-3 rounded-full bg-gradient-to-r from-emerald-500 to-green-600"></div>
          <p className="font-semibold text-gray-800">{label}</p>
        </div>
        <div className="space-y-2">
          <div className="flex justify-between items-center gap-4">
            <span className="text-sm text-gray-600">Sales:</span>
            <span className="font-bold text-emerald-600">₹{totalSales.toLocaleString()}</span>
          </div>
          <div className="flex justify-between items-center gap-4">
            <span className="text-sm text-gray-600">Target:</span>
            <span className="font-bold text-orange-600">₹{target.toLocaleString()}</span>
          </div>
          <div className="flex justify-between items-center gap-4">
            <span className="text-sm text-gray-600">Performance:</span>
            <span className={`font-bold ${performance >= 100 ? 'text-green-600' : 'text-red-600'}`}>
              {performance}%
            </span>
          </div>
        </div>
      </div>
    );
  }
  return null;
};

const SalesChart = () => {
  const [salesData, setSalesData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchSalesData = async () => {
      try {
        const response = await Axios.get('/orders/sales-graph');
        if (response.data.success) {
          setSalesData(response.data.data);
        }
      } catch (err) {
        setError("Error fetching sales data");
      } finally {
        setLoading(false);
      }
    };

    fetchSalesData();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-gray-600">Loading sales data...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Target className="w-8 h-8 text-red-600" />
          </div>
          <p className="text-red-600 font-semibold">{error}</p>
        </div>
      </div>
    );
  }

  // Calculate performance metrics
  const totalSales = salesData.reduce((sum, item) => sum + item.totalSales, 0);
  const avgSales = totalSales / salesData.length;
  const targetValue = 7000;

  return (
    <div className="relative">
      <ResponsiveContainer width="100%" height={400}>
        <AreaChart data={salesData} margin={{ top: 20, right: 30, left: 20, bottom: 20 }}>
          <defs>
            <linearGradient id="salesGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/>
              <stop offset="95%" stopColor="#10b981" stopOpacity={0.05}/>
            </linearGradient>
            <linearGradient id="targetGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.2}/>
              <stop offset="95%" stopColor="#f59e0b" stopOpacity={0.05}/>
            </linearGradient>
          </defs>
          
          <CartesianGrid 
            strokeDasharray="3 3" 
            stroke="#e2e8f0" 
            vertical={false}
            opacity={0.6}
          />
          
          <XAxis
            dataKey="month"
            axisLine={false}
            tickLine={false}
            tick={{ fontSize: 12, fill: '#64748b' }}
            dy={10}
          />
          
          <YAxis
            axisLine={false}
            tickLine={false}
            tick={{ fontSize: 12, fill: '#64748b' }}
            tickFormatter={(value) => `₹${(value / 1000).toFixed(0)}k`}
          />
          
          <Tooltip content={<CustomTooltip />} />
          
          <Legend 
            verticalAlign="top" 
            height={36}
            iconType="circle"
            wrapperStyle={{ paddingBottom: '20px' }}
          />
          
          {/* Target Reference Line */}
          <ReferenceLine 
            y={targetValue} 
            stroke="#f59e0b" 
            strokeDasharray="8 8" 
            strokeWidth={2}
            label={{ 
              value: `Target: ₹${targetValue.toLocaleString()}`, 
              position: "topRight", 
              fill: "#f59e0b",
              fontSize: 12,
              fontWeight: 'bold'
            }}
          />
          
          {/* Average Reference Line */}
          <ReferenceLine 
            y={avgSales} 
            stroke="#6366f1" 
            strokeDasharray="5 5" 
            strokeOpacity={0.7}
            label={{ 
              value: `Avg: ₹${avgSales.toFixed(0)}`, 
              position: "topLeft", 
              fill: "#6366f1",
              fontSize: 12
            }}
          />
          
          {/* Area Chart */}
          <Area
            type="monotone"
            dataKey="totalSales"
            stroke="#10b981"
            strokeWidth={3}
            fill="url(#salesGradient)"
            dot={{ 
              r: 5, 
              fill: "#10b981", 
              stroke: "#ffffff", 
              strokeWidth: 2,
              className: "drop-shadow-sm"
            }}
            activeDot={{ 
              r: 8, 
              stroke: "#10b981", 
              strokeWidth: 2, 
              fill: "#ffffff",
              className: "drop-shadow-lg"
            }}
            animationDuration={2000}
            animationEasing="ease-out"
            name="Monthly Sales"
          />
        </AreaChart>
      </ResponsiveContainer>

      {/* Performance Summary */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-6 pt-6 border-t border-gray-200">
        <div className="text-center">
          <div className="flex items-center justify-center gap-2 mb-2">
            <TrendingUp className="w-5 h-5 text-emerald-600" />
            <span className="text-sm text-gray-600">Total Sales</span>
          </div>
          <p className="text-2xl font-bold text-emerald-600">₹{totalSales.toLocaleString()}</p>
        </div>
        <div className="text-center">
          <div className="flex items-center justify-center gap-2 mb-2">
            <Target className="w-5 h-5 text-orange-600" />
            <span className="text-sm text-gray-600">Monthly Target</span>
          </div>
          <p className="text-2xl font-bold text-orange-600">₹{targetValue.toLocaleString()}</p>
        </div>
        <div className="text-center">
          <div className="flex items-center justify-center gap-2 mb-2">
            <div className="w-5 h-5 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-full"></div>
            <span className="text-sm text-gray-600">Avg Performance</span>
          </div>
          <p className={`text-2xl font-bold ${avgSales >= targetValue ? 'text-green-600' : 'text-red-600'}`}>
            {((avgSales / targetValue) * 100).toFixed(1)}%
          </p>
        </div>
      </div>
    </div>
  );
};

export default SalesChart;
