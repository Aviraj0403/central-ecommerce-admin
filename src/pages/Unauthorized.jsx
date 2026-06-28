import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ShieldAlert, ArrowLeft } from "lucide-react";

export default function Unauthorized() {
  const navigate = useNavigate();
  const [countdown, setCountdown] = useState(5);

  useEffect(() => {
    const timer = setInterval(() => {
      setCountdown((prev) => prev - 1);
    }, 1000);

    const redirectTimer = setTimeout(() => {
      navigate("/admin/dashboard", { replace: true });
    }, 5000);

    return () => {
      clearInterval(timer);
      clearTimeout(redirectTimer);
    };
  }, [navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-zinc-50 relative overflow-hidden font-sans">
      {/* Dynamic Background Elements */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-orange-500/10 rounded-full blur-[100px] animate-pulse"></div>
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-rose-500/10 rounded-full blur-[100px] animate-pulse" style={{ animationDelay: '1s' }}></div>
      
      <div className="relative z-10 w-full max-w-md p-8">
        <div className="bg-white/80 backdrop-blur-xl rounded-3xl shadow-xl border border-white p-8 text-center transition-all transform hover:scale-[1.02] duration-300">
          <div className="mx-auto w-24 h-24 bg-rose-50 rounded-full flex items-center justify-center mb-6 shadow-inner relative">
            <div className="absolute inset-0 bg-rose-500/20 rounded-full animate-ping"></div>
            <ShieldAlert size={48} className="text-rose-500 relative z-10" />
          </div>
          
          <h1 className="text-3xl font-extrabold text-zinc-900 tracking-tight mb-2">Access Denied</h1>
          <p className="text-zinc-500 text-sm mb-8 leading-relaxed font-medium">
            You don't have the required administrative privileges to view this module. Please contact your Super Admin for access.
          </p>

          <div className="space-y-4">
            <button
              onClick={() => navigate("/admin/dashboard", { replace: true })}
              className="w-full flex items-center justify-center gap-2 bg-zinc-900 hover:bg-zinc-800 text-white font-semibold py-3.5 px-6 rounded-xl transition-all duration-200 shadow-md hover:shadow-lg active:scale-95 group"
            >
              <ArrowLeft size={18} className="group-hover:-translate-x-1 transition-transform" />
              Return to Dashboard
            </button>
            
            <p className="text-xs text-zinc-400 font-semibold uppercase tracking-wider">
              Redirecting automatically in <span className="text-orange-500 font-bold">{countdown}s</span>...
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
