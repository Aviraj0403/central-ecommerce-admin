import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'react-hot-toast';
import {
  Truck,
  Package,
  MapPin,
  Clock,
  CheckCircle,
  XCircle,
  RefreshCw,
  Download,
  Eye,
  AlertCircle,
  TrendingUp,
  BarChart3,
  Users,
  Plus,
  Filter,
  Search,
  Calendar,
  FileText,
  Zap,
  Activity,
  ShoppingCart,
  DollarSign,
  Calculator,
  ArrowLeft,
  ArrowRight,
  Weight
} from 'lucide-react';
import {
  getShippingDashboard,
  getOrdersReadyForShipping,
  getAllShipments,
  bulkCreateShipments,
  bulkGenerateLabels,
  triggerBulkTrackingUpdate,
  createShipment,
  generateShippingLabel,
  trackOrderShipment,
  cancelShipment,
  updateOrderShippingStatus,
  getWalletBalance,
  schedulePickup,
  generateManifest,
  printManifest,
  createReturnOrder,
  syncOrders,
  getActiveShippingGateway,
  setActiveShippingGateway
} from '../../services/ShiprocketApi';
import NotificationCenter from '../../components/NotificationCenter';
import ShippingCalculator from '../../components/ShippingCalculator';
import ManualOrderForm from './ManualOrderForm';
import OrderTrackingWidget from '../../components/OrderTrackingWidget';
import { getSettings } from '../../services/SettingsApi';

