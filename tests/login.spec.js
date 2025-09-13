const { test, expect } = require('@playwright/test');
const LoginPage = require('../pages/LoginPage');
const ProductsPage = require('../pages/ProductsPage');
const TestHelpers = require('../utils/TestHelpers');

test.describe('Login Tests - Data Driven', () => {
  let loginPage;
  let productsPage;

  test.beforeEach(async ({ page }) => {
    loginPage = new LoginPage(page);
    productsPage = new ProductsPage(page);
    await loginPage.navigateToLogin();
  });

  // Data-driven tests for successful login with multiple users
  const validUsers = TestHelpers.getValidUsers();
  
  for (const userData of validUsers) {
    test(`Should login successfully with ${userData.userType}`, async ({ page }) => {
      TestHelpers.log(`Testing login for user: ${userData.username}`);
      
      // Verify login page is loaded
      await expect(page).toHaveURL(/.*index\.html/);
      expect(await loginPage.isLoginPageLoaded()).toBeTruthy();
      expect(await loginPage.isLoginLogoVisible()).toBeTruthy();
      
      // Perform login
      await loginPage.login(userData.username, userData.password);
      
      // Verify successful login - user should be redirected to inventory page
      await expect(page).toHaveURL(/.*inventory\.html/);
      expect(await loginPage.isRedirectedAfterLogin()).toBeTruthy();
      
      // Verify products page is loaded
      expect(await productsPage.isProductsPageLoaded()).toBeTruthy();
      
      // Verify page title is correct
      const pageTitle = await productsPage.getPageTitle();
      expect(pageTitle).toBe('Products');
      
      // Verify products are displayed
      const productCount = await productsPage.getTotalProductCount();
      expect(productCount).toBeGreaterThan(0);
      
      // Verify products data is loaded
      const productNames = await productsPage.getAllProductNames();
      expect(productNames.length).toBeGreaterThan(0);
      
      const productPrices = await productsPage.getAllProductPrices();
      expect(productPrices.length).toBeGreaterThan(0);
      
      // Verify each product has a valid price format
      for (const price of productPrices) {
        expect(price).toMatch(/^\$\d+\.\d{2}$/);
      }
      
      // Verify shopping cart is accessible
      expect(await productsPage.isElementVisible('.shopping_cart_link')).toBeTruthy();
      
      // Verify menu is accessible
      expect(await productsPage.isElementVisible(productsPage.menuButton)).toBeTruthy();
      
      TestHelpers.log(`Login test completed successfully for user: ${userData.username}`);
    });
  }

  test('Should display login page elements correctly', async ({ page }) => {
    // Verify all login page elements are present
    expect(await loginPage.isLoginLogoVisible()).toBeTruthy();
    expect(await loginPage.isElementVisible(loginPage.usernameInput)).toBeTruthy();
    expect(await loginPage.isElementVisible(loginPage.passwordInput)).toBeTruthy();
    expect(await loginPage.isElementVisible(loginPage.loginButton)).toBeTruthy();
    
    // Verify login credentials and password info are displayed
    const credentialsText = await loginPage.getAcceptedUsernames();
    expect(credentialsText).toContain('standard_user');
    
    const passwordText = await loginPage.getPasswordInfo();
    expect(passwordText).toContain('secret_sauce');
  });

  test('Should maintain session after successful login', async ({ page }) => {
    const testUser = TestHelpers.getValidUsers()[0]; // Use first valid user
    
    // Login
    await loginPage.login(testUser.username, testUser.password);
    await expect(page).toHaveURL(/.*inventory\.html/);
    
    // Navigate to cart and back to verify session persistence
    await productsPage.clickShoppingCart();
    await expect(page).toHaveURL(/.*cart\.html/);
    
    // Go back to products
    await page.goBack();
    await expect(page).toHaveURL(/.*inventory\.html/);
    
    // Verify still logged in
    expect(await productsPage.isProductsPageLoaded()).toBeTruthy();
  });

  test('Should logout successfully', async ({ page }) => {
    const testUser = TestHelpers.getValidUsers()[0];
    
    // Login first
    await loginPage.login(testUser.username, testUser.password);
    await expect(page).toHaveURL(/.*inventory\.html/);
    
    // Logout
    await productsPage.logout();
    
    // Verify redirected to login page
    await expect(page).toHaveURL(/.*index\.html/);
    expect(await loginPage.isLoginPageLoaded()).toBeTruthy();
  });

  test('Should clear form and allow retry after error', async ({ page }) => {
    // Try invalid login first
    await loginPage.login('invalid_user', 'wrong_password');
    
    // Verify error is shown
    expect(await loginPage.isErrorMessageDisplayed()).toBeTruthy();
    
    // Clear form and try valid login
    await loginPage.clearLoginForm();
    
    const validUser = TestHelpers.getValidUsers()[0];
    await loginPage.login(validUser.username, validUser.password);
    
    // Verify successful login
    await expect(page).toHaveURL(/.*inventory\.html/);
    expect(await productsPage.isProductsPageLoaded()).toBeTruthy();
  });

  test('Should handle page refresh after login', async ({ page }) => {
    const testUser = TestHelpers.getValidUsers()[0];
    
    // Login
    await loginPage.login(testUser.username, testUser.password);
    await expect(page).toHaveURL(/.*inventory\.html/);
    
    // Refresh page
    await page.reload();
    
    // Verify still on products page (session maintained)
    expect(await productsPage.isProductsPageLoaded()).toBeTruthy();
  });
});
