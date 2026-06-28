import React, { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import { getPromoBanner, createPromoBanner, updatePromoBanner } from '../../services/promoBannerApi';

const BannerForm = ({ 
  bannerId, 
  onClose, 
  onSuccess 
}) => {
  const isEdit = Boolean(bannerId);
  const [form, setForm] = useState({
    title: "",
    description: "",
    bannerImage: null,
    imagePreview: "",
    isActive: true,
    displayOrder: 0
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!isEdit) return;

    console.log('Loading banner for edit, bannerId:', bannerId);
    setLoading(true);
    getPromoBanner(bannerId)
      .then((promoBanner) => {
        console.log('Retrieved banner data:', promoBanner);
        if (promoBanner) {
          setForm({
            title: promoBanner.title || "",
            description: promoBanner.description || "",
            bannerImage: null,
            imagePreview: promoBanner.bannerImage || "",
            isActive: promoBanner.isActive,
            displayOrder: promoBanner.displayOrder || 0
          });
        } else {
          console.warn('No banner data received');
        }
      })
      .catch((err) => {
        console.error('Error loading banner:', err);
        toast.error("Failed to load banner");
      })
      .finally(() => setLoading(false));
  }, [bannerId, isEdit]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value
    }));
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        toast.error("Image size should be less than 5MB");
        return;
      }
      setForm((prev) => ({
        ...prev,
        bannerImage: file,
        imagePreview: URL.createObjectURL(file)
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    // Validation
    if (!isEdit && !form.bannerImage) {
      toast.error("Banner image is required");
      setLoading(false);
      return;
    }

    try {
      // Ensure FormData structure matches API expectations
      const formData = {
        title: form.title.trim(),
        description: form.description.trim(),
        isActive: form.isActive,
        displayOrder: Number(form.displayOrder)
      };

      // Only add image if one is selected
      if (form.bannerImage) {
        formData.bannerImage = form.bannerImage;
      }

      let result;
      if (isEdit) {
        result = await updatePromoBanner(bannerId, formData);
        toast.success("Banner updated successfully");
      } else {
        result = await createPromoBanner(formData);
        toast.success("Banner created successfully");
      }
      
      if (onSuccess) {
        onSuccess(result);
      }
      onClose();
    } catch (error) {
      // Enhanced error handling
      let errorMessage = "Failed to save banner";
      
      if (error.response?.status === 400) {
        errorMessage = "Invalid banner data. Please check your inputs.";
      } else if (error.response?.status === 401) {
        errorMessage = "You are not authorized to perform this action.";
      } else if (error.response?.status === 413) {
        errorMessage = "Image file is too large. Please use a smaller image.";
      } else if (error.response?.status >= 500) {
        errorMessage = "Server error. Please try again later.";
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      toast.error(errorMessage);
      console.error('Banner form submission error:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      <h3 className="text-xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
        {isEdit ? "✏️ Edit Banner" : "➕ Create Banner"}
      </h3>

      <div>
        <label className="block mb-1 font-medium text-gray-700">Title</label>
        <input
          name="title"
          type="text"
          value={form.title}
          onChange={handleChange}
          className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-purple-500 focus:border-transparent"
          placeholder="Banner title (optional)"
          disabled={loading}
        />
      </div>

      <div>
        <label className="block mb-1 font-medium text-gray-700">Description</label>
        <textarea
          name="description"
          value={form.description}
          onChange={handleChange}
          rows={3}
          className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none"
          placeholder="Banner description (optional)"
          disabled={loading}
        />
      </div>

      <div>
        <label className="block mb-2 font-medium text-gray-700">
          Banner Image {!isEdit && <span className="text-red-500">*</span>}
        </label>
        
        {form.imagePreview && (
          <div className="mb-3 relative">
            <img
              src={form.imagePreview}
              alt="Preview"
              className="w-full h-48 object-cover rounded-lg border-2 border-gray-200"
            />
            <button
              type="button"
              onClick={() => setForm(prev => ({ ...prev, bannerImage: null, imagePreview: "" }))}
              className="absolute top-2 right-2 bg-red-500 text-white rounded-full w-8 h-8 flex items-center justify-center hover:bg-red-600 transition"
              disabled={loading}
            >
              ✕
            </button>
          </div>
        )}

        <input
          type="file"
          accept="image/*"
          onChange={handleImageChange}
          className="w-full border border-gray-300 rounded-lg px-3 py-2 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-purple-50 file:text-purple-700 hover:file:bg-purple-100"
          disabled={loading}
        />
        <p className="text-xs text-gray-500 mt-1">Maximum file size: 5MB. Recommended: 1920x600px</p>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block mb-1 font-medium text-gray-700">Display Order</label>
          <input
            name="displayOrder"
            type="number"
            min="0"
            value={form.displayOrder}
            onChange={handleChange}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            disabled={loading}
          />
          <p className="text-xs text-gray-500 mt-1">Lower numbers appear first</p>
        </div>

        <div className="flex items-center">
          <label className="flex items-center space-x-2 cursor-pointer">
            <input
              type="checkbox"
              name="isActive"
              checked={form.isActive}
              onChange={handleChange}
              className="w-5 h-5 text-purple-600 rounded focus:ring-2 focus:ring-purple-500"
              disabled={loading}
            />
            <span className="font-medium text-gray-700">Active Banner</span>
          </label>
        </div>
      </div>

      <div className="flex space-x-3 pt-2">
        <button
          onClick={handleSubmit}
          disabled={loading}
          className="flex-1 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white px-4 py-2.5 rounded-lg font-medium shadow-md hover:shadow-lg transition-all duration-200 disabled:opacity-50"
        >
          {loading ? "Saving..." : "Save Banner"}
        </button>
        <button
          onClick={onClose}
          disabled={loading}
          className="px-6 bg-gray-200 hover:bg-gray-300 text-gray-800 py-2.5 rounded-lg font-medium transition-all duration-200"
        >
          Cancel
        </button>
      </div>
    </div>
  );
};

export default BannerForm;