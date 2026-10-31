import { test, expect } from '@playwright/test';

/**
 * Phase 5 - E2E Scenario B:
 * Super Admin accesses user logs, executes a profile suspension, and flags content updates.
 */
test.describe('Scenario B: Super Admin Management Flow', () => {
  test('admin dashboard is blocked for unauthenticated users', async ({ page }) => {
    await page.goto('/admin/dashboard');
    // Should redirect to sign-in or show forbidden
    const url = page.url();
    const status = await page.evaluate(() => document.body.innerText);
    const isBlocked =
      url.includes('signin') ||
      url.includes('auth') ||
      status.includes('Forbidden') ||
      status.includes('403');
    expect(isBlocked).toBeTruthy();
  });

  test('super admin can suspend and reactivate a user', async ({ page }) => {
    await page.goto('/auth/signin');
    await page.fill('#email', 'admin@example.com');
    await page.fill('#password', 'adminpassword123');
    await page.click('#signin-submit');
    await expect(page).toHaveURL(/\/dashboard/, { timeout: 15_000 });

    await page.goto('/admin/dashboard');
    await expect(page.getByTestId('user-row-e2e-test-user')).toBeVisible();
    await page.getByTestId('suspend-user-e2e-test-user').click();
    await expect(page.getByTestId('user-status-e2e-test-user')).toHaveText('SUSPENDED');
    await page.getByTestId('activate-user-e2e-test-user').click();
    await expect(page.getByTestId('user-status-e2e-test-user')).toHaveText('ACTIVE');
  });

  test('admin signin page renders correctly', async ({ page }) => {
    await page.goto('/auth/signin');
    await expect(page.locator('#email')).toBeVisible();
    await expect(page.locator('#password')).toBeVisible();
    await expect(page.locator('#signin-submit')).toBeVisible();
  });

  test('homepage shows sign in and get started links', async ({ page }) => {
    await page.goto('/');
    await expect(page.locator('a[href="/auth/signin"]').first()).toBeVisible();
    await expect(page.locator('a[href="/auth/register"]').first()).toBeVisible();
  });

  test('registration page renders correctly', async ({ page }) => {
    await page.goto('/auth/register');
    await expect(page.locator('#email')).toBeVisible();
    await expect(page.locator('#password')).toBeVisible();
    await expect(page.locator('#register-submit')).toBeVisible();
    await expect(page.locator('#register-submit')).toContainText(/Create Account/i);
  });

  test('registration validates email format', async ({ page }) => {
    await page.goto('/auth/register');
    await page.fill('#email', 'not-an-email');
    await page.fill('#password', 'password123');
    await page.click('#register-submit');
    // HTML5 validation should prevent submission
    const emailInput = page.locator('#email');
    const validationMessage = await emailInput.evaluate(
      (el: HTMLInputElement) => el.validationMessage
    );
    expect(validationMessage).toBeTruthy();
  });
});
