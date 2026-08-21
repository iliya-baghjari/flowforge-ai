import { describe, expect, it } from "vitest";

import { DEFAULT_SITE_DESCRIPTION, DEFAULT_SITE_NAME, getPublicRoutes, getSiteUrl } from "./site";

describe("site metadata", () => {
  it("exposes the default FlowForge AI branding and description", () => {
    expect(DEFAULT_SITE_NAME).toBe("FlowForge AI");
    expect(DEFAULT_SITE_DESCRIPTION).toContain("AI workspace");
  });

  it("includes the public auth routes for sitemap generation", () => {
    const routes = getPublicRoutes();

    expect(routes).toContain("/");
    expect(routes).toContain("/login");
    expect(routes).toContain("/register");
    expect(routes).toContain("/forgot-password");
  });

  it("resolves the canonical site URL from env or localhost", () => {
    const url = getSiteUrl();

    expect(url).toMatch(/^https?:\/\//);
    expect(url).toContain("localhost");
  });
});
