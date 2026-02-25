# Developer Log — AI-Augmented Development

This document details how AI tooling (Claude Code via the Anthropic Claude Code CLI) was used during development of this shopping cart assignment, including the strategies used to guide the AI, specific instances where its output was corrected, and how it assisted with test design.

---

## AI Strategy

### Context via CLAUDE.md

The primary mechanism for grounding the AI was a `CLAUDE.md` file committed to the repository root. Claude Code automatically loads this file at the start of every session, giving the AI persistent, project-specific context without needing to re-explain the setup each time.

The file captured:

- **Exact stack versions** — React 19, Vite 7, Tailwind CSS 4 via `@tailwindcss/vite`. This prevented the AI from defaulting to older patterns (e.g., suggesting a `tailwind.config.js`, which is not needed in v4, or using legacy `createRoot` patterns that differ between React 18 and 19).
- **Architecture constraints** — the entry flow (`index.html → main.jsx → App.jsx`), the ESLint flat config format, and the fact that no routing or testing framework was pre-installed.
- **Assignment requirements** — the API endpoint, required features, and which test areas were mandatory. This kept the AI focused on what mattered for evaluation.
- **Interaction style** — instructed the AI to act as a senior developer mentoring a junior, explaining concepts rather than just generating code, and to **never write code unless explicitly asked**. This gave a good balance of speed and control: the AI provided guidance and caught issues quickly, while all implementation decisions still required deliberate input. Without this constraint, the AI would have generated the entire project immediately with no quality control or developer involvement — bypassing the learning and review process entirely.

### Project Scaffolding — Minimal Baseline First

The project was initialised using Vite's official scaffolding tool (`npm create vite@latest . -- --template react`) rather than asking the AI to generate a project structure from scratch. This gave a known-good starting point and avoided the AI making opinionated decisions about file layout before any requirements were established.

TailwindCSS v4 was configured using the `@tailwindcss/vite` plugin, which replaces the PostCSS-based approach used in v3. The AI was given the exact stack versions upfront (via `CLAUDE.md`) to prevent it from suggesting the legacy `tailwind.config.js` pattern or `npx tailwindcss init`, which are no longer needed. The only required setup is adding the plugin to `vite.config.js` and a single `@import "tailwindcss"` directive in `index.css`.

The initial prompt explicitly requested a minimal starter rather than a full application scaffold. This kept the first output small enough to verify completely before any real code was written.

### Folder Structure and Architecture Consultation

Before any components were built, the AI was consulted on a component folder hierarchy that would scale with the app's two major feature areas (product listing, cart). The proposed structure grouped files by feature (`products/`, `cart/`) under a shared `components/` directory, with a `layout/` subfolder for structural components like `Header` and `Main`. This gave a clear home for every future component before any were written.

The AI was also used as a sounding board for a design question: whether to extract a shared `Button` component that could serve both the header cart button and the product card "Add to Cart" buttons. The AI surfaced the trade-off — the two buttons would likely diverge visually and behaviorally as the app filled in, making a shared abstraction potentially premature. The guidance to "abstract at three, not two" led to keeping the buttons independent for the time being, avoiding a component that would have needed complex variant props for two use cases.

### Dual-Mode `AddToCartButton` — Shared Component Boundary

When adding quantity controls to the product card, the AI was consulted on whether to extract a shared component between `CartItem` and `AddToCartButton`. The AI surfaced the key differences: `CartItem` maintains local `inputValue` state for a typed quantity input, uses a `useEffect` to sync with external prop changes, and shows a `CartRemove` confirmation modal. `AddToCartButton` has none of that — its quantity is a read-only display and all state lives in the cart context.

The conclusion was to keep them independent. A shared `QuantityControl` component handling both cases would require boolean props to toggle the input, the confirmation modal, and the sync effect — making it harder to understand than two simple components. The AI's own framing ("abstract at three, not two") from an earlier design conversation reinforced this decision.

The quantity controls were built directly inside `AddToCartButton` rather than `ProductCard`. This kept `ProductCard` free of cart concerns — it delegates the entire add/adjust interaction to `AddToCartButton`, which reads cart state from context directly. `ProductCard` passes only the product data as props.

---

### Product Detail View — Architecture Evolution and Container/Presenter Pattern

The product detail view went through three distinct architectures before settling on the final implementation. The AI was initially asked to guide a modal approach (centered overlay, full-screen on mobile). After implementation began, the developer identified that a modal would block the cart sidebar and decided to switch to a view-switch approach (replacing the product grid in-place while keeping the header visible). Before that was fully built, the developer raised the question: *"would this not be a use case for routing?"*

The routing decision was human-initiated. The AI had not suggested it proactively. The key driver was browser-native behaviour: routing gives the back button real functionality, enables URL sharing and deep-linking, and removes the need for custom back-state management in `App`. The AI confirmed the approach and guided implementation.

The container/presenter pattern was also developer-specified. The developer explicitly named the pattern and directed the AI to guide implementation rather than generate it. The split: `ProductDetails.jsx` (container) reads URL params via `useParams`, fetches with `useProduct`, and handles loading/error states. The presenter receives a fully-formed product object and renders the UI. The rationale for re-fetching rather than prop-drilling was a developer insight — the product grid only fetches `id`, `title`, `price`, and `image`, so the full product object (`description`, `category`, `rating`) isn't available from the listing without a separate fetch.