const ShiprocketManager = () => {
  const [shipments, setShipments] = useState([]);
  const [readyOrders, setReadyOrders] = useState([]);
  const [settings, setSettings] = useState({ shiprocket_enabled: true, delhivery_enabled: true });
  const [dashboard, setDashboard] = useState(null);
  const [loading, setLoading] = useState(true);
  const [bulkUpdating, setBulkUpdating] = useState(false);
  const [selectedTab, setSelectedTab] = useState('dashboard');
  const [error, setError] = useState(null);
  const [refreshing, setRefreshing] = useState(false);
  const [lastUpdated, setLastUpdated] = useState(null);
  const [selectedOrders, setSelectedOrders] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [dateRange, setDateRange] = useState({ start: '', end: '' });
  const [showFilters, setShowFilters] = useState(false);
  const [showCalculator, setShowCalculator] = useState(false);
  const [showManualOrderForm, setShowManualOrderForm] = useState(false);
  const [walletBalance, setWalletBalance] = useState(null);
  const [activeGateway, setActiveGatewayState] = useState('Shiprocket');
  const [updatingGateway, setUpdatingGateway] = useState(false);
  const [filters, setFilters] = useState({
    page: 1,
    limit: 20,
    status: '',
    courier: ''
  });
  const [pagination, setPagination] = useState({});
  const [actionLoading, setActionLoading] = useState({});
  const [manualWeights, setManualWeights] = useState({});
  const [trackingModalOrderId, setTrackingModalOrderId] = useState(null);

  // Fetch active gateway and settings
  const fetchActiveGateway = async () => {
    try {
      const response = await getActiveShippingGateway();
      let activeG = 'Shiprocket';
      if (response && response.success) {
        activeG = response.active_gateway;
        setActiveGatewayState(response.active_gateway);
      }

      // Fetch dynamic settings to filter UI
      const settingsRes = await getSettings();
      if (settingsRes && settingsRes.success) {
        setSettings(settingsRes.settings);
        if (!settingsRes.settings.shiprocket_enabled && settingsRes.settings.delhivery_enabled && activeG !== 'Delhivery') {
          setActiveGatewayState('Delhivery');
        } else if (!settingsRes.settings.delhivery_enabled && settingsRes.settings.shiprocket_enabled && activeG !== 'Shiprocket') {
          setActiveGatewayState('Shiprocket');
        }
      }
    } catch (error) {
      console.error('Error fetching active shipping gateway or settings:', error);
    }
  };

  // Change active gateway
  const handleGatewayChange = async (gateway) => {
    try {
      setUpdatingGateway(true);
      const response = await setActiveShippingGateway(gateway);
      if (response && response.success) {
        setActiveGatewayState(response.active_gateway);
        toast.success(`Active logistics carrier switched to ${response.active_gateway}`);
        fetchDashboard();
        fetchWalletBalance();
      }
    } catch (error) {
      console.error('Error switching shipping gateway:', error);
      toast.error(error.message || 'Failed to switch shipping gateway');
    } finally {
      setUpdatingGateway(false);
    }
  };

  // Fetch dashboard data
  const fetchDashboard = async () => {
    try {
      const response = await getShippingDashboard();
      setDashboard(response.dashboard || null);
    } catch (error) {
      console.error('Error fetching dashboard:', error);
      toast.error('Failed to fetch dashboard data');
      setDashboard(null);
    }
  };

  // Fetch Wallet Balance
  const fetchWalletBalance = async () => {
    try {
      const response = await getWalletBalance();
      if (response && response.success) {
        setWalletBalance(response.balance);
      }
    } catch (error) {
      console.error('Error fetching wallet balance:', error);
    }
  };

  // Fetch ready orders
  const fetchReadyOrders = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await getOrdersReadyForShipping({ page: 1, limit: 50 });
      setReadyOrders(Array.isArray(response.orders) ? response.orders : []);
      setLastUpdated(new Date());
    } catch (error) {
      console.error('Error fetching ready orders:', error);
      setError('Failed to fetch ready orders. Please try again.');
      toast.error('Failed to fetch ready orders');
      setReadyOrders([]);
    } finally {
      setLoading(false);
    }
  };

  // Fetch shipments
  const fetchShipments = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await getAllShipments(filters);
      setShipments(Array.isArray(response.shipments) ? response.shipments : []);
      setPagination(response.pagination || {});
      setLastUpdated(new Date());
    } catch (error) {
      console.error('Error fetching shipments:', error);
      setError('Failed to fetch shipments. Please try again.');
      toast.error('Failed to fetch shipments');
      setShipments([]);
      setPagination({});
    } finally {
      setLoading(false);
    }
  };

  // Refresh data
  const handleRefresh = async () => {
    setRefreshing(true);
    try {
      if (selectedTab === 'dashboard') {
        await fetchDashboard();
      } else if (selectedTab === 'ready-orders') {
        await fetchReadyOrders();
      } else if (selectedTab === 'shipments') {
        await fetchShipments();
      }
      
      // Also sync all order statuses from Shiprocket
      const syncRes = await syncOrders();
      if (syncRes.success) {
        toast.success(`Synced: ${syncRes.results.updated} updates found`);
      }

      toast.success('Data refreshed successfully');
    } catch (error) {
      toast.error('Failed to refresh data');
    } finally {
      setRefreshing(false);
    }
  };

  // Bulk update tracking
  const handleBulkUpdate = async () => {
    try {
      setBulkUpdating(true);
      const response = await triggerBulkTrackingUpdate();
      toast.success(`Bulk tracking update initiated: ${response.message}`);
      if (selectedTab === 'shipments') {
        fetchShipments();
      }
    } catch (error) {
      console.error('Error bulk updating:', error);
      toast.error('Failed to bulk update tracking');
    } finally {
      setBulkUpdating(false);
    }
  };

  // Handle bulk shipment creation
  const handleBulkCreateShipments = async () => {
    if (selectedOrders.length === 0) {
      toast.error('Please select orders to create shipments');
      return;
    }

    try {
      const response = await bulkCreateShipments(selectedOrders);
      if (response.successful !== undefined) {
        toast.success(`Created ${response.successful} shipments, ${response.failed || 0} failed`);
      } else {
        toast.success('Bulk shipment creation completed');
      }
      setSelectedOrders([]);
      fetchReadyOrders();
    } catch (error) {
      console.error('Error creating bulk shipments:', error);
      toast.error(`Bulk Creation Failed: ${error.message || 'Unknown error'}`);
    }
  };

  // Handle bulk label generation
  const handleBulkGenerateLabels = async () => {
    if (selectedOrders.length === 0) {
      toast.error('Please select orders to generate labels');
      return;
    }

    try {
      const response = await bulkGenerateLabels(selectedOrders);
      if (response.successful !== undefined) {
        toast.success(`Generated ${response.successful} labels, ${response.failed || 0} failed`);
      } else {
        toast.success('Bulk label generation completed');
      }
      setSelectedOrders([]);
      if (selectedTab === 'shipments') {
        fetchShipments();
      }
    } catch (error) {
      console.error('Error generating bulk labels:', error);
      toast.error(`Label Generation Failed: ${error.message || 'Unknown error'}`);
    }
  };

  // Handle shipment actions with loading states
  const handleShipmentAction = async (action, orderId) => {
    if (!orderId) return;

    try {
      setActionLoading(prev => ({ ...prev, [orderId]: true }));
      let response;

      switch (action) {
        case 'create':
          const weightValue = manualWeights[orderId];
          if (weightValue) {
            const numericWeight = parseFloat(weightValue);
            if (numericWeight <= 0 || numericWeight > 20) {
              toast.error('Weight must be between 0.01kg and 20kg');
              setActionLoading(prev => ({ ...prev, [orderId]: false }));
              return;
            }
          }
          response = await createShipment(orderId, { weight: weightValue || undefined });
          toast.success('Shipment created successfully');
          setManualWeights(prev => {
            const next = { ...prev };
            delete next[orderId];
            return next;
          });
          break;
        case 'label':
        case 'generate_label':
          response = await generateShippingLabel(orderId);
          if (response.label_url) {
            window.open(response.label_url, '_blank');
          }
          toast.success('Shipping label generated');
          break;
        case 'track':
          response = await trackOrderShipment(orderId);
          toast.success('Tracking updated');
          break;
        case 'cancel':
          if (window.confirm('Are you sure you want to cancel this shipment?')) {
            response = await cancelShipment(orderId);
            toast.success('Shipment cancelled');
          } else {
            return;
          }
          break;
        case 'pickup':
        case 'schedule_pickup':
          const shipmentId = readyOrders.find(o => (o.id || o._id) === orderId)?.shipping?.shiprocket?.shipment_id ||
            shipments.find(o => (o.order_id || o._id) === orderId)?.shiprocket?.shipment_id;
          if (!shipmentId) {
            toast.error('Shipment ID not found');
            return;
          }
          response = await schedulePickup([shipmentId]);
          toast.success(`Pickup scheduled: ${response.message || 'Success'}`);
          break;
        case 'manifest':
          const sId = shipments.find(o => (o.order_id || o._id) === orderId)?.shiprocket?.shipment_id;
          if (!sId) return toast.error('Shipment ID not found');
          response = await generateManifest([sId]);
          toast.success('Manifest generated successfully');
          break;
        case 'print_manifest':
          const mId = shipments.find(o => (o.order_id || o._id) === orderId)?.shiprocket?.manifest_id;
          if (!mId) return toast.error('Manifest ID not found');
          response = await printManifest([mId]);
          if (response.manifest_url) window.open(response.manifest_url, '_blank');
          toast.success('Manifest obtained');
          break;
        case 'return':
          if (window.confirm('Initiate return for this order?')) {
            response = await createReturnOrder(orderId, 'Customer Return');
            toast.success('Return order created in Shiprocket');
          }
          break;
        case 'invoice':
          window.open(`/admin/orders/invoice/${orderId}`, '_blank');
          break;
        default:
          return;
      }

      // Refresh data based on current tab
      if (selectedTab === 'shipments') {
        fetchShipments();
      } else if (selectedTab === 'ready-orders') {
        fetchReadyOrders();
      }
    } catch (error) {
      console.error(`Error ${action} shipment:`, error);
      // Detailed error bubbling from the backend
      const errorMessage = error.response?.data?.message || error.message || 'Unknown error occurred';
      toast.error(`Failed to ${action}: ${errorMessage}`, {
        duration: 5000 // Give admin more time to read detailed error
      });
    } finally {
      setActionLoading(prev => ({ ...prev, [orderId]: false }));
    }
  };

  // Handle order selection
  const handleOrderSelection = (orderId) => {
    if (!orderId) return;
    setSelectedOrders(prev =>
      prev.includes(orderId)
        ? prev.filter(id => id !== orderId)
        : [...prev, orderId]
    );
  };

  // Select all orders
  const handleSelectAll = () => {
    const currentOrders = selectedTab === 'ready-orders' ? readyOrders : shipments;
    const validOrderIds = (currentOrders || [])
      .filter(order => order._id || order.order_id)
      .map(order => order._id || order.order_id);

    if (selectedOrders.length === validOrderIds.length) {
      setSelectedOrders([]);
    } else {
      setSelectedOrders(validOrderIds);
    }
  };

  useEffect(() => {
    fetchWalletBalance();
    fetchActiveGateway();
  }, []); // Mount only

  useEffect(() => {
    setSelectedOrders([]); // Clear selection when switching tabs
    if (selectedTab === 'dashboard') {
      fetchDashboard();
    } else if (selectedTab === 'ready-orders') {
      fetchReadyOrders();
    } else if (selectedTab === 'shipments') {
      fetchShipments();
    }
  }, [selectedTab, filters]);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyPress = (event) => {
      // Only trigger if not typing in an input
      if (event.target.tagName === 'INPUT' || event.target.tagName === 'TEXTAREA') {
        return;
      }

      if (event.ctrlKey || event.metaKey) {
        switch (event.key) {
          case 'r':
            event.preventDefault();
            handleRefresh();
            break;
          case '1':
            event.preventDefault();
            setSelectedTab('dashboard');
            break;
          case '2':
            event.preventDefault();
            setSelectedTab('ready-orders');
            break;
          case '3':
            event.preventDefault();
            setSelectedTab('shipments');
            break;
          case 'f':
            event.preventDefault();
            setShowFilters(!showFilters);
            break;
        }
      }
    };

    document.addEventListener('keydown', handleKeyPress);
    return () => document.removeEventListener('keydown', handleKeyPress);
  }, [showFilters]);

  const filteredShipments = (shipments || []).filter(shipment => {
    const searchLower = searchTerm.toLowerCase();
    const searchStr = String(searchTerm).toLowerCase();
    const matchesSearch = !searchTerm ||
      (shipment.order_id && String(shipment.order_id).toLowerCase().includes(searchStr)) ||
      (shipment.customer?.name && shipment.customer.name.toLowerCase().includes(searchStr)) ||
      (shipment.customer?.phone && String(shipment.customer.phone).includes(searchTerm)) ||
      (shipment.shiprocket?.awb_code && shipment.shiprocket.awb_code.toLowerCase().includes(searchStr));

    const matchesStatus = !filters.status || shipment.order_status === filters.status;

    return matchesSearch && matchesStatus;
  });

  return (
    <div className="min-h-screen bg-[#FAFAFA] p-4 md:p-8 font-sans selection:bg-zinc-100 selection:text-zinc-900">
      <div className="max-w-7xl mx-auto space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">

        {/* Premium Page Header - Shadcn Edition */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 pb-6 border-b border-zinc-200">
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-3xl font-extrabold tracking-tight text-zinc-900">Logistics Hub</h1>
              
              {/* Premium Gateway Selector */}
              {settings.shiprocket_enabled && settings.delhivery_enabled && (
                <div className="inline-flex bg-zinc-100 p-1 rounded-lg border border-zinc-200 shadow-inner">
                  <button
                    onClick={() => handleGatewayChange('Shiprocket')}
                    disabled={updatingGateway}
                    className={`px-3 py-1 rounded-md text-[9px] font-extrabold uppercase tracking-wider transition-all cursor-pointer ${activeGateway === 'Shiprocket' ? 'bg-white text-zinc-900 shadow-sm border border-zinc-200/50' : 'text-zinc-500 hover:text-zinc-900'}`}
                  >
                    Shiprocket
                  </button>
                  <button
                    onClick={() => handleGatewayChange('Delhivery')}
                    disabled={updatingGateway}
                    className={`px-3 py-1 rounded-md text-[9px] font-extrabold uppercase tracking-wider transition-all cursor-pointer ${activeGateway === 'Delhivery' ? 'bg-white text-zinc-900 shadow-sm border border-zinc-200/50' : 'text-zinc-500 hover:text-zinc-900'}`}
                  >
                    Delhivery
                  </button>
                </div>
              )}
            </div>
            <p className="text-sm text-zinc-500 mt-1">Manage carrier aggregators, track packages and schedule fulfillments.</p>
            <div className="flex items-center gap-2 mt-2">
              <span className="relative flex h-2 w-2">
                <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${activeGateway === 'Delhivery' ? 'bg-blue-400' : 'bg-emerald-400'}`}></span>
                <span className={`relative inline-flex rounded-full h-2 w-2 ${activeGateway === 'Delhivery' ? 'bg-blue-500' : 'bg-emerald-500'}`}></span>
              </span>
              <p className="text-[10px] font-semibold text-zinc-500 uppercase tracking-widest">{activeGateway} Connection Active</p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
            {walletBalance !== null && settings.shiprocket_enabled && activeGateway === 'Shiprocket' && (
              <div className="flex items-center gap-2 bg-zinc-50 px-4 py-2 rounded-lg border border-zinc-200">
                <DollarSign className="w-4 h-4 text-zinc-500" />
                <span className="text-xs font-semibold text-zinc-500">Wallet:</span>
                <span className="text-sm font-bold text-zinc-900">₹{walletBalance.toLocaleString()}</span>
              </div>
            )}
            
            <button
              onClick={() => setShowManualOrderForm(true)}
              className="flex items-center gap-2 px-4 py-2 bg-zinc-900 text-white rounded-lg hover:bg-zinc-800 transition-all font-semibold text-xs shadow cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              Custom Order
            </button>
            <button
              onClick={() => setShowCalculator(true)}
              className="flex items-center gap-2 px-4 py-2 bg-white text-zinc-900 rounded-lg hover:bg-zinc-50 transition-all border border-zinc-200 font-semibold text-xs shadow-sm cursor-pointer"
            >
              <Calculator className="w-3.5 h-3.5 text-zinc-500" />
              Calculator
            </button>
            <button
              onClick={handleRefresh}
              disabled={loading || refreshing}
              className="flex items-center gap-2 px-4 py-2 bg-white text-zinc-900 rounded-lg hover:bg-zinc-50 transition-all border border-zinc-200 font-semibold text-xs shadow-sm cursor-pointer disabled:opacity-50"
            >
              <RefreshCw className={`w-3.5 h-3.5 text-zinc-500 ${loading || refreshing ? 'animate-spin' : ''}`} />
              Sync
            </button>
          </div>
        </div>

        {/* Shadcn UI Style Tab Navigation */}
        <div className="flex bg-zinc-100 p-1 rounded-xl border border-zinc-200/60 max-w-md">
          {[
            { id: 'dashboard', label: 'Monitor', icon: Activity, badge: 0 },
            { id: 'ready-orders', label: 'Queue', icon: Package, badge: readyOrders.length },
            { id: 'shipments', label: 'Fleet', icon: Truck, badge: 0 },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setSelectedTab(tab.id)}
              className={`flex-1 flex items-center justify-center gap-2 py-2 px-4 rounded-lg font-bold text-[11px] uppercase tracking-wider transition-all duration-200 cursor-pointer ${
                selectedTab === tab.id
                  ? 'bg-white text-zinc-950 shadow-sm border border-zinc-200/50'
                  : 'text-zinc-500 hover:text-zinc-900 hover:bg-white/50'
              }`}
            >
              <tab.icon className="w-4 h-4" />
              <span>{tab.label}</span>
              {tab.badge > 0 && (
                <span className="px-1.5 py-0.5 rounded-full text-[9px] font-black bg-zinc-900 text-white leading-none">
                  {tab.badge}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* Dashboard Tab Content */}
        {selectedTab === 'dashboard' && (
          <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">

            {/* Connection Status & Summary */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white p-6 rounded-3xl border border-gray-100 shadow-xl shadow-gray-200/30">
              <div className="flex items-center gap-4">
                <div className={`p-3 rounded-2xl ${error ? 'bg-red-50 text-red-600' : 'bg-emerald-50 text-emerald-600'}`}>
                  {error ? <AlertCircle className="w-6 h-6" /> : <Activity className="w-6 h-6" />}
                </div>
                <div>
                  <h3 className="font-extrabold text-gray-900">{error ? 'Gateway Error' : 'Fleet Active'}</h3>
                  <p className="text-sm text-gray-500 font-medium">
                    {error ? error : `Last sync successful at ${lastUpdated?.toLocaleTimeString() || 'Just now'}`}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-4 w-full md:w-auto">
                <button
                  onClick={handleBulkUpdate}
                  disabled={bulkUpdating}
                  className="w-full md:w-auto px-6 py-3 bg-blue-50 text-blue-600 rounded-xl font-black text-sm hover:bg-blue-100 transition-colors flex items-center justify-center gap-2 border border-blue-100"
                >
                  <RefreshCw className={`w-4 h-4 ${bulkUpdating ? 'animate-spin' : ''}`} />
                  {bulkUpdating ? 'Synchronizing Tracking...' : 'Force Tracking Sync'}
                </button>
              </div>
            </div>

            {/* Quick Stats Grid */}
            {dashboard && (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                <StatCard title="Confirmed" value={dashboard.statistics?.total_orders || 0} icon={ShoppingCart} color="blue" change="+12.5%" changeType="positive" activeGateway={activeGateway} />
                <StatCard title="In Transit" value={dashboard.statistics?.shipped_orders || 0} icon={Truck} color="purple" change="+8.2%" changeType="positive" activeGateway={activeGateway} />
                <StatCard title="Completed" value={dashboard.statistics?.delivered_orders || 0} icon={CheckCircle} color="emerald" change="+15.3%" changeType="positive" activeGateway={activeGateway} />
                <StatCard title="Action Required" value={dashboard.statistics?.pending_shipments || 0} icon={AlertCircle} color="yellow" change="-3.1%" changeType="negative" activeGateway={activeGateway} />
              </div>
            )}

            {/* Courier Performance & Quick Actions */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Courier Metric Table */}
              <div className="lg:col-span-2 bg-white rounded-[2rem] shadow-2xl shadow-gray-200/50 border border-gray-100 overflow-hidden">
                <SectionHeader icon={Activity} title="Courier Intelligence" description="Real-time performance metrics by shipping partner" />

                <div className="overflow-x-auto px-4 pb-4">
                  <table className="min-w-full">
                    <thead>
                      <tr className="bg-gray-50 rounded-2xl overflow-hidden">
                        <th className="px-6 py-4 text-left text-[10px] font-black text-gray-400 uppercase tracking-widest rounded-l-2xl">Carrier Partner</th>
                        <th className="px-6 py-4 text-center text-[10px] font-black text-gray-400 uppercase tracking-widest">Volume</th>
                        <th className="px-6 py-4 text-center text-[10px] font-black text-gray-400 uppercase tracking-widest">Success</th>
                        <th className="px-6 py-4 text-left text-[10px] font-black text-gray-400 uppercase tracking-widest rounded-r-2xl">Probability</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50">
                      {dashboard?.courier_performance?.map((courier, idx) => (
                        <tr key={idx} className="hover:bg-gray-50/50 transition-colors group">
                          <td className="px-6 py-5">
                            <div className="flex items-center gap-4">
                              <div className="w-10 h-10 bg-gray-900 rounded-xl flex items-center justify-center text-white font-black group-hover:bg-orange-600 transition-colors">
                                {courier._id?.charAt(0) || 'U'}
                              </div>
                              <div>
                                <div className="text-sm font-black text-gray-900">{courier._id || 'Unknown'}</div>
                                <div className="text-[10px] font-bold text-gray-400 tracking-wider">VERIFIED PARTNER</div>
                              </div>
                            </div>
                          </td>
                          <td className="text-center font-bold text-gray-900">{courier.total_shipments}</td>
                          <td className="text-center font-bold text-emerald-600">{courier.delivered}</td>
                          <td className="px-6">
                            <div className="flex items-center gap-4">
                              <div className="flex-1 bg-gray-100 rounded-full h-1.5 overflow-hidden">
                                <div
                                  className={`h-full rounded-full transition-all duration-1000 ${parseFloat(courier.delivery_rate) > 80 ? 'bg-emerald-500' : 'bg-orange-500'
                                    }`}
                                  style={{ width: `${courier.delivery_rate}%` }}
                                />
                              </div>
                              <span className="text-xs font-black text-gray-900 w-10">{courier.delivery_rate}%</span>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Instant Actions Panel */}
              <div className="bg-gray-900 rounded-[2rem] p-8 text-white shadow-2xl shadow-gray-900/40 relative overflow-hidden">
                <div className="absolute top-0 right-0 p-12 opacity-10 pointer-events-none">
                  <Zap className="w-48 h-48 rotate-12" />
                </div>

                <h3 className="text-2xl font-black mb-1">Instant Operations</h3>
                <p className="text-gray-400 font-bold text-sm mb-8 uppercase tracking-widest">Fulfilment Shortcuts</p>

                <div className="space-y-4 relative z-10">
                  <button onClick={() => setSelectedTab('ready-orders')} className="w-full flex items-center justify-between p-5 bg-white/10 rounded-2xl hover:bg-white/20 transition-all border border-white/5 group">
                    <div className="flex items-center gap-4">
                      <div className="p-3 bg-orange-500 rounded-xl group-hover:scale-110 transition-transform">
                        <Package className="w-5 h-5 text-white" />
                      </div>
                      <div className="text-left">
                        <div className="font-black text-sm">Process Shipments</div>
                        <div className="text-[10px] font-bold text-gray-400">{readyOrders.length} Waiting</div>
                      </div>
                    </div>
                    <Activity className="w-4 h-4 text-gray-500" />
                  </button>

                  <button onClick={() => setSelectedTab('shipments')} className="w-full flex items-center justify-between p-5 bg-white/10 rounded-2xl hover:bg-white/20 transition-all border border-white/5 group">
                    <div className="flex items-center gap-4">
                      <div className="p-3 bg-blue-500 rounded-xl group-hover:scale-110 transition-transform">
                        <Truck className="w-5 h-5 text-white" />
                      </div>
                      <div className="text-left">
                        <div className="font-black text-sm">Active Fleet</div>
                        <div className="text-[10px] font-bold text-gray-400">All Live Tracking</div>
                      </div>
                    </div>
                    <Activity className="w-4 h-4 text-gray-500" />
                  </button>

                  <button onClick={handleBulkUpdate} className="w-full flex items-center justify-between p-5 bg-emerald-500/10 rounded-2xl hover:bg-emerald-500/20 transition-all border border-emerald-500/20 group">
                    <div className="flex items-center gap-4">
                      <div className="p-3 bg-emerald-500 rounded-xl group-hover:rotate-180 transition-transform duration-700">
                        <RefreshCw className="w-5 h-5 text-white" />
                      </div>
                      <div className="text-left">
                        <div className="font-black text-sm">Force Lifecycle Sync</div>
                        <div className="text-[10px] font-bold text-emerald-400/80">Update Tracking Data</div>
                      </div>
                    </div>
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Ready Orders Tab Content */}
        {selectedTab === 'ready-orders' && (
          <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
            <SectionHeader
              icon={Package}
              title="Fulfilment Queue"
              description="Analyze and process orders validated for immediate shipping"
            >
              <div className="flex gap-3">
                <button
                  onClick={fetchReadyOrders}
                  className="p-4 bg-white border border-gray-100 text-gray-500 rounded-2xl hover:bg-gray-50 transition-all shadow-lg shadow-gray-200/50"
                  title="Reload Queue"
                >
                  <RefreshCw className={`w-5 h-5 ${loading ? 'animate-spin' : ''}`} />
                </button>
              </div>
            </SectionHeader>

            {/* Processing Analytics Bar */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-xl shadow-gray-200/20 flex items-center gap-5">
                <div className="p-4 bg-orange-50 rounded-2xl text-orange-600">
                  <Clock className="w-6 h-6" />
                </div>
                <div>
                  <div className="text-2xl font-black text-gray-900">{readyOrders.length}</div>
                  <div className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Pending Fulfilment</div>
                </div>
              </div>
              <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-xl shadow-gray-200/20 flex items-center gap-5">
                <div className="p-4 bg-blue-50 rounded-2xl text-blue-600">
                  <ShoppingCart className="w-6 h-6" />
                </div>
                <div>
                  <div className="text-2xl font-black text-gray-900">
                    ₹{readyOrders.reduce((sum, o) => sum + (o.totalAmount || 0), 0).toLocaleString()}
                  </div>
                  <div className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Queue Value</div>
                </div>
              </div>
              <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-xl shadow-gray-200/20 flex items-center gap-5">
                <div className="p-4 bg-emerald-50 rounded-2xl text-emerald-600">
                  <Zap className="w-6 h-6" />
                </div>
                <div>
                  <div className="text-2xl font-black text-gray-900">{selectedOrders.length}</div>
                  <div className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Selected for Ship</div>
                </div>
              </div>
            </div>

            {loading ? (
              <div className="p-24 bg-white rounded-[2rem] border border-gray-100 shadow-2xl flex flex-col items-center">
                <div className="relative mb-8">
                  <div className="w-20 h-20 border-4 border-orange-50 border-t-orange-500 rounded-full animate-spin"></div>
                  <Package className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-8 h-8 text-orange-200" />
                </div>
                <h3 className="text-2xl font-black text-gray-900 tracking-tight">Accessing Logistics Queue</h3>
                <p className="text-gray-400 font-bold text-xs uppercase tracking-[0.2em] mt-2">Connecting to {activeGateway} API...</p>
              </div>
            ) : readyOrders.length === 0 ? (
              <EmptyState
                icon={CheckCircle}
                title="All Clear"
                description="The fulfilment queue is empty. All current orders have been processed successfully."
                actionText="Sync Orders"
                onAction={handleRefresh}
              />
            ) : (
              <div className="bg-white rounded-[2rem] shadow-2xl shadow-gray-200/50 border border-gray-100 overflow-hidden transition-all duration-500">
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="bg-gray-50/50 border-b border-gray-100">
                        <th className="px-6 py-5 text-[10px] font-black text-gray-400 uppercase tracking-widest text-center w-16">
                          <input
                            type="checkbox"
                            checked={readyOrders.length > 0 && selectedOrders.length === readyOrders.length}
                            onChange={handleSelectAll}
                            className="w-5 h-5 rounded-lg border-2 border-gray-200 text-orange-500 focus:ring-orange-500 cursor-pointer transition-all"
                          />
                        </th>
                        <th className="px-6 py-5 text-[10px] font-black text-gray-400 uppercase tracking-widest">Order Info</th>
                        <th className="px-6 py-5 text-[10px] font-black text-gray-400 uppercase tracking-widest">Route & Details</th>
                        <th className="px-6 py-5 text-[10px] font-black text-gray-400 uppercase tracking-widest text-center">Items</th>
                        <th className="px-6 py-5 text-[10px] font-black text-gray-400 uppercase tracking-widest">Value</th>
                        <th className="px-6 py-5 text-[10px] font-black text-gray-400 uppercase tracking-widest">Status</th>
                        <th className="px-6 py-5 text-[10px] font-black text-gray-400 uppercase tracking-widest text-right">Operations</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50">
                      {readyOrders.map((order) => {
                        const orderId = order.id || order._id;
                        const isSelected = selectedOrders.includes(orderId);
                        return (
                          <tr key={orderId} className={`group hover:bg-orange-50/30 transition-all duration-300 ${isSelected ? 'bg-orange-50/30' : ''}`}>
                            <td className="px-6 py-5 text-center">
                              <input
                                type="checkbox"
                                checked={isSelected}
                                onChange={() => handleOrderSelection(orderId)}
                                className="w-5 h-5 rounded-lg border-2 border-gray-200 text-orange-500 focus:ring-orange-500 cursor-pointer transition-all"
                              />
                            </td>
                            <td className="px-6 py-5">
                              <div className="font-black text-gray-900 group-hover:text-orange-600 transition-colors">
                                ORD-{String(orderId).slice(-6).toUpperCase()}
                              </div>
                              <div className="text-[10px] font-bold text-gray-400 uppercase tracking-tight">
                                {new Date(order.placedAt).toLocaleDateString()}
                              </div>
                            </td>
                            <td className="px-6 py-5">
                              <div className="flex flex-col gap-3">
                                {/* Route Visual */}
                                <div className="flex items-stretch gap-3">
                                  {/* Timeline indicator */}
                                  <div className="flex flex-col items-center pt-1">
                                    <div className="w-2 h-2 rounded-full bg-gray-400"></div>
                                    <div className="w-px h-5 border-l-2 border-dashed border-gray-300 my-0.5 flex-1"></div>
                                    <div className="w-2 h-2 rounded-sm bg-gray-700 rotate-45"></div>
                                  </div>
                                  
                                  {/* Addresses */}
                                  <div className="flex flex-col gap-2 justify-between">
                                    <div className="text-[11px] font-medium text-gray-600 flex items-center gap-2">
                                      <span className="text-gray-800 font-bold truncate max-w-[150px]">Gurmeetkaur Store</span>
                                      <span className="text-gray-400">(Faridabad - 110005)</span>
                                    </div>
                                    <div className="text-[11px] font-medium text-gray-600 flex items-center gap-2">
                                      <span className="text-gray-800 font-bold truncate max-w-[150px]">{order.shippingAddress?.name || 'Customer'}</span>
                                      <span className="text-gray-400">({order.shippingAddress?.city || 'City'} - {order.shippingAddress?.pincode || 'ZIP'})</span>
                                    </div>
                                  </div>
                                </div>
                              </div>
                            </td>
                            <td className="px-6 py-5 text-center">
                              <span className="px-3 py-1 bg-gray-100 rounded-lg text-[10px] font-black text-gray-600 uppercase tracking-widest">
                                {order.items?.length || 0} SKU
                              </span>
                            </td>
                            <td className="px-6 py-5 font-black text-gray-900">
                              ₹{(order.totalAmount || 0).toLocaleString()}
                            </td>
                            <td className="px-6 py-5">
                              <div className="flex flex-col gap-2">
                                <div className="flex items-center gap-1.5">
                                  <div className="p-1 bg-orange-100 rounded-md">
                                    <Weight className="w-3 h-3 text-orange-600" />
                                  </div>
                                  <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Ship Weight</span>
                                </div>
                                <div className="relative group/weight">
                                  <input
                                    type="number"
                                    min="0.01"
                                    max="20"
                                    step="0.01"
                                    placeholder={`${order.shipping?.weight || '0.5'}`}
                                    value={manualWeights[orderId] || ''}
                                    onChange={(e) => {
                                      const val = e.target.value;
                                      // Allow clearing or within 0-20
                                      if (val === '' || (parseFloat(val) >= 0 && parseFloat(val) <= 20)) {
                                        setManualWeights(prev => ({ ...prev, [orderId]: val }));
                                      }
                                    }}
                                    className={`w-24 pl-3 pr-8 py-2 bg-gray-50 border rounded-xl text-xs font-black outline-none transition-all duration-300
                                      ${manualWeights[orderId] 
                                        ? 'border-orange-500 bg-orange-50/30 ring-4 ring-orange-500/10 text-orange-600' 
                                        : 'border-gray-100 hover:border-gray-200 focus:border-orange-500 focus:bg-white focus:ring-4 focus:ring-orange-500/10'
                                      }`}
                                  />
                                  <span className={`absolute right-3 top-1/2 -translate-y-1/2 text-[10px] font-black tracking-tight transition-colors
                                    ${manualWeights[orderId] ? 'text-orange-500' : 'text-gray-400'}`}>
                                    KG
                                  </span>
                                </div>
                                {order.shipping?.weight && !manualWeights[orderId] && (
                                  <div className="flex items-center gap-1 opacity-60">
                                    <div className="w-1 h-1 rounded-full bg-gray-400"></div>
                                    <span className="text-[9px] font-bold text-gray-400 italic">Auto: {order.shipping.weight}kg</span>
                                  </div>
                                )}
                              </div>
                            </td>
                            <td className="px-6 py-5">
                              <StatusBadge status={order.orderStatus} />
                            </td>
                            <td className="px-6 py-5 text-right">
                              <div className="flex items-center justify-end gap-2">
                                <ActionButton
                                  onClick={() => handleShipmentAction('create', orderId)}
                                  icon={Zap}
                                  title="Ship Now"
                                  color="blue"
                                  loading={actionLoading[orderId]}
                                />
                                <ActionButton
                                  onClick={() => handleShipmentAction('invoice', orderId)}
                                  icon={FileText}
                                  title="Invoice"
                                  color="purple"
                                />
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Shipments Tab Content */}
        {selectedTab === 'shipments' && (
          <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
            <SectionHeader
              icon={Activity}
              title="Global Fleet Monitor"
              description="Live lifecycle tracking for all active and historical shipments"
            >
              <div className="flex bg-white p-2 rounded-2xl border border-gray-100 shadow-xl shadow-gray-200/50">
                <div className="relative">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search Tracking ID, Customer..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-12 pr-6 py-3 bg-transparent border-none focus:ring-0 text-sm font-bold text-gray-900 w-64 lg:w-96"
                  />
                </div>
              </div>
            </SectionHeader>

            {/* Shipments Health Filter Bar */}
            <div className="flex flex-wrap items-center justify-between gap-4 bg-white p-6 rounded-3xl border border-gray-100 shadow-xl shadow-gray-200/20">
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2 px-4 py-2 bg-gray-50 rounded-xl border border-gray-100">
                  <Filter className="w-4 h-4 text-gray-400" />
                  <select
                    value={filters.status}
                    onChange={(e) => setFilters({ ...filters, status: e.target.value, page: 1 })}
                    className="bg-transparent border-none text-xs font-black text-gray-600 focus:ring-0 cursor-pointer"
                  >
                    <option value="">All Statuses</option>
                    <option value="NEW">Pending Pickup</option>
                    <option value="Shipped">In Transit</option>
                    <option value="Delivered">Delivered</option>
                    <option value="Cancelled">Cancelled</option>
                  </select>
                </div>
                <div className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] bg-orange-50 text-orange-600 px-4 py-2 rounded-xl">
                  {filteredShipments.length} active fleet units
                </div>
              </div>

              <button
                onClick={handleBulkUpdate}
                disabled={bulkUpdating}
                className="px-6 py-2.5 bg-blue-50 text-blue-600 rounded-xl text-xs font-black uppercase tracking-widest hover:bg-blue-100 transition-all flex items-center gap-2 active:scale-95"
              >
                <RefreshCw className={`w-4 h-4 ${bulkUpdating ? 'animate-spin' : ''}`} />
                Sync Tracking
              </button>
            </div>

            {loading ? (
              <div className="p-24 bg-white rounded-[2rem] border border-gray-100 shadow-2xl flex flex-col items-center">
                <div className="w-16 h-16 border-4 border-blue-50 border-t-blue-500 rounded-full animate-spin mb-6"></div>
                <h3 className="text-xl font-black text-gray-900">Synchronizing Fleet Telemetry</h3>
              </div>
            ) : filteredShipments.length === 0 ? (
              <EmptyState
                icon={Truck}
                title="No Active Shipments"
                description="The global fleet is currently at rest. Process orders to begin tracking."
                actionText="Refresh Sync"
                onAction={fetchShipments}
              />
            ) : (
              <div className="bg-white rounded-[2rem] shadow-2xl shadow-gray-200/50 border border-gray-100 overflow-hidden transition-all duration-500">
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="bg-gray-50/50 border-b border-gray-100">
                        <th className="px-6 py-5 text-[10px] font-black text-gray-400 uppercase tracking-widest">Shipment Info</th>
                        <th className="px-6 py-5 text-[10px] font-black text-gray-400 uppercase tracking-widest">Route</th>
                        <th className="px-6 py-5 text-[10px] font-black text-gray-400 uppercase tracking-widest">Customer</th>
                        <th className="px-6 py-5 text-[10px] font-black text-gray-400 uppercase tracking-widest">Value</th>
                        <th className="px-6 py-5 text-[10px] font-black text-gray-400 uppercase tracking-widest text-center">Status</th>
                        <th className="px-6 py-5 text-[10px] font-black text-gray-400 uppercase tracking-widest text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50">
                      {filteredShipments.map((shipment, index) => {
                        const orderId = shipment.order_id;
                        return (
                          <tr key={orderId || index} className="group hover:bg-blue-50/5 transition-all duration-300">
                            <td className="px-6 py-5">
                              <div className="flex flex-col">
                                <div className="font-black text-gray-900 group-hover:text-blue-600 transition-colors flex items-center gap-2">
                                  {(shipment.courier?.awb_code || shipment.shiprocket?.awb_code || shipment.delhivery?.waybill) ? (
                                    <>
                                      <Truck className="w-3.5 h-3.5 text-blue-500" />
                                      {shipment.courier?.awb_code || shipment.shiprocket?.awb_code || shipment.delhivery?.waybill}
                                    </>
                                  ) : (
                                    <span className="text-gray-400 font-bold italic">Awaiting AWB</span>
                                  )}
                                </div>
                                <div className="text-[10px] font-bold text-gray-400 uppercase mt-1">
                                  ORD-{String(orderId).slice(-6).toUpperCase()}
                                </div>
                              </div>
                            </td>
                            <td 
                              className="px-6 py-5 cursor-pointer hover:bg-gray-50/80 transition-all rounded-xl relative group/route"
                              onClick={() => setTrackingModalOrderId(orderId)}
                            >
                              <div className="absolute inset-0 bg-blue-50/0 group-hover/route:bg-blue-50/50 rounded-xl transition-all pointer-events-none"></div>
                              <div className="flex flex-col relative z-10 p-1">
                                <div className="text-[10px] font-black text-orange-500 uppercase flex items-center gap-1 group-hover/route:text-orange-600 transition-colors">
                                  <MapPin size={8} /> {shipment.route?.origin?.city || 'Origin'}
                                </div>
                                <div className="h-4 w-px bg-gray-200 ml-1 my-0.5 group-hover/route:bg-orange-200 transition-colors"></div>
                                <div className="text-[10px] font-black text-blue-500 uppercase flex items-center gap-1 group-hover/route:text-blue-600 transition-colors">
                                  <MapPin size={8} /> {shipment.route?.destination?.city || 'Destination'}
                                </div>
                                <div className="text-[9px] font-bold text-gray-400 mt-1 uppercase tracking-tighter flex items-center justify-between">
                                  <span>via {shipment.courier?.name || shipment.shiprocket?.courier_name || (shipment.shipping?.method === 'Delhivery' ? 'Delhivery B2C' : 'Carrier')}</span>
                                  <span className="opacity-0 group-hover/route:opacity-100 text-blue-500 flex items-center gap-1 transition-opacity">
                                    <Activity className="w-3 h-3" /> Track
                                  </span>
                                </div>
                              </div>
                            </td>
                            <td className="px-6 py-5 text-sm font-bold text-gray-700">
                              {shipment.customer?.name || 'Customer'}
                            </td>
                            <td className="px-6 py-5">
                              <div className="font-black text-gray-900">₹{(shipment.total_amount || 0).toLocaleString()}</div>
                              <div className="text-[9px] font-bold text-gray-400 uppercase tracking-tighter">{shipment.payment_method}</div>
                            </td>
                            <td className="px-6 py-5 text-center">
                              <StatusBadge status={shipment.shiprocket?.current_status || shipment.delhivery?.current_status || shipment.order_status} />
                            </td>
                            <td className="px-6 py-5 text-right">
                              <div className="flex items-center justify-end gap-1">
                                <ActionButton
                                  onClick={() => handleShipmentAction('track', orderId)}
                                  icon={Activity}
                                  title="Track"
                                  color="blue"
                                  loading={actionLoading[orderId]}
                                />
                                {activeGateway === 'Shiprocket' && (
                                  <>
                                    <ActionButton
                                      onClick={() => handleShipmentAction('schedule_pickup', orderId)}
                                      icon={MapPin}
                                      title="Schedule Pickup"
                                      color="green"
                                      loading={actionLoading[orderId]}
                                    />
                                    {shipment.shiprocket?.shipment_id && !shipment.shiprocket?.manifest_id && (
                                      <ActionButton
                                        onClick={() => handleShipmentAction('manifest', orderId)}
                                        icon={Zap}
                                        title="Generate Manifest"
                                        color="orange"
                                        loading={actionLoading[orderId]}
                                      />
                                    )}
                                    {shipment.shiprocket?.manifest_id && (
                                      <ActionButton
                                        onClick={() => handleShipmentAction('print_manifest', orderId)}
                                        icon={FileText}
                                        title="Print Manifest"
                                        color="orange"
                                        loading={actionLoading[orderId]}
                                      />
                                    )}
                                  </>
                                )}
                                <ActionButton
                                  onClick={() => handleShipmentAction('generate_label', orderId)}
                                  icon={Download}
                                  title="Label"
                                  color="purple"
                                  loading={actionLoading[orderId]}
                                />
                                {shipment.shiprocket?.current_status === 'Delivered' && (
                                  <ActionButton
                                    onClick={() => handleShipmentAction('return', orderId)}
                                    icon={RefreshCw}
                                    title="Initiate Return"
                                    color="red"
                                    loading={actionLoading[orderId]}
                                  />
                                )}
                                <ActionButton
                                  onClick={() => handleShipmentAction('invoice', orderId)}
                                  icon={FileText}
                                  title="Invoice"
                                  color="gray"
                                />
                                <ActionButton
                                  onClick={() => handleShipmentAction('cancel', orderId)}
                                  icon={XCircle}
                                  title="Cancel"
                                  color="red"
                                  loading={actionLoading[orderId]}
                                />
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* Advanced Pagination */}
            <div className="flex justify-between items-center bg-white p-8 rounded-[2.5rem] border border-gray-100 shadow-2xl shadow-gray-200/40">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-gray-50 rounded-xl">
                  <Activity className="w-5 h-5 text-gray-400" />
                </div>
                <div>
                  <div className="text-sm font-black text-gray-900">Fleet Coverage</div>
                  <div className="text-[10px] font-bold text-gray-400 uppercase">Showing batch of {filteredShipments.length}</div>
                </div>
              </div>

              <div className="flex items-center gap-4 bg-gray-50 p-2 rounded-2xl">
                <button
                  disabled={filters.page === 1}
                  onClick={() => setFilters({ ...filters, page: filters.page - 1 })}
                  className="p-3 bg-white rounded-xl border border-gray-100 hover:shadow-md disabled:opacity-30 transition-all active:scale-90"
                >
                  <ArrowLeft className="w-4 h-4" />
                </button>
                <div className="px-6 text-sm font-black text-gray-900 font-mono">
                  {String(filters.page).padStart(2, '0')}
                </div>
                <button
                  onClick={() => setFilters({ ...filters, page: filters.page + 1 })}
                  className="p-3 bg-white rounded-xl border border-gray-100 hover:shadow-md transition-all active:scale-90"
                >
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Bulk Action Toolbar */}
      {
        selectedOrders.length > 0 && selectedTab === 'ready-orders' && (
          <div className="fixed bottom-12 left-1/2 -translate-x-1/2 z-50 animate-in slide-in-from-bottom-12 duration-500">
            <div className="bg-gray-900 text-white p-4 pr-6 rounded-[2rem] shadow-3xl shadow-gray-900/40 flex items-center gap-8 border border-white/10 backdrop-blur-xl">
              <div className="flex items-center gap-4 pl-4 border-r border-white/10 pr-6">
                <div className="w-10 h-10 bg-orange-500 rounded-xl flex items-center justify-center font-black animate-bounce">
                  {selectedOrders.length}
                </div>
                <div className="text-sm font-black uppercase tracking-widest text-orange-500">Selected</div>
              </div>

              <div className="flex items-center gap-3">
                <button
                  onClick={handleBulkCreateShipments}
                  className="flex items-center gap-2 px-6 py-3 bg-white text-gray-900 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-orange-500 hover:text-white transition-all transform hover:-translate-y-1 active:scale-95"
                >
                  <Truck className="w-4 h-4" />
                  Initialize Shipment
                </button>
                <button
                  onClick={handleBulkGenerateLabels}
                  className="flex items-center gap-2 px-6 py-3 bg-white/10 text-white rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-white/20 transition-all transform hover:-translate-y-1 active:scale-95"
                >
                  <Download className="w-4 h-4" />
                  Generate Labels
                </button>
                <button
                  onClick={() => setSelectedOrders([])}
                  className="p-3 bg-red-500/10 text-red-500 rounded-2xl hover:bg-red-500/20 transition-all"
                  title="Clear Selection"
                >
                  <XCircle className="w-5 h-5" />
                </button>
              </div>
            </div>
          </div>
        )
      }

      {/* Shipping Calculator Modal */}
      {
        showCalculator && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-gray-900/60 backdrop-blur-sm" onClick={() => setShowCalculator(false)}></div>
            <div className="relative w-full max-w-4xl max-h-[90vh] overflow-y-auto animate-in zoom-in-95 duration-300 shadow-2xl rounded-3xl">
              <ShippingCalculator onClose={() => setShowCalculator(false)} />
            </div>
          </div>
        )
      }

      {/* Floating Action Button for Quick Actions */}
      <div className="fixed bottom-8 right-8 z-40">
        <div className="relative group">
          <button
            onClick={() => setShowManualOrderForm(true)}
            className="w-16 h-16 bg-gradient-to-r from-orange-500 to-red-600 text-white rounded-full shadow-2xl hover:shadow-3xl transition-all duration-300 transform hover:scale-110 flex items-center justify-center group-hover:rotate-45 border border-white/10"
          >
            <Plus className="w-8 h-8 transition-transform duration-300" />
          </button>

          <div className="absolute bottom-full right-0 mb-4 opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-y-2 group-hover:translate-y-0 text-right">
            <div className="bg-gray-900 text-white px-4 py-2 rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-2xl whitespace-nowrap border border-white/5">
              Fulfilment Center
              <div className="absolute top-full right-6 w-0 h-0 border-l-6 border-r-6 border-t-6 border-transparent border-t-gray-900"></div>
            </div>
          </div>

          <div className="absolute inset-0 rounded-full bg-orange-500 animate-ping opacity-20 pointer-events-none"></div>
        </div>
      </div>

      {/* Tracking Modal */}
      {trackingModalOrderId && (
        <div className="fixed inset-0 z-[100] bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-[2.5rem] shadow-3xl w-full max-w-2xl relative animate-in zoom-in-95 duration-300 max-h-[90vh] overflow-y-auto my-8 p-8 border border-gray-100">
            <button 
              onClick={() => setTrackingModalOrderId(null)}
              className="absolute top-6 right-6 p-2 bg-gray-50 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all"
            >
              <XCircle className="w-6 h-6" />
            </button>
            <div className="mb-6 pb-6 border-b border-gray-100">
               <h3 className="text-xl font-black text-gray-900 flex items-center gap-3">
                 <div className="p-2 bg-blue-50 text-blue-500 rounded-xl">
                   <Activity className="w-5 h-5" />
                 </div>
                 Live Tracking
               </h3>
               <div className="flex items-center gap-3 mt-2 pl-12 text-xs font-bold uppercase tracking-widest">
                 <span className="text-gray-400">Order #{String(trackingModalOrderId).slice(-6).toUpperCase()}</span>
                 <div className="w-1 h-1 bg-gray-300 rounded-full"></div>
                 <span className="text-blue-500 flex items-center gap-1">
                   <Zap className="w-3 h-3" /> Real-time Sync
                 </span>
               </div>
            </div>
            <div className="pl-2">
              <OrderTrackingWidget orderId={trackingModalOrderId} showSearch={false} />
            </div>
          </div>
        </div>
      )}

      {showManualOrderForm && (
        <div className="fixed inset-0 z-[100] bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-[2.5rem] shadow-3xl w-full max-w-4xl relative animate-in zoom-in-95 duration-300 max-h-[90vh] overflow-y-auto my-8">
            <ManualOrderForm
              onClose={() => setShowManualOrderForm(false)}
              onSuccess={() => {
                setShowManualOrderForm(false);
                fetchReadyOrders();
              }}
            />
          </div>
        </div>
      )}
    </div >
  );
};

export default ShiprocketManager;

/* ---------- HELPER COMPONENTS ---------- */

const StatCard = ({ title, value, icon: Icon, color, change, changeType, activeGateway }) => {
  const colorClasses = {
    blue: 'from-blue-500 to-blue-600 bg-blue-50 text-blue-500',
    green: 'from-green-500 to-green-600 bg-green-50 text-green-500',
    emerald: 'from-emerald-500 to-emerald-600 bg-emerald-50 text-emerald-500',
    yellow: 'from-yellow-500 to-orange-500 bg-yellow-50 text-yellow-500',
    purple: 'from-purple-500 to-indigo-600 bg-purple-50 text-purple-500',
    red: 'from-red-500 to-pink-600 bg-red-50 text-red-500',
  };

  const selectedColor = colorClasses[color] || colorClasses.blue;
  const [bgGradient, iconColor] = selectedColor.split(' ');

  return (
    <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 hover:shadow-xl transition-all duration-300 group transform hover:-translate-y-1">
      <div className="flex items-center justify-between mb-4">
        <div className={`p-3 rounded-xl ${color.startsWith('bg-') ? color : `bg-${color}-50`} group-hover:scale-110 transition-transform duration-300`}>
          <Icon className={`w-6 h-6 ${color.startsWith('text-') ? color : `text-${color}-500`}`} />
        </div>
        {change && (
          <div className={`flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold ${changeType === 'positive' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
            }`}>
            <TrendingUp className={`w-3 h-3 ${changeType === 'negative' ? 'rotate-180' : ''}`} />
            {change}
          </div>
        )}
      </div>
      <div>
        <p className="text-sm font-semibold text-gray-500 mb-1 uppercase tracking-wider">{title}</p>
        <p className="text-3xl font-extrabold text-gray-900 tracking-tight">
          {typeof value === 'number' ? value.toLocaleString() : value}
        </p>
        <p className="text-xs text-gray-400 mt-2 flex items-center gap-1">
          <Activity className="w-3 h-3" />
          Live updates from {activeGateway}
        </p>
      </div>
    </div>
  );
};

const StatusBadge = ({ status }) => {
  const config = {
    // Human-readable labels
    'Delivered': { color: 'bg-emerald-100 text-emerald-700 border-emerald-200', icon: CheckCircle },
    'Shipped': { color: 'bg-blue-100 text-blue-700 border-blue-200', icon: Truck },
    'Processing': { color: 'bg-amber-100 text-amber-700 border-amber-200', icon: Clock },
    'Cancelled': { color: 'bg-red-100 text-red-700 border-red-200', icon: XCircle },
    'NEW': { color: 'bg-indigo-100 text-indigo-700 border-indigo-200', icon: Package },
    'Pending': { color: 'bg-gray-100 text-gray-700 border-gray-200', icon: Clock },
    
    // Shiprocket specific strings/codes
    'AWB ASSIGNED': { color: 'bg-blue-100 text-blue-700 border-blue-200', icon: Truck },
    '3': { color: 'bg-blue-100 text-blue-700 border-blue-200', icon: Truck, label: 'AWB Assigned' },
    'PICKUP SCHEDULED': { color: 'bg-orange-100 text-orange-700 border-orange-200', icon: MapPin },
    '4': { color: 'bg-orange-100 text-orange-700 border-orange-200', icon: MapPin, label: 'Pickup Scheduled' },
    'PICKED UP': { color: 'bg-blue-100 text-blue-700 border-blue-200', icon: Truck },
    '1': { color: 'bg-gray-100 text-gray-700 border-gray-200', icon: Clock, label: 'Order Created' },
    '6': { color: 'bg-emerald-100 text-emerald-700 border-emerald-200', icon: CheckCircle, label: 'Delivered' },
  };

  const statusConfig = config[status] || config.Pending;
  const { color, icon: Icon, label } = statusConfig;

  return (
    <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border shadow-sm ${color}`}>
      <Icon className="w-3.5 h-3.5" />
      {label || status}
    </span>
  );
};

