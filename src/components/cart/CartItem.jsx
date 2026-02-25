import { useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import CartRemove from "./CartRemove";

/**
 * Displays a single item row inside the cart drawer.
 *
 * Receives all data and callbacks via props. Maintains its own local input
 * state so the user can type freely in the quantity field without triggering
 * a cart update on every keystroke — the cart is only updated on blur or Enter.
 *
 * When the user clicks the remove (trash) button, a CartRemove confirmation
 * modal is shown before any action is taken. The modal is dismissed on either
 * Cancel or confirmed removal.
 *
 * Clicking the card itself closes the drawer and navigates to the product
 * detail page. All interactive controls call stopPropagation to prevent
 * their clicks from bubbling up to the card click handler.
 *
 * @param {number}   id               - Cart item identifier
 * @param {string}   title            - Product name
 * @param {number}   price            - Unit price in USD
 * @param {string}   image            - Product image URL
 * @param {number}   quantity         - Current quantity from cart state
 * @param {Function} onUpdateQuantity - Called with (id, newQuantity) to update cart
 * @param {Function} onRemove         - Called with (id) to remove item from cart
 * @param {Function} onClose          - Called to close the cart drawer before navigating
 */
const CartItem = ({ id, title, price, image, quantity, onUpdateQuantity, onRemove, onClose }) => {
    const navigate = useNavigate();

    // Local controlled input value, kept separate from cart state so the user
    // can type without triggering a cart update on every keystroke.
    const [ inputValue, setInputValue ] = useState(quantity);
    // Controls visibility of the CartRemove confirmation modal.
    const [ showConfirm , setShowConfirm ] = useState(false);

    const handleBlur = () => {
        const newQuantity = parseInt(inputValue, 10);
        if (!isNaN(newQuantity) && newQuantity > 0) {
            onUpdateQuantity(id, newQuantity);
            // Sync local input with the value the reducer actually stored —
            // it clamps to a max of 999, so this reflects that cap.
            setInputValue(Math.min(newQuantity, 999));
        } else {
            // Revert to the last valid quantity if the input is empty or invalid.
            setInputValue(quantity);
        }
    };

    // Keep local input in sync when quantity changes externally
    // (e.g. via the +/- buttons, which update cart state directly).
    useEffect(() => {
        setInputValue(quantity);
    }, [quantity]);

    const handleCardClick = () => {
        onClose();
        navigate(`/products/${id}`);
    };

    return (
        <div onClick={handleCardClick} className="flex items-center gap-4 p-2 my-2 bg-blue-100 rounded cursor-pointer">
            <div className="w-24 h-24 rounded bg-blue-300 p-1">
                <img src={image} alt={title} className="object-contain h-full w-full rounded" />
            </div>
            <div className="flex-1 min-w-0">
                <h3 className="text-lg font-bold text-blue-900 truncate" id={`title-${id}`}>{title}</h3>
                <p className="text-sm font-bold pb-2">{`$${price.toFixed(2)}`}</p>
                <div className="flex">
                    <div className="flex items-center">
                        {/* Decrement button — triggers remove confirmation when qty is already 1 */}
                        <button
                            className="px-2 py-1 bg-blue-300 text-white border border-blue-300 rounded-l cursor-pointer hover:bg-blue-400"
                            aria-label="Decrease quantity"
                            onClick={(e) => { e.stopPropagation(); quantity === 1 ? setShowConfirm(true) : onUpdateQuantity(id, quantity - 1); }}
                        >
                            -
                        </button>
                        <input
                            type="number"
                            id={`quantity-${id}`}
                            value={inputValue}
                            max="999"
                            onClick={(e) => e.stopPropagation()}
                            onFocus={(e) => e.target.select()}
                            onChange={(e) => setInputValue(e.target.value)}
                            onBlur={handleBlur}
                            onKeyDown={(e) => { e.stopPropagation(); e.key === 'Enter' && handleBlur(); }}
                            className="w-10 py-1 text-center border-t border-b border-blue-300"
                            aria-labelledby={`title-${id}`}
                        />
                        {/* Increment button */}
                        <button
                            className="px-2 py-1 bg-blue-300 text-white border border-blue-300 rounded-r cursor-pointer hover:bg-blue-400"
                            aria-label="Increase quantity"
                            onClick={(e) => { e.stopPropagation(); onUpdateQuantity(id, quantity + 1); }}
                        >
                            +
                        </button>
                    </div>
                    {/* Trash button — always shows the remove confirmation modal */}
                    <button
                        className="px-2 py-1 ml-2 text-red-500 bg-blue-300 border border-blue-300 rounded cursor-pointer hover:bg-red-400 hover:text-white"
                        aria-label="Remove from cart"
                        onClick={(e) => { e.stopPropagation(); setShowConfirm(true); }}
                    >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                    </button>
                </div>
            </div>
            {/* Confirmation modal — rendered via portal so it overlays the full viewport,
                not just the sidebar. Shown only when the trash button has been clicked. */}
            {showConfirm && <CartRemove id={id} title={title} onRemove={(id) => { onRemove(id); setShowConfirm(false); }} onCancel={() => setShowConfirm(false)} />}
        </div>
    );
};

export default CartItem;
