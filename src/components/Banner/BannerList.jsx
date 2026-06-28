import React from 'react';
import BannerCard from './BannerCard';

const BannerList = ({ 
  banners, 
  loading, 
  onEdit, 
  onDelete, 
  onToggleStatus, 
  onRefresh, 
  onCreateNew 
}) => {
  // Loading state
  if (loading) {
    return (
      <div className="p-6 text-center text-lg font-medium text-gray-500">
        ⏳ Loading banners...
      </div>
    );
  }

  // Ensure banners is always an array
  const safeBanners = Array.isArray(banners) ? banners : [];

  return (
    <div className="space-y-6">
      {/* Header Card */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-white border border-zinc-200/80 rounded-xl p-4 shadow-sm">
        <div>
          <h1 className="text-xl font-bold text-zinc-900">Promo Banners</h1>
          <p className="text-xs text-zinc-500">Configure, schedule, and rank promotional hero banners on the website.</p>
        </div>
        <div className="flex space-x-2">
          <button
            onClick={onRefresh}
            className="inline-flex items-center px-3.5 py-1.5 bg-white border border-zinc-200 hover:bg-zinc-50 text-zinc-700 text-xs font-semibold rounded-lg transition"
          >
            Refresh
          </button>
          <button
            onClick={onCreateNew}
            className="inline-flex items-center px-3.5 py-1.5 bg-orange-600 hover:bg-orange-700 text-white text-xs font-semibold rounded-lg transition shadow-sm"
          >
            Create Banner
          </button>
        </div>
      </div>

      {/* Empty State */}
      {safeBanners.length === 0 && (
        <div className="text-center py-12 bg-white border border-zinc-200/80 rounded-xl p-6 shadow-sm">
          <h3 className="text-lg font-bold text-zinc-800 mb-1">No Banners Found</h3>
          <p className="text-xs text-zinc-500 mb-4">Create your first promotional banner to get started.</p>
          <button
            onClick={onCreateNew}
            className="inline-flex items-center px-4 py-2 bg-orange-600 hover:bg-orange-700 text-white text-xs font-semibold rounded-lg transition shadow-sm"
          >
            Create Your First Banner
          </button>
        </div>
      )}

      {/* Desktop View */}
      {safeBanners.length > 0 && (
        <div className="hidden lg:grid gap-4">
          {safeBanners.map((banner) => (
            <BannerCard
              key={banner._id}
              banner={banner}
              onEdit={onEdit}
              onDelete={onDelete}
              onToggleStatus={onToggleStatus}
              isMobile={false}
            />
          ))}
        </div>
      )}

      {/* Mobile View */}
      {safeBanners.length > 0 && (
        <div className="lg:hidden space-y-4">
          {safeBanners.map((banner) => (
            <BannerCard
              key={banner._id}
              banner={banner}
              onEdit={onEdit}
              onDelete={onDelete}
              onToggleStatus={onToggleStatus}
              isMobile={true}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default BannerList;