The `useProduct` hook was created specifically for this: a direct mirror of the existing `useProducts` pattern but scoped to a single product by ID. Routing was placed inside `Main.jsx` rather than `App.jsx` at the developer's direction — keeping the layout wrapper co-located with the route map, and keeping `App` as a clean provider shell without route logic.

---

### Iterative Scope Control

When beginning the product listing phase, the AI was first asked to produce a full implementation plan covering the entire app (hooks, components, cart, tests, responsive polish). That plan was then explicitly narrowed — only the product listing was approved for implementation, with the cart deferred. This two-step pattern (generate broadly, scope deliberately) prevented the AI from front-loading decisions about cart state management before the simpler listing layer was confirmed to work.

The same principle applied within the listing itself: the AI was asked to plan before any code was written, and each component was reviewed and approved individually rather than generating the full feature tree at once.

### Test Planning — Systematic Codebase Survey Before Writing

Before any test file was created, Claude Code's Plan Mode was used to survey the full codebase and design a complete test strategy. Two parallel Explore agents ran simultaneously — one mapping every component and hook, the other reading the project requirements and config files — followed by a Plan agent to design the implementation approach. The plan was presented for approval before any code was written.

The initial plan draft covered only the three explicitly required areas (product data fetching, add-to-cart behavior, cart updates). Before approving it, the scope was challenged: *"Is there anything else that should be unit tested beyond the three examples in the requirements?"* The AI expanded the plan to cover every component with testable logic — `StarRating`, `Header`, `ProductCard`, `ProductGrid`, `ProductDetails`, `CartRemove`, and `ProductFilters` — reasoning that a hiring submission demonstrating comprehensive coverage shows the expected professional standard beyond the stated minimum. The final plan produced 12 test files with 93 tests (later 13 files / 110 tests after `ProductFilters` was added).

### Targeted, Incremental Prompting

Rather than asking the AI to scaffold the entire app at once, work proceeded feature-by-feature: hooks first, then components, then tests. Each prompt included the relevant file and a specific goal. This kept the AI's output reviewable and made it easier to catch issues before they compounded.

### Cart Implementation — Guided Architecture, Not Generated Code

The cart feature was implemented entirely through AI-guided mentoring rather than code generation. The AI was asked to explain concepts, identify trade-offs, and review code — but all implementation was written by the developer.

Key architectural decisions consulted with the AI before writing:

- **State shape** — Whether to store `total` in state or derive it. The AI correctly identified that derived state (computed via `reduce` at render time) avoids the risk of total drifting out of sync with items. No `total` field was ever stored in the reducer.
- **`isOpen` in the same state object** — The developer questioned whether `isOpen` and `items` should be separate `useState` calls. The AI surfaced a subtle risk: if they were separate, a component could destructure `items` and `isOpen` from two different state origins, with no guarantee they'd ever be updated atomically. Keeping them in one `useReducer` state object ensures every action produces a single, consistent snapshot.
- **Reducer vs `useEffect` for actions** — The developer was unfamiliar with the reducer pattern and asked whether `useEffect` should handle cart actions instead. The AI explained that `useEffect` is for synchronising with external systems (localStorage, the DOM, fetch calls), not for state logic. Cart operations are pure state transitions — exactly the use case for a reducer.
- **Separate files for hook, provider, and component** — The developer noticed the initial suggestion co-located `CartProvider` (a JSX-returning component) in the hook file. After the AI confirmed that components returning JSX belong in `src/components/`, the three concerns were split: `useCart.js` (context + hook), `CartProvider.jsx` (reducer + provider), and `CartSideBar.jsx` (drawer UI). This separation was a deliberate developer decision, not an AI default.

---

## Human Audit

### 1. `ResizeObserver` Mock — Arrow Function Cannot Be a Constructor

When writing tests for `ProductFilters`, which uses HeadlessUI's `Listbox` component internally, tests were failing with:

```
TypeError: ResizeObserver is not a constructor
```

HeadlessUI calls `new ResizeObserver(...)` internally, and jsdom does not implement it. The AI's initial suggestion for stubbing it was:

```js
global.ResizeObserver = vi.fn().mockImplementation(() => ({
  observe: vi.fn(),
  unobserve: vi.fn(),
  disconnect: vi.fn(),
}));
```

This still failed. The problem: `vi.fn().mockImplementation(...)` returns an arrow-function-based mock, and **arrow functions cannot be used as constructors** — calling `new` on them throws a `TypeError`. The fix was to replace the stub with a proper class declaration:

```js
global.ResizeObserver = class ResizeObserver {
  observe() {}
  unobserve() {}
  disconnect() {}
};
```

This is a subtle JavaScript semantics issue the AI missed. Catching it required understanding why `new` fails on arrow functions and recognising that the mock itself — not the test logic — was the source of the error.

---

### 2. `localStorage` Spy — Custom Mock Does Not Inherit from `Storage`

The `CartProvider` persists cart items to `localStorage`. When writing tests to assert that `localStorage.setItem` was being called correctly, the AI initially suggested:

```js
const spy = vi.spyOn(Storage.prototype, 'setItem');
```

