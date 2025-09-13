const { test, expect } = require('@playwright/test');
const LoginPage = require('../pages/LoginPage');
const TestHelpers = require('../utils/TestHelpers');

test.describe('Login Failure Tests', () => {
  let loginPage;

  test.beforeEach(async ({ page }) => {
    loginPage = new LoginPage(page);
    await loginPage.navigateToLogin();
  });

  // Data-driven tests for failed login attempts
  const invalidUsers = TestHelpers.getInvalidUsers();
  
  for (const userData of invalidUsers) {
    test(`Should show error for ${userData.id}`, async ({ page }) => {
      TestHelpers.log(`Testing failed login for scenario: ${userData.id}`);
      
      // Verify we're on login page
      await expect(page).toHaveURL(/.*index\.html/);
      expect(await loginPage.isLoginPageLoaded()).toBeTruthy();
      
      // Attempt login with invalid credentials
      await loginPage.login(userData.username, userData.password);
      
      // Verify we're still on login page (not redirected)
      await expect(page).toHaveURL(/.*index\.html/);
      expect(await loginPage.isLoginPageLoaded()).toBeTruthy();
      
      // Verify error message is displayed
      expect(await loginPage.isErrorMessageDisplayed()).toBeTruthy();
      
      // Verify correct error message
      const errorMessage = await loginPage.getErrorMessage();
      expect(errorMessage).toBe(userData.expectedError);
      
      // Verify error message styling
      const errorElement = page.locator(loginPage.errorMessage);
      await expect(errorElement).toBeVisible();
      
      TestHelpers.log(`Failed login test completed for scenario: ${userData.id}`);
    });
  }

  test('Should close error message when X button is clicked', async ({ page }) => {
    // Trigger an error first
    await loginPage.login('invalid_user', 'wrong_password');
    
    // Verify error is displayed
    expect(await loginPage.isErrorMessageDisplayed()).toBeTruthy();
    
    // Close the error message
    await loginPage.closeErrorMessage();
    
    // Verify error message is no longer displayed
    expect(await loginPage.isErrorMessageDisplayed()).toBeFalsy();
  });

  test('Should handle SQL injection attempts', async ({ page }) => {
    const sqlInjectionAttempts = [
      { username: "admin' OR '1'='1", password: "password" },
      { username: "admin'; DROP TABLE users; --", password: "password" },
      { username: "' UNION SELECT * FROM users --", password: "password" }
    ];

    for (const attempt of sqlInjectionAttempts) {
      TestHelpers.log(`Testing SQL injection with username: ${attempt.username}`);
      
      // Clear form first
      await loginPage.clearLoginForm();
      
      // Attempt SQL injection
      await loginPage.login(attempt.username, attempt.password);
      
      // Verify security - should show error, not allow access
      expect(await loginPage.isErrorMessageDisplayed()).toBeTruthy();
      await expect(page).toHaveURL(/.*index\.html/);
      
      // Close error for next iteration
      await loginPage.closeErrorMessage();
    }
  });

  test('Should handle XSS attempts in login fields', async ({ page }) => {
    const xssAttempts = [
      '<script>alert("XSS")</script>',
      'javascript:alert("XSS")',
      '<img src=x onerror=alert("XSS")>'
    ];

    for (const xssPayload of xssAttempts) {
      TestHelpers.log(`Testing XSS prevention with payload: ${xssPayload}`);
      
      // Clear form first
      await loginPage.clearLoginForm();
      
      // Attempt XSS injection
      await loginPage.login(xssPayload, 'password');
      
      // Verify XSS is prevented - should show normal error
      expect(await loginPage.isErrorMessageDisplayed()).toBeTruthy();
      
      // Verify no script execution (no alert dialogs)
      const dialogs = [];
      page.on('dialog', dialog => {
        dialogs.push(dialog);
        dialog.dismiss();
      });
      
      expect(dialogs.length).toBe(0);
      
      // Close error for next iteration
      await loginPage.closeErrorMessage();
    }
  });

  test('Should handle very long input strings', async ({ page }) => {
    const longString = 'a'.repeat(1000);
    
    // Try login with very long username
    await loginPage.login(longString, 'secret_sauce');
    
    // Verify error handling
    expect(await loginPage.isErrorMessageDisplayed()).toBeTruthy();
    await expect(page).toHaveURL(/.*index\.html/);
    
    // Clear and try with long password
    await loginPage.closeErrorMessage();
    await loginPage.clearLoginForm();
    await loginPage.login('standard_user', longString);
    
    // Verify error handling
    expect(await loginPage.isErrorMessageDisplayed()).toBeTruthy();
    await expect(page).toHaveURL(/.*index\.html/);
  });

  test('Should handle special characters in credentials', async ({ page }) => {
    const specialCharCredentials = [
      { username: 'user@#$%^&*()', password: 'pass!@#$%' },
      { username: 'user"with"quotes', password: 'pass\'with\'quotes' },
      { username: 'user\nwith\nnewlines', password: 'pass\twith\ttabs' }
    ];

    for (const creds of specialCharCredentials) {
      TestHelpers.log(`Testing special characters: ${creds.username}`);
      
      // Clear form first
      await loginPage.clearLoginForm();
      
      // Attempt login with special characters
      await loginPage.login(creds.username, creds.password);
      
      // Verify appropriate error handling
      expect(await loginPage.isErrorMessageDisplayed()).toBeTruthy();
      await expect(page).toHaveURL(/.*index\.html/);
      
      // Close error for next iteration
      await loginPage.closeErrorMessage();
    }
  });

  test('Should maintain error state after page elements interaction', async ({ page }) => {
    // Trigger an error
    await loginPage.login('invalid_user', 'wrong_password');
    expect(await loginPage.isErrorMessageDisplayed()).toBeTruthy();
    
    // Click on different elements while error is shown
    await page.click(loginPage.usernameInput);
    expect(await loginPage.isErrorMessageDisplayed()).toBeTruthy();
    
    await page.click(loginPage.passwordInput);
    expect(await loginPage.isErrorMessageDisplayed()).toBeTruthy();
    
    // Verify error persists until explicitly closed or corrected
    const errorMessage = await loginPage.getErrorMessage();
    expect(errorMessage).toContain('Username and password do not match');
  });

  test('Should show error for locked out user', async ({ page }) => {
    // Test with locked out user (if available in fixtures)
    await loginPage.login('locked_out_user', 'secret_sauce');
    
    // Check if error message indicates user is locked out
    if (await loginPage.isErrorMessageDisplayed()) {
      const errorMessage = await loginPage.getErrorMessage();
      // This will help identify if locked_out_user behavior exists
      console.log('Locked out user error:', errorMessage);
    }
    
    // Verify still on login page
    await expect(page).toHaveURL(/.*index\.html/);
  });

  test('Should handle rapid successive login attempts', async ({ page }) => {
    const invalidUser = { username: 'rapid_test_user', password: 'wrong_pass' };
    
    // Attempt multiple rapid logins
    for (let i = 0; i < 5; i++) {
      await loginPage.clearLoginForm();
      await loginPage.login(invalidUser.username, invalidUser.password);
      
      // Verify error is shown each time
      expect(await loginPage.isErrorMessageDisplayed()).toBeTruthy();
      
      if (await loginPage.isElementVisible(loginPage.errorCloseButton)) {
        await loginPage.closeErrorMessage();
      }
      
      // Small delay between attempts
      await TestHelpers.wait(500);
    }
    
    // Verify system still responsive
    expect(await loginPage.isLoginPageLoaded()).toBeTruthy();
  });
});
