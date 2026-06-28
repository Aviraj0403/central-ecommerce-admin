import React, { useEffect, useState } from "react";
import Axios from "../../utils/Axios";
import { toast } from "react-toastify";

const STATUS_COLORS = {
  Pending: "bg-yellow-100 text-yellow-700",
  Approved: "bg-blue-100 text-blue-700",
  Rejected: "bg-red-100 text-red-700",
  Completed: "bg-green-100 text-green-700",
};

const ReturnRequestsList = () => {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState(null);
  const [adminNotes, setAdminNotes] = useState("");
  const [refundAmount, setRefundAmount] = useState("");
  const [refundMethod, setRefundMethod] = useState("Wallet");
  const [processing, setProcessing] = useState(false);

  const fetchRequests = async () => {
    try {
      setLoading(true);
      const res = await Axios.get("/admin/returns");
      setRequests(res.data?.returns || []);
    } catch {
      toast.error("Failed to load return requests");
    } finally {
      setLoading(false);
    }
  };

  const updateStatus = async (id, status) => {
    try {
      setProcessing(true);
      await Axios.patch(`/admin/returns/${id}`, { status, adminNotes, refundAmount: parseFloat(refundAmount) || 0, refundMethod });
      toast.success(`Return request ${status.toLowerCase()}`);
      setSelected(null);
      fetchRequests();
    } catch (err) {
      toast.error(err?.response?.data?.message || "Update failed");
    } finally {
      setProcessing(false);
    }
  };

  useEffect(() => { fetchRequests(); }, []);

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-800 dark:text-white">Return Requests</h1>
        <p className="text-sm text-gray-500">Review and process customer return/refund requests</p>
      </div>

      {selected && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-full max-w-lg p-6">
            <h2 className="text-lg font-bold mb-1">Process Return Request</h2>
            <p className="text-sm text-gray-500 mb-4">Order: <span className="font-mono text-purple-600">{selected.order?.orderID || selected.order}</span></p>
            <div className="space-y-3">
              <div>
                <label className="block text-sm font-medium mb-1">Admin Notes</label>
                <textarea value={adminNotes} onChange={e => setAdminNotes(e.target.value)} rows={3} className="w-full border rounded-lg px-3 py-2 text-sm dark:bg-gray-700 dark:border-gray-600" placeholder="Reason for approval/rejection..." />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Refund Amount (₹)</label>
                <input type="number" value={refundAmount} onChange={e => setRefundAmount(e.target.value)} className="w-full border rounded-lg px-3 py-2 text-sm dark:bg-gray-700 dark:border-gray-600" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Refund Method</label>
                <select value={refundMethod} onChange={e => setRefundMethod(e.target.value)} className="w-full border rounded-lg px-3 py-2 text-sm dark:bg-gray-700 dark:border-gray-600">
                  <option value="Wallet">Wallet (Store Credit)</option>
                  <option value="Original Payment">Original Payment Method</option>
                  <option value="Bank Transfer">Bank Transfer</option>
                </select>
              </div>
            </div>
            <div className="flex gap-3 mt-5">
              <button onClick={() => updateStatus(selected._id, 'Approved')} disabled={processing} className="flex-1 bg-green-600 hover:bg-green-700 text-white py-2 rounded-lg text-sm font-medium">Approve</button>
              <button onClick={() => updateStatus(selected._id, 'Rejected')} disabled={processing} className="flex-1 bg-red-600 hover:bg-red-700 text-white py-2 rounded-lg text-sm font-medium">Reject</button>
              <button onClick={() => setSelected(null)} className="flex-1 bg-gray-200 dark:bg-gray-700 py-2 rounded-lg text-sm font-medium">Cancel</button>
            </div>
          </div>
        </div>
      )}

      <div className="bg-white dark:bg-gray-800 rounded-xl shadow overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 dark:bg-gray-700 text-gray-600 dark:text-gray-300 uppercase text-xs">
            <tr>
              <th className="px-4 py-3 text-left">Order ID</th>
              <th className="px-4 py-3 text-left">Customer</th>
              <th className="px-4 py-3 text-left">Items</th>
              <th className="px-4 py-3 text-left">Reason</th>
              <th className="px-4 py-3 text-left">Status</th>
              <th className="px-4 py-3 text-left">Date</th>
              <th className="px-4 py-3 text-left">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
            {loading ? (
              <tr><td colSpan={7} className="text-center py-8 text-gray-400">Loading...</td></tr>
            ) : requests.length === 0 ? (
              <tr><td colSpan={7} className="text-center py-8 text-gray-400">No return requests</td></tr>
            ) : requests.map((r) => (
              <tr key={r._id} className="hover:bg-gray-50 dark:hover:bg-gray-750">
                <td className="px-4 py-3 font-mono text-purple-600 text-xs">{r.order?.orderID || r.order}</td>
                <td className="px-4 py-3">{r.user?.userName || r.user}</td>
                <td className="px-4 py-3">{r.items?.length} item(s)</td>
                <td className="px-4 py-3 max-w-xs truncate">{r.items?.[0]?.reason}</td>
                <td className="px-4 py-3">
                  <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${STATUS_COLORS[r.status]}`}>{r.status}</span>
                </td>
                <td className="px-4 py-3">{new Date(r.createdAt).toLocaleDateString()}</td>
                <td className="px-4 py-3">
                  {r.status === 'Pending' && (
                    <button onClick={() => { setSelected(r); setAdminNotes(''); setRefundAmount(''); }} className="text-xs bg-purple-100 text-purple-700 hover:bg-purple-200 px-3 py-1 rounded">
                      Review
                    </button>
                  )}
                  {r.status === 'Approved' && (
                    <button onClick={() => updateStatus(r._id, 'Completed')} className="text-xs bg-green-100 text-green-700 hover:bg-green-200 px-3 py-1 rounded">
                      Mark Done
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ReturnRequestsList;