This produced no matches — the spy reported zero calls even when the code clearly ran. The root cause: the test setup file (`setupTests.js`) replaces `localStorage` with a custom IIFE mock object rather than the native `localStorage`. That mock object does **not** inherit from `Storage.prototype`, so spying on the prototype has no effect.

The correct approach was to spy on the mock object directly:

```js
const spy = vi.spyOn(localStorage, 'setItem');
```

This is a case where the AI applied a standard pattern that would be correct in a browser environment or with native jsdom `localStorage`, but didn't account for the project-specific test infrastructure. Recognising the mismatch required reading the setup file and understanding prototype chain semantics.

---

### 3. `AddToCartButton` — Accessible Name Mismatch in Tests

`AddToCartButton` renders a quantity adjuster when the product is already in the cart. The increment button's accessible name is computed from the current quantity and the button label — resulting in a string like `"3 added+"` (no space before `+`).

The AI initially generated a test query using a regex to find the button by accessible name:

```js
screen.getByRole('button', { name: /\+/ })
```

This matched multiple elements (both the `+` button and parts of other text), causing an ambiguous match error. The AI's follow-up suggestion used:

```js
screen.getByRole('button', { name: /added\+/ })
```

This failed because the accessible name had no space before `+`, which the regex didn't account for precisely enough. Rather than continuing to iterate on name patterns, the cleaner fix was to query by position within the component's known button order:

```js
screen.getAllByRole('button')[1]  // increment is always the second button
```

This was both more stable and more readable. The lesson: accessible name queries are fragile when names are dynamically composed. Positional queries are acceptable when component structure is stable and well-understood.

---

### 4. `Header` — `w-screen` Instead of `w-full` for Scroll-Lock Gutter

When the cart sidebar opens, `body-scroll-lock` reserves the scrollbar width as padding on the `<body>` to prevent layout shift. A header using `w-full` inherits the body's computed width, which shrinks slightly — leaving a visible gap in the top-right corner between the header background and the edge of the viewport.

The AI's initial boilerplate used `w-full`. The refinement was to switch to `w-screen`:

```jsx
// Before (AI default)
<header className="sticky top-0 z-10 ... w-full">

// After (human correction)
<header className="sticky top-0 z-10 ... w-screen">
```

`w-screen` sets `width: 100vw`, which always matches the full viewport width regardless of body padding. This is a subtle visual bug that only manifests when the cart is opened — easy to miss in initial development but noticeable to users. The AI did not anticipate the interaction between the layout utility and the scroll-lock library.

---

### 5. `Main` — Boilerplate Replaced with Full Routing Architecture

The AI generated a minimal `Main` component that accepted a `children` prop:

```jsx
const Main = ({ children }) => (
  <main className="max-w-7xl mx-auto px-6 py-8">
    {children}
  </main>
)
```

This was intentionally limited — the AI was asked for a starter template, not a finished implementation. The component was subsequently redesigned to own the client-side routing entirely, co-locating the route map with the layout wrapper:

```jsx
import { Routes, Route, Navigate } from 'react-router-dom';

const Main = () => (
  <main className="max-w-7xl mx-auto px-6 py-8">
    <Routes>
      <Route path="/" element={<ProductGrid />} />
      <Route path="/products" element={<Navigate to="/" replace />} />
      <Route path="/products/:id" element={<ProductDetails />} />
    </Routes>
  </main>
)
```

This architectural decision — placing the route definitions inside the layout component rather than at the `App` level — keeps the route map close to the content it renders and avoids threading route configuration through multiple layers. The AI scaffolded the skeleton; the routing structure was a deliberate human design choice.

---

### 6. `ProductCard` — Description Excluded, Price Repositioned

The AI's initial `ProductCard` design included the product description rendered directly on the card, which matched the assignment spec as written. This was overridden: description was intentionally excluded from the card in anticipation of a dedicated product detail view (initially considered as a quick-view modal, later implemented as a full product details page navigated to via React Router). Showing truncated descriptions on every card adds visual noise without adding value — users scanning a grid don't read descriptions; they read price and title.

The price was also moved above the title. The AI placed it below, which is the default e-commerce convention. Moving it above ensures the price sits at the same vertical position on every card regardless of title length (one-line vs two-line vs three-line titles). This gives users a consistent eye-level scan line across the row and makes price comparison faster. The change was validated visually by rendering the full grid and observing the misaligned buttons that resulted from variable-length titles before the fix was applied.

---

### 7. `setLoading(true)` in Function Body — Infinite Render Loop

To test the skeleton loading state without throttling the network, `setLoading(true)` was placed directly in the hook's function body (outside `useEffect`) as a temporary override. This immediately caused React to throw:

```
Error: Too many re-renders. React limits the number of renders to prevent an infinite loop.
```

The root cause: calling a state setter in the function body runs on every render. Changing state triggers a re-render, which calls the setter again, causing another re-render — infinitely. The fix was to remove the line entirely and use Chrome DevTools' network throttling (`Slow 3G`) to observe the loading state without modifying code.

The correct mental model: state setters belong inside `useEffect`, event handlers, or async callbacks — never directly in the render path. The DevTools throttling approach is preferable to any code-based override because it leaves no temporary changes to accidentally commit.

---

### 8. `scrollbar-gutter: stable` — Incompatible with `overflow: hidden`

