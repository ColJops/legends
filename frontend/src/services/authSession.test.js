import {
    beforeEach,
    describe,
    expect,
    it,
    vi,
} from "vitest";

import {
    AUTH_SESSION_CLEARED_EVENT,
    clearStoredAuthSession,
    persistAuthSession,
    readStoredUser,
} from "./authSession";

describe("authSession", () => {
    beforeEach(() => {
        localStorage.clear();
    });

    it("returns null and removes malformed stored user data", () => {
        localStorage.setItem("legends_user", "{broken-json");

        expect(readStoredUser()).toBeNull();
        expect(
            localStorage.getItem("legends_user")
        ).toBeNull();
    });

    it("persists and restores a valid auth session", () => {
        const user = {
            username: "admin",
            role: "ADMIN",
        };

        persistAuthSession("token-value", user);

        expect(readStoredUser()).toEqual(user);
        expect(
            localStorage.getItem("legends_token")
        ).toBe("token-value");
    });

    it("notifies React when an unauthorized response clears the session", () => {
        const listener = vi.fn();
        window.addEventListener(
            AUTH_SESSION_CLEARED_EVENT,
            listener
        );

        persistAuthSession("token-value", {
            username: "admin",
            role: "ADMIN",
        });
        clearStoredAuthSession({ notify: true });

        expect(listener).toHaveBeenCalledOnce();
        expect(
            localStorage.getItem("legends_token")
        ).toBeNull();
        expect(
            localStorage.getItem("legends_user")
        ).toBeNull();

        window.removeEventListener(
            AUTH_SESSION_CLEARED_EVENT,
            listener
        );
    });
});
