import React, { useState, useEffect, useRef } from "react";
import { Menu, User, ShoppingBag, Cpu, LogOut, Sun, Moon, Building2 } from "lucide-react";
import { useAuth } from "../../context/AuthContext.jsx";
import { useTheme } from "../../context/ThemeContext.jsx";
import { redisCache } from "../../services/dashboartdApi.js";
import { toast } from "react-hot-toast";
import SuperAdminAxios from "../../utils/SuperAdminAxios.jsx";
import { useNavigate } from "react-router-dom";

function Header({ toggleSidebar, openSidebar }) {
  const { user, logout } = useAuth();
  const { isDark, toggleTheme } = useTheme();
  const [isOpenProfile, setIsOpenProfile] = useState(false);
  const [isCacheClearing, setIsCacheClearing] = useState(false);
  const [showSwitchProject, setShowSwitchProject] = useState(false);
  const [tenants, setTenants] = useState([]);
  const profileRef = useRef();
  const switchRef = useRef();
  const navigate = useNavigate();
  
  const isLight = !isDark;

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (profileRef.current && !profileRef.current.contains(e.target)) {
        setIsOpenProfile(false);
      }
      if (switchRef.current && !switchRef.current.contains(e.target)) {
        setShowSwitchProject(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const fetchTenants = async () => {
    try {
      const res = await SuperAdminAxios.get("/superadmin/tenants");
      setTenants(res.data);
    } catch (err) {
      toast.error("Failed to fetch projects");
    }
  };

  const handleOpenSwitchProject = () => {
    if (!showSwitchProject && tenants.length === 0) {
      fetchTenants();
    }
    setShowSwitchProject(!showSwitchProject);
  };

  const handleSwitch = (tenant) => {
    localStorage.setItem("active_tenant_id", tenant.projectId);
    toast.success(`Switched to ${tenant.name}`);
    setShowSwitchProject(false);
    // Hard refresh to ensure all states/contexts clear out old tenant data
    window.location.href = "/admin/dashboard";
  };

  const handleRebootCache = async () => {
    setIsCacheClearing(true);
    const loadingToast = toast.loading('Clearing system cache...');
    try {
      const result = await redisCache();
      setIsCacheClearing(false);
      if (result) {
        toast.success('Cache cleared successfully!', { id: loadingToast });
      } else {
        toast.error('Failed to clear cache.', { id: loadingToast });
      }
    } catch (err) {
      setIsCacheClearing(false);
      toast.error('Error clearing cache.', { id: loadingToast });
    }
  };

  return (
    <header className={`h-[72px] flex items-center ${isLight ? 'bg-white border-blue-100 shadow-sm' : 'bg-[#0c0a09] border-white/10'} px-4 fixed top-0 left-0 right-0 z-30 border-b transition-all ease-in-out duration-300`}>
      <div className="container mx-auto flex justify-between items-center w-full">
        {/* LEFT SIDE: Logo + Sidebar Toggle */}
        <div className="flex items-center space-x-4">
          <button
            onClick={toggleSidebar}
            className={`p-1.5 rounded-lg border transition-all cursor-pointer ${isLight ? 'border-blue-100 hover:bg-blue-50 text-slate-600 hover:text-blue-600' : 'border-white/10 hover:bg-white/5 text-white/70 hover:text-white'}`}
            title="Toggle Sidebar"
          >
            <Menu size={18} />
          </button>
          
          <div className="flex items-center space-x-2">
            <div className={`p-1 rounded-md text-white ${isLight ? 'bg-blue-600' : 'bg-orange-500'}`}>
              <ShoppingBag size={16} />
            </div>
            <h1 className={`text-sm font-black tracking-widest uppercase ${isLight ? 'text-blue-900' : 'text-white'}`}>GK STORE</h1>
          </div>
        </div>

        {/* RIGHT SIDE: Branch, Switch Project (Superadmin only), Theme, Cache, Profile */}
        <div className="flex items-center space-x-4">
          
          {/* Switch Project Dropdown for SuperAdmin */}
          {user?.roleType === 'superadmin' && (
            <div className="relative" ref={switchRef}>
              <button
                onClick={handleOpenSwitchProject}
                className={`flex items-center gap-2 border px-3 py-1.5 rounded-lg transition-all text-xs font-bold cursor-pointer
                  ${isLight ? 'bg-purple-50 text-purple-700 border-purple-200 hover:bg-purple-100' : 'bg-purple-500/10 text-purple-400 border-purple-500/30 hover:bg-purple-500/20'}`}
              >
                <Building2 size={14} />
                Switch Project
              </button>
              
              {showSwitchProject && (
                <div className={`absolute right-0 mt-2 w-64 border rounded-xl shadow-2xl z-50 p-2 animate-in fade-in slide-in-from-top-2 duration-150 max-h-80 overflow-y-auto
                  ${isLight ? 'bg-white border-purple-100' : 'bg-gray-900 border-gray-800'}`}>
                  <div className={`px-2 pb-2 mb-2 border-b text-xs font-semibold ${isLight ? 'border-gray-100 text-gray-500' : 'border-gray-800 text-gray-400'}`}>
                    Active Stores
                  </div>
                  {tenants.map(t => (
                    <button
                      key={t._id}
                      onClick={() => handleSwitch(t)}
                      className={`w-full text-left px-3 py-2 rounded-lg text-xs font-medium transition-colors mb-1 cursor-pointer flex flex-col
                        ${isLight ? 'hover:bg-purple-50 text-gray-700' : 'hover:bg-gray-800 text-gray-300'}`}
                    >
                      <span>{t.name}</span>
                      <span className={`text-[10px] ${isLight ? 'text-gray-400' : 'text-gray-500'}`}>ID: {t.projectId}</span>
                    </button>
                  ))}
                  <div className={`mt-2 pt-2 border-t ${isLight ? 'border-gray-100' : 'border-gray-800'}`}>
                     <button
                        onClick={() => navigate('/superadmin/dashboard')}
                        className={`w-full text-center px-3 py-2 rounded-lg text-xs font-bold transition-colors cursor-pointer
                          ${isLight ? 'bg-gray-100 hover:bg-gray-200 text-gray-700' : 'bg-gray-800 hover:bg-gray-700 text-gray-300'}`}
                     >
                       Go to Master Control
                     </button>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Theme Toggle */}
          <button
            onClick={toggleTheme}
            className={`p-1.5 rounded-lg border transition-all cursor-pointer flex items-center justify-center
              ${isLight ? 'bg-blue-50 border-blue-100 text-blue-600 hover:bg-blue-100' : 'bg-white/5 border-white/10 text-white/70 hover:text-white hover:bg-white/10'}`}
            title="Toggle Theme"
          >
            {isLight ? <Moon size={16} /> : <Sun size={16} />}
          </button>

          {/* Cache Reboot Button */}
          <button
            onClick={handleRebootCache}
            disabled={isCacheClearing}
            className={`px-4 py-1.5 rounded-lg text-xs font-semibold border transition-all duration-200 flex items-center gap-1.5 cursor-pointer ${
              isCacheClearing
                ? (isLight ? "bg-slate-100 text-slate-400 border-slate-200 cursor-not-allowed" : "bg-white/5 text-white/30 border-white/10 cursor-not-allowed")
                : (isLight ? "bg-blue-50 text-blue-700 border-blue-200 hover:bg-blue-100 active:scale-95 shadow-sm" : "bg-white/5 text-white border-white/10 hover:bg-white/10 active:scale-95 shadow-sm")
            } hidden sm:flex`}  
          >
            <Cpu size={14} className={isCacheClearing ? "animate-spin" : ""} />
            {isCacheClearing ? "Rebooting..." : "Reboot Cache"}
          </button>

          {/* Profile Dropdown */}
          <div className="relative" ref={profileRef}>
            <button
              onClick={() => setIsOpenProfile((prev) => !prev)}
              className={`flex items-center gap-2 border shadow-sm px-3.5 py-1.5 rounded-lg transition-all text-xs font-semibold cursor-pointer
                ${isLight ? 'text-slate-700 border-blue-100 bg-white hover:bg-blue-50' : 'text-white border-white/10 bg-white/5 hover:bg-white/10'}`}
            >
              <User size={14} className={isLight ? 'text-blue-500' : 'text-white/40'} />
              {user?.userName || "Admin"}
            </button>

            {/* Profile Dropdown Menu */}
            {isOpenProfile && (
              <div className={`absolute right-0 mt-2 w-52 border rounded-xl shadow-2xl z-50 p-1.5 animate-in fade-in slide-in-from-top-2 duration-150
                ${isLight ? 'bg-white border-blue-100' : 'bg-[#0c0a09] border-white/10'}`}>
                <div className="px-3 py-2">
                  <div className={`text-xs font-black truncate ${isLight ? 'text-slate-800' : 'text-white'}`}>{user?.userName || "Admin"}</div>
                  <div className={`text-[10px] truncate mt-0.5 ${isLight ? 'text-slate-500' : 'text-white/40'}`}>{user?.email || "No email"}</div>
                </div>
                <div className={`h-px my-1 ${isLight ? 'bg-blue-50' : 'bg-white/10'}`} />
                <button
                  onClick={logout}
                  className={`flex items-center gap-2 w-full text-left px-3 py-2 text-xs rounded-lg transition-colors font-medium cursor-pointer
                    ${isLight ? 'text-rose-600 hover:bg-rose-50 hover:text-rose-700' : 'text-rose-400 hover:bg-white/5 hover:text-rose-300'}`}
                >
                  <LogOut size={13} />
                  <span>Logout</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}

export default Header;
