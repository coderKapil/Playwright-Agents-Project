import { expect, test } from '@playwright/test';
import { CartPage } from '../specs/pages/CartPage';
import { CatalogPage } from '../specs/pages/CatalogPage';
import { CheckoutPage } from '../specs/pages/CheckoutPage';
import { LoginPage } from '../specs/pages/LoginPage';
import { OrdersPage } from '../specs/pages/OrdersPage';
import { ProductPage } from '../specs/pages/ProductPage';
import { RegisterPage } from '../specs/pages/RegisterPage';
import { SearchResultsPage } from '../specs/pages/SearchResultsPage';

const baseURL = 'https://demowebshop.tricentis.com';
const productName = 'Computing and Internet';
const testPassword = 'DemoPass123!';

function uniqueTestEmail(): string {
  return `pw-${Date.now()}-${Math.random().toString(36).slice(2, 8)}@example.com`;
}

test.use({ baseURL });

test.describe('Account registration', () => {
  test('Register a new customer', async ({ page }) => {
    const registerPage = new RegisterPage(page);
    const loginPage = new LoginPage(page);
    const email = uniqueTestEmail();

    // 1. Open Register and verify the customer registration form.
    await registerPage.open();
    await expect(registerPage.heading).toBeVisible();
    await expect(page.getByRole('radio', { name: 'Male', exact: true })).toBeVisible();
    await expect(page.getByRole('radio', { name: 'Female', exact: true })).toBeVisible();
    await expect(page.getByLabel('First name:')).toBeVisible();
    await expect(page.getByLabel('Last name:')).toBeVisible();
    await expect(page.getByLabel('Email:')).toBeVisible();
    await expect(page.getByLabel('Password:', { exact: true })).toBeVisible();
    await expect(page.getByLabel('Confirm password:')).toBeVisible();

    // 2. Submit without required values and verify validation prevents registration.
    await registerPage.submit();
    await expect(registerPage.validationMessages.first()).toBeVisible();

    // 3. Complete the form with a unique email and matching passwords.
    await registerPage.fillDetails({
      firstName: 'Demo',
      lastName: 'Customer',
      email,
      password: testPassword,
    });
    await registerPage.submit();
    await expect(page.getByText('Your registration completed', { exact: false })).toBeVisible();
    await expect(page.getByRole('link', { name: email })).toBeVisible();

    // 4. Log out and verify the same email cannot be registered twice.
    await loginPage.logout();
    await registerPage.open();
    await registerPage.fillDetails({
      firstName: 'Demo',
      lastName: 'Customer',
      email,
      password: testPassword,
    });
    await registerPage.submit();
    await expect(registerPage.validationMessages.first()).toBeVisible();
  });
});

test.describe('Customer sign-in and sign-out', () => {
  test('Sign in with valid credentials and sign out', async ({ page }) => {
    const registerPage = new RegisterPage(page);
    const loginPage = new LoginPage(page);
    const email = uniqueTestEmail();

    // Create a dedicated account so the sign-in scenario is self-contained.
    await registerPage.open();
    await registerPage.fillDetails({
      firstName: 'Demo',
      lastName: 'Customer',
      email,
      password: testPassword,
    });
    await registerPage.submit();
    await expect(page.getByText('Your registration completed', { exact: false })).toBeVisible();
    await loginPage.logout();

    // 1. Open the login page and submit with both fields empty.
    await loginPage.open();
    await loginPage.loginButton.click();
    await expect(loginPage.loginError.first()).toBeVisible();

    // 2. Submit an incorrect password and verify authentication is rejected.
    await loginPage.login(email, 'incorrect-password');
    await expect(loginPage.loginError.first()).toBeVisible();

    // 3. Sign in with the dedicated valid test account.
    await loginPage.login(email, testPassword);
    await expect(page.getByRole('link', { name: email, exact: true })).toBeVisible();
    await expect(page.getByRole('link', { name: 'Log out', exact: true })).toBeVisible();

    // 4. Sign out and verify anonymous navigation is restored.
    await loginPage.logout();
    await expect(page.getByRole('link', { name: 'Register', exact: true })).toBeVisible();
    await expect(page.getByRole('link', { name: 'Log in', exact: true })).toBeVisible();
  });
});

test.describe('Product browsing and search', () => {
  test('Browse a category and find a product', async ({ page }) => {
    const catalogPage = new CatalogPage(page);
    const searchPage = new SearchResultsPage(page);
    const productPage = new ProductPage(page);

    // 1. Open Books and verify the category's browsing controls.
    await catalogPage.openBooks();
    await expect(catalogPage.title).toBeVisible();
    await expect(catalogPage.products.first()).toBeVisible();
    await expect(catalogPage.viewSelector).toBeVisible();
    await expect(catalogPage.sortSelector).toBeVisible();
    await expect(catalogPage.displaySelector).toBeVisible();
    await expect(page.getByText('Filter by price', { exact: true })).toBeVisible();

    // 2. Sort the catalog by ascending price and verify the prices are ordered.
    await catalogPage.sortByPriceAscending();
    const prices = (await catalogPage.prices.allTextContents())
      .map((price) => Number.parseFloat(price.replace(/[^\d.]/g, '')))
      .filter((price) => Number.isFinite(price));
    expect(prices.length).toBeGreaterThan(1);
    expect(prices).toEqual([...prices].sort((a, b) => a - b));

    // 3. Search for the Computing and Internet product.
    await searchPage.search(productName);
    await expect(searchPage.product(productName)).toBeVisible();

    // 4. Open the product and verify its purchase details.
    await searchPage.product(productName).click();
    await expect(page.getByRole('heading', { name: productName, exact: true })).toBeVisible();
    await expect(productPage.availability).toBeVisible();
    await expect(page.getByText('Price: 10.00', { exact: true })).toBeVisible();
    await expect(productPage.quantity).toBeVisible();
    await expect(productPage.addToCartButton).toBeVisible();

    // 5. Search for an unlikely term and verify that no matching product is returned.
    await searchPage.search(`no-such-product-${Date.now()}`);
    await expect(searchPage.noResults).toBeVisible();
    await expect(searchPage.results).toHaveCount(0);
  });
});

