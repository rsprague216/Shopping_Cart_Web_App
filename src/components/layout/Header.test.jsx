import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import CartProvider from '../cart/CartProvider';
import { useCart } from '../../hooks/useCart';
import Header from './Header';

const renderHeader = ({ initialItems = [] } = {}) => {
  if (initialItems.length) {
    localStorage.setItem('cartItems', JSON.stringify(initialItems));
  }
  return render(
    <MemoryRouter>
      <CartProvider>
        <Header />
      </CartProvider>
    </MemoryRouter>
  );
};

describe('Header', () => {
  it('renders the ShopBuddy branding', () => {
    renderHeader();
    expect(screen.getByText('ShopBuddy')).toBeInTheDocument();
  });

  it('renders a cart button', () => {
    renderHeader();
    expect(screen.getByRole('button', { name: 'Toggle cart' })).toBeInTheDocument();
  });

  it('does not show a count badge when the cart is empty', () => {
    renderHeader();
    // Badge should not be present when itemCount is 0
    expect(screen.queryByText(/^\d+$/)).not.toBeInTheDocument();
  });

  it('shows the badge with the correct total quantity when items exist', () => {
    renderHeader({
      initialItems: [
        { id: 1, title: 'Shirt', price: 20, image: 'img.jpg', quantity: 3 },
        { id: 2, title: 'Hat', price: 10, image: 'img.jpg', quantity: 2 },
      ],
    });
    // Total quantity: 3 + 2 = 5
    expect(screen.getByText('5')).toBeInTheDocument();
  });

  it('shows a badge of 1 for a single item with quantity 1', () => {
    renderHeader({
      initialItems: [
        { id: 1, title: 'Shirt', price: 20, image: 'img.jpg', quantity: 1 },
      ],
    });
    expect(screen.getByText('1')).toBeInTheDocument();
  });

  it('hides the badge when the last item is removed from the cart', async () => {
    const user = userEvent.setup();
    localStorage.setItem('cartItems', JSON.stringify([
      { id: 1, title: 'Shirt', price: 20, image: 'img.jpg', quantity: 1 },
    ]));

    // Companion component to trigger a cart removal from within the same CartProvider
    const RemoveButton = () => {
      const { removeItem } = useCart();
      return <button onClick={() => removeItem(1)}>Remove item</button>;
    };

    render(
      <MemoryRouter>
        <CartProvider>
          <Header />
          <RemoveButton />
        </CartProvider>
      </MemoryRouter>
    );

    expect(screen.getByText('1')).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: 'Remove item' }));
    expect(screen.queryByText(/^\d+$/)).not.toBeInTheDocument();
  });
});
