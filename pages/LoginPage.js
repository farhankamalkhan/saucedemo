const BasePage = require('./BasePage');

/**
 * Login Page Object Model
 * Contains all elements and actions related to the login page
 */
class LoginPage extends BasePage {
  constructor(page) {
    super(page);
    
    // Page elements
    this.usernameInput = '#user-name';
    this.passwordInput = '#password';
    this.loginButton = '#login-button';
    this.errorMessage = '[data-test="error"]';
    this.errorCloseButton = '.error-button';
    this.loginLogo = '.login_logo';
    this.loginCredentials = '#login_credentials';
    this.loginPassword = '.login_password';
    
    // URLs
    this.loginUrl = '/v1/index.html';
  }

  /**
   * Navigate to login page
   */
  async navigateToLogin() {
    await this.goto(this.loginUrl);
    await this.waitForPageLoad();
  }

  /**
   * Check if login page is loaded
   * @returns {Promise<boolean>} - True if login page is loaded
   */
  async isLoginPageLoaded() {
    return await this.isElementVisible(this.loginButton);
  }

  /**
   * Enter username
   * @param {string} username - Username to enter
   */
  async enterUsername(username) {
    await this.fillInput(this.usernameInput, username);
  }

  /**
   * Enter password
   * @param {string} password - Password to enter
   */
  async enterPassword(password) {
    await this.fillInput(this.passwordInput, password);
  }

  /**
   * Click login button
   */
  async clickLogin() {
    await this.clickElement(this.loginButton);
  }

  /**
   * Perform login with credentials
   * @param {string} username - Username
   * @param {string} password - Password
   */
  async login(username, password) {
    await this.enterUsername(username);
    await this.enterPassword(password);
    await this.clickLogin();
    // Wait for form processing
    await this.page.waitForTimeout(1000);
  }

  /**
   * Get error message text
   * @returns {Promise<string>} - Error message text
   */
  async getErrorMessage() {
    if (await this.isElementVisible(this.errorMessage)) {
      return await this.getElementText(this.errorMessage);
    }
    return '';
  }

  /**
   * Check if error message is displayed
   * @returns {Promise<boolean>} - True if error message is visible
   */
  async isErrorMessageDisplayed() {
    return await this.isElementVisible(this.errorMessage);
  }

  /**
   * Close error message
   */
  async closeErrorMessage() {
    if (await this.isElementVisible(this.errorCloseButton)) {
      await this.clickElement(this.errorCloseButton);
    }
  }

  /**
   * Clear login form
   */
  async clearLoginForm() {
    await this.fillInput(this.usernameInput, '');
    await this.fillInput(this.passwordInput, '');
  }

  /**
   * Check if login logo is visible
   * @returns {Promise<boolean>} - True if logo is visible
   */
  async isLoginLogoVisible() {
    return await this.isElementVisible(this.loginLogo);
  }

  /**
   * Get accepted usernames from the page
   * @returns {Promise<string>} - Accepted usernames text
   */
  async getAcceptedUsernames() {
    if (await this.isElementVisible(this.loginCredentials)) {
      return await this.getElementText(this.loginCredentials);
    }
    return '';
  }

  /**
   * Get password information from the page
   * @returns {Promise<string>} - Password information text
   */
  async getPasswordInfo() {
    if (await this.isElementVisible(this.loginPassword)) {
      return await this.getElementText(this.loginPassword);
    }
    return '';
  }

  /**
   * Check if user is redirected after successful login
   * @returns {Promise<boolean>} - True if redirected to inventory page
   */
  async isRedirectedAfterLogin() {
    try {
      await this.page.waitForURL('**/inventory.html', { timeout: 5000 });
      return true;
    } catch {
      return false;
    }
  }
}

module.exports = LoginPage;
