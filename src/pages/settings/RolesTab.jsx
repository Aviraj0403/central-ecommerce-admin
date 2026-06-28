import React, { useState, useEffect } from "react";
import { Plus, Trash2, Edit2, ShieldAlert } from "lucide-react";
import { getRoles, createRole, updateRole, deleteRole } from "../../services/roleApi";
import { toast } from "react-hot-toast";

export default function RolesTab() {
  const [roles, setRoles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({
    name: "",
    description: "",
    permissions: {
      leads: false, offers: false, banners: false, shipping: false, stocks: false, cod: false, reports: false, products: false, categories: false, orders: false, users: false, settings: false
    }
  });

  const fetchAllRoles = async () => {
    try {
      setLoading(true);
      const res = await getRoles();
      if (res.success) {
        setRoles(res.roles || []);
      }
    } catch (err) {
      toast.error("Failed to load roles");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAllRoles();
  }, []);

  const handleOpenModal = (role = null) => {
    if (role) {
      setForm({ ...role });
      setIsEditing(role._id);
    } else {
      setForm({
        name: "",
        description: "",
        permissions: {
          leads: false, offers: false, banners: false, shipping: false, stocks: false, cod: false, reports: false, products: false, categories: false, orders: false, users: false, settings: false
        }
      });
      setIsEditing(null);
    }
    setShowModal(true);
  };

  const handleTogglePermission = (key) => {
    setForm(p => ({
      ...p,
      permissions: {
        ...p.permissions,
        [key]: !p.permissions[key]
      }
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name) return toast.error("Role name is required");
    
    try {
      if (isEditing) {
        await updateRole(isEditing, form);
        toast.success("Role updated successfully!");
      } else {
        await createRole(form);
        toast.success("Role created successfully!");
      }
      setShowModal(false);
      fetchAllRoles();
    } catch (err) {
      toast.error(err.message || "Operation failed");
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this role?")) return;
    try {
      await deleteRole(id);
      toast.success("Role deleted");
      fetchAllRoles();
    } catch (err) {
      toast.error(err.message || "Failed to delete role");
    }
  };

  if (loading) return <div className="text-zinc-500 text-sm">Loading roles...</div>;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-base font-bold text-zinc-900">Custom Roles Management</h3>
          <p className="text-xs text-zinc-500">Create roles with specific module access</p>
        </div>
        <button onClick={() => handleOpenModal()} className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-semibold shadow-sm transition">
          <Plus size={14} /> Create Role
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {roles.map(role => (
          <div key={role._id} className="bg-white rounded-xl p-5 border border-zinc-200/80 shadow-sm relative group transition">
            <div className="flex items-center justify-between mb-3">
              <div>
                <h4 className="text-sm font-bold text-zinc-800 capitalize flex items-center gap-2">
                  {role.name}
                  {role.isSystem && <span className="bg-zinc-100 text-zinc-500 text-[9px] px-1.5 py-0.5 rounded-md font-bold uppercase tracking-wider">System Role</span>}
                </h4>
                <p className="text-[11px] text-zinc-500 mt-0.5">{role.description || "No description provided."}</p>
              </div>
              {!role.isSystem && (
                <div className="flex gap-2">
                  <button onClick={() => handleOpenModal(role)} className="p-1.5 text-zinc-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-md transition">
                    <Edit2 size={14} />
                  </button>
                  <button onClick={() => handleDelete(role._id)} className="p-1.5 text-zinc-400 hover:text-red-600 hover:bg-red-50 rounded-md transition">
                    <Trash2 size={14} />
                  </button>
                </div>
              )}
            </div>
            
            <div className="flex flex-wrap gap-1.5">
              {Object.entries(role.permissions || {}).map(([key, val]) => val && (
                <span key={key} className="px-2 py-0.5 rounded bg-indigo-50 border border-indigo-100 text-indigo-700 text-[10px] font-bold uppercase tracking-wider">
                  {key}
                </span>
              ))}
            </div>
          </div>
        ))}
      </div>

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden">
            <div className="p-5 border-b border-zinc-100 flex items-center justify-between">
              <h3 className="font-bold text-zinc-900">{isEditing ? 'Edit Role' : 'Create New Role'}</h3>
              <button onClick={() => setShowModal(false)} className="text-zinc-400 hover:text-zinc-600 text-sm font-medium">Close</button>
            </div>
            <form onSubmit={handleSubmit} className="p-5 space-y-5">
              <div>
                <label className="block text-[11px] font-bold text-zinc-500 uppercase tracking-wider mb-1.5">Role Name</label>
                <input type="text" required value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))} className="w-full bg-zinc-50 border border-zinc-200 text-zinc-900 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500" placeholder="e.g. Intern, Marketing..." />
              </div>
              <div>
                <label className="block text-[11px] font-bold text-zinc-500 uppercase tracking-wider mb-1.5">Description (Optional)</label>
                <input type="text" value={form.description} onChange={e => setForm(p => ({ ...p, description: e.target.value }))} className="w-full bg-zinc-50 border border-zinc-200 text-zinc-900 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500" placeholder="Role purpose..." />
              </div>
              <div>
                <label className="block text-[11px] font-bold text-zinc-500 uppercase tracking-wider mb-3">Module Access</label>
                <div className="grid grid-cols-2 gap-2">
                  {Object.entries(form.permissions).map(([key, val]) => (
                    <label key={key} className="flex items-center gap-2 p-2 rounded-lg border cursor-pointer transition-colors bg-zinc-50 hover:bg-zinc-100 border-zinc-200">
                      <input type="checkbox" checked={val} onChange={() => handleTogglePermission(key)} className="rounded text-indigo-600 focus:ring-indigo-500 border-zinc-300 w-4 h-4 cursor-pointer" />
                      <span className="text-xs font-semibold text-zinc-700 capitalize">{key}</span>
                    </label>
                  ))}
                </div>
              </div>
              <button type="submit" className="w-full bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl py-3 text-sm font-bold shadow-md shadow-indigo-600/20 transition-all">
                {isEditing ? 'Save Changes' : 'Create Role'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
