import { useEffect, useRef, useState } from 'react';
import { disableBodyScroll, enableBodyScroll } from 'body-scroll-lock';
import { useCart } from '../../hooks/useCart';
import { computeCartTotals } from '../../utils/promoCodes';
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
    const { items, isOpen, toggleCart, updateQuantity, removeItem, appliedPromo, applyPromo, removePromo } = useCart();

    const [promoInput, setPromoInput] = useState('');
    const [promoError, setPromoError] = useState('');

    // Derived totals — always computed from items and appliedPromo, never stored separately.
    const { subtotal, discount, shipping, total } = computeCartTotals(items, appliedPromo);

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

    const handleApplyPromo = () => {
        const result = applyPromo(promoInput);
        if (result.success) {
            setPromoInput('');
            setPromoError('');
        } else {
            setPromoError(result.error);
        }
    };

    const handleRemovePromo = () => {
        removePromo();
        setPromoError('');
    };

    return (
        <div className={`fixed inset-0 ${isOpen ? 'bg-black/30' : 'bg-transparent pointer-events-none'}`} onClick={toggleCart}>
            <div className={`pt-2 absolute right-0 top-18 bottom-0 w-full sm:w-96 bg-white dark:bg-slate-900 ${isOpen ? 'translate-x-0' : 'translate-x-full'} transition-transform flex flex-col`} onClick={(e) => e.stopPropagation()}>
                <div className="px-4 flex-1 flex flex-col min-h-0">
                    <h2 className="text-2xl font-bold mb-4 text-blue-900 dark:text-slate-100">Your Cart</h2>
                    <div ref={scrollableRef} className="pr-2 flex-1 overflow-y-auto min-h-0">
                        {items.length > 0 ? items.map((item) => (
                            <CartItem key={item.id} {...item} onUpdateQuantity={updateQuantity} onRemove={removeItem} onClose={toggleCart} />
                        )) : <p className="text-gray-400 dark:text-slate-500 p-2 text-center">Your cart is empty</p>}
                    </div>
                </div>
                <div className="pt-4 p-4 bg-blue-100 dark:bg-slate-800 border-t border-blue-300 dark:border-slate-600 space-y-3">
                    {/* Promo code section */}
                    <div>
                        {appliedPromo ? (
                            <div className="flex items-center gap-2">
                                <span className="flex-1 text-sm font-medium text-green-700 bg-green-100 border border-green-300 rounded px-3 py-1.5">
                                    {appliedPromo} applied
                                </span>
                                <button
                                    onClick={handleRemovePromo}
                                    className="text-sm text-red-600 hover:text-red-800 cursor-pointer font-medium"
                                    aria-label="Remove promo code"
                                >
                                    Remove
                                </button>
                            </div>
                        ) : (
                            <div>
                                <div className="flex gap-2">
                                    <input
                                        type="text"
                                        value={promoInput}
                                        onChange={(e) => setPromoInput(e.target.value)}
                                        onKeyDown={(e) => e.key === 'Enter' && handleApplyPromo()}
                                        placeholder="Promo code"
                                        className="flex-1 text-sm border border-blue-300 dark:border-slate-600 rounded px-3 py-1.5 bg-white dark:bg-slate-700 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-400"
                                        aria-label="Promo code"
                                    />
                                    <button
                                        onClick={handleApplyPromo}
                                        className="text-sm px-3 py-1.5 bg-blue-700 text-white rounded hover:bg-blue-800 cursor-pointer font-medium"
                                    >
                                        Apply
                                    </button>
                                </div>
                                {promoError && (
                                    <p className="mt-1 text-xs text-red-600" role="alert">{promoError}</p>
                                )}
                            </div>
                        )}
                    </div>

                    {/* Price breakdown */}
                    <div className="space-y-1 text-sm text-blue-900 dark:text-slate-100">
                        <div className="flex justify-between">
                            <span>Subtotal</span>
                            <span>${subtotal.toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between">
                            <span>Shipping</span>
                            <span>{shipping === 0 ? 'Free' : `$${shipping.toFixed(2)}`}</span>
                        </div>
                        {discount > 0 && (
                            <div className="flex justify-between text-green-700">
                                <span>Discount ({appliedPromo})</span>
                                <span>-${discount.toFixed(2)}</span>
                            </div>
                        )}
                    </div>
                    <div className="text-xl font-bold text-blue-900 dark:text-slate-100">{`Total: $${total.toFixed(2)}`}</div>

                    {/* TODO: Replace alert() with real checkout flow (e.g. navigate to /checkout or integrate payment). */}
                    <button disabled={items.length === 0} className={`w-full px-4 py-2 rounded ${items.length > 0 ? 'bg-green-500 text-white hover:bg-green-600 cursor-pointer' : 'bg-gray-300 text-gray-500 cursor-not-allowed'}`} onClick={() => alert('Going to Checkout!')}>
                        Go to Checkout
                    </button>
                </div>
            </div>
        </div>
    )
};

export default CartSideBar;
