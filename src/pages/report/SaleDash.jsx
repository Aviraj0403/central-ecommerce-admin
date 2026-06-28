import React, { useState } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  BarChart,
  Bar,
  Cell,
  PieChart,
  Pie,
} from "recharts";
import { TrendingUp, BarChart3, PieChart as PieIcon, DollarSign, Calendar, ShoppingBag } from "lucide-react";

// Sample sales data for testing
const salesDataMonthly = [
  { month: "Jan", sales: 5000 },
  { month: "Feb", sales: 4500 },
  { month: "Mar", sales: 5500 },
  { month: "Apr", sales: 4000 },
  { month: "May", sales: 6000 },
  { month: "Jun", sales: 7000 },
  { month: "Jul", sales: 6500 },
  { month: "Aug", sales: 7200 },
  { month: "Sep", sales: 6800 },
  { month: "Oct", sales: 5900 },
  { month: "Nov", sales: 7500 },
  { month: "Dec", sales: 8000 },
];

const salesDataWeekly = [
  { week: "Week 1", sales: 1200 },
  { week: "Week 2", sales: 1400 },
  { week: "Week 3", sales: 1300 },
  { week: "Week 4", sales: 1500 },
];

const itemSalesData = [
  { item: "Pizza", sales: 5000 },
  { item: "Pasta", sales: 3000 },
  { item: "Burger", sales: 2000 },
  { item: "Salad", sales: 1000 },
  { item: "Soda", sales: 1500 },
];

// Color theme palette matching cosmetics brand (Warm orange, slate, charcoal)
const COLORS = ["#ea580c", "#18181b", "#71717a", "#a1a1aa", "#d4d4d8"];

