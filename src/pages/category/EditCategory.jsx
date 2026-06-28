import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getCategory, updateCategory, getMainCategories } from '../../services/CategoryApi';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const EditCategoryPage = () => {
  const { categoryId } = useParams();
  const navigate = useNavigate();

  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [displayOrder, setDisplayOrder] = useState('1');
  const [type, setType] = useState('Main');
  const [parentCategory, setParentCategory] = useState('');
  const [desktopImage, setDesktopImage] = useState(null);
  const [mobileImage, setMobileImage] = useState(null);
  const [imagePreviews, setImagePreviews] = useState({
    desktop: null,
    mobile: null,
  });
  const [existingImages, setExistingImages] = useState({ desktop: null, mobile: null });
  const [mainCategories, setMainCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(false);

  // States for removing images
  const [removeDesktopImage, setRemoveDesktopImage] = useState(false);
  const [removeMobileImage, setRemoveMobileImage] = useState(false);

  const desktopFileInputRef = useRef(null);
  const mobileFileInputRef = useRef(null);

  useEffect(() => {
    const load = async () => {
      setFetching(true);
      try {
        const [cat, parents] = await Promise.all([getCategory(categoryId), getMainCategories()]);
        setName(cat.name);
        setDescription(cat.description || '');
        setDisplayOrder(cat.displayOrder || 1);
        setType(cat.type);
        setParentCategory(cat.parentCategory?._id || '');

        if (cat.image && cat.image.length > 0) {
          setExistingImages({
            desktop: cat.image[0], // Assuming first image is for desktop
            mobile: cat.image[1],  // Assuming second image is for mobile
          });
        }
        setMainCategories(parents);
      } catch (err) {
        toast.error('Failed to load category');
      } finally {
        setFetching(false);
      }
    };
    load();
  }, [categoryId]);

  // Handle new image selection for desktop
  const handleDesktopImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setDesktopImage(file);
      setImagePreviews(prev => ({
        ...prev,
        desktop: URL.createObjectURL(file),
      }));
    }
  };

  // Handle new image selection for mobile
  const handleMobileImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setMobileImage(file);
      setImagePreviews(prev => ({
        ...prev,
        mobile: URL.createObjectURL(file),
      }));
    }
  };

  // Remove desktop image and reset the file input
  const handleImageRemove = async (imageType) => {
    try {
      const imageUrl = imageType === 'desktop' ? existingImages.desktop : existingImages.mobile;

      // Send request to backend to remove image
      const res = await updateCategory(categoryId, {
        removeDesktopImage: imageType === 'desktop' && imageUrl,
        removeMobileImage: imageType === 'mobile' && imageUrl,
      });

      if (res.success) {
        // Update local state to reflect that the image has been removed
        if (imageType === 'desktop') {
          setExistingImages(prev => ({ ...prev, desktop: null }));
          setRemoveDesktopImage(true);
        } else {
          setExistingImages(prev => ({ ...prev, mobile: null }));
          setRemoveMobileImage(true);
        }
        toast.success('Image removed successfully');
      } else {
        toast.error('Failed to remove image');
      }
    } catch (error) {
      console.error('Error removing image:', error);
      toast.error('Error removing image');
    }
  };

  // Submit the update
  const handleUpdate = async () => {
    if (!name) return toast.error('Name is required');
    if (!desktopImage && !existingImages.desktop && !removeDesktopImage) return toast.error('Desktop image is required');
    if (!mobileImage && !existingImages.mobile && !removeMobileImage) return toast.error('Mobile image is required');

    const formData = new FormData();
    formData.append('name', name);
    formData.append('description', description);
    formData.append('displayOrder', displayOrder || 1);
    formData.append('type', type);
    if (type === 'Sub' && parentCategory) formData.append('parentCategory', parentCategory);

    // Append images if selected
    if (desktopImage) formData.append('desktopImage', desktopImage);
    if (mobileImage) formData.append('mobileImage', mobileImage);

    // Flags for removing images
    if (removeDesktopImage && existingImages.desktop) formData.append('removeDesktopImage', true);
    if (removeMobileImage && existingImages.mobile) formData.append('removeMobileImage', true);

    try {
      setLoading(true);
      const res = await updateCategory(categoryId, formData);
      setLoading(false);
      if (res.success) {
        toast.success('Category updated!');
        navigate(`/admin/viewCategory/${categoryId}`);
      } else {
        toast.error(res.message || 'Update failed');
      }
    } catch (err) {
      setLoading(false);
      toast.error(err.message || 'Error');
    }
  };

  if (fetching) return <div className="text-center py-10">Loading...</div>;

  return (
    <div className="p-6 max-w-2xl mx-auto space-y-6">
      <ToastContainer />
      <div className="bg-white border border-zinc-200/80 rounded-xl shadow-sm p-6 sm:p-8">
        <h1 className="text-xl font-bold text-zinc-900 mb-6">Edit Category</h1>

        <div className="space-y-5">
          {/* Category Name */}
          <div>
            <label className="block text-xs font-semibold text-zinc-600 mb-1.5 uppercase tracking-wider">Category Name</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full border border-zinc-200 rounded-lg p-2.5 text-sm bg-white focus:ring-1 focus:ring-orange-500 focus:border-orange-500 focus:outline-none transition"
              required
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-xs font-semibold text-zinc-600 mb-1.5 uppercase tracking-wider">Description</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
              className="w-full border border-zinc-200 rounded-lg p-2.5 text-sm bg-white focus:ring-1 focus:ring-orange-500 focus:border-orange-500 focus:outline-none transition"
            />
          </div>

          {/* Display Order */}
          <div>
            <label className="block text-xs font-semibold text-zinc-600 mb-1.5 uppercase tracking-wider">Display Order</label>
            <input
              type="number"
              value={displayOrder}
              onChange={(e) => setDisplayOrder(Math.max(1, e.target.value))}
              className="w-full border border-zinc-200 rounded-lg p-2.5 text-sm bg-white focus:ring-1 focus:ring-orange-500 focus:border-orange-500 focus:outline-none transition"
            />
          </div>

          {/* Category Type */}
          <div>
            <label className="block text-xs font-semibold text-zinc-600 mb-2 uppercase tracking-wider">Category Type</label>
            <div className="flex space-x-6 text-sm">
              <label className="flex items-center gap-2 cursor-pointer text-zinc-700">
                <input
                  type="radio"
                  name="type"
                  value="Main"
                  checked={type === 'Main'}
                  onChange={(e) => setType(e.target.value)}
                  className="h-4 w-4 border-zinc-300 text-orange-500 focus:ring-orange-500"
                />
                <span>Main Category</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer text-zinc-700">
                <input
                  type="radio"
                  name="type"
                  value="Sub"
                  checked={type === 'Sub'}
                  onChange={(e) => setType(e.target.value)}
                  className="h-4 w-4 border-zinc-300 text-orange-500 focus:ring-orange-500"
                />
                <span>Sub-Category</span>
              </label>
            </div>
          </div>

          {/* Parent Category Dropdown */}
          {type === 'Sub' && (
            <div>
              <label className="block text-xs font-semibold text-zinc-600 mb-1.5 uppercase tracking-wider">Parent Category</label>
              <select
                value={parentCategory}
                onChange={(e) => setParentCategory(e.target.value)}
                className="w-full border border-zinc-200 rounded-lg p-2.5 text-sm bg-white focus:ring-1 focus:ring-orange-500 focus:border-orange-500 focus:outline-none transition"
              >
                <option value="">-- Select Main Category --</option>
                {mainCategories.map(c => (
                  <option key={c._id} value={c._id}>{c.name}</option>
                ))}
              </select>
            </div>
          )}

          {/* Existing Images */}
          <div>
            <label className="block text-xs font-semibold text-zinc-600 mb-1.5 uppercase tracking-wider">Existing Images</label>
            <div className="flex gap-4 mt-2">
              {existingImages.desktop && (
                <div className="relative group rounded-lg overflow-hidden border border-zinc-200">
                  <img
                    src={existingImages.desktop}
                    alt="Desktop"
                    className="w-24 h-24 object-cover"
                  />
                  <span className="absolute top-1 right-1 text-[10px] font-bold bg-red-600 text-white rounded-full w-5 h-5 flex items-center justify-center cursor-pointer shadow hover:bg-red-700 transition" onClick={() => handleImageRemove('desktop')}>
                    ×
                  </span>
                  <div className="absolute bottom-0 inset-x-0 bg-black/40 text-white text-[9px] py-0.5 text-center">Desktop</div>
                </div>
              )}
              {existingImages.mobile && (
                <div className="relative group rounded-lg overflow-hidden border border-zinc-200">
                  <img
                    src={existingImages.mobile}
                    alt="Mobile"
                    className="w-24 h-24 object-cover"
                  />
                  <span className="absolute top-1 right-1 text-[10px] font-bold bg-red-600 text-white rounded-full w-5 h-5 flex items-center justify-center cursor-pointer shadow hover:bg-red-700 transition" onClick={() => handleImageRemove('mobile')}>
                    ×
                  </span>
                  <div className="absolute bottom-0 inset-x-0 bg-black/40 text-white text-[9px] py-0.5 text-center">Mobile</div>
                </div>
              )}
            </div>
          </div>

          {/* Desktop Image Upload */}
          <div>
            <label className="block text-xs font-semibold text-zinc-600 mb-1.5 uppercase tracking-wider">Desktop Image</label>
            <input
              ref={desktopFileInputRef}
              type="file"
              accept="image/*"
              onChange={handleDesktopImageChange}
              className="w-full border border-zinc-200 rounded-lg p-2 text-sm bg-zinc-50/50"
            />
            {imagePreviews.desktop && (
              <div className="relative mt-2 inline-block rounded-lg overflow-hidden border border-zinc-200">
                <img
                  src={imagePreviews.desktop}
                  alt="Desktop Preview"
                  className="w-24 h-24 object-cover"
                />
                <span className="absolute top-1 right-1 text-[10px] font-bold bg-red-600 text-white rounded-full w-5 h-5 flex items-center justify-center cursor-pointer shadow" onClick={() => handleImageRemove('desktop')}>
                  ×
                </span>
              </div>
            )}
          </div>

          {/* Mobile Image Upload */}
          <div>
            <label className="block text-xs font-semibold text-zinc-600 mb-1.5 uppercase tracking-wider">Mobile Image</label>
            <input
              ref={mobileFileInputRef}
              type="file"
              accept="image/*"
              onChange={handleMobileImageChange}
              className="w-full border border-zinc-200 rounded-lg p-2 text-sm bg-zinc-50/50"
            />
            {imagePreviews.mobile && (
              <div className="relative mt-2 inline-block rounded-lg overflow-hidden border border-zinc-200">
                <img
                  src={imagePreviews.mobile}
                  alt="Mobile Preview"
                  className="w-24 h-24 object-cover"
                />
                <span className="absolute top-1 right-1 text-[10px] font-bold bg-red-600 text-white rounded-full w-5 h-5 flex items-center justify-center cursor-pointer shadow" onClick={() => handleImageRemove('mobile')}>
                  ×
                </span>
              </div>
            )}
          </div>

          {/* Submit Button */}
          <div className="pt-4">
            <button
              onClick={handleUpdate}
              disabled={loading || (!desktopImage && !existingImages.desktop && !removeDesktopImage) || (!mobileImage && !existingImages.mobile && !removeMobileImage)}
              className="w-full bg-orange-600 hover:bg-orange-700 text-white py-3 px-6 rounded-lg text-sm font-semibold disabled:opacity-50 transition shadow-sm"
            >
              {loading ? 'Updating...' : 'Update Category'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EditCategoryPage;
