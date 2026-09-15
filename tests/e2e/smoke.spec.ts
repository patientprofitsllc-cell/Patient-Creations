import { test, expect } from "@playwright/test";

test("homepage loads and shows the core CTAs", async ({ page }) => {
  await page.goto("/");
  await expect(page.getByRole("heading", { name: /digital realities/i })).toBeVisible();
  await expect(page.getByRole("link", { name: "Enter the Studio" }).first()).toBeVisible();
  await expect(page.getByRole("link", { name: "View Creations" })).toBeVisible();
});

test("gallery page renders all creation categories", async ({ page }) => {
  await page.goto("/gallery");
  await expect(page.getByRole("heading", { name: "AI Characters" })).toBeVisible();
  await expect(page.getByRole("heading", { name: "AI Agents" })).toBeVisible();
});

test("services page lists seeded products with working checkout links", async ({ page }) => {
  await page.goto("/services");
  const firstProductLink = page.getByRole("link", { name: /configure & continue/i }).first();
  await expect(firstProductLink).toBeVisible();
  await firstProductLink.click();
  await expect(page).toHaveURL(/\/checkout\?product=/);
});

test("checkout happy path in mock-payment mode creates an order and project", async ({ page }) => {
  await page.goto("/services");
  await page.getByRole("link", { name: /configure & continue/i }).first().click();

  const email = `test-${Date.now()}@example.com`;
  await page.getByPlaceholder("Full name").fill("Test Customer");
  await page.getByPlaceholder("Email").fill(email);
  await page.getByPlaceholder("Password (min 8 characters)").fill("password123");

  await page.getByRole("button", { name: /complete purchase/i }).click();
  await expect(page).toHaveURL(/\/checkout\/success/, { timeout: 15000 });
  await expect(page.getByText(/entered the studio/i)).toBeVisible();
});

test("admin dashboard redirects anonymous visitors to login", async ({ page }) => {
  await page.goto("/admin/dashboard");
  await expect(page).toHaveURL(/\/auth\/login/);
});
