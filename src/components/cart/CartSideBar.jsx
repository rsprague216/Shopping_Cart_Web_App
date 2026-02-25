import { useEffect, useRef } from 'react';
import { disableBodyScroll, enableBodyScroll } from 'body-scroll-lock';
import { useCart } from '../../hooks/useCart';
import CartItem from './CartItem';

/**
 * Slide-in cart drawer with backdrop overlay.
 *
 * - Desktop/tablet (sm+): 384px wide, slides over the right side of the screen
 * - Mobile (< sm): fills the full screen width
 *
 * Locks body scroll while open and closes on Escape key or backdrop click.
 */
const CartSideBar = () => {
    const { items, isOpen, toggleCart, updateQuantity, removeItem } = useCart();

    // Derived — total is always computed from items rather than stored separately.
    const totalPrice = items.reduce((total, item) => total + item.price * item.quantity, 0);

    // Ref for the scrollable items list, passed to body-scroll-lock so it
    // remains scrollable while the rest of the page is locked.
    const scrollableRef = useRef();

    useEffect(() => {
        // Capture the ref value so the cleanup function always has a valid
        // reference, even if the component unmounts before cleanup runs.
        const el = scrollableRef.current;
        if (isOpen) {
            // reserveScrollBarGap prevents layout shift when the scrollbar disappears.
            disableBodyScroll(el, { reserveScrollBarGap: true });
        } else {
            enableBodyScroll(el);
        }
        return () => {
            enableBodyScroll(el);
        };
    }, [isOpen]);

    useEffect(() => {
        // Only attach the listener when the cart is open — no need to listen
        // for Escape when there's nothing to close.
        if (isOpen) {
            const handleKeyDown = (e) => {
                if (e.key === 'Escape') {
                    toggleCart();
                }
            };
            window.addEventListener('keydown', handleKeyDown);
            return () => window.removeEventListener('keydown', handleKeyDown);
        }
    }, [isOpen, toggleCart]);

    return (
        <div className={`fixed inset-0 ${isOpen ? 'bg-black/30' : 'bg-transparent pointer-events-none'}`} onClick={toggleCart}>
            <div className={`pt-2 absolute right-0 top-18 bottom-0 w-full sm:w-96 bg-white ${isOpen ? 'translate-x-0' : 'translate-x-full'} transition-transform flex flex-col`} onClick={(e) => e.stopPropagation()}>
                <div className="px-4 flex-1 flex flex-col min-h-0">
                    <h2 className="text-2xl font-bold mb-4 text-blue-900">Your Cart</h2>
                    <div ref={scrollableRef} className="pr-2 flex-1 overflow-y-auto min-h-0">
                        {items.length > 0 ? items.map((item) => (
                            <CartItem key={item.id} {...item} onUpdateQuantity={updateQuantity} onRemove={removeItem} onClose={toggleCart} />
                        )) : <p className="text-gray-400 p-2 text-center">Your cart is empty</p>}
                    </div>
                </div>
                <div className="pt-4 p-4 bg-blue-100 border-t border-blue-300">
                    <div className="text-xl font-bold text-blue-900">{`Total: $${totalPrice.toFixed(2)}`}</div>
                    {/* TODO: Replace alert() with real checkout flow (e.g. navigate to /checkout or integrate payment). */}
                    <button disabled={items.length === 0} className={`mt-2 w-full px-4 py-2 rounded ${items.length > 0 ? 'bg-green-500 text-white hover:bg-green-600 cursor-pointer' : 'bg-gray-300 text-gray-500 cursor-not-allowed'}`} onClick={() => alert('Going to Checkout!')}>
                        Go to Checkout
                    </button>
                </div>
            </div>
        </div>
    )
};

export default CartSideBar;