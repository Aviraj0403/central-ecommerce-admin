import React from 'react';
import { Settings, MessageSquare, Truck, Plus, Trash2 } from 'lucide-react';

const DELIVERY_PARTNERS = ["Shiprocket", "Delhivery", "XpressBees", "eKart", "Custom"];

export default function IntegrationsTab({ settings, setSettings }) {
  const credentials = settings.credentials || {
    fast2sms: { api_key: "", dlt_template_id: "" },
    whatsapp: { token: "", phone_number_id: "" },
  };

  const deliveryPartners = settings.deliveryPartners || [];
  const modules = settings.modules || {};
  const features = settings.features || {};

  const updateModule = (key, val) => {
    setSettings(prev => ({
      ...prev,
      modules: { ...prev.modules, [key]: val }
    }));
  };

  const updateFeature = (key, val) => {
    setSettings(prev => ({
      ...prev,
      features: { ...prev.features, [key]: val }
    }));
  };

  const updateCredential = (provider, key, val) => {
    setSettings(prev => ({
      ...prev,
      credentials: {
        ...prev.credentials,
        [provider]: {
          ...(prev.credentials?.[provider] || {}),
          [key]: val
        }
      }
    }));
  };

  const addPartner = () => {
    setSettings(prev => ({
      ...prev,
      deliveryPartners: [...(prev.deliveryPartners || []), { name: "Shiprocket", isEnabled: false, config: {} }]
    }));
  };

  const updatePartner = (i, key, val) => {
    setSettings(prev => {
      const dp = [...(prev.deliveryPartners || [])];
      dp[i] = { ...dp[i], [key]: val };
      return { ...prev, deliveryPartners: dp };
    });
  };

  const removePartner = (i) => {
    setSettings(prev => ({
      ...prev,
      deliveryPartners: (prev.deliveryPartners || []).filter((_, j) => j !== i)
    }));
  };

  const Input = ({ label, value, onChange, type = "text", placeholder }) => (
    <div>
      <label className="block text-[11px] font-bold uppercase tracking-wider text-zinc-500 mb-1.5">{label}</label>
      <input
        type={type}
        value={value || ""}
        onChange={e => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full bg-zinc-50 border border-zinc-200 text-zinc-800 rounded-lg px-3 py-2 text-sm placeholder-zinc-400 focus:outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20 transition"
      />
    </div>
  );

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-xl p-6 border border-zinc-200/80 shadow-sm space-y-6">
        <div>
          <h3 className="text-base font-bold text-zinc-900 flex items-center gap-2">
            <Settings className="w-4 h-4 text-orange-600" /> Platform Modules & Features
          </h3>
          <p className="text-xs text-zinc-500 mt-0.5">Enable or disable core functionalities for your store.</p>
        </div>

        <div className="space-y-6">
          <div>
            <p className="text-sm font-bold text-zinc-800 mb-3 border-b border-zinc-100 pb-2">Modules</p>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {Object.keys(modules).length > 0 ? Object.entries(modules).map(([key, val]) => (
                <label key={key} className="flex items-center gap-2 p-2.5 rounded-lg border border-zinc-200 bg-zinc-50 cursor-pointer hover:bg-zinc-100 transition">
                  <div className={`w-8 h-4.5 rounded-full transition-colors relative flex-shrink-0 ${val ? 'bg-orange-500' : 'bg-zinc-300'}`}>
                    <div className={`absolute top-0.5 w-3.5 h-3.5 bg-white rounded-full shadow transition-transform ${val ? 'translate-x-4' : 'translate-x-0.5'}`} />
                  </div>
                  <span className="text-xs font-semibold text-zinc-700 capitalize">{key}</span>
                  <input type="checkbox" className="hidden" checked={!!val} onChange={(e) => updateModule(key, e.target.checked)} />
                </label>
              )) : (
                <span className="text-xs text-zinc-400">No modules configurable</span>
              )}
            </div>
          </div>

          <div>
            <p className="text-sm font-bold text-zinc-800 mb-3 border-b border-zinc-100 pb-2">Features</p>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {Object.keys(features).length > 0 ? Object.entries(features).map(([key, val]) => (
                <label key={key} className="flex items-center gap-2 p-2.5 rounded-lg border border-zinc-200 bg-zinc-50 cursor-pointer hover:bg-zinc-100 transition">
                  <div className={`w-8 h-4.5 rounded-full transition-colors relative flex-shrink-0 ${val ? 'bg-orange-500' : 'bg-zinc-300'}`}>
                    <div className={`absolute top-0.5 w-3.5 h-3.5 bg-white rounded-full shadow transition-transform ${val ? 'translate-x-4' : 'translate-x-0.5'}`} />
                  </div>
                  <span className="text-xs font-semibold text-zinc-700 capitalize">{key.replace(/([A-Z])/g, ' $1')}</span>
                  <input type="checkbox" className="hidden" checked={!!val} onChange={(e) => updateFeature(key, e.target.checked)} />
                </label>
              )) : (
                <span className="text-xs text-zinc-400">No special features configurable</span>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl p-6 border border-zinc-200/80 shadow-sm space-y-6">
        <div>
          <h3 className="text-base font-bold text-zinc-900 flex items-center gap-2">
            <MessageSquare className="w-4 h-4 text-orange-600" /> Messaging & SMS Integrations
          </h3>
          <p className="text-xs text-zinc-500 mt-0.5">Configure APIs for OTPs, order updates, and marketing.</p>
        </div>

        <div className="space-y-6">
          <div>
            <p className="text-sm font-bold text-zinc-800 mb-3 border-b border-zinc-100 pb-2">Fast2SMS (OTP & Alerts)</p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input label="API Key" type="password" value={credentials.fast2sms?.api_key} onChange={v => updateCredential("fast2sms", "api_key", v)} placeholder="••••••••" />
              <Input label="DLT Template ID" value={credentials.fast2sms?.dlt_template_id} onChange={v => updateCredential("fast2sms", "dlt_template_id", v)} placeholder="1234567890" />
            </div>
          </div>

          <div>
            <p className="text-sm font-bold text-zinc-800 mb-3 border-b border-zinc-100 pb-2">WhatsApp Cloud API</p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input label="Phone Number ID" value={credentials.whatsapp?.phone_number_id} onChange={v => updateCredential("whatsapp", "phone_number_id", v)} placeholder="1234567890" />
              <Input label="Permanent Token" type="password" value={credentials.whatsapp?.token} onChange={v => updateCredential("whatsapp", "token", v)} placeholder="EAAG..." />
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl p-6 border border-zinc-200/80 shadow-sm space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-base font-bold text-zinc-900 flex items-center gap-2">
              <Truck className="w-4 h-4 text-orange-600" /> Delivery Partners
            </h3>
            <p className="text-xs text-zinc-500 mt-0.5">Manage credentials for your logistic providers.</p>
          </div>
          <button type="button" onClick={addPartner} className="text-orange-600 hover:text-orange-700 bg-orange-50 px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1 transition">
            <Plus size={14} /> Add Partner
          </button>
        </div>

        <div className="space-y-4">
          {deliveryPartners.length === 0 && (
             <div className="text-center py-6 bg-zinc-50 border border-dashed border-zinc-300 rounded-xl">
               <p className="text-sm text-zinc-500 font-medium">No delivery partners configured.</p>
             </div>
          )}
          {deliveryPartners.map((dp, i) => (
            <div key={i} className="flex items-start gap-4 p-4 rounded-xl bg-zinc-50 border border-zinc-200/70 relative">
              <div className="pt-1">
                <label className="relative inline-flex items-center cursor-pointer">
                  <input 
                    type="checkbox" 
                    checked={dp.isEnabled}
                    onChange={(e) => updatePartner(i, 'isEnabled', e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-9 h-5 bg-zinc-300 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-orange-600"></div>
                </label>
              </div>
              <div className="flex-1 space-y-3">
                <div className="w-full md:w-1/2">
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-zinc-500 mb-1.5">Provider</label>
                  <select value={dp.name} onChange={e => updatePartner(i, 'name', e.target.value)} className="w-full bg-white border border-zinc-200 text-zinc-800 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-orange-500">
                    {DELIVERY_PARTNERS.map(p => <option key={p} value={p}>{p}</option>)}
                  </select>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Input label="Webhook Secret / API Key" type="password" value={dp.config?.webhook_secret || ''} onChange={v => updatePartner(i, 'config', { ...dp.config, webhook_secret: v })} placeholder="Secret..." />
                  <Input label="Webhook Token / Secret" type="password" value={dp.config?.webhook_token || ''} onChange={v => updatePartner(i, 'config', { ...dp.config, webhook_token: v })} placeholder="Token..." />
                </div>
              </div>
              <button type="button" onClick={() => removePartner(i)} className="absolute top-4 right-4 p-2 text-zinc-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition">
                <Trash2 size={16} />
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
