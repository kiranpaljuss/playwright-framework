import { expect } from '@playwright/test';
import { DataTable } from 'playwright-bdd';
import { When, Then } from '../support/fixtures';

When('I open the cart', async ({ page, cartPage }) => {
  await cartPage.header.openCart();
  await expect(page).toHaveURL(/\/cart\.html$/);
});

When('I remove {string} from the cart', async ({ cartPage }, productName: string) => {
  await cartPage.removeItem(productName);
});

When('I continue shopping', async ({ cartPage }) => {
  await cartPage.continueShoppingButton.click();
});

When('I start checkout', async ({ page, cartPage }) => {
  await cartPage.checkoutButton.click();
  await expect(page).toHaveURL(/\/checkout-step-one\.html$/);
});

Then('the cart should contain exactly:', async ({ cartPage }, table: DataTable) => {
  const expected = table.hashes().map(row => row.productName);
  // toHaveText with an array asserts both the count and the order, and retries until the cart renders.
  await expect(cartPage.itemNames).toHaveText(expected);
});
