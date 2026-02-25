/**
 * Placeholder displayed in ProductDetails while the product is loading.
 *
 * Mirrors the exact DOM structure and dimensions of ProductDetails so the
 * layout doesn't shift when real content loads. Uses the same animate-pulse
 * and bg-blue-300 conventions as ProductSkeleton.
 */
const ProductDetailsSkeleton = () => {
    return (
        <div className="space-y-6 bg-blue-100 rounded-lg p-6">
            <div className="animate-pulse space-y-6">
                {/* Back button placeholder */}
                <div className="w-10 h-10 rounded-lg bg-blue-300"></div>

                {/* Row 1: image + title/category/price/rating */}
                <div className="flex flex-col md:flex-row">
                    {/* Image placeholder */}
                    <div className="w-full h-48 bg-blue-300 rounded-t-xl md:w-48 md:shrink-0 md:rounded-t-none md:rounded-l-xl"></div>

                    {/* Info area */}
                    <div className="flex flex-col flex-1 gap-5 p-4 bg-white rounded-b-xl md:rounded-b-none md:rounded-r-xl">
                        {/* Title — two lines to approximate a typical long title */}
                        <div className="space-y-2">
                            <div className="h-8 bg-blue-300 rounded w-full"></div>
                            <div className="h-8 bg-blue-300 rounded w-4/5"></div>
                        </div>

                        {/* Category badge + price */}
                        <div className="flex gap-5 items-center">
                            <div className="h-6 bg-blue-300 rounded-full w-24"></div>
                            <div className="h-6 bg-blue-300 rounded w-16"></div>
                        </div>

                        {/* Star rating */}
                        <div className="h-4 bg-blue-300 rounded w-36"></div>
                    </div>
                </div>

                {/* Row 2: description — three lines to approximate typical length */}
                <div className="space-y-2">
                    <div className="h-4 bg-blue-300 rounded"></div>
                    <div className="h-4 bg-blue-300 rounded"></div>
                    <div className="h-4 bg-blue-300 rounded w-3/4"></div>
                </div>

                {/* Row 3: add to cart button */}
                <div className="w-full md:w-48 md:ml-auto">
                    <div className="h-10 bg-blue-300 rounded-lg"></div>
                </div>
            </div>
        </div>
    );
};

export default ProductDetailsSkeleton;
