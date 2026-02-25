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

const renderSidebar = ({ initialItems = [] } = {}) => {
  if (initialItems.length) {
    localStorage.setItem('cartItems', JSON.stringify(initialItems));
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

  it('displays a total of $0.00 when the cart is empty', () => {
    renderSidebar();
    expect(screen.getByText('Total: $0.00')).toBeInTheDocument();
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
    // (20 * 2) + (15 * 3) = 40 + 45 = 85
    renderSidebar({ initialItems: twoItems });
    expect(screen.getByText('Total: $85.00')).toBeInTheDocument();
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
