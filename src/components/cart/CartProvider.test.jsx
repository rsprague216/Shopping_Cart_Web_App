import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import CartProvider from './CartProvider';
import { useCart } from '../../hooks/useCart';

// ─── Test Consumer ─────────────────────────────────────────────────────────────
// A minimal component that exposes cart state and all actions as clickable
// buttons, letting tests interact with the cart purely through the UI.
const TestConsumer = () => {
  const { items, isOpen, addItem, removeItem, updateQuantity, toggleCart } = useCart();
  return (
    <div>
      <div data-testid="item-count">{items.length}</div>
      <div data-testid="is-open">{String(isOpen)}</div>
      <button onClick={() => addItem({ id: 1, title: 'Shirt', price: 20, image: 'img.jpg' })}>
        Add Item 1
      </button>
      <button onClick={() => addItem({ id: 2, title: 'Hat', price: 10, image: 'img.jpg' })}>
        Add Item 2
      </button>
      <button onClick={() => removeItem(1)}>Remove Item 1</button>
      <button onClick={() => updateQuantity(1, 5)}>Set Qty 5</button>
      <button onClick={() => updateQuantity(1, 0)}>Set Qty 0</button>
      <button onClick={() => updateQuantity(1, 1000)}>Set Qty 1000</button>
      <button onClick={toggleCart}>Toggle Cart</button>
      {items.map(item => (
        <div key={item.id} data-testid={`item-${item.id}`}>
          {item.title} x{item.quantity}
        </div>
      ))}
    </div>
  );
};

const renderWithCart = ({ initialItems = [] } = {}) => {
  if (initialItems.length) {
    localStorage.setItem('cartItems', JSON.stringify(initialItems));
  }
  return render(
    <CartProvider>
      <TestConsumer />
    </CartProvider>
  );
};

// ─── ADD_ITEM ──────────────────────────────────────────────────────────────────
describe('ADD_ITEM action', () => {
  it('adds a new item to the cart with quantity 1', async () => {
    const user = userEvent.setup();
    renderWithCart();

    await user.click(screen.getByRole('button', { name: 'Add Item 1' }));

    expect(screen.getByTestId('item-count')).toHaveTextContent('1');
    expect(screen.getByTestId('item-1')).toHaveTextContent('Shirt x1');
  });

  it('does not add a duplicate item if the same id already exists', async () => {
    const user = userEvent.setup();
    renderWithCart();

    await user.click(screen.getByRole('button', { name: 'Add Item 1' }));
    await user.click(screen.getByRole('button', { name: 'Add Item 1' }));

    expect(screen.getByTestId('item-count')).toHaveTextContent('1');
  });

  it('can add multiple distinct items', async () => {
    const user = userEvent.setup();
    renderWithCart();

    await user.click(screen.getByRole('button', { name: 'Add Item 1' }));
    await user.click(screen.getByRole('button', { name: 'Add Item 2' }));

    expect(screen.getByTestId('item-count')).toHaveTextContent('2');
    expect(screen.getByTestId('item-1')).toBeInTheDocument();
    expect(screen.getByTestId('item-2')).toBeInTheDocument();
  });
});

// ─── REMOVE_ITEM ───────────────────────────────────────────────────────────────
describe('REMOVE_ITEM action', () => {
  it('removes an item by id, leaving other items intact', async () => {
    const user = userEvent.setup();
    renderWithCart({
      initialItems: [
        { id: 1, title: 'Shirt', price: 20, image: 'img.jpg', quantity: 1 },
        { id: 2, title: 'Hat', price: 10, image: 'img.jpg', quantity: 1 },
      ],
    });

    await user.click(screen.getByRole('button', { name: 'Remove Item 1' }));

    expect(screen.getByTestId('item-count')).toHaveTextContent('1');
    expect(screen.queryByTestId('item-1')).not.toBeInTheDocument();
    expect(screen.getByTestId('item-2')).toBeInTheDocument();
  });

  it('is a no-op when the item id does not exist', async () => {
    const user = userEvent.setup();
    renderWithCart({
      initialItems: [
        { id: 2, title: 'Hat', price: 10, image: 'img.jpg', quantity: 1 },
      ],
    });

    // Remove id=1, which doesn't exist — cart should be unchanged
    await user.click(screen.getByRole('button', { name: 'Remove Item 1' }));

    expect(screen.getByTestId('item-count')).toHaveTextContent('1');
    expect(screen.getByTestId('item-2')).toBeInTheDocument();
  });
});

