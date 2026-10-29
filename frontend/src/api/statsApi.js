import api from "../services/api";

export async function getHomeStats() {
    const response = await api.get("/stats/home");
    return response.data;
}
