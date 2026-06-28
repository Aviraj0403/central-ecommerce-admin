import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { toast } from 'react-hot-toast';
import { 
  Settings, 
  Truck, 
  ShieldCheck, 
  RefreshCw, 
  Save, 
  ChevronRight,
  Sliders,
  Users,
  ShieldAlert
} from 'lucide-react';
import { getSettings, updateSettings } from '../../services/SettingsApi';
import { useAuth } from '../../context/AuthContext';
import { getAllAdmins, createAdmin, updateAdminPermissions, updateAdminRole } from '../../services/authApi';
import { getRoles } from '../../services/roleApi';

import TeamTab from './TeamTab';
import CreateAdminModal from './CreateAdminModal';
import RolesTab from './RolesTab';
import SuperAdminTab from './SuperAdminTab';
import IntegrationsTab from './IntegrationsTab';

export default function SettingsPage() {
  const { user: currentUser } = useAuth();
  const isSuperAdmin = currentUser?.roleType === 'superadmin';

  const [activeTab, setActiveTab] = useState('logistics');
  const [settings, setSettings] = useState({
    shiprocket_enabled: true,
    delhivery_enabled: true
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [admins, setAdmins] = useState([]);
  const [availableRoles, setAvailableRoles] = useState([]);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newAdmin, setNewAdmin] = useState({
    userName: '',
    email: '',
    password: '',
    phoneNumber: '',
    permissions: {
      leads: true,
      offers: true,
      banners: true,
      shipping: true,
      stocks: true,
      cod: true,
      reports: true,
      products: true,
      categories: true,
      orders: true,
      users: true
    }
  });

  useEffect(() => {
    fetchSettingsData();
    fetchAdminsList();
    fetchRolesList();
  }, []);

  const fetchRolesList = async () => {
    try {
      const res = await getRoles();
      if (res.success) setAvailableRoles(res.roles || []);
    } catch (err) {}
  };

  const fetchSettingsData = async () => {
    try {
      setLoading(true);
      const data = await getSettings();
      if (data.success) {
        setSettings(data.settings);
      }
    } catch (err) {
      toast.error('Failed to load settings');
    } finally {
      setLoading(false);
    }
  };

  const fetchAdminsList = async () => {
    try {
      const res = await getAllAdmins();
      if (res.success) {
        setAdmins(res.admins || res.data || []);
      }
    } catch (err) {
      console.error('Failed to load admins list:', err);
    }
  };

  const handleSaveSettings = async () => {
    try {
      setSaving(true);
      const data = await updateSettings(settings);
      if (data.success) {
        toast.success('Settings synchronized successfully!');
      }
    } catch (err) {
      toast.error(err.message || 'Failed to save settings');
    } finally {
      setSaving(false);
    }
  };

  const handleCreateAdminSubmit = async (e) => {
    e.preventDefault();
    try {
      setSaving(true);
      const res = await createAdmin(newAdmin);
      if (res.success) {
        toast.success('Admin provisioned successfully!');
        setShowCreateModal(false);
        fetchAdminsList();
        setNewAdmin({
          userName: '',
          email: '',
          password: '',
          phoneNumber: '',
          permissions: {
            leads: true,
            offers: true,
            banners: true,
            shipping: true,
            stocks: true,
            cod: true,
            reports: true,
            products: true,
            categories: true,
            orders: true,
            users: true
          }
        });
      }
    } catch (err) {
      toast.error(err.response?.data?.message || err.message || 'Failed to create admin');
    } finally {
      setSaving(false);
    }
  };

  const handleToggleAdminPermission = async (adminId, permissionKey, currentVal) => {
    try {
      const payload = {
        userId: adminId,
        permissions: { [permissionKey]: !currentVal }
      };
      const res = await updateAdminPermissions(payload);
      if (res.success) {
        toast.success('Permissions updated successfully!');
        fetchAdminsList();
      }
    } catch (err) {
      toast.error('Failed to toggle permission');
    }
  };

  const handleUpdateRole = async (adminId, newRole) => {
    try {
      const payload = {
        userId: adminId,
        roleType: newRole
      };
      const res = await updateAdminRole(payload);
      if (res.success) {
        toast.success(res.message || 'Role updated successfully!');
        fetchAdminsList();
      }
    } catch (err) {
      toast.error(err.response?.data?.message || err.message || 'Failed to update role');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <RefreshCw className="animate-spin text-orange-500" size={32} />
      </div>
    );
  }

  const TABS = [
    { id: 'logistics', label: 'Logistics Gateways', icon: <Truck size={16} />, color: 'orange' },
    ...(isSuperAdmin ? [
      { id: 'integrations', label: 'Integrations & API', icon: <Settings size={16} />, color: 'blue' },
      { id: 'team', label: 'Team Console', icon: <Users size={16} />, color: 'indigo' },
      { id: 'roles', label: 'Role Management', icon: <ShieldAlert size={16} />, color: 'indigo' },
      { id: 'security', label: 'Security & Access', icon: <ShieldCheck size={16} />, color: 'emerald' }
    ] : []),
    { id: 'superadmin', label: 'Super Admin Portal', icon: <ShieldAlert size={16} />, color: 'red' }
  ];

  return (
    <div className="flex flex-col xl:flex-row gap-6 max-w-[1400px] mx-auto p-6 font-sans">
      {/* Sidebar Nav */}
      <div className="xl:w-64 space-y-4">
        <div className="bg-white rounded-xl p-4 border border-zinc-200/80 shadow-sm space-y-3">
           <div className="pb-2 border-b border-zinc-150">
              <h1 className="text-sm font-bold text-zinc-900 uppercase tracking-wider flex items-center gap-2">
                <Settings className="w-4 h-4 text-orange-600" /> Settings
              </h1>
              <p className="text-[9px] text-zinc-400 font-bold uppercase mt-1">Platform Control</p>
           </div>
           <div className="space-y-1">
             {TABS.map(tab => (
               <button
                 key={tab.id}
                 onClick={() => setActiveTab(tab.id)}
                 className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-semibold transition ${
                   activeTab === tab.id 
                     ? 'bg-zinc-900 text-white' 
                     : 'text-zinc-600 hover:bg-zinc-50 hover:text-zinc-800'
                 }`}
               >
                 <span className={activeTab === tab.id ? 'text-white' : 'text-zinc-400'}>{tab.icon}</span>
                 {tab.label}
               </button>
             ))}
           </div>
        </div>
 
        {activeTab !== 'team' && activeTab !== 'roles' && activeTab !== 'superadmin' && (
          <button 
            onClick={handleSaveSettings}
            disabled={saving}
            className="w-full flex items-center justify-center gap-2 py-2.5 bg-orange-600 hover:bg-orange-700 text-white rounded-lg text-xs font-semibold shadow-sm transition disabled:opacity-50 cursor-pointer"
          >
            {saving ? <RefreshCw className="animate-spin" size={14} /> : <Save size={14} />}
            {saving ? 'Syncing...' : 'Save Settings'}
          </button>
        )}
      </div>
 
      {/* Content Area */}
      <div className="flex-1 min-w-0">
         {activeTab === 'logistics' && (
           <div className="bg-white rounded-xl p-6 border border-zinc-200/80 shadow-sm space-y-5">
             <div>
               <h3 className="text-base font-bold text-zinc-900 flex items-center gap-2">
                 <Sliders className="w-4 h-4 text-orange-600" /> Logistics Gateways
               </h3>
               <p className="text-xs text-zinc-500 mt-0.5">Enable or disable third-party shipping carriers dynamically.</p>
             </div>
 
             <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
               {/* Shiprocket Toggle */}
               <div className="flex items-center justify-between p-4 rounded-xl bg-zinc-50/50 border border-zinc-200/70">
                 <div className="flex items-center gap-3">
                   <div className="p-2 bg-orange-50 rounded-lg text-orange-600">
                     <Truck className="w-5 h-5" />
                   </div>
                   <div>
                     <span className="text-sm font-semibold text-zinc-800 block">Shiprocket Gateway</span>
                     <span className="text-[10px] text-zinc-400 font-bold block mt-0.5">AWB, Pickup, Print Manifest</span>
                   </div>
                 </div>
                 <label className="relative inline-flex items-center cursor-pointer">
                   <input 
                     type="checkbox" 
                     checked={settings.shiprocket_enabled}
                     onChange={(e) => setSettings({
                       ...settings, 
                       shiprocket_enabled: e.target.checked,
                       delhivery_enabled: e.target.checked ? false : settings.delhivery_enabled
                     })}
                     className="sr-only peer"
                   />
                   <div className="w-11 h-6 bg-zinc-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-orange-600"></div>
                 </label>
               </div>
 
               {/* Delhivery Toggle */}
               <div className="flex items-center justify-between p-4 rounded-xl bg-zinc-50/50 border border-zinc-200/70">
                 <div className="flex items-center gap-3">
                   <div className="p-2 bg-blue-50 rounded-lg text-blue-600">
                     <Truck className="w-5 h-5" />
                   </div>
                   <div>
                     <span className="text-sm font-semibold text-zinc-800 block">Delhivery B2C Express</span>
                     <span className="text-[10px] text-zinc-400 font-bold block mt-0.5">Real-time express booking</span>
                   </div>
                 </div>
                 <label className="relative inline-flex items-center cursor-pointer">
                   <input 
                     type="checkbox" 
                     checked={settings.delhivery_enabled}
                     onChange={(e) => setSettings({
                       ...settings, 
                       delhivery_enabled: e.target.checked,
                       shiprocket_enabled: e.target.checked ? false : settings.shiprocket_enabled
                     })}
                     className="sr-only peer"
                   />
                   <div className="w-11 h-6 bg-zinc-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                 </label>
               </div>
             </div>
           </div>
          )}

         {activeTab === 'integrations' && (
           <IntegrationsTab 
             settings={settings}
             setSettings={setSettings}
           />
         )}
 
         {activeTab === 'team' && (
           <TeamTab 
             admins={admins} 
             availableRoles={availableRoles}
             onAddAdmin={() => setShowCreateModal(true)} 
             onTogglePermission={handleToggleAdminPermission}
             onUpdateRole={handleUpdateRole}
             isSuperAdmin={isSuperAdmin}
           />
         )}

         {activeTab === 'roles' && (
           <RolesTab />
         )}
 
         {activeTab === 'security' && (
           <div className="bg-white rounded-xl p-6 border border-zinc-200/80 shadow-sm space-y-4">
             <div>
               <h3 className="text-base font-bold text-zinc-900">Security & Access Control</h3>
               <p className="text-xs text-zinc-500 mt-0.5">Configure default access policies and login preferences.</p>
             </div>
             <p className="text-xs text-zinc-600 font-semibold bg-zinc-50 p-4 rounded-xl border border-zinc-200/60 leading-relaxed">
               All core administrative modules are currently enforced. Default system policies apply.
             </p>
           </div>
         )}

         {activeTab === 'superadmin' && (
           <SuperAdminTab isSuperAdmin={isSuperAdmin} />
         )}
      </div>
 
      <CreateAdminModal 
        show={showCreateModal} 
        onClose={() => setShowCreateModal(false)}
        newAdmin={newAdmin}
        setNewAdmin={setNewAdmin}
        onSubmit={handleCreateAdminSubmit}
        saving={saving}
        availableRoles={availableRoles}
      />
    </div>
  );
}
