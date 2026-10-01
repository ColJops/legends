import axios from "axios";

import {
    clearStoredAuthSession,
    readStoredToken,
} from "./authSession";

const api = axios.create({
    baseURL: "/api",
});

api.interceptors.request.use((config) => {
    const token = readStoredToken();

    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
});

api.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error?.response?.status === 401) {
            clearStoredAuthSession({ notify: true });
        }

        return Promise.reject(error);
    }
);

export default api;