// ─── UPDATE_QUANTITY ───────────────────────────────────────────────────────────
describe('UPDATE_QUANTITY action', () => {
  it('updates the quantity of an existing item', async () => {
    const user = userEvent.setup();
    renderWithCart({
      initialItems: [
        { id: 1, title: 'Shirt', price: 20, image: 'img.jpg', quantity: 1 },
      ],
    });

    await user.click(screen.getByRole('button', { name: 'Set Qty 5' }));

    expect(screen.getByTestId('item-1')).toHaveTextContent('x5');
  });

  it('clamps quantity to a minimum of 1 when 0 is passed', async () => {
    const user = userEvent.setup();
    renderWithCart({
      initialItems: [
        { id: 1, title: 'Shirt', price: 20, image: 'img.jpg', quantity: 3 },
      ],
    });

    await user.click(screen.getByRole('button', { name: 'Set Qty 0' }));

    expect(screen.getByTestId('item-1')).toHaveTextContent('x1');
  });

  it('clamps quantity to a maximum of 999 when 1000 is passed', async () => {
    const user = userEvent.setup();
    renderWithCart({
      initialItems: [
        { id: 1, title: 'Shirt', price: 20, image: 'img.jpg', quantity: 1 },
      ],
    });

    await user.click(screen.getByRole('button', { name: 'Set Qty 1000' }));

    expect(screen.getByTestId('item-1')).toHaveTextContent('x999');
  });

  it('does not affect other items when updating one item', async () => {
    const user = userEvent.setup();
    renderWithCart({
      initialItems: [
        { id: 1, title: 'Shirt', price: 20, image: 'img.jpg', quantity: 1 },
        { id: 2, title: 'Hat', price: 10, image: 'img.jpg', quantity: 2 },
      ],
    });

    await user.click(screen.getByRole('button', { name: 'Set Qty 5' }));

    expect(screen.getByTestId('item-1')).toHaveTextContent('x5');
    expect(screen.getByTestId('item-2')).toHaveTextContent('x2');
  });
});

// ─── TOGGLE_CART ───────────────────────────────────────────────────────────────
describe('TOGGLE_CART action', () => {
  it('toggles isOpen from false to true', async () => {
    const user = userEvent.setup();
    renderWithCart();

    expect(screen.getByTestId('is-open')).toHaveTextContent('false');

    await user.click(screen.getByRole('button', { name: 'Toggle Cart' }));

    expect(screen.getByTestId('is-open')).toHaveTextContent('true');
  });

  it('toggles isOpen from true back to false on a second call', async () => {
    const user = userEvent.setup();
    renderWithCart();

    await user.click(screen.getByRole('button', { name: 'Toggle Cart' }));
    await user.click(screen.getByRole('button', { name: 'Toggle Cart' }));

    expect(screen.getByTestId('is-open')).toHaveTextContent('false');
  });
});

// ─── localStorage persistence ──────────────────────────────────────────────────
describe('localStorage persistence', () => {
  it('writes items to localStorage when items change', async () => {
    const user = userEvent.setup();
    // Spy on the mock object directly — Storage.prototype.setItem won't intercept
    // our custom localStorage mock since it doesn't inherit from Storage.
    const setItemSpy = vi.spyOn(localStorage, 'setItem');
    renderWithCart();

    await user.click(screen.getByRole('button', { name: 'Add Item 1' }));

    const calls = setItemSpy.mock.calls.filter(([key]) => key === 'cartItems');
    expect(calls.length).toBeGreaterThan(0);
    const lastCall = calls[calls.length - 1];
    expect(JSON.parse(lastCall[1])).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ id: 1, title: 'Shirt', quantity: 1 }),
      ])
    );
  });

  it('loads existing items from localStorage on mount', () => {
    renderWithCart({
      initialItems: [
        { id: 1, title: 'Shirt', price: 20, image: 'img.jpg', quantity: 3 },
      ],
    });

    expect(screen.getByTestId('item-count')).toHaveTextContent('1');
    expect(screen.getByTestId('item-1')).toHaveTextContent('Shirt x3');
  });

  it('starts with an empty cart when localStorage contains invalid JSON', () => {
    localStorage.setItem('cartItems', 'INVALID_JSON');

    render(
      <CartProvider>
        <TestConsumer />
      </CartProvider>
    );

    expect(screen.getByTestId('item-count')).toHaveTextContent('0');
  });
});
