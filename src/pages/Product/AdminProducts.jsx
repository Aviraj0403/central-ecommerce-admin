import React, { useState, useEffect } from "react";
import { NavLink } from "react-router-dom";
import { toast } from "react-hot-toast";
import { Pencil, Eye, Trash2, Plus } from "lucide-react";
import { getAdminProduct, deleteProduct } from "../../services/ProductApi";

// ---- Desktop Table Row ----
const ProductTableRow = ({ product, onDelete }) => (
  <tr key={product._id} className="border-b border-zinc-200/60 hover:bg-orange-50/30 transition-colors">
    <td className="px-4 py-3.5 text-center">
      <img
        src={
          product.pimages && product.pimages.length > 0
            ? product.pimages[0]
            : "https://via.placeholder.com/64"
        }
        alt={product.name}
        className="w-10 h-10 object-cover rounded-md mx-auto border border-zinc-200 shadow-sm"
      />
    </td>
    <td className="px-4 py-3.5 text-sm font-medium text-zinc-900">{product.name}</td>
    <td className="px-4 py-3.5 text-sm text-zinc-600">
      {product.category?.name || "N/A"}
    </td>
    <td className="px-4 py-3.5 text-sm text-zinc-900 font-semibold">
      {product.variants && product.variants.length > 0
        ? `₹${product.variants[0].price}`
        : "N/A"}
    </td>
    <td className="px-4 py-3.5 text-xs text-zinc-600">
      {product.variants?.map((v, idx) => (
        <div key={idx} className="mb-0.5">
          <span className="font-semibold text-zinc-800">{v.size}/{v.color.join(", ")}:</span>{" "}
          <span className="text-zinc-600">₹{v.price}</span>
        </div>
      ))}
    </td>

    {/* Tags */}
    <td className="px-4 py-3.5 text-sm text-zinc-900 space-x-1.5 space-y-1">
      {product.isHotProduct && (
        <span className="px-2 py-0.5 bg-red-50 text-red-600 text-[10px] font-semibold rounded-md border border-red-200">
          Hot
        </span>
      )}
      {product.isFeatured && (
        <span className="px-2 py-0.5 bg-blue-50 text-blue-600 text-[10px] font-semibold rounded-md border border-blue-200">
          Featured
        </span>
      )}
      {product.isBestSeller && (
        <span className="px-2 py-0.5 bg-amber-50 text-amber-600 text-[10px] font-semibold rounded-md border border-amber-250">
          Best Seller
        </span>
      )}
      {product.status === "Active" ? (
        <span className="px-2 py-0.5 bg-green-50 text-green-700 text-[10px] font-semibold rounded-md border border-green-200">
          Active
        </span>
      ) : (
        <span className="px-2 py-0.5 bg-zinc-100 text-zinc-500 text-[10px] font-semibold rounded-md border border-zinc-200">
          Inactive
        </span>
      )}
    </td>

    {/* Actions with Icons */}
    <td className="px-4 py-3.5 text-sm font-medium">
      <div className="flex items-center justify-center space-x-3">
        <NavLink
          to={`/admin/editProduct/${product._id}`}
          className="text-zinc-400 hover:text-blue-600 transition-colors"
          title="Edit"
        >
          <Pencil className="w-4 h-4" />
        </NavLink>
        <NavLink
          to={`/admin/product-view/${product._id}`}
          className="text-zinc-400 hover:text-zinc-800 transition-colors"
          title="View"
        >
          <Eye className="w-4 h-4" />
        </NavLink>
        <button
          onClick={() => onDelete(product._id)}
          className="text-zinc-400 hover:text-red-600 transition-colors"
          title="Delete"
        >
          <Trash2 className="w-4 h-4" />
        </button>
      </div>
    </td>
  </tr>
);

