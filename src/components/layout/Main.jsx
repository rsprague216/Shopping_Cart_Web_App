/**
 * Main content area with client-side routing.
 *
 * Route map:
 *   /              → ProductGrid   (product catalogue listing)
 *   /products      → redirected to / (canonical URL is the root; `replace` avoids a dead back-button entry)
 *   /products/:id  → ProductDetails (single product detail page)
 */
import { Routes, Route, Navigate } from 'react-router-dom';
import ProductGrid from '../products/ProductGrid';
import ProductDetails from '../products/ProductDetails';

const Main = () => {
  return (
    <main className="max-w-7xl mx-auto px-6 py-8">
      <Routes>
        <Route path="/" element={<ProductGrid />} />
        <Route path="/products" element={<Navigate to="/" replace />} />
        <Route path="/products/:id" element={<ProductDetails />} />
      </Routes>
    </main>
  )
};

export default Main;
