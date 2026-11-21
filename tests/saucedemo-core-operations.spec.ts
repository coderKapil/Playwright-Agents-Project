import { expect, test } from '@playwright/test';

test.describe('Authentication', () => {
  test('Sign in with a valid user and sign out', async ({ page }) => {
    // 1. Start in a fresh browser context and navigate to the login page.
    await page.goto('https://www.saucedemo.com/');
    await expect(page.getByRole('textbox', { name: 'Username' })).toBeVisible();
    await expect(page.getByRole('textbox', { name: 'Password' })).toBeVisible();
    await expect(page.getByRole('button', { name: 'Login' })).toBeVisible();

    // 2. Submit an incorrect password.
    await page.getByRole('textbox', { name: 'Username' }).fill('standard_user');
    await page.getByRole('textbox', { name: 'Password' }).fill('incorrect_password');
    await page.getByRole('button', { name: 'Login' }).click();
    await expect(page).toHaveURL('https://www.saucedemo.com/');
    await expect(page.locator('[data-test="error"]')).toBeVisible();

    // 3. Replace the credentials with valid demo credentials and sign in.
    await page.getByRole('textbox', { name: 'Password' }).fill('secret_sauce');
    await page.getByRole('button', { name: 'Login' }).click();
    await expect(page).toHaveURL(/inventory\.html$/);
    await expect(page.getByRole('button', { name: 'Cart, empty' })).toBeVisible();

    // 4. Log out and verify the inventory page is no longer accessible.
    await page.getByRole('button', { name: 'Open Menu' }).click();
    await page.getByRole('button', { name: 'Logout' }).click();
    await expect(page.getByRole('button', { name: 'Login' })).toBeVisible();
    await page.goto('https://www.saucedemo.com/inventory.html');
    await expect(page).toHaveURL('https://www.saucedemo.com/');
    await expect(page.getByRole('button', { name: 'Login' })).toBeVisible();
  });
});

test.describe('Catalog browsing', () => {
  test('Browse products and sort by price', async ({ page }) => {
    // 1. Sign in and open the Products page.
    await page.goto('https://www.saucedemo.com/');
    await page.getByRole('textbox', { name: 'Username' }).fill('standard_user');
    await page.getByRole('textbox', { name: 'Password' }).fill('secret_sauce');
    await page.getByRole('button', { name: 'Login' }).click();
    await expect(page).toHaveURL(/inventory\.html$/);
    await expect(page.locator('.inventory_item')).toHaveCount(6);
    await expect(page.getByLabel('Sort products')).toHaveValue('az');

    // 2. View backpack details and return to the product listing.
    await page
      .locator('.inventory_item')
      .filter({ hasText: 'Sauce Labs Backpack' })
      .locator('.inventory_item_name')
      .click();
    await expect(page.locator('.inventory_details_name')).toHaveText('Sauce Labs Backpack');
    await expect(page.locator('.inventory_details_desc')).toBeVisible();
    await expect(page.locator('.inventory_details_price')).toHaveText('$29.99');
    await expect(page.getByRole('button', { name: 'Add to cart' })).toBeVisible();
    await page.getByRole('button', { name: 'Back to products' }).click();
    await expect(page.locator('.inventory_item')).toHaveCount(6);

    // 3. Sort products by price from low to high.
    await page.getByLabel('Sort products').selectOption('lohi');
    await expect(page.locator('.inventory_item_name').first()).toHaveText('Sauce Labs Onesie');
    await expect(page.locator('.inventory_item_name').last()).toHaveText('Sauce Labs Fleece Jacket');
    const prices = await page.locator('.inventory_item_price').allTextContents();
    const numericPrices = prices.map((price) => Number.parseFloat(price.replace('$', '')));
    expect(numericPrices).toEqual([...numericPrices].sort((a, b) => a - b));
  });
});

test.describe('Cart management', () => {
  test('Add and remove products from the cart', async ({ page }) => {
    // 1. Sign in with an empty cart.
    await page.goto('https://www.saucedemo.com/');
    await page.getByRole('textbox', { name: 'Username' }).fill('standard_user');
    await page.getByRole('textbox', { name: 'Password' }).fill('secret_sauce');
    await page.getByRole('button', { name: 'Login' }).click();
    await expect(page).toHaveURL(/inventory\.html$/);
    await expect(page.getByRole('button', { name: 'Cart, empty' })).toBeVisible();

    // 2. Add the backpack and bike light to the cart.
    await page.locator('[data-test="add-to-cart-sauce-labs-backpack"]').click();
    await page.locator('[data-test="add-to-cart-sauce-labs-bike-light"]').click();
    await expect(page.locator('.shopping_cart_badge')).toHaveText('2');

    // 3. Open the cart and verify both products.
    await page.locator('.shopping_cart_link').click();
    await expect(page).toHaveURL(/cart\.html$/);
    await expect(page.locator('.cart_item')).toHaveCount(2);
    await expect(page.locator('.cart_item').filter({ hasText: 'Sauce Labs Backpack' })).toContainText('1');
    await expect(page.locator('.cart_item').filter({ hasText: 'Sauce Labs Bike Light' })).toContainText('1');

    // 4. Remove the backpack and verify the remaining cart contents.
    await page.locator('[data-test="remove-sauce-labs-backpack"]').click();
    await expect(page.locator('.cart_item')).toHaveCount(1);
    await expect(page.locator('.cart_item')).toContainText('Sauce Labs Bike Light');
    await expect(page.locator('.cart_item')).not.toContainText('Sauce Labs Backpack');
    await expect(page.locator('.shopping_cart_badge')).toHaveText('1');

    // 5. Continue shopping and confirm the remaining item is retained.
    await page.getByRole('button', { name: 'Continue Shopping' }).click();
    await expect(page).toHaveURL(/inventory\.html$/);
    await page.locator('.shopping_cart_link').click();
    await expect(page.locator('.cart_item')).toHaveCount(1);
    await expect(page.locator('.cart_item')).toContainText('Sauce Labs Bike Light');
  });
});