test.describe('Shopping cart management', () => {
  test('Add, update, and remove a cart item', async ({ page }) => {
    const productPage = new ProductPage(page);
    const cartPage = new CartPage(page);

    // 1. Add two units of Computing and Internet to the cart.
    await productPage.openComputingAndInternet();
    await productPage.addToCart(2);
    await expect(productPage.addToCartNotification).toBeVisible();
    await expect(productPage.addToCartNotification).toContainText(/added/i);
    await expect(cartPage.cartCount).toContainText('(2)');

    // 2. Verify the product quantity and line total in the cart.
    await cartPage.open();
    const productRow = cartPage.item(productName);
    await expect(productRow).toBeVisible();
    await expect(productRow.getByRole('textbox')).toHaveValue('2');
    await expect(productRow).toContainText('20.00');

    // 3. Update the quantity and verify the recalculated total.
    await cartPage.setQuantity(productName, 1);
    await expect(cartPage.item(productName).getByRole('textbox')).toHaveValue('1');
    await expect(cartPage.item(productName)).toContainText('10.00');

    // 4. Remove the product and verify the cart is empty.
    await cartPage.removeItem(productName);
    await expect(cartPage.emptyMessage).toBeVisible();
    await expect(cartPage.cartCount).toContainText('(0)');
  });
});

test.describe('Checkout and order placement', () => {
  test('Complete a purchase using a registered customer', async ({ page }) => {
    const registerPage = new RegisterPage(page);
    const loginPage = new LoginPage(page);
    const productPage = new ProductPage(page);
    const cartPage = new CartPage(page);
    const checkoutPage = new CheckoutPage(page);
    const ordersPage = new OrdersPage(page);
    const email = uniqueTestEmail();

    // 1. Register a dedicated account for the checkout flow.
    await registerPage.open();
    await registerPage.fillDetails({
      firstName: process.env.DEMOWEBSHOP_FIRST_NAME ?? 'Demo',
      lastName: process.env.DEMOWEBSHOP_LAST_NAME ?? 'Customer',
      email,
      password: testPassword,
    });
    await registerPage.submit();
    await expect(page.getByText('Your registration completed', { exact: false })).toBeVisible();
    await expect(page.getByRole('link', { name: email, exact: true })).toBeVisible();

    // 2. Add the in-stock item and proceed to checkout.
    await productPage.openComputingAndInternet();
    await productPage.addToCart(1);
    await expect(productPage.addToCartNotification).toBeVisible();
    await expect(productPage.addToCartNotification).toContainText(/added/i);
    await cartPage.open();
    await expect(cartPage.item(productName)).toBeVisible();
    await cartPage.proceedToCheckout();
    await expect(checkoutPage.heading).toBeVisible();

    // 3. Complete the billing, shipping, and payment steps using available options.
    if (await checkoutPage.billingHeading.isVisible()) {
      const firstName = page.getByLabel('First name:');
      if (await firstName.isVisible()) {
        await checkoutPage.fillBillingAddress({
          firstName: process.env.DEMOWEBSHOP_FIRST_NAME ?? 'Demo',
          lastName: process.env.DEMOWEBSHOP_LAST_NAME ?? 'Customer',
          email,
          country: process.env.DEMOWEBSHOP_COUNTRY ?? 'United States',
          city: process.env.DEMOWEBSHOP_CITY ?? 'New York',
          address: process.env.DEMOWEBSHOP_ADDRESS ?? '1 Test Street',
          postalCode: process.env.DEMOWEBSHOP_POSTAL_CODE ?? '10001',
          phone: process.env.DEMOWEBSHOP_PHONE ?? '2125550100',
        });
      }
      await checkoutPage.continueBilling();
    }
    if (await checkoutPage.shippingHeading.isVisible()) {
      await checkoutPage.selectShippingAddress();
    }
    if (await checkoutPage.shippingMethodHeading.isVisible()) {
      await checkoutPage.continueShippingMethod();
    }
    if (await checkoutPage.paymentMethodHeading.isVisible()) {
      await checkoutPage.continuePaymentMethod();
    }
    const paymentInformation = page.getByRole('heading', { name: 'Payment information' });
    if (await paymentInformation.isVisible()) {
      await checkoutPage.continuePaymentInformation();
    }

    // 4. Review the selected item and total, then place the order.
    await expect(checkoutPage.confirmHeading).toBeVisible();
    await expect(page.getByRole('row').filter({ hasText: productName }).last()).toBeVisible();
    await expect(page.getByText(/Total:/).last()).toBeVisible();
    await checkoutPage.confirmOrder();
    await expect(checkoutPage.orderCompleteHeading).toBeVisible();
    await expect(checkoutPage.orderNumber).toBeVisible();
    const orderReference = (await checkoutPage.orderNumber.textContent())?.trim() ?? '';
    expect(orderReference).toMatch(/Order number:/);

    // 5. Verify the placed order is listed in the customer's order history.
    await ordersPage.open();
    await expect(ordersPage.ordersHeading).toBeVisible();
    await expect(ordersPage.order(orderReference)).toBeVisible();
  });
});
