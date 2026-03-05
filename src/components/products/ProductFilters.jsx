import { Listbox, ListboxButton, ListboxOptions, ListboxOption } from "@headlessui/react";

/**
 * Controlled search and category filter bar for the product listing.
 *
 * Renders a text search input and a HeadlessUI Listbox dropdown side-by-side.
 * Both inputs are fully controlled — the parent owns all filter state and passes
 * callbacks down. This component has no state of its own.
 *
 * Responsive dropdown behaviour:
 *   - Mobile (< sm): button shows only a filter icon; expands to show the selected
 *     label when the dropdown is open. A blue dot appears on the icon when a category
 *     is active, so the user knows a filter is applied even when the label is hidden.
 *   - sm and above: the selected category label is always visible.
 *
 * @param {Object}   props
 * @param {string[]} props.categories        - Available category values (lowercase strings from the API).
 * @param {string}   props.selectedCategory  - Currently active category, or "" for "All Categories".
 * @param {Function} props.onCategoryChange  - Called with the new category string when the user selects one.
 * @param {string}   props.searchQuery       - Current text input value.
 * @param {Function} props.onSearchChange    - Called with the new string whenever the input changes.
 */
const ProductFilters = ({ categories, selectedCategory, onCategoryChange, searchQuery, onSearchChange }) => {

    return (
        <div className="flex w-full">
            <input
                type="text"
                placeholder="Search products..."
                value={searchQuery}
                onChange={(e) => onSearchChange(e.target.value)}
                aria-label="Search products"
                className="flex-1 px-4 py-2 border border-gray-300 dark:border-slate-600 border-r-0 rounded-l-lg h-10 focus:outline-none focus:ring-2 focus:ring-blue-500 min-w-0 bg-white dark:bg-slate-800 dark:text-slate-100"
            />

            <div className="relative">
                <Listbox value={selectedCategory} onChange={onCategoryChange}>
                    {/*
                     * On mobile the button starts as a 40px icon-only square (w-10).
                     * It expands to 144px (w-36) when the dropdown is open (data-[open])
                     * or on sm+ screens. transition-[width] animates this expansion.
                     */}
                    <ListboxButton
                        className="group flex items-center justify-center px-2 border border-green-500 border-l-0 rounded-r-lg h-10 w-10 data-[open]:w-36 sm:w-36 bg-green-500 hover:bg-green-600 text-white focus:outline-none focus:ring-2 focus:ring-green-500 cursor-pointer transition-[width] duration-200 overflow-hidden"
                        aria-label="Filter by category"
                    >
                        {/* Mobile icon — hidden on sm+ and when the dropdown is open (label takes over). */}
                        <span className="relative sm:hidden group-data-[open]:hidden">
                            <svg
                                xmlns="http://www.w3.org/2000/svg"
                                fill="none"
                                viewBox="0 0 24 24"
                                strokeWidth={1.5}
                                stroke="currentColor"
                                className="w-5 h-5 shrink-0"
                            >
                                <path strokeLinecap="round" strokeLinejoin="round" d="M12 3c2.755 0 5.455.232 8.083.678.533.09.917.556.917 1.096v1.044a2.25 2.25 0 01-.659 1.591l-5.432 5.432a2.25 2.25 0 00-.659 1.591v2.927a2.25 2.25 0 01-1.244 2.013L9.75 21v-6.568a2.25 2.25 0 00-.659-1.591L3.659 7.409A2.25 2.25 0 013 5.818V4.774c0-.54.384-1.006.917-1.096A48.32 48.32 0 0112 3z" />
                            </svg>
                            {/* Blue dot badge — signals an active category filter while the label is hidden. */}
                            {selectedCategory && (
                                <span className="absolute -top-1 -right-1 w-2 h-2 bg-blue-500 border border-white rounded-full" />
                            )}
                        </span>
                        {/* Category label — always visible on sm+; on mobile, only shown while the dropdown is open. */}
                        {/* API category values are lowercase, so we capitalise the first letter for display. */}
                        <span className="hidden group-data-[open]:inline sm:inline whitespace-nowrap text-sm">
                            {selectedCategory
                                ? selectedCategory.charAt(0).toUpperCase() + selectedCategory.slice(1)
                                : 'All Categories'}
                        </span>
                    </ListboxButton>
                    <ListboxOptions className="absolute right-0 mt-1 w-36 bg-white dark:bg-slate-800 border border-gray-300 dark:border-slate-600 rounded-md shadow-lg z-10">
                        {/* Empty string value represents "no filter" — all products shown. */}
                        <ListboxOption value="" className="cursor-pointer px-4 py-2 data-[focus]:bg-gray-100 dark:text-slate-100 dark:data-[focus]:bg-slate-700">
                            All Categories
                        </ListboxOption>
                        {categories.map((category) => (
                            <ListboxOption
                                key={category}
                                value={category}
                                className="cursor-pointer px-4 py-2 data-[focus]:bg-gray-100 dark:text-slate-100 dark:data-[focus]:bg-slate-700"
                            >
                                {/* Capitalise first letter — API values are lowercase (e.g. "electronics"). */}
                                {category.charAt(0).toUpperCase() + category.slice(1)}
                            </ListboxOption>
                        ))}
                    </ListboxOptions>
                </Listbox>
            </div>
        </div>
    );
};

export default ProductFilters;
