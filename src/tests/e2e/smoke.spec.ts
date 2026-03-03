import { expect, test } from "@playwright/test";

test("redirects anonymous user to login", async ({ page }) => {
  await page.goto("/");
  await expect(page).toHaveURL(/login/);
});
