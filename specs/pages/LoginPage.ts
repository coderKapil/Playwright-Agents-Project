import { Page } from '@playwright/test';

export class LoginPage {
  constructor(private readonly page: Page) {}

  get email() {
    return this.page.getByLabel('Email:');
  }

  get password() {
    return this.page.getByLabel('Password:');
  }

  get loginButton() {
    return this.page.getByRole('button', { name: 'Log in', exact: true });
  }

  get loginError() {
    return this.page.locator(
      '.validation-summary-errors:visible, .field-validation-error:visible, .message-error:visible',
    );
  }

  async open(): Promise<void> {
    await this.page.goto('/login');
  }

  async login(email: string, password: string): Promise<void> {
    await this.email.fill(email);
    await this.password.fill(password);
    await this.loginButton.click();
  }

  async logout(): Promise<void> {
    await this.page.getByRole('link', { name: 'Log out', exact: true }).click();
  }
}
