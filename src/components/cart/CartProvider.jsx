import { CartContext } from '../../hooks/useCart';
import { useReducer, useEffect } from 'react';
import { validatePromoCode } from '../../utils/promoCodes';

const initialCartState = {
    items: [],          // Array of { id, title, price, image, quantity }
    isOpen: false,
    appliedPromo: null  // 'SAVE10' | 'SAVE20' | 'FREESHIP' | null
};

/** Computes the subtotal for a given items array. */
const getSubtotal = (items) => items.reduce((sum, item) => sum + item.price * item.quantity, 0);

/**
 * Pure reducer function for all cart state transitions.
 * Never mutates state — always returns a new object.
 *
 * @param {Object} state  - Current cart state
 * @param {{ type: string, payload: any }} action
 * @returns {Object} Next cart state
 */
const cartReducer = (state, action) => {
    switch (action.type) {
        case 'ADD_ITEM': {
            // Check if item already exists in cart
            const found = state.items.find(item => item.id === action.payload.id);
            if (!found) {
                return {
                    ...state,
                    items: [...state.items, { ...action.payload, quantity: 1 }]
                };
            }
            return state; // No state change if item is already in cart; quantity should be updated via UPDATE_QUANTITY action.
        }
        case 'REMOVE_ITEM': {
            const newItems = state.items.filter(item => item.id !== action.payload.id);
            const appliedPromo = state.appliedPromo === 'SAVE20' && getSubtotal(newItems) < 100
                ? null
                : state.appliedPromo;
            return { ...state, items: newItems, appliedPromo };
        }
        case 'UPDATE_QUANTITY': {
            // Clamp quantity between 1 and 999; quantities below 1 are treated as 1 (no removal via quantity update).
            const newItems = state.items.map(item =>
                item.id === action.payload.id
                    ? { ...item, quantity: Math.min(Math.max(action.payload.quantity, 1), 999) }
                    : item
            );
            const appliedPromo = state.appliedPromo === 'SAVE20' && getSubtotal(newItems) < 100
                ? null
                : state.appliedPromo;
            return { ...state, items: newItems, appliedPromo };
        }
        case 'TOGGLE_CART': {
            return {
                ...state,
                isOpen: !state.isOpen
            };
        }
        case 'APPLY_PROMO': {
            return { ...state, appliedPromo: action.payload.code };
        }
        case 'REMOVE_PROMO': {
            return { ...state, appliedPromo: null };
        }
        default:
            return state;
    }
};

/**
 * Provides cart state and actions to the component tree via CartContext.
 * Exposes friendly helper functions so consumers never call dispatch directly.
 *
 * @param {{ children: React.ReactNode }} props
 */
const CartProvider = ({ children }) => {
    const [state, dispatch] = useReducer(cartReducer, initialCartState, (initial) => {
        try {
            const storedItems = localStorage.getItem('cartItems');
            const storedPromo = localStorage.getItem('appliedPromo');
            const items = storedItems ? JSON.parse(storedItems) : initial.items;

            // Re-validate SAVE20 on restore — the cart may have changed between sessions.
            let appliedPromo = storedPromo || null;
            if (appliedPromo === 'SAVE20' && getSubtotal(items) < 100) {
                appliedPromo = null;
            }

            return { ...initial, items, appliedPromo };
        } catch {
            // Ignore corrupt storage and start fresh.
        }
        return initial;
    });

    // Keep localStorage in sync whenever items change.
    // isOpen is intentionally excluded — the drawer always starts closed after a page load.
    useEffect(() => {
        localStorage.setItem('cartItems', JSON.stringify(state.items));
    }, [state.items]);

    useEffect(() => {
        if (state.appliedPromo) {
            localStorage.setItem('appliedPromo', state.appliedPromo);
        } else {
            localStorage.removeItem('appliedPromo');
        }
    }, [state.appliedPromo]);

    const addItem = (item) => {
        dispatch({ type: 'ADD_ITEM', payload: item });
    };

    const removeItem = (id) => {
        dispatch({ type: 'REMOVE_ITEM', payload: { id } });
    };

    const updateQuantity = (id, quantity) => {
        dispatch({ type: 'UPDATE_QUANTITY', payload: { id, quantity } });
    };

    const toggleCart = () => {
        dispatch({ type: 'TOGGLE_CART' });
    };

    /**
     * Validates and applies a promo code.
     * Returns { success: true } on success or { success: false, error: string } on failure.
     */
    const applyPromo = (code) => {
        const subtotal = getSubtotal(state.items);
        const result = validatePromoCode(code, subtotal);
        if (result.valid) {
            dispatch({ type: 'APPLY_PROMO', payload: { code: result.code } });
            return { success: true };
        }
        return { success: false, error: result.error };
    };

    const removePromo = () => {
        dispatch({ type: 'REMOVE_PROMO' });
    };

    return (
        <CartContext.Provider value={{ ...state, addItem, removeItem, updateQuantity, toggleCart, applyPromo, removePromo }}>
            {children}
        </CartContext.Provider>
    );
};

export default CartProvider;
