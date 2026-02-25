# Shopping Cart Web App

**Live demo**: https://rsprague216.github.io/Shopping_Cart_Web_App/

A responsive shopping cart application built with React 19 and Vite. Products are fetched from the [Fake Store API](https://fakestoreapi.com/products) and users can browse, filter, view details, and manage a persistent cart.

## Features

- **Product listing** — fetches products from `fakestoreapi.com`, displays image, title, price, description, and star rating
- **Product filtering** — search by keyword and filter by category via a dropdown
- **Product detail page** — dedicated route with full product information
- **Shopping cart** — slide-in sidebar drawer with add, remove, and quantity controls
- **Cart persistence** — cart state is saved to `localStorage` and restored on reload
- **Responsive design** — works on desktop, tablet, and mobile via Tailwind CSS

## Tech Stack

### Production dependencies

| Package | Version | Purpose |
|---|---|---|
| react | 19.2.0 | UI library |
| react-dom | 19.2.0 | DOM renderer |
| react-router-dom | 7.13.1 | Client-side routing |
| tailwindcss | 4.2.1 | Utility-first CSS framework |
| @tailwindcss/vite | 4.2.1 | Tailwind Vite plugin (no config file needed) |
| @headlessui/react | 2.2.9 | Accessible UI primitives (category dropdown) |
| body-scroll-lock | 4.0.0-beta.0 | Prevents background scroll when cart is open |

### Development dependencies

| Package | Version | Purpose |
|---|---|---|
| vite | 7.3.1 | Build tool and dev server |
| @vitejs/plugin-react | 5.1.1 | React Fast Refresh + JSX transform |
| vitest | 4.0.18 | Test runner (Vite-native) |
| @testing-library/react | 16.3.2 | Component rendering for tests |
| @testing-library/user-event | 14.6.1 | User interaction simulation |
| @testing-library/jest-dom | 6.9.1 | Custom DOM matchers |
| jsdom | 28.1.0 | Browser-like DOM environment for tests |
| eslint | 9.39.1 | Linter (flat config) |

## Setup and Running Locally

**Prerequisites**: Node.js 18+ and npm.

```bash
# 1. Clone the repository
git clone https://github.com/rsprague216/Shopping_Cart_Web_App.git
cd Shopping_Cart_Web_App

# 2. Install dependencies
npm install

# 3. Start the development server
npm run dev
```

Then open [http://localhost:5173](http://localhost:5173) in your browser. The dev server supports Hot Module Replacement (HMR) — changes are reflected instantly without a full page reload.

### All available scripts

```bash
npm run dev        # Start dev server with HMR
npm run build      # Production build → dist/
npm run preview    # Serve the production build locally for manual testing
npm run lint       # Run ESLint across the project
npm run test       # Run tests in watch mode (re-runs on file save)
npm run test:run   # Run all tests once and exit (for CI / final check)
```

## Project Structure

```
src/
├── App.jsx                        # Root component, router setup
├── main.jsx                       # React entry point
├── setupTests.js                  # Vitest global setup (jest-dom, fetch/localStorage mocks)
├── hooks/
│   ├── useProducts.js             # Fetches all products from the API
│   └── useProduct.js              # Fetches a single product by ID
└── components/
    ├── layout/
    │   ├── Header.jsx             # Top nav with cart toggle button
    │   └── Main.jsx               # Page layout wrapper
    ├── products/
    │   ├── ProductGrid.jsx        # Renders filtered product grid
    │   ├── ProductCard.jsx        # Individual product card with add-to-cart
    │   ├── ProductDetails.jsx     # Full product detail view
    │   ├── ProductFilters.jsx     # Search input + category dropdown
    │   ├── StarRating.jsx         # Visual star rating component
    │   ├── ProductSkeleton.jsx    # Loading skeleton for product cards
    │   └── ProductDetailsSkeleton.jsx
    └── cart/
        ├── CartProvider.jsx       # Context + useReducer, localStorage persistence
        ├── CartSideBar.jsx        # Slide-in drawer, body scroll lock
        ├── CartItem.jsx           # Cart row with quantity input and remove
        ├── CartRemove.jsx         # Confirmation dialog (portal)
        ├── AddToCartButton.jsx    # Dual-mode: add button or quantity adjuster
        └── useCart.js             # useContext(CartContext) hook
```

## Testing

**Framework**: Vitest 4.0.18 + React Testing Library
**Environment**: jsdom
**Result**: 110 tests across 13 files — all passing

### Run the tests

```bash
# Run all tests once and print a summary
npm run test:run

# Run in watch mode during development
npm run test
```

### Test coverage

| Area | File | Tests |
|---|---|---|
| Product data fetching | `useProducts.test.js` | 4 |
| Single product fetching | `useProduct.test.js` | 6 |
| Header / cart badge | `Header.test.jsx` | 6 |
| Product grid | `ProductGrid.test.jsx` | 3 |
| Product filters | `ProductFilters.test.jsx` | 17 |
| Product card | `ProductCard.test.jsx` | 6 |
| Product detail page | `ProductDetails.test.jsx` | 8 |
| Star rating | `StarRating.test.jsx` | 5 |
| Cart state (reducer + localStorage) | `CartProvider.test.jsx` | 14 |
| Add to cart button | `AddToCartButton.test.jsx` | 9 |
| Cart item row | `CartItem.test.jsx` | 16 |
| Cart remove dialog | `CartRemove.test.jsx` | 4 |
| Cart sidebar | `CartSideBar.test.jsx` | 12 |
| **Total** | | **110** |

Tests are co-located alongside their source files. The test setup (`src/setupTests.js`) provides global mocks for `fetch` and `localStorage` that are reset before each test, ensuring full isolation.
