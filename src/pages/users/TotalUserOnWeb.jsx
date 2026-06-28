import React, { useEffect, useState, useCallback } from "react";
import { getAllCustomers, getAllAdmins, getAllDeliveryBoys, getAllUsers, getUserDetails } from "../../services/authApi";
import { FaUserCircle, FaGoogle, FaEdit, FaTrashAlt, FaEye, FaCheckCircle, FaTimesCircle } from "react-icons/fa";
import { toast } from "react-hot-toast";
import { ChevronLeft, ChevronRight } from "lucide-react";

const TotalUserOnWeb = () => {
  const [users, setUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [role, setRole] = useState("regular");
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const limit = 10; // Users per page

  const fetchUsers = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      let response;
      if (role === "regular") {
        response = await getAllUsers(page, limit, search);
        // response = await getAllCustomers(page, limit, search);
      } else if (role === "admin") {
        response = await getAllAdmins(page, limit, search);
      } else if (role === "deliveryBoy") {
        response = await getAllDeliveryBoys(page, limit, search);
      }
      // } else if (role === "regular") {
      //   response = await getAllUsers(page, limit, search);
      // }
      setUsers(response?.data || []);
      setTotalPages(response?.pagination?.totalPages || 1);
    } catch (err) {
      setError("Failed to fetch users");
      toast.error("Failed to fetch users");
    } finally {
      setLoading(false);
    }
  }, [role, page, search]);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  const handleUserClick = async (userId) => {
    setLoading(true);
    try {
      const data = await getUserDetails(userId);
      setSelectedUser(data.data);
    } catch (err) {
      toast.error("Failed to fetch user details");
    } finally {
      setLoading(false);
    }
  };

  const handleRoleChange = (e) => {
    setRole(e.target.value);
    setPage(1);
    setSearch("");
  };

  const handleSearchChange = (e) => {
    setSearch(e.target.value);
    setPage(1);
  };

  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setPage(newPage);
    }
  };

  // Placeholder for edit, delete, verify actions
  const handleEditUser = (userId) => {
    toast.info(`Edit user ${userId} (implement functionality)`);
  };

  const handleDeleteUser = (userId) => {
    if (window.confirm("Are you sure you want to delete this user?")) {
      toast.success(`User ${userId} deleted (implement functionality)`);
      fetchUsers();
    }
  };

  const handleVerifyUser = (userId) => {
    toast.success(`User ${userId} verified (implement functionality)`);
    fetchUsers();
  };

  return (
    <div className="p-6 max-w-7xl mx-auto bg-white rounded-xl border border-zinc-200/60 shadow-sm">
      <div className="flex flex-wrap items-center justify-between mb-6 gap-4">
        <h4 className="text-xl font-bold tracking-tight text-zinc-900 uppercase">User Management</h4>
        <div className="flex flex-wrap gap-2 items-center">
          <input
            type="text"
            placeholder="Search users..."
            value={search}
            onChange={handleSearchChange}
            className="border border-zinc-200 rounded-lg px-3 py-2 text-zinc-700 focus:outline-none focus:ring-2 focus:ring-orange-400 text-xs"
          />
          <select
            value={role}
            onChange={handleRoleChange}
            className="border border-zinc-200 rounded-lg px-3 py-2 text-zinc-700 focus:outline-none focus:ring-2 focus:ring-orange-400 text-xs cursor-pointer"
          >
            <option value="regular">Customers</option>
            <option value="admin">Admins</option>
            <option value="deliveryBoy">Delivery Boys</option>
          </select>
        </div>
      </div>

      {error && <p className="text-red-600 text-center mb-4 text-xs font-semibold">{error}</p>}

      {loading ? (
        <div className="text-center text-gray-500 py-20">Loading users...</div>
      ) : (
        <>
          {/* Desktop Table */}
          <div className="hidden md:block overflow-x-auto rounded-xl border border-zinc-200/60 shadow-sm bg-white">
            <table className="min-w-full bg-white">
              <thead className="bg-gradient-to-r from-orange-50 to-orange-100/40 border-b border-orange-200/60">
                <tr>
                  {["Name", "Email", "Phone", "Role", "Verified", "Actions"].map((label) => (
                    <th
                       key={label}
                       className="px-6 py-3.5 text-left text-[10px] font-bold text-orange-950/80 uppercase tracking-wider"
                    >
                      {label}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-100">
                {users.length === 0 ? (
                  <tr>
                    <td colSpan="6" className="text-center py-6 text-zinc-500">
                      No users found.
                    </td>
                  </tr>
                ) : (
                  users.map((user, idx) => (
                    <tr
                      key={user._id}
                      className={`hover:bg-orange-50/30 transition-colors ${idx % 2 === 0 ? "bg-white" : "bg-zinc-50/10"}`}
                    >
                      <td className="px-6 py-4 text-xs font-semibold text-zinc-900 flex items-center space-x-2">
                        <FaUserCircle className="text-zinc-400 text-base" />
                        <span>{user.userName}</span>
                        {user.firebaseUid && <FaGoogle className="text-blue-500" title="Google Account" />}
                      </td>
                      <td className="px-6 py-4 text-xs text-zinc-600">{user.email}</td>
                      <td className="px-6 py-4 text-sm text-gray-900">{user.phoneNumber || "N/A"}</td>
                      <td className="px-6 py-4 text-sm text-gray-900">{user.roleType}</td>
                      <td className="px-6 py-4 text-sm">
                        <span
                          className={`px-3 py-1 rounded-full text-xs font-semibold shadow-sm ${
                            user.isVerified
                              ? "bg-green-100 text-green-600 border border-green-200"
                              : "bg-red-100 text-red-600 border border-red-200"
                          }`}
                        >
                          {user.isVerified ? "Verified" : "Not Verified"}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm flex space-x-4 justify-center">
                        <button
                          onClick={() => handleUserClick(user._id)}
                          className="text-gray-600 hover:text-gray-800 transition transform hover:scale-110"
                        >
                          <FaEye size={18} />
                        </button>
                        <button
                          onClick={() => handleEditUser(user._id)}
                          className="text-blue-600 hover:text-blue-800 transition transform hover:scale-110"
                        >
                          <FaEdit size={18} />
                        </button>
                        <button
                          onClick={() => handleDeleteUser(user._id)}
                          className="text-red-600 hover:text-red-800 transition transform hover:scale-110"
                        >
                          <FaTrashAlt size={18} />
                        </button>
                        {!user.isVerified && (
                          <button
                            onClick={() => handleVerifyUser(user._id)}
                            className="text-green-600 hover:text-green-800 transition transform hover:scale-110"
                          >
                            <FaCheckCircle size={18} />
                          </button>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Mobile View */}
          <div className="block md:hidden">
            {users.length === 0 ? (
              <p className="text-center py-4 text-gray-600">No users found.</p>
            ) : (
              users.map((user) => (
                <div key={user._id} className="p-4 mb-4 border border-gray-200 rounded-lg shadow-md">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-2">
                        <FaUserCircle className="text-gray-500 text-xl" />
                        <p className="text-lg font-semibold text-gray-900">{user.userName}</p>
                        {user.firebaseUid && <FaGoogle className="text-blue-500" />}
                      </div>
                      <p className="text-sm text-gray-600">Email: {user.email}</p>
                      <p className="text-sm text-gray-600">Phone: {user.phoneNumber || "N/A"}</p>
                      <p className="text-sm text-gray-600">Role: {user.roleType}</p>
                      <span
                        className={`mt-2 inline-block px-3 py-1 rounded-full text-xs font-semibold shadow-sm ${
                          user.isVerified
                            ? "bg-green-100 text-green-600 border border-green-200"
                            : "bg-red-100 text-red-600 border border-red-200"
                        }`}
                      >
                        {user.isVerified ? "Verified" : "Not Verified"}
                      </span>
                    </div>
                    <div className="flex flex-col items-end space-y-2">
                      <div className="flex space-x-3">
                        <button
                          onClick={() => handleUserClick(user._id)}
                          className="text-gray-600 hover:text-gray-800 transition transform hover:scale-110"
                        >
                          <FaEye size={18} />
                        </button>
                        <button
                          onClick={() => handleEditUser(user._id)}
                          className="text-blue-600 hover:text-blue-800 transition transform hover:scale-110"
                        >
                          <FaEdit size={18} />
                        </button>
                        <button
                          onClick={() => handleDeleteUser(user._id)}
                          className="text-red-600 hover:text-red-800 transition transform hover:scale-110"
                        >
                          <FaTrashAlt size={18} />
                        </button>
                        {!user.isVerified && (
                          <button
                            onClick={() => handleVerifyUser(user._id)}
                            className="text-green-600 hover:text-green-800 transition transform hover:scale-110"
                          >
                            <FaCheckCircle size={18} />
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="mt-4 flex items-center justify-between">
              <button
                disabled={page <= 1}
                onClick={() => handlePageChange(page - 1)}
                className="px-4 py-2 bg-gray-300 rounded disabled:opacity-50"
              >
                <ChevronLeft size={20} />
              </button>
              <span>Page {page} of {totalPages}</span>
              <button
                disabled={page >= totalPages}
                onClick={() => handlePageChange(page + 1)}
                className="px-4 py-2 bg-gray-300 rounded disabled:opacity-50"
              >
                <ChevronRight size={20} />
              </button>
            </div>
          )}
        </>
      )}

      {/* User Details Modal */}
      {selectedUser && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4 shadow-xl">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-semibold text-gray-800">User Details</h3>
              <button
                onClick={() => setSelectedUser(null)}
                className="text-gray-600 hover:text-gray-800 transition transform hover:scale-110"
              >
                <FaTimesCircle size={20} />
              </button>
            </div>
            <div className="space-y-4 text-sm text-gray-700">
              <div className="flex items-center space-x-2">
                <FaUserCircle className="text-gray-500 text-xl" />
                <p className="font-medium">Name: {selectedUser.userName}</p>
                {selectedUser.firebaseUid && <FaGoogle className="text-blue-500" />}
              </div>
              <p>Email: {selectedUser.email}</p>
              <p>Phone: {selectedUser.phoneNumber || "N/A"}</p>
              <p>Role: {selectedUser.roleType}</p>
              <span
                className={`inline-block px-3 py-1 rounded-full text-xs font-semibold shadow-sm ${
                  selectedUser.isVerified
                    ? "bg-green-100 text-green-600 border border-green-200"
                    : "bg-red-100 text-red-600 border border-red-200"
                }`}
              >
                {selectedUser.isVerified ? "Verified" : "Not Verified"}
              </span>
            </div>
            <div className="mt-6 flex justify-end gap-2">
              <button
                onClick={() => handleEditUser(selectedUser._id)}
                className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
              >
                Edit
              </button>
              <button
                onClick={() => setSelectedUser(null)}
                className="px-4 py-2 bg-gray-300 text-gray-800 rounded-md hover:bg-gray-400"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TotalUserOnWeb;