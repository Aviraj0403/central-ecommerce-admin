import React, { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { toast, ToastContainer } from 'react-toastify'; 
import 'react-toastify/dist/ReactToastify.css'; 

import {
  Mail,
  Lock,
  Eye,
  EyeOff,
  LogIn,
  AlertCircle,
  CheckCircle2,
  Loader2,
  Building2,
  Fingerprint
} from "lucide-react";
import { useAuth } from "../../context/AuthContext"; 

export default function Signin() {
  const [projectId, setProjectId] = useState("");
  const [usernameOrEmail, setUsernameOrEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPwd, setShowPwd] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState(null);
  const navigate = useNavigate();

  const { login } = useAuth(); 

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage(null);

    if (!usernameOrEmail.trim() || !password.trim()) {
      setMessage({ type: "error", text: "Email and password are required." });
      return;
    }

    setIsLoading(true);

    const credentials = {
      email: usernameOrEmail,
      userName: usernameOrEmail,
      password,
      // Pass the Project ID header in the API config via SuperAdminAxios if needed
    };

    // If they typed a projectId, set it in localStorage so SuperAdminAxios interceptor can attach it
    if (projectId.trim()) {
      localStorage.setItem("active_tenant_id", projectId.trim());
    } else {
      localStorage.removeItem("active_tenant_id"); // Default to Master DB
    }

    const response = await login(credentials);

    if (response.success) {
      if (response.user?.roleType === 'superadmin') {
        localStorage.setItem("superadmin", JSON.stringify(response.user));
      }
      setMessage({ type: "success", text: "Authentication successful." });
      toast.success(response.user?.roleType === 'superadmin' ? 'Welcome back, SuperAdmin!' : 'Welcome to your Business Dashboard!');
      setTimeout(() => navigate("/admin/dashboard"), 1000); 
    } else {
      setMessage({
        type: "error",
        text: response.message || "Invalid credentials or project ID.",
      });
    }

    setIsLoading(false);
  };

  return (
    <div
      className="flex min-h-screen bg-cover bg-center p-6 sm:p-12 xl:p-24 relative overflow-hidden bg-gray-950 items-center justify-start"
      style={{
        backgroundImage: `url(/ecommerce_crm_bg.png)`,
        backgroundBlendMode: 'overlay',
        backgroundColor: 'rgba(3, 7, 18, 0.4)' // slight tint to make it readable
      }}
    >
      <div className="absolute inset-0 bg-gradient-to-r from-gray-950/90 via-gray-950/50 to-transparent pointer-events-none z-0"></div>
      
      {/* Form Area - Aligned to the Left */}
      <div className="w-full max-w-md bg-gray-900/90 backdrop-blur-xl rounded-2xl p-8 shadow-2xl border border-gray-700/50 relative z-10 space-y-7 ml-0 md:ml-12 lg:ml-24">
        <div className="text-left space-y-2">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-br from-purple-600 to-blue-600 shadow-lg shadow-purple-900/50 mb-3 text-white">
            <Building2 className="w-7 h-7" />
          </div>
          <h1 className="text-3xl font-bold text-white tracking-tight">Welcome Back</h1>
          <p className="text-sm text-gray-400">Sign in to JD Infotech Solutions CRM</p>
        </div>

        {/* Alert messages */}
        {message && (
          <div
            className={`flex items-start gap-3 p-4 rounded-xl text-sm font-medium border ${
              message.type === "error"
                ? "bg-red-950/50 border-red-900/50 text-red-400"
                : "bg-emerald-950/50 border-emerald-900/50 text-emerald-400"
            }`}
          >
            {message.type === "error" ? (
              <AlertCircle size={18} className="shrink-0 mt-0.5" />
            ) : (
              <CheckCircle2 size={18} className="shrink-0 mt-0.5" />
            )}
            <span>{message.text}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Project ID Field */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider block">Project ID (Optional)</label>
            <div className="relative">
              <input
                type="text"
                value={projectId}
                onChange={(e) => setProjectId(e.target.value)}
                className="w-full rounded-xl border border-gray-700/80 pl-4 pr-10 py-3.5 text-sm focus:border-purple-500 focus:ring-1 focus:ring-purple-500 outline-none transition text-white font-medium bg-gray-950/50"
                placeholder="e.g. 00101 (Leave blank for Superadmin)"
              />
              <Fingerprint className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-500" size={18} />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider block">Email Address</label>
            <div className="relative">
              <input
                type="text"
                value={usernameOrEmail}
                onChange={(e) => setUsernameOrEmail(e.target.value)}
                className="w-full rounded-xl border border-gray-700/80 pl-4 pr-10 py-3.5 text-sm focus:border-purple-500 focus:ring-1 focus:ring-purple-500 outline-none transition text-white font-medium bg-gray-950/50"
                placeholder="admin@yourstore.com"
              />
              <Mail className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-500" size={18} />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider block">Password</label>
            <div className="relative">
              <input
                type={showPwd ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full rounded-xl border border-gray-700/80 pl-4 pr-10 py-3.5 text-sm focus:border-purple-500 focus:ring-1 focus:ring-purple-500 outline-none transition text-white font-medium bg-gray-950/50"
                placeholder="••••••••"
              />
              <button
                type="button"
                onClick={() => setShowPwd((prev) => !prev)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300 transition-colors"
              >
                {showPwd ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-500 hover:to-blue-500 text-white py-3.5 rounded-xl text-sm font-bold shadow-lg shadow-purple-900/30 transition-all flex items-center justify-center gap-2 mt-4"
          >
            {isLoading ? (
              <Loader2 className="animate-spin" size={18} />
            ) : (
              <LogIn size={18} />
            )}
            Authenticate Session
          </button>
        </form>
      </div>

      <ToastContainer theme="dark" /> 
    </div>
  );
}