When the cart drawer opens, the page scrollbar disappears, causing the content to shift right by the scrollbar width. The AI first suggested adding `scrollbar-gutter: stable` to the `body` in `index.css`, which reserves scrollbar gutter space to prevent layout shift.

This did not work. The root cause: according to the CSS spec, `scrollbar-gutter: stable` only reserves gutter space when `overflow` is `scroll` or `auto`. The moment `overflow: hidden` is applied (which is how scroll locking works), the gutter reservation is abandoned — which is exactly the moment the shift occurs. The two properties work against each other.

The correct solution was `body-scroll-lock`, a library that handles scroll locking and padding compensation together. The key option that the AI omitted in its initial usage:

```js
// AI's first attempt — no padding compensation
disableBodyScroll(el);

// Corrected — compensates for the scrollbar width
disableBodyScroll(el, { reserveScrollBarGap: true });
```

Without `{ reserveScrollBarGap: true }`, the library applies `overflow: hidden` but does not add `padding-right` to compensate for the missing scrollbar, so the shift persists.

---

### 9. `body-scroll-lock` Cleanup — `scrollableRef.current` Is Null on Unmount

The scroll-lock `useEffect` originally read from `scrollableRef.current` inside its cleanup function:

```js
useEffect(() => {
    if (isOpen) {
        disableBodyScroll(scrollableRef.current, { reserveScrollBarGap: true });
    } else {
        enableBodyScroll(scrollableRef.current);
    }
    return () => {
        enableBodyScroll(scrollableRef.current); // ← unsafe
    };
}, [isOpen]);
```

This produced a console error on unmount: `enableBodyScroll unsuccessful — targetElement must be provided`. When the cleanup function runs after unmount, React has already detached the ref — `scrollableRef.current` is `null`.

The fix was to capture the ref value in a local variable at the top of the effect, before the cleanup is returned. The closure then closes over a stable value rather than reading the ref at cleanup time:

```js
useEffect(() => {
    const el = scrollableRef.current; // captured immediately
    if (isOpen) {
        disableBodyScroll(el, { reserveScrollBarGap: true });
    } else {
        enableBodyScroll(el);
    }
    return () => {
        enableBodyScroll(el); // always valid
    };
}, [isOpen]);
```

---

### 10. `CartItem` Violating Container/Presentational Separation

After completing the cart implementation, a code review identified that `CartItem` was calling `useCart()` directly to access `updateQuantity` and `removeItem`. This meant the component had implicit knowledge of and a direct dependency on the cart context — making it untestable in isolation and tightly coupled to one specific state management approach.

The AI had not flagged this during implementation. On review, it was identified that `CartSideBar` (the parent) was already a context consumer and was the correct place to own those dependencies. `CartItem` should be a pure display component that receives callbacks as props:

```jsx
// Before — CartItem calling context directly
const { updateQuantity, removeItem } = useCart();

// After — CartItem receiving callbacks as props
const CartItem = ({ ..., onUpdateQuantity, onRemove }) => { ... }

// CartSideBar passing them down
<CartItem {...item} onUpdateQuantity={updateQuantity} onRemove={removeItem} />
```

This makes `CartItem` fully testable without a `CartProvider` wrapper, and decouples it from any specific state implementation.

---

### 11. `CartRemove` — `window.confirm` Replaced with Styled Modal via Portal

The initial implementation of cart item removal used `window.confirm()` as a quick confirmation gate. While functional, the native browser dialog is visually inconsistent — it ignores all app styling and varies in appearance across browsers and operating systems.

The decision to replace it with a custom `CartRemove` component was a deliberate UX improvement made independently of any AI suggestion. The AI was then consulted on implementation approach and guided the architecture: a separate presentational component receiving `id`, `title`, `onRemove`, and `onCancel` as props, with `CartItem` owning the `showConfirm` state and passing a closure that calls both `onRemove(id)` and `setShowConfirm(false)` on confirm.

The modal was styled to match the existing `blue-900` / `blue-100` / `blue-300` palette used throughout the cart drawer, with a red destructive action button — consistent with the visual language already established for dangerous actions.

---

### 12. `CartRemove` — `createPortal` to Escape CSS Transform Stacking Context

Once `CartRemove` was rendering inside `CartItem` (which renders inside the `CartSideBar` drawer), the `fixed inset-0` overlay was not covering the full viewport — it was anchored to the sidebar panel instead.

The AI correctly diagnosed the root cause: the sidebar's slide animation uses `translate-x-0` / `translate-x-full` (CSS `transform`), and **any element with a `transform` applied creates a new containing block for `position: fixed` descendants**. This is a well-specified but easy-to-miss CSS behaviour — `fixed` positioning is not always relative to the viewport.

The fix was to render the modal via `createPortal` directly into `document.body`, placing it outside the transformed ancestor in the DOM while keeping it logically inside the React component tree (so props still flow normally):

```jsx
import { createPortal } from 'react-dom';

return createPortal(
    <div className="fixed inset-0 ...">...</div>,
    document.body
);
```

The AI identified the cause and the correct API. The developer applied it and additionally added `onClick={(e) => e.stopPropagation()}` to the backdrop div — an independent refinement to prevent clicks on the overlay from propagating to the body and accidentally triggering other handlers.

---

### 13. `CartItem` — Independent UX Refinements Beyond AI Scaffolding

