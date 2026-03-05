import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import CartItem from './CartItem';

const mockNavigate = vi.fn();

vi.mock('react-router-dom', async (importOriginal) => {
  const actual = await importOriginal();
  return { ...actual, useNavigate: () => mockNavigate };
});

const defaultProps = {
  id: 1,
  title: 'Blue Shirt',
  price: 29.99,
  image: 'shirt.jpg',
  quantity: 2,
  onUpdateQuantity: vi.fn(),
  onRemove: vi.fn(),
  onClose: vi.fn(),
};

const renderItem = (overrides = {}) => {
  const props = { ...defaultProps, ...overrides };
  // Reset mocks on each render so tests don't share call counts.
  props.onUpdateQuantity = overrides.onUpdateQuantity ?? vi.fn();
  props.onRemove = overrides.onRemove ?? vi.fn();
  props.onClose = overrides.onClose ?? vi.fn();
  return {
    ...render(
      <MemoryRouter>
        <CartItem {...props} />
      </MemoryRouter>
    ),
    props,
  };
};

beforeEach(() => mockNavigate.mockClear());

// ─── Quantity input ────────────────────────────────────────────────────────────
describe('quantity input', () => {
  it('displays the current quantity in the input field', () => {
    renderItem({ quantity: 3 });
    expect(screen.getByRole('spinbutton', { name: 'Blue Shirt' })).toHaveValue(3);
  });

  it('calls onUpdateQuantity with the new value on blur with a valid number', async () => {
    const user = userEvent.setup();
    const { props } = renderItem({ quantity: 2 });
    const input = screen.getByRole('spinbutton', { name: 'Blue Shirt' });

    await user.clear(input);
    await user.type(input, '7');
    await user.tab(); // triggers blur

    expect(props.onUpdateQuantity).toHaveBeenCalledWith(1, 7);
  });

  it('clamps the displayed input to 999 when a value over 999 is entered', async () => {
    const user = userEvent.setup();
    renderItem({ quantity: 2 });
    const input = screen.getByRole('spinbutton', { name: 'Blue Shirt' });

    await user.clear(input);
    await user.type(input, '1000');
    await user.tab();

    expect(input).toHaveValue(999);
  });

  it('reverts the input to the prop quantity when an invalid value is entered on blur', async () => {
    const user = userEvent.setup();
    renderItem({ quantity: 5 });
    const input = screen.getByRole('spinbutton', { name: 'Blue Shirt' });

    await user.clear(input);
    // Leave the field empty and blur — invalid input
    await user.tab();

    expect(input).toHaveValue(5);
  });

  it('commits the value when the Enter key is pressed', async () => {
    const user = userEvent.setup();
    const { props } = renderItem({ quantity: 1 });
    const input = screen.getByRole('spinbutton', { name: 'Blue Shirt' });

    await user.clear(input);
    await user.type(input, '4');
    await user.keyboard('[Enter]');

    expect(props.onUpdateQuantity).toHaveBeenCalledWith(1, 4);
  });

  it('syncs the local input value when the quantity prop changes externally', () => {
    const { rerender, props } = renderItem({ quantity: 3 });

    rerender(
      <MemoryRouter>
        <CartItem {...props} quantity={8} />
      </MemoryRouter>
    );

    expect(screen.getByRole('spinbutton', { name: 'Blue Shirt' })).toHaveValue(8);
  });
});

// ─── +/- buttons ──────────────────────────────────────────────────────────────
describe('+/- buttons', () => {
  it('calls onUpdateQuantity with qty+1 when the + button is clicked', async () => {
    const user = userEvent.setup();
    const { props } = renderItem({ quantity: 3 });

    await user.click(screen.getByRole('button', { name: 'Increase quantity' }));

    expect(props.onUpdateQuantity).toHaveBeenCalledWith(1, 4);
  });

  it('calls onUpdateQuantity with qty-1 when the - button is clicked and qty > 1', async () => {
    const user = userEvent.setup();
    const { props } = renderItem({ quantity: 3 });

    await user.click(screen.getByRole('button', { name: 'Decrease quantity' }));

    expect(props.onUpdateQuantity).toHaveBeenCalledWith(1, 2);
  });

  it('shows the CartRemove modal when the - button is clicked at qty=1', async () => {
    const user = userEvent.setup();
    renderItem({ quantity: 1 });

    await user.click(screen.getByRole('button', { name: 'Decrease quantity' }));

    expect(screen.getByText(`Remove Blue Shirt from cart?`)).toBeInTheDocument();
  });
});

// ─── CartRemove modal ──────────────────────────────────────────────────────────
describe('CartRemove confirmation modal', () => {
  it('shows the modal when the trash icon button is clicked', async () => {
    const user = userEvent.setup();
    renderItem({ quantity: 2 });

    const trashButton = screen.getByRole('button', { name: 'Remove from cart' });
    await user.click(trashButton);

    expect(screen.getByText('Remove Blue Shirt from cart?')).toBeInTheDocument();
  });

  it('calls onRemove and hides the modal when Remove is confirmed', async () => {
    const user = userEvent.setup();
    const { props } = renderItem({ quantity: 2 });

    const trashButton = screen.getByRole('button', { name: 'Remove from cart' });
    await user.click(trashButton);
    await user.click(screen.getByRole('button', { name: 'Remove' }));

    expect(props.onRemove).toHaveBeenCalledWith(1);
    expect(screen.queryByText('Remove Blue Shirt from cart?')).not.toBeInTheDocument();
  });

  it('hides the modal without calling onRemove when Cancel is clicked', async () => {
    const user = userEvent.setup();
    const { props } = renderItem({ quantity: 2 });

    const trashButton = screen.getByRole('button', { name: 'Remove from cart' });
    await user.click(trashButton);
    await user.click(screen.getByRole('button', { name: 'Cancel' }));

    expect(props.onRemove).not.toHaveBeenCalled();
    expect(screen.queryByText('Remove Blue Shirt from cart?')).not.toBeInTheDocument();
  });
});

// ─── Card click navigation ─────────────────────────────────────────────────────
describe('card click navigation', () => {
  it('calls onClose and navigates to /products/:id when the card title is clicked', async () => {
    const user = userEvent.setup();
    const { props } = renderItem();

    // Click on the product title which is inside the card div (bubbles up)
    await user.click(screen.getByRole('heading', { name: 'Blue Shirt' }));

    expect(props.onClose).toHaveBeenCalledOnce();
    expect(mockNavigate).toHaveBeenCalledWith('/products/1');
  });

  it('does NOT navigate when the + button is clicked (stopPropagation)', async () => {
    const user = userEvent.setup();
    renderItem();

    await user.click(screen.getByRole('button', { name: 'Increase quantity' }));

    expect(mockNavigate).not.toHaveBeenCalled();
  });

  it('does NOT navigate when the - button is clicked (stopPropagation)', async () => {
    const user = userEvent.setup();
    renderItem({ quantity: 3 });

    await user.click(screen.getByRole('button', { name: 'Decrease quantity' }));

    expect(mockNavigate).not.toHaveBeenCalled();
  });

  it('does NOT navigate when the quantity input is clicked (stopPropagation)', async () => {
    const user = userEvent.setup();
    renderItem();

    await user.click(screen.getByRole('spinbutton', { name: 'Blue Shirt' }));

    expect(mockNavigate).not.toHaveBeenCalled();
  });
});
