import { Page } from '@playwright/test';

export class CheckoutPage {
  constructor(private readonly page: Page) {}

  get heading() {
    return this.page.getByRole('heading', { name: 'Checkout', exact: true });
  }

  get billingHeading() {
    return this.page.getByRole('heading', { name: 'Billing address' });
  }

  get shippingHeading() {
    return this.page.getByRole('heading', { name: 'Shipping address' });
  }

  get shippingMethodHeading() {
    return this.page.getByRole('heading', { name: 'Shipping method' });
  }

  get paymentMethodHeading() {
    return this.page.getByRole('heading', { name: 'Payment method' });
  }

  get confirmHeading() {
    return this.page.getByRole('heading', { name: 'Confirm order' });
  }

  get orderCompleteHeading() {
    return this.page.getByRole('heading', { name: 'Thank you', exact: true });
  }

  async fillBillingAddress(address: {
    firstName: string;
    lastName: string;
    email: string;
    country: string;
    city: string;
    address: string;
    postalCode: string;
    phone: string;
  }): Promise<void> {
    await this.page.getByLabel('First name:').fill(address.firstName);
    await this.page.getByLabel('Last name:').fill(address.lastName);
    await this.page.getByLabel('Email:').fill(address.email);
    await this.page.getByLabel('Country:').selectOption({ label: address.country });
    await this.page.getByLabel('City:').fill(address.city);
    await this.page.getByLabel('Address 1:').fill(address.address);
    await this.page.getByLabel('Zip / postal code:').fill(address.postalCode);
    await this.page.getByLabel('Phone number:').fill(address.phone);
  }

  async continueBilling(): Promise<void> {
    await this.page.getByRole('button', { name: 'Continue', exact: true }).click();
  }

  async selectShippingAddress(): Promise<void> {
    const shippingSection = this.page.getByRole('listitem').filter({ has: this.shippingHeading });
    const sameAddress = shippingSection.getByRole('checkbox', { name: /same/i });
    if (await sameAddress.isVisible()) {
      await sameAddress.check();
    } else {
      await shippingSection.getByRole('button', { name: 'Continue', exact: true }).click();
    }
  }

  async continueShippingMethod(): Promise<void> {
    await this.page.getByRole('listitem')
      .filter({ has: this.shippingMethodHeading })
      .getByRole('button', { name: 'Continue', exact: true })
      .click();
  }

  async continuePaymentMethod(): Promise<void> {
    await this.page.getByRole('listitem')
      .filter({ has: this.paymentMethodHeading })
      .getByRole('button', { name: 'Continue', exact: true })
      .click();
  }

  async continuePaymentInformation(): Promise<void> {
    await this.page.getByRole('listitem')
      .filter({ has: this.page.getByRole('heading', { name: 'Payment information' }) })
      .getByRole('button', { name: 'Continue', exact: true })
      .click();
  }

  async confirmOrder(): Promise<void> {
    await this.page.getByRole('button', { name: 'Confirm', exact: true }).click();
  }

  get orderNumber() {
    return this.page.getByText(/Order number:/);
  }
}