// ---- Mobile Card ----
const ProductCard = ({ product, onDelete }) => (
  <div className="p-4 mb-3 border border-zinc-200/80 rounded-xl bg-white shadow-sm">
    <div className="flex items-center justify-between">
      <div className="flex items-center flex-1">
        <img
          src={
            product.pimages && product.pimages.length > 0
              ? product.pimages[0]
              : "https://via.placeholder.com/64"
          }
          alt={product.name}
          className="w-12 h-12 object-cover rounded-md border border-zinc-200 shadow-sm"
        />
        <div className="ml-3 flex-1">
          <p className="text-sm font-bold text-zinc-900">{product.name}</p>
          <p className="text-xs text-zinc-500">{product.category?.name || "N/A"}</p>
        </div>
      </div>

      {/* Action Icons */}
      <div className="flex items-center space-x-3">
        <NavLink
          to={`/admin/editProduct/${product._id}`}
          className="text-zinc-400 hover:text-blue-600 transition-colors"
          title="Edit"
        >
          <Pencil className="w-4 h-4" />
        </NavLink>
        <NavLink
          to={`/admin/product-view/${product._id}`}
          className="text-zinc-400 hover:text-zinc-800 transition-colors"
          title="View"
        >
          <Eye className="w-4 h-4" />
        </NavLink>
        <button
          onClick={() => onDelete(product._id)}
          className="text-zinc-400 hover:text-red-600 transition-colors"
          title="Delete"
        >
          <Trash2 className="w-4 h-4" />
        </button>
      </div>
    </div>

    {/* Variants */}
    <div className="mt-2 text-xs text-zinc-700">
      {product.variants?.map((v, idx) => (
        <div key={idx}>
          <strong>{v.size}/{v.color.join(", ")}:</strong> ₹{v.price}
        </div>
      ))}
    </div>

    {/* Tags */}
    <div className="mt-3 flex flex-wrap gap-1.5">
      {product.isHotProduct && <span className="px-2 py-0.5 bg-red-50 text-red-600 text-[10px] font-semibold rounded-md border border-red-200">Hot</span>}
      {product.isFeatured && <span className="px-2 py-0.5 bg-blue-50 text-blue-600 text-[10px] font-semibold rounded-md border border-blue-200">Featured</span>}
      {product.isBestSeller && <span className="px-2 py-0.5 bg-amber-50 text-amber-600 text-[10px] font-semibold rounded-md border border-amber-200">Best Seller</span>}
      {product.status === "Active" && <span className="px-2 py-0.5 bg-green-50 text-green-700 text-[10px] font-semibold rounded-md border border-green-200">Active</span>}
    </div>
  </div>
);

