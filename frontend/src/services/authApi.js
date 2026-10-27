import api from "./api";

export async function loginUser(credentials) {
    const response = await api.post("/auth/login", credentials);
    return response.data;
}

export async function registerUser(data) {
    const response = await api.post("/auth/register", data);
    return response.data;
}

export async function getCurrentUser() {
    const response = await api.get("/auth/me");
    return response.data;
}

export async function requestPasswordReset(email) {
    const response = await api.post("/auth/forgot-password", { email });
    return response.data;
}

export async function resetPassword(payload) {
    const response = await api.post("/auth/reset-password", payload);
    return response.data;
}

export async function getAccountSettings() {
    const response = await api.get("/auth/account-settings");
    return response.data;
}

export async function changeCurrentPassword(payload) {
    const response = await api.post("/auth/change-password", payload);
    return response.data;
}
