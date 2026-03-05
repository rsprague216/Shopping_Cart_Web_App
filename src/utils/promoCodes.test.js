import { describe, it, expect } from 'vitest';
import { validatePromoCode, computeCartTotals, SHIPPING_COST } from './promoCodes';

describe('validatePromoCode', () => {
    it('accepts SAVE10', () => {
        expect(validatePromoCode('SAVE10', 50)).toEqual({ valid: true, code: 'SAVE10' });
    });

    it('accepts SAVE20 when subtotal is exactly $100', () => {
        expect(validatePromoCode('SAVE20', 100)).toEqual({ valid: true, code: 'SAVE20' });
    });

    it('accepts SAVE20 when subtotal is above $100', () => {
        expect(validatePromoCode('SAVE20', 150)).toEqual({ valid: true, code: 'SAVE20' });
    });

    it('rejects SAVE20 when subtotal is below $100', () => {
        const result = validatePromoCode('SAVE20', 99.99);
        expect(result.valid).toBe(false);
        expect(result.error).toMatch(/\$100\.00/);
    });

    it('accepts FREESHIP', () => {
        expect(validatePromoCode('FREESHIP', 0)).toEqual({ valid: true, code: 'FREESHIP' });
    });

    it('rejects unknown code', () => {
        const result = validatePromoCode('DISCOUNT50', 50);
        expect(result.valid).toBe(false);
        expect(result.error).toMatch(/not a valid promo code/i);
    });

    it('rejects empty string', () => {
        const result = validatePromoCode('', 50);
        expect(result.valid).toBe(false);
        expect(result.error).toMatch(/enter a promo code/i);
    });

    it('rejects whitespace-only input', () => {
        const result = validatePromoCode('   ', 50);
        expect(result.valid).toBe(false);
        expect(result.error).toMatch(/enter a promo code/i);
    });

    it('normalizes lowercase input (save10 → SAVE10)', () => {
        expect(validatePromoCode('save10', 50)).toEqual({ valid: true, code: 'SAVE10' });
    });

    it('normalizes mixed-case input (FreeShip → FREESHIP)', () => {
        expect(validatePromoCode('FreeShip', 0)).toEqual({ valid: true, code: 'FREESHIP' });
    });
});

describe('computeCartTotals', () => {
    const items = [
        { price: 50, quantity: 2 }, // subtotal = $100
    ];

    it('returns base shipping and no discount when no promo applied', () => {
        const { subtotal, discount, shipping, total } = computeCartTotals(items, null);
        expect(subtotal).toBeCloseTo(100);
        expect(discount).toBe(0);
        expect(shipping).toBe(SHIPPING_COST);
        expect(total).toBeCloseTo(100 + SHIPPING_COST);
    });

    it('applies 10% discount for SAVE10', () => {
        const { subtotal, discount, shipping, total } = computeCartTotals(items, 'SAVE10');
        expect(subtotal).toBeCloseTo(100);
        expect(discount).toBeCloseTo(10);
        expect(shipping).toBe(SHIPPING_COST);
        expect(total).toBeCloseTo(90 + SHIPPING_COST);
    });

    it('applies 20% discount for SAVE20', () => {
        const { subtotal, discount, shipping, total } = computeCartTotals(items, 'SAVE20');
        expect(subtotal).toBeCloseTo(100);
        expect(discount).toBeCloseTo(20);
        expect(shipping).toBe(SHIPPING_COST);
        expect(total).toBeCloseTo(80 + SHIPPING_COST);
    });

    it('sets shipping to 0 for FREESHIP', () => {
        const { subtotal, discount, shipping, total } = computeCartTotals(items, 'FREESHIP');
        expect(subtotal).toBeCloseTo(100);
        expect(discount).toBe(0);
        expect(shipping).toBe(0);
        expect(total).toBeCloseTo(100);
    });

    it('returns zero subtotal and only shipping cost for empty cart', () => {
        const { subtotal, discount, shipping, total } = computeCartTotals([], null);
        expect(subtotal).toBe(0);
        expect(discount).toBe(0);
        expect(shipping).toBe(SHIPPING_COST);
        expect(total).toBeCloseTo(SHIPPING_COST);
    });
});
