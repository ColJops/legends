import api from "../services/api";

export async function getAdminUsers(params = {}) {
    const response = await api.get("/admin/users", {
        params,
    });

    return response.data;
}

export async function updateAdminUserRole(userId, role) {
    await api.patch(`/admin/users/${userId}/role`, {
        role,
    });
}

export async function updateAdminUserLock(userId, locked) {
    await api.patch(`/admin/users/${userId}/lock`, {
        locked,
    });
}

export async function deleteAdminUser(
    userId,
    contentAction = "ANONYMIZE"
) {
    await api.delete(`/admin/users/${userId}`, {
        params: {
            contentAction,
        },
    });
}