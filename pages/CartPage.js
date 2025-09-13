const BasePage = require('./BasePage');

/**
 * Cart Page Object Model
 * Contains all elements and actions related to the shopping cart page
 */
class CartPage extends BasePage {
  constructor(page) {
    super(page);
    
    // Page elements
    this.pageTitle = '.header_label';
    this.cartList = '.cart_list';
    this.cartItems = '.cart_item';
    this.cartItemNames = '.inventory_item_name';
    this.cartItemPrices = '.inventory_item_price';
    this.cartItemDescriptions = '.inventory_item_desc';
    this.cartQuantities = '.cart_quantity';
    this.removeButtons = '.cart_item .btn_secondary';
    this.continueShoppingButton = '.cart_footer .btn_secondary';
    this.checkoutButton = '.cart_footer .btn_action';
    this.cartFooter = '.cart_footer';
    this.emptyCart = '.cart_list';
    
    // URLs
    this.cartUrl = '/v1/cart.html';
  }

  /**
   * Check if cart page is loaded
   * @returns {Promise<boolean>} - True if cart page is loaded
   */
  async isCartPageLoaded() {
    // Check if we're on the cart page by URL and cart_list presence
    const currentUrl = await this.getCurrentUrl();
    const hasCartList = await this.isElementVisible(this.cartList);
    return currentUrl.includes('cart.html') && hasCartList;
  }

  /**
   * Get page title text
   * @returns {Promise<string>} - Page title
   */
  async getPageTitle() {
    // Cart page doesn't have a visible title, return consistent title
    const currentUrl = await this.getCurrentUrl();
    if (currentUrl.includes('cart.html')) {
      return 'Your Cart';
    }
    return await this.getElementText(this.pageTitle);
  }

  /**
   * Get all cart item names
   * @returns {Promise<Array<string>>} - Array of item names in cart
   */
  async getCartItemNames() {
    if (await this.isElementVisible(this.cartItemNames)) {
      const elements = await this.page.locator(this.cartItemNames).all();
      const names = [];
      for (const element of elements) {
        names.push(await element.textContent());
      }
      return names;
    }
    return [];
  }

  /**
   * Get all cart item prices
   * @returns {Promise<Array<string>>} - Array of item prices in cart
   */
  async getCartItemPrices() {
    if (await this.isElementVisible(this.cartItemPrices)) {
      const elements = await this.page.locator(this.cartItemPrices).all();
      const prices = [];
      for (const element of elements) {
        prices.push(await element.textContent());
      }
      return prices;
    }
    return [];
  }

  /**
   * Get all cart item quantities
   * @returns {Promise<Array<string>>} - Array of item quantities in cart
   */
  async getCartItemQuantities() {
    if (await this.isElementVisible(this.cartQuantities)) {
      const elements = await this.page.locator(this.cartQuantities).all();
      const quantities = [];
      for (const element of elements) {
        quantities.push(await element.textContent());
      }
      return quantities;
    }
    return [];
  }

  /**
   * Get cart item count
   * @returns {Promise<number>} - Number of items in cart
   */
  async getCartItemCount() {
    const items = await this.page.locator(this.cartItems).all();
    return items.length;
  }

  /**
   * Remove item from cart by name
   * @param {string} itemName - Name of the item to remove
   */
  async removeItemFromCart(itemName) {
    // Find the cart item by name and click its remove button
    const cartItem = this.page.locator('.cart_item', { hasText: itemName });
    const removeButton = cartItem.locator('.btn_secondary');
    await removeButton.click();
    // Wait for cart update
    await this.page.waitForTimeout(500);
  }

  /**
   * Remove item from cart by index (0-based)
   * @param {number} index - Index of the item to remove
   */
  async removeItemFromCartByIndex(index) {
    const removeButtons = await this.page.locator(this.removeButtons).all();
    if (index < removeButtons.length) {
      await removeButtons[index].click();
      // Wait for cart update
      await this.page.waitForTimeout(500);
    } else {
      throw new Error(`Item index ${index} is out of range`);
    }
  }

  /**
   * Check if item is in cart
   * @param {string} itemName - Name of the item
   * @returns {Promise<boolean>} - True if item is in cart
   */
  async isItemInCart(itemName) {
    const itemNames = await this.getCartItemNames();
    return itemNames.includes(itemName);
  }

  /**
   * Get cart item details by name
   * @param {string} itemName - Name of the item
   * @returns {Promise<Object>} - Item details object
   */
  async getCartItemDetails(itemName) {
    const itemSelector = `.cart_item:has(.inventory_item_name:text("${itemName}"))`;
    
    if (await this.isElementVisible(itemSelector)) {
      const nameElement = await this.page.locator(`${itemSelector} .inventory_item_name`);
      const priceElement = await this.page.locator(`${itemSelector} .inventory_item_price`);
      const descElement = await this.page.locator(`${itemSelector} .inventory_item_desc`);
      const quantityElement = await this.page.locator(`${itemSelector} .cart_quantity`);
      
      return {
        name: await nameElement.textContent(),
        price: await priceElement.textContent(),
        description: await descElement.textContent(),
        quantity: await quantityElement.textContent()
      };
    }
    return null;
  }

  /**
   * Continue shopping (go back to products page)
   */
  async continueShopping() {
    await this.clickElement(this.continueShoppingButton);
    // Wait for navigation
    await this.page.waitForTimeout(500);
  }

  /**
   * Proceed to checkout
   */
  async proceedToCheckout() {
    await this.clickElement(this.checkoutButton);
    // Wait for navigation
    await this.page.waitForTimeout(500);
  }

  /**
   * Check if cart is empty
   * @returns {Promise<boolean>} - True if cart is empty
   */
  async isCartEmpty() {
    const itemCount = await this.getCartItemCount();
    return itemCount === 0;
  }

  /**
   * Clear entire cart (remove all items)
   */
  async clearCart() {
    // Keep removing items until cart is empty
    while (await this.getCartItemCount() > 0) {
      // Always click the first available remove button
      const removeButton = this.page.locator(this.removeButtons).first();
      if (await removeButton.isVisible()) {
        await removeButton.click();
        // Wait for the item to be removed from DOM
        await this.page.waitForTimeout(700);
      } else {
        break; // No more remove buttons found
      }
    }
  }

}

module.exports = CartPage;
