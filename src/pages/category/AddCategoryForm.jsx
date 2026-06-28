import React, { useState, useEffect, useRef } from 'react';
import { createCategory, getMainCategories } from '../../services/CategoryApi';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { useNavigate } from 'react-router-dom';

const AddCategoryForm = () => {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [displayOrder, setDisplayOrder] = useState('');
  const [type, setType] = useState('Main');
  const [parentCategory, setParentCategory] = useState('');
  const [images, setImages] = useState([]);           // File[] for images
  const [imagePreviews, setImagePreviews] = useState([]); // string[] for image previews
  const [mainCategories, setMainCategories] = useState([]); 
  const [loading, setLoading] = useState(false);
  const [fetchingParents, setFetchingParents] = useState(false);
  const fileInputRef = useRef(null);
  const navigate = useNavigate();

  // Load main categories
  useEffect(() => {
    const load = async () => {
      setFetchingParents(true);
      try {
        const cats = await getMainCategories();
        setMainCategories(cats);
      } catch (err) {
        toast.error('Failed to load parent categories');
      } finally {
        setFetchingParents(false);
      }
    };
    load();
  }, []);

  // Add new images (append, not replace)
  const handleImageChange = (e) => {
    const newFiles = Array.from(e.target.files);
    if (newFiles.length === 0) return;

    const total = images.length + newFiles.length;
    if (total > 2) {
      toast.error(`Max 2 images allowed. You already have ${images.length}`);
      return;
    }

    setImages((prev) => [...prev, ...newFiles]);
    const previews = newFiles.map((f) => URL.createObjectURL(f));
    setImagePreviews((prev) => [...prev, ...previews]);

    // Reset file input
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  // Remove image
  const removeImage = (idx) => {
    setImages((prev) => prev.filter((_, i) => i !== idx));
    setImagePreviews((prev) => {
      URL.revokeObjectURL(prev[idx]);
      return prev.filter((_, i) => i !== idx);
    });
  };

  // Submit form
  const handleSubmit = async () => {
    if (!name) return toast.error('Category Name is required');
    if (type === 'Main' && images.length !== 2) return toast.error('Exactly 2 images are required for Main category');
    if (type === 'Sub' && !parentCategory) return toast.error('Please select a parent category for Subcategory');

    const formData = new FormData();
    formData.append('name', name);
    formData.append('description', description);
    formData.append('displayOrder', displayOrder || 0);
    formData.append('type', type);
    if (type === 'Sub') formData.append('parentCategory', parentCategory);
    images.forEach((img) => formData.append('images', img));

    try {
      setLoading(true);
      const res = await createCategory(formData);
      setLoading(false);
      if (res.success) {
        toast.success('Category created!');
        navigate('/admin/categories');
      } else {
        toast.error(res.message || 'Failed');
      }
    } catch (err) {
      setLoading(false);
      toast.error(err.message || 'Error');
    }
  };

  return (
    <>
      <div className="max-w-2xl mx-auto p-6 bg-white border border-zinc-200/60 rounded-xl shadow-sm">
        <h2 className="text-xl font-bold tracking-tight text-zinc-900 mb-6 uppercase">Add New Category</h2>

        <div className="space-y-4">
          {/* Category Name */}
          <div>
            <label htmlFor="name" className="block text-xs font-bold text-zinc-500 uppercase tracking-wider">Category Name</label>
            <input
              type="text"
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full mt-1.5 p-2.5 border border-zinc-200 rounded-lg focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 focus:outline-none text-xs"
              required
            />
          </div>

          {/* Description */}
          <div>
            <label htmlFor="description" className="block text-xs font-bold text-zinc-500 uppercase tracking-wider">Description</label>
            <textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={4}
              className="w-full mt-1.5 p-2.5 border border-zinc-200 rounded-lg focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 focus:outline-none text-xs"
            />
          </div>

          {/* Display Order */}
          <div>
            <label htmlFor="displayOrder" className="block text-xs font-bold text-zinc-500 uppercase tracking-wider">Display Order</label>
            <input
              type="number"
              id="displayOrder"
              value={displayOrder}
              onChange={(e) => {
                const value = e.target.value === '' ? 0 : Math.max(0, e.target.value);
                setDisplayOrder(value);
              }}
              className="w-full mt-1.5 p-2.5 border border-zinc-200 rounded-lg focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 focus:outline-none text-xs"
            />
          </div>

          {/* Category Type (Main / Sub) */}
          <div>
            <label className="block text-xs font-bold text-zinc-500 uppercase tracking-wider mb-2">Category Type</label>
            <div className="flex space-x-6 text-xs font-bold text-zinc-700">
              <label className="flex items-center cursor-pointer">
                <input type="radio" name="type" value="Main" checked={type === 'Main'} onChange={(e) => setType(e.target.value)} className="mr-2 accent-orange-500" />
                Main
              </label>
              <label className="flex items-center cursor-pointer">
                <input type="radio" name="type" value="Sub" checked={type === 'Sub'} onChange={(e) => setType(e.target.value)} className="mr-2 accent-orange-500" />
                Sub
              </label>
            </div>
          </div>

          {/* Parent Category (only for Sub category) */}
          {type === 'Sub' && (
            <div>
              <label htmlFor="parent" className="block text-xs font-bold text-zinc-500 uppercase tracking-wider">Select Parent Category</label>
              {fetchingParents ? (
                <p className="mt-2 text-xs text-zinc-400">Loading parent categories...</p>
              ) : (
                <select
                  id="parent"
                  value={parentCategory}
                  onChange={(e) => setParentCategory(e.target.value)}
                  className="w-full mt-1.5 p-2.5 border border-zinc-200 rounded-lg focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 focus:outline-none text-xs"
                >
                  <option value="">-- Select Main Category --</option>
                  {mainCategories.map((c) => (
                    <option key={c._id} value={c._id}>{c.name}</option>
                  ))}
                </select>
              )}
            </div>
          )}

          {/* Image Upload (only for Main categories) */}
          {type === 'Main' && (
            <div>
              <label className="block text-xs font-bold text-zinc-500 uppercase tracking-wider mb-2">
                Upload Images (1. Desktop, 2. Mobile)
              </label>
              <div className="flex items-center gap-3">
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={handleImageChange}
                  className="flex-1 p-2 border border-zinc-200 rounded-lg focus:ring-2 focus:ring-orange-500/20 focus:outline-none text-xs"
                />
                <span className="text-xs text-zinc-400 font-bold">{images.length}/2</span>
              </div>

              {/* Preview Grid with Labels */}
              <div className="mt-4 grid grid-cols-2 gap-4">
                {imagePreviews.map((url, i) => (
                  <div key={i} className="relative group">
                    <img
                      src={url}
                      alt={`Img ${i + 1}`}
                      className="w-full h-32 object-cover rounded-lg border border-zinc-200 shadow-sm"
                    />
                    <button
                      type="button"
                      onClick={() => removeImage(i)}
                      className="absolute top-2 right-2 bg-red-500 text-white w-6 h-6 rounded-full flex items-center justify-center text-[10px] opacity-0 group-hover:opacity-100 transition cursor-pointer"
                    >
                      ✕
                    </button>
                    {/* Add labels for Mobile and Desktop */}
                    <div className="absolute bottom-2 left-2 bg-black/60 text-white text-[9px] font-bold px-1.5 py-0.5 rounded">
                      {i === 0 ? 'Desktop' : 'Mobile'}
                    </div>
                  </div>
                ))}
                {images.length < 2 &&
                  Array.from({ length: 2 - images.length }).map((_, i) => (
                    <div
                      key={i}
                      className="border border-dashed border-zinc-300 rounded-lg h-32 flex items-center justify-center text-zinc-400 text-xs font-bold bg-zinc-50/50"
                    >
                       + Image {images.length + i + 1} {i === 0 ? 'Desktop' : 'Mobile'}
                    </div>
                  ))}
              </div>
            </div>
          )}

          {/* Submit Button */}
          <div className="mt-6">
            <button
              onClick={handleSubmit}
              disabled={loading || (type === 'Main' && images.length !== 2)}
              className="w-full py-2.5 px-4 bg-zinc-900 text-white rounded-lg hover:bg-zinc-800 disabled:bg-zinc-200 disabled:text-zinc-400 disabled:cursor-not-allowed transition font-semibold text-xs cursor-pointer flex justify-center items-center shadow-sm"
            >
              {loading ? (
                <div className="flex justify-center items-center">
                  <svg className="animate-spin h-4 w-4 mr-2 text-white" viewBox="0 0 24 24" fill="none">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Adding...
                </div>
              ) : (
                'Add Category'
              )}
            </button>
          </div>
        </div>
      </div>
      <ToastContainer />
    </>
  );
};

export default AddCategoryForm;
