import { expect } from '@playwright/test';
import { DataTable } from 'playwright-bdd';
import { Given, When, Then } from '../support/fixtures';
import { SORT_OPTIONS, SortOption } from '../pages/inventoryPage';

type SortField = 'name' | 'price';
type SortDirection = 'ascending' | 'descending';

const toProductNames = (table: DataTable): string[] =>
  table.hashes().map(row => row.productName);

Given('I add {string} to the cart', async ({ inventoryPage }, productName: string) => {
  await inventoryPage.addToCart(productName);
});

When('I add the following products to the cart:', async ({ inventoryPage }, table: DataTable) => {
  for (const productName of toProductNames(table)) {
    await inventoryPage.addToCart(productName);
  }
});

When('I remove {string} from the inventory page', async ({ inventoryPage }, productName: string) => {
  await inventoryPage.removeFromCart(productName);
});

When('I sort products by {string}', async ({ inventoryPage }, option: string) => {
  if (!SORT_OPTIONS.includes(option as SortOption)) {
    throw new Error(`Unknown sort option "${option}". Expected one of: ${SORT_OPTIONS.join(', ')}`);
  }
  await inventoryPage.sortBy(option as SortOption);
});

Then('the products should be sorted by {word} in {word} order', async ({ inventoryPage }, field: SortField, direction: SortDirection) => {
  const sign = direction === 'ascending' ? 1 : -1;

  // Build the expected order from the current values, then use a web-first assertion
  // so Playwright retries until the UI has finished re-rendering the sorted list.
  if (field === 'name') {
    const names = await inventoryPage.itemNames.allTextContents();
    const expected = [...names].sort((a, b) => sign * a.localeCompare(b));
    await expect(inventoryPage.itemNames).toHaveText(expected);
    return;
  }

  if (field === 'price') {
    const prices = await inventoryPage.getPrices();
    const expected = [...prices].sort((a, b) => sign * (a - b)).map(price => `$${price.toFixed(2)}`);
    await expect(inventoryPage.itemPrices).toHaveText(expected);
    return;
  }

  throw new Error(`Unsupported sort field "${field}"`);
});

Then('the cart badge should show {int}', async ({ inventoryPage }, count: number) => {
  await expect(inventoryPage.header.cartBadge).toHaveText(String(count));
});

Then('the cart badge should not be shown', async ({ inventoryPage }) => {
  await expect(inventoryPage.header.cartBadge).toBeHidden();
});
