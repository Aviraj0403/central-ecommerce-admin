import React from "react";
import { X, RefreshCw } from "lucide-react";

export default function CreateAdminModal({ show, onClose, newAdmin, setNewAdmin, onSubmit, saving, availableRoles = [] }) {
  if (!show) return null;

  return (
    <div className="fixed inset-0 bg-zinc-900/40 backdrop-blur-sm flex items-center justify-center z-[100] p-4">
      <div className="bg-white w-full max-w-lg rounded-xl shadow-xl border border-zinc-200/80 overflow-hidden transform animate-in zoom-in-95 duration-200">
        <div className="bg-zinc-900 p-6 text-white relative">
          <button onClick={onClose} className="absolute top-5 right-5 p-1.5 bg-white/10 hover:bg-white/20 rounded-lg transition cursor-pointer">
            <X size={16} />
          </button>
          <h2 className="text-base font-bold tracking-tight">Provision Admin Identity</h2>
          <p className="text-zinc-400 text-[10px] font-bold uppercase tracking-wider mt-0.5">New Administrative Account</p>
        </div>
        
        <form onSubmit={onSubmit} className="p-6 space-y-5 max-h-[70vh] overflow-y-auto custom-scrollbar">
          <div className="grid grid-cols-1 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-zinc-500">Username</label>
              <input 
                required 
                value={newAdmin.userName} 
                onChange={e => setNewAdmin({...newAdmin, userName: e.target.value})} 
                className="w-full px-3 py-2 rounded-lg border border-zinc-200 text-sm focus:border-orange-600 focus:ring-1 focus:ring-orange-600 outline-none transition text-zinc-800 font-medium" 
                placeholder="username" 
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-zinc-500">Contact Email</label>
              <input 
                required 
                type="email" 
                value={newAdmin.email} 
                onChange={e => setNewAdmin({...newAdmin, email: e.target.value})} 
                className="w-full px-3 py-2 rounded-lg border border-zinc-200 text-sm focus:border-orange-600 focus:ring-1 focus:ring-orange-600 outline-none transition text-zinc-800 font-medium" 
                placeholder="email@domain.com" 
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-zinc-500">Password</label>
                <input 
                  required 
                  type="password" 
                  value={newAdmin.password} 
                  onChange={e => setNewAdmin({...newAdmin, password: e.target.value})} 
                  className="w-full px-3 py-2 rounded-lg border border-zinc-200 text-sm focus:border-orange-600 focus:ring-1 focus:ring-orange-600 outline-none transition text-zinc-800 font-medium" 
                  placeholder="••••••••" 
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-zinc-500">Phone Number</label>
                <input 
                  value={newAdmin.phoneNumber} 
                  onChange={e => setNewAdmin({...newAdmin, phoneNumber: e.target.value})} 
                  className="w-full px-3 py-2 rounded-lg border border-zinc-200 text-sm focus:border-orange-600 focus:ring-1 focus:ring-orange-600 outline-none transition text-zinc-800 font-medium" 
                  placeholder="+91..." 
                />
              </div>
            </div>

            <div className="space-y-1.5 pt-2">
              <label className="text-xs font-semibold text-zinc-500">Assign Role</label>
              <select 
                value={newAdmin.roleType || 'admin'} 
                onChange={e => setNewAdmin({...newAdmin, roleType: e.target.value})} 
                className="w-full px-3 py-2 rounded-lg border border-zinc-200 text-sm focus:border-orange-600 focus:ring-1 focus:ring-orange-600 outline-none transition text-zinc-800 font-medium cursor-pointer"
              >
                <option value="admin" disabled>Select a role...</option>
                {availableRoles.map(r => (
                  <option key={r._id} value={r.name}>{r.name}</option>
                ))}
              </select>
            </div>
          </div>
          <div className="space-y-3 pt-4 border-t border-zinc-100">
            <label className="text-xs font-semibold text-zinc-500 block">Module Permissions Matrix</label>
            <div className="grid grid-cols-2 gap-2">
              {Object.keys(newAdmin.permissions).map(mod => (
                <div key={mod} className="flex items-center justify-between p-2 rounded-lg bg-zinc-50 border border-zinc-200/60">
                  <span className="text-[10px] font-semibold text-zinc-600 uppercase tracking-wider">{mod}</span>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input 
                      type="checkbox" 
                      checked={newAdmin.permissions[mod]}
                      onChange={(e) => setNewAdmin({
                        ...newAdmin, 
                        permissions: { ...newAdmin.permissions, [mod]: e.target.checked }
                      })}
                      className="sr-only peer"
                    />
                    <div className="w-8 h-4 bg-zinc-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-zinc-300 after:border after:rounded-full after:h-3 after:w-3 after:transition-all peer-checked:bg-orange-600"></div>
                  </label>
                </div>
              ))}
            </div>
          </div>

          <button 
            type="submit" 
            disabled={saving} 
            className="w-full bg-orange-600 hover:bg-orange-700 text-white rounded-lg py-2.5 text-xs font-semibold shadow-sm transition disabled:opacity-50 cursor-pointer flex items-center justify-center gap-2"
          >
            {saving ? <RefreshCw className="animate-spin" size={14} /> : null}
            {saving ? "Creating Admin..." : "Finalize Admin Creation"}
          </button>
        </form>
      </div>
    </div>
  );
}
