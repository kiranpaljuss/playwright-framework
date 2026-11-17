import { test as base } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
import { LoginPage } from './pages/loginPage';
import { InventoryPage } from './pages/inventoryPage';
import { CartPage } from './pages/cartPage';
import { CheckoutPage } from './pages/checkoutPage';

/** Rules checked by the accessibility scans: WCAG 2.0–2.2 levels A and AA, plus axe best practices. */
const AXE_TAGS = ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa', 'best-practice'];

/**
 * Known accessibility issues in SauceDemo (a third-party site we can't fix).
 * All are axe best-practice rules, not WCAG failures. They're excluded so the scans
 * still fail on any new issue. Remove an entry here to start enforcing it.
 */
const KNOWN_ISSUES = [
  'page-has-heading-one', // No page has a level-one heading
  'region', // Login page content isn't inside landmark regions
  'aria-allowed-role' // Login error is an <h3 role="alert">; headings shouldn't take the alert role
];

interface PageFixtures {
  loginPage: LoginPage;
  inventoryPage: InventoryPage;
  cartPage: CartPage;
  checkoutPage: CheckoutPage;
  makeAxeBuilder: () => AxeBuilder;
}

/**
 * Page objects are provided as Playwright fixtures, so each test gets its own
 * isolated instances and only creates the ones it asks for.
 */
export const test = base.extend<PageFixtures>({
  loginPage: async ({ page }, use) => {
    await use(new LoginPage(page));
  },
  inventoryPage: async ({ page }, use) => {
    await use(new InventoryPage(page));
  },
  cartPage: async ({ page }, use) => {
    await use(new CartPage(page));
  },
  checkoutPage: async ({ page }, use) => {
    await use(new CheckoutPage(page));
  },
  makeAxeBuilder: async ({ page }, use) => {
    await use(() => new AxeBuilder({ page }).withTags(AXE_TAGS).disableRules(KNOWN_ISSUES));
  }
});

export { expect } from '@playwright/test';
