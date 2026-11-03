import api from "../services/api";

export async function lookupPostalCode(postalCode) {
    const response = await api.get(`/postal-codes/${encodeURIComponent(postalCode)}`);
    return response.data;
}
