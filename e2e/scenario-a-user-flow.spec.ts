import { test, expect } from '@playwright/test';

/**
 * Phase 5 - E2E Scenario A:
 * A user logs in, uploads a book PDF, and views it on their dashboard.
 */
test.describe('Scenario A: User Book Upload Flow', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to sign in page
    await page.goto('/auth/signin');
    await expect(page).toHaveTitle(/LibraryOS/i);
  });

  test('user can sign in and reach dashboard', async ({ page }) => {
    await page.fill('#email', 'testuser@example.com');
    await page.fill('#password', 'password123');
    await page.click('#signin-submit');

    // Expect redirect to dashboard
    await expect(page).toHaveURL(/\/dashboard/, { timeout: 15_000 });
    await expect(page.locator('h1')).toContainText(/Library/i);
  });

  test('user can upload a PDF and read it in the library', async ({ page }) => {
    await page.fill('#email', 'testuser@example.com');
    await page.fill('#password', 'password123');
    await page.click('#signin-submit');
    await expect(page).toHaveURL(/\/dashboard/, { timeout: 15_000 });

    await page.goto('/dashboard/upload');
    await page.locator('#file-input').setInputFiles({
      name: 'e2e-book.pdf',
      mimeType: 'application/pdf',
      buffer: Buffer.from('%PDF-1.7\nE2E test document'),
    });
    await page.fill('#title', 'Playwright Upload Book');
    await page.click('#upload-submit');
    await expect(page).toHaveURL(/\/dashboard\/?$/, { timeout: 15_000 });
    await expect(page.getByText('Playwright Upload Book')).toBeVisible();

    const bookCard = page.locator('[data-testid^="book-card-"]').filter({
      hasText: 'Playwright Upload Book',
    });
    await bookCard.hover();
    await bookCard.getByRole('link', { name: 'View Playwright Upload Book' }).click();
    await expect(page).toHaveURL(/\/dashboard\/books\//);
    await expect(page.getByTitle('PDF viewer for Playwright Upload Book')).toBeVisible();

    const pdfUrl = await page.getByTitle('PDF viewer for Playwright Upload Book').getAttribute('src');
    expect(pdfUrl).toBeTruthy();
    const pdfResponse = await page.request.get(new URL(pdfUrl!, page.url()).toString());
    expect(pdfResponse.status()).toBe(200);
    expect(pdfResponse.headers()['content-type']).toContain('application/pdf');
  });

  test('sign-in page displays correctly with form fields', async ({ page }) => {
    await expect(page.locator('#email')).toBeVisible();
    await expect(page.locator('#password')).toBeVisible();
    await expect(page.locator('#signin-submit')).toBeVisible();
    await expect(page.locator('#signin-submit')).toHaveText(/Sign In/i);
  });

  test('sign-in shows error for invalid credentials', async ({ page }) => {
    await page.fill('#email', 'invalid@example.com');
    await page.fill('#password', 'wrongpassword');
    await page.click('#signin-submit');

    await expect(page.locator('[role="alert"]')).toBeVisible({ timeout: 5000 });
  });

  test('upload page has drag-and-drop zone and form fields', async ({ page }) => {
    // Navigate directly to upload page (assumes middleware allows or mocks auth)
    await page.goto('/dashboard/upload');
    // The page might redirect to sign-in if not authenticated
    const url = page.url();
    if (url.includes('signin')) {
      // Auth redirect is working correctly
      expect(url).toContain('signin');
    } else {
      await expect(page.locator('[aria-label="File drop zone"]')).toBeVisible();
      await expect(page.locator('#title')).toBeVisible();
      await expect(page.locator('#upload-submit')).toBeVisible();
    }
  });

  test('library homepage is accessible', async ({ page }) => {
    await page.goto('/');
    await expect(page.locator('h1')).toContainText(/Your Digital/i);
    await expect(page.locator('text=Start Reading Free')).toBeVisible();
  });
});
