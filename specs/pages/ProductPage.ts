import { Page } from '@playwright/test';

export class ProductPage {
  constructor(private readonly page: Page) {}

  get quantity() {
    return this.page.getByLabel('Qty:');
  }

  get availability() {
    return this.page.getByText('Availability: In stock', { exact: true });
  }

  get addToCartButton() {
    return this.page.locator('.product-essential').getByRole('button', { name: 'Add to cart' });
  }

  async openComputingAndInternet(): Promise<void> {
    await this.page.goto('/computing-and-internet');
  }

  async addToCart(quantity: number): Promise<void> {
    await this.quantity.fill(String(quantity));
    await this.addToCartButton.click();
  }

  get addToCartNotification() {
    return this.page.locator('.bar-notification');
  }
}