After the AI guided the basic `CartItem` structure, the developer made several UX improvements independently:

- **Card click navigation**: The entire item card was made clickable, closing the cart drawer and navigating to the product detail page via `useNavigate`. All interactive controls (`-`, input, `+`, trash button) call `e.stopPropagation()` to prevent their clicks from bubbling to the card handler.
- **Decrement at quantity 1 triggers removal modal**: Rather than allowing a zero-quantity item or silently removing it, clicking `-` when quantity is already `1` now opens the `CartRemove` confirmation modal. This is a meaningful UX guard the AI did not suggest.
- **Input type changed to `number`**: The quantity field was changed from `type="text"` to `type="number"` with a `max="999"` attribute, enabling better mobile keyboard support. The native spin buttons were hidden via CSS in `index.css` using vendor-prefixed rules, since the app provides custom `+`/`-` controls.
- **`onFocus` auto-select**: Adding `onFocus={(e) => e.target.select()}` means the quantity field selects its contents when focused — a small but meaningful UX detail that makes it faster to type a new value without manually clearing the old one.
- **`aria-label` attributes**: Explicit accessible names were added to the `+`, `-`, and trash icon buttons, which otherwise have no visible text label. This was a human-initiated accessibility improvement.
- **Checkout button disabled when cart is empty**: The "Go to Checkout" button in `CartSideBar` was updated to use a `disabled` attribute and conditional styling when `items.length === 0`, preventing interaction with an empty cart.

None of these were part of any AI-generated plan — they emerged from using the UI and identifying gaps in the experience.

---

### 14. Quantity Input — Systematic Security and Correctness Audit

After completing `CartItem`, a dedicated review session examined the quantity input for vulnerabilities and behavioral inconsistencies. The AI identified four issues:

**No upper bound.** `handleBlur` and the `+` button placed no cap on quantity, allowing arbitrarily large values to be stored. Fixed by adding `Math.min(action.payload.quantity, 999)` in the `UPDATE_QUANTITY` reducer case. The 999 limit is a deliberate product decision — high enough to be unreachable in normal use, low enough to keep totals reasonable.

**`parseInt` accepting malformed input silently.** `parseInt("5abc", 10)` returns `5`, not `NaN`. The `!isNaN && > 0` guard in `handleBlur` would accept this and commit `5` without any revert or warning. Switching the input to `type="number"` mitigated this: the browser rejects non-numeric characters at the input level, so `e.target.value` is always a valid numeric string or empty. The native spin buttons were hidden via CSS pseudo-element rules in `index.css` since the app provides its own `+`/`-` controls.

**`-` button bypassing the removal confirmation modal.** When quantity was `1`, clicking `-` dispatched `UPDATE_QUANTITY` with `0`, which the reducer silently treated as a removal — no `CartRemove` confirmation, no modal. The trash icon, by contrast, always showed a modal first. This inconsistency was fixed by making the `-` button check `quantity === 1` and call `setShowConfirm(true)` instead of `onUpdateQuantity` in that case. Both removal paths now require explicit confirmation.

**Display sync bug when the quantity prop did not change.** Typing a value above 999 and blurring correctly clamped the stored quantity to 999 and updated the cart total, but the input field continued displaying the unclamped value (e.g. `1500`) when the quantity was *already* `999` before the edit. The `useEffect` that syncs `inputValue` with the `quantity` prop only fires when the prop actually changes — if the reducer clamps to the same value already stored, no prop change occurs and `inputValue` is never corrected. Fixed by calling `setInputValue(Math.min(newQuantity, 999))` explicitly inside `handleBlur`, making the blur path self-contained rather than relying on the `useEffect` as a side-channel corrector.

**Reducer cleanup.** Once the `-` button intercepted quantity → 0 transitions (routing them to the confirmation modal), the `< 1` removal guard in `UPDATE_QUANTITY` became dead code — unreachable from the UI. Rather than keeping it as a speculative backstop, it was removed and the case was replaced with a symmetric clamp: `Math.min(Math.max(action.payload.quantity, 1), 999)`. Dead code signals ambiguous intent; a clean clamp expresses the invariant directly. The `-` button's confirmation-modal path is now the single documented route for removal from quantity controls.

---

### 15. `ADD_ITEM` Reducer — Switch Fall-Through to Wrong Case

After the `+` quantity button was updated to call `updateQuantity` instead of `addItem`, the "increment on duplicate" branch in the `ADD_ITEM` reducer became dead code. It was replaced with a no-op guard: if the item already exists, return `state` unchanged — preventing duplicate entries without silently doing `updateQuantity`'s job.

The initial implementation of this guard was:

```js
case 'ADD_ITEM': {
    const found = state.items.find(item => item.id === action.payload.id);
    if (!found) {
        return {
            ...state,
            items: [...state.items, { ...action.payload, quantity: 1 }]
        };
    }
    // ← no return or break here
}
case 'REMOVE_ITEM': { ... }
```

When `found` was truthy, the `if (!found)` block was skipped — but there was no `return state` after it. JavaScript switch statements fall through to the next case when no `return` or `break` is present. The result: dispatching `ADD_ITEM` for an item already in the cart would execute the `REMOVE_ITEM` case, deleting the item entirely.

A human code review caught the missing `return state` before any runtime testing. The fix was a single line after the closing brace of the `if` block:

