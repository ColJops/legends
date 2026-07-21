import { afterEach, describe, expect, it } from "vitest";

import {
    resolveMediaUrl,
} from "./adminMediaApi";
import api from "../services/api";

describe("resolveMediaUrl", () => {
    afterEach(() => {
        api.defaults.baseURL = "/api";
    });

    it("returns an empty string for empty URLs", () => {
        expect(resolveMediaUrl("")).toBe("");
        expect(resolveMediaUrl(null)).toBe("");
    });

    it("leaves absolute URLs unchanged", () => {
        expect(resolveMediaUrl("https://cdn.example.com/image.png"))
                .toBe("https://cdn.example.com/image.png");
    });

    it("resolves relative upload URLs against the backend origin", () => {
        api.defaults.baseURL = "http://localhost:8080/api";

        expect(resolveMediaUrl("/uploads/legends/image.png"))
                .toBe("http://localhost:8080/uploads/legends/image.png");
    });
});
