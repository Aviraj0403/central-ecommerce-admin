import axios from "axios";

// SuperAdmin connects to the central backend's /v1/api/superadmin endpoints
// It does NOT need a tenant domain — it goes directly to the master API
const baseURL = import.meta.env.VITE_API_BASE_URL || "http://localhost:6005/v1/api";

const SuperAdminAxios = axios.create({
  baseURL,
  withCredentials: true,
});

SuperAdminAxios.interceptors.response.use(
  (res) => res,
  async (err) => {
    const originalRequest = err.config;
    const isMeRoute = originalRequest.url?.includes("/auth/me");

    if (err.response?.status === 401 && !originalRequest._retry && !isMeRoute) {
      originalRequest._retry = true;
      try {
        await axios.post(`${baseURL}/auth/refresh-token`, {}, { withCredentials: true });
        return SuperAdminAxios(originalRequest);
      } catch (refreshErr) {
        localStorage.removeItem("superadmin");
        sessionStorage.clear();
        window.location.href = "/superadmin/login";
        return Promise.reject(refreshErr);
      }
    }
    return Promise.reject(err);
  }
);

export default SuperAdminAxios;
