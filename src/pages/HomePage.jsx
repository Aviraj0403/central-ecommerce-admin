import React from "react";
import { Sparkles, ShoppingBag, Settings, Layers, BarChart3 } from "lucide-react";
import { Link } from "react-router-dom";

export default function HomePage() {
  return (
    <div className="max-w-4xl mx-auto p-6 font-sans space-y-8">
      {/* Welcome Banner */}
      <div className="bg-white rounded-xl p-8 border border-zinc-200/80 shadow-sm relative overflow-hidden">
        <div className="absolute top-0 right-0 p-8 opacity-5 pointer-events-none">
          <Sparkles className="w-32 h-32 text-orange-600" />
        </div>
        <div className="relative z-10 space-y-3">
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-orange-50 border border-orange-100 text-orange-700 text-xs font-semibold">
            <Sparkles size={12} />
            GK Store Console v2.0
          </div>
          <h1 className="text-2xl font-bold text-zinc-950">Welcome to the Administration Console</h1>
          <p className="text-xs text-zinc-500 max-w-xl leading-relaxed">
            Manage your store's inventory, process orders, check real-time shipping analytics, and update banners dynamically. Access all administrative modules using the navigation menu.
          </p>
        </div>
      </div>

      {/* Navigation Quick Links */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white p-5 border border-zinc-200/80 rounded-xl shadow-sm space-y-4">
          <div className="p-2.5 bg-orange-50 border border-orange-100 text-orange-600 w-fit rounded-lg">
            <ShoppingBag className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-zinc-900">Products Catalog</h3>
            <p className="text-xs text-zinc-400 mt-1">Add new products, configure variants, and update price tags.</p>
          </div>
          <Link 
            to="/admin/adminProducts" 
            className="inline-flex items-center gap-1 text-xs font-semibold text-orange-600 hover:text-orange-700 transition"
          >
            Manage Catalog →
          </Link>
        </div>

        <div className="bg-white p-5 border border-zinc-200/80 rounded-xl shadow-sm space-y-4">
          <div className="p-2.5 bg-zinc-50 border border-zinc-200 text-zinc-700 w-fit rounded-lg">
            <Layers className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-zinc-900">Categories Matrix</h3>
            <p className="text-xs text-zinc-400 mt-1">Structure product categories and link parent categories.</p>
          </div>
          <Link 
            to="/admin/categories" 
            className="inline-flex items-center gap-1 text-xs font-semibold text-zinc-750 hover:text-zinc-900 transition"
          >
            View Categories →
          </Link>
        </div>

        <div className="bg-white p-5 border border-zinc-200/80 rounded-xl shadow-sm space-y-4">
          <div className="p-2.5 bg-zinc-50 border border-zinc-200 text-zinc-700 w-fit rounded-lg">
            <Settings className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-zinc-900">Control Settings</h3>
            <p className="text-xs text-zinc-400 mt-1">Configure logistics gateways, API keys, and team privileges.</p>
          </div>
          <Link 
            to="/admin/settings" 
            className="inline-flex items-center gap-1 text-xs font-semibold text-zinc-750 hover:text-zinc-900 transition"
          >
            Open Settings →
          </Link>
        </div>
      </div>
    </div>
  );
}