```js
case 'ADD_ITEM': {
    const found = state.items.find(item => item.id === action.payload.id);
    if (!found) {
        return {
            ...state,
            items: [...state.items, { ...action.payload, quantity: 1 }]
        };
    }
    return state; // No-op if item already in cart
}
```

This is a class of bug that is easy to miss visually — the indentation and braces look complete. The AI did not flag the fall-through risk.

---

### 16. `AddToCartButton` — `+` Button Calling `addItem` Instead of `updateQuantity`

The `AddToCartButton` quantity adjuster replaces the "Add to Cart" button once an item is in the cart. In an early iteration, the `+` button was wired to `addItem`:

```jsx
<button onClick={() => addItem({ id, title, price, image })}>+</button>
```

This appears to work because `ADD_ITEM` increments quantity when the item is already found. However, `ADD_ITEM` performs a bare `quantity + 1` with no ceiling — the 999 upper limit only exists in the `UPDATE_QUANTITY` reducer case via `Math.min(Math.max(...), 999)`. Repeatedly pressing `+` via `addItem` would silently exceed the cap.

The fix was to call `updateQuantity` instead, which routes through the clamped reducer path:

```jsx
// Before — bypasses the 999 cap
<button onClick={() => addItem({ id, title, price, image })}>+</button>

// After — respects the cap
<button onClick={() => updateQuantity(id, cartQuantity + 1)}>+</button>
```

This also drove a cleanup of the `ADD_ITEM` case itself: since `updateQuantity` now handles all quantity increases for existing items, the "increment on duplicate" branch in `ADD_ITEM` was genuinely dead code. It was replaced with the no-op guard described in entry 15.

---

### 17. `StarRating` — AI Validated Incorrect Partial-Star Math

The initial implementation of fractional star ratings calculated the partial star fill percentage using:

```js
const partialStar = rate - fullStars - emptyStars;
```

For a rating of `3.7`, `fullStars = Math.floor(3.7) = 3` and `emptyStars = Math.floor(5 - 3.7) = 1`. This gives `3.7 - 3 - 1 = -0.3` — a negative value. When used as a fill percentage, this would produce `width: -6%`, which collapses to zero and renders no partial star at all.

The AI initially validated this calculation without catching the error. The developer identified the negative-number result independently and flagged it. The fix was to remove `emptyStars` from the calculation entirely: `partialStar = rate - fullStars`. For `3.7`, that correctly gives `0.7`.

The implementation was subsequently replaced altogether with a CSS overlay technique — 5 grey stars as a base layer, with 5 yellow stars absolutely positioned on top and clipped to `rate * 20%` width. This eliminates the partial-star calculation entirely and handles any decimal value naturally without the intermediate variables.

---

### 18. `ProductDetails` — Layout Designed Iteratively by Developer, Not AI

The `ProductDetails` page layout was designed entirely through developer direction, with the AI implementing each change on request. No AI-generated layout was accepted as-is. Key decisions that emerged through iteration:

- **Three-row structure** — image+title panel (row 1), description (row 2), add-to-cart (row 3) — was the developer's own proposal. The AI had offered a generic two-column desktop layout; the developer specified a different information hierarchy.
- **Star rating moved into the title panel** — after seeing the layout, the developer identified empty space in the title panel and decided to move `StarRating` out of row 3 and into the right-hand panel, making better use of the available vertical space. The AI did not suggest this.
- **`justify-between` replaced with `gap-5`** — the sub-row containing category and price was initially spread to opposite ends of the title panel. The developer identified this as too spread out and directed the fix.
- **`line-clamp-2` on the title** — added by the developer after observing that long product names consumed excessive vertical space on mobile. `md:line-clamp-none` was considered and explicitly rejected — the developer judged that the clamp would only trigger in cases where it was genuinely useful on desktop too.
- **Responsive corner rounding** — `rounded-t-xl / rounded-b-xl` on mobile → `rounded-l-xl / rounded-r-xl` on `md+` was the developer's specification. The AI implemented it as directed.

---

### 19. Test Scope — AI Under-Scoped; Human Expanded to Full Component Coverage

When the initial unit testing plan was presented for approval, it covered only the three areas explicitly named in the project requirements: product data fetching, add-to-cart behavior, and cart updates. The plan was rejected before approval with the note: *"Don't just look at the three examples specified in the md document. Is there anything else that should be unit tested?"*

The AI had defaulted to the minimum required — a reasonable interpretation of "mandatory unit tests" — without considering that a hiring submission is also evaluated on the depth of judgment it demonstrates. The corrected plan added six additional test files:

- `StarRating.test.jsx` — pure display component with real math (`rate * 20%`)
- `Header.test.jsx` — `itemCount` badge calculation via `items.reduce(...)`
- `ProductCard.test.jsx` — price formatting, link href, image props
- `ProductGrid.test.jsx` — loading skeleton, success render, error state
- `ProductDetails.test.jsx` — loading/error states, useParams integration
- `ProductFilters.test.jsx` — search input, HeadlessUI Listbox category filter

This wasn't about adding tests for their own sake — every file added contains real logic worth verifying. The lesson: "mandatory" sets a floor, not a ceiling. Evaluators assessing "unit test coverage" are looking at breadth and judgment, not just whether three boxes are checked.

---

