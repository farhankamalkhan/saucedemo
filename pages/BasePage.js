/**
 * Base Page class that contains common functionality for all page objects
 */
class BasePage {
  /**
   * Constructor for Base Page
   * @param {import('@playwright/test').Page} page - Playwright page object
   */
  constructor(page) {
    this.page = page;
  }

  /**
   * Navigate to a specific URL
   * @param {string} url - URL to navigate to
   */
  async goto(url) {
    await this.page.goto(url);
  }

  /**
   * Wait for page to load completely
   */
  async waitForPageLoad() {
    await this.page.waitForLoadState('networkidle');
  }

  /**
   * Get page title
   * @returns {Promise<string>} - Page title
   */
  async getPageTitle() {
    return await this.page.title();
  }

  /**
   * Wait for element to be visible
   * @param {string} selector - Element selector
   * @param {number} timeout - Timeout in milliseconds (default: 30000)
   */
  async waitForElementVisible(selector, timeout = 30000) {
    await this.page.waitForSelector(selector, { state: 'visible', timeout });
  }

  /**
   * Check if element is visible
   * @param {string} selector - Element selector
   * @returns {Promise<boolean>} - True if element is visible
   */
  async isElementVisible(selector) {
    try {
      await this.page.waitForSelector(selector, { state: 'visible', timeout: 5000 });
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Get text content of an element
   * @param {string} selector - Element selector
   * @returns {Promise<string>} - Text content
   */
  async getElementText(selector) {
    await this.waitForElementVisible(selector);
    const text = await this.page.textContent(selector);
    return text ? text.trim() : '';
  }

  /**
   * Click on an element
   * @param {string} selector - Element selector
   */
  async clickElement(selector) {
    await this.waitForElementVisible(selector);
    await this.page.click(selector);
    // Small timeout to allow DOM updates after click
    await this.page.waitForTimeout(300);
  }

  /**
   * Fill input field
   * @param {string} selector - Element selector
   * @param {string} value - Value to fill
   */
  async fillInput(selector, value) {
    await this.waitForElementVisible(selector);
    await this.page.fill(selector, value);
    // Small timeout to allow input processing
    await this.page.waitForTimeout(200);
  }

  /**
   * Get current URL
   * @returns {Promise<string>} - Current URL
   */
  async getCurrentUrl() {
    return this.page.url();
  }
}

module.exports = BasePage;
