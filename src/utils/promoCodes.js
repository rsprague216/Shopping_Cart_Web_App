export const SHIPPING_COST = 5.99;

export const PROMO_CODES = {
    SAVE10: { type: 'percent', value: 10, minSubtotal: 0 },
    SAVE20: { type: 'percent', value: 20, minSubtotal: 100 },
    FREESHIP: { type: 'freeship' },
};

/**
 * Validates a promo code against the current cart subtotal.
 *
 * @param {string} code - Raw user input (normalized to uppercase internally)
 * @param {number} subtotal - Current cart subtotal before discounts
 * @returns {{ valid: boolean, code?: string, error?: string }}
 */
export function validatePromoCode(code, subtotal) {
    const normalized = code.trim().toUpperCase();
    if (!normalized) return { valid: false, error: 'Please enter a promo code.' };

    const promo = PROMO_CODES[normalized];
    if (!promo) return { valid: false, error: `"${normalized}" is not a valid promo code.` };

    if (promo.minSubtotal && subtotal < promo.minSubtotal) {
        return { valid: false, error: `SAVE20 requires a subtotal of at least $${promo.minSubtotal.toFixed(2)}.` };
    }

    return { valid: true, code: normalized };
}

/**
 * Computes cart totals given the current items and an applied promo code.
 *
 * @param {Array<{ price: number, quantity: number }>} items
 * @param {string|null} appliedPromo - One of the PROMO_CODES keys, or null
 * @returns {{ subtotal: number, discount: number, shipping: number, total: number }}
 */
export function computeCartTotals(items, appliedPromo) {
    const subtotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
    let discount = 0;
    let shipping = SHIPPING_COST;

    if (appliedPromo === 'SAVE10') discount = subtotal * 0.1;
    if (appliedPromo === 'SAVE20') discount = subtotal * 0.2;
    if (appliedPromo === 'FREESHIP') shipping = 0;

    const total = subtotal - discount + shipping;
    return { subtotal, discount, shipping, total };
}
