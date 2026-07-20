export function canManageLegend(user, legend) {
    if (!user || !legend) {
        return false;
    }

    if (user.role === "ADMIN") {
        return true;
    }

    return legend.authorUsername === user.username;
}