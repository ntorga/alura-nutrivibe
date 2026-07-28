import { test, expect } from '@playwright/test';

test.describe('Home Page', () => {
  test('should display the home page with title', async ({ page }) => {
    await page.goto('/');
    await expect(page.locator('.text-h5').first()).toContainText('Hoje');
  });

  test('should display nutrition summary cards', async ({ page }) => {
    await page.goto('/');
    await expect(page.getByText('Calorias')).toBeVisible();
    await expect(page.getByText('Proteína')).toBeVisible();
    await expect(page.getByText('Carbos')).toBeVisible();
    await expect(page.getByText('Gordura')).toBeVisible();
  });

  test('should show empty state when no meals', async ({ page }) => {
    await page.goto('/');
    const emptyState = page.getByText('Nenhuma refeição registrada hoje');
    if (await emptyState.isVisible()) {
      await expect(page.getByRole('button', { name: 'Adicionar refeição' })).toBeVisible();
    }
  });
});

test.describe('Navigation', () => {
  test('should navigate to history page', async ({ page }) => {
    await page.goto('/');
    await page.getByText('Histórico').click();
    await expect(page).toHaveURL(/#\/history/);
    await expect(page.locator('.text-h5').first()).toContainText('Histórico');
  });

  test('should navigate to charts page', async ({ page }) => {
    await page.goto('/');
    await page.getByText('Gráficos').click();
    await expect(page).toHaveURL(/#\/charts/);
    await expect(page.locator('.text-h5').first()).toContainText('Gráficos');
  });

  test('should navigate between all pages', async ({ page }) => {
    await page.goto('/');
    await expect(page.locator('.text-h5').first()).toContainText('Hoje');
    
    await page.getByText('Histórico').click();
    await expect(page.locator('.text-h5').first()).toContainText('Histórico');
    
    await page.getByText('Gráficos').click();
    await expect(page.locator('.text-h5').first()).toContainText('Gráficos');
    
    await page.getByText('Hoje').click();
    await expect(page.locator('.text-h5').first()).toContainText('Hoje');
  });
});

test.describe('History Page', () => {
  test('should display the history page', async ({ page }) => {
    await page.goto('/');
    await page.getByText('Histórico').click();
    await expect(page.locator('.text-h5').first()).toContainText('Histórico');
  });

  test('should have date navigation', async ({ page }) => {
    await page.goto('/');
    await page.getByText('Histórico').click();
    const navButtons = page.locator('.q-card .q-btn');
    await expect(navButtons.first()).toBeVisible();
  });
});

test.describe('Charts Page', () => {
  test('should display the charts page', async ({ page }) => {
    await page.goto('/');
    await page.getByText('Gráficos').click();
    await expect(page.locator('.text-h5').first()).toContainText('Gráficos');
  });

  test('should have metric options', async ({ page }) => {
    await page.goto('/');
    await page.getByText('Gráficos').click();
    await expect(page.getByText('Calorias', { exact: true })).toBeVisible();
    await expect(page.getByText('Proteína', { exact: true })).toBeVisible();
    await expect(page.getByText('Carbos', { exact: true })).toBeVisible();
    await expect(page.getByText('Gordura', { exact: true })).toBeVisible();
  });
});
