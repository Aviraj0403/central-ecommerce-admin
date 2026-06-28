import React from 'react';
import BannerForm from './BannerForm';

const BannerFormModal = ({ 
  isOpen, 
  bannerId, 
  onClose 
}) => {
  if (!isOpen) return null;

  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  const handleFormSuccess = () => {
    // Form will handle its own success callback and close
    // This is called after successful submission
  };

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4"
      onClick={handleBackdropClick}
    >
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl p-6 max-h-[90vh] overflow-y-auto relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-500 hover:text-gray-800 text-2xl z-10"
        >
          ✕
        </button>
        <BannerForm 
          bannerId={bannerId} 
          onClose={onClose} 
          onSuccess={handleFormSuccess}
        />
      </div>
    </div>
  );
};

export default BannerFormModal;