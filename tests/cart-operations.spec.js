const { test, expect } = require('@playwright/test');
const LoginPage = require('../pages/LoginPage');
const ProductsPage = require('../pages/ProductsPage');
const CartPage = require('../pages/CartPage');
const TestHelpers = require('../utils/TestHelpers');

test.describe('Cart Operations Tests', () => {
  let loginPage;
  let productsPage;
  let cartPage;

  test.beforeEach(async ({ page }) => {
    loginPage = new LoginPage(page);
    productsPage = new ProductsPage(page);
    cartPage = new CartPage(page);
    
    // Login before each test
    await loginPage.navigateToLogin();
    const validUser = TestHelpers.getValidUsers()[0]; // Use standard_user
    await loginPage.login(validUser.username, validUser.password);
    await expect(page).toHaveURL(/.*inventory\.html/);
  });

  test.describe('Add Products to Cart', () => {
    test('Should add single product to cart and validate', async ({ page }) => {
      const testProduct = TestHelpers.getProducts()[0]; // Sauce Labs Backpack
      
      TestHelpers.log(`Adding product to cart: ${testProduct.name}`);
      
      // Verify initial cart state (empty)
      expect(await productsPage.isCartBadgeVisible()).toBeFalsy();
      expect(await productsPage.getCartItemCount()).toBe(0);
      
      // Add product to cart
      await productsPage.addProductToCart(testProduct.name);
      
      // Verify cart badge appears with count 1
      expect(await productsPage.isCartBadgeVisible()).toBeTruthy();
      expect(await productsPage.getCartItemCount()).toBe(1);
      
      // Verify button changed to "Remove"
      expect(await productsPage.isProductInCart(testProduct.name)).toBeTruthy();
      
      // Navigate to cart
      await productsPage.clickShoppingCart();
      await expect(page).toHaveURL(/.*cart\.html/);
      
      // Verify cart page loaded
      expect(await cartPage.isCartPageLoaded()).toBeTruthy();
      expect(await cartPage.getPageTitle()).toBe('Your Cart');
      
      // Verify product is in cart
      expect(await cartPage.isItemInCart(testProduct.name)).toBeTruthy();
      expect(await cartPage.getCartItemCount()).toBe(1);
      
      // Verify cart item details
      const cartItems = await cartPage.getCartItemNames();
      expect(cartItems).toContain(testProduct.name);
      
      const cartPrices = await cartPage.getCartItemPrices();
      expect(cartPrices).toContain(testProduct.price);
      
      // Verify cart summary
      const cartItemCount = await cartPage.getCartItemCount();
      expect(cartItemCount).toBe(1);
      const cartNames = await cartPage.getCartItemNames();
      expect(cartNames[0]).toBe(testProduct.name);
      const cartPricesCheck = await cartPage.getCartItemPrices();
      expect(cartPricesCheck[0]).toBe(testProduct.price);
      
      TestHelpers.log('Single product added to cart successfully');
    });

    test('Should add multiple products to cart', async ({ page }) => {
      const testProducts = TestHelpers.getRandomProducts(3);
      
      TestHelpers.log(`Adding ${testProducts.length} products to cart`);
      
      // Add multiple products
      for (let i = 0; i < testProducts.length; i++) {
        await productsPage.addProductToCart(testProducts[i].name);
        
        // Small delay between additions to prevent race conditions
        await page.waitForTimeout(300);
        
        // Verify cart count increases
        expect(await productsPage.getCartItemCount()).toBe(i + 1);
      }
      
      // Verify final cart count
      expect(await productsPage.getCartItemCount()).toBe(testProducts.length);
      
      // Navigate to cart and verify all products
      await productsPage.clickShoppingCart();
      
      expect(await cartPage.getCartItemCount()).toBe(testProducts.length);
      
      // Verify all products are in cart
      const cartItems = await cartPage.getCartItemNames();
      for (const product of testProducts) {
        expect(cartItems).toContain(product.name);
      }
      
      TestHelpers.log('Multiple products added to cart successfully');
    });

    test('Should add all available products to cart', async ({ page }) => {
      const allProducts = TestHelpers.getProducts();
      
      // Get initial product count on page
      const totalProductsOnPage = await productsPage.getTotalProductCount();
      
      // Add all products by index
      for (let i = 0; i < totalProductsOnPage; i++) {
        await productsPage.addProductToCartByIndex(i);
        // Wait a bit between additions to ensure UI updates
        await page.waitForTimeout(300);
      }
      
      // Verify cart count on products page
      const cartCountOnProducts = await productsPage.getCartItemCount();
      expect(cartCountOnProducts).toBe(totalProductsOnPage);
      
      // Navigate to cart and wait for page to load
      await productsPage.clickShoppingCart();
      await page.waitForURL('**/cart.html');
      await page.waitForTimeout(1000); // Allow cart to fully load
      
      // Verify all products in cart
      const cartItemCount = await cartPage.getCartItemCount();
      expect(cartItemCount).toBe(totalProductsOnPage);
      
      const cartItems = await cartPage.getCartItemNames();
      expect(cartItems.length).toBe(totalProductsOnPage);
    });
  });

  test.describe('Remove Products from Cart', () => {
    let testProducts;
    
    test.beforeEach(async ({ page }) => {
      // Add some products before each removal test
      testProducts = TestHelpers.getRandomProducts(2);
      for (const product of testProducts) {
        await productsPage.addProductToCart(product.name);
      }
    });

    test('Should remove product from products page', async ({ page }) => {
      const initialCartCount = await productsPage.getCartItemCount();
      expect(initialCartCount).toBeGreaterThan(0);
      
      // Remove first product from products page by name
      await productsPage.removeProductFromCart(testProducts[0].name);
      
      // Verify cart count decreased
      const newCartCount = await productsPage.getCartItemCount();
      expect(newCartCount).toBe(initialCartCount - 1);
      
      // Navigate to cart and verify
      await productsPage.clickShoppingCart();
      expect(await cartPage.getCartItemCount()).toBe(newCartCount);
    });

    test('Should remove product from cart page', async ({ page }) => {
      // Navigate to cart
      await productsPage.clickShoppingCart();
      
      const initialCartCount = await cartPage.getCartItemCount();
      expect(initialCartCount).toBeGreaterThan(0);
      
      // Remove first product by name (use the known test product)
      const productToRemove = testProducts[0].name;
      await cartPage.removeItemFromCart(productToRemove);
      
      // Verify item removed
      const newCartCount = await cartPage.getCartItemCount();
      expect(newCartCount).toBe(initialCartCount - 1);
      
      // Verify specific item is no longer in cart
      if (newCartCount > 0) {
        const updatedCartItems = await cartPage.getCartItemNames();
        expect(updatedCartItems).not.toContain(productToRemove);
      }
    });

    test('Should remove all products and verify empty cart', async ({ page }) => {
      // Navigate to cart
      await productsPage.clickShoppingCart();
      
      // Clear entire cart
      await cartPage.clearCart();
      
      // Verify cart is empty
      expect(await cartPage.isCartEmpty()).toBeTruthy();
      expect(await cartPage.getCartItemCount()).toBe(0);
      
      // Go back to products page
      await cartPage.continueShopping();
      await expect(page).toHaveURL(/.*inventory\.html/);
      
      // Verify cart badge is not visible
      expect(await productsPage.isCartBadgeVisible()).toBeFalsy();
      expect(await productsPage.getCartItemCount()).toBe(0);
    });
  });

  test.describe('Cart Operations - Edit/Modify', () => {
    test('Should handle adding same product multiple times', async ({ page }) => {
      const testProduct = TestHelpers.getProducts()[0];
      
      // Add same product multiple times (should not increase quantity in this app)
      await productsPage.addProductToCart(testProduct.name);
      await productsPage.removeProductFromCart(testProduct.name);
      await productsPage.addProductToCart(testProduct.name);
      
      // Verify only one instance in cart
      expect(await productsPage.getCartItemCount()).toBe(1);
      
      await productsPage.clickShoppingCart();
      expect(await cartPage.getCartItemCount()).toBe(1);
      
      // Verify quantity (should be 1 in SauceDemo)
      const quantities = await cartPage.getCartItemQuantities();
      expect(quantities[0]).toBe('1');
    });

    test('Should modify cart contents by removing and adding different products', async ({ page }) => {
      const products = TestHelpers.getRandomProducts(4);
      
      // Add first two products
      await productsPage.addProductToCart(products[0].name);
      await productsPage.addProductToCart(products[1].name);
      expect(await productsPage.getCartItemCount()).toBe(2);
      
      // Remove first product and add two more
      await productsPage.removeProductFromCart(products[0].name);
      await productsPage.addProductToCart(products[2].name);
      await productsPage.addProductToCart(products[3].name);
      
      // Verify final cart state
      expect(await productsPage.getCartItemCount()).toBe(3);
      
      // Navigate to cart and verify specific products
      await productsPage.clickShoppingCart();
      const cartItems = await cartPage.getCartItemNames();
      
      expect(cartItems).not.toContain(products[0].name); // First product removed
      expect(cartItems).toContain(products[1].name);     // Second product still there
      expect(cartItems).toContain(products[2].name);     // Third product added
      expect(cartItems).toContain(products[3].name);     // Fourth product added
    });

    test('Should verify cart persistence during navigation', async ({ page }) => {
      const testProduct = TestHelpers.getProducts()[1];
      
      // Add product to cart
      await productsPage.addProductToCart(testProduct.name);
      
      // Navigate to cart
      await productsPage.clickShoppingCart();
      expect(await cartPage.isItemInCart(testProduct.name)).toBeTruthy();
      
      // Go back to products
      await cartPage.continueShopping();
      await expect(page).toHaveURL(/.*inventory\.html/);
      
      // Verify cart count is maintained
      expect(await productsPage.getCartItemCount()).toBe(1);
      expect(await productsPage.isProductInCart(testProduct.name)).toBeTruthy();
      
      // Navigate to cart again
      await productsPage.clickShoppingCart();
      expect(await cartPage.isItemInCart(testProduct.name)).toBeTruthy();
    });
  });

  test.describe('Cart Validation and Edge Cases', () => {
    test('Should validate cart totals and pricing', async ({ page }) => {
      const testProducts = TestHelpers.getRandomProducts(3);
      let expectedTotal = 0;
      
      // Add products and calculate expected total
      for (const product of testProducts) {
        await productsPage.addProductToCart(product.name);
        expectedTotal += TestHelpers.currencyToNumber(product.price);
      }
      
      // Navigate to cart
      await productsPage.clickShoppingCart();
      
      // Verify individual prices
      const cartPrices = await cartPage.getCartItemPrices();
      let actualTotal = 0;
      for (const price of cartPrices) {
        actualTotal += TestHelpers.currencyToNumber(price);
      }
      
      // Validate totals match
      expect(actualTotal).toBeCloseTo(expectedTotal, 2);
    });

    test('Should handle cart operations with page refresh', async ({ page }) => {
      const testProduct = TestHelpers.getProducts()[2];
      
      // Add product to cart
      await productsPage.addProductToCart(testProduct.name);
      expect(await productsPage.getCartItemCount()).toBe(1);
      
      // Refresh page
      await page.reload();
      await page.waitForLoadState('networkidle');
      
      // Verify cart state maintained after refresh
      expect(await productsPage.getCartItemCount()).toBe(1);
      expect(await productsPage.isProductInCart(testProduct.name)).toBeTruthy();
      
      // Navigate to cart and verify
      await productsPage.clickShoppingCart();
      expect(await cartPage.isItemInCart(testProduct.name)).toBeTruthy();
    });

    test('Should verify cart item details match product details', async ({ page }) => {
      const testProduct = TestHelpers.getProducts()[0];
      
      // Get product details from products page
      const productDetails = await productsPage.getProductDetails(testProduct.name);
      
      // Add product to cart
      await productsPage.addProductToCart(testProduct.name);
      
      // Navigate to cart
      await productsPage.clickShoppingCart();
      
      // Get cart item details
      const cartItemDetails = await cartPage.getCartItemDetails(testProduct.name);
      
      // Verify details match
      expect(cartItemDetails.name).toBe(productDetails.name);
      // Handle price format differences (products page may have $, cart doesn't)
      const productPrice = productDetails.price.replace('$', '');
      const cartPrice = cartItemDetails.price.replace('$', '');
      expect(cartPrice).toBe(productPrice);
      expect(cartItemDetails.description).toBe(productDetails.description);
      expect(cartItemDetails.quantity).toBe('1');
    });

    test('Should verify checkout button availability', async ({ page }) => {
      // Add a product to cart
      const testProduct = TestHelpers.getProducts()[0];
      await productsPage.addProductToCart(testProduct.name);
      
      // Navigate to cart
      await productsPage.clickShoppingCart();
      
      // Verify checkout button is available and clickable
      expect(await cartPage.isElementVisible(cartPage.checkoutButton)).toBeTruthy();
      
      // Test that checkout button leads to checkout page
      await cartPage.proceedToCheckout();
      await expect(page).toHaveURL(/.*checkout-step-one\.html/);
    });

    test('Should validate empty cart state and messaging', async ({ page }) => {
      // Navigate to cart without adding any products
      await productsPage.clickShoppingCart();
      
      // Verify empty cart state
      expect(await cartPage.isCartEmpty()).toBeTruthy();
      expect(await cartPage.getCartItemCount()).toBe(0);
      
      // Verify continue shopping button works
      await cartPage.continueShopping();
      await expect(page).toHaveURL(/.*inventory\.html/);
    });
  });
});
