import React, { useEffect, useState } from "react";
import axiosInstance from "../../utils/Axios";
import toast from "react-hot-toast";
import OfferForm from "./OfferForm";
import { Pencil, Trash2, Plus, X } from "lucide-react";

const OffersList = () => {
  const [offers, setOffers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editOfferId, setEditOfferId] = useState(null);

  const fetchOffers = async () => {
    try {
      const { data } = await axiosInstance.get("/offers");
      setOffers(data.data || []);
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to load offers");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOffers();
  }, []);

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this offer?")) return;
    try {
      await axiosInstance.delete(`/offers/${id}`);
      toast.success("Offer deleted successfully.");
      fetchOffers();
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to delete offer");
    }
  };

  const handleAddClick = () => {
    setEditOfferId(null);
    setShowForm(true);
  };

  const handleEditClick = (id) => {
    setEditOfferId(id);
    setShowForm(true);
  };

  const handleFormClose = () => {
    setShowForm(false);
    setEditOfferId(null);
    fetchOffers();
  };

  if (loading)
    return (
      <div className="p-6 text-center text-sm text-zinc-500">
        Loading offers...
      </div>
    );

  return (
    <div className="p-6 max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-white border border-zinc-200/80 rounded-xl p-4 shadow-sm">
        <div>
          <h1 className="text-xl font-bold text-zinc-900">Manage Offers</h1>
          <p className="text-xs text-zinc-500">Create, edit, and schedule discount promo codes for users.</p>
        </div>
        <button
          onClick={handleAddClick}
          className="inline-flex items-center gap-1.5 px-4 py-2 bg-orange-600 hover:bg-orange-700 text-white rounded-lg transition text-sm font-semibold shadow-sm"
        >
          <Plus className="w-4 h-4" />
          Create Offer
        </button>
      </div>

      {/* Desktop Table */}
      <div className="hidden md:block overflow-hidden bg-white border border-zinc-200/80 rounded-xl shadow-sm">
        <table className="w-full border-collapse">
          <thead className="bg-gradient-to-r from-orange-50 to-orange-100/40 border-b border-orange-200/60">
            <tr>
              {["Name", "Code", "Discount", "Status", "Valid From", "Valid To", "Actions"].map(
                (col) => (
                  <th
                    key={col}
                    className="px-4 py-3 text-left text-[10px] font-bold text-orange-950/80 uppercase tracking-wider"
                  >
                    {col}
                  </th>
                )
              )}
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-200/60">
            {offers.map((offer) => (
              <tr
                key={offer._id}
                className="hover:bg-orange-50/30 transition-colors"
              >
                <td className="px-4 py-3.5 text-sm font-semibold text-zinc-900">{offer.name || "—"}</td>
                <td className="px-4 py-3.5 text-sm uppercase text-zinc-700 font-mono">
                  {offer.code || "—"}
                </td>
                <td className="px-4 py-3.5 text-sm font-semibold text-orange-600">
                  {offer.discountPercentage ?? "—"}%
                </td>
                <td className="px-4 py-3.5 text-sm">
                  <span
                    className={`inline-block px-2.5 py-0.5 rounded text-[10px] font-bold border ${
                      offer.status === "active"
                        ? "bg-green-50 text-green-700 border-green-200"
                        : "bg-red-50 text-red-600 border-red-200"
                    }`}
                  >
                    {offer.status?.toUpperCase()}
                  </span>
                </td>
                <td className="px-4 py-3.5 text-xs text-zinc-500">
                  {new Date(offer.startDate).toLocaleDateString()}
                </td>
                <td className="px-4 py-3.5 text-xs text-zinc-500">
                  {new Date(offer.endDate).toLocaleDateString()}
                </td>
                <td className="px-4 py-3.5 text-sm">
                  <div className="flex items-center space-x-3.5">
                    <button
                      onClick={() => handleEditClick(offer._id)}
                      className="text-zinc-400 hover:text-blue-600 transition-colors"
                      title="Edit"
                    >
                      <Pencil className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(offer._id)}
                      className="text-zinc-400 hover:text-red-600 transition-colors"
                      title="Delete"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Mobile Cards */}
      <div className="md:hidden space-y-4">
        {offers.map((offer) => (
          <div
            key={offer._id}
            className="border border-zinc-200/80 bg-white shadow-sm rounded-xl p-4 space-y-3"
          >
            <div className="flex justify-between items-start">
              <div>
                <h3 className="font-bold text-zinc-900 text-sm">
                  {offer.name || "Unnamed Offer"}
                </h3>
                <p className="text-xs text-zinc-500 mt-0.5">
                  Code:{" "}
                  <span className="font-mono font-medium text-zinc-800 uppercase">
                    {offer.code || "—"}
                  </span>
                </p>
              </div>

              <span
                className={`inline-block px-2.5 py-0.5 rounded text-[10px] font-bold border ${
                  offer.status === "active"
                    ? "bg-green-50 text-green-700 border-green-200"
                    : "bg-red-50 text-red-600 border-red-200"
                }`}
              >
                {offer.status?.toUpperCase()}
              </span>
            </div>

            <div className="flex items-center justify-between text-xs pt-1.5 border-t border-zinc-100">
              <span className="text-zinc-500">Discount</span>
              <span className="font-bold text-orange-600">
                {offer.discountPercentage ?? "—"}%
              </span>
            </div>

            <div className="text-[11px] text-zinc-500">
              <p>
                Validity: <span className="text-zinc-700 font-medium">{new Date(offer.startDate).toLocaleDateString()}</span> to <span className="text-zinc-700 font-medium">{new Date(offer.endDate).toLocaleDateString()}</span>
              </p>
            </div>

            <div className="flex justify-end space-x-2 pt-2 border-t border-zinc-100">
              <button
                onClick={() => handleEditClick(offer._id)}
                className="px-2.5 py-1 text-xs font-semibold rounded border border-zinc-250 text-zinc-700 hover:bg-zinc-50 transition"
              >
                Edit
              </button>
              <button
                onClick={() => handleDelete(offer._id)}
                className="px-2.5 py-1 text-xs font-semibold rounded border border-red-200 text-red-600 hover:bg-red-50 transition"
              >
                Delete
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Inline Form Modal */}
      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-zinc-950/60 backdrop-blur-sm">
          <div className="bg-white rounded-xl border border-zinc-200 shadow-2xl w-full max-w-lg p-6 relative">
            <button
              onClick={handleFormClose}
              className="absolute top-4 right-4 text-zinc-400 hover:text-zinc-700 transition"
            >
              <X className="w-4 h-4" />
            </button>

            <OfferForm offerId={editOfferId} onClose={handleFormClose} />
          </div>
        </div>
      )}
    </div>
  );
};

export default OffersList;
