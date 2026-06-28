import React from "react";
import { createBrowserRouter, Navigate } from "react-router-dom";
import AdminLayout from "./layout/AdminLayout";
import Dashboard from "./pages/Dashboard";
import Signin from "./pages/auth/Signin";
import Unauthorized from "./pages/Unauthorized";
import ProtectedRoute from "./secureRoute/ProtectedRoute";
import HomePage from "./pages/HomePage";
import AddFoodForm from "./pages/Product/AddProductForm";
import AdminProduct from "./pages/Product/AdminProducts";
import CategoryList from "./pages/category/CatgoryList";
import AddCategoryForm from "./pages/category/AddCategoryForm";
import EditCategory from "./pages/category/EditCategory";
import ViewCategory from "./pages/category/ViewCatgory";
import OffersList from "./pages/offers/OffersList";
import TotalUserOnWeb from "./pages/users/TotalUserOnWeb";
import NotFoundPage from './pages/PNF/NotFoundPage';
import SalesReport from "./pages/report/SaleDash";
import AdminOrderManager from "./pages/orders/AdminOrderManager"
import PaymentList from "./pages/payments/PaymentList";
import EditProduct from "./pages/Product/EditProduct";
import ProductView from "./pages/Product/ProductView";
import AdminStockManager from "./pages/stocks/AdminStockManager";
import OrphanedPayments from "./pages/payments/OrphanedPayments";
import AdminOrderLeads from "./pages/Leads/AdminOrderLeads";
import PromoBannerAdmin from "./pages/Banner/PromoBannerAdmin";
import ShiprocketManager from "./pages/orders/ShiprocketManager";
import ShippingAnalytics from "./pages/orders/ShippingAnalytics";
import OrderInvoice from "./pages/orders/OrderInvoice";
import SettingsPage from "./pages/settings";

// ✅ New SaaS Features
import CouponsList from "./pages/coupons/CouponsList";
import ReturnRequestsList from "./pages/returns/ReturnRequestsList";
import StaffManager from "./pages/users/StaffManager";

// ✅ SuperAdmin Portal
import SuperAdminLayout from "./layout/SuperAdminLayout";
import SuperAdminLogin from "./pages/superadmin/SuperAdminLogin";
import SuperAdminDashboard from "./pages/superadmin/SuperAdminDashboard";
import GlobalUsers from "./pages/superadmin/GlobalUsers";
import GlobalOrders from "./pages/superadmin/GlobalOrders";
import SystemHealth from "./pages/superadmin/SystemHealth";
import TenantList from "./pages/superadmin/TenantList";
import OnboardTenant from "./pages/superadmin/OnboardTenant";
import ConfigureTenant from "./pages/superadmin/ConfigureTenant";

const SuperAdminRoute = ({ children }) => {
  const superadmin = localStorage.getItem("superadmin");
  if (!superadmin) {
    return <Navigate to="/superadmin/login" replace />;
  }
  return children;
};

