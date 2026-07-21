import api from "../services/api";

export async function getAdminLegends(params = {}) {
    const response = await api.get("/admin/legends", {
        params,
    });

    return response.data;
}

export async function getAdminLegend(id) {
    const response = await api.get(`/legends/${id}`);
    return response.data;
}

export async function updateAdminLegend(id, payload) {
    const response = await api.put(`/legends/${id}`, payload);
    return response.data;
}

export async function uploadAdminLegendImage(file) {
    const formData = new FormData();
    formData.append("file", file);

    const response = await api.post(
        "/uploads/legend-image",
        formData,
        {
            headers: {
                "Content-Type": "multipart/form-data",
            },
        }
    );

    return response.data.imageUrl;
}

export async function deleteAdminLegend(id) {
    await api.delete(`/admin/legends/${id}`);
}