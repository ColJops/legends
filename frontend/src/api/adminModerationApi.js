import api from "../services/api";

export async function getModerationSummary() {
    return (await api.get("/admin/moderation/summary")).data;
}

export async function getModerationQueue(page = 0) {
    return (await api.get("/admin/moderation/queue", { params: { page, size: 10 } })).data;
}

export async function getModerationReports(page = 0) {
    return (await api.get("/admin/moderation/reports", { params: { page, size: 10 } })).data;
}

export async function approveLegend(id, payload) {
    const result = (await api.post(`/admin/moderation/queue/${id}/approve`, payload)).data;
    announceCountsRefresh();
    return result;
}

export async function rejectLegend(id, payload) {
    const result = (await api.post(`/admin/moderation/queue/${id}/reject`, payload)).data;
    announceCountsRefresh();
    return result;
}

export async function archiveLegend(id, payload) {
    const result = (await api.post(`/admin/moderation/legends/${id}/archive`, payload)).data;
    announceCountsRefresh();
    return result;
}

export async function dismissLegendReport(id, payload) {
    await api.post(`/admin/moderation/reports/${id}/dismiss`, payload);
    announceCountsRefresh();
}

function announceCountsRefresh() {
    window.dispatchEvent(new Event("admin-counts-refresh"));
}
