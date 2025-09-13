const fs = require('fs');
const path = require('path');

/**
 * Test Helper Utilities
 * Contains common functions and data loading utilities for tests
 */
class TestHelpers {
  /**
   * Load JSON data from fixtures
   * @param {string} filename - Name of the JSON file (without extension)
   * @returns {Object} - Parsed JSON data
   */
  static loadFixture(filename) {
    const filePath = path.join(__dirname, '..', 'fixtures', `${filename}.json`);
    try {
      const data = fs.readFileSync(filePath, 'utf8');
      return JSON.parse(data);
    } catch (error) {
      throw new Error(`Failed to load fixture ${filename}: ${error.message}`);
    }
  }

  /**
   * Get valid users from fixtures
   * @returns {Array} - Array of valid user objects
   */
  static getValidUsers() {
    const usersData = this.loadFixture('users');
    return usersData.validUsers;
  }

  /**
   * Get invalid users from fixtures
   * @returns {Array} - Array of invalid user objects
   */
  static getInvalidUsers() {
    const usersData = this.loadFixture('users');
    return usersData.invalidUsers;
  }

  /**
   * Get products from fixtures
   * @returns {Array} - Array of product objects
   */
  static getProducts() {
    const productsData = this.loadFixture('products');
    return productsData.products;
  }

  /**
   * Get random user from valid users
   * @returns {Object} - Random valid user object
   */
  static getRandomValidUser() {
    const validUsers = this.getValidUsers();
    const randomIndex = Math.floor(Math.random() * validUsers.length);
    return validUsers[randomIndex];
  }

  /**
   * Get random product
   * @returns {Object} - Random product object
   */
  static getRandomProduct() {
    const products = this.getProducts();
    const randomIndex = Math.floor(Math.random() * products.length);
    return products[randomIndex];
  }

  /**
   * Get multiple random products
   * @param {number} count - Number of products to get
   * @returns {Array} - Array of random product objects
   */
  static getRandomProducts(count = 3) {
    const products = this.getProducts();
    const shuffled = [...products].sort(() => 0.5 - Math.random());
    return shuffled.slice(0, Math.min(count, products.length));
  }

  /**
   * Wait for a specified amount of time
   * @param {number} ms - Milliseconds to wait
   */
  static async wait(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  /**
   * Generate random string
   * @param {number} length - Length of the string
   * @returns {string} - Random string
   */
  static generateRandomString(length = 10) {
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let result = '';
    for (let i = 0; i < length; i++) {
      result += characters.charAt(Math.floor(Math.random() * characters.length));
    }
    return result;
  }

  /**
   * Format currency string to number
   * @param {string} currencyString - Currency string (e.g., "$29.99")
   * @returns {number} - Numeric value
   */
  static currencyToNumber(currencyString) {
    return parseFloat(currencyString.replace('$', ''));
  }

  /**
   * Get current timestamp
   * @returns {string} - Current timestamp in ISO format
   */
  static getCurrentTimestamp() {
    return new Date().toISOString();
  }

  /**
   * Create screenshot name with timestamp
   * @param {string} testName - Base test name
   * @returns {string} - Screenshot name with timestamp
   */
  static createScreenshotName(testName) {
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    return `${testName}-${timestamp}`;
  }

  /**
   * Validate email format
   * @param {string} email - Email to validate
   * @returns {boolean} - True if valid email format
   */
  static isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  /**
   * Convert product name to data-test format
   * @param {string} productName - Product name
   * @returns {string} - Data-test formatted name
   */
  static productNameToDataTest(productName) {
    return productName.toLowerCase()
      .replace(/\s+/g, '-')
      .replace(/[()]/g, '')
      .replace(/\./g, '');
  }

  /**
   * Compare arrays (for testing purposes)
   * @param {Array} arr1 - First array
   * @param {Array} arr2 - Second array
   * @returns {boolean} - True if arrays contain same elements
   */
  static arraysEqual(arr1, arr2) {
    if (arr1.length !== arr2.length) return false;
    const sorted1 = [...arr1].sort();
    const sorted2 = [...arr2].sort();
    return sorted1.every((val, index) => val === sorted2[index]);
  }

  /**
   * Create test data for parameterized tests
   * @param {Array} dataArray - Array of data objects
   * @param {string} nameField - Field to use for test name
   * @returns {Array} - Array of [testName, testData] pairs
   */
  static createTestData(dataArray, nameField = 'id') {
    return dataArray.map(item => [item[nameField], item]);
  }

  /**
   * Log test information
   * @param {string} message - Message to log
   * @param {string} level - Log level (info, warn, error)
   */
  static log(message, level = 'info') {
    const timestamp = this.getCurrentTimestamp();
    console.log(`[${timestamp}] [${level.toUpperCase()}] ${message}`);
  }
}

module.exports = TestHelpers;
