import axios from "axios";

// Central eCommerce SaaS Backend
// const baseURL = 'http://localhost:6005/v1/api'; // local dev
const baseURL = import.meta.env.VITE_API_BASE_URL || "http://localhost:6005/v1/api";

const Axios = axios.create({
  baseURL,
  withCredentials: true, // send cookies
});

// ✅ Inject Tenant ID for SuperAdmin "Switch Project" feature
Axios.interceptors.request.use((config) => {
  const activeTenantId = localStorage.getItem("active_tenant_id");
  if (activeTenantId) {
    config.headers['x-tenant-id'] = activeTenantId;
  }
  return config;
});


Axios.interceptors.response.use(
  (res) => res,
  async (err) => {
    const originalRequest = err.config;

    // 👉 Skip refresh logic if the failing endpoint is /me
    const isMeRoute = originalRequest.url?.includes("/auth/me");

    if (err.response?.status === 401 && !originalRequest._retry && !isMeRoute) {
      originalRequest._retry = true;

      try {
        await axios.post(
          `${baseURL}/auth/refresh-token`,
          {},
          {
            withCredentials: true,
          }
        );

        return Axios(originalRequest); // Retry the original request
      } catch (refreshErr) {
        console.error("❌ Refresh token failed. Redirecting to login.");

        localStorage.removeItem("user");
        sessionStorage.clear();
        window.location.href = "/signin"; // Redirect to login
        return Promise.reject(refreshErr);
      }
    }

    return Promise.reject(err);
  }
);

export default Axios;
