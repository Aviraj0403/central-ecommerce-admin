import React from 'react';

const BannerCard = ({ 
  banner, 
  onEdit, 
  onDelete, 
  onToggleStatus,
  isMobile = false
}) => {
  const handleDelete = () => {
    if (window.confirm("Are you sure you want to delete this banner?")) {
      onDelete(banner._id);
    }
  };

  const handleToggleStatus = () => {
    onToggleStatus(banner._id);
  };

  const handleEdit = () => {
    onEdit(banner._id);
  };

  // Desktop layout
  if (!isMobile) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-zinc-200/85 overflow-hidden">
        <div className="grid grid-cols-3 gap-6 p-6">
          {/* Banner Image */}
          <div className="col-span-1">
            <img
              src={banner.bannerImage}
              alt={banner.title || "Banner"}
              className="w-full h-40 object-cover rounded-lg border border-zinc-250/30"
            />
          </div>

          {/* Banner Details */}
          <div className="col-span-2 flex flex-col justify-between space-y-2">
            <div>
              <div className="flex justify-between items-start mb-2">
                <div>
                  <h3 className="text-lg font-bold text-zinc-900">
                    {banner.title || "Untitled Banner"}
                  </h3>
                  <p className="text-xs text-zinc-400 mt-0.5">
                    By {banner.createdBy?.userName || "Admin"} • {new Date(banner.createdAt).toLocaleDateString()}
                  </p>
                </div>
                <span
                  className={`inline-block px-2.5 py-0.5 rounded text-[10px] font-bold border ${
                    banner.isActive
                      ? "bg-green-50 text-green-700 border-green-200"
                      : "bg-zinc-100 text-zinc-500 border border-zinc-200"
                  }`}
                >
                  {banner.isActive ? "ACTIVE" : "INACTIVE"}
                </span>
              </div>

              <p className="text-sm text-zinc-600 leading-relaxed mb-2">
                {banner.description || "No description provided."}
              </p>

              <div className="text-xs text-zinc-500">
                <span className="font-semibold text-zinc-700">Display Order:</span> {banner.displayOrder}
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex space-x-2 pt-2">
              <button
                onClick={handleToggleStatus}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition border ${
                  banner.isActive
                    ? "bg-white border-zinc-250 text-zinc-700 hover:bg-zinc-50"
                    : "bg-zinc-900 border-zinc-900 text-white hover:bg-zinc-800"
                }`}
              >
                {banner.isActive ? "Deactivate" : "Activate"}
              </button>
              <button
                onClick={handleEdit}
                className="px-3 py-1.5 bg-white border border-zinc-250 text-zinc-700 rounded-lg text-xs font-semibold hover:bg-zinc-50 transition"
              >
                Edit
              </button>
              <button
                onClick={handleDelete}
                className="px-3 py-1.5 bg-red-50 border border-red-200 text-red-600 rounded-lg text-xs font-semibold hover:bg-red-100 transition"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Mobile layout
  return (
    <div className="bg-white rounded-xl shadow-sm border border-zinc-200/80 overflow-hidden">
      <img
        src={banner.bannerImage}
        alt={banner.title || "Banner"}
        className="w-full h-36 object-cover"
      />
      
      <div className="p-4 space-y-3">
        <div className="flex justify-between items-start">
          <h3 className="font-bold text-zinc-900 text-base">
            {banner.title || "Untitled Banner"}
          </h3>
          <span
            className={`inline-block px-2.5 py-0.5 rounded text-[10px] font-bold border ${
              banner.isActive
                ? "bg-green-50 text-green-700 border-green-200"
                : "bg-zinc-100 text-zinc-500 border border-zinc-200"
            }`}
          >
            {banner.isActive ? "ACTIVE" : "INACTIVE"}
          </span>
        </div>

        <p className="text-xs text-zinc-600">
          {banner.description || "No description provided."}
        </p>

        <div className="text-[10px] text-zinc-400 space-y-0.5 pt-1.5 border-t border-zinc-100">
          <p>Order: {banner.displayOrder}</p>
          <p>By {banner.createdBy?.userName || "Admin"}</p>
        </div>

        <div className="flex space-x-2 pt-2 border-t border-zinc-100">
          <button
            onClick={handleToggleStatus}
            className={`flex-1 px-3 py-1.5 rounded-lg text-xs font-semibold transition border ${
              banner.isActive
                ? "bg-white border-zinc-250 text-zinc-700 hover:bg-zinc-50"
                : "bg-zinc-900 border-zinc-900 text-white hover:bg-zinc-800"
            }`}
          >
            {banner.isActive ? "Deactivate" : "Activate"}
          </button>
          <button
            onClick={handleEdit}
            className="px-3 py-1.5 bg-white border border-zinc-250 text-zinc-700 rounded-lg text-xs font-semibold hover:bg-zinc-50 transition"
          >
            Edit
          </button>
          <button
            onClick={handleDelete}
            className="px-3 py-1.5 bg-red-50 border border-red-200 text-red-600 rounded-lg text-xs font-semibold hover:bg-red-100 transition"
          >
            Delete
          </button>
        </div>
      </div>
    </div>
  );
};

export default BannerCard;