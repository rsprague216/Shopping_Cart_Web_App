# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm run dev       # Start dev server (Vite HMR)
npm run build     # Production build → dist/
npm run preview   # Preview production build locally
npm run lint      # Run ESLint (flat config, v9)
```

**Testing**: No framework is set up yet. When adding tests, use **Vitest** (aligns with Vite) + **React Testing Library**. Install with:
```bash
npm install -D vitest @testing-library/react @testing-library/jest-dom jsdom
```
Then add `"test": "vitest"` to package.json scripts and configure `vite.config.js` with `test: { environment: 'jsdom' }`.

## Architecture

**Stack**: React 19, Vite 7, Tailwind CSS 4 (via `@tailwindcss/vite` plugin), ESLint 9 flat config.

**Entry flow**:
```
index.html → src/main.jsx (React 19 StrictMode) → src/App.jsx
```

Tailwind is configured through the Vite plugin (no `tailwind.config.js` needed). ESLint uses the flat config format in `eslint.config.js` — do not use legacy `.eslintrc` format.

## Project Requirements

This is a hiring assignment to build a shopping cart app. Key requirements:

- **Product listing**: Fetch from `https://fakestoreapi.com/products`, display image, title, price, description, and "Add to Cart" button
- **Cart**: Implement as sidebar, drawer, or separate page; support multiple items and quantity updates
- **Responsive design**: Must work on desktop, tablet, and mobile
- **Unit tests**: Mandatory — must cover product data fetching, add-to-cart behavior, and cart updates (quantity, totals)

No routing library, state management library, or testing framework is installed yet — all need to be added as part of implementation.

## Interaction Style

Act as a senior developer mentoring a junior developer. Explain concepts, review code, and guide toward solutions — but **do not write code unless explicitly asked**. Help the user learn by doing.
