import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import CartProvider from './CartProvider';
import AddToCartButton from './AddToCartButton';

const defaultProps = { id: 1, title: 'Shirt', price: 20, image: 'img.jpg' };

const renderButton = (props = defaultProps, { initialItems = [] } = {}) => {
  if (initialItems.length) {
    localStorage.setItem('cartItems', JSON.stringify(initialItems));
  }
  return render(
    <CartProvider>
      <AddToCartButton {...props} />
    </CartProvider>
  );
};

// ─── Item NOT in cart ──────────────────────────────────────────────────────────
describe('when item is NOT in the cart', () => {
  it('renders an "Add to Cart" button', () => {
    renderButton();
    expect(screen.getByRole('button', { name: /add to cart/i })).toBeInTheDocument();
  });

  it('switches to the quantity adjuster after clicking "Add to Cart"', async () => {
    const user = userEvent.setup();
    renderButton();

    await user.click(screen.getByRole('button', { name: /add to cart/i }));

    // After adding, the "Add to Cart" button should be replaced by quantity controls
    expect(screen.queryByRole('button', { name: /add to cart/i })).not.toBeInTheDocument();
    expect(screen.getByText('1 added')).toBeInTheDocument();
  });

  it('shows "Add to Cart" for a product that is not in the cart, even when another product is', () => {
    const otherProduct = { id: 2, title: 'Pants', price: 40, image: 'pants.jpg' };
    renderButton(otherProduct, {
      initialItems: [{ id: 1, title: 'Shirt', price: 20, image: 'img.jpg', quantity: 3 }],
    });
    expect(screen.getByRole('button', { name: /add to cart/i })).toBeInTheDocument();
  });
});

// ─── Item in cart, qty > 1 ─────────────────────────────────────────────────────
describe('when item IS in the cart (quantity > 1)', () => {
  const withQty3 = {
    initialItems: [{ id: 1, title: 'Shirt', price: 20, image: 'img.jpg', quantity: 3 }],
  };

  it('renders the quantity and quantity adjuster instead of the Add to Cart button', () => {
    renderButton(defaultProps, withQty3);
    expect(screen.queryByRole('button', { name: /add to cart/i })).not.toBeInTheDocument();
    expect(screen.getByText('3 added')).toBeInTheDocument();
  });

  it('shows a "-" text (not a trash SVG) on the decrement button when qty > 1', () => {
    renderButton(defaultProps, withQty3);
    const decrementBtn = screen.getByRole('button', { name: /remove one item/i });
    expect(decrementBtn).toBeInTheDocument();
    // No SVG (trash icon) inside the button when qty > 1
    expect(decrementBtn.querySelector('svg')).toBeNull();
  });

  it('increments quantity when the + button is clicked', async () => {
    const user = userEvent.setup();
    renderButton(defaultProps, withQty3);

    const incrementBtn = screen.getByRole('button', { name: /add one item/i });
    await user.click(incrementBtn);

    expect(screen.getByText('4 added')).toBeInTheDocument();
  });

  it('decrements quantity when the - button is clicked and qty > 1', async () => {
    const user = userEvent.setup();
    renderButton(defaultProps, withQty3);

    await user.click(screen.getByRole('button', { name: /remove one item/i }));

    expect(screen.getByText('2 added')).toBeInTheDocument();
  });
});

// ─── Item in cart, qty === 1 ───────────────────────────────────────────────────
describe('when item IS in the cart (quantity === 1)', () => {
  const withQty1 = {
    initialItems: [{ id: 1, title: 'Shirt', price: 20, image: 'img.jpg', quantity: 1 }],
  };

  it('shows a trash SVG icon on the left button when qty is 1', () => {
    renderButton(defaultProps, withQty1);
    // When qty === 1 the left button contains an SVG and no "-" text
    const leftButton = screen.getByRole('button', { name: /remove from cart/i });
    expect(leftButton.querySelector('svg')).not.toBeNull();
  });

  it('removes the item when the left button is clicked at qty=1', async () => {
    const user = userEvent.setup();
    renderButton(defaultProps, withQty1);

    const leftButton = screen.getByRole('button', { name: /remove from cart/i });
    await user.click(leftButton);

    // After removal, the "Add to Cart" button should reappear
    expect(await screen.findByRole('button', { name: /add to cart/i })).toBeInTheDocument();
  });
});
