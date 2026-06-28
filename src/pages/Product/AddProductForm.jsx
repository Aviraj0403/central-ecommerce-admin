import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

import { createProduct } from "../../services/ProductApi";
import { getAllCategories, getSubCategories } from "../../services/CategoryApi";


export default function AddProductForm() {
  const navigate = useNavigate();

  /* ------------------ STATE ------------------ */
  const [formData, setFormData] = useState({
    name: "",
    brand: "",
    description: "",
    category: "",
    subCategory: "",
    discount: 0,
    tags: "",
    isFeatured: false,
    isHotProduct: false,
    isBestSeller: false,
    status: "Active",
    additionalInfo: {
      skinType: "",
      shelfLife: 12,
      usageInstructions: "",
    },
    weight: 0.5,  // Default weight in kg
    dimensions: {
      length: 10,
      breadth: 10,
      height: 10,
    },
    hsn: "3304",  // HSN code for cosmetics
    sku: "",
    variants: [],
  });

  const [images, setImages] = useState([]);
  const [previews, setPreviews] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [subCategories, setSubCategories] = useState([]);
  const [variant, setVariant] = useState({
    size: "",
    color: [],
    price: "",
    stockQty: "",
    packaging: "",
  });
  const [currentColor, setCurrentColor] = useState("");
  /* ------------------ FETCH CATEGORIES ------------------ */
  useEffect(() => {
    async function fetchCategories() {
      try {
        const res = await getAllCategories({
          page: 1,
          limit: 200,
          search: "",
          sortField: "name",
          sortOrder: 1,
        });
        if (res.success && Array.isArray(res.categories)) {
          setCategories(res.categories);
        } else {
          throw new Error("Failed to fetch categories.");
        }
      } catch (err) {
        toast.error("Failed to load categories.", {
          style: { background: "#f97316", color: "#fff" },
        });
      }
    }
    fetchCategories();
  }, []);

  useEffect(() => {
    async function fetchSubCategories() {
      if (formData.category) {
        try {
          const subs = await getSubCategories(formData.category);
          setSubCategories(subs);
        }
        catch (err) {
          toast.error("Failed to load sub-categories.", {
            style: { background: "#f97316", color: "#fff" },
          });
        }
      } else {
        setSubCategories([]);
      }
    }
    fetchSubCategories();
  }, [formData.category]);



  /* ------------------ HANDLERS ------------------ */
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    if (name === "discount" && value < 0) {
      setFormData((prev) => ({
        ...prev,
        [name]: 1, // Set discount to 1 if the value is negative
      }));
      return; // Exit the function early to prevent further processing
    }
    if (name === "category") {
      setFormData((prev) => ({
        ...prev,
        category: value,
        subCategory: "", // Reset subCategory
      }));
    } else if (name.startsWith("additionalInfo.")) {
      const field = name.split(".")[1];
      setFormData((prev) => ({
        ...prev,
        additionalInfo: { ...prev.additionalInfo, [field]: value },
      }));
    } else if (name.startsWith("dimensions.")) {
      const field = name.split(".")[1];
      setFormData((prev) => ({
        ...prev,
        dimensions: { ...prev.dimensions, [field]: parseFloat(value) || 0 },
      }));
    } else {
      setFormData((prev) => ({
        ...prev,
        [name]: type === "checkbox" ? checked : value,
      }));
    }
  };

  // const handleVariantChange = (field, val) => {
  //   setVariant((prev) => ({ ...prev, [field]: val }));
  // };

  // const addVariant = () => {
  //   const { size, color, price, stockQty, packaging } = variant;

  //   if (!size || !color || !price || isNaN(parseFloat(price))) {
  //     toast.error("Size, Color, and Price are required.", {
  //       style: { background: "#f97316", color: "#fff" },
  //     });
  //     return;
  //   }

  //   const alreadyExists = formData.variants.some(
  //     (v) => v.size === size && v.color === color
  //   );
  //   if (alreadyExists) {
  //     toast.error("Variant with this size & color already exists.", {
  //       style: { background: "#f97316", color: "#fff" },
  //     });
  //     return;
  //   }

  //   setFormData((prev) => ({
  //     ...prev,
  //     variants: [
  //       ...prev.variants,
  //       {
  //         size,
  //         color,
  //         price: parseFloat(price),
  //         stockQty: parseInt(stockQty) || 0,
  //         packaging,
  //       },
  //     ],
  //   }));

  //   setVariant({ size: "", color: "", price: "", stockQty: "", packaging: "Bottle" });
  //   toast.success("Variant added!", {
  //     style: { background: "#f97316", color: "#fff" },
  //   });
  // };

  const addColorToVariant = () => {
    if (!currentColor.trim()) return;

    const normalized = currentColor.trim().toLowerCase();
    if (variant.color.some(c => c.toLowerCase() === normalized)) {
      toast.error("Color already added!");
      return;
    }

    setVariant(prev => ({
      ...prev,
      color: [...prev.color, currentColor.trim()]
    }));
    setCurrentColor("");
  };
  const removeColorFromVariant = (colorToRemove) => {
    setVariant(prev => ({
      ...prev,
      color: prev.color.filter(c => c !== colorToRemove)
    }));
  };


  const addVariant = () => {
    const { size, color, price, stockQty, packaging } = variant;

    if (!size.trim()) {
      toast.error("Size is required.");
      return;
    }
    if (color.length === 0) {
      toast.error("At least one color is required.");
      return;
    }
    if (!price || isNaN(parseFloat(price))) {
      toast.error("Valid price is required.");
      return;
    }

    // Check for duplicate variant (same size + same colors)
    const alreadyExists = formData.variants.some(v =>
      v.size === size &&
      v.color.length === color.length &&
      v.color.every(c => color.includes(c)) &&
      color.every(c => v.color.includes(c))
    );

    if (alreadyExists) {
      toast.error("This variant (size + colors) already exists.");
      return;
    }

    setFormData(prev => ({
      ...prev,
      variants: [
        ...prev.variants,
        {
          size: size.trim(),
          color: [...color], // copy array
          price: parseFloat(price),
          stockQty: parseInt(stockQty) || 0,
          packaging: packaging || "Bottle",
        },
      ],
    }));

    // Reset variant form
    setVariant({
      size: "",
      color: [],
      price: "",
      stockQty: "",
      packaging: "Bottle",
    });
    setCurrentColor("");

    toast.success("Variant added successfully!");
  };

  const removeVariant = (index) => {
    setFormData((prev) => ({
      ...prev,
      variants: prev.variants.filter((_, i) => i !== index),
    }));
    toast.success("Variant removed!", {
      style: { background: "#f97316", color: "#fff" },
    });
  };

  const handleFileChange = (e) => {
    const files = Array.from(e.target.files);
    if (files.length + images.length > 5) {
      toast.error("You can upload a maximum of 5 images.");
      return;
    }
    const newPreviews = files.map((file) => URL.createObjectURL(file));
    setImages((prev) => [...prev, ...files]);
    setPreviews((prev) => [...prev, ...newPreviews]);
    toast.success(`${files.length} image${files.length > 1 ? "s" : ""} uploaded!`, {
      style: { background: "#f97316", color: "#fff" },
    });
  };

  const removeImages = () => {
    setImages([]);
    setPreviews([]);
    toast.success("All images removed!", {
      style: { background: "#f97316", color: "#fff" },
    });
  };

  /* ------------------ SUBMIT ------------------ */
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (images.length === 0) {
      toast.error("At least one image is required.");
      return;
    }

    if (formData.variants.length === 0) {
      toast.error("At least one variant is required.");
      return;
    }

    setLoading(true);

    const fd = new FormData();

    // Append all fields except variants, additionalInfo, and dimensions
    Object.entries(formData).forEach(([key, val]) => {
      if (key !== "variants" && key !== "additionalInfo" && key !== "dimensions") {
        fd.append(key, val);
      }
    });

    // Append tags (backend will split by comma)
    fd.append("tags", formData.tags);

    // Append additionalInfo as JSON string
    fd.append("additionalInfo", JSON.stringify(formData.additionalInfo));

    // Append dimensions as JSON string
    fd.append("dimensions", JSON.stringify(formData.dimensions));

    // Append variants with indexed keys (exact match to backend)
    formData.variants.forEach((variant, index) => {
      fd.append(`variants[${index}][size]`, variant.size);
      variant.color.forEach((color) => {
        fd.append(`variants[${index}][color][]`, color);
      });
      fd.append(`variants[${index}][price]`, variant.price);
      fd.append(`variants[${index}][stockQty]`, variant.stockQty);
      fd.append(`variants[${index}][packaging]`, variant.packaging);
    });

    // Append images
    images.forEach((file) => fd.append("pimages", file));

    try {
      const data = await createProduct(fd);
      if (data.success) {
        toast.success("Product created successfully!", {
          style: { background: "#f97316", color: "#fff" },
        });
        resetForm();
        navigate("/admin/adminProducts");
      } else {
        toast.error(data.message || "Failed to create product.", {
          style: { background: "#f97316", color: "#fff" },
        });
      }
    } catch (err) {
      console.error("Error:", err);
      toast.error(err.response?.data?.message || "Server error occurred.", {
        style: { background: "#f97316", color: "#fff" },
      });
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      name: "",
      brand: "",
      description: "",
      category: "",
      subCategory: "",
      discount: 0,
      tags: "",
      isFeatured: false,
      isHotProduct: false,
      isBestSeller: false,
      status: "Active",
      additionalInfo: { skinType: "", shelfLife: 12, usageInstructions: "" },
      weight: 0.5,
      dimensions: { length: 10, breadth: 10, height: 10 },
      hsn: "3304",
      sku: "",
      variants: [],
    });
    removeImages();
  };

  /* ------------------ RENDER ------------------ */
  return (
    <div className="p-6 max-w-4xl mx-auto space-y-6">
      <ToastContainer />
      <div className="bg-white border border-zinc-200/80 rounded-xl shadow-sm p-6 sm:p-8">
        <h1 className="text-2xl font-bold text-zinc-900 mb-6">
          Add New Product
        </h1>

        {/* Image Upload Section */}
        <div className="mb-6">
          <div className="bg-zinc-50/50 border border-dashed border-zinc-200 rounded-xl p-6 text-center">
            {previews.length > 0 ? (
              <div className="grid grid-cols-2 sm:grid-cols-5 gap-4 mb-4">
                {previews.map((src, idx) => (
                  <div key={idx} className="relative group rounded-lg overflow-hidden border border-zinc-200">
                    <img
                      src={src}
                      alt={`Preview ${idx + 1}`}
                      className="w-full h-24 object-cover"
                    />
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-zinc-500">No images uploaded yet</p>
            )}
            {previews.length > 0 && (
              <button
                type="button"
                onClick={removeImages}
                className="mt-2 text-xs bg-red-50 text-red-600 border border-red-200 px-3 py-1.5 rounded-lg hover:bg-red-100 transition"
              >
                Remove All Images
              </button>
            )}
            {previews.length < 5 && (
              <div className="mt-3">
                <input
                  type="file"
                  id="product-image-upload"
                  multiple
                  accept="image/*"
                  onChange={handleFileChange}
                  className="hidden"
                />
                <label
                  htmlFor="product-image-upload"
                  className="inline-flex items-center text-xs bg-white text-zinc-700 border border-zinc-300 hover:bg-zinc-50 px-4 py-2 rounded-lg cursor-pointer transition font-medium"
                >
                  Upload Images (max 5)
                </label>
              </div>
            )}
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Name, Brand, Description */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <InputField
              label="Name *"
              name="name"
              value={formData.name}
              onChange={handleChange}
              placeholder="Enter product name"
            />
            <InputField
              label="Brand *"
              name="brand"
              value={formData.brand}
              onChange={handleChange}
              placeholder="e.g. L'Oréal, Himalaya"
            />
          </div>
          <TextAreaField
            label="Description *"
            name="description"
            value={formData.description}
            onChange={handleChange}
            placeholder="Describe the product (min 10 characters)"
          />

          {/* Category & Sub-Category */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-zinc-600 mb-1.5 uppercase tracking-wider">
                Category *
              </label>
              <select
                name="category"
                value={formData.category}
                onChange={handleChange}
                required
                className="w-full border border-zinc-200 rounded-lg p-2.5 text-sm bg-white focus:ring-1 focus:ring-orange-500 focus:border-orange-500 focus:outline-none transition"
              >
                <option value="">Select Category</option>
                {categories
                  .filter((cat) => cat.type === "Main")
                  .map((cat) => (
                    <option key={cat._id} value={cat._id}>
                      {cat.name}
                    </option>
                  ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-zinc-600 mb-1.5 uppercase tracking-wider">
                Sub-Category
              </label>
              <select
                name="subCategory"
                value={formData.subCategory}
                onChange={handleChange}
                disabled={!formData.category}
                className={`w-full border border-zinc-200 rounded-lg p-2.5 text-sm bg-white focus:ring-1 focus:ring-orange-500 focus:border-orange-500 focus:outline-none transition ${!formData.category ? "bg-zinc-50 cursor-not-allowed text-zinc-400" : ""
                  }`}
              >
                <option value="">
                  {formData.category ? "None (Optional)" : "Select Main Category First"}
                </option>
                {subCategories.map((sub) => (
                  <option key={sub._id} value={sub._id}>
                    {sub.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Tags & Discount */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <InputField
              label="Tags (comma separated)"
              name="tags"
              value={formData.tags}
              onChange={handleChange}
              placeholder="e.g. organic, vegan, premium"
            />
            <InputField
              label="Discount (%)"
              name="discount"
              type="number"
              min="0"
              max="100"
              value={formData.discount}
              onChange={handleChange}
              placeholder="e.g. 10"
            />
          </div>

          {/* Additional Info */}
          <div className="border border-zinc-200/80 rounded-xl p-5 space-y-4 bg-zinc-50/20">
            <h2 className="text-sm font-bold text-zinc-800 uppercase tracking-wider">
              Additional Information
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <InputField
                label="Skin Type"
                name="additionalInfo.skinType"
                value={formData.additionalInfo.skinType}
                onChange={handleChange}
                placeholder="e.g. All, Dry, Oily"
              />
              <InputField
                label="Shelf Life (months)"
                name="additionalInfo.shelfLife"
                type="number"
                value={formData.additionalInfo.shelfLife}
                onChange={handleChange}
                placeholder="e.g. 12"
              />
            </div>
            <TextAreaField
              label="Usage Instructions"
              name="additionalInfo.usageInstructions"
              value={formData.additionalInfo.usageInstructions}
              onChange={handleChange}
              placeholder="How to use the product..."
            />
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
              />
              <InputField
                label="HSN Code"
                name="hsn"
                value={formData.hsn}
                onChange={handleChange}
                placeholder="e.g. 3304"
              />
              <InputField
                label="SKU (Optional)"
                name="sku"
                value={formData.sku}
                onChange={handleChange}
                placeholder="e.g. PROD-001"
              />
            </div>
            <p className="text-[11px] text-zinc-500 mt-2">
              💡 Accurate weight helps calculate correct shipping charges.
            </p>
          </div>

          {/* Variants Section */}
          <div className="border border-zinc-200 rounded-xl p-5 bg-white space-y-4">
            <h2 className="text-sm font-bold text-zinc-800 uppercase tracking-wider flex items-center gap-2">
              <span className="w-5 h-5 bg-orange-500 rounded-full flex items-center justify-center text-white text-[10px]">V</span>
              Product Variants
            </h2>

            {/* Variant Input Card */}
            <div className="bg-zinc-50/50 rounded-lg p-4 border border-zinc-200 space-y-4">
              {/* Size + Price + Stock Row */}
              <div className="grid grid-cols-1 sm:grid-cols-3 lg:grid-cols-4 gap-4">
                <div>
                  <label className="block text-[11px] font-semibold text-zinc-500 mb-1 uppercase">Size / Volume *</label>
                  <input
                    type="text"
                    placeholder="e.g. 100ml, 50g"
                    value={variant.size}
                    onChange={(e) => setVariant(prev => ({ ...prev, size: e.target.value }))}
                    className="w-full px-3 py-2 border border-zinc-200 rounded-lg text-sm focus:ring-1 focus:ring-orange-500 focus:border-orange-500 focus:outline-none transition"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-zinc-500 mb-1 uppercase">Price (₹) *</label>
                  <input
                    type="number"
                    placeholder="299"
                    value={variant.price}
                    onChange={(e) => setVariant(prev => ({ ...prev, price: e.target.value }))}
                    className="w-full px-3 py-2 border border-zinc-200 rounded-lg text-sm focus:ring-1 focus:ring-orange-500 focus:border-orange-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-zinc-500 mb-1 uppercase">Stock Qty</label>
                  <input
                    type="number"
                    placeholder="100"
                    value={variant.stockQty}
                    onChange={(e) => setVariant(prev => ({ ...prev, stockQty: e.target.value }))}
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

              {/* Color Input Section */}
              <div className="pt-2">
                <label className="block text-[11px] font-semibold text-zinc-500 mb-1.5 uppercase">
                  Colors for this Variant *
                </label>

                <div className="flex items-center gap-2 max-w-md">
                  <input
                    type="text"
                    placeholder="Rose Gold, Navy Blue"
                    value={currentColor}
                    onChange={(e) => setCurrentColor(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addColorToVariant())}
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

                {/* Live Color Chips */}
                {variant.color.length > 0 && (
                  <div className="mt-3 flex flex-wrap gap-2">
                    {variant.color.map((col, i) => (
                      <div
                        key={i}
                        className="inline-flex items-center gap-1.5 bg-white border border-zinc-200 rounded-full pl-2 pr-1.5 py-1 text-xs"
                      >
                        <div
                          className="w-3.5 h-3.5 rounded-full border border-black/10"
                          style={{ backgroundColor: col.toLowerCase() }}
                        />
                        <span className="font-medium text-zinc-700">{col}</span>
                        <button
                          type="button"
                          onClick={() => removeColorFromVariant(col)}
                          className="text-zinc-400 hover:text-red-500 font-bold ml-1 px-0.5"
                        >
                          ×
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Added Variants List */}
            {formData.variants.length > 0 && (
              <div className="pt-3 border-t border-zinc-100">
                <h3 className="text-xs font-bold text-zinc-700 mb-3 uppercase tracking-wider">
                  Added Variants ({formData.variants.length})
                </h3>

                <div className="divide-y divide-zinc-100 border border-zinc-200 rounded-lg overflow-hidden">
                  {formData.variants.map((v, idx) => (
                    <div
                      key={idx}
                      className="p-3 bg-zinc-50/30 flex items-center justify-between gap-4 text-xs"
                    >
                      <div className="flex-1 space-y-1">
                        <div className="flex items-center gap-3">
                          <span className="font-semibold text-zinc-950 bg-white px-2 py-0.5 rounded border border-zinc-200">{v.size}</span>
                          <span className="font-medium text-zinc-700">₹{v.price}</span>
                          <span className="text-zinc-500">Stock: {v.stockQty || 0}</span>
                        </div>

                        <div className="flex flex-wrap gap-1.5 pt-0.5">
                          {v.color.map((c, i) => (
                            <span
                              key={i}
                              className="inline-flex items-center gap-1 bg-white px-1.5 py-0.5 rounded border border-zinc-200/80 text-[10px]"
                            >
                              <span
                                className="w-2 h-2 rounded-full border border-black/10"
                                style={{ backgroundColor: c.toLowerCase() }}
                              />
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

          {/* Checkboxes */}
          <div className="flex flex-wrap gap-6 pt-2">
            {[
              ["isBestSeller", "Best Seller"],
              ["isCombo", "Combo"],
            ].map(([key, label]) => (
              <label key={key} className="flex items-center gap-2 cursor-pointer select-none text-sm font-medium text-zinc-700">
                <input
                  type="checkbox"
                  name={key}
                  checked={formData[key]}
                  onChange={handleChange}
                  className="h-4.5 w-4.5 rounded border-zinc-300 text-orange-500 focus:ring-orange-500"
                />
                <span>{label}</span>
              </label>
            ))}
          </div>

          {/* Status */}
          <div>
            <label className="block text-xs font-semibold text-zinc-600 mb-1.5 uppercase tracking-wider">
              Status
            </label>
            <select
              name="status"
              value={formData.status}
              onChange={handleChange}
              className="w-full border border-zinc-200 rounded-lg p-2.5 text-sm bg-white focus:ring-1 focus:ring-orange-500 focus:border-orange-500 focus:outline-none transition"
            >
              <option value="Active">Active</option>
              <option value="Inactive">Inactive</option>
            </select>
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={loading}
            className={`w-full py-3 rounded-lg text-white font-semibold text-sm ${loading
              ? "bg-zinc-400 cursor-not-allowed"
              : "bg-orange-600 hover:bg-orange-700"
              } transition-colors shadow-sm`}
          >
            {loading ? "Saving..." : "Create Product"}
          </button>
        </form>
      </div>
    </div>
  );
}

/* Helper Components */
const InputField = ({ label, name, value, onChange, type = "text", placeholder, ...rest }) => (
  <div>
    <label className="block text-xs font-semibold text-zinc-600 mb-1.5 uppercase tracking-wider">{label}</label>
    <input
      type={type}
      name={name}
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      className="w-full border border-zinc-200 rounded-lg p-2.5 text-sm focus:ring-1 focus:ring-orange-500 focus:border-orange-500 focus:outline-none transition"
      {...rest}
    />
  </div>
);

const TextAreaField = ({ label, name, value, onChange, placeholder }) => (
  <div>
    <label className="block text-xs font-semibold text-zinc-600 mb-1.5 uppercase tracking-wider">{label}</label>
    <textarea
      name={name}
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      rows={3}
      className="w-full border border-zinc-200 rounded-lg p-2.5 text-sm focus:ring-1 focus:ring-orange-500 focus:border-orange-500 focus:outline-none transition"
    />
  </div>
);