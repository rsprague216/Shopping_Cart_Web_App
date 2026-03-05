import { createPortal } from "react-dom";

/**
 * Full-screen confirmation modal for removing a cart item.
 *
 * Rendered via React portal directly into document.body so that the
 * fixed-position overlay covers the entire viewport — not just the cart
 * sidebar (which uses CSS transforms that would otherwise confine fixed
 * descendants to its own containing block).
 *
 * @param {number}   id       - ID of the item to remove, forwarded to onRemove
 * @param {string}   title    - Product name displayed in the confirmation message
 * @param {Function} onRemove - Called with (id) when the user confirms removal
 * @param {Function} onCancel - Called when the user dismisses the modal without removing
 */
const CartRemove = ({ id, title, onRemove, onCancel }) => {
    return createPortal(
        <div className="fixed inset-0 bg-black/30" onClick={(e) => e.stopPropagation()}>
            <div className="absolute inset-0 flex items-center justify-center">
                <div className="bg-white dark:bg-slate-800 p-10 rounded shadow">
                    <p className="mb-4 text-lg text-blue-900 dark:text-slate-100">Remove {title} from cart?</p>
                    <div className="flex justify-center gap-4">
                        <button className="px-4 py-2 bg-blue-300 dark:bg-slate-700 rounded hover:bg-blue-400 dark:hover:bg-slate-600 cursor-pointer dark:text-slate-100" onClick={onCancel}>Cancel</button>
                        <button className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600 cursor-pointer" onClick={() => onRemove(id)}>Remove</button>
                    </div>
                </div>
            </div>
        </div>,
        document.body
    );
};

export default CartRemove;