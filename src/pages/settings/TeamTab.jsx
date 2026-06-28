import React from "react";
import { UserPlus } from "lucide-react";

export default function TeamTab({ admins, availableRoles = [], onAddAdmin, onTogglePermission, onUpdateRole, isSuperAdmin }) {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-base font-bold text-zinc-900">Admin Control Panel</h3>
          <p className="text-xs text-zinc-500">Provision and manage administrative access privileges.</p>
        </div>
        {isSuperAdmin && (
          <button 
            onClick={onAddAdmin}
            className="flex items-center gap-2 px-4 py-2 bg-orange-600 hover:bg-orange-700 text-white rounded-lg text-xs font-semibold shadow-sm transition cursor-pointer"
          >
            <UserPlus size={14} />
            Create Admin
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {admins.map(admin => (
          <div key={admin._id} className="bg-white rounded-xl p-5 border border-zinc-200/80 shadow-sm transition">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-lg bg-zinc-900 text-white flex items-center justify-center font-bold text-xs">
                  {admin.userName?.charAt(0).toUpperCase()}
                </div>
                <div>
                  <h4 className="text-sm font-semibold text-zinc-800">{admin.userName}</h4>
                  <p className="text-xs text-zinc-400">{admin.email}</p>
                </div>
              </div>
              {isSuperAdmin ? (
                <select
                  value={admin.roleType || 'admin'}
                  onChange={(e) => onUpdateRole(admin._id, e.target.value)}
                  className="px-2 py-1 rounded bg-emerald-50 border border-emerald-200 text-emerald-800 text-[10px] font-bold uppercase outline-none focus:ring-2 focus:ring-emerald-500/20 cursor-pointer"
                >
                  {availableRoles.map(r => (
                    <option key={r._id} value={r.name}>{r.name}</option>
                  ))}
                  {/* Fallback if roles array is empty for some reason */}
                  {availableRoles.length === 0 && (
                    <>
                      <option value="superadmin">Superadmin</option>
                      <option value="admin">Admin</option>
                    </>
                  )}
                </select>
              ) : (
                <div className="px-2 py-0.5 rounded bg-emerald-50 border border-emerald-100 text-emerald-700 text-[10px] font-medium uppercase">
                  {admin.roleType || 'Admin'}
                </div>
              )}
            </div>

            <div className="pt-4 border-t border-zinc-100">
              <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider block mb-2">Module Privileges</span>
              <div className="flex flex-wrap gap-1.5">
                {Object.entries({
                  leads: false, offers: false, banners: false, shipping: false, stocks: false, cod: false, reports: false, products: true, categories: true, orders: true, users: true, settings: false,
                  ...(admin.permissions || {})
                }).map(([key, val]) => (
                  <button 
                    key={key}
                    disabled={!isSuperAdmin}
                    onClick={() => onTogglePermission(admin._id, key, val)}
                    className={`px-2.5 py-1 rounded-md text-[10px] uppercase font-semibold transition border cursor-pointer ${
                      val 
                        ? 'bg-orange-50 border-orange-200 text-orange-700' 
                        : 'bg-zinc-50 border-zinc-200 text-zinc-400 font-normal'
                    } disabled:opacity-80 disabled:cursor-not-allowed`}
                  >
                    {key}
                  </button>
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
