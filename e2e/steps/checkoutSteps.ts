import { expect } from '@playwright/test';
import { DataTable } from 'playwright-bdd';
import { When, Then } from '../support/fixtures';
import { CheckoutPage } from '../pages/checkoutPage';

When('I enter my details as {string} {string} with postal code {string}', async ({ checkoutPage }, firstName: string, lastName: string, postalCode: string) => {
  await checkoutPage.fillCustomerDetails({ firstName, lastName, postalCode });
});

When('I finish the order', async ({ checkoutPage }) => {
  await checkoutPage.finishButton.click();
});

Then('the order overview should list:', async ({ page, checkoutPage }, table: DataTable) => {
  await expect(page).toHaveURL(/\/checkout-step-two\.html$/);
  await expect(checkoutPage.itemNames).toHaveText(table.hashes().map(row => row.productName));
});

Then('the item total should equal the sum of the item prices', async ({ checkoutPage }) => {
  await expect(checkoutPage.subtotalLabel).toBeVisible();
  const prices = (await checkoutPage.itemPrices.allTextContents()).map(CheckoutPage.parseAmount);
  const subtotal = CheckoutPage.parseAmount(await checkoutPage.subtotalLabel.innerText());

  expect(subtotal).toBeCloseTo(prices.reduce((sum, price) => sum + price, 0), 2);
});

Then('the order total should equal the item total plus tax', async ({ checkoutPage }) => {
  const subtotal = CheckoutPage.parseAmount(await checkoutPage.subtotalLabel.innerText());
  const tax = CheckoutPage.parseAmount(await checkoutPage.taxLabel.innerText());
  const total = CheckoutPage.parseAmount(await checkoutPage.totalLabel.innerText());

  expect(total).toBeCloseTo(subtotal + tax, 2);
});

Then('I should see the order confirmation {string}', async ({ page, checkoutPage }, message: string) => {
  await expect(page).toHaveURL(/\/checkout-complete\.html$/);
  await expect(checkoutPage.completeHeader).toHaveText(message);
});

Then('I should see the checkout error {string}', async ({ checkoutPage }, message: string) => {
  await expect(checkoutPage.errorMessage).toHaveText(message);
});
