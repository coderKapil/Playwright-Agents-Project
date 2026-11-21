import { Page } from '@playwright/test';

export class OrdersPage {
  constructor(private readonly page: Page) {}

  get ordersHeading() {
    return this.page.getByRole('heading', { name: 'My account - Orders', exact: true });
  }

  async open(): Promise<void> {
    await this.page.goto('/customer/orders');
  }

  order(reference: string) {
    return this.page.locator('.order-item').filter({ hasText: reference });
  }
}
