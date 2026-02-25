# Shopping Cart Web App

A responsive shopping cart application built with React 19 and Vite. Products are fetched from the [Fake Store API](https://fakestoreapi.com/products) and users can browse, filter, view details, and manage a persistent cart.

## Features

- **Product listing** — fetches products from `fakestoreapi.com`, displays image, title, price, description, and star rating
- **Product filtering** — search by keyword and filter by category via a dropdown
- **Product detail page** — dedicated route with full product information
- **Shopping cart** — slide-in sidebar drawer with add, remove, and quantity controls
- **Cart persistence** — cart state is saved to `localStorage` and restored on reload
- **Responsive design** — works on desktop, tablet, and mobile via Tailwind CSS

## Tech Stack

| Layer | Library / Tool |
|---|---|
| UI | React 19 |
| Build | Vite 7 |
| Routing | React Router 7 |
| Styling | Tailwind CSS 4 (via `@tailwindcss/vite`) |
| UI Components | Headless UI 2 |
| Testing | Vitest 4 + React Testing Library |
| Linting | ESLint 9 (flat config) |

## Getting Started

```bash
npm install
npm run dev
```

Then open [http://localhost:5173](http://localhost:5173).

## Scripts

```bash
npm run dev        # Start dev server with HMR
npm run build      # Production build → dist/
npm run preview    # Preview the production build locally
npm run lint       # Run ESLint
npm run test       # Run tests in watch mode
npm run test:run   # Run tests once and exit
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

110 tests across 13 test files, co-located with source components.

```bash
npm run test:run
```

Test coverage includes:
- Product data fetching (`useProducts`, `useProduct`)
- Add-to-cart behavior and quantity updates (`CartProvider`, `AddToCartButton`)
- Cart totals and item removal (`CartSideBar`, `CartItem`)
- UI components in isolation (`ProductCard`, `ProductFilters`, `StarRating`, etc.)
