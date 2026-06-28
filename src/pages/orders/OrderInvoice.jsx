import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from '../../utils/Axios';
import { toast } from 'react-hot-toast';
import { Printer, ArrowLeft, Mail, Package, Truck, CreditCard } from 'lucide-react';
import Loader from '../../components/Loader';

const OrderInvoice = () => {
    const { orderId } = useParams();
    const navigate = useNavigate();
    const [order, setOrder] = useState(null);
    const [loading, setLoading] = useState(true);
    const invoiceRef = useRef();

    useEffect(() => {
        const fetchOrder = async () => {
            try {
                const res = await axios.get(`/orders/getOrderById/${orderId}`);
                if (res.data.success) {
                    setOrder(res.data.order);
                }
            } catch (err) {
                console.error('Failed to fetch order', err);
                toast.error('Could not load order details');
            } finally {
                setLoading(false);
            }
        };
        fetchOrder();
    }, [orderId]);

    const handlePrint = () => {
        window.print();
    };

    if (loading) return <Loader />;
    if (!order) return <div className="p-10 text-center font-medium text-zinc-500">Order not found</div>;

    const subtotal = order.items.reduce((sum, item) => sum + (item.selectedVariant.price * item.quantity), 0);
    const total = subtotal + (order.shipping?.charges || 0) - (order.discountAmount || 0);

    return (
        <div className="min-h-screen bg-zinc-50 p-4 sm:p-6 print:bg-white print:p-0 font-sans">
            {/* Action Bar - Hidden during print */}
            <div className="max-w-4xl mx-auto mb-6 flex justify-between items-center print:hidden">
                <button
                    onClick={() => navigate(-1)}
                    className="flex items-center gap-2 text-zinc-600 hover:text-zinc-900 font-semibold text-xs transition"
                >
                    <ArrowLeft size={16} />
                    Back
                </button>
                <div className="flex gap-3">
                    <button
                        onClick={handlePrint}
                        className="flex items-center gap-2 px-4 py-2 bg-zinc-900 text-white rounded-lg text-xs font-semibold hover:bg-zinc-800 transition shadow-sm cursor-pointer"
                    >
                        <Printer size={14} />
                        Print Invoice
                    </button>
                </div>
            </div>

            {/* Invoice Container */}
            <div
                ref={invoiceRef}
                className="max-w-4xl mx-auto bg-white shadow-sm rounded-xl overflow-hidden border border-zinc-200/80 print:shadow-none print:border-none print:rounded-none"
            >
                {/* Header */}
                <div className="bg-zinc-950 p-8 sm:p-10 text-white">
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6">
                        <div>
                            <h1 className="text-3xl font-black tracking-tight mb-1">INVOICE</h1>
                            <p className="text-zinc-400 font-semibold tracking-wider text-xs uppercase">
                                #ORD-{String(order._id).slice(-6).toUpperCase()}
                            </p>
                        </div>
                        <div className="text-right">
                            <h2 className="text-xl font-bold text-orange-500">GK STORE</h2>
                            <p className="text-xs text-zinc-400">Official Merchandise & More</p>
                        </div>
                    </div>
                </div>

                <div className="p-8 sm:p-10 space-y-10">
                    {/* Info Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                        <div className="space-y-3">
                            <h3 className="text-xs font-bold text-zinc-400 uppercase tracking-wider border-b border-zinc-100 pb-2">Billed To</h3>
                            <div className="space-y-1.5 text-xs">
                                <p className="text-base font-bold text-zinc-900">{order.shippingAddress.name}</p>
                                <p className="text-zinc-600 font-medium">{order.shippingAddress.street}</p>
                                <p className="text-zinc-600 font-medium">{order.shippingAddress.city}, {order.shippingAddress.state} - {order.shippingAddress.postalCode}</p>
                                <p className="text-zinc-600 font-medium pt-2 flex items-center gap-2">
                                    <Mail size={12} className="text-zinc-400" />
                                    {order.shippingAddress.email}
                                </p>
                                <p className="text-zinc-600 font-medium flex items-center gap-2">
                                    <Truck size={12} className="text-zinc-400" />
                                    {order.shippingAddress.phoneNumber}
                                </p>
                            </div>
                        </div>

                        <div className="space-y-5 text-xs">
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <h3 className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider mb-1">Date Issued</h3>
                                    <p className="font-semibold text-zinc-900">{new Date(order.placedAt || order.createdAt).toLocaleDateString()}</p>
                                </div>
                                <div>
                                    <h3 className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider mb-1">Payment</h3>
                                    <p className="font-semibold text-zinc-900 flex items-center gap-1.5">
                                        <CreditCard size={12} className="text-zinc-400" />
                                        {order.paymentMethod}
                                    </p>
                                </div>
                            </div>
                            <div className="p-4 bg-orange-50/50 rounded-lg border border-orange-100/80">
                                <h3 className="text-[10px] font-bold text-orange-600 uppercase tracking-wider mb-1 text-center">Total Amount</h3>
                                <p className="text-2xl font-bold text-orange-700 text-center tracking-tight">₹{total.toLocaleString()}</p>
                                <p className="text-[10px] font-bold text-center text-orange-400 tracking-wider mt-1 uppercase">
                                    {order.paymentStatus === 'Paid' ? 'Verified - Transaction Clear' : 'Unpaid - Payment Pending'}
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Table */}
                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-xs">
                            <thead>
                                <tr className="border-b border-zinc-300">
                                    <th className="py-3 font-semibold text-zinc-900 uppercase tracking-wider">Description</th>
                                    <th className="py-3 font-semibold text-zinc-900 uppercase tracking-wider text-center">Qty</th>
                                    <th className="py-3 font-semibold text-zinc-900 uppercase tracking-wider text-right">Price</th>
                                    <th className="py-3 font-semibold text-zinc-900 uppercase tracking-wider text-right">Amount</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-zinc-150">
                                {order.items.map((item, idx) => (
                                    <tr key={idx} className="group">
                                        <td className="py-4">
                                            <div className="flex items-center gap-3">
                                                <div className="p-2 bg-zinc-50 rounded-lg group-hover:bg-orange-50/50 transition">
                                                    <Package className="text-zinc-400 group-hover:text-orange-600 transition" size={16} />
                                                </div>
                                                <div>
                                                    <p className="font-semibold text-zinc-900">{item.selectedVariant.name}</p>
                                                    <p className="text-[10px] text-zinc-400 uppercase">
                                                        Size: {item.selectedVariant.size} | Color: {item.selectedVariant.color}
                                                    </p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="py-4 text-center font-semibold text-zinc-900">{item.quantity}</td>
                                        <td className="py-4 text-right font-medium text-zinc-600">₹{item.selectedVariant.price.toLocaleString()}</td>
                                        <td className="py-4 text-right font-semibold text-zinc-900">₹{(item.selectedVariant.price * item.quantity).toLocaleString()}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    {/* Totals Section */}
                    <div className="flex justify-end pt-6">
                        <div className="w-full max-w-xs space-y-2.5 text-xs">
                            <div className="flex justify-between text-zinc-650 font-medium">
                                <span>Subtotal</span>
                                <span className="text-zinc-900 font-semibold">₹{subtotal.toLocaleString()}</span>
                            </div>
                            <div className="flex justify-between text-zinc-650 font-medium">
                                <span>Shipping Fees</span>
                                <span className="text-zinc-900 font-semibold">₹{(order.shipping?.charges || 0).toLocaleString()}</span>
                            </div>
                            {order.discountAmount > 0 && (
                                <div className="flex justify-between text-emerald-600 font-medium pb-2">
                                    <span>Discount Applied</span>
                                    <span className="font-semibold">-₹{order.discountAmount.toLocaleString()}</span>
                                </div>
                            )}
                            <div className="flex justify-between items-center bg-zinc-950 text-white p-3 rounded-lg">
                                <span className="text-[10px] font-semibold uppercase tracking-wider text-zinc-400">Grand Total</span>
                                <span className="text-xl font-bold tracking-tight">₹{total.toLocaleString()}</span>
                            </div>
                        </div>
                    </div>

                    {/* Footer */}
                    <div className="pt-16 border-t border-zinc-100">
                        <div className="flex flex-col md:flex-row justify-between items-end gap-6">
                            <div className="space-y-2 text-xs">
                                <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider">Terms & conditions</p>
                                <p className="max-w-md text-zinc-500 leading-relaxed italic">
                                    All items are subject to return policy. Shipping and handling fees are non-refundable.
                                    Please keep a copy of this invoice for warranty claims and future reference.
                                </p>
                            </div>
                            <div className="text-right text-xs">
                                <div className="p-3 bg-zinc-50 rounded-lg border border-dashed border-zinc-200 inline-block mb-3">
                                    <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider mb-1">Authenticity Guaranteed</p>
                                    <div className="flex items-center gap-2 justify-end">
                                        <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full"></span>
                                        <span className="text-[10px] font-semibold text-zinc-900 uppercase">GK OFFICIAL PRODUCT</span>
                                    </div>
                                </div>
                                <p className="text-zinc-400 text-[10px] font-semibold uppercase tracking-wider">Authorized Generated Invoice</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Print Styling */}
            <style>{`
                @media print {
                    @page { margin: 20mm; }
                    body { background: white; }
                    .print-m-0 { margin: 0 !important; }
                }
            `}</style>
        </div>
    );
};

export default OrderInvoice;
