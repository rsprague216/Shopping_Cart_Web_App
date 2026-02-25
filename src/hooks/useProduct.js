import { useState, useEffect } from "react";

/**
 * Custom hook for fetching a single product from the FakeStore API.
 *
 * Separating the fetch logic into a hook keeps ProductDetails focused on
 * rendering and makes the data-fetching behaviour independently testable.
 * Re-fetches automatically if productId changes (e.g. navigating between
 * product detail pages without unmounting the component).
 *
 * @param {string|number} productId - The product ID to fetch (typically from useParams)
 * @returns {{ product: Object|null, loading: boolean, error: string|null }}
 *   - product: the fetched product object, or null while loading / on error
 *   - loading: true while the request is in flight
 *   - error:   error message string if the request failed, otherwise null
 */
const useProduct = (productId) => {
    const [product, setProduct] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchProduct = async () => {
            try {
                const response = await fetch(`https://fakestoreapi.com/products/${productId}`);

                // fetch() only rejects on network failure — a 404 or 500 still resolves.
                // Checking response.ok catches those HTTP error statuses manually.
                if (!response.ok) {
                    throw new Error('Network response was not ok');
                }

                const data = await response.json();
                setProduct(data);
            } catch (err) {
                setError(err.message);
            } finally {
                // Always runs whether the fetch succeeded or failed,
                // ensuring the loading skeleton is never left on screen.
                setLoading(false);
            }
        };

        fetchProduct();
    }, [productId]);

    return { product, loading, error };
};

export default useProduct;