### 20. Aria Labels — Tests Exposed Accessibility Gap in Button Components

The first draft of `AddToCartButton.test.jsx` found the increment button using `getAllByRole('button')[1]` — a position-based query — because the button's accessible name (`"3 added+"`) was dynamically composed and awkward to match. The decrement button at qty=1 was similarly found by index. These queries work but are fragile: they break silently if the button order changes and give no indication of _what_ the button does.

Recognising this as both a testing problem and an accessibility problem, explicit `aria-label` attributes were added to `AddToCartButton.jsx`:

```jsx
aria-label={cartQuantity > 1 ? 'Remove one item' : 'Remove from cart'}  // left button
aria-label="Add one item"                                                  // right button
```

And to `CartItem.jsx`:

```jsx
aria-label="Decrease quantity"   // - button
aria-label="Increase quantity"   // + button
aria-label="Remove from cart"    // trash icon button
aria-labelledby={`title-${id}`}  // quantity input (labelled by the product title)
```

Tests were then updated to use these labels (`screen.getByRole('button', { name: /decrease quantity/i })`), making them both more readable and more resilient. The accessibility improvement was a direct byproduct of improving test quality — the buttons now have meaningful names for screen readers as well as for test queries. This is the kind of refinement that doesn't arise from requirements but emerges from actually writing tests against the UI.

---

### 21. `ProductFilters` — `aria-label` on `<Listbox>` Passed to a Fragment

When implementing the Headless UI `Listbox` component for the category dropdown, the AI's initial guidance placed `aria-label` directly on the `<Listbox>` root:

```jsx
<Listbox
    value={selectedCategory}
    onChange={onCategoryChange}
    aria-label="Filter by category"  // ← wrong element
>
```

This produced a runtime error in the browser console:

```
Uncaught Error: Passing props on "Fragment"!
The current component <Listbox /> is rendering a "Fragment".
However we need to passthrough the following props: aria-label
```

`<Listbox>` renders as a React Fragment by default (no DOM element), so it cannot accept or forward DOM attributes like `aria-label`. The error message itself described the fix options, but the underlying issue was that the AI had directed the attribute to the wrong element. The correct target is `<ListboxButton>` — the actual interactive DOM element that assistive technology interacts with:

```jsx
<Listbox value={selectedCategory} onChange={onCategoryChange}>
    <ListboxButton aria-label="Filter by category" ...>
```

This is a pattern-matching failure: the AI treated `<Listbox>` like a standard wrapper element without accounting for the Fragment rendering behavior specific to Headless UI v2.

---

### 22. `ListboxOption` — `hover:` Pseudo-Class Does Not Cover Keyboard Navigation

The initial implementation of the category dropdown options used `hover:bg-gray-100` for the highlight state:

```jsx
<ListboxOption className="cursor-pointer px-4 py-2 hover:bg-gray-100">
```

This works for mouse users — hovering an option highlights it. However, keyboard navigation (arrow keys) does not trigger CSS `:hover`. Headless UI v2 manages focus state internally and exposes it via a `data-focus` attribute on the active option. Without targeting this attribute, keyboard users navigating the dropdown get no visual feedback on which option is highlighted.

The fix replaces the pseudo-class with a Tailwind data attribute variant:

```jsx
// Before — mouse only
className="cursor-pointer px-4 py-2 hover:bg-gray-100"

// After — mouse and keyboard
className="cursor-pointer px-4 py-2 data-[focus]:bg-gray-100"
```

`data-[focus]:bg-gray-100` fires whenever Headless UI sets `data-focus` on the element — which covers both mouse hover and keyboard focus. The original `hover:` approach was technically functional but created an accessibility gap for keyboard-only users. The AI flagged this during a review pass after the initial implementation was complete, rather than specifying it upfront.

---

### 23. `ProductFilters` — Mobile Overflow Caused by Missing `w-full` and `min-w-0`

After implementing the filter bar and testing at narrow viewport widths, the component extended past the right edge of the screen. Two related causes, both absent from the initial implementation guidance:

**Missing `w-full` on the flex container.** Without an explicit width, the outer `<div className="flex">` sizes to its content rather than filling the parent. On narrow screens this allowed the combined input + dropdown width to exceed the viewport. Adding `w-full` constrains the container to its parent's available width.

**Missing `min-w-0` on the `<input>`.** Flex items have `min-width: auto` by default, which means they will not shrink below their intrinsic content width. The search `<input>` has a browser-default minimum size that prevented it from compressing on small screens, even with `flex-1`. Adding `min-w-0` overrides the default and allows the input to shrink to fit the available space:

```jsx
// Before — overflows viewport on mobile
<div className="flex">
    <input className="flex-1 ..." />

// After — stays within bounds
<div className="flex w-full">
    <input className="flex-1 min-w-0 ..." />
```

The `min-w-0` override is a well-known flex gotcha that the AI did not include in its initial guidance. It only surfaced once the component was visually tested at 320px.

---

### 24. `ProductGrid` — Incomplete Test Mock Revealed Real Component Fragility

After `ProductFilters.test.jsx` was created and the full test suite was run, a pre-existing failure surfaced in `ProductGrid.test.jsx`:

```
TypeError: Cannot read properties of undefined (reading 'charAt')
  ❯ src/components/products/ProductFilters.jsx:53
```

