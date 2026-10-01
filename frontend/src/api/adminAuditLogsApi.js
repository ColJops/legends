import api from "../services/api";

export async function getAdminAuditLogs(params = {}) {
    const response = await api.get("/admin/audit-logs", {
        params,
    });

    return response.data;
}