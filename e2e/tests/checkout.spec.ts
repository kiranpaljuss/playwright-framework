import { test, expect } from '../fixtures';
import { CheckoutPage, CustomerDetails } from '../pages/checkoutPage';

const products = ['Sauce Labs Backpack', 'Sauce Labs Bike Light'];
const customer: CustomerDetails = { firstName: 'Ada', lastName: 'Lovelace', postalCode: 'SW1A 1AA' };

test.describe('Checkout', { tag: '@checkout' }, () => {
  test.beforeEach(async ({ page, inventoryPage, cartPage }) => {
    await inventoryPage.goto();
    for (const product of products) {
      await inventoryPage.addToCart(product);
    }
    await inventoryPage.header.openCart();
    await cartPage.checkoutButton.click();
    await expect(page).toHaveURL(/\/checkout-step-one\.html$/);
  });

  test('complete a purchase end to end', { tag: '@smoke' }, async ({ page, checkoutPage }) => {
    await checkoutPage.fillCustomerDetails(customer);

    await test.step('order overview lists the products', async () => {
      await expect(page).toHaveURL(/\/checkout-step-two\.html$/);
      await expect(checkoutPage.itemNames).toHaveText(products);
    });

    await test.step('totals add up', async () => {
      const prices = (await checkoutPage.itemPrices.allTextContents()).map(CheckoutPage.parseAmount);
      const subtotal = CheckoutPage.parseAmount(await checkoutPage.subtotalLabel.innerText());
      const tax = CheckoutPage.parseAmount(await checkoutPage.taxLabel.innerText());
      const total = CheckoutPage.parseAmount(await checkoutPage.totalLabel.innerText());

      expect(subtotal).toBeCloseTo(prices.reduce((sum, price) => sum + price, 0), 2);
      expect(total).toBeCloseTo(subtotal + tax, 2);
    });

    await test.step('finishing the order confirms it and empties the cart', async () => {
      await checkoutPage.finishButton.click();

      await expect(page).toHaveURL(/\/checkout-complete\.html$/);
      await expect(checkoutPage.completeHeader).toHaveText('Thank you for your order!');
      await expect(checkoutPage.header.cartBadge).toBeHidden();
    });
  });

  const missingFields: { field: keyof CustomerDetails; error: string }[] = [
    { field: 'firstName', error: 'Error: First Name is required' },
    { field: 'lastName', error: 'Error: Last Name is required' },
    { field: 'postalCode', error: 'Error: Postal Code is required' }
  ];

  for (const { field, error } of missingFields) {
    test(`checkout requires ${field}`, { tag: '@regression' }, async ({ checkoutPage }) => {
      await checkoutPage.fillCustomerDetails({ ...customer, [field]: '' });

      await expect(checkoutPage.errorMessage).toHaveText(error);
    });
  }
});
