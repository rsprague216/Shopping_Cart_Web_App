import { useState, useEffect } from 'react';

/**
 * Custom hook for fetching the product catalogue from the FakeStore API.
 *
 * Separating fetch logic into a hook keeps ProductGrid focused on rendering
 * and makes this data-fetching behaviour independently testable.
 *
 * @returns {{ products: Array, loading: boolean, error: string|null }}
 *   - products: array of product objects from the API
 *   - loading:  true while the request is in flight
 *   - error:    error message string if the request failed, otherwise null
 */
const useProducts = () => {
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);  // true by default — fetch starts immediately
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchProducts = async () => {
            try {
                const response = await fetch('https://fakestoreapi.com/products');

                // fetch() only rejects on network failure — a 404 or 500 still resolves.
                // Checking response.ok catches those HTTP error statuses manually.
                if (!response.ok) {
                    throw new Error('Network response was not ok');
                }

                const data = await response.json();
                setProducts(data);
            } catch (err) {
                setError(err.message);
            } finally {
                // Always runs whether the fetch succeeded or failed,
                // ensuring the loading spinner is never left on screen.
                setLoading(false);
            }
        };

        fetchProducts();
    }, []); // Empty dependency array — fetch runs once on mount, never again

    return { products, loading, error };
}

export default useProducts;