const BasePage = require('./BasePage');

/**
 * Products Page Object Model
 * Contains all elements and actions related to the products/inventory page
 */
class ProductsPage extends BasePage {
  constructor(page) {
    super(page);
    
    // Page elements
    this.pageTitle = '.header_label';
    this.inventoryContainer = '.inventory_container';
    this.inventoryList = '.inventory_list';
    this.inventoryItems = '.inventory_item';
    this.productNames = '.inventory_item_name';
    this.productPrices = '.inventory_item_price';
    this.productDescriptions = '.inventory_item_desc';
    this.addToCartButtons = '.btn_primary.btn_inventory';
    this.removeFromCartButtons = '.btn_secondary';
    this.shoppingCartLink = '.shopping_cart_link';
    this.shoppingCartBadge = '.shopping_cart_badge';
    this.menuButton = '.bm-burger-button';
    this.logoutLink = '#logout_sidebar_link';
    
    // URLs
    this.productsUrl = '/v1/inventory.html';
  }

  /**
   * Check if products page is loaded
   * @returns {Promise<boolean>} - True if products page is loaded
   */
  async isProductsPageLoaded() {
    return await this.isElementVisible(this.inventoryContainer);
  }

  /**
   * Get page title text
   * @returns {Promise<string>} - Page title
   */
  async getPageTitle() {
    // The title is embedded within the header_secondary_container 
    // along with sort options, so we need to extract just "Products"
    const headerSecondaryText = await this.getElementText('.header_secondary_container');
    if (headerSecondaryText.startsWith('Products')) {
      return 'Products';
    }
    return headerSecondaryText;
  }

  /**
   * Get all product names
   * @returns {Promise<Array<string>>} - Array of product names
   */
  async getAllProductNames() {
    await this.waitForElementVisible(this.productNames);
    const elements = await this.page.locator(this.productNames).all();
    const names = [];
    for (const element of elements) {
      names.push(await element.textContent());
    }
    return names;
  }

  /**
   * Get all product prices
   * @returns {Promise<Array<string>>} - Array of product prices
   */
  async getAllProductPrices() {
    await this.waitForElementVisible(this.productPrices);
    const elements = await this.page.locator(this.productPrices).all();
    const prices = [];
    for (const element of elements) {
      prices.push(await element.textContent());
    }
    return prices;
  }

  /**
   * Add product to cart by name
   * @param {string} productName - Name of the product to add
   */
  async addProductToCart(productName) {
    // Find the product container and click its add to cart button
    const productSelector = `.inventory_item:has(.inventory_item_name:text("${productName}"))`;
    const addButton = `${productSelector} .btn_primary`;
    await this.clickElement(addButton);
    // Additional timeout for cart state update
    await this.page.waitForTimeout(500);
  }

  /**
   * Remove product from cart by name
   * @param {string} productName - Name of the product to remove
   */
  async removeProductFromCart(productName) {
    // Find the product container and click its remove button
    const productSelector = `.inventory_item:has(.inventory_item_name:text("${productName}"))`;
    const removeButton = `${productSelector} .btn_secondary`;
    await this.clickElement(removeButton);
    // Additional timeout for cart state update
    await this.page.waitForTimeout(500);
  }

  /**
   * Add product to cart by index (0-based)
   * @param {number} index - Index of the product to add
   */
  async addProductToCartByIndex(index) {
    // Get all product containers, then find the add button for the specific product
    const productContainers = await this.page.locator(this.inventoryItems).all();
    if (index < productContainers.length) {
      const productContainer = productContainers[index];
      const addButton = productContainer.locator('.btn_primary');
      
      if (await addButton.isVisible()) {
        await addButton.click();
        // Timeout for cart state update
        await this.page.waitForTimeout(500);
      } else {
        // Product might already be in cart
        console.log(`Product at index ${index} might already be in cart`);
      }
    } else {
      throw new Error(`Product index ${index} is out of range. Available products: ${productContainers.length}`);
    }
  }

  /**
   * Remove product from cart by index (0-based)
   * @param {number} index - Index of the product to remove
   */
  async removeProductFromCartByIndex(index) {
    // Get all product containers, then find the remove button for the specific product
    const productContainers = await this.page.locator(this.inventoryItems).all();
    if (index < productContainers.length) {
      const productContainer = productContainers[index];
      const removeButton = productContainer.locator('.btn_secondary');
      
      if (await removeButton.isVisible()) {
        await removeButton.click();
        // Timeout for cart state update
        await this.page.waitForTimeout(500);
      } else {
        // Product might not be in cart
        console.log(`Product at index ${index} might not be in cart`);
      }
    } else {
      throw new Error(`Product index ${index} is out of range. Available products: ${productContainers.length}`);
    }
  }

  /**
   * Get shopping cart item count
   * @returns {Promise<number>} - Number of items in cart
   */
  async getCartItemCount() {
    if (await this.isElementVisible(this.shoppingCartBadge)) {
      const badgeText = await this.getElementText(this.shoppingCartBadge);
      return parseInt(badgeText) || 0;
    }
    return 0;
  }

  /**
   * Click shopping cart link
   */
  async clickShoppingCart() {
    await this.clickElement(this.shoppingCartLink);
  }

  /**
   * Check if product is added to cart (button changed to Remove)
   * @param {string} productName - Name of the product
   * @returns {Promise<boolean>} - True if product is in cart
   */
  async isProductInCart(productName) {
    // Find the product container and check if it has a remove button
    try {
      const productSelector = `.inventory_item:has(.inventory_item_name:text("${productName}"))`;
      const removeButton = `${productSelector} .btn_secondary`;
      return await this.isElementVisible(removeButton);
    } catch (error) {
      return false;
    }
  }

  /**
   * Get product details by name
   * @param {string} productName - Name of the product
   * @returns {Promise<Object>} - Product details object
   */
  async getProductDetails(productName) {
    const productSelector = `.inventory_item:has(.inventory_item_name:text("${productName}"))`;
    await this.waitForElementVisible(productSelector);
    
    const nameElement = await this.page.locator(`${productSelector} .inventory_item_name`);
    const priceElement = await this.page.locator(`${productSelector} .inventory_item_price`);
    const descElement = await this.page.locator(`${productSelector} .inventory_item_desc`);
    
    return {
      name: await nameElement.textContent(),
      price: await priceElement.textContent(),
      description: await descElement.textContent()
    };
  }

  /**
   * Logout from the application
   */
  async logout() {
    await this.clickElement(this.menuButton);
    await this.waitForElementVisible(this.logoutLink);
    await this.clickElement(this.logoutLink);
  }

  /**
   * Get total number of products
   * @returns {Promise<number>} - Total number of products
   */
  async getTotalProductCount() {
    const products = await this.page.locator(this.inventoryItems).all();
    return products.length;
  }

  /**
   * Check if shopping cart badge is visible
   * @returns {Promise<boolean>} - True if cart badge is visible
   */
  async isCartBadgeVisible() {
    return await this.isElementVisible(this.shoppingCartBadge);
  }
}

module.exports = ProductsPage;
