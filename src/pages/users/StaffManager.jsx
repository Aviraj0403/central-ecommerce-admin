import React, { useEffect, useState } from "react";
import Axios from "../../utils/Axios";
import { toast } from "react-toastify";

const ROLES = ["admin", "manager", "support", "marketing", "warehouse", "deliveryBoy", "customer"];

const ROLE_COLORS = {
  superadmin: "bg-red-100 text-red-700",
  admin: "bg-purple-100 text-purple-700",
  manager: "bg-blue-100 text-blue-700",
  support: "bg-cyan-100 text-cyan-700",
  marketing: "bg-orange-100 text-orange-700",
  warehouse: "bg-yellow-100 text-yellow-700",
  deliveryBoy: "bg-green-100 text-green-700",
  customer: "bg-gray-100 text-gray-600",
};

const PERMISSIONS_LIST = [
  { key: "leads", label: "Leads", group: "CRM" },
  { key: "offers", label: "Offers", group: "Content" },
  { key: "banners", label: "Banners", group: "Content" },
  { key: "coupons", label: "Coupons", group: "Content" },
  { key: "shipping", label: "Shipping", group: "Ops" },
  { key: "stocks", label: "Stocks", group: "Ops" },
  { key: "cod", label: "COD", group: "Ops" },
  { key: "returns", label: "Returns", group: "Ops" },
  { key: "reports", label: "Reports", group: "Finance" },
  { key: "payments", label: "Payments", group: "Finance" },
  { key: "refunds", label: "Refunds", group: "Finance" },
  { key: "products", label: "Products", group: "Catalog" },
  { key: "categories", label: "Categories", group: "Catalog" },
  { key: "orders", label: "Orders", group: "CRM" },
  { key: "users", label: "Users", group: "CRM" },
  { key: "settings", label: "Settings", group: "System" },
  { key: "systemSettings", label: "System Settings", group: "System" },
];

const StaffManager = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editUser, setEditUser] = useState(null);
  const [permissions, setPermissions] = useState({});
  const [roleFilter, setRoleFilter] = useState("all");

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const res = await Axios.get("/admin/users");
      setUsers(res.data?.users || []);
    } catch {
      toast.error("Failed to load users");
    } finally {
      setLoading(false);
    }
  };

  const openEdit = (user) => {
    setEditUser(user);
    setPermissions({ ...user.permissions });
  };

  const savePermissions = async () => {
    try {
      await Axios.patch(`/admin/users/${editUser._id}/permissions`, { permissions, roleType: editUser.roleType });
      toast.success("Permissions updated");
      setEditUser(null);
      fetchUsers();
    } catch {
      toast.error("Update failed");
    }
  };

  const togglePermission = (key) => {
    setPermissions(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const filteredUsers = roleFilter === "all" ? users : users.filter(u => u.roleType === roleFilter);

  useEffect(() => { fetchUsers(); }, []);

  // Group permissions for UI
  const groups = [...new Set(PERMISSIONS_LIST.map(p => p.group))];

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-800 dark:text-white">Staff & Users</h1>
          <p className="text-sm text-gray-500">Manage roles and permissions for your team</p>
        </div>
        <select value={roleFilter} onChange={e => setRoleFilter(e.target.value)} className="border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 text-sm dark:bg-gray-700 dark:text-white">
          <option value="all">All Roles</option>
          {ROLES.map(r => <option key={r} value={r}>{r}</option>)}
        </select>
      </div>

      {/* Edit Permissions Modal */}
      {editUser && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 overflow-y-auto">
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-full max-w-2xl p-6 my-8">
            <h2 className="text-lg font-bold mb-1">Edit Permissions</h2>
            <p className="text-sm text-gray-500 mb-4">{editUser.userName} — <span className="font-medium capitalize">{editUser.roleType}</span></p>

            <div className="mb-4">
              <label className="block text-sm font-medium mb-1">Role</label>
              <select value={editUser.roleType} onChange={e => setEditUser({ ...editUser, roleType: e.target.value })} className="border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 text-sm dark:bg-gray-700 dark:text-white w-48">
                {ROLES.map(r => <option key={r} value={r}>{r}</option>)}
              </select>
            </div>

            <div className="space-y-4">
              {groups.map(group => (
                <div key={group}>
                  <p className="text-xs uppercase font-semibold text-gray-400 mb-2">{group}</p>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                    {PERMISSIONS_LIST.filter(p => p.group === group).map(p => (
                      <label key={p.key} className="flex items-center gap-2 cursor-pointer p-2 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700">
                        <input type="checkbox" checked={!!permissions[p.key]} onChange={() => togglePermission(p.key)} className="w-4 h-4 rounded accent-purple-600" />
                        <span className="text-sm">{p.label}</span>
                      </label>
                    ))}
                  </div>
                </div>
              ))}
            </div>

            <div className="flex gap-3 mt-6">
              <button onClick={savePermissions} className="flex-1 bg-purple-600 hover:bg-purple-700 text-white py-2 rounded-lg font-medium text-sm">Save Changes</button>
              <button onClick={() => setEditUser(null)} className="flex-1 bg-gray-200 dark:bg-gray-700 py-2 rounded-lg font-medium text-sm">Cancel</button>
            </div>
          </div>
        </div>
      )}

      <div className="bg-white dark:bg-gray-800 rounded-xl shadow overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 dark:bg-gray-700 text-gray-600 dark:text-gray-300 uppercase text-xs">
            <tr>
              <th className="px-4 py-3 text-left">User</th>
              <th className="px-4 py-3 text-left">Phone / Email</th>
              <th className="px-4 py-3 text-left">Role</th>
              <th className="px-4 py-3 text-left">Wallet</th>
              <th className="px-4 py-3 text-left">Joined</th>
              <th className="px-4 py-3 text-left">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
            {loading ? (
              <tr><td colSpan={6} className="text-center py-8 text-gray-400">Loading...</td></tr>
            ) : filteredUsers.length === 0 ? (
              <tr><td colSpan={6} className="text-center py-8 text-gray-400">No users found</td></tr>
            ) : filteredUsers.map(u => (
              <tr key={u._id} className="hover:bg-gray-50 dark:hover:bg-gray-750">
                <td className="px-4 py-3">
                  <div className="font-medium">{u.userName}</div>
                </td>
                <td className="px-4 py-3 text-gray-500">{u.phoneNumber || u.email || '—'}</td>
                <td className="px-4 py-3">
                  <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${ROLE_COLORS[u.roleType] || 'bg-gray-100 text-gray-600'}`}>
                    {u.roleType}
                  </span>
                </td>
                <td className="px-4 py-3 font-medium text-green-600">₹{u.walletBalance || 0}</td>
                <td className="px-4 py-3 text-gray-500">{new Date(u.createdAt).toLocaleDateString()}</td>
                <td className="px-4 py-3">
                  <button onClick={() => openEdit(u)} className="text-xs bg-purple-100 text-purple-700 hover:bg-purple-200 px-3 py-1 rounded">
                    Edit Role
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default StaffManager;
