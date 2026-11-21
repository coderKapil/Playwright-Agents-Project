# Demo Web Shop E-commerce Test Plan

## Application Overview

Test the five primary customer operations on https://demowebshop.tricentis.com/: registering an account, signing in and out, discovering products, managing the shopping cart, and completing a purchase. Start each scenario from a clean browser state. Use a unique email for registration and dedicated pre-provisioned test credentials plus a valid address for sign-in and checkout. The observed site includes Register and Log in forms, category/search navigation, product pages with quantity and Add to cart controls, and a multi-step cart checkout (Address, Shipping, Payment, Confirm, Complete).

## Test Scenarios

### 1. Account registration

**Seed:** `tests\seed.spec.ts`

#### 1.1. Register a new customer

**File:** `tests\demowebshop\account-registration.spec.ts`

**Steps:**
  1. Open Register from the site header.
    - expect: The registration form displays gender, first name, last name, email, password, and confirm-password fields.
  2. Submit the form with required fields empty.
    - expect: Required-field validation is shown and the account is not created.
  3. Enter a valid name, a unique email address, and matching valid password values; select a gender and submit Register.
    - expect: Registration succeeds and the signed-in customer identity or account page is displayed.
  4. Attempt registration again using the same email address.
    - expect: The duplicate email is rejected with a clear validation message and no duplicate account is created.

### 2. Customer sign-in and sign-out

**Seed:** `tests\seed.spec.ts`

#### 2.1. Sign in with valid credentials and sign out

**File:** `tests\demowebshop\customer-sign-in-sign-out.spec.ts`

**Steps:**
  1. Open Log in and submit the form with both fields empty.
    - expect: The application reports missing credentials and does not authenticate the user.
  2. Enter a valid test-account email and an incorrect password, then submit.
    - expect: The login attempt is rejected with a clear error and the customer remains signed out.
  3. Enter the valid dedicated test-account email and password, then submit Log in.
    - expect: The customer is authenticated and signed-in account controls are shown.
  4. Select Log out.
    - expect: The session ends and the anonymous Register and Log in controls are visible again.

### 3. Product browsing and search

**Seed:** `tests\seed.spec.ts`

#### 3.1. Browse a category and find a product

**File:** `tests\demowebshop\product-browsing-and-search.spec.ts`

**Steps:**
  1. From the home page, open the Books category.
    - expect: The Books category page displays product listings and view, sort, display-count, and price-filter controls.
  2. Sort the category by Price: Low to High.
    - expect: The product listing updates to ascending price order.
  3. Use store search for the exact product name Computing and Internet.
    - expect: Search results include Computing and Internet.
  4. Open the product result.
    - expect: The product detail page shows its name, price, availability, quantity field, and Add to cart control.
  5. Search for an unlikely product term.
    - expect: A no-results message is shown without unrelated products being presented as matches.

### 4. Shopping cart management

**Seed:** `tests\seed.spec.ts`

#### 4.1. Add, update, and remove a cart item

**File:** `tests\demowebshop\shopping-cart-management.spec.ts`

**Steps:**
  1. Open the Computing and Internet product page, enter quantity 2, and select Add to cart.
    - expect: A successful add-to-cart notification is displayed and the header cart count reflects the added quantity.
  2. Open Shopping cart.
    - expect: The cart lists Computing and Internet with quantity 2 and the correct line total.
  3. Change the cart quantity to 1 and update the cart.
    - expect: The displayed quantity and line total recalculate to match one item.
  4. Remove the item from the cart.
    - expect: The cart is empty and the header cart count is zero.

### 5. Checkout and order placement

**Seed:** `tests\seed.spec.ts`

#### 5.1. Complete a purchase using a registered customer

**File:** `tests\demowebshop\checkout-and-order-placement.spec.ts`

**Steps:**
  1. Sign in with a dedicated registered test account that has valid checkout details available.
    - expect: The customer is signed in and checkout can use the test account's address details.
  2. Add an in-stock product to the cart and proceed to checkout.
    - expect: The cart contains the selected item and checkout begins at the Address step.
  3. Select or enter a valid billing address and continue through Shipping and Payment, choosing available options.
    - expect: Each step accepts valid information and advances to the next checkout stage.
  4. Review the order at Confirm, verify the item, quantity, address, and total, then place the order.
    - expect: The purchase completes successfully and a confirmation with an order number or completion message is displayed.
  5. Open the order history from the account area.
    - expect: The newly placed order appears in the customer's order list with a matching order reference.
