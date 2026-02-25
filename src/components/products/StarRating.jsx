/**
 * Displays a star rating using an overflow-clip technique.
 *
 * Renders a row of 5 empty (grey) stars as a base layer, then absolutely
 * positions a row of 5 full (yellow) stars on top and clips their container
 * to a percentage width of (rate / 5 * 100)%. This naturally handles
 * fractional ratings (e.g. 3.7 stars) without needing partial-star SVGs.
 *
 * @param {number} rate  - Rating value between 0 and 5 (decimals supported)
 * @param {number} count - Total number of ratings, displayed as text beside the stars
 */
const StarRating = ({ rate, count }) => {
    const fullStarIcon = (
        <svg className="w-5 h-5 text-yellow-400" fill="currentColor" viewBox="0 0 24 24">
            <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
        </svg>
    );
    const emptyStarIcon = (
        <svg className="w-5 h-5 text-gray-300" fill="currentColor" viewBox="0 0 24 24">
            <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
        </svg>
    );

    // Pre-render all 5 copies of each icon — the clip width controls
    // how many "full" stars are actually visible.
    const fullStars = Array.from({ length: 5 }).map((_, index) => (
        <span key={index}>{fullStarIcon}</span>
    ));
    const emptyStars = Array.from({ length: 5 }).map((_, index) => (
        <span key={index}>{emptyStarIcon}</span>
    ));

    return (
        <div className="flex items-center">
            <div className="relative flex">
                {/* Base layer: 5 empty stars */}
                {emptyStars}
                {/* Overlay: 5 full stars clipped to the rating percentage */}
                <div className="absolute top-0 left-0 flex overflow-hidden" style={{ width: `${(rate * 20)}%` }}>
                    {fullStars}
                </div>
            </div>
            <span className="ml-2 text-sm text-gray-600">{rate} ({count} ratings)</span>
        </div>
    );
};

export default StarRating;
