# Unit Test Results

**Date**: 2026-02-24
**Framework**: Vitest v4.0.18 + React Testing Library
**Test Environment**: jsdom
**Result**: ✅ All 110 tests passed across 13 test files

---

## Summary

| Metric       | Value  |
|--------------|--------|
| Test Files   | 13     |
| Total Tests  | 110    |
| Passed       | 110    |
| Failed       | 0      |
| Skipped      | 0      |
| Duration     | ~3.5s  |

---

## Results by File

### Hooks

#### `src/hooks/useProducts.test.js` — 4 tests ✅
Tests the `useProducts` custom hook, which fetches the full product list from the Fake Store API.

| Test | Result |
|------|--------|
| returns loading=true and empty products array on initial render | ✅ |
| returns products and loading=false after a successful fetch | ✅ |
| sets error and loading=false when response.ok is false | ✅ |
| sets error and loading=false when fetch throws a network error | ✅ |

---

#### `src/hooks/useProduct.test.js` — 6 tests ✅
Tests the `useProduct` custom hook, which fetches a single product by ID.

| Test | Result |
|------|--------|
| fetches from the correct URL using the provided productId | ✅ |
| returns loading=true and product=null on initial render | ✅ |
| returns product and loading=false after a successful fetch | ✅ |
| sets error and loading=false when response.ok is false | ✅ |
| sets error and loading=false when fetch throws a network error | ✅ |
| re-fetches when productId changes | ✅ |

---

### Layout

#### `src/components/layout/Header.test.jsx` — 6 tests ✅
Tests the `Header` component, including branding display and cart badge behavior.

| Test | Result |
|------|--------|
| renders the ShopBuddy branding | ✅ |
| renders a cart button | ✅ |
| does not show a count badge when the cart is empty | ✅ |
| shows the badge with the correct total quantity when items exist | ✅ |
| shows a badge of 1 for a single item with quantity 1 | ✅ |
| hides the badge when the last item is removed from the cart | ✅ |

---

### Products

#### `src/components/products/ProductGrid.test.jsx` — 3 tests ✅
Tests the `ProductGrid` component, which renders the full product listing page.

| Test | Result |
|------|--------|
| shows skeleton placeholders while products are loading | ✅ |
| renders a card for each product after loading completes | ✅ |
| shows an error message when the fetch fails | ✅ |

---

#### `src/components/products/ProductFilters.test.jsx` — 17 tests ✅
Tests the `ProductFilters` component, which provides a search input and category dropdown for filtering the product grid.

| Group | Test | Result |
|-------|------|--------|
| rendering | renders the search input with the correct placeholder | ✅ |
| rendering | renders the category filter button | ✅ |
| rendering | shows "All Categories" when no category is selected | ✅ |
| rendering | capitalizes and displays the selected category name in the button | ✅ |
| rendering | only capitalizes the first character of a multi-word category name | ✅ |
| search input | reflects the current searchQuery prop value | ✅ |
| search input | calls onSearchChange with the new value when the user types | ✅ |
| search input | calls onSearchChange with an empty string when the input is cleared | ✅ |
| category dropdown | renders an option for each category after opening the dropdown | ✅ |
| category dropdown | always includes an "All Categories" option | ✅ |
| category dropdown | renders the correct total number of options (categories + "All Categories") | ✅ |
| category dropdown | calls onCategoryChange with the raw category value when an option is selected | ✅ |
| category dropdown | calls onCategoryChange with an empty string when "All Categories" is selected | ✅ |
| category dropdown | shows only the "All Categories" option when categories array is empty | ✅ |
| active filter indicator | does not render the active-filter dot when no category is selected | ✅ |
| active filter indicator | renders the active-filter dot when a category is selected | ✅ |
| active filter indicator | removes the active-filter dot when the category is cleared | ✅ |

---

#### `src/components/products/ProductCard.test.jsx` — 6 tests ✅
Tests the `ProductCard` component, which displays a single product in the grid.

