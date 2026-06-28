import React, { useState } from "react";
import SuperAdminAxios from "../../utils/SuperAdminAxios";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";
import { Plus, Trash2, ArrowLeft } from "lucide-react";

const DELIVERY_PARTNERS = ["Shiprocket", "Delhivery", "XpressBees", "eKart", "Custom"];

const OnboardTenant = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  const [form, setForm] = useState({
    name: "",
    domains: [""],
    dbUri: "",
    adminUser: { email: "", password: "" },
    theme: { primaryColor: "#7c3aed", secondaryColor: "#ffffff", logoUrl: "" },
    features: { otpLogin: true, customDelivery: false },
    modules: { cart: true, orders: true, products: true, reviews: true, offers: true },
    deliveryPartners: [{ name: "Shiprocket", isEnabled: true, config: {} }],
    credentials: {
      razorpay: { key_id: "", key_secret: "", webhook_secret: "" },
      cloudinary: { cloud_name: "", api_key: "", api_secret: "" },
      fast2sms: { api_key: "", dlt_template_id: "" },
      smtp: { mail_from: "", pass_key: "" },
      whatsapp: { token: "", phone_number_id: "" },
      gupshup: { userid: "", password: "", api_url: "" },
      twilio: { account_sid: "", auth_token: "", phone_number: "" },
      firebase: { type: "", project_id: "", private_key_id: "", private_key: "", client_email: "", client_id: "", auth_uri: "", token_uri: "", auth_provider_x509_cert_url: "", client_x509_cert_url: "", universe_domain: "" }
    },
  });

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

  const addDomain = () => setForm(p => ({ ...p, domains: [...p.domains, ""] }));
  const updateDomain = (i, v) => setForm(p => { const d = [...p.domains]; d[i] = v; return { ...p, domains: d }; });
  const removeDomain = (i) => setForm(p => ({ ...p, domains: p.domains.filter((_, j) => j !== i) }));

  const addPartner = () => setForm(p => ({ ...p, deliveryPartners: [...p.deliveryPartners, { name: "Shiprocket", isEnabled: false, config: {} }] }));
  const updatePartner = (i, key, val) => setForm(p => {
    const dp = [...p.deliveryPartners];
    dp[i] = { ...dp[i], [key]: val };
    return { ...p, deliveryPartners: dp };
  });
  const removePartner = (i) => setForm(p => ({ ...p, deliveryPartners: p.deliveryPartners.filter((_, j) => j !== i) }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name || !form.dbUri || !form.adminUser.email || !form.adminUser.password) {
      toast.error("Name, DB URI, and Admin credentials are required");
      return;
    }
    try {
      setLoading(true);
      const res = await SuperAdminAxios.post("/superadmin/tenants", form);
      toast.success(`🎉 Project "${form.name}" onboarded! ID: ${res.data?.tenant?.projectId}`);
      navigate("/superadmin/tenants");
    } catch (err) {
      toast.error(err?.response?.data?.message || "Onboarding failed");
    } finally {
      setLoading(false);
    }
  };

  const SectionTitle = ({ title, subtitle }) => (
    <div className="mb-4 pb-3 border-b border-gray-700">
      <h3 className="text-white font-semibold text-base">{title}</h3>
      {subtitle && <p className="text-gray-500 text-xs mt-0.5">{subtitle}</p>}
    </div>
  );

  const Input = ({ label, value, onChange, type = "text", placeholder, required }) => (
    <div>
      <label className="block text-xs font-medium text-gray-400 mb-1">{label}{required && <span className="text-red-400 ml-0.5">*</span>}</label>
      <input
        type={type}
        value={value}
        onChange={e => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full bg-gray-700/50 border border-gray-600 text-white rounded-lg px-3 py-2 text-sm placeholder-gray-500 focus:outline-none focus:border-purple-500 transition"
      />
    </div>
  );
  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 max-w-4xl mx-auto">
      <div>
        <button onClick={() => navigate("/superadmin/tenants")} className="flex items-center gap-2 text-gray-400 hover:text-white text-sm mb-6 transition">
          <ArrowLeft size={15} /> Back to Tenants
        </button>

        <div className="mb-8 relative">
          <div className="absolute -left-10 -top-10 w-40 h-40 bg-purple-500/10 rounded-full blur-3xl pointer-events-none"></div>
          <h1 className="text-3xl font-black text-white tracking-tight relative z-10">🚀 Onboard New Project</h1>
          <p className="text-gray-400 mt-1 font-medium relative z-10">Set up a new eCommerce store on this SaaS platform. A Project ID will be auto-assigned.</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">

          {/* BASICS */}
          <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-8 shadow-xl relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-64 h-64 bg-purple-500/5 rounded-full blur-3xl pointer-events-none"></div>
            <SectionTitle title="1. Project Basics" subtitle="Core identity of the store" />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input label="Project / Store Name" value={form.name} onChange={v => set("name", v)} placeholder="DivyaMantra, GKStore..." required />
              <Input label="MongoDB URI" value={form.dbUri} onChange={v => set("dbUri", v)} placeholder="mongodb+srv://user:pass@cluster/DBName" required />
            </div>
            <div className="mt-4">
              <label className="block text-xs font-medium text-gray-400 mb-2">Domains <span className="text-gray-600">(add all frontend & admin domains)</span></label>
              {form.domains.map((d, i) => (
                <div key={i} className="flex gap-2 mb-2">
                  <input value={d} onChange={e => updateDomain(i, e.target.value)} placeholder="divyamantra.in or divyamantra-admin.vercel.app"
                    className="flex-1 bg-gray-700/50 border border-gray-600 text-white rounded-lg px-3 py-2 text-sm placeholder-gray-500 focus:outline-none focus:border-purple-500" />
                  {form.domains.length > 1 && (
                    <button type="button" onClick={() => removeDomain(i)} className="text-red-400 hover:text-red-300 p-2"><Trash2 size={14} /></button>
                  )}
                </div>
              ))}
              <button type="button" onClick={addDomain} className="text-purple-400 hover:text-purple-300 text-sm flex items-center gap-1 mt-1">
                <Plus size={13} /> Add Domain
              </button>
            </div>
          </div>

          {/* ADMIN USER */}
          <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-8 shadow-xl relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/5 rounded-full blur-3xl pointer-events-none"></div>
            <SectionTitle title="2. Root Admin Credentials" subtitle="This user will be auto-created inside the project's database" />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input label="Admin Email" value={form.adminUser.email} onChange={v => set("adminUser.email", v)} placeholder="admin@divyamantra.in" required />
              <Input label="Admin Password" type="password" value={form.adminUser.password} onChange={v => set("adminUser.password", v)} placeholder="Strong password" required />
            </div>
          </div>

          {/* CREDENTIALS */}
          <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-8 shadow-xl relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/5 rounded-full blur-3xl pointer-events-none"></div>
            <SectionTitle title="3. API Credentials" subtitle="Payment, SMS, media, and email integrations" />
            <div className="space-y-6">
              <div>
                <p className="text-xs uppercase text-gray-500 mb-3 font-semibold tracking-wider">Razorpay</p>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  <Input label="Key ID" value={form.credentials.razorpay.key_id} onChange={v => set("credentials.razorpay.key_id", v)} placeholder="rzp_live_..." />
                  <Input label="Key Secret" type="password" value={form.credentials.razorpay.key_secret} onChange={v => set("credentials.razorpay.key_secret", v)} placeholder="••••••••" />
                  <Input label="Webhook Secret" type="password" value={form.credentials.razorpay.webhook_secret} onChange={v => set("credentials.razorpay.webhook_secret", v)} placeholder="••••••••" />
                </div>
              </div>
              <div>
                <p className="text-xs uppercase text-gray-500 mb-3 font-semibold tracking-wider">Cloudinary</p>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  <Input label="Cloud Name" value={form.credentials.cloudinary.cloud_name} onChange={v => set("credentials.cloudinary.cloud_name", v)} placeholder="mycloud" />
                  <Input label="API Key" value={form.credentials.cloudinary.api_key} onChange={v => set("credentials.cloudinary.api_key", v)} placeholder="123456789..." />
                  <Input label="API Secret" type="password" value={form.credentials.cloudinary.api_secret} onChange={v => set("credentials.cloudinary.api_secret", v)} placeholder="••••••••" />
                </div>
              </div>
              <div>
                <p className="text-xs uppercase text-gray-500 mb-3 font-semibold tracking-wider">SMS — Fast2SMS</p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <Input label="API Key" type="password" value={form.credentials.fast2sms.api_key} onChange={v => set("credentials.fast2sms.api_key", v)} placeholder="••••••••" />
                  <Input label="DLT Template ID" value={form.credentials.fast2sms.dlt_template_id} onChange={v => set("credentials.fast2sms.dlt_template_id", v)} placeholder="1234567890" />
                </div>
              </div>
              <div>
                <p className="text-xs uppercase text-gray-500 mb-3 font-semibold tracking-wider">Email / SMTP</p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <Input label="Mail From" value={form.credentials.smtp.mail_from} onChange={v => set("credentials.smtp.mail_from", v)} placeholder="no-reply@divyamantra.in" />
                  <Input label="App Password" type="password" value={form.credentials.smtp.pass_key} onChange={v => set("credentials.smtp.pass_key", v)} placeholder="••••••••" />
                </div>
              </div>
              
              {/* WhatsApp, Gupshup, Twilio */}
              <div>
                <p className="text-xs uppercase text-gray-500 mb-3 font-semibold tracking-wider">Messaging APIs (WhatsApp / SMS)</p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-4">
                  <Input label="WhatsApp Phone Number ID" value={form.credentials.whatsapp.phone_number_id} onChange={v => set("credentials.whatsapp.phone_number_id", v)} placeholder="1234567890" />
                  <Input label="WhatsApp Token" type="password" value={form.credentials.whatsapp.token} onChange={v => set("credentials.whatsapp.token", v)} placeholder="EAAG..." />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-4">
                  <Input label="Gupshup UserID" value={form.credentials.gupshup.userid} onChange={v => set("credentials.gupshup.userid", v)} placeholder="200012345" />
                  <Input label="Gupshup Password" type="password" value={form.credentials.gupshup.password} onChange={v => set("credentials.gupshup.password", v)} placeholder="••••••••" />
                  <Input label="Gupshup API URL" value={form.credentials.gupshup.api_url} onChange={v => set("credentials.gupshup.api_url", v)} placeholder="https://enterprise.gupshup.io/smsgateway/api" />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  <Input label="Twilio Account SID" value={form.credentials.twilio.account_sid} onChange={v => set("credentials.twilio.account_sid", v)} placeholder="AC..." />
                  <Input label="Twilio Auth Token" type="password" value={form.credentials.twilio.auth_token} onChange={v => set("credentials.twilio.auth_token", v)} placeholder="••••••••" />
                  <Input label="Twilio Phone Number" value={form.credentials.twilio.phone_number} onChange={v => set("credentials.twilio.phone_number", v)} placeholder="+1234567890" />
                </div>
              </div>

              {/* Firebase Admin Credentials */}
              <div>
                <p className="text-xs uppercase text-gray-500 mb-3 font-semibold tracking-wider">Firebase Admin SDK</p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-3">
                  <Input label="Project ID" value={form.credentials.firebase.project_id} onChange={v => set("credentials.firebase.project_id", v)} placeholder="my-app-12345" />
                  <Input label="Client Email" value={form.credentials.firebase.client_email} onChange={v => set("credentials.firebase.client_email", v)} placeholder="firebase-adminsdk@my-app.iam.gserviceaccount.com" />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-3">
                  <Input label="Private Key ID" value={form.credentials.firebase.private_key_id} onChange={v => set("credentials.firebase.private_key_id", v)} placeholder="a1b2c3d4..." />
                  <Input label="Client ID" value={form.credentials.firebase.client_id} onChange={v => set("credentials.firebase.client_id", v)} placeholder="10123456789" />
                </div>
                <div className="mb-3">
                  <Input label="Private Key" type="password" value={form.credentials.firebase.private_key} onChange={v => set("credentials.firebase.private_key", v)} placeholder="-----BEGIN PRIVATE KEY-----\n..." />
                </div>
              </div>
            </div>
          </div>

          {/* THEME */}
          <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-8 shadow-xl relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-64 h-64 bg-yellow-500/5 rounded-full blur-3xl pointer-events-none"></div>
            <SectionTitle title="4. Theme" subtitle="Store's brand colors and logo" />
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs text-gray-400 mb-1">Primary Color</label>
                <div className="flex items-center gap-2">
                  <input type="color" value={form.theme.primaryColor} onChange={e => set("theme.primaryColor", e.target.value)} className="w-10 h-10 rounded-lg cursor-pointer border-0 bg-transparent" />
                  <span className="text-sm text-gray-300 font-mono">{form.theme.primaryColor}</span>
                </div>
              </div>
              <div>
                <label className="block text-xs text-gray-400 mb-1">Secondary Color</label>
                <div className="flex items-center gap-2">
                  <input type="color" value={form.theme.secondaryColor} onChange={e => set("theme.secondaryColor", e.target.value)} className="w-10 h-10 rounded-lg cursor-pointer border-0 bg-transparent" />
                  <span className="text-sm text-gray-300 font-mono">{form.theme.secondaryColor}</span>
                </div>
              </div>
              <Input label="Logo URL" value={form.theme.logoUrl} onChange={v => set("theme.logoUrl", v)} placeholder="https://..." />
            </div>
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-purple-600 hover:bg-purple-700 disabled:opacity-50 text-white py-3.5 rounded-xl font-semibold text-base transition-all shadow-lg shadow-purple-900/30"
          >
            {loading ? "Onboarding..." : "🚀 Onboard Project & Create Admin User"}
          </button>

        </form>
      </div>
    </div>
  );
};

export default OnboardTenant;