const AdminProducts = () => {
  const [products, setProducts] = useState([]);
  const [pagination, setPagination] = useState({});
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [page, setPage] = useState(1);
  const limit = 20;

  useEffect(() => {
    fetchProducts();
  }, [page, searchTerm]);

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const response = await getAdminProduct({
        page,
        limit,
        search: searchTerm,
      });

      if (response?.success) {
        setProducts(response.products || []);
        setPagination(response.pagination || {});
      } else {
        toast.error("Failed to fetch products");
      }
    } catch (error) {
      console.error("Error fetching products:", error);
      toast.error("Error loading products");
    } finally {
      setLoading(false);
    }
  };

  const handlePageChange = (newPage) => {
    if (newPage < 1 || (pagination.totalPages && newPage > pagination.totalPages)) return;
    setPage(newPage);
  };

  const handleDeleteProduct = async (id) => {
    if (!window.confirm("Are you sure you want to delete this product?")) return;

    try {
      const res = await deleteProduct(id);
      if (res.success) {
        toast.success("Product deleted successfully!");
        fetchProducts();
      } else {
        toast.error(res.message || "Failed to delete");
      }
    } catch (error) {
      console.error("Delete error:", error);
      toast.error("Failed to delete product");
    }
  };

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-white border border-zinc-200/80 rounded-xl p-4 shadow-sm">
        <div>
          <h1 className="text-xl font-bold text-zinc-900">Product List</h1>
          <p className="text-xs text-zinc-500">Manage, view, and update your web store catalog products.</p>
        </div>
        <div className="flex flex-wrap gap-2 items-center">
          <input
            type="text"
            placeholder="Search products..."
            value={searchTerm}
            onChange={(e) => {
              setPage(1);
              setSearchTerm(e.target.value);
            }}
            className="border border-zinc-200 rounded-lg px-3 py-2 text-sm bg-white text-zinc-800 placeholder-zinc-400 focus:outline-none focus:ring-1 focus:ring-orange-500 focus:border-orange-500 transition"
          />
          <NavLink
            to="/admin/addProduct"
            className="inline-flex items-center gap-1.5 px-4 py-2 bg-orange-600 hover:bg-orange-700 text-white rounded-lg transition-colors text-sm font-semibold shadow-sm"
          >
            <Plus className="w-4 h-4" />
            Add Product
          </NavLink>
        </div>
      </div>

      {/* Loading & Content */}
      {loading ? (
        <div className="text-center py-12 text-sm text-zinc-500">Loading products...</div>
      ) : products.length > 0 ? (
        <>
          {/* Desktop Table */}
          <div className="hidden sm:block overflow-hidden bg-white border border-zinc-200/80 rounded-xl shadow-sm">
            <table className="min-w-full border-collapse">
              <thead className="bg-gradient-to-r from-orange-50 to-orange-100/40 border-b border-orange-200/60">
                <tr>
                  <th className="px-4 py-3 text-center text-[10px] font-bold text-orange-950/80 uppercase tracking-wider">Image</th>
                  <th className="px-4 py-3 text-left text-[10px] font-bold text-orange-950/80 uppercase tracking-wider">Name</th>
                  <th className="px-4 py-3 text-left text-[10px] font-bold text-orange-950/80 uppercase tracking-wider">Category</th>
                  <th className="px-4 py-3 text-left text-[10px] font-bold text-orange-950/80 uppercase tracking-wider">Price</th>
                  <th className="px-4 py-3 text-left text-[10px] font-bold text-orange-950/80 uppercase tracking-wider">Variants</th>
                  <th className="px-4 py-3 text-left text-[10px] font-bold text-orange-950/80 uppercase tracking-wider">Tags</th>
                  <th className="px-4 py-3 text-center text-[10px] font-bold text-orange-950/80 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-200/60">
                {products.map((product) => (
                  <ProductTableRow key={product._id} product={product} onDelete={handleDeleteProduct} />
                ))}
              </tbody>
            </table>
          </div>

          {/* Mobile Cards */}
          <div className="sm:hidden">
            {products.map((product) => (
              <ProductCard key={product._id} product={product} onDelete={handleDeleteProduct} />
            ))}
          </div>

          {/* Pagination */}
          <div className="flex justify-between items-center bg-white border border-zinc-200/80 rounded-xl p-4 shadow-sm">
            <button
              onClick={() => handlePageChange(page - 1)}
              disabled={page <= 1}
              className="px-3.5 py-1.5 bg-white border border-zinc-200 hover:bg-zinc-50 rounded-lg text-zinc-700 text-xs font-semibold disabled:opacity-50 transition"
            >
              Previous
            </button>
            <span className="text-zinc-600 text-xs font-medium">
              Page {page} of {pagination.totalPages || 1}
            </span>
            <button
              onClick={() => handlePageChange(page + 1)}
              disabled={page >= (pagination.totalPages || 1)}
              className="px-3.5 py-1.5 bg-white border border-zinc-200 hover:bg-zinc-50 rounded-lg text-zinc-700 text-xs font-semibold disabled:opacity-50 transition"
            >
              Next
            </button>
          </div>
        </>
      ) : (
        <div className="text-center py-12 text-sm text-zinc-500 bg-white border border-zinc-200/80 rounded-xl shadow-sm">No products found.</div>
      )}
    </div>
  );
};

export default AdminProducts;