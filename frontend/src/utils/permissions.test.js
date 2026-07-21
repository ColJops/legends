import { describe, expect, it } from "vitest";

import { canManageLegend } from "./permissions";

describe("canManageLegend", () => {
    it("allows admins to manage every legend", () => {
        expect(canManageLegend(
                { username: "admin", role: "ADMIN" },
                { authorUsername: "ania" }
        )).toBe(true);
    });

    it("allows users to manage their own legends", () => {
        expect(canManageLegend(
                { username: "ania", role: "USER" },
                { authorUsername: "ania" }
        )).toBe(true);
    });

    it("rejects missing users and legends owned by someone else", () => {
        expect(canManageLegend(null, { authorUsername: "ania" })).toBe(false);
        expect(canManageLegend(
                { username: "ania", role: "USER" },
                { authorUsername: "marek" }
        )).toBe(false);
    });
});
