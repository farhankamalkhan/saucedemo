# SauceDemo Playwright Automation Suite

A comprehensive Playwright automation suite for testing the SauceDemo website (https://www.saucedemo.com/v1/index.html) using Page Object Model (POM) pattern and data-driven testing approaches.

**🚀 Quick Start:**
```bash
npm test                    # Fast parallel execution (34 tests in ~1 min)
npm run test:sequential    # Debug mode execution (34 tests in ~3.5 min)
```

## 🚀 Features

- **Page Object Model (POM)** structure for maintainable test code
- **Data-driven testing** with JSON fixtures
- **Flexible execution modes** - parallel (fast) and sequential (debugging)
- **Multiple browser support** (configured for Google Chrome)
- **Comprehensive test coverage** for login, cart operations, and error scenarios
- **Performance optimized** - parallel execution with 6 workers for CI/CD
- **Debugging friendly** - sequential execution with visual browser mode
- **Detailed reporting** with screenshots and videos on failures
- **MCP (Model Context Protocol) integration** - entire codebase generated via AI prompts

## 📁 Project Structure

```
saucedemo/
├── pages/                  # Page Object Model classes
│   ├── BasePage.js        # Base class with common functionality
│   ├── LoginPage.js       # Login page elements and actions
│   ├── ProductsPage.js    # Products/Inventory page elements and actions
│   └── CartPage.js        # Shopping cart page elements and actions
├── fixtures/              # Test data in JSON format
│   ├── users.json         # User credentials (valid/invalid)
│   └── products.json      # Product information
├── tests/                 # Test specifications
│   ├── login.spec.js      # Data-driven login tests
│   ├── login-failure.spec.js  # Failed login attempt tests
│   └── cart-operations.spec.js # Cart add/edit/delete tests
├── utils/                 # Helper utilities
│   └── TestHelpers.js     # Common test utilities and data loaders
├── playwright.config.js   # Playwright configuration
└── package.json          # Dependencies and scripts
```

## 🛠️ Setup Instructions

### Prerequisites
- Node.js (v18 or higher)
- npm or yarn package manager

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd saucedemo
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Install Playwright browsers**
   ```bash
   npm run install:browsers
   ```

## 🧪 Test Scenarios Covered

### 1. Login Tests (Data-Driven)
- **Valid login scenarios** with multiple user types:
  - Standard User
  - Performance Glitch User  
  - Problem User
- **Session management** testing
- **Page element validation**
- **Logout functionality**

### 2. Login Failure Tests
- **Invalid credentials** testing
- **Empty field validation**
- **Security testing** (SQL injection, XSS prevention)
- **Error message validation**
- **Rate limiting** behavior

### 3. Cart Operations Tests
- **Add products** to cart (single and multiple)
- **Remove products** from cart
- **Cart state persistence** during navigation
- **Cart validation** and item verification
- **Empty cart** handling

## 🎯 Running Tests

### Quick Start
```bash
# Run all tests (parallel by default)
npm test

# Run all tests sequentially (for debugging)
npm run test:sequential
```

### 🚀 Execution Modes

The automation suite supports both parallel and sequential execution modes to optimize for different scenarios:

#### ⚡ Parallel Execution (Default - Recommended)
Tests run simultaneously across multiple workers for maximum speed:

```bash
# Default parallel execution
npm test

# Explicit parallel execution (6 workers)
npm run test:parallel

# Parallel execution for specific suites
npm run test:login          # Login tests in parallel
npm run test:login-failure  # Login failure tests in parallel  
npm run test:cart           # Cart operation tests in parallel
```

**Performance:** ~3x faster execution (8 tests in ~10 seconds vs ~30 seconds)

#### 🐛 Sequential Execution (Debugging Mode)
Tests run one at a time for easier debugging and investigation:

```bash
# All tests sequentially
npm run test:sequential

# Specific test suites sequentially
npm run test:login:sequential         # Login tests only
npm run test:login-failure:sequential # Login failure tests only
npm run test:cart:sequential          # Cart operations only

# Sequential with visible browser
npm run test:sequential:headed
```

**When to Use Sequential Mode:**
- 🐛 **Debugging**: Track issues step-by-step
- 🔍 **Investigation**: Observe test behavior closely
- 🏥 **Troubleshooting**: Avoid parallel execution conflicts
- 📊 **Resource Constrained**: Limited CPU/memory systems
- 👀 **Learning**: Understand test flow and interactions

### 🎮 Interactive & Visual Testing

```bash
# UI Mode - Interactive test runner
npm run test:ui

# Headed Mode - Visible browser execution
npm run test:headed

# Debug Mode - Step-through debugging
npm run test:debug
```

### 🎯 Test Suite Organization

```bash
# Individual test suites (parallel by default)
npm run test:login          # Login functionality tests
npm run test:login-failure  # Failed login scenarios
npm run test:cart           # Cart operations tests

# Browser-specific execution
npm run test:chrome         # Chrome browser only

# Combined execution patterns
npm test -- --grep "login"     # All login-related tests
npm test -- --grep "cart"      # All cart-related tests
npm test -- --headed           # All tests with visible browser
```

### 📊 Performance Comparison

| **Execution Mode** | **Workers** | **Time (34 tests)** | **Best For** |
|-------------------|-------------|---------------------|--------------|
| **Parallel (Default)** | 6 workers | ~1.1 minutes | CI/CD, Regular testing |
| **Sequential** | 1 worker | ~3.5 minutes | Debugging, Investigation |

### 🔧 Advanced Execution Options

```bash
# Custom worker count
npm test -- --workers=2                    # Use 2 workers

# Specific test patterns
npm test -- --grep "Should login"          # Tests matching pattern
npm test -- --grep "cart.*add"             # Regex pattern matching

# Output and reporting
npm test -- --reporter=line               # Different reporter
npm test -- --reporter=json               # JSON output

# Retry and timeout configuration
npm test -- --retries=2                   # Retry failed tests
npm test -- --timeout=60000               # 60 second timeout

# Environment-specific execution
CI=true npm test                          # CI mode (fewer workers)
```

## 📊 Test Reporting

### View Test Reports
```bash
npm run report
```

Test results include:
- **HTML reports** with detailed test results
- **Screenshots** on test failures
- **Video recordings** for failed tests
- **Console logs** and error details

## 🔧 Configuration

### Browser Configuration
Currently configured to use **Google Chrome**. To modify:

1. Edit `playwright.config.js`
2. Update the `projects` section

### Test Data Management
- **User credentials**: `fixtures/users.json`
- **Product data**: `fixtures/products.json`
- **Test helpers**: `utils/TestHelpers.js`

## 📋 Test Data

### Valid Users
- `standard_user` - Standard functionality
- `performance_glitch_user` - Performance testing
- `problem_user` - UI issue testing

### Invalid Users
- Invalid username scenarios
- Invalid password scenarios  
- Empty field scenarios

### Products
6 test products with complete details:
- Sauce Labs Backpack
- Sauce Labs Bike Light
- Sauce Labs Bolt T-Shirt
- Sauce Labs Fleece Jacket
- Sauce Labs Onesie
- Test.allTheThings() T-Shirt (Red)

## 🚦 Best Practices Implemented

### Code Organization
- **Separation of concerns** with POM pattern
- **Reusable components** and utilities
- **Data-driven approach** for scalability
- **Clear naming conventions**

### Test Design
- **Independent test cases**
- **Comprehensive assertions**
- **Error handling** and recovery
- **Performance considerations**

### Reporting & Debugging
- **Detailed logging** with timestamps
- **Screenshot capture** on failures
- **Video recording** for debugging
- **Trace collection** for analysis

## 🔍 Troubleshooting

### Common Issues

1. **Browser Launch Failures**
   - Ensure browsers are installed: `npm run install:browsers`
   - Check system compatibility

2. **Test Timeouts**
   - Increase timeout in `playwright.config.js`
   - Check network connectivity

3. **Element Not Found**
   - Verify selectors in page objects
   - Check if page loaded completely

### Debug Mode
```bash
# Run specific failing test in debug mode
npm run test:debug -- tests/login.spec.js --grep "specific test name"
```

## 📈 CI/CD Integration

The test suite is configured for CI/CD with:
- **Retry mechanism** for flaky tests
- **Parallel execution** for faster runs
- **Artifact collection** (reports, screenshots, videos)
- **Multiple environment support**

## 🤖 MCP Integration

This entire automation suite was generated using **Model Context Protocol (MCP)** through AI prompts, demonstrating:
- **Rapid test automation** development
- **Best practices** implementation
- **Complete project** structure generation
- **Documentation** creation

## 📝 Contributing

1. Follow existing code patterns
2. Update fixtures for new test data
3. Add tests for new functionality
4. Ensure all tests pass before committing
5. Update documentation as needed

## 🤖 MCP Integration

This project showcases **Model Context Protocol (MCP)** capabilities - the entire codebase was generated through AI prompts and intelligent tooling.

📖 **For complete MCP documentation**: See [MCP-ACHIEVEMENT-SUMMARY.md](MCP-ACHIEVEMENT-SUMMARY.md)

**Key MCP Highlights:**
- **100% AI-Generated Code**: 2000+ lines via natural language prompts
- **Zero Manual Coding**: Complete automation suite from conversational AI
- **Real-time Problem Solving**: Live debugging and optimization
- **Production Quality**: Enterprise-grade stability achieved through AI

## 📄 License

MIT License - see LICENSE file for details

## 🆘 Support

For issues and questions:
1. Check the troubleshooting section
2. Review test reports and logs
3. Check browser compatibility
4. Verify test data and fixtures

---

**Generated with ❤️ using Playwright and MCP**
