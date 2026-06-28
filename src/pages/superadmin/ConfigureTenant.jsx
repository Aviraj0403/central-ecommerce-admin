import React, { useEffect, useState } from "react";
import SuperAdminAxios from "../../utils/SuperAdminAxios";
import { toast } from "react-toastify";
import { useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, Save, Trash2, Plus } from "lucide-react";

const DELIVERY_PARTNERS = ["Shiprocket", "Delhivery", "XpressBees", "eKart", "Custom"];

const ConfigureTenant = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState(null);

  const fetchTenant = async () => {
    try {
      const res = await SuperAdminAxios.get(`/superadmin/tenants/${id}`);
      setForm(res.data);
    } catch {
      toast.error("Failed to load tenant");
    } finally {
      setLoading(false);
    }
  };

  const set = (path, value) => {
    const keys = path.split(".");
    setForm(prev => {
      const next = { ...prev };
      let obj = next;
      for (let i = 0; i < keys.length - 1; i++) {
        obj[keys[i]] = { ...obj[keys[i]] };
        obj = obj[keys[i]];
      }
      obj[keys[keys.length - 1]] = value;
      return next;
    });
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      await SuperAdminAxios.put(`/superadmin/tenants/${id}`, form);
      toast.success("Tenant updated successfully!");
    } catch (err) {
      toast.error(err?.response?.data?.message || "Save failed");
    } finally {
      setSaving(false);
    }
  };

  const addDomain = () => setForm(p => ({ ...p, domains: [...(p.domains || []), ""] }));
  const updateDomain = (i, v) => setForm(p => { const d = [...p.domains]; d[i] = v; return { ...p, domains: d }; });
  const removeDomain = (i) => setForm(p => ({ ...p, domains: p.domains.filter((_, j) => j !== i) }));

  const addPartner = () => setForm(p => ({ ...p, deliveryPartners: [...(p.deliveryPartners || []), { name: "Shiprocket", isEnabled: false, config: {} }] }));
  const updatePartner = (i, key, val) => setForm(p => {
    const dp = [...p.deliveryPartners];
    dp[i] = { ...dp[i], [key]: val };
    return { ...p, deliveryPartners: dp };
  });
  const removePartner = (i) => setForm(p => ({ ...p, deliveryPartners: p.deliveryPartners.filter((_, j) => j !== i) }));

  useEffect(() => { fetchTenant(); }, [id]);

  if (loading) return <div className="min-h-screen bg-gray-950 flex items-center justify-center text-gray-400">Loading tenant...</div>;
  if (!form) return null;

  const Input = ({ label, value, onChange, type = "text", placeholder }) => (
    <div>
      <label className="block text-xs font-medium text-gray-400 mb-1">{label}</label>
      <input type={type} value={value || ""} onChange={e => onChange(e.target.value)} placeholder={placeholder}
        className="w-full bg-gray-700/50 border border-gray-600 text-white rounded-lg px-3 py-2 text-sm placeholder-gray-500 focus:outline-none focus:border-purple-500 transition" />
    </div>
  );

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 max-w-4xl mx-auto">
      <div>
        <button onClick={() => navigate("/superadmin/tenants")} className="flex items-center gap-2 text-gray-400 hover:text-white text-sm mb-6 transition">
          <ArrowLeft size={15} /> Back to Tenants
        </button>

        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl flex items-center justify-center text-white font-bold text-lg" style={{ backgroundColor: form.theme?.primaryColor || '#7c3aed' }}>
              {form.namePrefix || form.name?.slice(0, 2).toUpperCase()}
            </div>
            <div>
              <h1 className="text-2xl font-bold text-white">{form.name}</h1>
              <div className="flex items-center gap-3 mt-0.5">
                <span className="text-gray-400 text-sm font-mono">#{form.projectId}</span>
                <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${form.isActive ? 'bg-green-900/50 text-green-400' : 'bg-red-900/50 text-red-400'}`}>
                  {form.isActive ? 'Active' : 'Inactive'}
                </span>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <label className="flex items-center gap-2 cursor-pointer">
              <span className="text-sm text-gray-400">Active</span>
              <div onClick={() => set("isActive", !form.isActive)} className={`w-10 h-5 rounded-full transition-colors relative cursor-pointer ${form.isActive ? 'bg-green-600' : 'bg-gray-600'}`}>
                <div className={`absolute top-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform ${form.isActive ? 'translate-x-5' : 'translate-x-0.5'}`} />
              </div>
            </label>
            <button onClick={handleSave} disabled={saving} className="flex items-center gap-2 bg-purple-600 hover:bg-purple-700 text-white px-5 py-2 rounded-xl text-sm font-medium transition disabled:opacity-50">
              <Save size={14} /> {saving ? "Saving..." : "Save Changes"}
            </button>
          </div>
        </div>

        <div className="space-y-6">

          {/* DOMAINS */}
          <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-8 shadow-xl relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-64 h-64 bg-purple-500/5 rounded-full blur-3xl pointer-events-none"></div>
            <h3 className="text-white font-semibold mb-1 relative z-10">Domains</h3>
            <p className="text-gray-500 text-xs mb-4 relative z-10">All domains that route to this tenant</p>
            {(form.domains || []).map((d, i) => (
              <div key={i} className="flex gap-2 mb-2">
                <input value={d} onChange={e => updateDomain(i, e.target.value)}
                  className="flex-1 bg-gray-700/50 border border-gray-600 text-white rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-purple-500" />
                <button type="button" onClick={() => removeDomain(i)} className="text-red-400 hover:text-red-300 p-2"><Trash2 size={14} /></button>
              </div>
            ))}
            <button onClick={addDomain} className="text-purple-400 hover:text-purple-300 text-sm flex items-center gap-1 mt-1"><Plus size={13} /> Add Domain</button>
          </div>

          {/* MODULES */}
          <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-8 shadow-xl relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/5 rounded-full blur-3xl pointer-events-none"></div>
            <h3 className="text-white font-semibold mb-1 relative z-10">Module Toggles</h3>
            <p className="text-gray-500 text-xs mb-4 relative z-10">Disable a module to instantly block all its APIs for this tenant</p>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {Object.entries(form.modules || {}).map(([key, val]) => (
                <label key={key} className="flex items-center gap-3 cursor-pointer p-3 rounded-xl bg-gray-700/40 border border-gray-600/50">
                  <div onClick={() => set(`modules.${key}`, !val)} className={`w-9 h-5 rounded-full transition-colors relative flex-shrink-0 ${val ? 'bg-purple-600' : 'bg-gray-600'}`}>
                    <div className={`absolute top-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform ${val ? 'translate-x-4' : 'translate-x-0.5'}`} />
                  </div>
                  <span className={`text-sm capitalize ${val ? 'text-white' : 'text-gray-500'}`}>{key}</span>
                </label>
              ))}
            </div>
          </div>

          {/* FEATURES */}
          <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-8 shadow-xl relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/5 rounded-full blur-3xl pointer-events-none"></div>
            <h3 className="text-white font-semibold mb-1 relative z-10">Features</h3>
            <p className="text-gray-500 text-xs mb-4 relative z-10">OTP login, custom delivery, etc.</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {Object.entries(form.features || {}).map(([key, val]) => (
                <label key={key} className="flex items-center gap-3 cursor-pointer p-3 rounded-xl bg-gray-700/40 border border-gray-600/50">
                  <div onClick={() => set(`features.${key}`, !val)} className={`w-9 h-5 rounded-full transition-colors relative flex-shrink-0 ${val ? 'bg-purple-600' : 'bg-gray-600'}`}>
                    <div className={`absolute top-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform ${val ? 'translate-x-4' : 'translate-x-0.5'}`} />
                  </div>
                  <span className={`text-sm capitalize ${val ? 'text-white' : 'text-gray-500'}`}>{key.replace(/([A-Z])/g, ' $1')}</span>
                </label>
              ))}
            </div>
          </div>

          {/* DELIVERY PARTNERS */}
          <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-8 shadow-xl relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-64 h-64 bg-orange-500/5 rounded-full blur-3xl pointer-events-none"></div>
            <h3 className="text-white font-semibold mb-1 relative z-10">Delivery Partners</h3>
            <p className="text-gray-500 text-xs mb-4 relative z-10">Enable/disable couriers per project</p>
            <div className="space-y-3">
              {(form.deliveryPartners || []).map((dp, i) => (
                <div key={i} className="flex items-center gap-3 bg-gray-700/40 rounded-xl p-3">
                  <div onClick={() => updatePartner(i, 'isEnabled', !dp.isEnabled)} className={`w-9 h-5 rounded-full cursor-pointer transition-colors relative flex-shrink-0 ${dp.isEnabled ? 'bg-purple-600' : 'bg-gray-600'}`}>
                    <div className={`absolute top-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform ${dp.isEnabled ? 'translate-x-4' : 'translate-x-0.5'}`} />
                  </div>
                  <div className="flex-1">
                    <select value={dp.name} onChange={e => updatePartner(i, 'name', e.target.value)} className="w-full bg-gray-700 border border-gray-600 text-white rounded-lg px-3 py-1.5 text-sm mb-2">
                      {DELIVERY_PARTNERS.map(p => <option key={p} value={p}>{p}</option>)}
                    </select>
                    <div className="flex gap-2">
                      <input type="password" value={dp.config?.webhook_secret || ''} onChange={e => updatePartner(i, 'config', { ...dp.config, webhook_secret: e.target.value })} placeholder="Webhook Secret" className="flex-1 bg-gray-800 border border-gray-600 text-white rounded-lg px-3 py-1.5 text-xs placeholder-gray-500" />
                      <input type="password" value={dp.config?.webhook_token || ''} onChange={e => updatePartner(i, 'config', { ...dp.config, webhook_token: e.target.value })} placeholder="Webhook Token" className="flex-1 bg-gray-800 border border-gray-600 text-white rounded-lg px-3 py-1.5 text-xs placeholder-gray-500" />
                    </div>
                  </div>
                  <span className={`text-xs ml-1 ${dp.isEnabled ? 'text-green-400' : 'text-gray-500'}`}>{dp.isEnabled ? 'Active' : 'Disabled'}</span>
                  <button onClick={() => removePartner(i)} className="text-red-400 hover:text-red-300 ml-auto"><Trash2 size={14} /></button>
                </div>
              ))}
              <button onClick={addPartner} className="text-purple-400 hover:text-purple-300 text-sm flex items-center gap-1"><Plus size={13} /> Add Partner</button>
            </div>
          </div>

          {/* CREDENTIALS */}
          <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-8 shadow-xl relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/5 rounded-full blur-3xl pointer-events-none"></div>
            <h3 className="text-white font-semibold mb-1 relative z-10">API Credentials</h3>
            <p className="text-gray-500 text-xs mb-4 relative z-10">Payment, SMS, media, and email integrations</p>
            <div className="space-y-6">
              <div>
                <p className="text-xs uppercase text-gray-500 mb-3 font-semibold tracking-wider">Razorpay</p>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  <Input label="Key ID" value={form.credentials?.razorpay?.key_id} onChange={v => set("credentials.razorpay.key_id", v)} placeholder="rzp_live_..." />
                  <Input label="Key Secret" type="password" value={form.credentials?.razorpay?.key_secret} onChange={v => set("credentials.razorpay.key_secret", v)} placeholder="••••••••" />
                  <Input label="Webhook Secret" type="password" value={form.credentials?.razorpay?.webhook_secret} onChange={v => set("credentials.razorpay.webhook_secret", v)} placeholder="••••••••" />
                </div>
              </div>
              <div>
                <p className="text-xs uppercase text-gray-500 mb-3 font-semibold tracking-wider">Cloudinary</p>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  <Input label="Cloud Name" value={form.credentials?.cloudinary?.cloud_name} onChange={v => set("credentials.cloudinary.cloud_name", v)} placeholder="mycloud" />
                  <Input label="API Key" value={form.credentials?.cloudinary?.api_key} onChange={v => set("credentials.cloudinary.api_key", v)} placeholder="123456789..." />
                  <Input label="API Secret" type="password" value={form.credentials?.cloudinary?.api_secret} onChange={v => set("credentials.cloudinary.api_secret", v)} placeholder="••••••••" />
                </div>
              </div>
              <div>
                <p className="text-xs uppercase text-gray-500 mb-3 font-semibold tracking-wider">Messaging APIs (WhatsApp / SMS)</p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-4">
                  <Input label="WhatsApp Phone Number ID" value={form.credentials?.whatsapp?.phone_number_id} onChange={v => set("credentials.whatsapp.phone_number_id", v)} placeholder="1234567890" />
                  <Input label="WhatsApp Token" type="password" value={form.credentials?.whatsapp?.token} onChange={v => set("credentials.whatsapp.token", v)} placeholder="EAAG..." />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-4">
                  <Input label="Gupshup UserID" value={form.credentials?.gupshup?.userid} onChange={v => set("credentials.gupshup.userid", v)} placeholder="200012345" />
                  <Input label="Gupshup Password" type="password" value={form.credentials?.gupshup?.password} onChange={v => set("credentials.gupshup.password", v)} placeholder="••••••••" />
                  <Input label="Gupshup API URL" value={form.credentials?.gupshup?.api_url} onChange={v => set("credentials.gupshup.api_url", v)} placeholder="https://enterprise.gupshup.io/..." />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-4">
                  <Input label="Twilio Account SID" value={form.credentials?.twilio?.account_sid} onChange={v => set("credentials.twilio.account_sid", v)} placeholder="AC..." />
                  <Input label="Twilio Auth Token" type="password" value={form.credentials?.twilio?.auth_token} onChange={v => set("credentials.twilio.auth_token", v)} placeholder="••••••••" />
                  <Input label="Twilio Phone Number" value={form.credentials?.twilio?.phone_number} onChange={v => set("credentials.twilio.phone_number", v)} placeholder="+1234567890" />
                </div>
              </div>
              <div>
                <p className="text-xs uppercase text-gray-500 mb-3 font-semibold tracking-wider">SMS — Fast2SMS</p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <Input label="API Key" type="password" value={form.credentials?.fast2sms?.api_key} onChange={v => set("credentials.fast2sms.api_key", v)} placeholder="••••••••" />
                  <Input label="DLT Template ID" value={form.credentials?.fast2sms?.dlt_template_id} onChange={v => set("credentials.fast2sms.dlt_template_id", v)} placeholder="1234567890" />
                </div>
              </div>
              <div>
                <p className="text-xs uppercase text-gray-500 mb-3 font-semibold tracking-wider">Email / SMTP</p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <Input label="Mail From" value={form.credentials?.smtp?.mail_from} onChange={v => set("credentials.smtp.mail_from", v)} placeholder="no-reply@divyamantra.in" />
                  <Input label="App Password" type="password" value={form.credentials?.smtp?.pass_key} onChange={v => set("credentials.smtp.pass_key", v)} placeholder="••••••••" />
                </div>
              </div>
              <div>
                <p className="text-xs uppercase text-gray-500 mb-3 font-semibold tracking-wider">Firebase Admin SDK</p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-3">
                  <Input label="Project ID" value={form.credentials?.firebase?.project_id} onChange={v => set("credentials.firebase.project_id", v)} placeholder="my-app-12345" />
                  <Input label="Client Email" value={form.credentials?.firebase?.client_email} onChange={v => set("credentials.firebase.client_email", v)} placeholder="firebase-adminsdk@..." />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-3">
                  <Input label="Private Key ID" value={form.credentials?.firebase?.private_key_id} onChange={v => set("credentials.firebase.private_key_id", v)} placeholder="a1b2c3d4..." />
                  <Input label="Client ID" value={form.credentials?.firebase?.client_id} onChange={v => set("credentials.firebase.client_id", v)} placeholder="10123456789" />
                </div>
                <div className="mb-3">
                  <Input label="Private Key" type="password" value={form.credentials?.firebase?.private_key} onChange={v => set("credentials.firebase.private_key", v)} placeholder="-----BEGIN PRIVATE KEY-----\n..." />
                </div>
              </div>
            </div>
          </div>

          {/* THEME */}
          <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-8 shadow-xl relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-64 h-64 bg-yellow-500/5 rounded-full blur-3xl pointer-events-none"></div>
            <h3 className="text-white font-semibold mb-4 relative z-10">Theme & Branding</h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs text-gray-400 mb-1">Primary Color</label>
                <div className="flex items-center gap-2">
                  <input type="color" value={form.theme?.primaryColor || "#7c3aed"} onChange={e => set("theme.primaryColor", e.target.value)} className="w-10 h-10 rounded-lg cursor-pointer border-0 bg-transparent" />
                  <span className="text-sm text-gray-300 font-mono">{form.theme?.primaryColor}</span>
                </div>
              </div>
              <div>
                <label className="block text-xs text-gray-400 mb-1">Secondary Color</label>
                <div className="flex items-center gap-2">
                  <input type="color" value={form.theme?.secondaryColor || "#ffffff"} onChange={e => set("theme.secondaryColor", e.target.value)} className="w-10 h-10 rounded-lg cursor-pointer border-0 bg-transparent" />
                  <span className="text-sm text-gray-300 font-mono">{form.theme?.secondaryColor}</span>
                </div>
              </div>
              <Input label="Logo URL" value={form.theme?.logoUrl} onChange={v => set("theme.logoUrl", v)} placeholder="https://..." />
            </div>
          </div>

          {/* DB URI */}
          <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-8 shadow-xl relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-64 h-64 bg-red-500/5 rounded-full blur-3xl pointer-events-none"></div>
            <h3 className="text-white font-semibold mb-1 relative z-10">Database</h3>
            <p className="text-xs text-yellow-500/70 mb-3 relative z-10">⚠️ Changing DB URI will switch the database for all API calls. Be careful!</p>
            <Input label="MongoDB URI" value={form.dbUri} onChange={v => set("dbUri", v)} placeholder="mongodb+srv://..." />
          </div>

          <button onClick={handleSave} disabled={saving} className="w-full bg-purple-600 hover:bg-purple-700 disabled:opacity-50 text-white py-3.5 rounded-xl font-semibold transition-all">
            {saving ? "Saving..." : "💾 Save All Changes"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfigureTenant;
