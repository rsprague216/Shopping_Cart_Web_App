import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import CartRemove from './CartRemove';

const renderModal = (overrides = {}) => {
  const props = {
    id: 1,
    title: 'Blue Shirt',
    onRemove: vi.fn(),
    onCancel: vi.fn(),
    ...overrides,
  };
  return { ...render(<CartRemove {...props} />), props };
};

describe('CartRemove', () => {
  it('renders the product title in the confirmation message', () => {
    renderModal({ title: 'Blue Shirt' });
    expect(screen.getByText('Remove Blue Shirt from cart?')).toBeInTheDocument();
  });

  it('calls onRemove with the item id when the Remove button is clicked', async () => {
    const user = userEvent.setup();
    const { props } = renderModal({ id: 42 });

    await user.click(screen.getByRole('button', { name: 'Remove' }));

    expect(props.onRemove).toHaveBeenCalledOnce();
    expect(props.onRemove).toHaveBeenCalledWith(42);
  });

  it('calls onCancel when the Cancel button is clicked', async () => {
    const user = userEvent.setup();
    const { props } = renderModal();

    await user.click(screen.getByRole('button', { name: 'Cancel' }));

    expect(props.onCancel).toHaveBeenCalledOnce();
  });

  it('does NOT call onRemove when the Cancel button is clicked', async () => {
    const user = userEvent.setup();
    const { props } = renderModal();

    await user.click(screen.getByRole('button', { name: 'Cancel' }));

    expect(props.onRemove).not.toHaveBeenCalled();
  });
});
