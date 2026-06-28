import React from "react";
import { Activity, CheckCircle2 } from "lucide-react";

const SystemHealth = () => {
  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 max-w-4xl mx-auto">
      <div className="mb-8 text-center">
        <h1 className="text-3xl font-black text-white tracking-tight uppercase">System Health</h1>
        <p className="text-gray-400 mt-2 font-medium tracking-wide">Real-time monitoring of Central SaaS infrastructure.</p>
      </div>

      <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-10 max-w-2xl mx-auto text-center shadow-2xl relative overflow-hidden group">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-64 h-64 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none group-hover:bg-emerald-500/20 transition-all"></div>
        <div className="w-24 h-24 bg-emerald-500/10 border border-emerald-500/20 rounded-2xl shadow-inner flex items-center justify-center mx-auto mb-8 relative z-10 rotate-3 hover:rotate-0 transition-all duration-300">
          <Activity size={48} className="text-emerald-400 drop-shadow-[0_0_15px_rgba(52,211,153,0.5)]" />
        </div>
        <h2 className="text-3xl font-black text-white mb-3 relative z-10 uppercase tracking-tight">All Systems Operational</h2>
        <p className="text-gray-400 mb-10 font-medium relative z-10">The Master Database, API Gateway, and Tenant Clusters are responding normally with zero downtime.</p>

        <div className="space-y-4 text-left relative z-10">
          <div className="flex justify-between items-center bg-white/5 p-5 rounded-2xl border border-white/10 hover:bg-white/10 transition-all shadow-lg">
            <span className="text-white font-bold tracking-wide">Master Database</span>
            <span className="flex items-center gap-2 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 px-3 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wider"><CheckCircle2 size={16} /> Online (12ms ping)</span>
          </div>
          <div className="flex justify-between items-center bg-white/5 p-5 rounded-2xl border border-white/10 hover:bg-white/10 transition-all shadow-lg">
            <span className="text-white font-bold tracking-wide">Redis Cache</span>
            <span className="flex items-center gap-2 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 px-3 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wider"><CheckCircle2 size={16} /> Online (2ms ping)</span>
          </div>
          <div className="flex justify-between items-center bg-white/5 p-5 rounded-2xl border border-white/10 hover:bg-white/10 transition-all shadow-lg">
            <span className="text-white font-bold tracking-wide">Authentication Service</span>
            <span className="flex items-center gap-2 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 px-3 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wider"><CheckCircle2 size={16} /> Operational</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SystemHealth;
