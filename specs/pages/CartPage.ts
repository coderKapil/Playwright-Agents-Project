import { Page } from '@playwright/test';

export class CartPage {
  constructor(private readonly page: Page) {}

  get title() {
    return this.page.getByRole('heading', { name: 'Shopping cart', exact: true });
  }

  get emptyMessage() {
    return this.page.getByText('Your Shopping Cart is empty!', { exact: true });
  }

  get updateButton() {
    return this.page.getByRole('button', { name: 'Update shopping cart' });
  }

  get termsCheckbox() {
    return this.page.getByRole('checkbox').last();
  }

  get checkoutButton() {
    return this.page.getByRole('button', { name: 'Checkout', exact: true });
  }

  async open(): Promise<void> {
    await this.page.goto('/cart');
  }

  item(name: string) {
    return this.page.getByRole('row').filter({ hasText: name });
  }

  async setQuantity(name: string, quantity: number): Promise<void> {
    await this.item(name).getByRole('textbox').fill(String(quantity));
    await this.updateButton.click();
  }

  async removeItem(name: string): Promise<void> {
    await this.item(name).getByRole('checkbox').check();
    await this.updateButton.click();
  }

  async proceedToCheckout(): Promise<void> {
    await this.termsCheckbox.check();
    await this.checkoutButton.click();
  }

  get cartCount() {
    return this.page.getByRole('link', { name: /^Shopping cart \(\d+\)$/ });
  }
}