| Test | Result |
|------|--------|
| renders the product image with correct src and alt text | ✅ |
| renders the formatted price | ✅ |
| renders a price with two decimal places even when the value is a whole number | ✅ |
| renders the product title | ✅ |
| renders a link to the product detail page | ✅ |
| renders an Add to Cart button | ✅ |

---

#### `src/components/products/ProductDetails.test.jsx` — 8 tests ✅
Tests the `ProductDetails` component, which renders the full single-product detail page.

| Test | Result |
|------|--------|
| shows the skeleton placeholder while the product is loading | ✅ |
| shows an error message when the fetch fails | ✅ |
| renders the product title after loading | ✅ |
| renders the category badge | ✅ |
| renders the formatted price | ✅ |
| renders the product description | ✅ |
| renders an Add to Cart button | ✅ |
| passes the product id from useParams to the useProduct hook | ✅ |

---

#### `src/components/products/StarRating.test.jsx` — 5 tests ✅
Tests the `StarRating` component, which renders a visual star rating using a CSS clip overlay technique.

| Test | Result |
|------|--------|
| renders 5 star SVG icons in both the base and overlay layers | ✅ |
| sets the overlay width to rate * 20% | ✅ |
| displays the numeric rating value and review count text | ✅ |
| handles a perfect rating of 5 (100% overlay width) | ✅ |
| handles a rating of 0 (0% overlay width) | ✅ |

---

### Cart

#### `src/components/cart/CartProvider.test.jsx` — 14 tests ✅
Tests the `CartProvider` context and `useReducer`-based state management, covering all reducer actions and localStorage persistence.

| Group | Test | Result |
|-------|------|--------|
| ADD_ITEM | adds a new item to the cart with quantity 1 | ✅ |
| ADD_ITEM | does not add a duplicate item if the same id already exists | ✅ |
| ADD_ITEM | can add multiple distinct items | ✅ |
| REMOVE_ITEM | removes an item by id, leaving other items intact | ✅ |
| REMOVE_ITEM | is a no-op when the item id does not exist | ✅ |
| UPDATE_QUANTITY | updates the quantity of an existing item | ✅ |
| UPDATE_QUANTITY | clamps quantity to a minimum of 1 when 0 is passed | ✅ |
| UPDATE_QUANTITY | clamps quantity to a maximum of 999 when 1000 is passed | ✅ |
| UPDATE_QUANTITY | does not affect other items when updating one item | ✅ |
| TOGGLE_CART | toggles isOpen from false to true | ✅ |
| TOGGLE_CART | toggles isOpen from true back to false on a second call | ✅ |
| localStorage persistence | writes items to localStorage when items change | ✅ |
| localStorage persistence | loads existing items from localStorage on mount | ✅ |
| localStorage persistence | starts with an empty cart when localStorage contains invalid JSON | ✅ |

---

#### `src/components/cart/AddToCartButton.test.jsx` — 9 tests ✅
Tests the `AddToCartButton` component, which renders as either an "Add to Cart" button or a quantity adjuster depending on cart state.

| Group | Test | Result |
|-------|------|--------|
| item NOT in cart | renders an "Add to Cart" button | ✅ |
| item NOT in cart | switches to the quantity adjuster after clicking "Add to Cart" | ✅ |
| item NOT in cart | shows "Add to Cart" for a product not in cart, even when another product is | ✅ |
| item in cart (qty > 1) | renders the quantity and quantity adjuster instead of the Add to Cart button | ✅ |
| item in cart (qty > 1) | shows a "-" text (not a trash SVG) on the decrement button when qty > 1 | ✅ |
| item in cart (qty > 1) | increments quantity when the + button is clicked | ✅ |
| item in cart (qty > 1) | decrements quantity when the - button is clicked and qty > 1 | ✅ |
| item in cart (qty === 1) | shows a trash SVG icon on the left button when qty is 1 | ✅ |
| item in cart (qty === 1) | removes the item when the left button is clicked at qty=1 | ✅ |

---

#### `src/components/cart/CartItem.test.jsx` — 16 tests ✅
Tests the `CartItem` component, including the quantity input, +/- buttons, the CartRemove confirmation modal, and card-click navigation.

