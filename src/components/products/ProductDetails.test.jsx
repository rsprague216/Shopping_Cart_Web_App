import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import CartProvider from '../cart/CartProvider';
import ProductDetails from './ProductDetails';
import useProduct from '../../hooks/useProduct';

// Mock useParams to return a fixed product id so we can control which product
// the component requests without needing a real router route.
vi.mock('react-router-dom', async (importOriginal) => {
  const actual = await importOriginal();
  return { ...actual, useParams: () => ({ id: '42' }) };
});

// Mock the useProduct hook to isolate ProductDetails from network behavior —
// hook behavior is already covered in useProduct.test.js.
vi.mock('../../hooks/useProduct');

const mockProduct = {
  id: 42,
  title: 'Mens Casual Slim Fit',
  price: 15.99,
  description: 'Great quality casual shirt for everyday wear.',
  category: "men's clothing",
  image: 'shirt.jpg',
  rating: { rate: 4.1, count: 259 },
};

const renderDetails = () =>
  render(
    <MemoryRouter>
      <CartProvider>
        <ProductDetails />
      </CartProvider>
    </MemoryRouter>
  );

describe('ProductDetails', () => {
  it('shows the skeleton placeholder while the product is loading', () => {
    useProduct.mockReturnValue({ product: null, loading: true, error: null });
    const { container } = renderDetails();

    // Skeleton uses animate-pulse; real content does not
    expect(container.querySelector('.animate-pulse')).toBeInTheDocument();
    expect(screen.queryByText(mockProduct.title)).not.toBeInTheDocument();
  });

  it('shows an error message when the fetch fails', () => {
    useProduct.mockReturnValue({ product: null, loading: false, error: 'Not found' });
    renderDetails();

    expect(screen.getByText(/Not found/)).toBeInTheDocument();
  });

  it('renders the product title after loading', () => {
    useProduct.mockReturnValue({ product: mockProduct, loading: false, error: null });
    renderDetails();

    expect(screen.getByRole('heading', { name: mockProduct.title })).toBeInTheDocument();
  });

  it('renders the category badge', () => {
    useProduct.mockReturnValue({ product: mockProduct, loading: false, error: null });
    renderDetails();

    expect(screen.getByText("men's clothing")).toBeInTheDocument();
  });

  it('renders the formatted price', () => {
    useProduct.mockReturnValue({ product: mockProduct, loading: false, error: null });
    renderDetails();

    expect(screen.getByText('$15.99')).toBeInTheDocument();
  });

  it('renders the product description', () => {
    useProduct.mockReturnValue({ product: mockProduct, loading: false, error: null });
    renderDetails();

    expect(screen.getByText(mockProduct.description)).toBeInTheDocument();
  });

  it('renders an Add to Cart button', () => {
    useProduct.mockReturnValue({ product: mockProduct, loading: false, error: null });
    renderDetails();

    expect(screen.getByRole('button', { name: /add to cart/i })).toBeInTheDocument();
  });

  it('passes the product id from useParams to the useProduct hook', () => {
    useProduct.mockReturnValue({ product: mockProduct, loading: false, error: null });
    renderDetails();

    expect(useProduct).toHaveBeenCalledWith('42');
  });
});
