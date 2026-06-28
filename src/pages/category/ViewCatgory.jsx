import React, { useState, useEffect } from 'react';
import { useParams, NavLink } from 'react-router-dom';
import { getCategory } from '../../services/CategoryApi';

const ViewCategory = () => {
  const { categoryId } = useParams();
  const [category, setCategory] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetch = async () => {
      try {
        const data = await getCategory(categoryId);
        setCategory(data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetch();
  }, [categoryId]);

  if (loading) return <div className="text-center py-10 text-xl">Loading...</div>;
  if (!category) return <div className="text-center py-10 text-red-600">Category not found</div>;

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-6">
      {/* Header Card */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-white border border-zinc-200/80 rounded-xl p-4 shadow-sm">
        <div>
          <h1 className="text-xl font-bold text-zinc-900">Category Details</h1>
          <p className="text-xs text-zinc-500">View information and images associated with this product category.</p>
        </div>
        <div className="flex gap-2">
          <NavLink
            to="/admin/categories"
            className="inline-flex items-center px-3.5 py-1.5 bg-white border border-zinc-200 hover:bg-zinc-50 text-zinc-700 text-xs font-semibold rounded-lg transition"
          >
            Back to List
          </NavLink>
          <NavLink
            to={`/admin/editCategory/${category._id}`}
            className="inline-flex items-center px-3.5 py-1.5 bg-zinc-900 hover:bg-zinc-800 text-white text-xs font-semibold rounded-lg transition"
          >
            Edit Category
          </NavLink>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Images Card */}
        <div className="bg-white border border-zinc-200 rounded-xl p-5 shadow-sm space-y-4">
          <h3 className="text-xs font-bold text-zinc-700 uppercase tracking-wider">Category Images</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <span className="text-[10px] font-semibold text-zinc-400 block mb-1 uppercase">Desktop</span>
              {category.image?.[0] ? (
                <img src={category.image[0]} alt="Desktop View" className="w-full h-32 object-cover rounded-lg border border-zinc-200" />
              ) : (
                <div className="bg-zinc-50 border border-dashed rounded-lg h-32 flex items-center justify-center text-zinc-400 text-xs">
                  No Image
                </div>
              )}
            </div>
            <div>
              <span className="text-[10px] font-semibold text-zinc-400 block mb-1 uppercase">Mobile</span>
              {category.image?.[1] ? (
                <img src={category.image[1]} alt="Mobile View" className="w-full h-32 object-cover rounded-lg border border-zinc-200" />
              ) : (
                <div className="bg-zinc-50 border border-dashed rounded-lg h-32 flex items-center justify-center text-zinc-400 text-xs">
                  No Image
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Details Card */}
        <div className="md:col-span-2 bg-white border border-zinc-200 rounded-xl p-5 shadow-sm space-y-5">
          <div>
            <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider block mb-0.5">Category Name</span>
            <h2 className="text-lg font-bold text-zinc-900">{category.name}</h2>
          </div>

          <div>
            <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider block mb-1">Description</span>
            <p className="text-sm text-zinc-600 leading-relaxed">{category.description || 'No description provided.'}</p>
          </div>

          <div className="grid grid-cols-2 gap-4 text-xs border-t border-zinc-100 pt-4">
            <div>
              <span className="text-zinc-400 font-semibold uppercase block mb-0.5">Type</span>
              <span className="text-zinc-800 font-medium">{category.type} Category</span>
            </div>
            <div>
              <span className="text-zinc-400 font-semibold uppercase block mb-0.5">Parent Category</span>
              <span className="text-zinc-800 font-medium">{category.parentCategory?.name || '—'}</span>
            </div>
            <div>
              <span className="text-zinc-400 font-semibold uppercase block mb-0.5">Display Order</span>
              <span className="text-zinc-800 font-medium">{category.displayOrder || '1'}</span>
            </div>
            <div>
              <span className="text-zinc-400 font-semibold uppercase block mb-0.5">Status</span>
              <span>
                {category.isActive !== false ? (
                  <span className="inline-block bg-green-50 text-green-700 text-[10px] font-bold px-2 py-0.5 rounded border border-green-200">Active</span>
                ) : (
                  <span className="inline-block bg-zinc-100 text-zinc-500 text-[10px] font-bold px-2 py-0.5 rounded border border-zinc-200">Inactive</span>
                )}
              </span>
            </div>
          </div>

          <div className="text-[10px] text-zinc-400 pt-2 border-t border-zinc-100 flex justify-between">
            <span>ID: {category._id}</span>
            <span>Created: {new Date(category.createdAt).toLocaleDateString()}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ViewCategory;