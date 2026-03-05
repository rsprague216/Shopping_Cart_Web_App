/**
 * Full-detail view for a single product.
 *
 * Reads the product ID from the URL via useParams, fetches the product with
 * the useProduct hook, and shows a skeleton placeholder while loading.
 *
 * Layout (stacks vertically on mobile, side-by-side on md+):
 *   Row 1: image thumbnail  |  title, category badge, price, star rating
 *   Row 2: full description text
 *   Row 3: Add to Cart button (right-aligned on md+)
 */
import { useParams, Link } from 'react-router-dom';
import StarRating from './StarRating';
import AddToCartButton from '../cart/AddToCartButton';
import ProductDetailsSkeleton from './ProductDetailsSkeleton';
import useProduct from '../../hooks/useProduct';

const ProductDetails = () => {
    const { id } = useParams();
    const { product, loading, error } = useProduct(id);

    if (loading) return <ProductDetailsSkeleton />;
    if (error) return <div>Error: {error}</div>;

    return (
        <div className="space-y-6 bg-blue-100 dark:bg-slate-800 rounded-lg p-6">
            {/* Back button — navigates to the catalogue root */}
            <Link to="/" className="inline-flex items-center justify-center w-10 h-10 rounded-lg bg-green-500 hover:bg-green-600 text-white transition-colors">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M19 12H5M12 19l-7-7 7-7" />
                </svg>
            </Link>

            {/* Row 1: image + title/category/price/rating */}
            <div className="flex flex-col md:flex-row">
                <div className="w-full h-48 bg-blue-300 dark:bg-slate-700 rounded-t-xl md:w-48 md:shrink-0 md:rounded-t-none md:rounded-l-xl p-2">
                    <img src={product.image} alt={product.title} className="w-full h-full object-contain" />
                </div>
                <div className="flex flex-col flex-1 gap-5 p-4 bg-white dark:bg-slate-900 rounded-b-xl md:rounded-bl-none md:rounded-tr-xl md:rounded-br-xl">
                    <h1 className="text-3xl font-bold text-blue-900 dark:text-slate-100 line-clamp-2">{product.title}</h1>
                    <div className="flex gap-5 items-center">
                        <span className="bg-blue-100 dark:bg-slate-700 text-blue-900 dark:text-slate-100 text-xs px-3 py-1 rounded-full capitalize">{product.category}</span>
                        <p className="text-xl font-bold text-blue-900 dark:text-slate-100">{`$${product.price.toFixed(2)}`}</p>
                    </div>
                    <StarRating rate={product.rating.rate} count={product.rating.count} />
                </div>
            </div>

            {/* Row 2: description */}
            <p className="text-gray-700 dark:text-slate-300">{product.description}</p>

            {/* Row 3: add to cart — constrained to button width and right-aligned on md+ */}
            <div className="w-full md:w-48 md:ml-auto">
                <AddToCartButton id={product.id} title={product.title} price={product.price} image={product.image} />
            </div>
        </div>
    );
};

export default ProductDetails;
