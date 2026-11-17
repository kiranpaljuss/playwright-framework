import { Locator, Page } from '@playwright/test';
import { Header } from './components/header';

export class CartPage {
  readonly header: Header;
  readonly cartList: Locator;
  readonly itemNames: Locator;
  readonly continueShoppingButton: Locator;
  readonly checkoutButton: Locator;

  constructor (page: Page) {
    this.header = new Header(page);
    this.cartList = page.getByTestId('cart-list');
    this.itemNames = this.cartList.getByTestId('inventory-item-name');
    this.continueShoppingButton = page.getByTestId('continue-shopping');
    this.checkoutButton = page.getByTestId('checkout');
  }

  async removeItem (productName: string): Promise<void> {
    await this.cartList
      .getByTestId('inventory-item')
      .filter({ hasText: productName })
      .getByRole('button', { name: 'Remove' })
      .click();
  }
}
