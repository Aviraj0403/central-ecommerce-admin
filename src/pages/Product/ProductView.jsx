import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getProduct } from '../../services/ProductApi';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { FaEdit } from 'react-icons/fa';
import { toast } from 'react-hot-toast';

const ProductView = () => {
  const { productId } = useParams();
  const navigate = useNavigate();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [expandedSections, setExpandedSections] = useState({
    variants: false,
    additionalInfo: false,
  });

  useEffect(() => {
    fetchProduct();
  }, [productId]);

  const fetchProduct = async () => {
    try {
      setLoading(true);
      const res = await getProduct(productId);
      if (res.success && res.product) {
        setProduct(res.product);
      } else {
        toast.error('Product not found');
      }
    } catch (error) {
      console.error('Error fetching product:', error);
      toast.error('Failed to fetch product details');
    } finally {
      setLoading(false);
    }
  };

  const toggleSection = (section) => {
    setExpandedSections((prev) => ({ ...prev, [section]: !prev[section] }));
  };

  const handleNextImage = () => {
    if (product?.pimages?.length > 1) {
      setCurrentImageIndex((prev) => (prev + 1) % product.pimages.length);
    }
  };

  const handlePrevImage = () => {
    if (product?.pimages?.length > 1) {
      setCurrentImageIndex((prev) => (prev - 1 + product.pimages.length) % product.pimages.length);
    }
  };

  const handleEditProduct = () => {
    navigate(`/admin/editProduct/${productId}`);
  };

  if (loading) {
    return (
      <div className="p-4 sm:p-6 text-center text-gray-500">
        <div className="text-sm sm:text-base">Loading product details...</div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="p-4 sm:p-6 text-center text-gray-600">
        <p className="text-sm sm:text-base font-medium">Product not found.</p>
        <button
          onClick={() => navigate(-1)}
          className="mt-4 px-4 py-2 bg-orange-500 text-white rounded-md hover:bg-orange-600 transition-colors"
        >
          Go Back
        </button>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-6">
      {/* Header Card */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-white border border-zinc-200/80 rounded-xl p-4 shadow-sm">
        <div>
          <h1 className="text-xl font-bold text-zinc-900">{product.name}</h1>
          <p className="text-xs text-zinc-500">View detailed catalog product metadata and variants.</p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => navigate(-1)}
            className="inline-flex items-center px-3.5 py-1.5 bg-white border border-zinc-200 hover:bg-zinc-50 text-zinc-700 text-xs font-semibold rounded-lg transition"
          >
            <ChevronLeft size={14} className="mr-1" />
            Back
          </button>
          <button
            onClick={handleEditProduct}
            className="inline-flex items-center px-3.5 py-1.5 bg-zinc-900 hover:bg-zinc-800 text-white text-xs font-semibold rounded-lg transition"
          >
            <FaEdit size={12} className="mr-1.5" />
            Edit Product
          </button>
        </div>
      </div>

      {/* Image Carousel */}
      <div className="relative bg-zinc-50 border border-zinc-200 rounded-xl overflow-hidden shadow-sm">
        {product.pimages && product.pimages.length > 0 ? (
          <div className="relative group max-w-2xl mx-auto">
            <img
              src={product.pimages[currentImageIndex]}
              alt={product.name}
              className="w-full h-64 sm:h-96 object-contain bg-zinc-50"
            />
            {product.pimages.length > 1 && (
              <>
                <button
                  onClick={handlePrevImage}
                  className="absolute left-3 top-1/2 transform -translate-y-1/2 bg-white/90 border border-zinc-200 shadow text-zinc-800 p-2 rounded-full hover:bg-zinc-50 transition"
                >
                  <ChevronLeft size={16} />
                </button>
                <button
                  onClick={handleNextImage}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 bg-white/90 border border-zinc-200 shadow text-zinc-800 p-2 rounded-full hover:bg-zinc-50 transition"
                >
                  <ChevronRight size={16} />
                </button>
              </>
            )}
            <div className="absolute bottom-3 left-1/2 transform -translate-x-1/2 bg-black/60 px-3 py-1 rounded-full text-white text-[10px] font-semibold">
              {currentImageIndex + 1} / {product.pimages.length}
            </div>
          </div>
        ) : (
          <div className="w-full h-64 sm:h-80 flex items-center justify-center">
            <span className="text-zinc-400 text-xs">No image available</span>
          </div>
        )}
      </div>

      {/* Info Section */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* Details Card */}
        <div className="md:col-span-2 space-y-6">
          {/* Description */}
          <div className="bg-white border border-zinc-200 rounded-xl p-5 shadow-sm space-y-2">
            <h3 className="text-xs font-bold text-zinc-700 uppercase tracking-wider">Description</h3>
            <p className="text-sm text-zinc-600 leading-relaxed">{product.description || 'No description provided.'}</p>
          </div>

          {/* Details Table Grid */}
          <div className="bg-white border border-zinc-200 rounded-xl p-5 shadow-sm space-y-3">
            <h3 className="text-xs font-bold text-zinc-700 uppercase tracking-wider">Details</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-3 text-sm">
              <div className="flex justify-between border-b border-zinc-100 pb-1">
                <span className="text-zinc-500 font-medium">Category</span>
                <span className="text-zinc-800 font-semibold">{product.category?.name || 'N/A'}</span>
              </div>
              <div className="flex justify-between border-b border-zinc-100 pb-1">
                <span className="text-zinc-500 font-medium">Subcategory</span>
                <span className="text-zinc-800 font-semibold">{product.subCategory?.name || 'N/A'}</span>
              </div>
              <div className="flex justify-between border-b border-zinc-100 pb-1">
                <span className="text-zinc-500 font-medium">Brand</span>
                <span className="text-zinc-800 font-semibold">{product.brand || 'N/A'}</span>
              </div>
              <div className="flex justify-between border-b border-zinc-100 pb-1">
                <span className="text-zinc-500 font-medium">Status</span>
                <span>
                  {product.status === 'Active' ? (
                    <span className="bg-green-50 text-green-700 text-[10px] font-bold px-2 py-0.5 rounded border border-green-200">Active</span>
                  ) : (
                    <span className="bg-zinc-100 text-zinc-500 text-[10px] font-bold px-2 py-0.5 rounded border border-zinc-200">Inactive</span>
                  )}
                </span>
              </div>
              <div className="flex justify-between border-b border-zinc-100 pb-1">
                <span className="text-zinc-500 font-medium">Discount</span>
                <span className="text-zinc-800 font-semibold">{product.discount ? `${product.discount}%` : 'None'}</span>
              </div>
              <div className="flex justify-between border-b border-zinc-100 pb-1">
                <span className="text-zinc-500 font-medium">Weight</span>
                <span className="text-zinc-800 font-semibold">{product.weight ? `${product.weight} kg` : 'N/A'}</span>
              </div>
            </div>
          </div>

          {/* Variants */}
          <div className="bg-white border border-zinc-200 rounded-xl p-5 shadow-sm space-y-3">
            <button
              className="w-full flex justify-between items-center text-xs font-bold text-zinc-700 uppercase tracking-wider focus:outline-none"
              onClick={() => toggleSection('variants')}
            >
              <span>Variants ({product.variants?.length || 0})</span>
              <span className="text-[10px] text-zinc-400 font-semibold">{expandedSections.variants ? 'COLLAPSE' : 'EXPAND'}</span>
            </button>
            {expandedSections.variants && (
              <div className="space-y-2 pt-2">
                {product.variants?.length > 0 ? (
                  <div className="divide-y divide-zinc-100 border border-zinc-200 rounded-lg overflow-hidden">
                    {product.variants.map((variant, idx) => (
                      <div
                        key={idx}
                        className="flex justify-between items-center p-3 bg-zinc-50/20 text-xs"
                      >
                        <span className="font-semibold text-zinc-800">
                          {variant.size} / {variant.color.join(", ")}
                        </span>
                        <div className="font-semibold text-zinc-900">
                          ₹{variant.price.toFixed(2)}{' '}
                          {variant.stockQty > 0 ? (
                            <span className="text-green-600 font-normal ml-1">({variant.stockQty} in stock)</span>
                          ) : (
                            <span className="text-red-500 font-normal ml-1">(Out of stock)</span>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-xs text-zinc-500">No variants available.</p>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Sidebar Info Card */}
        <div className="space-y-6">
          {/* Metadata Card */}
          <div className="bg-zinc-50/50 border border-zinc-200 rounded-xl p-5 shadow-sm space-y-3.5 text-xs text-zinc-600">
            <h3 className="text-xs font-bold text-zinc-700 uppercase tracking-wider border-b border-zinc-200/60 pb-1.5">System Tags</h3>
            
            <div className="space-y-1">
              <span className="text-zinc-400 uppercase font-semibold text-[9px] tracking-wider block">Created By</span>
              <span className="text-zinc-800 font-medium block">{product.createdBy || 'Unknown'}</span>
            </div>

            <div className="space-y-1">
              <span className="text-zinc-400 uppercase font-semibold text-[9px] tracking-wider block">Created At</span>
              <span className="text-zinc-800 font-medium block">{product.createdAt ? new Date(product.createdAt).toLocaleString() : 'N/A'}</span>
            </div>

            <div className="space-y-1">
              <span className="text-zinc-400 uppercase font-semibold text-[9px] tracking-wider block">Last Updated</span>
              <span className="text-zinc-800 font-medium block">{product.updatedAt ? new Date(product.updatedAt).toLocaleString() : 'N/A'}</span>
            </div>
          </div>

          {/* Additional Info Block */}
          <div className="bg-white border border-zinc-200 rounded-xl p-5 shadow-sm space-y-3">
            <button
              className="w-full flex justify-between items-center text-xs font-bold text-zinc-700 uppercase tracking-wider focus:outline-none"
              onClick={() => toggleSection('additionalInfo')}
            >
              <span>Usage & Info</span>
              <span className="text-[10px] text-zinc-400 font-semibold">{expandedSections.additionalInfo ? 'COLLAPSE' : 'EXPAND'}</span>
            </button>
            {expandedSections.additionalInfo && (
              <div className="space-y-3.5 text-xs pt-2">
                {product.additionalInfo?.skinType && (
                  <div>
                    <span className="text-zinc-400 uppercase font-semibold text-[9px] tracking-wider block">Skin Type</span>
                    <span className="text-zinc-800 font-medium">{product.additionalInfo.skinType}</span>
                  </div>
                )}
                {product.additionalInfo?.shelfLife && (
                  <div>
                    <span className="text-zinc-400 uppercase font-semibold text-[9px] tracking-wider block">Shelf Life</span>
                    <span className="text-zinc-800 font-medium">{product.additionalInfo.shelfLife} months</span>
                  </div>
                )}
                {product.additionalInfo?.usageInstructions && (
                  <div>
                    <span className="text-zinc-400 uppercase font-semibold text-[9px] tracking-wider block">How to Use</span>
                    <p className="text-zinc-700 leading-relaxed mt-1 font-medium">{product.additionalInfo.usageInstructions}</p>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Custom Flags */}
          <div className="flex flex-wrap gap-1.5">
            {product.isHotProduct && (
              <span className="px-2.5 py-1 bg-red-50 text-red-600 text-[10px] font-bold rounded-md border border-red-200">
                HOT PRODUCT
              </span>
            )}
            {product.isFeatured && (
              <span className="px-2.5 py-1 bg-blue-50 text-blue-600 text-[10px] font-bold rounded-md border border-blue-200">
                FEATURED
              </span>
            )}
            {product.isBestSeller && (
              <span className="px-2.5 py-1 bg-amber-50 text-amber-600 text-[10px] font-bold rounded-md border border-amber-200">
                BEST SELLER
              </span>
            )}
            {Array.isArray(product.tags) && product.tags.map((tag, i) => (
              <span key={i} className="px-2.5 py-1 bg-zinc-50 text-zinc-600 text-[10px] font-semibold rounded-md border border-zinc-200">
                {tag.toUpperCase()}
              </span>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
};

export default ProductView;