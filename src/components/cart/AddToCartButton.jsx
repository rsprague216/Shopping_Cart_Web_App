import { useCart } from '../../hooks/useCart';

/**
 * Smart cart action button that adapts based on whether the product is in the cart.
 *
 * - When the item is NOT in the cart: renders a green "Add to Cart" button.
 * - When the item IS in the cart: renders a quantity adjuster with a
 *   decrement/remove button on the left and an increment button on the right.
 *
 * The left button switches to a trash icon (and turns red on hover) when
 * quantity is 1, removing the item entirely rather than setting quantity to 0.
 *
 * Reads cart state directly from CartContext so the parent component
 * (ProductCard or ProductDetails) stays free of cart concerns.
 *
 * @param {number} id    - Product identifier, forwarded to cart actions
 * @param {string} title - Product name, forwarded to addItem
 * @param {number} price - Unit price in USD, forwarded to addItem
 * @param {string} image - Product image URL, forwarded to addItem
 */
const AddToCartButton = ({ id, title, price, image }) => {
    const { items, addItem, removeItem, updateQuantity } = useCart();

    // Derive the current quantity from cart state; 0 if not in cart.
    const cartQuantity = items.find(item => item.id === id)?.quantity || 0;

    const addButton = (
        <button
            className="px-4 py-2 bg-green-500 text-white rounded cursor-pointer hover:bg-green-600 w-full"
            onClick={() => {
                addItem({ id, title, price, image });
            }}>
            Add to Cart
        </button>
    );

    // Trash icon used in the decrement button when quantity === 1.
    const removeIcon = (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
        </svg>
    );

    const quantityButtons = (
        <div className="flex w-full">
            {/* Decrement / remove button — shows trash icon and red hover when qty is 1 */}
            <button
                className={`px-4 py-2 bg-blue-300 text-white rounded-l cursor-pointer hover:${cartQuantity > 1 ? "bg-blue-400" : "bg-red-400"}`}
                aria-label={cartQuantity > 1 ? 'Remove one item' : 'Remove from cart'}
                onClick={() => cartQuantity > 1 ? updateQuantity(id, cartQuantity - 1) : removeItem(id)}>
                {cartQuantity > 1 ? '-' : removeIcon}
            </button>
            {/* Increment button — shows current count and a + on the right */}
            <button
                className="px-4 py-2 flex-1 flex justify-between items-center bg-blue-300 text-white rounded-r cursor-pointer hover:bg-blue-400"
                aria-label="Add one item"
                onClick={() => updateQuantity(id, cartQuantity + 1)}>
                <span>{cartQuantity} added</span>
                +
            </button>
        </div>
    );

    // Render the simple add button until the item is in the cart,
    // then switch to the quantity adjuster.
    return (cartQuantity ? quantityButtons : addButton);
};

export default AddToCartButton;
