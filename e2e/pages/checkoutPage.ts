import { Locator, Page } from '@playwright/test';

export interface CustomerDetails {
  firstName: string;
  lastName: string;
  postalCode: string;
}

/** Covers the three checkout steps: your information, overview, and complete. */
export class CheckoutPage {
  readonly firstNameInput: Locator;
  readonly lastNameInput: Locator;
  readonly postalCodeInput: Locator;
  readonly continueButton: Locator;
  readonly finishButton: Locator;
  readonly errorMessage: Locator;
  readonly itemNames: Locator;
  readonly itemPrices: Locator;
  readonly subtotalLabel: Locator;
  readonly taxLabel: Locator;
  readonly totalLabel: Locator;
  readonly completeHeader: Locator;

  constructor (page: Page) {
    this.firstNameInput = page.getByTestId('firstName');
    this.lastNameInput = page.getByTestId('lastName');
    this.postalCodeInput = page.getByTestId('postalCode');
    this.continueButton = page.getByTestId('continue');
    this.finishButton = page.getByTestId('finish');
    this.errorMessage = page.getByTestId('error');
    this.itemNames = page.getByTestId('inventory-item-name');
    this.itemPrices = page.getByTestId('inventory-item-price');
    this.subtotalLabel = page.getByTestId('subtotal-label');
    this.taxLabel = page.getByTestId('tax-label');
    this.totalLabel = page.getByTestId('total-label');
    this.completeHeader = page.getByTestId('complete-header');
  }

  async fillCustomerDetails ({ firstName, lastName, postalCode }: Partial<CustomerDetails>): Promise<void> {
    if (firstName) {
      await this.firstNameInput.fill(firstName);
    }
    if (lastName) {
      await this.lastNameInput.fill(lastName);
    }
    if (postalCode) {
      await this.postalCodeInput.fill(postalCode);
    }
    await this.continueButton.click();
  }

  /** Parses a summary label such as "Item total: $39.98" into a number. */
  static parseAmount (label: string): number {
    const match = label.match(/\$(\d+(?:\.\d+)?)/);
    if (!match) {
      throw new Error(`Could not parse an amount from "${label}"`);
    }
    return Number(match[1]);
  }
}
