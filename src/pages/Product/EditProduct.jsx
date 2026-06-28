// src/pages/admin/EditProductForm.jsx
import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

import {
  getProduct,
  updateProduct,
} from "../../services/ProductApi";
import {
  getAllCategories,
  getSubCategories,
} from "../../services/CategoryApi";

export default function EditProductForm() {
  const { productId } = useParams();
  const navigate = useNavigate();

  /* ------------------ STATE ------------------ */
  const [formData, setFormData] = useState(null);
  const [categories, setCategories] = useState([]);
  const [subCategories, setSubCategories] = useState([]);
  const [loading, setLoading] = useState(false);

  // Images
  const [existingImages, setExistingImages] = useState([]); // from server (URLs)
  const [newImages, setNewImages] = useState([]);           // new File objects
  const [newPreviews, setNewPreviews] = useState([]);       // preview URLs
  const [removedImages, setRemovedImages] = useState([]);  // URLs to delete

  // Temp variant state (for adding new)
  const [variant, setVariant] = useState({
    size: "",
    color: [],
    price: "",
    stockQty: "",
    packaging: "Bottle",
  });
  const [currentColor, setCurrentColor] = useState("");

  /* ------------------ FETCH DATA ------------------ */
  useEffect(() => {
    async function fetchData() {
      try {
        const [prodRes, catRes] = await Promise.all([
          getProduct(productId),
          getAllCategories({ page: 1, limit: 200, search: "", sortField: "name", sortOrder: 1 }),
        ]);

        if (!prodRes.success || !prodRes.product) {
          toast.error("Product not found");
          navigate("/admin/adminProducts");
          return;
        }

        const p = prodRes.product;

        const normalized = {
          name: p.name || "",
          brand: p.brand || "",
          description: p.description || "",
          category: p.category?._id || p.category || "",
          subCategory: p.subCategory?._id || p.subCategory || "",
          discount: p.discount || 0,
          tags: Array.isArray(p.tags) ? p.tags.join(", ") : p.tags || "",
          isFeatured: !!p.isFeatured,
          isHotProduct: !!p.isHotProduct,
          isBestSeller: !!p.isBestSeller,
          status: p.status || "Active",
          weight: p.weight || 0.5,
          hsn: p.hsn || "3304",
          sku: p.sku || "",
          additionalInfo: {
            skinType: p.additionalInfo?.skinType || "",
            shelfLife: p.additionalInfo?.shelfLife || 12,
            usageInstructions: p.additionalInfo?.usageInstructions || "",
          },
          variants: Array.isArray(p.variants)
            ? p.variants.map(v => ({
              size: v.size || "",
              color: Array.isArray(v.color) ? v.color : [v.color].filter(Boolean),
              price: v.price?.toString() || "",
              stockQty: v.stockQty?.toString() || "0",
              packaging: v.packaging || "Bottle",
            }))
            : [],
        };

        setFormData(normalized);
        setExistingImages(p.pimages || []);
        if (catRes.success) setCategories(catRes.categories || []);
      } catch (err) {
        toast.error("Failed to load product");
        console.error(err);
      }
    }

    if (productId) fetchData();
  }, [productId, navigate]);

  useEffect(() => {
    async function fetchSubCategories() {
      if (formData?.category) {
        try {
          const subs = await getSubCategories(formData.category);
          setSubCategories(subs || []);
        } catch {
          toast.error("Failed to load sub-categories");
        }
      } else {
        setSubCategories([]);
      }
    }
    if (formData) fetchSubCategories();
  }, [formData?.category]);

  /* ------------------ HANDLERS ------------------ */
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;

    if (name === "discount" && value < 0) {
      setFormData(prev => ({ ...prev, discount: 0 }));
      return;
    }

    if (name === "category") {
      setFormData(prev => ({ ...prev, category: value, subCategory: "" }));
    } else if (name.startsWith("additionalInfo.")) {
      const field = name.split(".")[1];
      setFormData(prev => ({
        ...prev,
        additionalInfo: { ...prev.additionalInfo, [field]: value },
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: type === "checkbox" ? checked : value,
      }));
    }
  };

  const addColorToVariant = () => {
    if (!currentColor.trim()) return;
    const normalized = currentColor.trim().toLowerCase();
    if (variant.color.some(c => c.toLowerCase() === normalized)) {
      toast.error("Color already added!");
      return;
    }
    setVariant(prev => ({ ...prev, color: [...prev.color, currentColor.trim()] }));
    setCurrentColor("");
  };

  const removeColorFromVariant = (colorToRemove) => {
    setVariant(prev => ({
      ...prev,
      color: prev.color.filter(c => c !== colorToRemove),
    }));
  };

  const addVariant = () => {
    const { size, color, price, stockQty, packaging } = variant;

    if (!size.trim()) return toast.error("Size is required.");
    if (color.length === 0) return toast.error("At least one color is required.");
    if (!price || isNaN(parseFloat(price))) return toast.error("Valid price is required.");

    const alreadyExists = formData.variants.some(v =>
      v.size === size.trim() &&
      v.color.length === color.length &&
      v.color.every(c => color.includes(c)) &&
      color.every(c => v.color.includes(c))
    );

    if (alreadyExists) return toast.error("This variant (size + colors) already exists.");

    setFormData(prev => ({
      ...prev,
      variants: [
        ...prev.variants,
        {
          size: size.trim(),
          color: [...color],
          price: parseFloat(price),
          stockQty: parseInt(stockQty) || 0,
          packaging: packaging || "Bottle",
        },
      ],
    }));

    setVariant({ size: "", color: [], price: "", stockQty: "", packaging: "Bottle" });
    setCurrentColor("");
    toast.success("Variant added!");
  };

  const removeVariant = (index) => {
    setFormData(prev => ({
      ...prev,
      variants: prev.variants.filter((_, i) => i !== index),
    }));
    toast.success("Variant removed!");
  };

  const handleFileChange = (e) => {
    const files = Array.from(e.target.files);
    const totalImages = existingImages.length - removedImages.length + newImages.length + files.length;
    if (totalImages > 5) {
      toast.error("Maximum 5 images allowed.");
      return;
    }
    const previews = files.map(f => URL.createObjectURL(f));
    setNewImages(prev => [...prev, ...files]);
    setNewPreviews(prev => [...prev, ...previews]);
    toast.success(`${files.length} image(s) added!`);
  };

  const removeExistingImage = (url) => {
    setRemovedImages(prev => [...prev, url]);
    setExistingImages(prev => prev.filter(img => img !== url));
  };

  const removeNewImage = (index) => {
    setNewImages(prev => prev.filter((_, i) => i !== index));
    setNewPreviews(prev => prev.filter((_, i) => i !== index));
  };

  const removeAllImages = () => {
    setRemovedImages(prev => [...prev, ...existingImages]);
    setExistingImages([]);
    setNewImages([]);
    setNewPreviews([]);
    toast.success("All images cleared!");
  };

  /* ------------------ SUBMIT ------------------ */
  const handleSubmit = async (e) => {
    e.preventDefault();

    const totalImages = existingImages.length + newImages.length;
    if (totalImages === 0) return toast.error("At least one image is required.");
    if (formData.variants.length === 0) return toast.error("At least one variant is required.");

    setLoading(true);
    const fd = new FormData();

    // Basic fields
    Object.entries(formData).forEach(([key, val]) => {
      if (key !== "variants" && key !== "additionalInfo" && key !== "dimensions") {
        fd.append(key, val);
      }
    });
    fd.append("tags", formData.tags);
    fd.append("additionalInfo", JSON.stringify(formData.additionalInfo));

    // Variants
    formData.variants.forEach((v, i) => {
      fd.append(`variants[${i}][size]`, v.size);
      v.color.forEach(col => fd.append(`variants[${i}][color][]`, col));
      fd.append(`variants[${i}][price]`, v.price);
      fd.append(`variants[${i}][stockQty]`, v.stockQty);
      fd.append(`variants[${i}][packaging]`, v.packaging);
    });

    // Images
    newImages.forEach(file => fd.append("pimages", file));
    if (removedImages.length > 0) {
      fd.append("removedImages", JSON.stringify(removedImages));
    }

    try {
      const res = await updateProduct(productId, fd);
      if (res.success) {
        toast.success("Product updated successfully!");
        navigate("/admin/adminProducts");
      } else {
        toast.error(res.message || "Update failed");
      }
    } catch (err) {
      toast.error(err.response?.data?.message || "Server error");
    } finally {
      setLoading(false);
    }
  };

  if (!formData) return <div className="text-center py-20 text-xl">Loading product...</div>;

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-6">
      <ToastContainer />
      <div className="bg-white border border-zinc-200/80 rounded-xl shadow-sm p-6 sm:p-8">
        <h1 className="text-2xl font-bold text-zinc-900 mb-6">Edit Product</h1>

        {/* Image Upload Section */}
        <div className="mb-6">
          <div className="bg-zinc-50/50 border border-dashed border-zinc-200 rounded-xl p-6 text-center">
            {(() => {
              const totalImages = existingImages.filter(img => !removedImages.includes(img)).length + newPreviews.length;
              return (
                <>
                  {totalImages > 0 ? (
                    <div className="grid grid-cols-2 sm:grid-cols-5 gap-4 mb-4">
                      {existingImages
                        .filter(img => !removedImages.includes(img))
                        .map((src, i) => (
                          <div key={`exist-${i}`} className="relative group rounded-lg overflow-hidden border border-zinc-200">
                            <img src={src} alt="" className="w-full h-24 object-cover" />
                            <button
                              type="button"
                              onClick={() => removeExistingImage(src)}
                              className="absolute top-1 right-1 bg-red-600/90 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs hover:bg-red-700 transition"
                            >
                              ×
                            </button>
                          </div>
                        ))}
                      {newPreviews.map((src, i) => (
                        <div key={`new-${i}`} className="relative group rounded-lg overflow-hidden border border-zinc-200">
                          <img src={src} alt="" className="w-full h-24 object-cover" />
                          <button
                            type="button"
                            onClick={() => removeNewImage(i)}
                            className="absolute top-1 right-1 bg-red-600/90 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs hover:bg-red-700 transition"
                          >
                            ×
                          </button>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-zinc-500">No images uploaded</p>
                  )}

                  {totalImages > 0 && (
                    <button
                      type="button"
                      onClick={removeAllImages}
                      className="mt-2 text-xs bg-red-50 text-red-600 border border-red-200 px-3 py-1.5 rounded-lg hover:bg-red-100 transition"
                    >
                      Remove All Images
                    </button>
                  )}

                  {totalImages < 5 && (
                    <div className="mt-3">
                      <input
                        type="file"
                        id="edit-image-upload"
                        multiple
                        accept="image/*"
                        onChange={handleFileChange}
                        className="hidden"
                      />
                      <label
                        htmlFor="edit-image-upload"
                        className="inline-flex items-center text-xs bg-white text-zinc-700 border border-zinc-300 hover:bg-zinc-50 px-4 py-2 rounded-lg cursor-pointer transition font-medium"
                      >
                        Upload More Images ({5 - totalImages} left)
                      </label>
                    </div>
                  )}

                  {totalImages >= 5 && (
                    <p className="mt-3 text-xs text-orange-600 font-medium">
                      Maximum 5 images reached
                    </p>
                  )}
                </>
              );
            })()}
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Basic Fields */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <InputField label="Name *" name="name" value={formData.name} onChange={handleChange} />
            <InputField label="Brand *" name="brand" value={formData.brand} onChange={handleChange} />
          </div>
          <TextAreaField label="Description *" name="description" value={formData.description} onChange={handleChange} />

          {/* Category & Subcategory */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-zinc-600 mb-1.5 uppercase tracking-wider">Category *</label>
              <select
                name="category"
                value={formData.category}
                onChange={handleChange}
                required
                className="w-full border border-zinc-200 rounded-lg p-2.5 text-sm bg-white focus:ring-1 focus:ring-orange-500 focus:border-orange-500 focus:outline-none transition"
              >
                <option value="">Select Category</option>
                {categories.filter(c => c.type === "Main").map(c => (
                  <option key={c._id} value={c._id}>{c.name}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-zinc-600 mb-1.5 uppercase tracking-wider">Sub-Category</label>
              <select
                name="subCategory"
                value={formData.subCategory}
                onChange={handleChange}
                disabled={!formData.category}
                className={`w-full border border-zinc-200 rounded-lg p-2.5 text-sm bg-white focus:ring-1 focus:ring-orange-500 focus:border-orange-500 focus:outline-none transition ${!formData.category ? "bg-zinc-50 cursor-not-allowed text-zinc-400" : ""}`}
              >
                <option value="">{formData.category ? "None (Optional)" : "Select Main Category First"}</option>
                {subCategories.map(sub => (
                  <option key={sub._id} value={sub._id}>{sub.name}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <InputField label="Tags (comma separated)" name="tags" value={formData.tags} onChange={handleChange} />
            <InputField label="Discount (%)" name="discount" type="number" min="0" max="100" value={formData.discount} onChange={handleChange} />
          </div>

          {/* Shipping Information */}
          <div className="border border-zinc-200/85 rounded-xl p-5 bg-zinc-50/40">
            <h2 className="text-sm font-bold text-zinc-800 mb-3 uppercase tracking-wider flex items-center gap-1.5">
              <span>📦</span> Shipping Information
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <InputField
                label="Weight (kg) *"
                name="weight"
                type="number"
                step="0.01"
                min="0.01"
                value={formData.weight}
                onChange={handleChange}
                placeholder="e.g. 0.5"
                required
              />
              <InputField
                label="HSN Code"
                name="hsn"
                value={formData.hsn}
                onChange={handleChange}
                placeholder="e.g. 3304"
              />
              <InputField
                label="SKU"
                name="sku"
                value={formData.sku}
                onChange={handleChange}
                placeholder="e.g. GK-LIP-01"
              />
            </div>
            <p className="text-[11px] text-zinc-500 mt-2">
              💡 Accurate weight helps calculate correct shipping charges.
            </p>
          </div>

          {/* Additional Info */}
          <div className="border border-zinc-200/80 rounded-xl p-5 space-y-4 bg-zinc-50/20">
            <h2 className="text-sm font-bold text-zinc-800 uppercase tracking-wider">Additional Information</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <InputField label="Skin Type" name="additionalInfo.skinType" value={formData.additionalInfo.skinType} onChange={handleChange} />
              <InputField label="Shelf Life (months)" name="additionalInfo.shelfLife" type="number" value={formData.additionalInfo.shelfLife} onChange={handleChange} />
            </div>
            <TextAreaField label="Usage Instructions" name="additionalInfo.usageInstructions" value={formData.additionalInfo.usageInstructions} onChange={handleChange} />
          </div>

          {/* Variants Section */}
          <div className="border border-zinc-200 rounded-xl p-5 bg-white space-y-4">
            <h2 className="text-sm font-bold text-zinc-800 uppercase tracking-wider flex items-center gap-2">
              <span className="w-5 h-5 bg-orange-500 rounded-full flex items-center justify-center text-white text-[10px]">V</span>
              Product Variants
            </h2>

            {/* Variant Input Card */}
            <div className="bg-zinc-50/50 rounded-lg p-4 border border-zinc-200 space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-3 lg:grid-cols-4 gap-4">
                <div>
                  <label className="block text-[11px] font-semibold text-zinc-500 mb-1 uppercase">Size / Volume *</label>
                  <input
                    type="text"
                    placeholder="e.g. 100ml, 50g"
                    value={variant.size}
                    onChange={e => setVariant(prev => ({ ...prev, size: e.target.value }))}
                    className="w-full px-3 py-2 border border-zinc-200 rounded-lg text-sm focus:ring-1 focus:ring-orange-500 focus:border-orange-500 focus:outline-none transition"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-zinc-500 mb-1 uppercase">Price (₹) *</label>
                  <input
                    type="number"
                    placeholder="299"
                    value={variant.price}
                    onChange={e => setVariant(prev => ({ ...prev, price: e.target.value }))}
                    className="w-full px-3 py-2 border border-zinc-200 rounded-lg text-sm focus:ring-1 focus:ring-orange-500 focus:border-orange-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-zinc-500 mb-1 uppercase">Stock Qty</label>
                  <input
                    type="number"
                    placeholder="100"
                    value={variant.stockQty}
                    onChange={e => setVariant(prev => ({ ...prev, stockQty: e.target.value }))}
                    className="w-full px-3 py-2 border border-zinc-200 rounded-lg text-sm focus:ring-1 focus:ring-orange-500 focus:border-orange-500 focus:outline-none"
                  />
                </div>
                <div className="flex items-end">
                  <button
                    type="button"
                    onClick={addVariant}
                    disabled={!variant.size || variant.color.length === 0 || !variant.price}
                    className={`w-full py-2 px-3 rounded-lg text-sm font-semibold transition ${!variant.size || variant.color.length === 0 || !variant.price
                      ? "bg-zinc-100 text-zinc-400 cursor-not-allowed border border-zinc-200"
                      : "bg-zinc-900 text-white hover:bg-zinc-800"
                      }`}
                  >
                    Add Variant
                  </button>
                </div>
              </div>

              {/* Color Input */}
              <div className="pt-2">
                <label className="block text-[11px] font-semibold text-zinc-500 mb-1.5 uppercase">Colors for this Variant *</label>
                <div className="flex items-center gap-2 max-w-md">
                  <input
                    type="text"
                    placeholder="Rose Gold, Navy Blue"
                    value={currentColor}
                    onChange={e => setCurrentColor(e.target.value)}
                    onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), addColorToVariant())}
                    className="flex-1 px-3 py-2 border border-zinc-200 rounded-lg text-sm focus:ring-1 focus:ring-orange-500 focus:border-orange-500 focus:outline-none"
                  />
                  <button
                    type="button"
                    onClick={addColorToVariant}
                    className="px-4 py-2 bg-white border border-zinc-300 text-zinc-700 text-sm font-semibold rounded-lg hover:bg-zinc-50 transition"
                  >
                    + Add Color
                  </button>
                </div>

                {/* Color Chips */}
                {variant.color.length > 0 && (
                  <div className="mt-3 flex flex-wrap gap-2">
                    {variant.color.map((col, i) => (
                      <div key={i} className="inline-flex items-center gap-1.5 bg-white border border-zinc-200 rounded-full pl-2 pr-1.5 py-1 text-xs">
                        <div className="w-3.5 h-3.5 rounded-full border border-black/10" style={{ backgroundColor: col.toLowerCase() }} />
                        <span className="font-medium text-zinc-700">{col}</span>
                        <button type="button" onClick={() => removeColorFromVariant(col)} className="text-zinc-400 hover:text-red-500 font-bold ml-1 px-0.5">×</button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Added Variants List */}
            {formData.variants.length > 0 && (
              <div className="pt-3 border-t border-zinc-100">
                <h3 className="text-xs font-bold text-zinc-700 mb-3 uppercase tracking-wider">Added Variants ({formData.variants.length})</h3>
                <div className="divide-y divide-zinc-100 border border-zinc-200 rounded-lg overflow-hidden">
                  {formData.variants.map((v, idx) => (
                    <div key={idx} className="p-3 bg-zinc-50/30 flex items-center justify-between gap-4 text-xs">
                      <div className="flex-1 space-y-1">
                        <div className="flex items-center gap-3">
                          <span className="font-semibold text-zinc-955 bg-white px-2 py-0.5 rounded border border-zinc-200">{v.size}</span>
                          <span className="font-medium text-zinc-700">₹{v.price}</span>
                          <span className="text-zinc-500">Stock: {v.stockQty || 0}</span>
                        </div>
                        <div className="flex flex-wrap gap-1.5 pt-0.5">
                          {v.color.map((c, i) => (
                            <span key={i} className="inline-flex items-center gap-1 bg-white px-1.5 py-0.5 rounded border border-zinc-200/80 text-[10px]">
                              <span className="w-2 h-2 rounded-full border border-black/10" style={{ backgroundColor: c.toLowerCase() }} />
                              <span className="text-zinc-600 font-medium">{c}</span>
                            </span>
                          ))}
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => removeVariant(idx)}
                        className="text-red-600 hover:text-red-700 font-semibold px-2 py-1"
                      >
                        Remove
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Checkboxes & Status */}
          <div className="flex flex-wrap gap-6 pt-2">
            {[
              ["isBestSeller", "Best Seller"],
              ["isCombo", "Combo"],
            ].map(([key, label]) => (
              <label key={key} className="flex items-center gap-2 cursor-pointer select-none text-sm font-medium text-zinc-700">
                <input type="checkbox" name={key} checked={formData[key]} onChange={handleChange} className="h-4.5 w-4.5 rounded border-zinc-300 text-orange-500 focus:ring-orange-500" />
                <span>{label}</span>
              </label>
            ))}
          </div>

          <div>
            <label className="block text-xs font-semibold text-zinc-600 mb-1.5 uppercase tracking-wider">Status</label>
            <select name="status" value={formData.status} onChange={handleChange} className="w-full border border-zinc-200 rounded-lg p-2.5 text-sm bg-white focus:ring-1 focus:ring-orange-500 focus:border-orange-500 focus:outline-none transition">
              <option value="Active">Active</option>
              <option value="Inactive">Inactive</option>
            </select>
          </div>

          <button
            type="submit"
            disabled={loading}
            className={`w-full py-3 rounded-lg text-white font-semibold text-sm ${loading ? "bg-zinc-400 cursor-not-allowed" : "bg-orange-600 hover:bg-orange-700"} transition-colors shadow-sm`}
          >
            {loading ? "Updating..." : "Update Product"}
          </button>
        </form>
      </div>
    </div>
  );
}

/* Reusable Input Components */
const InputField = ({ label, name, value, onChange, type = "text", placeholder, ...props }) => (
  <div>
    <label className="block text-xs font-semibold text-zinc-600 mb-1.5 uppercase tracking-wider">{label}</label>
    <input
      type={type}
      name={name}
      value={value ?? ""}
      onChange={onChange}
      placeholder={placeholder}
      className="w-full border border-zinc-200 rounded-lg p-2.5 text-sm focus:ring-1 focus:ring-orange-500 focus:border-orange-500 focus:outline-none transition"
      {...props}
    />
  </div>
);

const TextAreaField = ({ label, name, value, onChange, placeholder }) => (
  <div>
    <label className="block text-xs font-semibold text-zinc-600 mb-1.5 uppercase tracking-wider">{label}</label>
    <textarea
      name={name}
      value={value ?? ""}
      onChange={onChange}
      placeholder={placeholder}
      rows={3}
      className="w-full border border-zinc-200 rounded-lg p-2.5 text-sm focus:ring-1 focus:ring-orange-500 focus:border-orange-500 focus:outline-none transition"
    />
  </div>
);