test.describe('Checkout validation and review', () => {
  test('Validate checkout information and review order totals', async ({ page }) => {
    // 1. Sign in, add a backpack, and open the cart.
    await page.goto('https://www.saucedemo.com/');
    await page.getByRole('textbox', { name: 'Username' }).fill('standard_user');
    await page.getByRole('textbox', { name: 'Password' }).fill('secret_sauce');
    await page.getByRole('button', { name: 'Login' }).click();
    await page.locator('[data-test="add-to-cart-sauce-labs-backpack"]').click();
    await page.locator('.shopping_cart_link').click();
    await expect(page.locator('.cart_item')).toHaveCount(1);
    await expect(page.locator('.cart_item')).toContainText('Sauce Labs Backpack');

    // 2. Submit the checkout information form without values.
    await page.getByRole('button', { name: 'Checkout' }).click();
    await expect(page).toHaveURL(/checkout-step-one\.html$/);
    await page.getByRole('button', { name: 'Continue' }).click();
    await expect(page).toHaveURL(/checkout-step-one\.html$/);
    await expect(page.locator('[data-test="error"]')).toContainText('First Name is required');

    // 3. Enter valid checkout information and continue to the overview.
    await page.getByRole('textbox', { name: 'First Name' }).fill('Alex');
    await page.getByRole('textbox', { name: 'Last Name' }).fill('Morgan');
    await page.getByRole('textbox', { name: 'Zip/Postal Code' }).fill('10001');
    await page.getByRole('button', { name: 'Continue' }).click();
    await expect(page).toHaveURL(/checkout-step-two\.html$/);
    await expect(page.getByText('Payment Information:')).toBeVisible();
    await expect(page.getByText('Shipping Information:')).toBeVisible();
    await expect(page.locator('.cart_item')).toContainText('Sauce Labs Backpack');

    // 4. Verify the displayed price summary and total.
    await expect(page.locator('.summary_subtotal_label')).toHaveText('Item total: $29.99');
    await expect(page.locator('.summary_tax_label')).toHaveText('Tax: $2.40');
    await expect(page.locator('.summary_total_label')).toHaveText('Total: $32.39');
    expect(29.99 + 2.4).toBeCloseTo(32.39, 2);
  });
});

test.describe('Order placement', () => {
  test('Complete a purchase and verify confirmation', async ({ page }) => {
    // 1. Sign in, add a bike light, and proceed to checkout.
    await page.goto('https://www.saucedemo.com/');
    await page.getByRole('textbox', { name: 'Username' }).fill('standard_user');
    await page.getByRole('textbox', { name: 'Password' }).fill('secret_sauce');
    await page.getByRole('button', { name: 'Login' }).click();
    await page.locator('[data-test="add-to-cart-sauce-labs-bike-light"]').click();
    await page.locator('.shopping_cart_link').click();
    await expect(page.locator('.cart_item')).toContainText('Sauce Labs Bike Light');
    await page.getByRole('button', { name: 'Checkout' }).click();
    await expect(page).toHaveURL(/checkout-step-one\.html$/);

    // 2. Enter valid checkout information and review the order.
    await page.getByRole('textbox', { name: 'First Name' }).fill('Alex');
    await page.getByRole('textbox', { name: 'Last Name' }).fill('Morgan');
    await page.getByRole('textbox', { name: 'Zip/Postal Code' }).fill('10001');
    await page.getByRole('button', { name: 'Continue' }).click();
    await expect(page).toHaveURL(/checkout-step-two\.html$/);
    await expect(page.locator('.cart_item')).toContainText('Sauce Labs Bike Light');
    await expect(page.locator('.summary_subtotal_label')).toHaveText('Item total: $9.99');

    // 3. Finish the order and verify the confirmation.
    await page.getByRole('button', { name: 'Finish' }).click();
    await expect(page).toHaveURL(/checkout-complete\.html$/);
    await expect(page.getByRole('heading', { name: 'Thank you for your order!' })).toBeVisible();
    await expect(page.getByText(/Your order has been dispatched/)).toBeVisible();

    // 4. Verify the cart is empty and return home.
    await expect(page.getByRole('button', { name: 'Cart, empty' })).toBeVisible();
    await page.getByRole('button', { name: 'Back Home' }).click();
    await expect(page).toHaveURL(/inventory\.html$/);
    await expect(page.getByRole('button', { name: 'Cart, empty' })).toBeVisible();
  });
});
