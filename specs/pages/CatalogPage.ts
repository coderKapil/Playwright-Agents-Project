import { Page } from '@playwright/test';

export class CatalogPage {
  constructor(private readonly page: Page) {}

  get title() {
    return this.page.getByRole('heading', { name: 'Books', exact: true });
  }

  get viewSelector() {
    return this.page.locator('select').nth(0);
  }

  get sortSelector() {
    return this.page.getByRole('combobox').nth(1);
  }

  get displaySelector() {
    return this.page.getByRole('combobox').nth(2);
  }

  get products() {
    return this.page.locator('.product-item');
  }

  get prices() {
    return this.page.locator('.product-item .prices .actual-price');
  }

  async openBooks(): Promise<void> {
    await this.page.goto('/books');
  }

  async sortByPriceAscending(): Promise<void> {
    await Promise.all([
      this.page.waitForNavigation(),
      this.sortSelector.selectOption({ label: 'Price: Low to High' }),
    ]);
  }
}
