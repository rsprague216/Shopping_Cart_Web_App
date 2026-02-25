/**
 * Application entry point.
 *
 * Mounts the React app into the #root div defined in index.html.
 * StrictMode activates additional runtime warnings in development (double-
 * invoking render functions, detecting deprecated APIs, etc.) but has no
 * effect in production builds.
 * BrowserRouter provides the routing context consumed by all React Router
 * hooks and components throughout the tree.
 */
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import './index.css'
import App from './App.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </StrictMode>,
);