const router = createBrowserRouter([
  {
    path: "/",
    element: <Navigate to="/signin" replace />, // redirect base
  },
  {
    path: "/signin",
    element: <Signin />,
  },
  {
    path: "/superadmin/login",
    element: <SuperAdminLogin />,
  },
  {
    path: "/superadmin",
    element: (
      <SuperAdminRoute>
        <SuperAdminLayout />
      </SuperAdminRoute>
    ),
    children: [
      {
        index: true,
        element: <Navigate to="dashboard" replace />,
      },
      {
        path: "dashboard",
        element: <SuperAdminDashboard />,
      },
      {
        path: "tenants",
        element: <TenantList />,
      },
      {
        path: "global-users",
        element: <GlobalUsers />,
      },
      {
        path: "global-orders",
        element: <GlobalOrders />,
      },
      {
        path: "health",
        element: <SystemHealth />,
      },
      {
        path: "tenants/new",
        element: <OnboardTenant />,
      },
      {
        path: "tenants/:id",
        element: <ConfigureTenant />, // Configure and View uses the same component here
      },
      {
        path: "tenants/:id/edit",
        element: <ConfigureTenant />,
      },
    ],
  },
  {
    path: "/admin",

    element: (
      <ProtectedRoute allowedRoles={["admin", "superadmin", "manager", "support", "marketing", "warehouse"]}>
        <AdminLayout /> {/* 👈 Layout wraps all children */}
      </ProtectedRoute>
    ),
    children: [
      {
        index: true,
        element: <Navigate to="dashboard" replace />,
      },
      {
        path: "dashboard", // ⛔ DO NOT use /admin/dashboard here
        element: <Dashboard />,
      },
      {
        path: "users",
        element: <ProtectedRoute requiredModule="users"><TotalUserOnWeb /></ProtectedRoute>,
      },
      {
        path: "staff",
        element: <ProtectedRoute requiredModule="users"><StaffManager /></ProtectedRoute>,
      },
      {
        path: "addProduct",
        element: <ProtectedRoute requiredModule="products"><AddFoodForm /></ProtectedRoute>
      },
      {
        path: "adminProducts",
        element: <ProtectedRoute requiredModule="products"><AdminProduct /></ProtectedRoute>
      },
      {
        path: "editProduct/:productId",
        element: <ProtectedRoute requiredModule="products"><EditProduct /></ProtectedRoute>
      },
      {
        path: "product-view/:productId",
        element: <ProtectedRoute requiredModule="products"><ProductView /></ProtectedRoute>
      },
      {
        path: "home",
        element: <HomePage />
      },
      {
        path: "categories",
        element: <ProtectedRoute requiredModule="categories"><CategoryList /></ProtectedRoute>
      },
      {
        path: "addCategory",
        element: <ProtectedRoute requiredModule="categories"><AddCategoryForm /></ProtectedRoute>
      },
      {
        path: "editCategory/:categoryId",
        element: <ProtectedRoute requiredModule="categories"><EditCategory /></ProtectedRoute>
      },
      {
        path: "viewCategory/:categoryId",
        element: <ProtectedRoute requiredModule="categories"><ViewCategory /></ProtectedRoute>
      },
      {
        path: "offers",
        element: <ProtectedRoute requiredModule="offers"><OffersList /></ProtectedRoute>,
      },
      {
        path: "coupons",
        element: <ProtectedRoute requiredModule="coupons"><CouponsList /></ProtectedRoute>,
      },
      {
        path: "returns",
        element: <ProtectedRoute requiredModule="returns"><ReturnRequestsList /></ProtectedRoute>,
      },
      {
        path: "sales-report",
        element: <ProtectedRoute requiredModule="reports"><SalesReport /></ProtectedRoute>,
      },
      { path: "orders", element: <ProtectedRoute requiredModule="orders"><AdminOrderManager /></ProtectedRoute> },
      { path: "orders/invoice/:orderId", element: <ProtectedRoute requiredModule="orders"><OrderInvoice /></ProtectedRoute> },
      { path: "shipping", element: <ProtectedRoute requiredModule="shipping"><ShiprocketManager /></ProtectedRoute> },
      { path: "shipping-analytics", element: <ProtectedRoute requiredModule="shipping"><ShippingAnalytics /></ProtectedRoute> },
      { path: "stocks", element: <ProtectedRoute requiredModule="stocks"><AdminStockManager /></ProtectedRoute> },
      { path: "PaymentDetails", element: <ProtectedRoute requiredModule="payments"><PaymentList /></ProtectedRoute> },
      {
        path: "orphaned-payments",
        element: <ProtectedRoute requiredModule="payments"><OrphanedPayments /></ProtectedRoute>
      },
      {
        path: "leads",
        element: <ProtectedRoute requiredModule="leads"><AdminOrderLeads /></ProtectedRoute>,
      },
      {
        path: "banners",
        element: <ProtectedRoute requiredModule="banners"><PromoBannerAdmin /></ProtectedRoute>
      },
      {
        path: "settings",
        element: <ProtectedRoute requiredModule="settings"><SettingsPage /></ProtectedRoute>
      }
    ],
  },
  {
    path: "/unauthorized",
    element: <Unauthorized />,
  },
  {
    path: "*",
    element: <NotFoundPage />,
  },
]);

export default router;


