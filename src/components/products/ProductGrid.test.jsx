import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import CartProvider from '../cart/CartProvider';
import ProductGrid from './ProductGrid';
import useProducts from '../../hooks/useProducts';

// Mock the useProducts hook so ProductGrid tests are isolated from network
// behavior — that's already covered by useProducts.test.js.
vi.mock('../../hooks/useProducts');

const renderGrid = () =>
  render(
    <MemoryRouter>
      <CartProvider>
        <ProductGrid />
      </CartProvider>
    </MemoryRouter>
  );

describe('ProductGrid', () => {
  it('shows skeleton placeholders while products are loading', () => {
    useProducts.mockReturnValue({ products: [], loading: true, error: null });
    const { container } = renderGrid();

    // Skeletons have the animate-pulse class; product cards do not.
    expect(container.querySelectorAll('.animate-pulse').length).toBeGreaterThan(0);
    // No actual product title should be visible yet
    expect(screen.queryByRole('link')).not.toBeInTheDocument();
  });

  it('renders a card for each product after loading completes', () => {
    useProducts.mockReturnValue({
      loading: false,
      error: null,
      products: [
        { id: 1, title: 'Backpack',      price: 109.95, image: 'bp.jpg',    category: "men's clothing" },
        { id: 2, title: 'T-Shirt',       price: 22.30,  image: 'ts.jpg',    category: "women's clothing" },
        { id: 3, title: 'Running Shoes', price: 89.99,  image: 'shoes.jpg', category: 'electronics' },
      ],
    });
    renderGrid();

    expect(screen.getByText('Backpack')).toBeInTheDocument();
    expect(screen.getByText('T-Shirt')).toBeInTheDocument();
    expect(screen.getByText('Running Shoes')).toBeInTheDocument();
  });

  it('shows an error message when the fetch fails', () => {
    useProducts.mockReturnValue({
      loading: false,
      error: 'Network response was not ok',
      products: [],
    });
    renderGrid();

    expect(screen.getByText('Error loading products')).toBeInTheDocument();
  });
});
