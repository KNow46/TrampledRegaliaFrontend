// src/services/api.js
import axios from "axios";
import type { AxiosError, InternalAxiosRequestConfig } from "axios";


const api = axios.create({
    baseURL: "http://localhost:8000/api",
});

api.interceptors.request.use(
    (config: InternalAxiosRequestConfig) => {
        const access = localStorage.getItem("access");
        if (access) {
            config.headers.Authorization = `Bearer ${access}`;
        }
        return config;
    },
    (error: AxiosError) => Promise.reject(error)
);

api.interceptors.response.use(
    (response) => response,
    async (error: AxiosError) => {
        const originalRequest = error.config as InternalAxiosRequestConfig & {_retry?: boolean};

        if (error.response?.status === 401 && !originalRequest._retry) {
            originalRequest._retry = true;
            try {
                const refresh = localStorage.getItem("refresh");
                if (!refresh) throw new Error("Refresh token missing");

                const response = await axios.post("http://localhost:8000/api/token/refresh/", {
                    refresh,
                });

                const newAccess = response.data.access;
                localStorage.setItem("access", newAccess);

                if(api.defaults.headers.common) {
                    api.defaults.headers.common["Authorization"] = `Bearer ${newAccess}`;
                }
                if(originalRequest.headers){
                    originalRequest.headers["Authorization"] = `Bearer ${newAccess}`;
                }


                return api(originalRequest);
            } catch (refreshError) {
                // Refresh token failed, logout the user
                localStorage.removeItem('access');
                localStorage.removeItem('refresh');
                window.dispatchEvent(new Event('auth-failure'));
                return Promise.reject(refreshError);
            }
        }

        return Promise.reject(error);
    }
);

export default api;
