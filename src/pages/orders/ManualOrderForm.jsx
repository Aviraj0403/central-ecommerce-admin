import React, { useState, useEffect } from 'react';
import axios from '../../utils/Axios';
import { toast } from 'react-hot-toast';
import { X, Plus, Trash2, Search, Package } from 'lucide-react';

const ManualOrderForm = ({ onClose, onSuccess }) => {
    const [loading, setLoading] = useState(false);
    const [products, setProducts] = useState([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [searching, setSearching] = useState(false);

    const [customerInfo, setCustomerInfo] = useState({
        name: '',
        email: '',
        phone: '',
        street: '',
        city: '',
        state: '',
        postalCode: '',
    });

    const [items, setItems] = useState([
        {
            product: '',
            selectedVariant: { name: 'Manual Item', price: 0, size: 'Standard', color: 'Standard' },
            quantity: 1,
            isCustom: true
        }
    ]);

    const [shippingCharges, setShippingCharges] = useState(80);
    const [discountAmount, setDiscountAmount] = useState(0);
    const [paymentMethod, setPaymentMethod] = useState('COD');
    const [paymentStatus, setPaymentStatus] = useState('Pending');
    const [shippingMethod, setShippingMethod] = useState('GK Logic');

    // Search products for autocomplete
    useEffect(() => {
        const delayDebounceFn = setTimeout(async () => {
            if (searchQuery.length > 2) {
                setSearching(true);
                try {
                    const res = await axios.get(`/products/admin-products?search=${searchQuery}&limit=5`);
                    setProducts(res.data.products || []);
                } catch (err) {
                    console.error('Product search failed', err);
                } finally {
                    setSearching(false);
                }
            } else {
                setProducts([]);
            }
        }, 500);

        return () => clearTimeout(delayDebounceFn);
    }, [searchQuery]);

    const handleCustomerChange = (e) => {
        setCustomerInfo({ ...customerInfo, [e.target.name]: e.target.value });
    };

    const addItem = () => {
        setItems([...items, {
            product: '',
            selectedVariant: { name: '', price: 0, size: 'Standard', color: 'Standard' },
            quantity: 1,
            isCustom: true
        }]);
    };

    const removeItem = (index) => {
        const newItems = items.filter((_, i) => i !== index);
        setItems(newItems);
    };

    const updateItem = (index, field, value) => {
        const newItems = [...items];
        if (field === 'quantity') {
            newItems[index].quantity = parseInt(value) || 0;
        } else if (field === 'name') {
            newItems[index].selectedVariant.name = value;
        } else if (field === 'price') {
            newItems[index].selectedVariant.price = parseFloat(value) || 0;
        } else if (field === 'size') {
            newItems[index].selectedVariant.size = value;
        }
        setItems(newItems);
    };

    const selectProduct = (index, product) => {
        const newItems = [...items];
        const defaultVariant = product.variants?.[0] || { price: 0, size: 'Standard', color: 'Standard' };

        newItems[index] = {
            product: product._id,
            selectedVariant: {
                name: product.name,
                price: defaultVariant.price,
                size: defaultVariant.size,
                color: defaultVariant.color?.[0] || 'Standard',
            },
            quantity: 1,
            isCustom: false
        };
        setItems(newItems);
        setSearchQuery('');
        setProducts([]);
    };

    const calculateSubtotal = () => {
        return items.reduce((sum, item) => sum + (item.selectedVariant.price * item.quantity), 0);
    };

    const calculateTotal = () => {
        return calculateSubtotal() + Number(shippingCharges) - Number(discountAmount);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!customerInfo.name || !customerInfo.phone || !customerInfo.street) {
            toast.error('Name, Phone and Street are required');
            return;
        }
        if (items.length === 0 || items.some(item => !item.selectedVariant.name || item.selectedVariant.price <= 0)) {
            toast.error('Please add valid items');
            return;
        }

        setLoading(true);
        try {
            const orderData = {
                customerInfo,
                items,
                paymentMethod,
                paymentStatus,
                shipping: {
                    method: shippingMethod,
                    weight: 0.5,
                    charges: parseFloat(shippingCharges) || 0,
                },
                discountAmount: parseFloat(discountAmount) || 0,
                totalAmount: calculateTotal(),
            };

            const res = await axios.post('/orders/createOrderManual', orderData);
            if (res.data.success) {
                toast.success('Manual order created successfully');
                onSuccess && onSuccess();
                onClose();
            }
        } catch (err) {
            console.error('Failed to create manual order', err);
            toast.error(err.response?.data?.message || 'Failed to create order');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4 overflow-y-auto">
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
                <div className="sticky top-0 bg-white border-b border-gray-100 p-4 sm:p-6 flex justify-between items-center z-10">
                    <h2 className="text-xl sm:text-2xl font-bold text-gray-800 flex items-center">
                        <Package className="mr-2 text-orange-500" />
                        Create Manual Order
                    </h2>
                    <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
                        <X size={24} className="text-gray-500" />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-4 sm:p-6 space-y-8">
                    {/* Customer Details */}
                    <section>
                        <h3 className="text-lg font-semibold text-gray-700 mb-4 pb-2 border-b border-gray-100">Customer Details</h3>
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-600 mb-1">Name *</label>
                                <input
                                    type="text"
                                    name="name"
                                    value={customerInfo.name}
                                    onChange={handleCustomerChange}
                                    className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-orange-500"
                                    required
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-600 mb-1">Phone *</label>
                                <input
                                    type="text"
                                    name="phone"
                                    value={customerInfo.phone}
                                    onChange={handleCustomerChange}
                                    className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-orange-500"
                                    required
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-600 mb-1">Email</label>
                                <input
                                    type="email"
                                    name="email"
                                    value={customerInfo.email}
                                    onChange={handleCustomerChange}
                                    className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-orange-500"
                                />
                            </div>
                            <div className="lg:col-span-2">
                                <label className="block text-sm font-medium text-gray-600 mb-1">Street Address *</label>
                                <input
                                    type="text"
                                    name="street"
                                    value={customerInfo.street}
                                    onChange={handleCustomerChange}
                                    className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-orange-500"
                                    required
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-600 mb-1">City *</label>
                                <input
                                    type="text"
                                    name="city"
                                    value={customerInfo.city}
                                    onChange={handleCustomerChange}
                                    className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-orange-500"
                                    required
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-600 mb-1">State *</label>
                                <input
                                    type="text"
                                    name="state"
                                    value={customerInfo.state}
                                    onChange={handleCustomerChange}
                                    className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-orange-500"
                                    required
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-600 mb-1">Pincode *</label>
                                <input
                                    type="text"
                                    name="postalCode"
                                    value={customerInfo.postalCode}
                                    onChange={handleCustomerChange}
                                    className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-orange-500"
                                    required
                                />
                            </div>
                        </div>
                    </section>

                    {/* Items Section */}
                    <section>
                        <div className="flex justify-between items-center mb-4 pb-2 border-b border-gray-100">
                            <h3 className="text-lg font-semibold text-gray-700">Order Items</h3>
                            <button
                                type="button"
                                onClick={addItem}
                                className="inline-flex items-center px-3 py-1 bg-green-500 text-white rounded-md hover:bg-green-600 text-sm font-medium transition-colors"
                            >
                                <Plus size={16} className="mr-1" /> Add Manual Item
                            </button>
                        </div>

                        {/* Product Search */}
                        <div className="relative mb-6">
                            <div className="relative">
                                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                                <input
                                    type="text"
                                    placeholder="Search existing products to add..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-orange-500 shadow-sm"
                                />
                                {searching && (
                                    <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-orange-500"></div>
                                    </div>
                                )}
                            </div>
                            {products.length > 0 && (
                                <div className="absolute w-full mt-2 bg-white border border-gray-200 rounded-xl shadow-2xl z-20 max-h-60 overflow-y-auto">
                                    {products.map(p => (
                                        <div
                                            key={p._id}
                                            onClick={() => selectProduct(items.length - 1, p)}
                                            className="p-3 hover:bg-orange-50 cursor-pointer flex items-center transition-colors border-b last:border-0"
                                        >
                                            <img src={p.pimages?.[0]} alt="" className="w-12 h-12 object-cover rounded mr-3" />
                                            <div>
                                                <p className="font-semibold text-gray-800">{p.name}</p>
                                                <p className="text-sm text-gray-500">₹{p.variants?.[0]?.price} - {p.variants?.[0]?.size}</p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>

                        <div className="space-y-4">
                            {items.map((item, index) => (
                                <div key={index} className="flex flex-wrap items-end gap-3 p-4 bg-gray-50 rounded-xl border border-gray-200">
                                    <div className="flex-1 min-w-[200px]">
                                        <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Item Name</label>
                                        <input
                                            type="text"
                                            value={item.selectedVariant.name}
                                            onChange={(e) => updateItem(index, 'name', e.target.value)}
                                            className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-orange-500"
                                            placeholder="Product Name"
                                        />
                                    </div>
                                    <div className="w-24">
                                        <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Price</label>
                                        <input
                                            type="number"
                                            value={item.selectedVariant.price}
                                            onChange={(e) => updateItem(index, 'price', e.target.value)}
                                            className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-orange-500"
                                        />
                                    </div>
                                    <div className="w-24">
                                        <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Size</label>
                                        <input
                                            type="text"
                                            value={item.selectedVariant.size}
                                            onChange={(e) => updateItem(index, 'size', e.target.value)}
                                            className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-orange-500"
                                        />
                                    </div>
                                    <div className="w-20">
                                        <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Qty</label>
                                        <input
                                            type="number"
                                            value={item.quantity}
                                            onChange={(e) => updateItem(index, 'quantity', e.target.value)}
                                            className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-orange-500"
                                            min="1"
                                        />
                                    </div>
                                    <button
                                        type="button"
                                        onClick={() => removeItem(index)}
                                        className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                                    >
                                        <Trash2 size={20} />
                                    </button>
                                </div>
                            ))}
                        </div>
                    </section>

                    {/* Pricing & Logistics */}
                    <section className="bg-gray-50 p-6 rounded-2xl border border-gray-200">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            <div className="space-y-4">
                                <h3 className="text-lg font-semibold text-gray-700">Payment & Status</h3>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-600 mb-1">Method</label>
                                        <select
                                            value={paymentMethod}
                                            onChange={(e) => setPaymentMethod(e.target.value)}
                                            className="w-full p-2 border border-gray-300 rounded-md bg-white shadow-sm"
                                        >
                                            <option value="COD">COD</option>
                                            <option value="Online">Online</option>
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-600 mb-1">Status</label>
                                        <select
                                            value={paymentStatus}
                                            onChange={(e) => setPaymentStatus(e.target.value)}
                                            className="w-full p-2 border border-gray-300 rounded-md bg-white shadow-sm"
                                        >
                                            <option value="Pending">Pending</option>
                                            <option value="Paid">Paid</option>
                                        </select>
                                    </div>
                                    <div className="col-span-2">
                                        <label className="block text-sm font-medium text-gray-600 mb-1">Shipping Method</label>
                                        <select
                                            value={shippingMethod}
                                            onChange={(e) => setShippingMethod(e.target.value)}
                                            className="w-full p-2 border border-gray-300 rounded-md bg-white shadow-sm font-bold text-orange-600"
                                        >
                                            <option value="GK Logic">GK Logic (Manual / Self)</option>
                                            <option value="Shiprocket">Shiprocket (Courier Aggregator)</option>
                                        </select>
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-3">
                                <div className="flex justify-between text-gray-600">
                                    <span>Subtotal</span>
                                    <span className="font-semibold text-gray-900">₹{calculateSubtotal().toFixed(2)}</span>
                                </div>
                                <div className="flex justify-between items-center text-gray-600">
                                    <span>Shipping</span>
                                    <input
                                        type="number"
                                        value={shippingCharges}
                                        onChange={(e) => setShippingCharges(e.target.value)}
                                        className="w-24 p-1 border border-gray-300 rounded text-right bg-white"
                                    />
                                </div>
                                <div className="flex justify-between items-center text-gray-600">
                                    <span>Discount</span>
                                    <input
                                        type="number"
                                        value={discountAmount}
                                        onChange={(e) => setDiscountAmount(e.target.value)}
                                        className="w-24 p-1 border border-gray-300 rounded text-right bg-white"
                                    />
                                </div>
                                <div className="flex justify-between text-xl font-bold text-gray-900 pt-3 border-t border-gray-200">
                                    <span>Total</span>
                                    <span className="text-orange-600">₹{calculateTotal().toFixed(2)}</span>
                                </div>
                            </div>
                        </div>
                    </section>

                    <div className="sticky bottom-0 bg-white pt-4 border-t border-gray-100 flex justify-end gap-4">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-6 py-3 border border-gray-300 rounded-xl text-gray-700 font-semibold hover:bg-gray-50 transition-colors"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={loading}
                            className="px-8 py-3 bg-orange-500 text-white rounded-xl font-semibold hover:bg-orange-600 shadow-lg shadow-orange-200 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {loading ? 'Creating Order...' : 'Create Order'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default ManualOrderForm;
