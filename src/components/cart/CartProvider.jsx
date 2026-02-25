import { CartContext } from '../../hooks/useCart';
import { useReducer, useEffect } from 'react';

const initialCartState = {
    items: [],   // Array of { id, title, price, image, quantity }
    isOpen: false
};

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
            return {
                ...state,
                items: state.items.filter(item => item.id !== action.payload.id)
            };
        }
        case 'UPDATE_QUANTITY': {
            // Clamp quantity between 1 and 999; quantities below 1 are treated as 1 (no removal via quantity update).
            return {
                ...state,
                items: state.items.map(item =>
                    item.id === action.payload.id
                        ? { ...item, quantity: Math.min(Math.max(action.payload.quantity, 1), 999) }
                        : item
                )
            };
        }
        case 'TOGGLE_CART': {
            return {
                ...state,
                isOpen: !state.isOpen
            };
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
            const stored = localStorage.getItem('cartItems');
            if (stored) return { ...initial, items: JSON.parse(stored) };
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

    return (
        <CartContext.Provider value={{ ...state, addItem, removeItem, updateQuantity, toggleCart }}>
            {children}
        </CartContext.Provider>
    );
};

export default CartProvider;