const ActionButton = ({ onClick, icon: Icon, title, color = "gray", loading = false, disabled = false }) => {
  const colorMap = {
    blue: "text-blue-600 hover:bg-blue-50 hover:text-blue-800",
    green: "text-emerald-600 hover:bg-emerald-50 hover:text-emerald-800",
    purple: "text-purple-600 hover:bg-purple-50 hover:text-purple-800",
    red: "text-red-600 hover:bg-red-50 hover:text-red-800",
    gray: "text-gray-600 hover:bg-gray-100 hover:text-gray-800",
  };

  return (
    <button
      onClick={onClick}
      disabled={disabled || loading}
      className={`p-2.5 rounded-xl transition-all duration-200 shadow-sm hover:shadow-md active:scale-95 disabled:opacity-50 disabled:pointer-events-none ${colorMap[color]}`}
      title={title}
    >
      {loading ? (
        <RefreshCw className="w-4 h-4 animate-spin" />
      ) : (
        <Icon className="w-4 h-4" />
      )}
    </button>
  );
};

const EmptyState = ({ icon: Icon, title, description, actionText, onAction }) => (
  <div className="p-16 text-center animate-in fade-in zoom-in duration-500">
    <div className="relative inline-block mb-6">
      <div className="absolute inset-0 bg-orange-100 rounded-full scale-150 opacity-20 animate-pulse"></div>
      <Icon className="w-20 h-20 text-gray-300 relative z-10 mx-auto" />
      <div className="absolute -bottom-2 -right-2 w-8 h-8 bg-white rounded-full shadow-lg flex items-center justify-center border border-gray-100">
        <AlertCircle className="w-5 h-5 text-orange-400" />
      </div>
    </div>
    <h3 className="text-2xl font-bold text-gray-900 mb-3">{title}</h3>
    <p className="text-gray-500 mb-8 max-w-sm mx-auto leading-relaxed">{description}</p>
    {actionText && (
      <button
        onClick={onAction}
        className="inline-flex items-center gap-2 px-8 py-3 bg-gradient-to-r from-orange-500 to-red-500 text-white rounded-xl hover:from-orange-600 hover:to-red-600 transition-all duration-300 shadow-xl hover:shadow-orange-200/50 font-bold transform hover:-translate-y-1"
      >
        <RefreshCw className="w-5 h-5" />
        {actionText}
      </button>
    )}
  </div>
);

const SectionHeader = ({ icon: Icon, title, description, children }) => (
  <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
    <div className="flex items-center gap-4">
      <div className="p-3 bg-white rounded-2xl shadow-md border border-gray-100">
        <Icon className="w-8 h-8 text-orange-500" />
      </div>
      <div>
        <h2 className="text-2xl font-bold text-gray-900 tracking-tight">{title}</h2>
        <p className="text-gray-500 text-sm">{description}</p>
      </div>
    </div>
    <div className="flex flex-wrap gap-3 w-full md:w-auto">
      {children}
    </div>
  </div>
);