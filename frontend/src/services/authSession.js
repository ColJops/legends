const TOKEN_STORAGE_KEY = "legends_token";
const USER_STORAGE_KEY = "legends_user";

export const AUTH_SESSION_CLEARED_EVENT =
    "legends:auth-session-cleared";

export function readStoredToken() {
    return getStorage()?.getItem(TOKEN_STORAGE_KEY) ?? null;
}

export function readStoredUser() {
    const storage = getStorage();
    const savedUser = storage?.getItem(USER_STORAGE_KEY);

    if (!savedUser) {
        return null;
    }

    try {
        const parsedUser = JSON.parse(savedUser);

        if (
            !parsedUser ||
            typeof parsedUser !== "object" ||
            typeof parsedUser.username !== "string" ||
            typeof parsedUser.role !== "string"
        ) {
            throw new Error("Invalid stored user");
        }

        return parsedUser;
    } catch {
        storage?.removeItem(USER_STORAGE_KEY);
        return null;
    }
}

export function persistAuthSession(token, user) {
    const storage = getStorage();

    if (!storage) {
        return;
    }

    storage.setItem(TOKEN_STORAGE_KEY, token);
    storage.setItem(USER_STORAGE_KEY, JSON.stringify(user));
}

export function persistStoredUser(user) {
    getStorage()?.setItem(
        USER_STORAGE_KEY,
        JSON.stringify(user)
    );
}

export function clearStoredAuthSession({ notify = false } = {}) {
    const storage = getStorage();

    storage?.removeItem(TOKEN_STORAGE_KEY);
    storage?.removeItem(USER_STORAGE_KEY);

    if (notify && typeof window !== "undefined") {
        window.dispatchEvent(
            new Event(AUTH_SESSION_CLEARED_EVENT)
        );
    }
}

function getStorage() {
    if (typeof window === "undefined") {
        return null;
    }

    return window.localStorage;
}
