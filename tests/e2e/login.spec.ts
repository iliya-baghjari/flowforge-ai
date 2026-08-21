import { test, expect } from "@playwright/test";

test("login page renders the auth form", async ({ page }) => {
  await page.goto("/login");

  await expect(page.getByRole("heading", { name: /welcome back/i })).toBeVisible();
  await expect(page.locator("#email")).toBeVisible();
  await expect(page.locator("#password")).toBeVisible();
});
