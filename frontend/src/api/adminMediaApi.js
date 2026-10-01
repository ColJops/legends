import api from "../services/api";

export async function getAdminMedia() {
    const response = await api.get("/admin/media");
    return response.data;
}

export async function deleteAdminMediaFile(filename) {
    await api.delete(
        `/admin/media/${encodeURIComponent(filename)}`
    );
}

export async function cleanupAdminMediaOrphans() {
    const response = await api.post(
        "/admin/media/cleanup-orphans"
    );

    return response.data;
}

export function resolveMediaUrl(url) {
    if (!url) {
        return "";
    }

    if (
        url.startsWith("http://") ||
        url.startsWith("https://")
    ) {
        return url;
    }

    const apiBaseUrl = api.defaults.baseURL || "";

    const backendBaseUrl = apiBaseUrl.replace(
        /\/api\/?$/,
        ""
    );

    return `${backendBaseUrl}${url}`;
}