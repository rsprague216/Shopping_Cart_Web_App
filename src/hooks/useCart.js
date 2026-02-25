import { createContext, useContext } from 'react';

// Exported so CartProvider can reference it directly without a circular dependency.
const CartContext = createContext();

/**
 * Hook for consuming cart state and actions anywhere in the component tree.
 * Must be used inside a CartProvider.
 *
 * @returns {{ items: Array, isOpen: boolean, addItem: Function, removeItem: Function, updateQuantity: Function, toggleCart: Function }}
 */
const useCart = () => {
    return useContext(CartContext);
};

export { CartContext, useCart };