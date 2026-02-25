import { useState } from 'react';
import ProductSkeleton from './ProductSkeleton';
import ProductCard from './ProductCard';
import useProducts from '../../hooks/useProducts';
import ProductFilters from './ProductFilters';

/**
 * Stateful container component for the product listing.
 *
 * Responsible for fetching product data and deciding what to render based on
 * the current state: skeleton placeholders while loading, an error message on
 * failure, or the real product cards on success.
 *
 * This is the only component in the products feature that owns state —
 * ProductCard and ProductSkeleton are purely presentational.
 */
const ProductGrid = () => {
  const { products, loading, error } = useProducts();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');

  // Extract unique categories for the filter dropdown
  const categories = [...new Set(products.map(p => p.category).filter(Boolean))].sort();

  /**
   * Returns a Tailwind visibility class so the skeleton grid always shows
   * exactly 2 rows at every responsive breakpoint.
   *
   * The grid columns at each breakpoint are:
   *   default: 1 col → 2 skeletons needed  (indices 0–1)
   *   sm:      2 cols → 4 skeletons needed  (indices 0–3)
   *   md:      3 cols → 6 skeletons needed  (indices 0–5)
   *   lg:      4 cols → 8 skeletons needed  (indices 0–7)
   *
   * @param {number} index - Position of the skeleton in the array (0–7)
   * @returns {string} Tailwind class string controlling visibility
   */
  const getSkeletonVisibility = (index) => {
    if (index >= 6) return 'hidden lg:block';
    if (index >= 4) return 'hidden md:block';
    if (index >= 2) return 'hidden sm:block';
    return '';
  };

  // 8 skeletons covers the maximum (4-col × 2 rows); extras are hidden via CSS
  const skeletons = Array.from({ length: 8 }).map((_, index) => (
    <ProductSkeleton key={index} className={getSkeletonVisibility(index)} />
  ));

  const productsCards = products
    .filter((product) =>
      product.title.toLowerCase().includes(searchQuery.toLowerCase())
    )
    .filter((product) =>
      selectedCategory ? product.category === selectedCategory : true
    )
    .map((product) => (
      <ProductCard
        key={product.id}
        id={product.id}
        title={product.title}
        price={product.price}
        image={product.image}
      />
    )
  );

  if (error) {
      return (
        <div>Error loading products</div>
      );
  } else {
    return (
      <div className='space-y-4'>
        <ProductFilters
          categories={categories}
          selectedCategory={selectedCategory}
          onCategoryChange={setSelectedCategory}
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
        />
        {!loading && productsCards.length === 0 ? (
          <p className="text-gray-500">No products found. Try adjusting your search or filter.</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {loading ? skeletons : productsCards}
          </div>
        )}
      </div>
    );
  }
};

export default ProductGrid;