/**
 * Placeholder card displayed in the product grid while products are loading.
 *
 * Mirrors the dimensions of ProductCard so the layout doesn't shift when
 * real content loads. The animate-pulse class creates a subtle fade effect
 * that signals to users that content is on its way.
 *
 * @param {string} [className] - Optional Tailwind classes applied to the root
 *   element. Used by ProductGrid to control responsive visibility so the
 *   skeleton count always fills exactly 2 rows at any breakpoint.
 */
const ProductSkeleton = ({ className }) => {
  return (
    <div className={`bg-blue-100 dark:bg-slate-800 rounded-lg p-4 ${className}`}>
      <div className="animate-pulse flex flex-col space-y-4">
        {/* Image placeholder — same height as the img in ProductCard */}
        <div className="rounded bg-blue-300 dark:bg-slate-700 h-48 w-full"></div>
        <div className="flex-1 space-y-4 py-1">
          {/* Price line placeholder */}
          <div className="h-4 bg-blue-300 dark:bg-slate-700 rounded w-3/4"></div>
          {/* Title line placeholders — two lines to approximate a typical title */}
          <div className="space-y-2">
            <div className="h-4 bg-blue-300 dark:bg-slate-700 rounded"></div>
            <div className="h-4 bg-blue-300 dark:bg-slate-700 rounded w-5/6"></div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductSkeleton;