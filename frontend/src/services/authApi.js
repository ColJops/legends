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