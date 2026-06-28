import React, { useEffect, useState } from "react";
import SuperAdminAxios from "../../utils/SuperAdminAxios";
import { toast } from "react-toastify";
import { Users, Mail, Phone, Calendar, Search } from "lucide-react";

const GlobalUsers = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  const fetchGlobalUsers = async () => {
    try {
      setLoading(true);
      const res = await SuperAdminAxios.get("/superadmin/tenants/global/users");
      if (res.data.success) {
        setUsers(res.data.users);
      }
    } catch (err) {
      toast.error("Failed to load global users");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchGlobalUsers();
  }, []);

  const filteredUsers = users.filter(user => 
    user.userName?.toLowerCase().includes(searchTerm.toLowerCase()) || 
    user.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.tenantName?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="mb-8 flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-bold text-white tracking-tight">Global User Database</h1>
          <p className="text-gray-400 mt-1">Aggregated view of recently active users across all hosted stores.</p>
        </div>
        <div className="relative w-64">
          <input
            type="text"
            placeholder="Search users..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-white/5 backdrop-blur-md border border-white/10 rounded-xl pl-10 pr-4 py-2.5 text-sm text-white focus:outline-none focus:border-purple-500/50 focus:bg-white/10 transition-all shadow-inner"
          />
          <Search size={16} className="absolute left-3 top-3 text-gray-500" />
        </div>
      </div>

      <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl overflow-hidden shadow-xl relative group">
        <div className="absolute top-0 right-0 w-96 h-96 bg-purple-500/5 rounded-full blur-3xl pointer-events-none"></div>
        <div className="overflow-x-auto relative z-10">
          <table className="w-full text-left text-sm text-gray-400">
            <thead className="bg-white/5 text-xs uppercase font-bold text-gray-400 border-b border-white/10 tracking-wider">
              <tr>
                <th className="px-6 py-5">User</th>
                <th className="px-6 py-5">Tenant (Store)</th>
                <th className="px-6 py-5">Contact Info</th>
                <th className="px-6 py-5">Role</th>
                <th className="px-6 py-5">Joined Date</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="5" className="px-6 py-12 text-center">
                    <div className="inline-block animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-purple-500"></div>
                  </td>
                </tr>
              ) : filteredUsers.length === 0 ? (
                <tr>
                  <td colSpan="5" className="px-6 py-12 text-center text-gray-500 font-medium">No users found.</td>
                </tr>
              ) : (
                filteredUsers.map((user, idx) => (
                  <tr key={idx} className="border-b border-white/5 hover:bg-white/5 transition-all">
                    <td className="px-6 py-4 font-medium text-white flex items-center gap-4">
                      <div className="w-10 h-10 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-400 shadow-inner">
                        {user.userName?.charAt(0).toUpperCase() || <Users size={16} />}
                      </div>
                      <span className="font-bold tracking-wide text-gray-200 text-sm">{user.userName || 'Unknown User'}</span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="inline-flex items-center px-3 py-1 rounded-lg text-xs font-bold bg-purple-500/10 text-purple-400 border border-purple-500/20 shadow-sm uppercase tracking-wider">
                        {user.tenantName} <span className="opacity-50 ml-1">({user.tenantId})</span>
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-col space-y-1.5 text-xs font-medium text-gray-400">
                        {user.email && <span className="flex items-center gap-2"><Mail size={12} className="text-gray-500" /> {user.email}</span>}
                        {user.phoneNumber && <span className="flex items-center gap-2"><Phone size={12} className="text-gray-500" /> {user.phoneNumber}</span>}
                        {!user.email && !user.phoneNumber && <span className="text-gray-600">N/A</span>}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="capitalize font-bold text-xs px-2.5 py-1 rounded-lg border shadow-sm bg-white/5 border-white/10 text-gray-300">
                        {user.roleType || 'Customer'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-gray-400 flex items-center gap-2 font-medium">
                      <div className="p-1.5 bg-white/5 rounded-md border border-white/10">
                        <Calendar size={14} className="text-gray-400" />
                      </div>
                      {new Date(user.createdAt).toLocaleDateString()}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default GlobalUsers;
