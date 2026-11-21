# SauceDemo Core User Operations Test Plan

## Application Overview

Five independent end-user scenarios for SauceDemo covering authentication, catalog browsing and sorting, cart management, checkout information and order review, and successful order placement. Each scenario starts from a fresh browser context with no authenticated session or cart contents. Use the published demo account standard_user / secret_sauce; checkout is a simulated demo transaction.

## Test Scenarios

### 1. Authentication

**Seed:** `tests/seed.spec.ts`

#### 1.1. Sign in with a valid user and sign out

**File:** `tests/authentication.spec.ts`

**Steps:**
  1. Start in a fresh browser context and navigate to https://www.saucedemo.com/.
    - expect: The Swag Labs login form is shown with Username and Password fields and a Login button.
  2. Enter standard_user and an incorrect password, then submit Login.
    - expect: The user remains on the login page and an authentication error is displayed.
  3. Replace the credentials with standard_user and secret_sauce, then submit Login.
    - expect: The Products page opens and the shopping cart is initially empty.
  4. Open the navigation menu and select Logout.
    - expect: The login page is displayed and the authenticated inventory page is no longer accessible in the current session.

### 2. Catalog browsing

**Seed:** `tests/seed.spec.ts`

#### 2.1. Browse products and sort by price

**File:** `tests/catalog-browsing.spec.ts`

**Steps:**
  1. Start from a fresh browser context, sign in as standard_user, and open the Products page.
    - expect: Six products are shown and the default sort is Name (A to Z).
  2. Open Sauce Labs Backpack details and return to the product listing.
    - expect: The product details show the backpack name, description, price, and an add-to-cart action; returning restores the product listing.
  3. Select Price (low to high) from Sort products.
    - expect: The Sauce Labs Onesie ($7.99) is first and Sauce Labs Fleece Jacket ($49.99) is last; the displayed product prices are in ascending order.

### 3. Cart management

**Seed:** `tests/seed.spec.ts`

#### 3.1. Add and remove products from the cart

**File:** `tests/cart-management.spec.ts`

**Steps:**
  1. Start from a fresh browser context and sign in as standard_user.
    - expect: The Products page opens with an empty cart.
  2. Add Sauce Labs Backpack and Sauce Labs Bike Light to the cart.
    - expect: The cart badge shows 2 items.
  3. Open the cart.
    - expect: Your Cart lists both selected products with quantity 1 each.
  4. Remove Sauce Labs Backpack.
    - expect: The backpack is removed, the bike light remains, and the cart badge shows 1.
  5. Select Continue Shopping and reopen the cart.
    - expect: The Products page opens, and the remaining bike light is still present in the cart.

### 4. Checkout validation and review

**Seed:** `tests/seed.spec.ts`

#### 4.1. Validate checkout information and review order totals

**File:** `tests/checkout-review.spec.ts`

**Steps:**
  1. Start from a fresh browser context, sign in as standard_user, add Sauce Labs Backpack, and open the cart.
    - expect: The cart contains one backpack.
  2. Select Checkout and submit the information form without entering any values.
    - expect: The user stays on Checkout: Your Information and sees the error First Name is required.
  3. Enter Alex as First Name, Morgan as Last Name, and 10001 as Zip/Postal Code; select Continue.
    - expect: Checkout: Overview is displayed with the backpack and the payment and shipping information sections.
  4. Review the displayed price summary.
    - expect: Item total is $29.99, tax is $2.40, and total is $32.39; the total equals item total plus tax.

### 5. Order placement

**Seed:** `tests/seed.spec.ts`

#### 5.1. Complete a purchase and verify confirmation

**File:** `tests/order-placement.spec.ts`

**Steps:**
  1. Start from a fresh browser context, sign in as standard_user, add Sauce Labs Bike Light, open the cart, and select Checkout.
    - expect: Checkout: Your Information opens with the selected item retained in the cart.
  2. Enter valid first name, last name, and zip/postal code, then select Continue.
    - expect: Checkout: Overview shows Sauce Labs Bike Light and its price summary.
  3. Select Finish.
    - expect: Checkout: Complete! displays Thank you for your order! and the order-dispatch confirmation message.
  4. Verify the cart badge and select Back Home.
    - expect: The cart is empty and the Products page is displayed.
