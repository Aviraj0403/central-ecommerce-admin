import React, { useEffect } from "react";
import { Link, useLocation, useNavigate, Navigate } from "react-router-dom";
import { ChevronRight, Home } from "lucide-react";

// Friendly label map with "Product" replacing "Food"
const labelMap = {
  admin: "Admin",
  dashboard: "Dashboard",
  home: "Dashboard", // 👈 Treat /admin/home as Dashboard
  "product-details": "Product Details",
  "edit-product": "Edit Product",
  adminProducts: "All Products",
  "order-manager": "Orders",
  reviews: "Reviews",
  create: "Create",
  new: "New",
  users: "Users",
  addProduct: "Add Product",
  adminProduct: "Manage Product",
  editProduct: "Edit Product",
  "product-view": "Product View",
  categories: "Categories",
  addCategory: "Add Category",
  editCategory: "Edit Category",
  viewCategory: "View Category",
  offers: "Offers",
  "sales-report": "Sales Report",
  orders: "Orders",
  shipping: "Shipping Manager",
  "shipping-analytics": "Shipping Analytics",
  leads: "Leads",
  settings: "Store Settings"
};

// Detect if a segment is a dynamic ID (e.g., Mongo ID)
const isDynamicSegment = (str) =>
  str.length > 15 || /^[0-9a-f]{20,}$/i.test(str);

const RouterCumb = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const paths = location.pathname.split("/").filter(Boolean);

  // Check if any path segment is valid
  const isValidRoute = paths.some((segment) => labelMap[segment]);

  useEffect(() => {
    if (!isValidRoute) {
      const lastValidPath =
        sessionStorage.getItem("lastValidPath") || "/admin/dashboard";
      navigate(lastValidPath, { replace: true });
    } else {
      sessionStorage.setItem("lastValidPath", location.pathname);
    }
  }, [location.pathname, isValidRoute, navigate]);

  // If the route is not valid, redirect
  if (!isValidRoute) {
    return <Navigate to="/admin/dashboard" replace />;
  }

  if (paths.length === 0) return null;

  return (
    <nav className="flex items-center gap-2.5 px-4 py-2 bg-white/50 border border-zinc-200/60 rounded-lg text-[11px] font-bold text-zinc-500 backdrop-blur-sm self-start inline-flex">
      <Link
        to="/admin/dashboard"
        className="hover:text-zinc-900 transition-colors flex items-center gap-1 cursor-pointer"
      >
        <Home size={12} className="text-zinc-400" />
        <span>Home</span>
      </Link>

      {paths.map((segment, index) => {
        const fullPath = `/${paths.slice(0, index + 1).join("/")}`;
        const isLast = index === paths.length - 1;

        const label = isDynamicSegment(segment)
          ? "Details"
          : labelMap[segment] || segment.charAt(0).toUpperCase() + segment.slice(1);

        return (
          <div
            className="flex items-center gap-2"
            key={index}
          >
            <ChevronRight size={10} className="text-zinc-300 flex-shrink-0" />
            <Link
              to={fullPath}
              className={`transition-colors duration-200 ${
                isLast
                  ? "text-orange-600 font-extrabold"
                  : "text-zinc-500 hover:text-zinc-900 cursor-pointer"
              }`}
            >
              {label}
            </Link>
          </div>
        );
      })}
    </nav>
  );
};

export default RouterCumb;
