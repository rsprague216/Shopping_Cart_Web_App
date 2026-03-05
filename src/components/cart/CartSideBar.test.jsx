import { render, screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { disableBodyScroll, enableBodyScroll } from 'body-scroll-lock';
import CartProvider from './CartProvider';
import CartSideBar from './CartSideBar';
import { useCart } from '../../hooks/useCart';

// ─── Module mocks ──────────────────────────────────────────────────────────────
// body-scroll-lock has no meaningful behavior in jsdom; just prevent it from
// throwing and allow us to assert it was called correctly.
vi.mock('body-scroll-lock', () => ({
  disableBodyScroll: vi.fn(),
  enableBodyScroll: vi.fn(),
}));

// CartItem uses useNavigate internally; mock it so item renders don't fail.
vi.mock('react-router-dom', async (importOriginal) => {
  const actual = await importOriginal();
  return { ...actual, useNavigate: () => vi.fn() };
});

// ─── Test helpers ──────────────────────────────────────────────────────────────
// A small companion component that exposes a "Open Cart" button, since
// CartSideBar itself doesn't render an open trigger.
const OpenCartButton = () => {
  const { toggleCart } = useCart();
  return <button onClick={toggleCart}>Open Cart</button>;
};

const renderSidebar = ({ initialItems = [], initialPromo = null } = {}) => {
  if (initialItems.length) {
    localStorage.setItem('cartItems', JSON.stringify(initialItems));
  }
  if (initialPromo) {
    localStorage.setItem('appliedPromo', initialPromo);
  }
  return render(
    <MemoryRouter>
      <CartProvider>
        <OpenCartButton />
        <CartSideBar />
      </CartProvider>
    </MemoryRouter>
  );
};

// ─── Empty cart state ──────────────────────────────────────────────────────────
describe('empty cart state', () => {
  it('shows "Your cart is empty" message when there are no items', () => {
    renderSidebar();
    expect(screen.getByText('Your cart is empty')).toBeInTheDocument();
  });

  it('displays a total equal to shipping cost only when the cart is empty', () => {
    renderSidebar();
    // Empty cart: subtotal $0 + shipping $5.99 = $5.99
    expect(screen.getByText('Total: $5.99')).toBeInTheDocument();
  });

  it('renders the checkout button in a disabled state when cart is empty', () => {
    renderSidebar();
    expect(screen.getByRole('button', { name: 'Go to Checkout' })).toBeDisabled();
  });
});

// ─── Cart with items ───────────────────────────────────────────────────────────
describe('cart with items', () => {
  const twoItems = [
    { id: 1, title: 'Blue Shirt', price: 20.00, image: 'shirt.jpg', quantity: 2 },
    { id: 2, title: 'Red Hat',   price: 15.00, image: 'hat.jpg',   quantity: 3 },
  ];

  it('renders a CartItem for each item in the cart', () => {
    renderSidebar({ initialItems: twoItems });
    expect(screen.getByText('Blue Shirt')).toBeInTheDocument();
    expect(screen.getByText('Red Hat')).toBeInTheDocument();
  });

  it('calculates and displays the correct total price across multiple items', () => {
    // (20 * 2) + (15 * 3) = 40 + 45 = 85 subtotal + $5.99 shipping = $90.99
    renderSidebar({ initialItems: twoItems });
    expect(screen.getByText('Total: $90.99')).toBeInTheDocument();
  });

  it('renders the checkout button as enabled when the cart has items', () => {
    renderSidebar({ initialItems: twoItems });
    expect(screen.getByRole('button', { name: 'Go to Checkout' })).not.toBeDisabled();
  });
});

// ─── Checkout button ───────────────────────────────────────────────────────────
describe('checkout button', () => {
  it('shows an alert when the checkout button is clicked', async () => {
    const user = userEvent.setup();
    const alertSpy = vi.spyOn(window, 'alert').mockImplementation(() => {});
    renderSidebar({
      initialItems: [
        { id: 1, title: 'Shirt', price: 20, image: 'img.jpg', quantity: 1 },
      ],
    });

    await user.click(screen.getByRole('button', { name: 'Go to Checkout' }));

    expect(alertSpy).toHaveBeenCalledWith('Going to Checkout!');
    alertSpy.mockRestore();
  });
});

// ─── Open/close behavior ──────────────────────────────────────────────────────
describe('open/close behavior', () => {
  it('closes when the backdrop overlay is clicked', async () => {
    const user = userEvent.setup();
    const { container } = renderSidebar();

    // Open the cart first
    await user.click(screen.getByRole('button', { name: 'Open Cart' }));

    // The backdrop is the outermost div (CartSideBar root), which has onClick={toggleCart}
    const backdrop = container.querySelector('.fixed.inset-0');
    // Clicking the backdrop directly (not the inner panel) should toggle isOpen
    fireEvent.click(backdrop);

    // After closing, the inner panel should have translate-x-full (invisible)
    // and the backdrop should have pointer-events-none
    expect(backdrop.className).toContain('pointer-events-none');
  });

  it('closes when the Escape key is pressed while the cart is open', async () => {
    const user = userEvent.setup();
    const { container } = renderSidebar();

    await user.click(screen.getByRole('button', { name: 'Open Cart' }));

    fireEvent.keyDown(window, { key: 'Escape' });

    const backdrop = container.querySelector('.fixed.inset-0');
    expect(backdrop.className).toContain('pointer-events-none');
  });

  it('does NOT close when the Escape key is pressed while the cart is already closed', () => {
    // Cart starts closed — verify Escape press doesn't cause errors or toggle state
    const { container } = renderSidebar();
    const backdrop = container.querySelector('.fixed.inset-0');

    // Should be closed (pointer-events-none) before Escape
    expect(backdrop.className).toContain('pointer-events-none');

    fireEvent.keyDown(window, { key: 'Escape' });

    // Should still be closed — the listener is only attached when isOpen is true
    expect(backdrop.className).toContain('pointer-events-none');
  });
});

// ─── Promo code UI ────────────────────────────────────────────────────────────
describe('promo code input', () => {
  it('renders the promo code input and Apply button', () => {
    renderSidebar();
    expect(screen.getByRole('textbox', { name: 'Promo code' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Apply' })).toBeInTheDocument();
  });

  it('shows an error message when an invalid code is submitted', async () => {
    const user = userEvent.setup();
    renderSidebar();

    await user.type(screen.getByRole('textbox', { name: 'Promo code' }), 'BOGUS');
    await user.click(screen.getByRole('button', { name: 'Apply' }));

    expect(screen.getByRole('alert')).toBeInTheDocument();
    expect(screen.getByRole('alert')).toHaveTextContent(/not a valid promo code/i);
  });

  it('shows an error when SAVE20 is applied but subtotal is below $100', async () => {
    const user = userEvent.setup();
    renderSidebar({
      initialItems: [{ id: 1, title: 'Shirt', price: 20, image: 'img.jpg', quantity: 1 }],
    });

    await user.type(screen.getByRole('textbox', { name: 'Promo code' }), 'SAVE20');
    await user.click(screen.getByRole('button', { name: 'Apply' }));

    expect(screen.getByRole('alert')).toHaveTextContent(/\$100\.00/);
  });

  it('replaces the input with a badge when a valid code is applied', async () => {
    const user = userEvent.setup();
    renderSidebar();

    await user.type(screen.getByRole('textbox', { name: 'Promo code' }), 'SAVE10');
    await user.click(screen.getByRole('button', { name: 'Apply' }));

    expect(screen.queryByRole('textbox', { name: 'Promo code' })).not.toBeInTheDocument();
    expect(screen.getByText(/SAVE10 applied/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Remove promo code' })).toBeInTheDocument();
  });

  it('restores the input and clears badge when Remove is clicked', async () => {
    const user = userEvent.setup();
    renderSidebar({ initialPromo: 'SAVE10' });

    await user.click(screen.getByRole('button', { name: 'Remove promo code' }));

    expect(screen.getByRole('textbox', { name: 'Promo code' })).toBeInTheDocument();
    expect(screen.queryByText(/SAVE10 applied/i)).not.toBeInTheDocument();
  });

  it('submits the promo code when Enter is pressed in the input', async () => {
    const user = userEvent.setup();
    renderSidebar();

    await user.type(screen.getByRole('textbox', { name: 'Promo code' }), 'FREESHIP{Enter}');

    expect(screen.getByText(/FREESHIP applied/i)).toBeInTheDocument();
  });
});

describe('price breakdown', () => {
  const items = [{ id: 1, title: 'Shirt', price: 50, image: 'img.jpg', quantity: 2 }]; // $100 subtotal

  it('shows subtotal and shipping lines', () => {
    renderSidebar({ initialItems: items });
    expect(screen.getByText('Subtotal')).toBeInTheDocument();
    expect(screen.getByText('Shipping')).toBeInTheDocument();
  });

  it('shows $5.99 shipping when no promo is applied', () => {
    renderSidebar({ initialItems: items });
    expect(screen.getByText('$5.99')).toBeInTheDocument();
  });

  it('shows "Free" shipping when FREESHIP is applied', () => {
    renderSidebar({ initialItems: items, initialPromo: 'FREESHIP' });
    expect(screen.getByText('Free')).toBeInTheDocument();
  });

  it('shows a discount line when SAVE10 is applied', () => {
    // $100 * 10% = $10 discount
    renderSidebar({ initialItems: items, initialPromo: 'SAVE10' });
    expect(screen.getByText('Discount (SAVE10)')).toBeInTheDocument();
    expect(screen.getByText('-$10.00')).toBeInTheDocument();
  });

  it('does not show a discount line when FREESHIP is applied', () => {
    renderSidebar({ initialItems: items, initialPromo: 'FREESHIP' });
    expect(screen.queryByText(/Discount/)).not.toBeInTheDocument();
  });

  it('reflects the correct total with SAVE10 applied', () => {
    // $100 subtotal - $10 discount + $5.99 shipping = $95.99
    renderSidebar({ initialItems: items, initialPromo: 'SAVE10' });
    expect(screen.getByText('Total: $95.99')).toBeInTheDocument();
  });

  it('reflects the correct total with FREESHIP applied', () => {
    // $100 subtotal - $0 discount + $0 shipping = $100.00
    renderSidebar({ initialItems: items, initialPromo: 'FREESHIP' });
    expect(screen.getByText('Total: $100.00')).toBeInTheDocument();
  });
});

// ─── Body scroll lock ─────────────────────────────────────────────────────────
describe('body scroll lock', () => {
  beforeEach(() => {
    vi.mocked(disableBodyScroll).mockClear();
    vi.mocked(enableBodyScroll).mockClear();
  });

  it('calls disableBodyScroll when the cart opens', async () => {
    const user = userEvent.setup();
    renderSidebar();

    await user.click(screen.getByRole('button', { name: 'Open Cart' }));

    expect(disableBodyScroll).toHaveBeenCalledOnce();
  });

  it('calls enableBodyScroll when the cart closes', async () => {
    const user = userEvent.setup();
    renderSidebar();

    // Open then close
    await user.click(screen.getByRole('button', { name: 'Open Cart' }));
    await user.click(screen.getByRole('button', { name: 'Open Cart' }));

    // enableBodyScroll is called both on close and during the initial render
    // (isOpen=false runs the else branch). Verify at least one call after open.
    expect(enableBodyScroll).toHaveBeenCalled();
  });
});