| Group | Test | Result |
|-------|------|--------|
| quantity input | displays the current quantity in the input field | ✅ |
| quantity input | calls onUpdateQuantity with the new value on blur with a valid number | ✅ |
| quantity input | clamps the displayed input to 999 when a value over 999 is entered | ✅ |
| quantity input | reverts the input to the prop quantity when an invalid value is entered on blur | ✅ |
| quantity input | commits the value when the Enter key is pressed | ✅ |
| quantity input | syncs the local input value when the quantity prop changes externally | ✅ |
| +/- buttons | calls onUpdateQuantity with qty+1 when the + button is clicked | ✅ |
| +/- buttons | calls onUpdateQuantity with qty-1 when the - button is clicked and qty > 1 | ✅ |
| +/- buttons | shows the CartRemove modal when the - button is clicked at qty=1 | ✅ |
| CartRemove modal | shows the modal when the trash icon button is clicked | ✅ |
| CartRemove modal | calls onRemove and hides the modal when Remove is confirmed | ✅ |
| CartRemove modal | hides the modal without calling onRemove when Cancel is clicked | ✅ |
| card click navigation | calls onClose and navigates to /products/:id when the card title is clicked | ✅ |
| card click navigation | does NOT navigate when the + button is clicked (stopPropagation) | ✅ |
| card click navigation | does NOT navigate when the - button is clicked (stopPropagation) | ✅ |
| card click navigation | does NOT navigate when the quantity input is clicked (stopPropagation) | ✅ |

---

#### `src/components/cart/CartRemove.test.jsx` — 4 tests ✅
Tests the `CartRemove` confirmation modal component, which is rendered as a portal and prompts the user before removing a cart item.

| Test | Result |
|------|--------|
| renders the product title in the confirmation message | ✅ |
| calls onRemove with the item id when the Remove button is clicked | ✅ |
| calls onCancel when the Cancel button is clicked | ✅ |
| does NOT call onRemove when the Cancel button is clicked | ✅ |

---

#### `src/components/cart/CartSideBar.test.jsx` — 12 tests ✅
Tests the `CartSideBar` component, covering empty/populated cart display, checkout button state, open/close behavior, and body scroll locking.

| Group | Test | Result |
|-------|------|--------|
| empty cart state | shows "Your cart is empty" message when there are no items | ✅ |
| empty cart state | displays a total of $0.00 when the cart is empty | ✅ |
| empty cart state | renders the checkout button in a disabled state when cart is empty | ✅ |
| cart with items | renders a CartItem for each item in the cart | ✅ |
| cart with items | calculates and displays the correct total price across multiple items | ✅ |
| cart with items | renders the checkout button as enabled when the cart has items | ✅ |
| checkout button | shows an alert when the checkout button is clicked | ✅ |
| open/close behavior | closes when the backdrop overlay is clicked | ✅ |
| open/close behavior | closes when the Escape key is pressed while the cart is open | ✅ |
| open/close behavior | does NOT close when the Escape key is pressed while the cart is already closed | ✅ |
| body scroll lock | calls disableBodyScroll when the cart opens | ✅ |
| body scroll lock | calls enableBodyScroll when the cart closes | ✅ |

---

## Test Infrastructure

| Item | Detail |
|------|--------|
| Test runner | Vitest v4.0.18 |
| Component rendering | @testing-library/react |
| User interactions | @testing-library/user-event |
| DOM assertions | @testing-library/jest-dom |
| DOM environment | jsdom |
| Setup file | `src/setupTests.js` |
| Test config | `vite.config.js` (`test.environment: 'jsdom'`, `test.globals: true`) |
| Test co-location | Tests live alongside the source files they cover |
| `fetch` mock | Global `vi.fn()`, reset before each test |
| `localStorage` mock | Custom IIFE mock, cleared before each test |
| `ResizeObserver` stub | Class stub in `ProductFilters.test.jsx` (HeadlessUI dependency, not in jsdom) |
