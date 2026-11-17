import { Locator, Page } from '@playwright/test';
import { Header } from './components/header';

export const SORT_OPTIONS = ['Name (A to Z)', 'Name (Z to A)', 'Price (low to high)', 'Price (high to low)'] as const;
export type SortOption = typeof SORT_OPTIONS[number];

export class InventoryPage {
  readonly header: Header;
  readonly inventoryList: Locator;
  readonly itemNames: Locator;
  readonly itemPrices: Locator;
  readonly sortDropdown: Locator;

  constructor (page: Page) {
    this.header = new Header(page);
    this.inventoryList = page.getByTestId('inventory-list');
    this.itemNames = page.getByTestId('inventory-item-name');
    this.itemPrices = page.getByTestId('inventory-item-price');
    this.sortDropdown = page.getByTestId('product-sort-container');
  }

  /** A single product card, located by its visible name rather than a generated test id. */
  productCard (productName: string): Locator {
    return this.inventoryList
      .getByTestId('inventory-item')
      .filter({ has: this.itemNames.getByText(productName, { exact: true }) });
  }

  async addToCart (productName: string): Promise<void> {
    await this.productCard(productName).getByRole('button', { name: 'Add to cart' }).click();
  }

  async removeFromCart (productName: string): Promise<void> {
    await this.productCard(productName).getByRole('button', { name: 'Remove' }).click();
  }

  async sortBy (option: SortOption): Promise<void> {
    await this.sortDropdown.selectOption({ label: option });
  }

  async getPrices (): Promise<number[]> {
    const prices = await this.itemPrices.allTextContents();
    return prices.map(price => Number(price.replace('$', '')));
  }
}
