import React, { useEffect, useState } from 'react';
import axios from '../../utils/Axios';
import { Eye, ChevronLeft, ChevronRight } from 'lucide-react';
import LeadDetailsModal from './LeadDetailsModal';

const AdminOrderLeads = () => {
  const [leads, setLeads] = useState([]);
  const [selectedLead, setSelectedLead] = useState(null);
  const [loading, setLoading] = useState(false);

  // filters & pagination
  const [status, setStatus] = useState('all');
  const [month, setMonth] = useState('');
  const [year, setYear] = useState('');
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [pagination, setPagination] = useState(null);

  const fetchLeads = async () => {
    try {
      setLoading(true);
      const res = await axios.post('/orders/leads', {
        paymentStatus: status,
        page,
        limit,
        month: month || undefined,
        year: year || undefined,
      });

      setLeads(res.data.orderLeads || []);
      setPagination(res.data.pagination || null);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLeads();
  }, [page, limit]);

  const applyFilters = () => {
    setPage(1);
    fetchLeads();
  };

  const clearFilters = () => {
    setStatus('all');
    setMonth('');
    setYear('');
    setPage(1);
    fetchLeads();
  };

  const badge = (s) =>
    s === 'Failed'
      ? 'bg-red-100 text-red-600 border border-red-200'
      : 'bg-orange-100 text-orange-600 border border-orange-200';

  return (
    <div className="p-6 bg-white rounded-xl border border-zinc-200/60 shadow-sm">
      <h2 className="text-xl font-bold tracking-tight text-zinc-900 mb-4 uppercase">Order Leads</h2>

      {/* Filters */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 mb-6">
        <select
          value={status}
          onChange={(e) => setStatus(e.target.value)}
          className="border border-zinc-200 rounded-lg p-2 text-xs focus:ring-2 focus:ring-orange-400 focus:outline-none cursor-pointer"
        >
          <option value="all">All Status</option>
          <option value="Pending">Pending</option>
          <option value="Failed">Failed</option>
        </select>

        <select
          value={month}
          onChange={(e) => setMonth(e.target.value)}
          className="border border-zinc-200 rounded-lg p-2 text-xs focus:ring-2 focus:ring-orange-400 focus:outline-none cursor-pointer"
        >
          <option value="">Month</option>
          {Array.from({ length: 12 }, (_, i) => (
            <option key={i + 1} value={i + 1}>
              {new Date(0, i).toLocaleString('default', { month: 'long' })}
            </option>
          ))}
        </select>

        <select
          value={year}
          onChange={(e) => setYear(e.target.value)}
          className="border border-zinc-200 rounded-lg p-2 text-xs focus:ring-2 focus:ring-orange-400 focus:outline-none cursor-pointer"
        >
          <option value="">Year</option>
          {Array.from({ length: 6 }, (_, i) => {
            const y = new Date().getFullYear() - i;
            return (
              <option key={y} value={y}>
                {y}
              </option>
            );
          })}
        </select>

        <div className="flex gap-2 text-xs">
          <button
            onClick={applyFilters}
            className="flex-1 bg-zinc-900 hover:bg-zinc-800 text-white rounded-lg px-4 py-2 font-semibold shadow-sm cursor-pointer"
          >
            Apply
          </button>
          <button
            onClick={clearFilters}
            className="flex-1 bg-zinc-100 hover:bg-zinc-200 text-zinc-800 rounded-lg px-4 py-2 font-semibold shadow-sm cursor-pointer"
          >
            Clear
          </button>
        </div>
      </div>

      {/* Table */}
      {loading ? (
        <div className="text-center py-10 text-gray-500">Loading leads...</div>
      ) : leads.length === 0 ? (
        <div className="text-center py-10 text-zinc-500">
          No leads found
        </div>
      ) : (
        <div className="overflow-x-auto border border-zinc-200/60 rounded-xl shadow-sm bg-white">
          <table className="w-full">
            <thead className="bg-zinc-50 border-b border-zinc-200/60">
              <tr>
                <th className="px-6 py-3.5 text-left text-[10px] font-bold text-zinc-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-3.5 text-left text-[10px] font-bold text-zinc-500 uppercase tracking-wider">Amount</th>
                <th className="px-6 py-3.5 text-left text-[10px] font-bold text-zinc-500 uppercase tracking-wider">Phone</th>
                <th className="px-6 py-3.5 text-left text-[10px] font-bold text-zinc-500 uppercase tracking-wider">Date</th>
                <th className="px-6 py-3.5 text-center text-[10px] font-bold text-zinc-500 uppercase tracking-wider w-20">View</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100">
              {leads.map((lead, i) => (
                <tr key={i} className="hover:bg-zinc-50/50 transition-colors">
                  <td className="px-6 py-4">
                    <span className={`px-2 py-1 rounded-full text-xs font-semibold ${badge(lead.orderStatus)}`}>
                      {lead.orderStatus}
                    </span>
                  </td>
                  <td className="px-6 py-4 font-bold text-zinc-900 text-xs">
                    ₹{lead.amount} <span className="text-[10px] text-zinc-400 font-bold">{lead.currency}</span>
                  </td>
                  <td className="px-6 py-4 text-xs font-medium text-zinc-800">
                    {lead.shippingAddress?.phoneNumber || 'N/A'}
                  </td>
                  <td className="px-6 py-4 text-xs text-zinc-500">
                    {new Date(lead.createdAt).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 text-center">
                    <button
                      onClick={() => setSelectedLead(lead)}
                      className="p-1.5 rounded-lg border border-zinc-200 hover:bg-zinc-50 transition-all text-zinc-700 cursor-pointer inline-flex items-center justify-center"
                    >
                      <Eye className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Pagination */}
      {pagination && (
        <div className="mt-4 flex items-center justify-between">
          <div className="text-sm text-gray-600">
            Page {pagination.currentPage} of {pagination.totalPages}
          </div>

          <div className="flex gap-2">
            <button
              onClick={() => setPage((p) => Math.max(p - 1, 1))}
              disabled={page === 1}
              className="px-3 py-2 bg-gray-200 rounded disabled:opacity-50"
            >
              <ChevronLeft />
            </button>

            <button
              onClick={() =>
                setPage((p) =>
                  Math.min(p + 1, pagination.totalPages)
                )
              }
              disabled={page === pagination.totalPages}
              className="px-3 py-2 bg-gray-200 rounded disabled:opacity-50"
            >
              <ChevronRight />
            </button>
          </div>
        </div>
      )}

      {selectedLead && (
        <LeadDetailsModal
          lead={selectedLead}
          onClose={() => setSelectedLead(null)}
        />
      )}
    </div>
  );
};

export default AdminOrderLeads;
