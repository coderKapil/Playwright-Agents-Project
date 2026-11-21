import { Page } from '@playwright/test';

export class RegisterPage {
  constructor(private readonly page: Page) {}

  get heading() {
    return this.page.getByRole('heading', { name: 'Register', exact: true });
  }

  async open(): Promise<void> {
    await this.page.goto('/register');
  }

  async submit(): Promise<void> {
    await this.page.getByRole('button', { name: 'Register', exact: true }).click();
  }

  async fillDetails(details: {
    firstName: string;
    lastName: string;
    email: string;
    password: string;
  }): Promise<void> {
    await this.page.getByLabel('First name:').fill(details.firstName);
    await this.page.getByLabel('Last name:').fill(details.lastName);
    await this.page.getByLabel('Email:').fill(details.email);
    await this.page.getByLabel('Password:', { exact: true }).fill(details.password);
    await this.page.getByLabel('Confirm password:').fill(details.password);
    await this.page.getByRole('radio', { name: 'Female' }).check();
  }

  get validationMessages() {
    return this.page.locator(
      '.validation-summary-errors:visible, .field-validation-error:visible, .message-error:visible',
    );
  }
}
