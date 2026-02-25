import { render, screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import ProductFilters from './ProductFilters';

// HeadlessUI's Listbox uses ResizeObserver internally when managing the dropdown.
// jsdom doesn't implement it, so we stub it with a class to satisfy `new ResizeObserver(...)`.
global.ResizeObserver = class ResizeObserver {
  observe()    {}
  unobserve()  {}
  disconnect() {}
};

const CATEGORIES = ['electronics', 'jewelery', "men's clothing", "women's clothing"];

const defaultProps = {
  categories: CATEGORIES,
  selectedCategory: '',
  onCategoryChange: vi.fn(),
  searchQuery: '',
  onSearchChange: vi.fn(),
};

// Fresh vi.fn() instances per render so tests don't share call counts.
const renderFilters = (overrides = {}) => {
  const props = {
    ...defaultProps,
    ...overrides,
    onCategoryChange: overrides.onCategoryChange ?? vi.fn(),
    onSearchChange:   overrides.onSearchChange   ?? vi.fn(),
  };
  return { ...render(<ProductFilters {...props} />), props };
};

// ─── Rendering ─────────────────────────────────────────────────────────────────
describe('rendering', () => {
  it('renders the search input with the correct placeholder', () => {
    renderFilters();
    expect(screen.getByPlaceholderText('Search products...')).toBeInTheDocument();
  });

  it('renders the category filter button', () => {
    renderFilters();
    expect(screen.getByRole('button', { name: 'Filter by category' })).toBeInTheDocument();
  });

  it('shows "All Categories" when no category is selected', () => {
    renderFilters({ selectedCategory: '' });
    expect(screen.getByText('All Categories')).toBeInTheDocument();
  });

  it('capitalizes and displays the selected category name in the button', () => {
    renderFilters({ selectedCategory: 'electronics' });
    expect(screen.getByText('Electronics')).toBeInTheDocument();
  });

  it('only capitalizes the first character of a multi-word category name', () => {
    renderFilters({ selectedCategory: "men's clothing" });
    expect(screen.getByText("Men's clothing")).toBeInTheDocument();
  });
});

// ─── Search input ──────────────────────────────────────────────────────────────
describe('search input', () => {
  it('reflects the current searchQuery prop value', () => {
    renderFilters({ searchQuery: 'jacket' });
    expect(screen.getByRole('textbox', { name: 'Search products' })).toHaveValue('jacket');
  });

  it('calls onSearchChange with the new value when the user types', () => {
    const { props } = renderFilters();
    const input = screen.getByRole('textbox', { name: 'Search products' });

    fireEvent.change(input, { target: { value: 'jacket' } });

    expect(props.onSearchChange).toHaveBeenCalledWith('jacket');
    expect(props.onSearchChange).toHaveBeenCalledTimes(1);
  });

  it('calls onSearchChange with an empty string when the input is cleared', () => {
    const { props } = renderFilters({ searchQuery: 'shirt' });
    const input = screen.getByRole('textbox', { name: 'Search products' });

    fireEvent.change(input, { target: { value: '' } });

    expect(props.onSearchChange).toHaveBeenCalledWith('');
  });
});

// ─── Category dropdown ─────────────────────────────────────────────────────────
describe('category dropdown', () => {
  it('renders an option for each category after opening the dropdown', async () => {
    const user = userEvent.setup();
    renderFilters();

    await user.click(screen.getByRole('button', { name: 'Filter by category' }));

    expect(screen.getByRole('option', { name: 'Electronics' })).toBeInTheDocument();
    expect(screen.getByRole('option', { name: 'Jewelery' })).toBeInTheDocument();
    expect(screen.getByRole('option', { name: "Men's clothing" })).toBeInTheDocument();
    expect(screen.getByRole('option', { name: "Women's clothing" })).toBeInTheDocument();
  });

  it('always includes an "All Categories" option', async () => {
    const user = userEvent.setup();
    renderFilters();

    await user.click(screen.getByRole('button', { name: 'Filter by category' }));

    expect(screen.getByRole('option', { name: 'All Categories' })).toBeInTheDocument();
  });

  it('renders the correct total number of options (categories + "All Categories")', async () => {
    const user = userEvent.setup();
    renderFilters();

    await user.click(screen.getByRole('button', { name: 'Filter by category' }));

    expect(screen.getAllByRole('option')).toHaveLength(CATEGORIES.length + 1);
  });

  it('calls onCategoryChange with the raw category value when an option is selected', async () => {
    const user = userEvent.setup();
    const { props } = renderFilters();

    await user.click(screen.getByRole('button', { name: 'Filter by category' }));
    await user.click(screen.getByRole('option', { name: 'Electronics' }));

    expect(props.onCategoryChange).toHaveBeenCalledWith('electronics');
    expect(props.onCategoryChange).toHaveBeenCalledTimes(1);
  });

  it('calls onCategoryChange with an empty string when "All Categories" is selected', async () => {
    const user = userEvent.setup();
    const { props } = renderFilters({ selectedCategory: 'electronics' });

    await user.click(screen.getByRole('button', { name: 'Filter by category' }));
    await user.click(screen.getByRole('option', { name: 'All Categories' }));

    expect(props.onCategoryChange).toHaveBeenCalledWith('');
  });

  it('shows only the "All Categories" option when categories array is empty', async () => {
    const user = userEvent.setup();
    renderFilters({ categories: [] });

    await user.click(screen.getByRole('button', { name: 'Filter by category' }));

    expect(screen.getByRole('option', { name: 'All Categories' })).toBeInTheDocument();
    expect(screen.getAllByRole('option')).toHaveLength(1);
  });
});

// ─── Active filter indicator ───────────────────────────────────────────────────
describe('active filter indicator', () => {
  it('does not render the active-filter dot when no category is selected', () => {
    const { container } = renderFilters({ selectedCategory: '' });
    expect(container.querySelector('.bg-blue-500.rounded-full')).toBeNull();
  });

  it('renders the active-filter dot when a category is selected', () => {
    const { container } = renderFilters({ selectedCategory: 'electronics' });
    expect(container.querySelector('.bg-blue-500.rounded-full')).toBeInTheDocument();
  });

  it('removes the active-filter dot when the category is cleared', () => {
    const { rerender, container } = renderFilters({ selectedCategory: 'electronics' });

    rerender(
      <ProductFilters
        {...defaultProps}
        selectedCategory=""
        onCategoryChange={vi.fn()}
        onSearchChange={vi.fn()}
      />
    );

    expect(container.querySelector('.bg-blue-500.rounded-full')).toBeNull();
  });
});
