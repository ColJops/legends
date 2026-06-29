const API_URL = "http://localhost:8080/api/stats";

export async function getHomeStats() {
    const response = await fetch(`${API_URL}/home`);

    if (!response.ok) {
        throw new Error("Nie udało się pobrać statystyk.");
    }

    return response.json();
}