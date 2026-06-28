import React, { useEffect, useState, useCallback } from 'react';
import axios from '../../utils/Axios';
import { toast } from 'react-hot-toast';
import { AlertTriangle, Save } from 'lucide-react';

const LOW_STOCK_LIMIT = 5;

const AdminStockManager = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [savingKey, setSavingKey] = useState(null);
  const [stockMap, setStockMap] = useState({});

  /* ================= FETCH LOW STOCK PRODUCTS ================= */
  const fetchLowStockProducts = useCallback(async () => {
    try {
      setLoading(true);
      const res = await axios.post('/admin/low-stock-products', {});
      const list = res.data.lowStockProducts || [];

      setProducts(list);

      // build local stock state
      const map = {};
      list.forEach(p =>
        p.variants.forEach(v => {
          map[`${p.productId}-${v.size}`] = v.stockQty;
        })
      );
      setStockMap(map);
    } catch (err) {
      console.error(err);
      toast.error('Failed to fetch low stock products');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchLowStockProducts();
  }, [fetchLowStockProducts]);

  /* ================= UPDATE STOCK ================= */
  const updateStock = async (productId, size, qty) => {
    if (qty < 0) return toast.error('Stock cannot be negative');

    const key = `${productId}-${size}`;
    setSavingKey(key);

    try {
      await axios.post('/admin/low-stock-products', {
        updates: [{ productId, variantSize: size, newStockQty: qty }]
      });

      toast.success('Stock updated');
      fetchLowStockProducts();
    } catch (err) {
      console.error(err);
      toast.error('Failed to update stock');
    } finally {
      setSavingKey(null);
    }
  };

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      {/* Header Card */}
      <div className="bg-white border border-zinc-200/80 rounded-xl p-4 shadow-sm">
        <h1 className="text-xl font-bold text-zinc-900">Low Stock Alerts</h1>
        <p className="text-xs text-zinc-500">Monitor and quickly restock items that have fallen below the warning limit.</p>
      </div>

      {loading ? (
        <div className="text-center py-12 text-sm text-zinc-500 bg-white border border-zinc-200/80 rounded-xl shadow-sm">
          Loading low stock products...
        </div>
      ) : (
        <>
          {/* Desktop Table */}
          <div className="hidden md:block overflow-hidden bg-white border border-zinc-200/80 rounded-xl shadow-sm">
            <table className="min-w-full border-collapse">
              <thead className="bg-zinc-50 border-b border-zinc-200/60">
                <tr>
                  <th className="px-6 py-3 text-left text-[10px] font-bold text-zinc-500 uppercase tracking-wider">Product</th>
                  <th className="px-6 py-3 text-left text-[10px] font-bold text-zinc-500 uppercase tracking-wider">Size</th>
                  <th className="px-6 py-3 text-left text-[10px] font-bold text-zinc-500 uppercase tracking-wider">Price</th>
                  <th className="px-6 py-3 text-left text-[10px] font-bold text-zinc-500 uppercase tracking-wider">Stock</th>
                  <th className="px-6 py-3 text-center text-[10px] font-bold text-zinc-500 uppercase tracking-wider">Action</th>
                </tr>
              </thead>

              <tbody className="divide-y divide-zinc-200/60">
                {products.length === 0 && (
                  <tr>
                    <td colSpan="5" className="text-center py-12 text-sm text-zinc-500">
                      All stocks are healthy! 🎉
                    </td>
                  </tr>
                )}

                {products.map(product =>
                  product.variants.map(variant => {
                    const key = `${product.productId}-${variant.size}`;
                    const qty = stockMap[key];
                    const isCritical = qty === 0;

                    return (
                      <tr key={key} className={`transition-colors ${isCritical ? 'bg-red-50/30' : 'hover:bg-zinc-50/30'}`}>
                        <td className="px-6 py-4 text-sm font-semibold text-zinc-900">
                          {product.name}
                        </td>
                        <td className="px-6 py-4 text-sm text-zinc-600">{variant.size}</td>
                        <td className="px-6 py-4 text-sm text-zinc-900 font-medium">₹{variant.price}</td>

                        <td className="px-6 py-4 text-sm">
                          <div className="flex items-center gap-2">
                            <input
                              type="number"
                              min="0"
                              value={qty}
                              onChange={(e) =>
                                setStockMap(prev => ({
                                  ...prev,
                                  [key]: Number(e.target.value)
                                }))
                              }
                              onBlur={() =>
                                updateStock(
                                  product.productId,
                                  variant.size,
                                  qty
                                )
                              }
                              className={`w-20 px-2.5 py-1.5 border rounded-lg text-sm bg-white focus:outline-none focus:ring-1 focus:ring-orange-500 focus:border-orange-500 transition ${
                                isCritical
                                  ? 'border-red-300'
                                  : 'border-zinc-200'
                              }`}
                            />
                            {qty <= LOW_STOCK_LIMIT && (
                              <AlertTriangle
                                size={14}
                                className="text-red-500 animate-pulse"
                              />
                            )}
                          </div>
                        </td>

                        <td className="px-6 py-4 text-center">
                          <button
                            disabled={savingKey === key}
                            onClick={() =>
                              updateStock(
                                product.productId,
                                variant.size,
                                qty + 5
                              )
                            }
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-zinc-900 hover:bg-zinc-800 text-white rounded-lg text-xs font-semibold shadow-sm transition disabled:opacity-50"
                          >
                            <Save size={12} />
                            Restock +5
                          </button>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>

          {/* Mobile View */}
          <div className="md:hidden space-y-4">
            {products.map(product =>
              product.variants.map(variant => {
                const key = `${product.productId}-${variant.size}`;
                const qty = stockMap[key];
                const isCritical = qty === 0;

                return (
                  <div key={key} className={`border rounded-xl p-4 space-y-3 ${isCritical ? 'bg-red-50/40 border-red-200' : 'bg-white border-zinc-200'}`}>
                    <div>
                      <h5 className="font-bold text-zinc-900 text-sm">{product.name}</h5>
                      <p className="text-xs text-zinc-500">Size: {variant.size} • Price: ₹{variant.price}</p>
                    </div>

                    <div className="flex items-center gap-3">
                      <input
                        type="number"
                        min="0"
                        value={qty}
                        onChange={(e) =>
                          setStockMap(prev => ({
                            ...prev,
                            [key]: Number(e.target.value)
                          }))
                        }
                        onBlur={() =>
                          updateStock(product.productId, variant.size, qty)
                        }
                        className="w-full border border-zinc-200 rounded-lg p-2 text-sm bg-white focus:ring-1 focus:ring-orange-500 focus:border-orange-500 focus:outline-none"
                      />

                      <button
                        onClick={() =>
                          updateStock(
                            product.productId,
                            variant.size,
                            qty + 5
                          )
                        }
                        className="w-full bg-zinc-900 hover:bg-zinc-800 text-white py-2 rounded-lg text-xs font-semibold transition"
                      >
                        Restock +5
                      </button>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </>
      )}
    </div>
  );
};

export default AdminStockManager;
