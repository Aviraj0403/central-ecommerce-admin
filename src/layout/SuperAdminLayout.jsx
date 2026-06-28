import React, { useState } from "react";
import { NavLink, Outlet, useNavigate } from "react-router-dom";
import { Building2, LogOut, LayoutDashboard, Menu, X, Users, ShoppingCart, Activity, Bell, Search, Settings } from "lucide-react";
import SuperAdminAxios from "../utils/SuperAdminAxios";
import { toast } from "react-toastify";

const NAV = [
  { to: "/superadmin/dashboard", icon: LayoutDashboard, label: "Dashboard" },
  { to: "/superadmin/tenants", icon: Building2, label: "All Projects" },
  { to: "/superadmin/global-users", icon: Users, label: "Global Users" },
  { to: "/superadmin/global-orders", icon: ShoppingCart, label: "Global Orders" },
  { to: "/superadmin/health", icon: Activity, label: "System Health" },
];

const SuperAdminLayout = () => {
  const [collapsed, setCollapsed] = useState(false);
  const navigate = useNavigate();

  // Get superadmin data from localStorage
  const user = JSON.parse(localStorage.getItem("superadmin") || "{}");

  const handleLogout = async () => {
    try {
      await SuperAdminAxios.post("/auth/logout");
    } catch {}
    localStorage.removeItem("superadmin");
    toast.success("Logged out");
    navigate("/signin");
  };

  return (
    <div className="flex h-screen overflow-hidden bg-[#030305] text-white font-sans relative selection:bg-purple-500/30">
      {/* Premium Background Glows */}
      <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] bg-purple-600/20 blur-[120px] rounded-full pointer-events-none mix-blend-screen"></div>
      <div className="absolute bottom-[-20%] right-[-10%] w-[50%] h-[50%] bg-blue-600/10 blur-[120px] rounded-full pointer-events-none mix-blend-screen"></div>

      {/* Sidebar */}
      <aside className={`${collapsed ? 'w-20' : 'w-64'} flex-shrink-0 bg-gray-950/40 backdrop-blur-2xl border-r border-white/5 flex flex-col transition-all duration-300 z-30 shadow-[4px_0_24px_rgba(0,0,0,0.2)]`}>
        {/* Logo */}
        <div className="flex items-center justify-between px-5 py-6 border-b border-white/5 h-[72px]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500 via-violet-600 to-blue-600 flex items-center justify-center flex-shrink-0 shadow-[0_0_15px_rgba(147,51,234,0.3)] border border-white/10">
              <Building2 size={20} className="text-white drop-shadow-md" />
            </div>
            {!collapsed && (
              <div className="flex flex-col">
                <span className="font-extrabold text-[15px] tracking-tight leading-tight text-transparent bg-clip-text bg-gradient-to-r from-white to-gray-400">Master Control</span>
                <span className="text-purple-400/80 text-[10px] uppercase font-bold tracking-widest mt-0.5">JD Infotech</span>
              </div>
            )}
          </div>
          <button onClick={() => setCollapsed(!collapsed)} className="text-gray-500 hover:text-white transition-colors bg-white/5 hover:bg-white/10 p-1.5 rounded-lg">
            {collapsed ? <Menu size={16} /> : <X size={16} />}
          </button>
        </div>

        {/* Nav */}
        <nav className="flex-1 px-3 py-6 space-y-1.5 overflow-y-auto scrollbar-thin">
          <div className="mb-4 px-3">
            {!collapsed && <p className="text-[10px] font-bold tracking-[0.2em] text-gray-500 uppercase">Platform Config</p>}
          </div>
          {NAV.map(({ to, icon: Icon, label }) => (
            <NavLink key={to} to={to}
              className={({ isActive }) =>
                `group flex items-center gap-3.5 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-300 ${isActive ? 'bg-gradient-to-r from-purple-500/15 to-blue-500/5 text-white border border-purple-500/20 shadow-[inset_0_1px_0_rgba(255,255,255,0.1)]' : 'text-gray-400 hover:text-gray-100 hover:bg-white/5 border border-transparent'}`
              }
            >
              {({ isActive }) => (
                <>
                  <div className={`flex items-center justify-center transition-colors ${isActive ? 'text-purple-400 drop-shadow-[0_0_8px_rgba(168,85,247,0.5)]' : 'text-gray-500 group-hover:text-gray-300'}`}>
                    <Icon size={18} className="flex-shrink-0" />
                  </div>
                  {!collapsed && <span className={isActive ? "font-semibold tracking-wide" : "tracking-wide"}>{label}</span>}
                  {isActive && !collapsed && (
                    <div className="ml-auto w-1.5 h-1.5 rounded-full bg-purple-500 shadow-[0_0_8px_rgba(168,85,247,0.8)]" />
                  )}
                </>
              )}
            </NavLink>
          ))}
        </nav>

        {/* Logout */}
        <div className="p-4 border-t border-white/5 bg-gray-950/20">
          <button onClick={handleLogout} className="flex items-center gap-3.5 px-3 py-2.5 rounded-xl text-sm text-gray-400 hover:text-rose-400 hover:bg-rose-500/10 hover:border-rose-500/20 border border-transparent transition-all w-full font-semibold group cursor-pointer">
            <LogOut size={18} className="group-hover:rotate-12 transition-transform duration-300" />
            {!collapsed && <span>Disconnect Session</span>}
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex flex-col flex-1 min-w-0 z-20">
        
        {/* Global Header */}
        <header className="h-[72px] bg-gray-950/60 backdrop-blur-2xl border-b border-white/5 flex items-center justify-between px-8 z-20 sticky top-0 shadow-sm">
          
          <div className="flex items-center bg-gray-900/50 border border-white/5 rounded-full px-4 py-2 w-96 shadow-inner focus-within:border-purple-500/50 focus-within:bg-gray-900 transition-all">
            <Search size={16} className="text-gray-500 mr-2" />
            <input 
              type="text" 
              placeholder="Search tenants, users, or system logs..." 
              className="bg-transparent border-none outline-none text-sm text-white w-full placeholder-gray-600"
            />
          </div>

          <div className="flex items-center gap-6">
            <div className="flex items-center gap-4 border-r border-white/10 pr-6">
              <button className="text-gray-400 hover:text-white transition relative bg-white/5 hover:bg-white/10 p-2 rounded-full border border-transparent hover:border-white/10">
                <Bell size={18} />
                <span className="absolute top-0 right-0 w-2.5 h-2.5 bg-rose-500 rounded-full border-2 border-gray-900 shadow-[0_0_8px_rgba(244,63,94,0.6)]"></span>
              </button>
              <button className="text-gray-400 hover:text-white transition bg-white/5 hover:bg-white/10 p-2 rounded-full border border-transparent hover:border-white/10">
                <Settings size={18} />
              </button>
            </div>
            
            <div className="flex items-center gap-3 cursor-pointer group bg-white/5 hover:bg-white/10 border border-white/5 px-3 py-1.5 rounded-full transition-all">
              <div className="w-8 h-8 rounded-full bg-gradient-to-r from-purple-500 to-indigo-500 p-0.5 shadow-[0_0_10px_rgba(168,85,247,0.3)]">
                <div className="w-full h-full rounded-full bg-gray-950 flex items-center justify-center font-bold text-white text-xs">
                  {user?.userName?.slice(0,2).toUpperCase() || 'SA'}
                </div>
              </div>
              <div className="text-left hidden md:block">
                <p className="text-[13px] font-bold text-white group-hover:text-purple-300 transition">{user?.userName || 'Super Admin'}</p>
              </div>
            </div>
          </div>
        </header>

        {/* Scrollable Content */}
        <main className="flex-1 overflow-auto bg-transparent p-6 md:p-8 scrollbar-thin">
          <div className="max-w-[1600px] mx-auto pb-12">
            <Outlet />
          </div>
        </main>

        {/* Global Footer */}
        <footer className="bg-gray-950/60 backdrop-blur-md border-t border-white/5 py-4 px-8 flex justify-between items-center text-[11px] text-gray-500 uppercase tracking-widest font-medium z-20">
          <div className="flex items-center gap-4">
            <span>&copy; {new Date().getFullYear()} JD Infotech Solutions.</span>
            <span className="flex items-center gap-1.5 bg-emerald-500/10 text-emerald-400 px-2 py-0.5 rounded border border-emerald-500/20">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
              Operational
            </span>
          </div>
          <div className="flex gap-6">
            <a href="#" className="hover:text-gray-300 transition-colors">Docs</a>
            <a href="#" className="hover:text-gray-300 transition-colors">Support</a>
            <span className="text-gray-600">v2.1.0</span>
          </div>
        </footer>
      </div>
    </div>
  );
};

export default SuperAdminLayout;
