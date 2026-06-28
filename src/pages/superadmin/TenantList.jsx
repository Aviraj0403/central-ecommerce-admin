import React, { useEffect, useState } from "react";
import SuperAdminAxios from "../../utils/SuperAdminAxios";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";
import { Building2, Globe, Database, CheckCircle, XCircle, Plus, Eye, Settings2, LogIn } from "lucide-react";

const TenantList = () => {
  const [tenants, setTenants] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const fetchTenants = async () => {
    try {
      setLoading(true);
      const res = await SuperAdminAxios.get("/superadmin/tenants");
      setTenants(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      toast.error("Failed to load tenants");
    } finally {
      setLoading(false);
    }
  };

  const handleSwitchProject = (t) => {
    localStorage.setItem("active_tenant_id", t.projectId);
    toast.success(`Switched to project ${t.name}`);
    navigate("/admin/dashboard");
  };

  useEffect(() => { fetchTenants(); }, []);

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-white tracking-tight">Tenant Projects</h1>
          <p className="text-gray-400 mt-1">Manage all onboarded eCommerce projects on this SaaS platform</p>
        </div>
        <button
          onClick={() => navigate("/superadmin/tenants/new")}
          className="flex items-center gap-2 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white px-5 py-2.5 rounded-xl font-medium transition-all shadow-lg shadow-purple-900/30 border border-purple-500/30"
        >
          <Plus size={16} /> Onboard New Project
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-8">
        <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6 relative overflow-hidden group">
          <div className="absolute -right-6 -top-6 w-32 h-32 bg-purple-600/10 rounded-full blur-2xl group-hover:bg-purple-600/20 transition-all"></div>
          <p className="text-gray-400 text-sm font-medium">Total Projects</p>
          <p className="text-4xl font-bold text-white mt-2">{tenants.length}</p>
        </div>
        <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6 relative overflow-hidden group">
          <div className="absolute -right-6 -top-6 w-32 h-32 bg-emerald-600/10 rounded-full blur-2xl group-hover:bg-emerald-600/20 transition-all"></div>
          <p className="text-gray-400 text-sm font-medium">Active Stores</p>
          <p className="text-4xl font-bold text-emerald-400 mt-2">{tenants.filter(t => t.isActive).length}</p>
        </div>
        <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6 relative overflow-hidden group">
          <div className="absolute -right-6 -top-6 w-32 h-32 bg-rose-600/10 rounded-full blur-2xl group-hover:bg-rose-600/20 transition-all"></div>
          <p className="text-gray-400 text-sm font-medium">Inactive Stores</p>
          <p className="text-4xl font-bold text-rose-400 mt-2">{tenants.filter(t => !t.isActive).length}</p>
        </div>
      </div>

      {/* Tenant Cards */}
      {loading ? (
        <div className="flex items-center justify-center py-20">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500"></div>
        </div>
      ) : tenants.length === 0 ? (
        <div className="text-center py-20 bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl">
          <p className="text-gray-400 text-lg">No tenants onboarded yet.</p>
          <button onClick={() => navigate("/superadmin/tenants/new")} className="mt-4 text-purple-400 hover:text-purple-300 font-medium">
            + Onboard your first project
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {tenants.map((t) => (
            <div key={t._id} className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6 hover:border-purple-500/50 hover:bg-white/10 transition-all group flex flex-col relative overflow-hidden shadow-xl">
              <div className="absolute top-0 right-0 w-32 h-32 bg-purple-500/5 rounded-full blur-3xl group-hover:bg-purple-500/10 transition-all pointer-events-none"></div>
              
              {/* Top Row */}
              <div className="flex items-start justify-between mb-6">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl flex items-center justify-center font-bold text-white text-lg shadow-lg" style={{ backgroundColor: t.theme?.primaryColor || '#7c3aed' }}>
                    {t.namePrefix || t.name?.slice(0, 2).toUpperCase()}
                  </div>
                  <div>
                    <h3 className="text-white font-bold text-lg">{t.name}</h3>
                    <p className="text-xs text-purple-400/80 font-mono mt-0.5">#{t.projectId}</p>
                  </div>
                </div>
                <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${t.isActive ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'bg-rose-500/10 text-rose-400 border border-rose-500/20'}`}>
                  {t.isActive ? 'Active' : 'Inactive'}
                </span>
              </div>

              {/* Domains */}
              <div className="mb-5">
                <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-2 flex items-center gap-1.5"><Globe size={12} /> Connected Domains</p>
                <div className="flex flex-wrap gap-2">
                  {(t.domains || []).slice(0, 3).map((d, i) => (
                    <span key={i} className="bg-white/5 border border-white/5 text-gray-300 text-xs px-2.5 py-1 rounded-md font-mono">{d}</span>
                  ))}
                  {t.domains?.length > 3 && <span className="text-gray-500 text-xs py-1">+{t.domains.length - 3} more</span>}
                </div>
              </div>

              {/* Modules */}
              <div className="mb-6">
                <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-2">Active Modules</p>
                <div className="flex flex-wrap gap-2">
                  {Object.entries(t.modules || {}).map(([key, val]) => (
                    <span key={key} className={`text-[10px] font-semibold px-2 py-1 rounded-md flex items-center gap-1.5 border ${val ? 'bg-purple-500/10 text-purple-300 border-purple-500/20' : 'bg-white/5 text-gray-500 border-white/5 opacity-50'}`}>
                      {val ? <CheckCircle size={10} /> : <XCircle size={10} />} {key}
                    </span>
                  ))}
                </div>
              </div>

              {/* Admin Email */}
              <div className="text-xs text-gray-400 mb-6 bg-black/20 p-3 rounded-xl border border-white/5">
                <span className="font-semibold text-gray-500 block mb-1">Primary Administrator</span>
                <span className="text-gray-300 font-medium">{t.adminUser?.email || '—'}</span>
              </div>

              <div className="mt-auto"></div>

              {/* Actions */}
              <div className="flex gap-3 pt-4 border-t border-white/10 mt-4 relative z-10">
                <button
                  onClick={() => handleSwitchProject(t)}
                  className="flex-1 flex items-center justify-center gap-2 text-xs bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/20 py-2.5 rounded-xl transition-all font-bold"
                >
                  <LogIn size={14} /> Master Login
                </button>
                <button
                  onClick={() => navigate(`/superadmin/tenants/${t._id}`)}
                  className="flex-[0.5] flex items-center justify-center gap-2 text-xs bg-white/5 hover:bg-white/10 text-white border border-white/10 py-2.5 rounded-xl transition-all font-bold"
                >
                  <Settings2 size={14} /> Config
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default TenantList;