const SalesReport = () => {
  const [view, setView] = useState("monthly");

  const renderChart = () => {
    switch (view) {
      case "weekly":
        return (
          <ResponsiveContainer width="100%" height={350}>
            <BarChart data={salesDataWeekly} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f4f4f5" />
              <XAxis dataKey="week" stroke="#71717a" fontSize={11} tickLine={false} />
              <YAxis stroke="#71717a" fontSize={11} tickLine={false} />
              <Tooltip 
                contentStyle={{ background: "#ffffff", border: "1px solid #e4e4e7", borderRadius: "8px", fontSize: "12px" }}
              />
              <Bar dataKey="sales" radius={[4, 4, 0, 0]}>
                {salesDataWeekly.map((entry, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={index % 2 === 0 ? "#ea580c" : "#18181b"}
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        );
      case "monthly":
        return (
          <ResponsiveContainer width="100%" height={350}>
            <LineChart data={salesDataMonthly} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f4f4f5" />
              <XAxis dataKey="month" stroke="#71717a" fontSize={11} tickLine={false} />
              <YAxis stroke="#71717a" fontSize={11} tickLine={false} />
              <Tooltip 
                contentStyle={{ background: "#ffffff", border: "1px solid #e4e4e7", borderRadius: "8px", fontSize: "12px" }}
              />
              <Line type="monotone" dataKey="sales" stroke="#ea580c" strokeWidth={2.5} dot={{ r: 4, strokeWidth: 2 }} activeDot={{ r: 6 }} />
            </LineChart>
          </ResponsiveContainer>
        );
      case "itemized":
        return (
          <ResponsiveContainer width="100%" height={350}>
            <PieChart>
              <Pie
                data={itemSalesData}
                dataKey="sales"
                nameKey="item"
                cx="50%"
                cy="50%"
                outerRadius={110}
                innerRadius={60}
                paddingAngle={4}
                label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
              >
                {itemSalesData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip 
                contentStyle={{ background: "#ffffff", border: "1px solid #e4e4e7", borderRadius: "8px", fontSize: "12px" }}
              />
            </PieChart>
          </ResponsiveContainer>
        );
      default:
        return null;
    }
  };

  return (
    <div className="max-w-[1200px] mx-auto p-6 font-sans space-y-6">
      {/* Header section */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between border-b border-zinc-200/80 pb-5 gap-4">
        <div>
          <h1 className="text-xl font-bold text-zinc-900 flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-orange-600" /> Sales Report
          </h1>
          <p className="text-xs text-zinc-500 mt-0.5">
            Monitor and analyze store revenue performance and menu sales distribution.
          </p>
        </div>

        {/* Tab Selection */}
        <div className="flex bg-zinc-100 p-1 rounded-lg border border-zinc-200/60 w-fit self-start md:self-auto">
          <button
            onClick={() => setView("monthly")}
            className={`flex items-center gap-1.5 px-4 py-1.5 rounded-md text-xs font-semibold transition-all ${
              view === "monthly"
                ? "bg-white text-zinc-900 shadow-sm"
                : "text-zinc-600 hover:text-zinc-900"
            }`}
          >
            <Calendar size={14} />
            Monthly View
          </button>
          <button
            onClick={() => setView("weekly")}
            className={`flex items-center gap-1.5 px-4 py-1.5 rounded-md text-xs font-semibold transition-all ${
              view === "weekly"
                ? "bg-white text-zinc-900 shadow-sm"
                : "text-zinc-600 hover:text-zinc-900"
            }`}
          >
            <BarChart3 size={14} />
            Weekly View
          </button>
          <button
            onClick={() => setView("itemized")}
            className={`flex items-center gap-1.5 px-4 py-1.5 rounded-md text-xs font-semibold transition-all ${
              view === "itemized"
                ? "bg-white text-zinc-900 shadow-sm"
                : "text-zinc-600 hover:text-zinc-900"
            }`}
          >
            <PieIcon size={14} />
            Itemized Sales
          </button>
        </div>
      </div>

      {/* KPI Overview row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white p-5 border border-zinc-200/80 rounded-xl shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-zinc-400 uppercase tracking-wider">Total Sales (YTD)</span>
            <DollarSign className="w-4 h-4 text-orange-600" />
          </div>
          <div className="text-2xl font-bold text-zinc-900 mt-2">$78,400.00</div>
          <p className="text-[10px] text-emerald-600 mt-1 font-medium">↑ 12% increase from last quarter</p>
        </div>

        <div className="bg-white p-5 border border-zinc-200/80 rounded-xl shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-zinc-400 uppercase tracking-wider">Current Period Goal</span>
            <TrendingUp className="w-4 h-4 text-zinc-600" />
          </div>
          <div className="text-2xl font-bold text-zinc-900 mt-2">$85,000.00</div>
          <p className="text-[10px] text-zinc-500 mt-1 font-medium">92.2% progress towards target</p>
        </div>

        <div className="bg-white p-5 border border-zinc-200/80 rounded-xl shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-zinc-400 uppercase tracking-wider">Best Performing Item</span>
            <ShoppingBag className="w-4 h-4 text-zinc-600" />
          </div>
          <div className="text-2xl font-bold text-zinc-900 mt-2">Pizza Classico</div>
          <p className="text-[10px] text-zinc-500 mt-1 font-medium">Accounting for 40% of itemized sales</p>
        </div>
      </div>

      {/* Chart Display Area */}
      <div className="bg-white border border-zinc-200/80 shadow-sm rounded-xl p-5">
        <h3 className="text-sm font-semibold text-zinc-800 mb-4 uppercase tracking-wider">
          {view === "monthly" ? "Monthly Revenue Trend" : view === "weekly" ? "Weekly Revenue Analysis" : "Product Category Distribution"}
        </h3>
        <div>{renderChart()}</div>
      </div>

      {/* Key Insights Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-zinc-50 border border-zinc-200/60 rounded-xl p-5 space-y-2">
          <h4 className="text-xs font-bold text-zinc-800 uppercase tracking-wider">Key Insights</h4>
          <p className="text-xs text-zinc-600 leading-relaxed">
            This report presents your store's sales data across various time periods. Use the toggle buttons above to switch between monthly, weekly, or itemized sales views.
          </p>
        </div>

        <div className="bg-zinc-50 border border-zinc-200/60 rounded-xl p-5 space-y-2">
          <h4 className="text-xs font-bold text-zinc-800 uppercase tracking-wider">Sales Trends</h4>
          <p className="text-xs text-zinc-600 leading-relaxed">
            The charts represent trends in your sales. The Monthly View gives an overview of year-round performance, while the Itemized Sales section breaks down sales per category.
          </p>
        </div>

        <div className="bg-zinc-50 border border-zinc-200/60 rounded-xl p-5 space-y-2">
          <h4 className="text-xs font-bold text-zinc-800 uppercase tracking-wider">Actionable Steps</h4>
          <p className="text-xs text-zinc-600 leading-relaxed">
            Use these insights to optimize your inventory and marketing strategies. If certain items are consistently performing well, consider allocating additional promo features to them.
          </p>
        </div>
      </div>
    </div>
  );
};

export default SalesReport;
