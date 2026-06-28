import React from "react";
import { NavLink, useNavigate } from "react-router-dom";
import {
  LayoutDashboard,
  Package,
  PlusCircle,
  Tag,
  ShoppingCart,
  Truck,
  TrendingUp,
  Users,
  Percent,
  Image,
  BarChart2,
  Boxes,
  CreditCard,
  AlertCircle,
  Settings,
  LogOut,
  X
} from "lucide-react";
import { useAuth } from "../context/AuthContext.jsx";
import { useTheme } from "../context/ThemeContext.jsx";

const NavSection = ({ title, children }) => {
  const { isDark } = useTheme();
  const isLight = !isDark;
  return (
    <div className="mb-1">
      <p className={`${isLight ? 'text-slate-600 font-extrabold' : 'text-white/30'} text-[9px] uppercase tracking-[0.15em] px-3 py-1.5 mt-2`}>{title}</p>
      <div className="space-y-0.5">
        {children}
      </div>
    </div>
  );
};

const NavItem = ({ to, label, icon, onClick }) => {
  const { isDark } = useTheme();
  const isLight = !isDark;
  return (
    <NavLink
      to={to}
      onClick={onClick}
      className={({ isActive }) =>
        `flex items-center gap-3 px-3 py-2.5 rounded-xl text-[13px] font-medium transition-all duration-200 ${isActive
          ? (isLight 
              ? "bg-blue-50 text-blue-800 border border-blue-200 shadow-sm font-bold" 
              : "bg-gradient-to-r from-orange-500/25 to-orange-500/5 text-orange-300 border border-orange-500/20 shadow-sm")
          : (isLight 
              ? "text-slate-700 hover:text-blue-800 hover:bg-slate-100 border border-transparent" 
              : "text-white/55 hover:text-white/90 hover:bg-white/5 border border-transparent")
        }`
      }
    >
      {({ isActive }) => (
        <>
          <span className={`flex-shrink-0 transition-colors ${isActive ? (isLight ? "text-blue-700" : "text-orange-500") : (isLight ? "text-slate-600" : "text-white/40")}`}>
            {icon}
          </span>
          <span className="truncate">{label}</span>
          {isActive && (
            <span className={`ml-auto w-1.5 h-1.5 rounded-full flex-shrink-0 ${isLight ? "bg-blue-700" : "bg-orange-500"}`} />
          )}
        </>
      )}
    </NavLink>
  );
};

