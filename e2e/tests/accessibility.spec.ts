import { Page, TestInfo } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
import { test, expect } from '../fixtures';
import { InventoryPage } from '../pages/inventoryPage';
import { CheckoutPage } from '../pages/checkoutPage';
import { getCredentials } from '../users';

/**
 * Runs an axe scan, attaches the full results to the HTML report, and returns a
 * readable one-line summary per violation so failures are easy to understand.
 */
const scan = async (makeAxeBuilder: () => AxeBuilder, testInfo: TestInfo): Promise<string[]> => {
  const results = await makeAxeBuilder().analyze();
  await testInfo.attach('accessibility-scan-results', {
    body: JSON.stringify(results.violations, null, 2),
    contentType: 'application/json'
  });
  return results.violations.map(v => `${v.id} (${v.impact}): ${v.help} [${v.nodes.length} element(s)]`);
};

test.describe('Accessibility', { tag: ['@a11y', '@regression'] }, () => {
  test.describe('signed out', () => {
    test.use({ storageState: { cookies: [], origins: [] } });

    test('login page has no accessibility violations', async ({ loginPage, makeAxeBuilder }, testInfo) => {
      await loginPage.goto();

      expect(await scan(makeAxeBuilder, testInfo)).toEqual([]);
    });

    test('login error message has no accessibility violations', async ({ loginPage, makeAxeBuilder }, testInfo) => {
      await loginPage.goto();
      await loginPage.login('standard_user', 'wrong_password');
      await expect(loginPage.errorMessage).toBeVisible();

      expect(await scan(makeAxeBuilder, testInfo)).toEqual([]);
    });

    test('user can log in with the keyboard only', async ({ page, loginPage }) => {
      const { username, password } = getCredentials('standard');
      await loginPage.goto();

      await loginPage.usernameInput.focus();
      await page.keyboard.type(username);
      await page.keyboard.press('Tab');
      await expect(loginPage.passwordInput).toBeFocused();
      await page.keyboard.type(password);
      await page.keyboard.press('Enter');

      await expect(page).toHaveURL(/\/inventory\.html$/);
    });
  });

  interface Pages { page: Page; inventoryPage: InventoryPage; checkoutPage: CheckoutPage }

  const authenticatedPages: { name: string; open: (pages: Pages) => Promise<void> }[] = [
    { name: 'inventory', open: ({ inventoryPage }) => inventoryPage.goto() },
    {
      name: 'cart',
      open: async ({ page }) => {
        await page.goto('/cart.html');
      }
    },
    {
      name: 'checkout information',
      open: async ({ page }) => {
        await page.goto('/checkout-step-one.html');
      }
    },
    {
      name: 'checkout overview',
      open: async ({ page, inventoryPage, checkoutPage }) => {
        await inventoryPage.goto();
        await inventoryPage.addToCart('Sauce Labs Backpack');
        await page.goto('/checkout-step-one.html');
        await checkoutPage.fillCustomerDetails({ firstName: 'Ada', lastName: 'Lovelace', postalCode: 'SW1A 1AA' });
        await expect(page).toHaveURL(/\/checkout-step-two\.html$/);
      }
    }
  ];

  for (const { name, open } of authenticatedPages) {
    test(`${name} page has no accessibility violations`, async ({ page, inventoryPage, checkoutPage, makeAxeBuilder }, testInfo) => {
      await open({ page, inventoryPage, checkoutPage });

      expect(await scan(makeAxeBuilder, testInfo)).toEqual([]);
    });
  }
});
