/**
 * Application entry point.
 *
 * Mounts the React app into the #root div defined in index.html.
 * StrictMode activates additional runtime warnings in development (double-
 * invoking render functions, detecting deprecated APIs, etc.) but has no
 * effect in production builds.
 * HashRouter provides the routing context consumed by all React Router
 * hooks and components throughout the tree. Hash-based routing is used so
 * that GitHub Pages (a static file host) can serve any route without a
 * server-side 404 — the path lives after the # and never reaches the server.
 */
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { HashRouter } from 'react-router-dom'
import './index.css'
import App from './App.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <HashRouter>
      <App />
    </HashRouter>
  </StrictMode>,
);