The cause: mock products in `ProductGrid.test.jsx` had been defined without a `category` field:

```js
{ id: 1, title: 'Backpack', price: 109.95, image: 'bp.jpg' }
```

`ProductGrid.jsx` derives the category list with:

```js
const categories = [...new Set(products.map(p => p.category))].sort();
```

Without `category` on the products, this produces `[undefined]`. `ProductFilters` then iterates the array and calls `category.charAt(0).toUpperCase()`, crashing on the undefined value.

The AI's initial proposal was to fix only the test — add `category` to the mock data, since the real API always includes the field. Before accepting this, the question was raised: **should the component itself also guard against undefined categories?** The AI had not flagged this proactively.

The decision was to apply both fixes:

1. **Test mock updated** to match the real API shape, making mock data a faithful representation of real data:

```js
{ id: 1, title: 'Backpack', price: 109.95, image: 'bp.jpg', category: "men's clothing" }
```

2. **Component hardened** with `.filter(Boolean)` so a missing or null `category` field never crashes the UI:

```js
// Before — undefined category crashes ProductFilters
const categories = [...new Set(products.map(p => p.category))].sort();

// After — undefined categories are silently excluded
const categories = [...new Set(products.map(p => p.category).filter(Boolean))].sort();
```

The test failure was a useful signal: incomplete mock data exposed a real fragility that would surface in production if the API ever returned a product with a missing or null `category`. The AI treated the test as the source of truth for the correct fix; the developer's instinct was to also question the component. Both were corrected together.

---

## Verification — Using AI to Generate Edge-Case Tests

The AI was most useful in the testing phase for identifying non-obvious edge cases that might otherwise be skipped.

**`CartProvider` reducer edge cases:** After writing the basic add/remove tests, the AI was asked: *"What edge cases in the reducer are most likely to cause bugs in production?"* It surfaced three that were then implemented:

- `UPDATE_QUANTITY` with `0` — should clamp to `1`, not allow zero-quantity items
- `UPDATE_QUANTITY` with `1000` — should clamp to `999` to prevent absurd quantities
- `localStorage` containing invalid JSON on mount — should fall back to an empty cart rather than crashing

All three became real tests (`CartProvider.test.jsx`, `UPDATE_QUANTITY` group and localStorage persistence group).

**`CartItem` input validation:** The AI was asked to think through all the ways a user could enter an invalid quantity into the number input. It identified: empty string on blur, non-numeric input, value above 999, and external prop change while the input was focused. Each became a distinct test case, and catching the "sync local input when prop changes externally" case led to discovering that the component needed a `useEffect` to keep local state in sync with the incoming `quantity` prop — a real implementation fix driven by the test design conversation.

**`useProducts` network error path:** The hook had two distinct failure modes: a non-OK HTTP response (`response.ok === false`) and a thrown network error (fetch rejects entirely). The AI noted that these are often conflated and that many implementations only handle one. Both paths were tested explicitly in `useProducts.test.js` and `useProduct.test.js`.

**`useProduct` re-fetch on ID change:** The AI identified that the critical behavioral difference between `useProduct` and `useProducts` is the `[productId]` dependency array. A test was written that renders the hook with one ID, waits for the first fetch to resolve, rerenders with a new ID, and asserts that `fetch` was called a second time with the updated URL. This directly validates the behavior that makes the product detail page work correctly when navigating between products without unmounting the component.

**`CartSideBar` scroll lock and Escape key interaction:** The AI was asked what behaviors in `CartSideBar` are hardest to catch manually. It identified two: the Escape key listener is only registered when `isOpen` is true (if the cart is already closed, pressing Escape should be a no-op — not toggle state), and `enableBodyScroll` must also be called in the effect cleanup (not just on close) to handle the case where the component unmounts while the cart is open. Both became explicit test cases.

**`StarRating` edge cases 0 and 5:** After writing the basic overlay-percentage test, the AI was asked which input values were most likely to expose implementation bugs. It flagged the endpoints: `rate=0` (0% width — tests that the overlay doesn't display negative or undefined width) and `rate=5` (100% — tests that the math doesn't overshoot and clip unexpectedly). Both passed, confirming the `rate * 20` formula handles the full range cleanly.

**`ProductFilters` — HeadlessUI interaction and controlled input strategy:** The AI was asked to design tests for `ProductFilters` before writing any. It identified four distinct test areas: static rendering (placeholder, button label, category label capitalization), the search input (controlled value reflection, `onSearchChange` callback), the HeadlessUI Listbox dropdown (options present after button click, `onCategoryChange` called with the raw lowercase value, empty-categories edge case), and the active-filter dot indicator (presence and absence based on `selectedCategory`).

A key design decision emerged during planning: the search `<input>` is a controlled component — its value comes from the `searchQuery` prop, which does not update in the test environment because the mock `onSearchChange` does nothing. With `userEvent.type`, each keystroke would fire `onChange` with only that character, since React resets the DOM value back to the static prop between keystrokes. For a controlled input test, `fireEvent.change` is more direct and predictable — it fires a single change event with an explicit target value, bypassing the keystroke simulation entirely. All search input tests use `fireEvent.change` for this reason; all dropdown interaction tests use `userEvent` (clicking the button and selecting an option) where the HeadlessUI state management handles value propagation correctly.