function Sidebar({ className, toggleSidebar }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const { isDark } = useTheme();
  const isLight = !isDark;

  const handleLogout = async () => {
    try {
      await logout();
      navigate("/signin");
    } catch (err) {
      console.error("Logout failed:", err);
    }
  };

  const isAllowed = (moduleId) => {
    if (user?.roleType === 'superadmin') return true;
    return user?.permissions?.[moduleId] !== false;
  };

  return (
    <aside className={`${className} ${isLight ? 'bg-white text-slate-800' : 'sidebar-gradient text-white'} flex flex-col shadow-2xl overflow-y-auto transition-all duration-300 ease-in-out border-r ${isLight ? 'border-blue-100' : 'border-transparent'}`}>
      
      {/* Mobile close button */}
      <div className="lg:hidden flex justify-end px-3 pt-3">
        <button
          onClick={toggleSidebar}
          className={`p-1.5 rounded-lg transition-all cursor-pointer
            ${isLight ? 'bg-slate-100 hover:bg-slate-200 text-slate-600' : 'bg-white/10 hover:bg-white/20 text-white/70'}`}
        >
          <X size={15} />
        </button>
      </div>

      {/* Profile Card */}
      <div className={`mx-3 mt-3 mb-1 p-3 rounded-xl border shadow-sm ${isLight ? 'bg-slate-50 border-blue-100' : 'bg-white/5 border-white/10'}`}>
        <div className="flex items-center gap-3">
          <div className={`w-9 h-9 rounded-full flex items-center justify-center shadow-md flex-shrink-0 ${isLight ? 'bg-gradient-to-br from-blue-500 to-blue-700' : 'orange-gradient'}`}>
            <span className="text-white font-black text-sm">
              {(user?.userName || "U")[0].toUpperCase()}
            </span>
          </div>
          <div className="min-w-0 flex-1">
            <p className={`font-semibold text-sm truncate leading-tight ${isLight ? 'text-slate-800' : 'text-white'}`}>{user?.userName || "Admin"}</p>
            <p className={`text-[10px] truncate mt-0.5 ${isLight ? 'text-blue-600 font-medium' : 'text-orange-400'}`}>{user?.email || "admin@gkstore.com"}</p>
          </div>
          <div className="w-2 h-2 rounded-full bg-emerald-400 flex-shrink-0 shadow-sm" title="Online" />
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto px-2 py-3 space-y-0.5 scrollbar-thin">
        <NavSection title="Overview" isLight={isLight}>
          <NavItem to="/admin/dashboard" label="Dashboard" icon={<LayoutDashboard size={15} />} onClick={toggleSidebar} />
        </NavSection>

        {isAllowed('products') && (
          <NavSection title="Catalogue" isLight={isLight}>
            <NavItem to="/admin/adminProducts" label="All Products" icon={<Package size={15} />} onClick={toggleSidebar} />
            <NavItem to="/admin/addProduct" label="Add Product" icon={<PlusCircle size={15} />} onClick={toggleSidebar} />
            {isAllowed('categories') && (
              <NavItem to="/admin/categories" label="Categories" icon={<Tag size={15} />} onClick={toggleSidebar} />
            )}
          </NavSection>
        )}

        {isAllowed('orders') && (
          <NavSection title="Orders" isLight={isLight}>
            <NavItem to="orders" label="All Orders" icon={<ShoppingCart size={15} />} onClick={toggleSidebar} />
            {isAllowed('leads') && (
              <NavItem to="leads" label="Leads" icon={<Users size={15} />} onClick={toggleSidebar} />
            )}
            {isAllowed('shipping') && (
              <>
                <NavItem to="shipping" label="Shipping" icon={<Truck size={15} />} onClick={toggleSidebar} />
                <NavItem to="shipping-analytics" label="Ship Analytics" icon={<TrendingUp size={15} />} onClick={toggleSidebar} />
              </>
            )}
          </NavSection>
        )}

        {isAllowed('users') && (
          <NavSection title="Customers" isLight={isLight}>
            <NavItem to="users" label="Users" icon={<Users size={15} />} onClick={toggleSidebar} />
          </NavSection>
        )}

        {(isAllowed('offers') || isAllowed('banners')) && (
          <NavSection title="Marketing" isLight={isLight}>
            {isAllowed('offers') && <NavItem to="offers" label="Offers & Deals" icon={<Percent size={15} />} onClick={toggleSidebar} />}
            {isAllowed('banners') && <NavItem to="banners" label="Banners" icon={<Image size={15} />} onClick={toggleSidebar} />}
          </NavSection>
        )}

        {(isAllowed('reports') || isAllowed('stocks')) && (
          <NavSection title="Reports" isLight={isLight}>
            {isAllowed('reports') && (
              <>
                <NavItem to="sales-report" label="Sales Report" icon={<BarChart2 size={15} />} onClick={toggleSidebar} />
                <NavItem to="PaymentDetails" label="Payments" icon={<CreditCard size={15} />} onClick={toggleSidebar} />
                <NavItem to="orphaned-payments" label="Missing Payments" icon={<AlertCircle size={15} />} onClick={toggleSidebar} />
              </>
            )}
            {isAllowed('stocks') && (
              <NavItem to="stocks" label="Stock Manager" icon={<Boxes size={15} />} onClick={toggleSidebar} />
            )}
          </NavSection>
        )}

        {isAllowed('settings') && (
          <NavSection title="System" isLight={isLight}>
            <NavItem to="settings" label="Store Settings" icon={<Settings size={15} />} onClick={toggleSidebar} />
          </NavSection>
        )}
      </nav>

      {/* Bottom Divider */}
      <div className={`h-px mx-3 my-2 ${isLight ? 'bg-blue-100' : 'bg-white/10'}`} />

      {/* Logout */}
      <div className="p-3">
        <button
          onClick={handleLogout}
          className={`flex items-center gap-2.5 w-full px-3 py-2.5 rounded-xl text-sm transition-all duration-200 group cursor-pointer border
            ${isLight 
              ? 'text-rose-600 hover:bg-rose-50 border-transparent hover:border-rose-200' 
              : 'text-orange-300/80 hover:text-white hover:bg-orange-500/20 border-transparent hover:border-orange-500/20'}`}
        >
          <LogOut size={15} className="group-hover:rotate-12 transition-transform duration-200" />
          <span className="font-medium">Sign Out</span>
        </button>
      </div>
    </aside>
  );
}

export default Sidebar;
