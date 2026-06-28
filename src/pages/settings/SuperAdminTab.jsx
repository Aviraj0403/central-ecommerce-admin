import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Lock, ShieldAlert, CheckCircle, ChevronRight, Server, Users, Settings } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import SuperAdminAxios from '../../utils/SuperAdminAxios';
import { toast } from 'react-hot-toast';

export default function SuperAdminTab({ isSuperAdmin }) {
  const [email, setEmail] = useState('00101'); // Pre-filled with ID for maintenance
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [authenticated, setAuthenticated] = useState(isSuperAdmin || !!localStorage.getItem("superadmin"));
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      // Typically superadmin email or special ID
      // If they typed 00101, maybe they mean aviraj@example.com
      const loginEmail = email === '00101' ? 'aviraj@example.com' : email;
      const res = await SuperAdminAxios.post("/auth/signIn", { email: loginEmail, password });
      
      if (res.data?.userData?.roleType !== 'superadmin') {
          toast.error("Access denied. SuperAdmin only.");
          setLoading(false);
          return;
      }

      localStorage.setItem("superadmin", JSON.stringify(res.data.userData));
      toast.success("Welcome to the Super Admin Portal!");
      setAuthenticated(true);
      // Optional: force a reload or context update
      window.location.reload(); 
    } catch (err) {
      toast.error(err?.response?.data?.message || "Invalid Super Admin credentials");
    } finally {
      setLoading(false);
    }
  };

  if (!authenticated) {
    return (
      <div className="bg-white rounded-xl p-8 border border-zinc-200/80 shadow-sm flex flex-col items-center justify-center min-h-[400px]">
        <div className="w-16 h-16 bg-red-50 rounded-2xl flex items-center justify-center mb-4">
          <ShieldAlert className="w-8 h-8 text-red-600" />
        </div>
        <h3 className="text-xl font-bold text-zinc-900 mb-2">Restricted Access</h3>
        <p className="text-sm text-zinc-500 mb-8 text-center max-w-sm">
          This section is reserved for Super Administration and System Maintenance. Please authenticate to proceed.
        </p>

        <form onSubmit={handleLogin} className="w-full max-w-sm space-y-4">
          <div>
            <label className="block text-xs font-semibold text-zinc-700 mb-1">Super Admin ID / Email</label>
            <input 
              type="text" 
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-2 bg-zinc-50 border border-zinc-200 rounded-lg text-sm focus:outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500 transition-all"
              placeholder="e.g. 00101"
              required
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-zinc-700 mb-1">Passkey</label>
            <input 
              type="password" 
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-2 bg-zinc-50 border border-zinc-200 rounded-lg text-sm focus:outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500 transition-all"
              required
            />
          </div>
          <button 
            type="submit" 
            disabled={loading}
            className="w-full py-2.5 bg-zinc-900 hover:bg-black text-white rounded-lg text-sm font-semibold transition-colors flex items-center justify-center gap-2 mt-2"
          >
            {loading ? <Lock className="w-4 h-4 animate-pulse" /> : <Lock className="w-4 h-4" />}
            {loading ? 'Verifying...' : 'Unlock Portal'}
          </button>
        </form>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl p-6 border border-zinc-200/80 shadow-sm space-y-6">
      <div>
        <h3 className="text-lg font-bold text-zinc-900 flex items-center gap-2">
          <ShieldAlert className="w-5 h-5 text-red-600" /> Master Super Admin Console
        </h3>
        <p className="text-sm text-zinc-500 mt-1">
          You are authenticated as a Super Admin. Select an action below to manage the entire platform infrastructure.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Onboarding */}
        <div 
          onClick={() => navigate('/superadmin/tenants/new')}
          className="group cursor-pointer p-5 rounded-xl border border-zinc-200 bg-zinc-50 hover:bg-orange-50 hover:border-orange-200 transition-all"
        >
          <div className="flex items-center justify-between mb-3">
            <div className="w-10 h-10 bg-white rounded-lg shadow-sm border border-zinc-100 flex items-center justify-center">
              <Server className="w-5 h-5 text-orange-600" />
            </div>
            <ChevronRight className="w-5 h-5 text-zinc-400 group-hover:text-orange-500" />
          </div>
          <h4 className="font-semibold text-zinc-900 text-sm">Tenant Onboarding</h4>
          <p className="text-xs text-zinc-500 mt-1">Create and configure new client workspaces</p>
        </div>

        {/* Global Users */}
        <div 
          onClick={() => navigate('/superadmin/global-users')}
          className="group cursor-pointer p-5 rounded-xl border border-zinc-200 bg-zinc-50 hover:bg-blue-50 hover:border-blue-200 transition-all"
        >
          <div className="flex items-center justify-between mb-3">
            <div className="w-10 h-10 bg-white rounded-lg shadow-sm border border-zinc-100 flex items-center justify-center">
              <Users className="w-5 h-5 text-blue-600" />
            </div>
            <ChevronRight className="w-5 h-5 text-zinc-400 group-hover:text-blue-500" />
          </div>
          <h4 className="font-semibold text-zinc-900 text-sm">Global Roles & Users</h4>
          <p className="text-xs text-zinc-500 mt-1">Manage platform-wide users and assign feature roles</p>
        </div>

        {/* System Config */}
        <div 
          onClick={() => navigate('/superadmin/health')}
          className="group cursor-pointer p-5 rounded-xl border border-zinc-200 bg-zinc-50 hover:bg-emerald-50 hover:border-emerald-200 transition-all"
        >
          <div className="flex items-center justify-between mb-3">
            <div className="w-10 h-10 bg-white rounded-lg shadow-sm border border-zinc-100 flex items-center justify-center">
              <Settings className="w-5 h-5 text-emerald-600" />
            </div>
            <ChevronRight className="w-5 h-5 text-zinc-400 group-hover:text-emerald-500" />
          </div>
          <h4 className="font-semibold text-zinc-900 text-sm">System Health & Config</h4>
          <p className="text-xs text-zinc-500 mt-1">Check backend synchronization and API status</p>
        </div>
      </div>
    </div>
  );
}
