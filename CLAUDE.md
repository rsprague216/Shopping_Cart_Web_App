# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm run dev       # Start dev server (Vite HMR)
npm run build     # Production build → dist/
npm run preview   # Preview production build locally
npm run lint      # Run ESLint (flat config, v9)
```

**Testing**: Vitest + React Testing Library are fully set up. Run with:
```bash
npm run test       # watch mode
npm run test:run   # run once and exit
```

## Architecture

**Stack**: React 19, Vite 7, React Router 7, Tailwind CSS 4 (via `@tailwindcss/vite` plugin), Headless UI 2, ESLint 9 flat config.

**Entry flow**:
```
index.html → src/main.jsx (StrictMode + HashRouter) → src/App.jsx (CartProvider → Header / Main / CartSideBar)
```

Tailwind is configured through the Vite plugin (no `tailwind.config.js` needed). ESLint uses the flat config format in `eslint.config.js` — do not use legacy `.eslintrc` format.

## Project Requirements

This is a hiring assignment to build a shopping cart app. Key requirements:

- **Product listing**: Fetch from `https://fakestoreapi.com/products`, display image, title, price, description, and "Add to Cart" button
- **Cart**: Implement as sidebar, drawer, or separate page; support multiple items and quantity updates
- **Responsive design**: Must work on desktop, tablet, and mobile
- **Unit tests**: Mandatory — must cover product data fetching, add-to-cart behavior, and cart updates (quantity, totals)

All requirements are implemented. React Router 7 (HashRouter for GitHub Pages compatibility), cart state via Context + useReducer, and 110 passing tests across 13 files.

## Interaction Style

Act as a senior developer mentoring a junior developer. Explain concepts, review code, and guide toward solutions — but **do not write code unless explicitly asked**. Help the user learn by doing.
