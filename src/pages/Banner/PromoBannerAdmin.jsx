import React, { useEffect, useState } from "react";
import toast from "react-hot-toast";
import {
  getAdminPromoBanners,
  deletePromoBanner,
  toggleBannerStatus
} from "../../services/promoBannerApi";
import { BannerList, BannerFormModal, ErrorBoundary } from "../../components/Banner";

const PromoBannerAdmin = () => {
  const [banners, setBanners] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showFormModal, setShowFormModal] = useState(false);
  const [editBannerId, setEditBannerId] = useState(null);

  const fetchBanners = async () => {
    setLoading(true);
    try {
      console.log('Fetching banners...'); // Debug log
      const promoBanners = await getAdminPromoBanners();
      console.log('Received banners:', promoBanners); // Debug log
      
      // Ensure we always have an array
      if (Array.isArray(promoBanners)) {
        setBanners(promoBanners);
        console.log('Set banners state:', promoBanners.length, 'items');
      } else {
        console.warn('API did not return an array:', promoBanners);
        setBanners([]);
      }
    } catch (error) {
      console.error('Error in fetchBanners:', error);
      toast.error("Failed to load banners");
      setBanners([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    console.log('Component mounted, fetching banners...');
    fetchBanners();
  }, []);

  const handleDelete = async (id) => {
    try {
      await deletePromoBanner(id);
      toast.success("Banner deleted successfully");
      fetchBanners();
    } catch (error) {
      let errorMessage = "Failed to delete banner";
      if (error.response?.status === 404) {
        errorMessage = "Banner not found";
      } else if (error.response?.status === 403) {
        errorMessage = "You don't have permission to delete this banner";
      }
      toast.error(errorMessage);
      console.error('Delete banner error:', error);
    }
  };

  const handleToggleStatus = async (id) => {
    try {
      const updatedBanner = await toggleBannerStatus(id);
      toast.success("Banner status updated");
      
      // Update the local state immediately with the returned banner data
      setBanners(prevBanners => 
        prevBanners.map(banner => 
          banner._id === id ? { ...banner, ...updatedBanner } : banner
        )
      );
    } catch (error) {
      let errorMessage = "Failed to update status";
      if (error.response?.status === 404) {
        errorMessage = "Banner not found";
      } else if (error.response?.status === 403) {
        errorMessage = "You don't have permission to update this banner";
      }
      toast.error(errorMessage);
      console.error('Toggle status error:', error);
    }
  };

  const handleCreateNew = () => {
    setEditBannerId(null);
    setShowFormModal(true);
  };

  const handleEdit = (id) => {
    setEditBannerId(id);
    setShowFormModal(true);
  };

  const handleFormClose = () => {
    setShowFormModal(false);
    setEditBannerId(null);
    // Refresh banners after form close
    console.log('Form closed, refreshing banners...');
    fetchBanners();
  };

  return (
    <ErrorBoundary>
      <div className="p-6 max-w-7xl mx-auto space-y-6">
        <BannerList
          banners={banners}
          loading={loading}
          onEdit={handleEdit}
          onDelete={handleDelete}
          onToggleStatus={handleToggleStatus}
          onRefresh={fetchBanners}
          onCreateNew={handleCreateNew}
        />

        <BannerFormModal
          isOpen={showFormModal}
          bannerId={editBannerId}
          onClose={handleFormClose}
        />
      </div>
    </ErrorBoundary>
  );
};

export default PromoBannerAdmin;